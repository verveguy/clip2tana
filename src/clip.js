/* 
  clip.js prepares the HTML as markdown in tana-paste format
*/

import TurndownService from "turndown";

export function clipHTML(html) {
  // grab the basic info from the page
  const title = document.title;
  const url = window.location.href;
  let description = "";
  const metaTags = document.querySelectorAll("meta");
  for (const element of metaTags) {
    if (element.name === "description") {
      description = element.content;
      break;
    }
  }

  // basic format of a tana-paste entry
  let data = `%%tana%%\n- ${title} #website\n  - Description:: ${description}\n  - Url:: ${url}`;
  
  // do we have selected text as well?
  if (html) {
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

    const clipping = markdownService.turndown(html);
    clipping.split('\n').forEach((line) => {
      if (line.length > 0) {
        // strip any # symbols from the front of the line
        let frags = line.match(/^(#+ *)?(.*)/);
        data += `\n  - ${frags[2]}`;
      }
    });
  }

  // add put the result on the clipboard
  navigator.clipboard.writeText(data).then(
    function () {
      console.log("Successfully copied data to clipboard");
    },
    function (err) {
      console.error("Error copying data to clipboard: ", err);
    }
  );
};
