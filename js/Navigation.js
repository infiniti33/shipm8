// React and React-Native are imported for future develoment
import React from 'react';
import { View } from 'react-native';
// import navigation tools so we can render new pages (Container: Used to bundle and set Nav settings, Stack: Used to build Nav settings)
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import reducers from './reducers/index';

import LandingPage from './components/LandingPage';
import Main from './components/Main';
import Launch from './components/Launch';

const store = createStore(
  reducers,
  composeWithDevTools()
);

const MainNavigator = createStackNavigator(
  {
    Launch: Launch,
    ShipM8: LandingPage, // Login Page
    Main: Main, // Landing Page
  },
  {
    initialRouteName: 'Launch',

    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#1589FF',
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
      },
    },
  },
);
const AppContainer = createAppContainer(MainNavigator);

const App = () => {
  return (
    <Provider store={store}>
      <AppContainer />
    </Provider>
  )
}



export default App;
