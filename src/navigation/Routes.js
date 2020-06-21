import React from 'react';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { TransitionPresets } from '@react-navigation/stack';

import PodInfo from 'screens/PodInfo';
import Loading from 'components/Loading';
import Welcome from 'screens/Welcome';
import CloudLogin from 'screens/CloudLogin';
import AddCluster from 'screens/AddCluster';
import ClustersIndex from 'screens/ClustersIndex';
import EntitiesDisplay from 'screens/EntitiesDisplay';

const RootStack = createStackNavigator();

const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

const RootStackScreen = ({ navigation, route }) => {
  const isReady = useSelector((state) => state.clusters.isReady);
  const gcpSignedIn = useSelector((state) => state.gcp.user !== null);
  const awsSignedIn = useSelector((state) => state.aws.credentials !== null);

  const INITIAL_ROUTE_NAME = awsSignedIn || gcpSignedIn ? 'ShipM8' : 'Welcome';

  if (!isReady) {
    return <Loading />;
  }

  return (
    <RootStack.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#151B54',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}>
      <RootStack.Screen
        name="Welcome"
        component={Welcome}
        options={{
          title: 'Welcome to ShipM8!',
          cardStyleInterpolator: forFade,
        }}
      />
      <RootStack.Screen
        name="ShipM8"
        component={ClustersIndex}
        options={{
          cardStyleInterpolator: forFade,
        }}
      />
      <RootStack.Screen
        name="Cloud Login"
        component={CloudLogin}
        options={{ title: 'Cloud Login' }}
      />
      <RootStack.Screen
        name="Add Cluster"
        component={AddCluster}
        options={{
          title: 'Add Cluster',
          ...TransitionPresets.ModalSlideFromBottomIOS,
          headerBackImage: () => null,
          headerBackTitle: 'Cancel',
          headerBackTitleStyle: {
            marginLeft: 25,
          },
        }}
      />
      <RootStack.Screen
        name="Entities"
        component={EntitiesDisplay}
        options={{
          headerBackTitle: ' ',
        }}
      />
      <RootStack.Screen name="Pod Details" component={PodInfo} />
    </RootStack.Navigator>
  );
};

export default RootStackScreen;
