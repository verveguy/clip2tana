/* 
  background.js is the web worker code, which is basically "faceless" from a
  browser tab perspective.

  From here we execute the content.js script against the active tab when the 
  extension is invoked.
*/

/* 
  background.js is the web worker code, which is basically "faceless" from a
  browser tab perspective.

  From here we execute the content.js script against the active tab when the 
  extension is invoked.

  The code is built via esbuild, allowing us to include external modules

  See App.tsx for an overview of how this code interacts with the browser
  tab and the injected content.js script generated from the React app.
*/

let configuration = undefined;

// Watch for changes to the user's configuration & apply them
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.configuration) {
    console.log("Configuration changed");
    configuration = changes.configuration.newValue;
  }
});

async function readConfiguration() {
  // read our stored configuration, if any
  await chrome.storage.sync.get("configuration").then((data) => {

    if (data?.configuration) {
      configuration = {};
      Object.assign(configuration, data?.configuration);
      console.log("Retrieved configuration");
      console.log(configuration);
    }
  });
}

// now go get our config on load
readConfiguration();

// now that we have the configuration, install our event listeners

// Add our main listener for extension activation via the icon
chrome.action.onClicked.addListener(async (_tab) => {
  // invoke the main code within the context of the foreground 
  // chrome tab process. Note we do not expect a response from
  // this message
  console.log("Got click action");
  if (configuration === undefined) {
    // wait for configuration to become available first
    console.log("Waiting for configuration");
    readConfiguration().then(() => {
      sendInvokeMessage({ command: "clip2tana", configuration: configuration })
        .then(() => { console.log("Click action complete"); });
    })
  }
  else {
    sendInvokeMessage({ command: "clip2tana", configuration: configuration })
      .then(() => { console.log("Click action complete"); });
  }

  return;
});

// and one for keyboard activation of the extension
chrome.commands.onCommand.addListener((_command) => {
  // invoke the main code within the context of the foreground 
  // chrome tab process. Note we do not expect a response from
  // this message
  console.log("Got command: " + _command);
  sendInvokeMessage({ command: "clip2tana", configuration: configuration })
    .then(() => { console.log("Command action complete"); });
});


// anything needed at extension startup time, add it here
chrome.runtime.onInstalled.addListener(() => {
  console.log("Installed clip2tana");
  // mark our extension to say we're alive
  // chrome.action.setBadgeText({
  //   text: "AWAKE",
  // });
});


/* 
  helper functions related to our use of content.js to do various operations
  and the required messaging back and forth to the React app contained within
  content.js
*/

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// send a message to the React app in content.js in the browser tab
async function sendInvokeMessage(message, tab = undefined) {
  if (tab === undefined) {
    tab = await getCurrentTab();
  }
  const response = await chrome.tabs.sendMessage(tab?.id, message);
  return { response, tab };
}

// We wrap the command invocation with get/set clipboard
// since that the only way to get data in/out of the Tana
// app at the moment. Note that we wrap the result 
// with the tana paste `%%tana%%` sentinel. So make sure
// your commands generate tana-paste format output

async function doCommand(commandFunction) {
  let { response, tab } = await sendInvokeMessage({ command: "get-clipboard" });
  let clipboard = response.clipboard;

  // munge the clipboard data
  let data = await commandFunction(clipboard, configuration);
  data = "%%tana%%\n" + data;

  await sendInvokeMessage({ command: "set-clipboard", clipboard: data }, tab);
}



