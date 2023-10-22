/*
  This is the configuration page for our extension, done
  as a React app.
*/
import React from "react";
import { createRoot } from "react-dom/client";
// import reportWebVitals from "./reportWebVitals";
import ConfigurationPanel from "./ConfigurationPanel";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

// /* 
//   style the injection in the way we want for the
//   purpose of being an "overlay" to the current website
// */
// const globalStyles = document.createElement("style");

// globalStyles.innerHTML = `
// `;

// inject ourselves
// document.body.appendChild(globalStyles);

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ConfigurationPanel />
  </React.StrictMode>
);

// reportWebVitals();