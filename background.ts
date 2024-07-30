/* 
  background.js is the web worker code, which is basically "faceless" from a
  browser tab perspective.

  From here we execute the content.js script against the active tab when the 
  extension is invoked.

  The code is built via esbuild, allowing us to include external modules

  See App.tsx for an overview of how this code interacts with the browser
  tab and the injected content.js script generated from the React app.
*/

import { initial_config, merge_config } from "./Configuration";
export { }

// -------
// Configuration handling

let configuration = initial_config;

// Watch for changes to the user's configuration & apply them
chrome.storage.onChanged.addListener((changes, area) => {
  console.log("Background detected storage change", changes, area);
  if (area === 'sync' && changes.configuration) {
    console.log("Background detected configuration changed");
    configuration = changes.configuration.newValue;
    console.log("Background using configuration", configuration);
  }
});

async function readConfiguration() {
  // read our stored configuration, if any
  await chrome.storage.sync.get("configuration").then((data) => {
    configuration = initial_config;
    console.log("Initial config", configuration);
    if (data?.configuration) {
      const new_config = merge_config(initial_config, data.configuration);
      configuration = new_config;
      console.log("Background retrieved configuration");
    }
    console.log("Background using configuration", configuration);
  });
}

// now go get our config on load
readConfiguration();

let currentTab = undefined;

//----------------
// Track active tab so popup can use it
chrome.tabs.onActivated.addListener(function () {
  console.log("TAB CHANGED")
  //firstTimeRunning = true
  //feedbackActivated = false
  getCurrentTab()
    .then((tab) => {
      ;
      currentTab = tab;
      console.log("Background current tab is now", currentTab);
    });
});

//----------------
// Command handling

// Listen for direct invocation of the clip2tana extension command
// typically via the keyboard shortcut

chrome.commands.onCommand.addListener((command) => {
  // invoke the main code within the context of the foreground 
  // chrome tab process. Note we do not expect a response from
  // this message
  console.log("Background got extension command: " + command);
  askContentScript({ command: "clip2tana", configuration: configuration })
    .then(() => { console.log("Background command action complete"); });
});

// listen for commands back from the content.js script running in the page
// or from the popup.js script running in the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Background got request", request);
  if (sender.tab) {
    console.log("Background got message from content.js: " + request);
    // // what kind of requests do we need to service?
    // if (request === "selection-changed") {
    //   // and forward to our popup, if it's alive
    //   chrome.runtime.sendMessage({command: "selection-refreshed"});
    //   // let content_request = { command: "get-tanapaste", configuration: configuration };
    //   // askContentScript(content_request)
    //   //   .then((result) => {
    //   //     console.log("Refreshed selection", result);
    //   //     // and forward to our popup, if it's alive
    //   //     chrome.runtime.sendMessage({command: "selection-refreshed", selection: result});
    //   //   });
    // }
    return false; // signal that we will NOT send async responses
  }
  else {
    // request is from an extension page
    console.log("Background got relayed request from popup", request);
    if (request.command === "clip2tana") {
      // relay the clip request
      let content_request = { command: "get-tanapaste", configuration: request.configuration };
      askContentScript(content_request)
        .then((result) => {
          console.log("Background message action complete with result", result);
          sendResponse(result);
        });
    }
    else if (request.command === "set-clipboard") {
      // relay the clip request
      askContentScript(request)
        .then((result) => {
          console.log("Background message action complete with result", result);
          sendResponse(result);
        });
    }
  }
});


// If we don't have a popup, this handles a click on the extension icon
// If we DO have a popup, this is never called

// Add our main listener for extension activation via the icon
chrome.action.onClicked.addListener(async (tab) => {
  // invoke the main code within the context of the foreground 
  // chrome tab process. Note we do not expect a response from
  // this message
  console.log("Background got click action with tab", tab);
  if (configuration === undefined) {
    // wait for configuration to become available first
    console.log("Waiting for configuration");
    readConfiguration().then(() => {
      askContentScript({ command: "get-tanapaste", configuration: configuration }, tab)
        .then((result) => {
          console.log("Background click action complete", result);
        });
    })
  }
  else {
    askContentScript({ command: "get-tanapaste", configuration: configuration }, tab)
      .then((result) => {
        console.log("Background click action complete", result);
      });
  }

  return;
});


// anything needed at extension startup time, add it here
chrome.runtime.onInstalled.addListener(() => {
  console.log("Background got Installed event");
  // mark our extension to say we're alive
  // chrome.action.setBadgeText({
  //   text: "AWAKE",
  // });
});


// ----------------
// Helper functions

async function getCurrentTab() {
  console.log("Background getting current tab");
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log("Background got current tab: ", tab);
  return tab;
}

// send a message to the React app in content.js in the browser tab
async function askContentScript(message, tab = undefined) {
  if (tab === undefined) {
    tab = await getCurrentTab();
  }

  if (tab === undefined) {
    tab = currentTab; // use the last active tab
    console.log("Background using last active tab: ", tab);
  }

  if (tab === undefined) {
    console.log("Can't determine active tab");
  }
  else {
    console.log("Background asking content script ", tab, message);
    const response = await chrome.tabs.sendMessage(tab?.id, message);
    console.log("Background got response: ", response);
    return response;
  }
}
