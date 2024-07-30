/* 
  clip.js prepares the HTML as markdown in tana-paste format

  We do all the formatting here via Turndown which means we have to do this in the 
  content script - Turndown does now work in the background script.
*/

import TurndownService from "turndown";

export function clipHTML(html, params) {
  // this seems to help avoid "DOMException: not focused" errors from time to time
  // ref: Stackoverflow 
  window.focus();
  // grab the basic info from the page
  const title = document.title;
  const url = window.location.href;
  let description = "";

  // basic format of a tana-paste entry
  let data = `%%tana%%\n- ${title} ${params.clip2tana.webtag}`;

  let fields = [];
  fields.push(`\n  - Url:: ${url}`);

  const metaTags = document.querySelectorAll("meta");

  for (const element of metaTags) {
    if (element.name === "description") {
      description = element.content;
      fields.push("\n  - Description:: " + description);
    }
    // should we grab OpenGeraph properties?
    else if (params.clip2tana.copyOpenGraph) {
      let property = element.getAttribute("property");
      let content = element.content;
      if (property === "og:description") {
        // no point in duplicating the description
        if (content != description) {
          fields.push("\n  - og:Description:: " + content);
        }
      }
      if (property === "og:title") {
        // no point in duplicating the title
        if (content !== title) {
          fields.push("\n  - og:Title:: " + content);
        }
      }
      if (property === "og:url") {
        // no point in duplicating the url
        if (content != url) {
          fields.push("\n  - og:Url:: " + content);
        }
      }
      if (property === "og:type") {
        fields.push("\n  - og:Type:: " + content);
      }
      if (property === "og:image") {
        fields.push("\n  - og:Image:: " + content);
      }

      if (property === "og:site_name") {
        fields.push("\n  - og:Site:: " + content);
      }
    }
  }

  fields.forEach((field) => {
    console.log(field);
    data += field;
  });

  // do we have selected text as well?
  if (html) {
    let clipping = html;
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
    clipping.split('\n').forEach((line) => {
      if (line.length > 0) {
        // strip any # symbols from the front of the line
        if (params.clip2tana.markdown) {
          let frags = line.match(/^(#+ *)?(.*)/);
          data += `\n  - ${frags[2]}`;
        }
        else {
          data += `\n  - ${line}`;
        }
      }
    });
  }

  // and return whatever we prepared
  return data;
};
