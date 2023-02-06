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
  // chrome.action.setBadgeText({
  //   text: "WOKE",
  // });
});

