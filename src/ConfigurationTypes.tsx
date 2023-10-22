export type ConfigEntry = {
  type: string; key: string, label: string, value: any, options?: string[]
};
export type ConfigElements = { [index: string]: ConfigEntry };
export type ConfigurationEntry = { key: string, label: string, properties: ConfigElements };
export type Configuration = { [index: string]: ConfigurationEntry };

export type CommandDeclaration = {
  label: string,
  command: string,
  doCommand: (notes: any, configuration: Configuration | undefined) => Promise<any>,
  isContentScript: boolean
};

