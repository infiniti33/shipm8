import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { store, persistor } from 'store/configureStore';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';

import Loading from 'components/Loading';
import Routes from 'navigation/Routes';

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <StatusBar barStyle="light-content" backgroundColor="#6a51ae" />
          <Routes />
        </PersistGate>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
