/* 
  clip.js prepares the HTML as markdown in tana-paste format

  We do all the formatting here via Turndown which means we have to do this in the 
  content script - Turndown does now work in the background script.
*/

import TurndownService from "turndown";

// Tana type structure
type Node = {
  name: string;
  description?: string;
  supertags?: { id: string }[];
  children?: (Field | Node)[];
  dataType?: string;
};

type Field = {
  type: 'field';
  attributeId: string;
  children: Node[];
};

type Payload = {
  targetNodeId: string;
  nodes: Node[];
};

export function clip_tana_paste(html, params): string {
  const { title, clipping, fields } = extract_clipping(html, params);
  const data = tana_paste_format(title, clipping, fields, params);
  return data;
}

export function clip_tana_nodes(html, params): Payload {
  const { title, clipping, fields } = extract_clipping(html, params);
  const data = nodes_format(title, clipping, fields, params);
  return data;
}

export function extract_clipping(html, params) {
  // this seems to help avoid "DOMException: not focused" errors from time to time
  // ref: Stackoverflow 
  window.focus();
  // grab the basic info from the page
  const title = document.title;
  const url = window.location.href;

  let fields = [];
  // always push Url field
  fields.push(['Url', url]);

  const metaTags = document.querySelectorAll("meta");
  let description = "";

  for (const element of metaTags) {
    if (element.name === "description") {
      description = element.content;
      fields.push(["Description", description]);
    }
    // should we grab OpenGraph properties?
    else if (params.opengraph.useOpenGraph) {
      let property = element.getAttribute("property");
      let content = element.content;
      // TODO: use a loookup table for these
      if (property === "og:description") {
        // no point in duplicating the description
        if (content != description) {
          fields.push(["ogDescription", content]);
        }
      }
      if (property === "og:title") {
        // no point in duplicating the title
        if (content !== title) {
          fields.push(["ogTitle", content]);
        }
      }
      if (property === "og:url") {
        // no point in duplicating the url
        if (content != url) {
          fields.push(["ogUrl", content]);
        }
      }
      if (property === "og:type") {
        fields.push(["ogType", content]);
      }
      if (property === "og:image") {
        fields.push(["ogImage", content]);
      }

      if (property === "og:site_name") {
        fields.push(["ogSite", content]);
      }
    }
  }

  let clipping = undefined;
  // do we have selected text as well?
  if (html) {
    clipping = html;
    if (params.clip2tana.markdown) {
      // convert html to markdown
      const markdownService = new TurndownService({
        headingStyle: "atx",
        hr: "---",
        bulletListMarker: "",
        codeBlockStyle: "fenced",
        emDelimiter: "*",
        strongDelimiter: "*",
        linkStyle: "inlined",
        preformattedCode: "true",
        blankReplacement: function (content, node) {
          return node.isBlock ? '\n\n' : ''
        },
      }).addRule('baseUrl', {   // This rule constructs url to be absolute URLs for links & images
        filter: ['a', 'img'],
        replacement: function (content, el, options) {
          if (el.nodeName === 'IMG') {
            const link = el.getAttributeNode('src').value;
            const fullLink = new URL(link, url)
            return `![${content}](${fullLink.href})`
          } else if (el.nodeName === 'A') {
            const link = el.getAttributeNode('href').value;
            const fullLink = new URL(link, url)
            return `[${content}](${fullLink.href})`
          }
        }
      });

      clipping = markdownService.turndown(html);
    }
    
  }

  // and return whatever we prepared
  return { title, clipping, fields };
};


export function tana_paste_format(title, clipping, fields, params): string {
  // basic format of a tana-paste entry
  let data = `%%tana%%\n- ${title} ${params.clip2tana.webtag}`;

  fields.forEach((field) => {
    console.log(field);
    data += `\n  - ${field[0]}:: ${field[1]}`;
  });

  if (clipping) {
    clipping.split('\n').forEach((line) => {
      if (line.length > 0) {
        // strip any # symbols from the front of the line
        if (params.clip2tana.markdown) {
          let frags = line.match(/^(#+ *)?(.*)/);
          data += `\n  - ${frags[2]}`;
        }
        else {
          // skip empty <p> tags in HTML format
          if (line != "</p>") {
            data += `\n  - ${line}`;
          }
        }
      }
    });
  }

  return data;
}

const resolvePath = (object, path, defaultValue) => path
  .split('.')
  .reduce((o, p) => o ? o[p] : defaultValue, object)

export function nodes_format(title, clipping, fields, params): Payload {
  const nodes: Node[] = [];
  const targetNodeId = 'INBOX'; // TODO: consider making this configurable

  const node: Node = {
    name: title,
    supertags: [{ id: params.inbox.supertag }],
    children: []
  };

  let descField = fields.find((field) => field[0] === 'Description');
  let description = descField ? descField[1] : undefined
  console.log("description", description);
  if (description) {
    node.description = description;
  }

  let urlField = fields.find((field) => field[0] === 'Url');
  const url = urlField ? urlField[1] : undefined;
  console.log("url", url);
  if (url) {
    const urlNode: Field = {
      type: 'field',
      attributeId: params.inbox.urlfieldid,
      children: [
        {
          name: url
        }
      ]
    };
    node.children.push(urlNode);
  }


  fields.forEach((field) => {
    const fieldID = resolvePath(params.opengraph, field[0], undefined);
    if (!fieldID) {
      return;
    }

    const fieldNode: Field = {
      type: 'field',
      attributeId: fieldID,
      children: [
        {
          name: field[1]
        }
      ]
    };

    node.children?.push(fieldNode);
  });

  // add clipping as a node but strip all newlines
  clipping?.split('\n').forEach((para) => {
    if (para != "</p>") {
      node.children?.push({ name: para });
    }
  });

  nodes.push(node);

  return { targetNodeId, nodes };
}