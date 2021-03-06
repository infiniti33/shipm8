import React from 'react';
import { Provider } from 'react-redux';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { store, persistor } from './store/configureStore';
import { PersistGate } from 'redux-persist/integration/react';
import { createStackNavigator } from 'react-navigation-stack';

import Launch from './components/Launch';
import PodInfo from './components/Pods/PodInfo';
import CloudLogin from './components/CloudLogin';
import Loading from './components/common/Loading';
import PodsDisplay from './components/Pods/PodsDisplay';
import AddCluster from './components/Clusters/AddCluster';
import LaunchLoading from './components/common/LaunchLoading';
import ClustersIndex from './components/Clusters/ClustersIndex';

const InitialStack = createStackNavigator(
  {
    'Welcome to ShipM8!': Launch,
    'Cloud Login': CloudLogin,
    'Add Cluster': AddCluster,
  },
  {
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#151B54',
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
      },
    },
  },
);

const AddClusterStack = createStackNavigator(
  {
    'Cloud Login': CloudLogin,
    'Add Cluster': AddCluster,
  },
  {
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#151B54',
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
      },
    },
  },
);

const AppStack = createStackNavigator(
  {
    ShipM8: ClustersIndex,
    Pods: PodsDisplay,
    'Pod Details': PodInfo,
  },
  {
    initialRouteName: 'ShipM8',

    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#151B54',
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
      },
    },
  },
);

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      Loading: LaunchLoading,
      App: AppStack,
      FirstLaunch: InitialStack,
      AddCluster: AddClusterStack,
    },
    {
      initialRouteName: 'Loading',
    }
  )
);

const App = () => {

  return (
    <Provider store={store}>
      <PersistGate
        loading={<Loading />}
        persistor={persistor}>
        <AppContainer />
      </PersistGate>
    </Provider>
  );
};

export default App;
