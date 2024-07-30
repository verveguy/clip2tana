/*
  This is a React based app which is the Options page
  for our Chrome Extension. It allows the user to set 
  various default configuration options including 
  the Tana supertag to use, the Tana API key, etc.
*/

import React, { useEffect, useState } from "react";
import { FormControlLabel, FormGroup, IconButton, Switch, TextField } from "@mui/material";
import { initial_config, merge_config } from "./Configuration";

const ConfigurationPanel = ({ closeHandler }) => {
  const [savedState, setSavedState] = useState("Initial");
  const [shouldLoadConfig, setShouldLoadConfig] = useState(true);
  const [configuration, setConfiguration] = useState(initial_config);

  const saveConfiguration = (section: string, property: string, newValue: any) => {
    let newconfig = configuration;
    newconfig.config[section][property] = newValue;
    setSavedState("saving");
    chrome.storage.sync.set({ configuration }).then(() => {
      // update local react state
      setConfiguration(newconfig);
      setSavedState("saved");
    });
  }

  const handleToggle = (section: string, property: string,) => {
    let currentValue: boolean = configuration.config[section][property];
    saveConfiguration(section, property, !currentValue);
  }

  // TODO: replace this with plasmo storage API wrapper
  useEffect(() => {
    chrome.storage.sync.get("configuration").then((data) => {
      let new_config = configuration;
      console.log("Initial config", new_config);
      if (data?.configuration) {
        console.log("Options retrieved configuration", data.configuration);
        new_config = merge_config(initial_config, data.configuration);
      }
      console.log("Using configuration", new_config);
      setConfiguration(new_config);
      setShouldLoadConfig(false);
    });
  }, [shouldLoadConfig]);

  function resetToDefaults() {
    setSavedState("saving");
    let configuration = initial_config;
    chrome.storage.sync.set({ configuration }).then(() => {
      console.log("Reset default configuration", initial_config);
      setConfiguration(initial_config);
      setSavedState("saved");
    });
  }


  // super simple React UI at this point
  let count = 0;

  if (shouldLoadConfig) {
    return <div>Loading...</div>
  }
  else {
    return (
      <div style={{ width: 600, height:'100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Configuration for clip2tana</h2>
          <div style={{ height: 20, width: 200, display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={resetToDefaults}>Defaults</button>
            <button onClick={closeHandler}>Done</button>
          </div>
        </div>
        <FormGroup>
          {configuration.schema.map((schema_elem, i) => {
            count++;
            let config = configuration.config[schema_elem.key];
            return (
              <div key={i}>
                <h2>{schema_elem.label}</h2>
                {schema_elem.properties.map((property_elem, j) => {
                  if (property_elem.type == "string") {
                    return (
                      <div key={j}>
                        <TextField style={{ width: '100%' }}
                          autoFocus={count != 1}
                          value={config[property_elem.key]}
                          onChange={e => saveConfiguration(schema_elem.key, property_elem.key, e.target.value)}
                          variant="outlined"
                          label={property_elem.label}
                        />
                        <div style={{ height: '12px' }} />
                      </div>
                    )
                  }
                  else if (property_elem.type == "boolean") {
                    return (
                      <div key={j}>
                        <FormControlLabel style={{ width: '100%' }}
                          control={
                            <Switch
                              checked={config[property_elem.key] == true}
                              onChange={e => handleToggle(schema_elem.key, property_elem.key)}
                            />}
                          label={property_elem.label}
                        />
                        <div style={{ height: '12px' }} />
                      </div>
                    )
                  }
                })}
              </div>
            )
          })}
        </FormGroup>
      </div>
    );
  }
}


export default ConfigurationPanel;
