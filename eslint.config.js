const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      "react-hooks/refs": "off",
      "react/no-unknown-property": "off",
    },
  },
]);
