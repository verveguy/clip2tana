# clip2tana

Clips current webpage and selection to tana-paste format

# Installing without building
If you just want to use this extension without bothering with the source code and all that jazz, you can download the latest `release.zip` file from the `Releases` area (right hand side of the github project page). Then, go to the Chrome extension manager (`chrome://extensions`) and turn on `Developer mode`. This will give you access to `Load unpacked` button and you can pick the downloaded zip file.

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
