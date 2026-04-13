/**
 * Custom description sidecar file format.
 *
 * Each .rewasd config can have an optional .descriptions.json file alongside it.
 * Keys use the format: {button}-{layerName}-{activatorType}
 * e.g., "A-Main-single", "A-LB-long", "DpadUp-Main-start"
 *
 * See docs/plan/research-04-custom-descriptions.md for full spec.
 */
export interface DescriptionsSidecar {
  /** Schema version identifier */
  $schema: string;
  /** Name of the reWASD config this describes */
  config: string;
  /** Map of binding ID → custom description */
  descriptions: Record<string, string>;
}
