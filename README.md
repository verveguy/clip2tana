# clip2tana

Clips current webpage and selection to Tana.

Two clipping modes are available: copy to the clipboard in tana-paste format or push to the Tana Inbox directly.

Tana paste is the easiest, with minimal configuration required.

Tana Inbox uses the Tana Input API which needs you to copy various nodeIDs and provide your Tana API Key.

## Usage
There are two invocation options: 
1. clip silently with the default keyboard accelerator of cmd-shift-P. (Change this in chrome://extensions/shortcuts)
2. interactive clipping by clicking on the extension icon. This also allows access to settings.
   
Note: clicking the extension icon allows you to edit the clipping. However, if you do, you cannot (yet) push it directly to the Tana Inbox. (The button will disable). You can still copy to the clipboard and then paste into Tana.

## Settings
You can access the settings panel by clicking on the extension icon and choosing settings.

## Tana Inbox
You should have a supertag set up in Tana that has a field `URL`. Choose "configure supertag" in Tana and then, with the cursor in the supertag name, use the `Show API Schema` command to find out the node ID or your supertag and the node ID for the URL field you created. (It doesn't have to be called URL...you just need a field's node ID)

### Limitations of Tana Inbox push
The Tana Input API is limited to 8000 characters in a single operation, and is also rate-limited. It can also have a short delay, sometimes longer, before you clipping shows up in Tana. Check the Developer Console to see what might be going on if your clippings aren't making it into Tana. Please file any suspected bug reports as issues here in github.

## Installing without building
If you just want to use this extension without bothering with the source code and all that jazz, you can download the latest `release.zip` file from the `Releases` area (right hand side of the github project page). Then, go to the Chrome extension manager (`chrome://extensions`) and turn on `Developer mode`. This will give you access to the `Load unpacked` button and you can pick the downloaded zip file.

## Building from source
To bootstrap this git repo into Chrome locally, first clone the repo.
Then run `yarn install` and `yarn build`. 
Go to Chrome extension manager, turn on Developer mode and `load unpacked` from the `build` directory.

The format used on the clipboard is very simple:

```
%%tana%%
- Title of site #website
  - Description:: <from site metadata>
  - Url:: <of open tab>
  - <any selected text>
```

Note that selections in Google Docs and Office365 docs do NOT work. (See issues)

## Development 

This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

For further guidance, [visit the Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
yarn build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

