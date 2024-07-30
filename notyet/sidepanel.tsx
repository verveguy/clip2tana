/* sidepanel */

const TANA_ORIGIN = 'https://app.tana.inc/';

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  // Enables the side panel on app.tana.inc pages  
  if (url.origin.startsWith(TANA_ORIGIN)) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'tana_sidepanel.html',
      enabled: true
    });
  } else {
    // Disables the side panel on all other sites
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'clip_sidepanel.html',
      enabled: true
    });
  }
});
