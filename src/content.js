
import TurndownService from "turndown";

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

  const markdownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "*",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
    preformattedCode: "true",
    // blankReplacement: {
    //   filter: '',
    //   replacement: function (content) {
    //     return '';
    //   }
    // }
  });

  let data = `%%tana%%\n- ${title} #website\n  - Description:: ${description}\n  - Url:: ${url}`;

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