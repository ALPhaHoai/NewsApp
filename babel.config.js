module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@components': './components',
          '@utils': './utils',
          '@store': './store',
          '@type': './type',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
