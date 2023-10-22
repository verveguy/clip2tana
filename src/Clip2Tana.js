

export const clip2tanaConfiguration = {
  clip2tana: {
    key: "clip2tana",
    label: "Configuration for clip2tana",
    properties: {
      webtag: {
        key: "webtag",
        label: "Tana tag for websites", type: "string", value: "#website",
      },
      opengraph: {
        key: "opengraph",
        label: "Copy OpenGraph meta attributes", type: "boolean",
        value: false
      }
    },
  }
};


export function configure(config) {
  // if no config, use default.
  config = config?.clip2tana ?? clip2tanaConfiguration.clip2tana;
  let params = {};
  params.copyOpenGraph = config.properties.opengraph.value;
  params.webtag = config.properties.webtag.value;
  return params;
}
