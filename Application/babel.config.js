// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    prebuild: ["react-native-worklets/plugin"],
    compact: false,
    overrides: [
      {
        compact: true,
        minified: true,
        comments: false,
        retainLines: false,
        generatorOpts: {
          compact: false,
          retainLines: false,
          shouldPrintComment: () => false,
          auxiliaryCommentBefore: null,
          auxiliaryCommentAfter: null,
        },
      },
    ],
  };
};
