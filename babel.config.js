module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          api: './src/api',
          assets: './src/assets',
          components: './src/components',
          data: './src/data',
          navigation: './src/navigation',
          reducers: './src/reducers',
          screens: './src/screens',
          store: './src/store',
          utils: './src/utils',
        },
      },
    ],
  ],
};
