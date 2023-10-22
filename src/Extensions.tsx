/*

  This file is the extension integration point
  that exposes the config elements to the rest of the extension

  Add your new extensions here to "hook them in" to the 
  rest of the extension.
*/

import { Configuration } from "./ConfigurationTypes";
import { clip2tanaConfiguration } from "./Clip2Tana";

export const initial_config: Configuration = {
  ...clip2tanaConfiguration
};

