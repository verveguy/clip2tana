/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// @ts-nocheck
/* 
  clip.js prepares the HTML as markdown in tana-paste format
*/

import TurndownService from "turndown";

export function clipHTML(html) {
  // this seems to help avoid "DOMException: not focused" errors from time to time
  // ref: Stackoverflow 
  window.focus();
  // grab the basic info from the page
  let pgTitle = document.title;
  let pgURL = new URL(window.location.href);
  let pgDescription = '';
  let pgPath = pgURL.pathname;
  // boolean to indicate if we are at the root of the site
  let is_root = pgPath === '/';
  // default tana supertag is 'web-page'
  let supertag = 'web-page';
  // add a tana paste row for highlights just in case
  let highlights = ['\n  - Highlights'];
  // initialize the tana paste data
  let siteName = '';
  let tanaPasteData = '';
  let fields = [];

  // replace underscores and dashes with spaces in a filename string
  const cleanFileName = (str) => str.replace(/_/g, ' ').replace(/-/g, ' ');
  // convert a string to title case
  const titleCase = (str) => str.replace(/\b\S/g, (t) => t.toUpperCase());

  // grab and process the meta tags
  const metaTags = document.querySelectorAll("meta");
  for (const element of metaTags) {
    if (element.name === "description") {
      pgDescription = element.content.trim();
      if (pgDescription.length > 0) {
        fields.push('\n  - Description:: ' + pgDescription);
      }
    } else {
      let property = element.getAttribute('property');
      let content = element.content.trim();
      if (property === "og:description") {
        // no point in duplicating the description, but use it if we don't have one
        if (pgDescription.length === 0) {
          fields.push('\n  - Description:: ' + content);
        } else if (content != pgDescription) {
          fields.push('\n  - og:Description:: ' + content);
        }
      }
      if (property === "og:title") {
        // no point in duplicating the title, but use it if we don't have one
        if (pgTitle.length === 0) {
          fields.push('\n  - Title:: ' + content);
        } else if (content !== pgTitle) {
          fields.push("\n  - og:Title:: " + content);
        }
      }
      if (property === "og:url") {
        // no point in duplicating the url
        if (content != pgURL.href) {
          fields.push("\n  - og:Url:: " + content);
        }
      }
      if (property === "og:type") {
        switch (content) {
          case 'article':
            supertag = 'article';
            break;
          case 'book':
            supertag = 'book';
            break;
          case 'video.other':
            supertag = 'video';
            break;
          case 'video.movie':
            supertag = 'video';
            break;
          case 'website':
            supertag = 'web-page';
            break;
          default:
            supertag = 'web-page';
            fields.push('\n  - og:Type:: ' + content);
            break;
        }
      }
      if (property === "og:image") {
        fields.push("\n  - og:Image:: " + content);
      }

      if (property === "og:site_name") {
        siteName = content;
      }
    }
  }


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
        highlights.push(`\n    - ${frags[2]}`);
      }
    });
  }

// capture the origin site info
const originURL = new URL(pgURL.origin);
const originHost = originURL.hostname;

// TODO: Fetch API not working, so just use the origin hostname for now
// fetchOrigin(originURL.href).then((response) => {
//   // find the title of the origin site
//   let originTitle = response.match(/<title>(.*?)<\/title>/)[1];
let originTitle = 'Website at ' + originHost;
if (siteName != '') {
  originTitle = siteName + ' (' + originHost + ')';
  fields.push('\n  - og:Site:: ' + siteName);
}
// generate the basic tana-paste entry for the origin site
tanaPasteData = `%%tana%%\n- ${originTitle} #website`;
tanaPasteData += `\n  - Title:: ${originTitle}`;
tanaPasteData += `\n  - URL:: ${originURL.href}`;
tanaPasteData += `\n  - Hostname:: ${originHost}`;

console.log(tanaPasteData);

if (!is_root) {
  // if clipped page is not the root page...
  // add tana reference/link to origin site
  const originRef = `[[${originTitle}]]`;
  fields.push(`\n  - Root Site:: ${originRef}`);

  // attempt to find filename and extension
  const pgFilename = pgPath.split('/').pop();
  const justFileName = pgFilename.split('.')[0];
  const pgExtension = pgFilename.split('.')[1];

  // if extension is not html, then we are dealing with a file
  if (pgExtension != undefined && pgExtension !== 'html') {
    supertag = 'document';
    fields.push(`\n  - Filename:: ${pgFilename}`);

    if (pgTitle === '') {
      // if pgTitle is empty, prettify the filename
      pgTitle = titleCase(cleanFileName(justFileName));
    }
  }
  fields.push(`\n  - Title:: ${pgTitle}`);
  fields.push(`\n  - URL:: ${pgURL}`);

  // generate the basic tana-paste format for the clipped page
  // (no %%tana%%—it will be appended to original tana-paste entry)
  const nodeData = `- ${pgTitle} #${supertag}`;
  tanaPasteData += '\n\n\n' + nodeData;
}
// add the fields
fields.forEach((field) => {
  // console.log(field);
  tanaPasteData += field;
});

// add the highlights if there are any
if (highlights.length > 1) {
  tanaPasteData += highlights.join('');
}
console.log(tanaPasteData);

  // copy the result to the clipboard
  navigator.clipboard.writeText(tanaPasteData).then(
    function () {
      console.log("Successfully copied data to clipboard");
    },
    function (err) {
      console.error("Error copying data to clipboard: ", err);
    }
  );
}
