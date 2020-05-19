module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      alias: {
        api: './src/api',
        assets: './src/assets',
        components: './src/components',
        data: './src/data',
        features: './src/features',
        navigation: './src/navigation',
        reducers: './src/reducers',
        store: './src/store',
        utils: './src/utils',
      }
    }]
  ]
};
