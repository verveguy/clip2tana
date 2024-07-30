/* 
  content.js is the script executed against the active tab.

  This happens when background.js calls chrome.scripting.executeScript()
  passing this file as the reference.

  TODO: see if we can use function injection from background.js and
  whether that changes the observed behavior of the MSWord specific
  get HTML via <span class="Selected"> stuff below.

*/

import { clipHTML } from "./clip";
import { configure } from "./Configuration";

// inject our code that runs inside the main world
// let inject = document.createElement('script');
// inject.src = chrome.runtime.getURL('inject.js');
// inject.onload = function() {
//     inject.remove();  // TODO: check this. Original was this.remove()
// };
// (document.head || document.documentElement).appendChild(inject);

document.addEventListener("selectionchange", () => {
  console.log("Selection changed");
  chrome.runtime.sendMessage("selection-changed");
});

function listenForMessages(request, sender, sendResponse) {
  const params = configure(request?.configuration);
  const command = request?.command;

  // tell our inject code in main world
  window.postMessage({ command: command }, "*");

  // helper messages for getting/setting clipboard
  if (request.command === "clip2tana") {
    let data = clipHTML(getSelectedHTML(), params);
    // add put the result on the clipboard
    navigator.clipboard.writeText(data).then(
      function () {
        console.log("Successfully copied data to clipboard");
      },
      function (err) {
        console.error("Error copying data to clipboard: ", err);
      }
    );
    return false; // signal that we will NOT send async responses
  }
  else if (request.command === "get-tanapaste") {
    // just grab the selection as tana paste format, but don't touch the clipboard
    let data = clipHTML(getSelectedHTML(), params);
    console.log("Got selection as tana paste format: ", data);
    sendResponse({ result: "get-tanapaste-result", selection: data });
    return true; // signal that we will send async responses
  }
  else if (request.command === "get-clipboard") {
    navigator.clipboard.readText()
      .then((result) => {
        sendResponse({ result: "get-clipboard-result", clipboard: result });
      });
    return true; // signal that we will send async responses
  }
  else if (request.command === "set-clipboard") {
    let data = request.clipboard;
    navigator.clipboard.writeText(data)
      .then(() => {
        sendResponse({ result: "set-clipboard-result" });
      });
    return true; // signal that we will send async responses
  }
}


function getSelectedHTML() {
  let html = "";
  if (typeof window.getSelection != "undefined") {
    const sel = window.getSelection();
    if (sel?.rangeCount) {
      const container = document.createElement("div");
      for (let i = 0, len = sel.rangeCount; i < len; ++i) {
        container.appendChild(sel.getRangeAt(i).cloneContents());
      }
      html = container.innerHTML;
    }
    else {
      console.log("No apparent selection - attempting MSOffice class selection");

      // TODO: this doesn't actually work unless you do it in the java
      // debug console. Why?
      // See open question https://stackoverflow.com/questions/75378711/how-to-get-selected-text-in-office365-word-document-from-within-a-chrome-extensi
      const selection = document.getElementsByClassName('Selected');
      console.log(selection);
      const container = document.createElement("div");
      for (const node of selection) {
        //container.appendChild(node.cloneContents());
      }
      html = container.innerHTML;
    }
  }

  return html;
}

(() => {

  // add a listener here for eventual use by some Google Doc and Word plugin
  // which is getting complicated...
  chrome.runtime.onMessage.addListener(listenForMessages);

})();