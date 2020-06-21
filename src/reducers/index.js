import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import awsReducer from 'reducers/AwsSlice';
import gcpReducer from 'reducers/GoogleCloudSlice';
import entitiesReducer from 'reducers/EntitiesSlice';
import clustersReducer from 'reducers/ClustersSlice';

const awsPersistConfig = {
  key: 'aws',
  storage: AsyncStorage,
  whitelist: ['credentials'],
  stateReconciler: autoMergeLevel2,
};

const gcpPersistConfig = {
  key: 'gcp',
  storage: AsyncStorage,
  whitelist: ['user'],
  stateReconciler: autoMergeLevel2,
};

const clustersPersistConfig = {
  key: 'clusters',
  storage: AsyncStorage,
  blacklist: ['isLoading', 'error'],
  stateReconciler: autoMergeLevel2,
};

const rootReducer = combineReducers({
  clusters: persistReducer(clustersPersistConfig, clustersReducer),
  aws: persistReducer(awsPersistConfig, awsReducer),
  gcp: persistReducer(gcpPersistConfig, gcpReducer),
  entities: entitiesReducer,
});

export default rootReducer;
