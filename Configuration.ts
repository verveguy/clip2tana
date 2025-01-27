import type { Configuration } from "./ConfigurationTypes";
import deepmerge from "@fastify/deepmerge";

// TODO: Rework all of this with the formik schema approach

const default_config =
{ // these are the actual values we use
  clip2tana: {
    webtag: "#website",
    markdown: false,
  },
  helper: {
    usetanahelper: false,
    helperurl: "http://localhost:8000/"
  },
  inbox: {
    pushinbox: false,
    superTags: [
      {
        id: '',
        title: '',
        fields: [
          { id: '' }
        ]
      }
    ],
    tanaapikey: '',
  },
  opengraph: {
    useOpenGraph: false,
    ogDescription: '',
    ogTitle: '',
    ogUrl: '',
    ogType: '',
    ogImage: '',
    ogSite_Name: '',
  }
};

const default_schema =
  [ // and this is the schema to drive the UX
    {
      key: "clip2tana",
      label: "Clipboard control (Tana paste)",
      properties: [
        {
          key: "webtag",
          label: "Tana tag for websites", type: "string",
        },
        {
          key: "markdown",
          label: "Convert HTML to markdown", type: "boolean",
        },
      ],
    },
    

    // ADDING FUNCTIONALITY TO PUSH TO TANA INBOX API
    {
      key: "inbox",
      label: "Inbox settings",
      properties: [
        {
          key: "pushinbox",
          label: "Push to inbox by default", type: "boolean",
        },
        {
          key: "superTags",
          label: "Super Tags",
          type: "superTags",
        },
        {
          key: "tanaapikey",
          label: "Tana API key", type: "string",
        },
      ]
    },

    // OpenGraph field support
    {
      key: "opengraph",
      label: "OpenGraph Field Mapping",
        
      properties: [
        {
          key: "useOpenGraph",
          label: "Copy OpenGraph meta attributes", type: "boolean",
        },
        {
          key: "ogDescription",
          label: "OpenGraph Description Field Node ID", type: "string",
        },
        {
          key: "ogTitle",
          label: "OpenGraph Title Field Node ID", type: "string",
        },
        {
          key: "ogUrl",
          label: "OpenGraph URL Field Node ID", type: "string",
        },
        {
          key: "ogType",
          label: "OpenGraph Type Field Node ID", type: "string",
        },
        {
          key: "ogImage",
          label: "OpenGraph Image Field Node ID", type: "string",
        },
        {
          key: "ogSite_Name",
          label: "OpenGraph Site Name Field Node ID", type: "string",
        },
      ]
    },
    // ADDING FUNCTIONALITY TO PUSH TO TANA HELPER
    {
      key: "helper",
      label: "Use Tana Helper (not yet implemented)",
      disabled: true,
      properties: [
        {
          key: "usetanahelper",
          label: "Push to Tana Helper", type: "boolean", disabled: true,
        },
        {
          key: "helperurl",
          label: "Tana Helper URL", type: "string", disabled: true,
        },
      ]
    },
  ];

  // this complex looking approach is in an effort to get 
  // a unique object instance every time (to prevent pollution)
export function get_default_configuration():Configuration {
  return structuredClone({
    config: default_config,
    schema: default_schema,
  });
}

// helper function for deepmerge
function replaceByClonedSource(options) {
  const clone = options.clone
  return function (target, source) {
    return clone(source)
  }
}

export function merge_config(initial, new_config) {
  const base = structuredClone(initial);
  const merger = deepmerge({ mergeArray: replaceByClonedSource })
  new_config = merger(base, new_config);
  return new_config;
}

export function configure(configuration) {
  // if no config, use default.
  configuration = configuration?.config ?? get_default_configuration().config;
  return configuration;
}
