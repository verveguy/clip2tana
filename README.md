# clip2tana

Clips current webpage and selection to tana-paste format


# How It Works

The utility grabs the following information for the current tab:
- Page Title
- URL
- Meta tags
  - og:description
  - og:title
  - og:url
  - og:type
  - og:image
  - og:site_name
- <any selected text>

The utility then checks the URL (<href.origin>) to see if the current tab is the root of the site or not. This allows multiple 'web pages' to be tied to a single root 'website' using a Part Of relationship in Tana.

It also determines the 'type' of page by checking the og:type tag and parsing the URL for a filename or extension, then sets one of the following supertags for the node:
- #article
- #book
- #video
- #document (anything with an extension, other than .html)
- #web-page (default)
- #website (only for the origin site)

Then the information is formatted as a Tana Paste entry and copied to the clipboard.

# Formatting

The basic Tana Paste data copied to the clipboard is the following:

```
%%tana%%
- Origin site title #website
  - Title:: <og:site_name or 'Website at href.origin.hostname'>
  - URL:: <href.origin>
  - Hostname:: <href.origin.hostname>


- Title of current tab #<supertag>
  - Title:: <of current tab>
  - URL:: <of current tab>
  - Description:: <from site metadata>
  - Part Of Website:: [[<Tana reference to origin node above>]]
  - Highlights
    - <any selected text>
    - <line breaks are preserved for multiple lines>
```

For posterity's sake, if the original meta tag differs from the cleaned up version, both will be included on their own lines. (i.e. - Description:: <cleaned up description> and - og:Description:: <original unchanged meta tag> may both be listed so you can compare them.)


# Installing without building
If you just want to use this extension without bothering with the source code and all that jazz, you can download the latest `release.zip` file from the `Releases` area (right hand side of the github project page). Then, go to the Chrome extension manager (`chrome://extensions`) and turn on `Developer mode`. This will give you access to the `Load unpacked` button and you can pick the downloaded zip file.

# Building from source
To bootstrap this git repo into Chrome locally, first clone the repo.
Then run `npm install` and `npm run build`. 
Go to Chrome extension manager, turn on Developer mode and `load unpacked` the `dist` directory.

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

This extension was created with [Extension CLI](https://oss.mobilefirst.me/extension-cli/)!

If you find this software helpful [star](https://github.com/MobileFirstLLC/extension-cli/) or [sponsor](https://github.com/sponsors/MobileFirstLLC) this project.


### Available Commands

| Commands | Description |
| --- | --- |
| `npm run start` | build extension, watch file changes |
| `npm run build` | generate release version |
| `npm run docs` | generate source code docs |
| `npm run clean` | remove temporary files |
| `npm run test` | run unit tests |
| `npm run sync` | update config files |

For CLI instructions see [User Guide &rarr;](https://oss.mobilefirst.me/extension-cli/)

### Learn More

**Extension Developer guides**

- [Getting started with extension development](https://developer.chrome.com/extensions/getstarted)
- Manifest configuration: [version 2](https://developer.chrome.com/extensions/manifest) - [version 3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Permissions reference](https://developer.chrome.com/extensions/declare_permissions)
- [Chrome API reference](https://developer.chrome.com/docs/extensions/reference/)

**Extension Publishing Guides**

- [Publishing for Chrome](https://developer.chrome.com/webstore/publish)
- [Publishing for Edge](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension)
- [Publishing for Opera addons](https://dev.opera.com/extensions/publishing-guidelines/)
- [Publishing for Firefox](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)


# JB Notes To Self:
- Build using `npm run build` for Chrome
- Go to Chrome extension manager and `load unpacked` the `dist` directory to update extension
- Run `xcrun safari-web-extension-converter <path to extension>` in terminal to convert for Safari (or manually copy changes to previously converted XCode project)
- Build XCode project