import React, { useEffect, useState } from "react";
import { TextareaAutosize, Select, MenuItem } from "@mui/material";
import { get_default_configuration, merge_config } from "./Configuration";
import ConfigurationPanel from "~options";

/*
  helper functions related to our use of content.js to do various operations
  and the required messaging back and forth to the React app contained within
  content.js
*/


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
    if (!payload.targetNodeId || !payload.nodes || !payload.nodes.length) {
      console.error("Invalid payload structure:", payload);
      return false;
    }

    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log("Full Response from Tana:", responseData);

    if (response.ok) {
      if (responseData.children?.length > 0) {
        const nodeId = responseData.children[0].nodeId;
        console.log("Successfully created node with ID:", nodeId);
        return true;
      } else {
        console.error("Response missing children array:", responseData);
        return false;
      }
    } else {
      console.error("API Error:", response.status, responseData);
      return false;
    }
  } catch (error) {
    console.error("Network or parsing error:", error);
    return false;
  }
}

// 添加创建supertag的函数
async function createNewSupertag(name: string, description: string, token: string) {
  const payload = {
    targetNodeId: 'SCHEMA',
    nodes: [
      {
        name: name,
        description: description,
        supertags: [{id: 'SYS_T01'}]
      }
    ]
  };

  try {
    await pushDataToEndpoint(payload, token);
    // 成功创建后需要用户手动在Tana客户端获取新supertag的ID
    return true;
  } catch (error) {
    console.error("Failed to create supertag:", error);
    return false;
  }
}

function ClipPopup() {
  const [shouldLoadConfig, setShouldLoadConfig] = useState(true);
  const [configuration, setConfiguration] = useState(get_default_configuration());
  const [data, setData] = useState("");
  const [nodes, setNodes] = useState({});
  const [fetchClipping, setFetchClipping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [disableSendtoTana, setDisableSendtoTana] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // install event handler on load
  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Popup got broadcast: ", message);
      if (message === "selection-changed") {
        setShouldLoadConfig(true);
      }
    });
  }, []);

  // TODO: replace this with plasmo storage API wrapper
  useEffect(() => {
    if (shouldLoadConfig) {
      chrome.storage.sync.get("configuration").then((data) => {
        if (data?.configuration) {
          let new_config = merge_config(configuration, data.configuration);
          console.log("popup loaded  configuration", JSON.stringify(new_config));
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
      console.log("Popup sending get-tananodes with params", JSON.stringify(configuration));
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
    //navigator.clipboard.writeText(data).then(
    // Make this use the background service worker
    // since it's not succeeding from the foreground popup context
    askServiceWorker({ command: "set-clipboard", clipboard: data }).then(
      function () {
        console.error("Successfully copied data to clipboard");
      },
      function (err) {
        console.error("Error copying data to clipboard: ", err);
      }
    );
    close();
  }

  function sendToTana() {
    setIsSending(true);
    const selectedNodes = {
      targetNodeId: nodes.targetNodeId,
      nodes: [nodes.nodes[selectedTagIndex]]
    };
    
    pushDataToEndpoint(selectedNodes, configuration.config.inbox.tanaapikey)
      .then(() => {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 1500);
      })
      .finally(() => {
        setIsSending(false);
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
      <div style={{ width: 600, minHeight: '100%' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <h2>Clip2Tana</h2>
          <div style={{ 
            width: 400, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Select
              value={selectedTagIndex}
              onChange={(e) => setSelectedTagIndex(Number(e.target.value))}
              size="small"
              style={{ minWidth: 120 }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: '80vh',
                    overflow: 'auto'
                  }
                },
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left'
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left'
                },
                sx: {
                  '& .MuiMenu-paper': {
                    width: 'auto',
                    marginTop: '4px'
                  }
                }
              }}
            >
              {configuration.config.inbox.superTags.map((tag, index) => (
                <MenuItem key={index} value={index}>
                  {tag.title || `SuperTag ${index + 1}`}
                </MenuItem>
              ))}
            </Select>
            <button onClick={openOptionsPage}>Settings</button>
            <button 
              onClick={sendToTana} 
              disabled={disableSendtoTana || isSending}
            >
              {isSending ? "Sending..." : "Send to Tana"}
            </button>
            <button onClick={copyToClipboard}>Copy</button>
          </div>
        </div>

        {showSuccess && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            zIndex: 1000
          }}>
            Sent to Tana!
          </div>
        )}

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
