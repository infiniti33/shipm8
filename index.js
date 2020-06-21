/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src';
import { name as appName } from './app.json';

if (__DEV__) {
  console.disableYellowBox = true;
}

AppRegistry.registerComponent(appName, () => App);
