/* 

  helper function to read tab data, including opengraph metadata

*/

//import TurndownService from "turndown";

export function getTabData(params) {
  const title = document.title;
  const url = window?.location.href;
  let description = "";

  // basic format of a tana-paste entry
  let data = `- ${title} ${params.webtag}`;

  let fields = [];
  fields.push(`\n  - Url:: ${url}`);

  const metaTags = document.querySelectorAll("meta");

  for (const element of metaTags) {
    if (element.name === "description") {
      description = element.content;
      fields.push("\n  - Description:: " + description);
    } 
    else if (params.copyOpenGraph) {
      let property = element.getAttribute("property");
      let content = element.content;
      if (property === "og:description") {
        // no point in duplicating the description
        if (content != description) {
          fields.push("\n  - og:Description:: " + content);
        }
      }
      else if (property === "og:title") {
        // no point in duplicating the title
        if (content !== title) {
          fields.push("\n  - og:Title:: " + content);
        }
      }
      else if (property === "og:url") {
        // no point in duplicating the url
        if (content != url) {
          fields.push("\n  - og:Url:: " + content);
        }
      }
      else if (property === "og:type") {
        fields.push("\n  - og:Type:: " + content);
      }
      else if (property === "og:image") {
        fields.push("\n  - og:Image:: " + content);
      }
      else if (property === "og:site_name") {
        fields.push("\n  - og:Site:: " + content);
      }
    }
  }

  fields.forEach((field) => {
    data += field;
  });

  return { url, data };
}


export function formatNotes(url, notes, data, params) {
  // const markdownService = new TurndownService({
  //   headingStyle: "atx",
  //   hr: "---",
  //   bulletListMarker: "",
  //   codeBlockStyle: "fenced",
  //   emDelimiter: "*",
  //   strongDelimiter: "*",
  //   linkStyle: "inlined",
  //   preformattedCode: "true",
  //   blankReplacement: function (content, node) {
  //     return node.isBlock ? '\n\n' : '';
  //   },
  // }).addRule('baseUrl', {
  //   filter: ['a', 'img'],
  //   replacement: function (content, el, options) {
  //     if (el.nodeName === 'IMG') {
  //       const link = el.getAttributeNode('src').value;
  //       const fullLink = new URL(link, url);
  //       return `![${content}](${fullLink.href})`;
  //     } else if (el.nodeName === 'A') {
  //       const link = el.getAttributeNode('href').value;
  //       const fullLink = new URL(link, url);
  //       return `[${content}](${fullLink.href})`;
  //     }
  //   }
  // });

  // const clipping = markdownService.turndown(notes);
  // clipping.split('\n').forEach((line) => {
  //   if (line.length > 0) {
  //     // strip any # symbols from the front of the line
  //     let frags = line.match(/^(#+ *)?(.*)/);
  //     data += `\n  - ${frags[2]}`;
  //   }
  // });
  return data;
}
