module.exports = fucnction(api);
{
  api.cache(true);
  return {
    presets: [`babel-presets-expo`],
    plugins: [`react-native-reanimated/plugins`],
  };
}
