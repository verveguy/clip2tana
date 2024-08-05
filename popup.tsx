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

const endpointUrl = "https://europe-west1-tagr-prod.cloudfunctions.net/addToNodeV2";

async function pushDataToEndpoint(payload: any, token:string) {

  console.log("Pushing data to endpoint", payload);

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log("Data pushed successfully!");
    } else {
      const errorBody = await response.text();
      console.error("Failed to push data:", errorBody);
    }
  } catch (error) {
    console.error("An error occurred while pushing data:", error);
  }
}

function ClipPopup() {
  const [shouldLoadConfig, setShouldLoadConfig] = useState(true);
  const [configuration, setConfiguration] = useState(get_default_configuration());
  const [data, setData] = useState("");
  const [nodes, setNodes] = useState({});
  const [fetchClipping, setFetchClipping] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [disableSendtoTana, setDisableSendtoTana] = useState(false);

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
          setDisableSendtoTana(!new_config.config.inbox.pushinbox)
        }
        setShouldLoadConfig(false); // only try once
        setFetchClipping(true); // now fetch the clipping
      });
    }
  }, [shouldLoadConfig]);

  useEffect(() => {
    setDisableSendtoTana(!configuration.config.inbox.pushinbox);
  }, [configuration]);

  // TODO: replace this with plasmo message API wrapper
  useEffect(() => {
    if (fetchClipping) {
      console.log("Popup sending get-tanapaste");
      // invoke clip2tana to grab current tab selection, etc
      askServiceWorker({ command: "get-tanapaste", configuration: configuration })
        .then((response) => {
          setData(response.selection);
          setFetchClipping(false)
          console.log("Popup get-tanapaste complete");
        });

      // also fetch the nodes version of this for inbox posting purposes
      askServiceWorker({ command: "get-tananodes", configuration: configuration })
        .then((response) => {
          setNodes(response.nodes);
          console.log("Popup get-tananodes complete");
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
    pushDataToEndpoint(nodes, configuration.config.inbox.tanaapikey)
      .then(() => {
        close();
      });
  }

  function handleTextEdit(event) {
    setData(event.target.value);
    // if we edit the text, we can't push to inbox anymore
    // TODO: reparse edited text into Tana Input API structure
    setDisableSendtoTana(true);
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
            <button onClick={sendToTana} disabled={disableSendtoTana}>Send to Tana</button>
            <button onClick={copyToClipboard}>Copy</button>
          </div>
        </div>

        <TextareaAutosize style={{ width: '100%' }}
          autoFocus={true}
          value={data}
          onChange={handleTextEdit}
        />

      </div>
    );
  }
}

export default ClipPopup
