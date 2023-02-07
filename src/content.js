import TurndownService from "turndown";
import rangy from "rangy";

(() => {
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

  // This rule constructs url to be absolute URLs for links & images

  const markdownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "*",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
    preformattedCode: "true",
    // blankReplacement: { // TODO: Figure out how to handle blank lines, which Tana doesn't like
    //   filter: '',
    //   replacement: function (content) {
    //     return '';
    //   }
    // }
  }).addRule('baseUrl', {
    filter: ['a', 'img'],
    replacement: function (content, el, options) {
        if (el.nodeName === 'IMG') {
            const link =  el.getAttributeNode('src').value;
            const fullLink = new URL(link, url)
            return `![${content}](${fullLink.href})`
        } else if (el.nodeName === 'A') {
            const link =  el.getAttributeNode('href').value;
            const fullLink = new URL(link, url)
            return `[${content}](${fullLink.href})`
        }
    }
});

  let data = `%%tana%%\n- ${title} #website\n  - Description:: ${description}\n  - Url:: ${url}`;

  // rangy seems poorly maintained at this time
  function getSelectedHTMRangy() {
    return rangy.getSelection().toHtml();
  }
  
  function getSelectedHTML() {
    let html = "";
    if (typeof window.getSelection != "undefined") {
      const sel = window.getSelection();
      if (sel.rangeCount) {
        const container = document.createElement("div");
        for (let i = 0, len = sel.rangeCount; i < len; ++i) {
          container.appendChild(sel.getRangeAt(i).cloneContents());
        }
        html = container.innerHTML;
      }
    } else if (typeof document.selection != "undefined") {
      if (document.selection.type == "Text") {
        html = document.selection.createRange().htmlText;
      }
    }
    return html;
  }

  let html = getSelectedHTML();

  if (html) {
    const clipping = markdownService.turndown(html);
    clipping.split('\n').forEach((line) => {
      if (line.length > 0) {
        data += `\n  - ${line}`;
      }
    });
  }

  navigator.clipboard.writeText(data).then(
    function () {
      console.log("Successfully copied data to clipboard");
    },
    function (err) {
      console.error("Error copying data to clipboard: ", err);
    }
  );
})();