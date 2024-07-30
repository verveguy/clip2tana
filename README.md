# clip2tana

Clips current webpage and selection to tana-paste format

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

This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!

