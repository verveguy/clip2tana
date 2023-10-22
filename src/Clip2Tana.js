import { getTabData, formatNotes } from "./GetTabData";

export const clip2tanaCommands = [
  {
    label: "Clip current website to Tana",
    command: "clip2tana",
    doCommand: doClip2tana,
    isContentScript: true
  },
];

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

async function doClip2tana(notes, configuration) {

  let params = configure(configuration);

  // this seems to help avoid "DOMException: not focused" errors from time to time
  // ref: Stackoverflow 
  //window?.focus();
  // grab the basic info from the page
  let { url, data } = getTabData(params);

  // do we have selected text as well?
  if (notes) {
    // convert html to markdown
    data = formatNotes(url, notes, data, params);
  }

  return data;
};