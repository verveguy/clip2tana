/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!***************************!*\
  !*** ./src/background.js ***!
  \***************************/
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


/******/ })()
;
//# sourceMappingURL=background.js.map