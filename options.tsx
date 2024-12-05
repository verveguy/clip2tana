/*
  This is a React based app which is the Options page
  for our Chrome Extension. It allows the user to set 
  various default configuration options including 
  the Tana supertag to use, the Tana API key, etc.

  TODO: replace all of this custom form handling with
  the formik library.
*/

import React, { useEffect, useRef, useState } from "react";
import { FormControlLabel, FormGroup, IconButton, Switch, TextField, Card, Typography, Box, Button, Tabs, Tab } from "@mui/material";
import { get_default_configuration, merge_config } from "./Configuration";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ConfigurationPanel = ({ closeHandler }) => {
  const [savedState, setSavedState] = useState("Initial");
  const [shouldLoadConfig, setShouldLoadConfig] = useState(true);
  const [configuration, setConfiguration] = useState(get_default_configuration());
  const divRef = useRef();

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
        new_config = merge_config(get_default_configuration(), data.configuration);
      }
      console.log("Using configuration", new_config);
      setConfiguration(new_config);
      setShouldLoadConfig(false);
    });
  }, [shouldLoadConfig]);

  function resetToDefaults() {
    setSavedState("saving");
    let configuration = get_default_configuration();
    chrome.storage.sync.set({ configuration }).then(() => {
      console.log("Reset default configuration", configuration);
      setConfiguration(get_default_configuration());
      setSavedState("saved");
    });
  }

  // scroll to the top, since we seem to start at the bottom...?
  useEffect(() => {
    const {current} = divRef;
     if (current) {
       current.scrollIntoView({behavior: "smooth"})
     }
  }, [shouldLoadConfig]);

  // super simple React UI at this point
  let count = 0;

  const handleUpdateSuperTag = (index: number, updatedTag: any) => {
    let newconfig = {...configuration};
    newconfig.config.inbox.superTags[index] = updatedTag;
    setSavedState("saving");
    chrome.storage.sync.set({ configuration: newconfig }).then(() => {
      setConfiguration(newconfig);
      setSavedState("saved");
    });
  };

  const handleAddSuperTag = () => {
    let newconfig = {...configuration};
    newconfig.config.inbox.superTags.push({
      id: '',
      title: '',
      fields: []
    });
    setSavedState("saving");
    chrome.storage.sync.set({ configuration: newconfig }).then(() => {
      setConfiguration(newconfig);
      setSavedState("saved");
    });
  };

  const handleDeleteSuperTag = (index: number) => {
    let newconfig = {...configuration};
    newconfig.config.inbox.superTags.splice(index, 1);
    setSavedState("saving");
    chrome.storage.sync.set({ configuration: newconfig }).then(() => {
      setConfiguration(newconfig);
      setSavedState("saved");
    });
  };

  if (shouldLoadConfig) {
    return <div>Loading...</div>
  }
  else {
    return (
      <div style={{ width: 600, height:'100%' }} ref={divRef}>
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
                {schema_elem.key === 'inbox' ? (
                  <>
                    {schema_elem.properties
                      .filter(prop => ['pushinbox', 'tanaapikey'].includes(prop.key))
                      .map((property_elem, j) => {
                        if (property_elem.type === "boolean") {
                          return (
                            <div key={j}>
                              <FormControlLabel
                                style={{ width: '100%' }}
                                control={
                                  <Switch
                                    checked={config[property_elem.key] === true}
                                    onChange={e => handleToggle(schema_elem.key, property_elem.key)}
                                  />
                                }
                                label={property_elem.label}
                                disabled={property_elem.disabled}
                              />
                              <div style={{ height: '12px' }} />
                            </div>
                          );
                        } else if (property_elem.type === "string") {
                          return (
                            <div key={j}>
                              <TextField
                                style={{ width: '100%' }}
                                value={config[property_elem.key]}
                                onChange={e => saveConfiguration(schema_elem.key, property_elem.key, e.target.value)}
                                variant="outlined"
                                label={property_elem.label}
                                disabled={property_elem.disabled}
                              />
                              <div style={{ height: '12px' }} />
                            </div>
                          );
                        }
                      })}
                    
                    <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>Super Tags</Typography>
                    {config.superTags?.length > 0 ? (
                      <SuperTagCard
                        superTags={config.superTags}
                        onUpdate={handleUpdateSuperTag}
                        onDelete={handleDeleteSuperTag}
                        onAdd={handleAddSuperTag}
                      />
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddSuperTag}
                        size="small"
                      >
                        Add First Super Tag
                      </Button>
                    )}
                  </>
                ) : (
                  schema_elem.properties.map((property_elem, j) => {
                    if (property_elem.type == "string") {
                      return (
                        <div key={j}>
                          <TextField style={{ width: '100%' }}
                            autoFocus={count != 1}
                            value={config[property_elem.key]}
                            onChange={e => saveConfiguration(schema_elem.key, property_elem.key, e.target.value)}
                            variant="outlined"
                            label={property_elem.label}
                            disabled={property_elem.disabled}
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
                            disabled={property_elem.disabled}
                          />
                          <div style={{ height: '12px' }} />
                        </div>
                      )
                    }
                  })
                )}
              </div>
            )
          })}
        </FormGroup>
      </div>
    );
  }
}

const SuperTagCard = ({ superTags, onUpdate, onDelete, onAdd }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // 当前选中的 superTag
  const currentTag = superTags[selectedTab];

  return (
    <Card sx={{ mb: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {superTags.map((tag, index) => (
            <Tab 
              key={index} 
              label={tag.title || `Tag ${index + 1}`}
              sx={{ minHeight: '48px' }}
            />
          ))}
          <Tab 
            icon={<AddIcon />} 
            aria-label="add tag"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            sx={{ minWidth: '48px', minHeight: '48px' }}
          />
        </Tabs>
      </Box>

      {currentTag && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              {currentTag.title || `Super Tag ${selectedTab + 1}`}
            </Typography>
            <IconButton 
              color="error" 
              onClick={() => onDelete(selectedTab)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <TextField
            label="Super Tag Title"
            value={currentTag.title}
            onChange={(e) => onUpdate(selectedTab, { ...currentTag, title: e.target.value })}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Super Tag ID"
            value={currentTag.id}
            onChange={(e) => onUpdate(selectedTab, { ...currentTag, id: e.target.value })}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Fields</Typography>
          {currentTag.fields.map((field, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="Field ID"
                value={field.id}
                onChange={(e) => {
                  const newFields = [...currentTag.fields];
                  newFields[index] = { id: e.target.value };
                  onUpdate(selectedTab, { ...currentTag, fields: newFields });
                }}
                fullWidth
                size="small"
              />
              <IconButton 
                onClick={() => {
                  const newFields = currentTag.fields.filter((_, i) => i !== index);
                  onUpdate(selectedTab, { ...currentTag, fields: newFields });
                }}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            onClick={() => onUpdate(selectedTab, {
              ...currentTag,
              fields: [...currentTag.fields, { id: '' }]
            })}
            size="small"
            sx={{ mt: 1 }}
          >
            Add Field
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default ConfigurationPanel;
