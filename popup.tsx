import React, { useEffect, useState } from "react";
import { FormControlLabel, FormGroup, IconButton, Switch, TextareaAutosize, TextField } from "@mui/material";
import { get_default_configuration, merge_config } from "./Configuration";
import ConfigurationPanel from "~options";

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

// send a message to the background.js worker
async function askServiceWorker(message) {
  console.log("Popup sending message ", message);
  const response = await chrome.runtime.sendMessage(message);
  console.log("Popup message got response: ", response);
  return response;
}


function ClipPopup() {
  const [shouldLoadConfig, setShouldLoadConfig] = useState(true);
  const [configuration, setConfiguration] = useState(get_default_configuration());
  const [data, setData] = useState("");
  const [fetchClipping, setFetchClipping] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // install event handler on load
  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Popup got broadcast: ", message);
      if (message === "selection-changed") {
        setFetchClipping(true);
      }
    });
  }, []);

  // TODO: replace this with plasmo storage API wrapper
  useEffect(() => {
    if (shouldLoadConfig) {
      chrome.storage.sync.get("configuration").then((data) => {
        if (data?.configuration) {
          let new_config = merge_config(configuration, data.configuration);
          console.log("popup using  configuration", new_config);
          setConfiguration(new_config);
        }
        setShouldLoadConfig(false); // only try once
        setFetchClipping(true); // now fetch the clipping
      });
    }
  }, [shouldLoadConfig]);

  // TODO: replace this with plasmo message API wrapper
  useEffect(() => {
    if (fetchClipping) {
      console.log("Popup sending get-tanapaste");
      // invoke clip2tana to grab current tab selection, etc
      askServiceWorker({ command: "get-tanapaste", configuration: configuration })
        .then((response) => {
          console.log(response);
          setData(response.selection);
          setFetchClipping(false)
          console.log("Popup get-tanapaste complete");
        });
    }
  }, [fetchClipping]);

  function openOptionsPage() {
    setShowSettings(true);
  }

  function closeOptionsPage() {
    setShowSettings(false);
    // refetch our config, which will fetch clipping again
    setShouldLoadConfig(true);
  }

  function openEmbeddedOptions() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(data).then(
      function () {
        console.log("Successfully copied data to clipboard");
      },
      function (err) {
        console.error("Error copying data to clipboard: ", err);
      }
    );
    close();
  }

  function sendToTana() {
    // send to Tana Input API
    // or Tana Helper queue?
  }

  if (showSettings) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <ConfigurationPanel closeHandler={() => closeOptionsPage()} />
      </div>
    );
  }
  else {
    return (
      <div style={{ width: 600, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Clip2Tana</h2>
          <div style={{ height: 20, width: 400, display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={openOptionsPage}>Settings</button>
            <button onClick={sendToTana} disabled={true}>Send to Tana</button>
            <button onClick={copyToClipboard}>Copy</button>
          </div>
        </div>

        <TextareaAutosize style={{ width: '100%' }}
          autoFocus={true}
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

      </div>
    );
  }
}

export default ClipPopup