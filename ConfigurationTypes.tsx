/* Configuration provides both a config values holder and a schema
so that our UI can be dynamically generated.
*/

export type Configuration = { config: any, schema: ConfigSection []};

export type ConfigEntry = {
  type: string; key: string, label: string, options?: string[]
};

/* ConfigSection defines a logical "section" of a configuration, with a label and a set of properties */

export type ConfigSection = { key: string, label: string, properties: ConfigEntry[]};


// UNUSED IN CLIP2TANA
/* CommandDeclaration defines a command that can be executed by the extension */

export type CommandDeclaration = {
  label: string,
  command: string,
  doCommand: (notes: any, configuration: Configuration | undefined) => Promise<any>,
  isContentScript: boolean
};

