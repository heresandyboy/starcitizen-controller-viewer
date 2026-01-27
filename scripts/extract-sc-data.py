#!/usr/bin/env python3
"""
Extract Star Citizen default profile and localization data from Data.p4k.

Uses a minimal P4K reader (pycryptodome + zstandard) — no scdatatools dependency.

Usage:
    python extract-sc-data.py <sc_path> --version <version>
    python extract-sc-data.py "C:\\Program Files\\Roberts Space Industries\\StarCitizen\\LIVE" -v 4.0.2
"""

import argparse
import io
import os
import re
import struct
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

import zstandard as zstd
from Crypto.Cipher import AES

# --- P4K Constants ---

P4K_FILE_HEADER = b"PK\x03\x14"
DEFAULT_P4K_KEY = b"\x5E\x7A\x20\x02\x30\x2E\xEB\x1A\x3B\xB6\x17\xC3\x0F\xDE\x1E\x47"
ZIP_ZSTD = 100
CRYXMLB_MAGIC = b"CryXmlB"

EXTRACT_TARGETS = {
    "Data/Libs/Config/defaultProfile.xml": "defaultProfile.xml",
    "Data/Localization/english/global.ini": "global.ini",
}


# --- Minimal P4K Reader (based on scdatatools p4k.py, MIT license) ---


def _make_decrypter(key):
    cipher = AES.new(key, AES.MODE_CBC, b"\x00" * 16)
    return cipher.decrypt


class P4KInfo(zipfile.ZipInfo):
    """ZipInfo subclass that decodes P4K encryption flags from the extra field."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.filename = self.filename.replace("\\", "/")
        self.is_encrypted = False

    def _decodeExtra(self):
        extra = self.extra
        self.is_encrypted = len(extra) >= 168 and extra[168] > 0x00

        while len(extra) >= 4:
            tp, ln = struct.unpack("<HH", extra[:4])
            if tp == 0x0001:  # ZIP64 extended info
                if ln >= 24:
                    counts = struct.unpack("<QQQ", extra[4:28])
                elif ln == 16:
                    counts = struct.unpack("<QQ", extra[4:20])
                elif ln == 8:
                    counts = struct.unpack("<Q", extra[4:12])
                elif ln == 0:
                    counts = ()
                else:
                    break

                idx = 0
                if self.file_size in (0xFFFFFFFFFFFFFFFF, 0xFFFFFFFF):
                    self.file_size = counts[idx]
                    idx += 1
                if self.compress_size == 0xFFFFFFFF:
                    self.compress_size = counts[idx]
                    idx += 1
                if self.header_offset == 0xFFFFFFFF:
                    self.header_offset = counts[idx]
                    idx += 1
            extra = extra[ln + 4 :]


class P4KExtFile(zipfile.ZipExtFile):
    """File-like object for reading decrypted/decompressed P4K entries."""

    MIN_READ_SIZE = 65536

    def __init__(self, fileobj, mode, p4kinfo, decrypter=None, close_fileobj=False):
        self._is_encrypted = p4kinfo.is_encrypted
        self._decompressor = None
        if p4kinfo.compress_type == ZIP_ZSTD:
            dctx = zstd.ZstdDecompressor()
            self._decompressor = dctx.decompressobj()

        self._fileobj = fileobj
        self._decrypter = decrypter
        self._close_fileobj = close_fileobj
        self._compress_type = p4kinfo.compress_type
        self._compress_left = p4kinfo.compress_size
        self._left = p4kinfo.file_size
        self._eof = False
        self._readbuffer = b""
        self._offset = 0
        self.newlines = None
        self.mode = mode
        self.name = p4kinfo.filename
        self._expected_crc = None
        self._running_crc = zipfile.crc32(b"")
        self._seekable = False
        try:
            if fileobj.seekable():
                self._orig_compress_start = fileobj.tell()
                self._orig_compress_size = p4kinfo.compress_size
                self._orig_file_size = p4kinfo.file_size
                self._orig_start_crc = self._running_crc
                self._seekable = True
        except AttributeError:
            pass


class P4KFile(zipfile.ZipFile):
    """Minimal reader for Star Citizen .p4k archives."""

    def __init__(self, file, mode="r", key=DEFAULT_P4K_KEY):
        super().__init__(file, mode, compression=zipfile.ZIP_STORED)
        self.key = key

    def _RealGetContents(self):
        fp = self.fp
        try:
            endrec = zipfile._EndRecData(fp)
        except OSError:
            raise zipfile.BadZipFile("File is not a zip file")
        if not endrec:
            raise zipfile.BadZipFile("File is not a zip file")

        size_cd = endrec[zipfile._ECD_SIZE]
        offset_cd = endrec[zipfile._ECD_OFFSET]
        self._comment = endrec[zipfile._ECD_COMMENT]

        concat = endrec[zipfile._ECD_LOCATION] - size_cd - offset_cd
        if endrec[zipfile._ECD_SIGNATURE] == zipfile.stringEndArchive64:
            concat -= zipfile.sizeEndCentDir64 + zipfile.sizeEndCentDir64Locator

        self.start_dir = offset_cd + concat
        fp.seek(self.start_dir, 0)
        data = fp.read(size_cd)
        fp = io.BytesIO(data)
        total = 0

        while total < size_cd:
            centdir = fp.read(zipfile.sizeCentralDir)
            if len(centdir) != zipfile.sizeCentralDir:
                raise zipfile.BadZipFile("Truncated central directory")
            centdir = struct.unpack(zipfile.structCentralDir, centdir)
            if centdir[zipfile._CD_SIGNATURE] != zipfile.stringCentralDir:
                raise zipfile.BadZipFile("Bad magic number for central directory")

            filename = fp.read(centdir[zipfile._CD_FILENAME_LENGTH])
            flags = centdir[5]
            filename = filename.decode("utf-8") if flags & 0x800 else filename.decode("cp437")

            x = P4KInfo(filename)
            x.extra = fp.read(centdir[zipfile._CD_EXTRA_FIELD_LENGTH])
            x.comment = fp.read(centdir[zipfile._CD_COMMENT_LENGTH])
            x.header_offset = centdir[zipfile._CD_LOCAL_HEADER_OFFSET]
            (
                x.create_version, x.create_system, x.extract_version, x.reserved,
                x.flag_bits, x.compress_type, t, d, x.CRC,
                x.compress_size, x.file_size,
            ) = centdir[1:12]

            x.volume, x.internal_attr, x.external_attr = centdir[15:18]
            x._raw_time = t
            x.date_time = (
                (d >> 9) + 1980, (d >> 5) & 0xF, d & 0x1F,
                t >> 11, (t >> 5) & 0x3F, (t & 0x1F) * 2,
            )
            x._decodeExtra()
            x.header_offset = x.header_offset + concat
            self.filelist.append(x)
            self.NameToInfo[x.filename] = x

            total = (
                total + zipfile.sizeCentralDir
                + centdir[zipfile._CD_FILENAME_LENGTH]
                + centdir[zipfile._CD_EXTRA_FIELD_LENGTH]
                + centdir[zipfile._CD_COMMENT_LENGTH]
            )

    def open(self, name, mode="r", pwd=None, *, force_zip64=False):
        if mode not in {"r", "w"}:
            raise ValueError('open() requires mode "r" or "w"')
        if not self.fp:
            raise ValueError("Attempt to use ZIP archive that was already closed")

        zinfo = name if isinstance(name, P4KInfo) else self.getinfo(name)

        if mode == "w":
            return self._open_to_write(zinfo, force_zip64=force_zip64)
        if self._writing:
            raise ValueError("Can't read while writing")

        self._fileRefCnt += 1
        zef_file = zipfile._SharedFile(
            self.fp, zinfo.header_offset, self._fpclose, self._lock,
            lambda: self._writing,
        )
        try:
            fheader = zef_file.read(zipfile.sizeFileHeader)
            if len(fheader) != zipfile.sizeFileHeader:
                raise zipfile.BadZipFile("Truncated file header")
            fheader = struct.unpack(zipfile.structFileHeader, fheader)
            if fheader[zipfile._FH_SIGNATURE] not in (P4K_FILE_HEADER, zipfile.stringFileHeader):
                raise zipfile.BadZipFile("Bad magic number for file header")

            zef_file.read(fheader[zipfile._FH_FILENAME_LENGTH])
            if fheader[zipfile._FH_EXTRA_FIELD_LENGTH]:
                zef_file.read(fheader[zipfile._FH_EXTRA_FIELD_LENGTH])

            zd = None
            if self.key and zinfo.is_encrypted:
                zd = _make_decrypter(self.key)

            return P4KExtFile(zef_file, mode, zinfo, zd, True)
        except:
            zef_file.close()
            raise

    def search(self, pattern, ignore_case=True):
        flags = re.IGNORECASE if ignore_case else 0
        r = re.compile(pattern, flags)
        return [f for f in self.namelist() if r.search(f)]


# --- CryXmlB Parser ---


def parse_cryxmlb(data: bytes) -> str:
    """
    Parse CryEngine binary XML (CryXmlB) into plain XML string.

    Format:
      Header: "CryXmlB\0" + offsets to node/attribute/child/string tables
      Node table: entries with tag, content, attribute count, child count, etc.
      Attribute table: key/value string offset pairs
      String data: null-terminated strings packed together
    """
    if data[:7] != CRYXMLB_MAGIC:
        raise ValueError("Not a CryXmlB file")

    # Header: 8-byte signature, then xml_size, then 4 table offset/count pairs
    # See scdatatools/engine/cryxml/defs.py CryXMLBHeader
    offset = 12  # skip 8-byte magic + 4-byte xml_size
    (
        node_table_offset, node_count,
        attr_table_offset, attr_count,
        child_table_offset, child_count,
        string_data_offset, string_data_size,
    ) = struct.unpack_from("<IIIIIIII", data, offset)

    # Parse string data
    string_data = data[string_data_offset : string_data_offset + string_data_size]

    def get_string(off):
        if off >= len(string_data):
            return ""
        end = string_data.index(b"\x00", off)
        return string_data[off:end].decode("utf-8", errors="replace")

    # Parse attribute table (8 bytes per entry: key_offset, value_offset)
    attrs = []
    for i in range(attr_count):
        off = attr_table_offset + i * 8
        key_off, val_off = struct.unpack_from("<II", data, off)
        attrs.append((get_string(key_off), get_string(val_off)))

    # Parse child table (4 bytes per entry: child node index)
    children = []
    for i in range(child_count):
        off = child_table_offset + i * 4
        (child_idx,) = struct.unpack_from("<I", data, off)
        children.append(child_idx)

    # Parse node table (28 bytes per entry: IIHHIIII — last I is reserved padding)
    # See scdatatools/engine/cryxml/defs.py CryXMLBNode
    nodes = []
    for i in range(node_count):
        off = node_table_offset + i * 28
        (
            tag_off, content_off,
            n_attrs, n_children,
            parent_idx, first_attr_idx, first_child_idx, _reserved,
        ) = struct.unpack_from("<IIHHIIII", data, off)
        nodes.append({
            "tag": get_string(tag_off),
            "content": get_string(content_off) if content_off != 0xFFFFFFFF else None,
            "n_attrs": n_attrs,
            "n_children": n_children,
            "parent": parent_idx,
            "first_attr": first_attr_idx,
            "first_child": first_child_idx,
        })

    if not nodes:
        return '<?xml version="1.0" encoding="utf-8"?>\n<empty/>'

    # Build XML tree
    def build_element(node_idx):
        node = nodes[node_idx]
        elem = ET.Element(node["tag"])

        # Add attributes
        for j in range(node["n_attrs"]):
            attr_idx = node["first_attr"] + j
            if attr_idx < len(attrs):
                key, val = attrs[attr_idx]
                elem.set(key, val)

        # Add text content
        if node["content"]:
            elem.text = node["content"]

        # Add children
        for j in range(node["n_children"]):
            child_table_idx = node["first_child"] + j
            if child_table_idx < len(children):
                child_node_idx = children[child_table_idx]
                child_elem = build_element(child_node_idx)
                elem.append(child_elem)

        return elem

    root = build_element(0)
    ET.indent(root, space="  ")
    return '<?xml version="1.0" encoding="utf-8"?>\n' + ET.tostring(root, encoding="unicode")


# --- Extraction Logic ---


def detect_channel(sc_path: Path) -> str:
    folder = sc_path.name.upper()
    if folder in ("LIVE", "PTU", "EPTU", "TECH-PREVIEW"):
        return folder
    return "UNKNOWN"


def extract_files(p4k_path: Path, output_dir: Path) -> dict[str, bool]:
    """Extract target files from Data.p4k."""
    results = {}
    size_gb = p4k_path.stat().st_size / (1024**3)
    print(f"Opening Data.p4k ({size_gb:.1f} GB)...")
    print("Reading archive index (this may take a moment)...\n")

    p4k = P4KFile(str(p4k_path))

    try:
        for p4k_file_path, output_name in EXTRACT_TARGETS.items():
            output_file = output_dir / output_name
            print(f"  Searching for: {p4k_file_path}")

            # Try exact path match first, then search
            matches = [f for f in p4k.namelist() if f.lower() == p4k_file_path.lower()]
            if not matches:
                matches = p4k.search(re.escape(p4k_file_path))
            if not matches:
                print(f"  NOT FOUND in archive.\n")
                results[output_name] = False
                continue

            match = matches[0]
            print(f"  Found: {match}")

            raw_data = p4k.open(match).read()
            print(f"  Read {len(raw_data):,} bytes")

            # Convert CryXmlB if detected
            if raw_data[:7] == CRYXMLB_MAGIC:
                print(f"  Detected CryXmlB binary format, converting...")
                xml_str = parse_cryxmlb(raw_data)
                raw_data = xml_str.encode("utf-8")
                print(f"  Converted to {len(raw_data):,} bytes of XML")

            output_file.write_bytes(raw_data)
            print(f"  Saved: {output_file}\n")
            results[output_name] = True
    finally:
        p4k.close()

    return results


# --- CLI ---


def main():
    parser = argparse.ArgumentParser(
        description="Extract Star Citizen default profile and localization data from Data.p4k.",
        epilog=(
            "Examples:\n"
            '  %(prog)s "C:\\Program Files\\Roberts Space Industries\\StarCitizen\\LIVE" -v 4.0.2\n'
            '  %(prog)s D:\\Games\\StarCitizen\\PTU -v 4.1.0-ptu\n'
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "sc_path", type=Path,
        help='Path to SC install directory (e.g., "C:\\...\\StarCitizen\\LIVE")',
    )
    parser.add_argument(
        "--version", "-v", required=True,
        help="SC version string (e.g., 4.0.2). Used for output directory naming.",
    )
    parser.add_argument(
        "--output", "-o", type=Path, default=None,
        help="Output directory. Defaults to apps/viewer/public/configs/sc-{version}/",
    )

    args = parser.parse_args()

    sc_path = args.sc_path.resolve()
    p4k_path = sc_path / "Data.p4k"

    if not sc_path.is_dir():
        print(f"Error: Directory not found: {sc_path}", file=sys.stderr)
        sys.exit(1)
    if not p4k_path.is_file():
        print(f"Error: Data.p4k not found at: {p4k_path}", file=sys.stderr)
        sys.exit(1)

    if args.output:
        output_dir = args.output.resolve()
    else:
        project_root = Path(__file__).resolve().parent.parent
        output_dir = project_root / "apps" / "viewer" / "public" / "configs" / f"sc-{args.version}"

    output_dir.mkdir(parents=True, exist_ok=True)

    channel = detect_channel(sc_path)
    print("=" * 60)
    print("Star Citizen Data Extractor")
    print("=" * 60)
    print(f"  SC Path:    {sc_path}")
    print(f"  Channel:    {channel}")
    print(f"  Version:    {args.version}")
    print(f"  Data.p4k:   {p4k_path} ({p4k_path.stat().st_size / (1024**3):.1f} GB)")
    print(f"  Output:     {output_dir}")
    print("=" * 60 + "\n")

    try:
        results = extract_files(p4k_path, output_dir)
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        sys.exit(1)

    print("=" * 60)
    print("Results:")
    for name, success in results.items():
        print(f"  [{'OK' if success else 'FAILED'}] {name}")
    print("=" * 60)

    if all(results.values()):
        print(f"\nAll files extracted to: {output_dir}")
    else:
        failed = [n for n, s in results.items() if not s]
        print(f"\nFailed: {', '.join(failed)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
