// jest.config.js
import { defaults } from "jest-config";

export default {
  // Add .mjs to the module file extensions Jest should consider
  moduleFileExtensions: [...defaults.moduleFileExtensions, "mjs"],

  // Update testMatch to include .mjs files
  testMatch: [...defaults.testMatch, "**/?(*.)+(spec|test).mjs"],

  // If you are using 'type': 'module' in your package.json,
  // Jest might need this to handle transformations correctly.
  // This tells Jest not to transform any modules, assuming Node.js handles ESM.
  // If you run into issues with import/export syntax in your *source* files,
  // you might need a Babel setup here.
  transform: {},
};
