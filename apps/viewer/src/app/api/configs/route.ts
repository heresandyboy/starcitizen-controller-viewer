import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export interface ConfigsResponse {
  xml: string[];
  rewasd: string[];
}

export async function GET() {
  const configsDir = join(process.cwd(), 'public', 'configs');

  const entries = await readdir(configsDir, { withFileTypes: true });

  const files = entries.filter((e) => e.isFile());

  const withMtime = await Promise.all(
    files.map(async (e) => {
      const s = await stat(join(configsDir, e.name));
      return { name: e.name, mtimeMs: s.mtimeMs };
    })
  );

  // Newest first
  withMtime.sort((a, b) => b.mtimeMs - a.mtimeMs);

  const xml = withMtime.filter((f) => f.name.endsWith('.xml')).map((f) => f.name);
  const rewasd = withMtime.filter((f) => f.name.endsWith('.rewasd')).map((f) => f.name);

  return NextResponse.json({ xml, rewasd } satisfies ConfigsResponse);
}
