/* 
  background.js is the web worker code, which is basically "faceless" from a
  browser tab perspective.

  From here we execute the content.js script against the active tab when the 
  extension is invoked.
*/

chrome.action.onClicked.addListener(async (tab) => {
  console.log("got click");
  await chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["content.js"],
    }
  );
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Installed clip2tana");
  // mark our extension to say we're alive
  // chrome.action.setBadgeText({
  //   text: "WOKE",
  // });
});

