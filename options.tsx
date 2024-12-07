/*
  This is a React based app which is the Options page
  for our Chrome Extension. It allows the user to set 
  various default configuration options including 
  the Tana supertag to use, the Tana API key, etc.

  TODO: replace all of this custom form handling with
  the formik library.
*/

import React, { useEffect, useRef, useState, useCallback } from "react";
import { FormControlLabel, FormGroup, IconButton, Switch, TextField, Card, Typography, Box, Button, Tabs, Tab, Select, MenuItem } from "@mui/material";
import { get_default_configuration, merge_config } from "./Configuration";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { endpointUrl } from "~background";

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
    console.log("Handling update for tag at index:", index);
    console.log("Updated tag data:", updatedTag);
    
    let newconfig = {...configuration};
    newconfig.config.inbox.superTags[index] = updatedTag;
    
    console.log("New configuration:", newconfig);
    
    setSavedState("saving");
    chrome.storage.sync.set({ configuration: newconfig }).then(() => {
      setConfiguration(newconfig);
      setSavedState("saved");
    });
  };

  const handleAddSuperTag = async (setSelectedTab: (index: number) => void) => {
    const newTag = {
      id: '',
      title: '',
      fields: []
    };

    let newconfig = {...configuration};
    newconfig.config.inbox.superTags.push(newTag);
    setSavedState("saving");
    chrome.storage.sync.set({ configuration: newconfig }).then(() => {
      setConfiguration(newconfig);
      setSavedState("saved");
      setSelectedTab(newconfig.config.inbox.superTags.length - 1);
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
      <div style={{ 
        width: 600, 
        height:'100%',
      }} ref={divRef}>
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
                        configuration={configuration}
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

const SuperTagCard = ({ superTags, onUpdate, onDelete, onAdd, configuration }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // 当前选中的 superTag
  const currentTag = superTags[selectedTab];

  const handleCreateSuperTag = async (index: number, title: string, currentTag: any) => {
    if (!title.trim() || !configuration.config.inbox.tanaapikey || isCreating) {
      return;
    }

    setIsCreating(true);
    setCreateStatus('creating');
    
    try {
      const payload = {
        targetNodeId: 'SCHEMA',
        nodes: [{
          name: title.trim(),
          supertags: [{ id: 'SYS_T01' }]
        }]
      };

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: 'Bearer ' + configuration.config.inbox.tanaapikey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        if (!errorBody.includes("already exists")) {
          console.error("Failed to create supertag:", errorBody);
          setCreateStatus('error');
          return;
        }
      }

      // 获取响应数据
      const responseData = await response.json();
      console.log("Response data:", responseData);
      
      // 从响应中获取 children 数组的第一个元素
      const createdNode = responseData.children[0];
      console.log("Created node:", createdNode);
      
      if (createdNode && createdNode.nodeId) {
        console.log("Creating super tag with nodeId:", createdNode.nodeId);
        console.log("Current tag before update:", currentTag);
        
        // 更新 currentTag，包含新的 nodeId 作为 id
        const updatedTag = { 
          ...currentTag, 
          title: title.trim(),
          id: createdNode.nodeId 
        };
        
        console.log("Updated tag:", updatedTag);
        onUpdate(index, updatedTag);
        
        setCreateStatus('success');
      } else {
        console.error("No nodeId found in response");
        setCreateStatus('error');
      }
      
      setTimeout(() => {
        setCreateStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error("Error creating supertag:", error);
      setCreateStatus('error');
    } finally {
      setIsCreating(false);
    }
  };

  const getHelperText = () => {
    switch (createStatus) {
      case 'creating':
        return "Creating super tag...";
      case 'success':
        return "Super tag created successfully!";
      case 'error':
        return "Failed to create super tag";
      default:
        return "";
    }
  };

  const getHelperTextColor = () => {
    switch (createStatus) {
      case 'creating':
        return 'text.secondary';
      case 'success':
        return 'success.main';
      case 'error':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <Box sx={{  borderColor: 'divider' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          width: '100%',
          padding: '16px',
          position: 'relative'
        }}>
          <Select
            value={selectedTab}
            onChange={(e) => setSelectedTab(Number(e.target.value))}
            size="small"
            sx={{ 
              minWidth: 200,
              width: 300,
              '& .MuiSelect-select': {
                width: '100%',
                paddingRight: '32px'
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  width: 300,
                  maxHeight: 300
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
              disablePortal: true,
              slotProps: {
                paper: {
                  sx: {
                    position: 'absolute',
                    zIndex: 1300
                  }
                }
              }
            }}
          >
            {superTags.map((tag, index) => (
              <MenuItem 
                key={index} 
                value={index}
                sx={{ 
                  width: '100%',  // 确保菜单项宽度一致
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {tag.title || `Tag ${index + 1}`}
              </MenuItem>
            ))}
          </Select>
          <IconButton 
            onClick={() => onAdd(setSelectedTab)}
            size="small"
            color="primary"
            sx={{ flexShrink: 0 }}  // 防止按钮被压缩
          >
            <AddIcon />
          </IconButton>
        </Box>
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
            onChange={(e) => {
              onUpdate(selectedTab, { ...currentTag, title: e.target.value });
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                console.log("Enter key pressed");
                e.preventDefault();
                handleCreateSuperTag(selectedTab, currentTag.title, currentTag);
              }
            }}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            disabled={isCreating}
            helperText={getHelperText() || "Press Enter to create"}
            FormHelperTextProps={{
              sx: { color: getHelperTextColor() }
            }}
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
          
          <Typography 
            variant="caption" 
            color="textSecondary" 
            sx={{ 
              display: 'block', 
              mt: 2, 
              mb: 1,
              '& ol': {
                margin: '8px 0 0 0',
                paddingLeft: '20px'
              },
              '& li': {
                marginBottom: '4px'
              }
            }}
          >
            Note: For new Super Tags, you need to get the ID from Tana client:
            <ol>
              <li>Open the supertag configuration panel in Tana</li>
              <li>Run "Show API Schema" command on the supertag title</li>
              <li>Copy the ID and paste it into the "Super Tag ID" field above</li>
            </ol>
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default ConfigurationPanel;
