import type { Configuration } from "./ConfigurationTypes";
import deepmerge from "@fastify/deepmerge";

const default_config = 
  { // these are the actual values we use
    clip2tana: {
      webtag: "#website",
      markdown: true,
      opengraph: false
    },
    helper: {
      usetanahelper: false,
      helperurl: "http://localhost:8000/"
    },
    inbox: {
      pushinbox: false,
      tanaapikey: ""
    }
  };

export function get_default_configuration() {
  return {
    config: default_config,

    schema: [ // and this is the schema to drive the UX
      {
        key: "clip2tana",
        label: "Clip control",
        properties: [
          {
            key: "webtag",
            label: "Tana tag for websites", type: "string",
          },
          {
            key: "markdown",
            label: "Convert HTML to markdown", type: "boolean",
          },
          {
            key: "opengraph",
            label: "Copy OpenGraph meta attributes", type: "boolean",
          },
        ],
      },
      // ADDING FUNCTIONALITY TO PUSH TO TANA HELPER
      {
        key: "helper",
        label: "Use Tana Helper (not yet implemented)",
        properties: [
          {
            key: "usetanahelper",
            label: "Push to Tana Helper", type: "boolean",
          },
          {
            key: "helperurl",
            label: "Tana Helper URL", type: "string",
          },
        ]
      },

      // ADDING FUNCTIONALITY TO PUSH TO TANA INBOX API
      {
        key: "inbox",
        label: "Inbox settings (not yet implemented)",
        properties: [
          {
            key: "pushinbox",
            label: "Push to inbox by default", type: "boolean",
          },
          {
            key: "tanaapikey",
            label: "Tana API key", type: "string",
          },
        ]
      },
    ]
  };
}



export const clip2tanaConfiguration = get_default_configuration();

// helper function for deepmerge
function replaceByClonedSource(options) {
  const clone = options.clone
  return function (target, source) {
    return clone(source)
  }
}

export function merge_config(initial, new_config) {
  const merger = deepmerge({ mergeArray: replaceByClonedSource })
  new_config = merger(initial, new_config);
  return new_config;
}

export function configure(configuration) {
  // if no config, use default.
  configuration = configuration?.config ?? clip2tanaConfiguration.config;
  return configuration;
}

export const initial_config: Configuration = {
  ...clip2tanaConfiguration
};
