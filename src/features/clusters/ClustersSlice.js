import { createSlice, createSelector } from '@reduxjs/toolkit';

import {
  setTokenExpiration,
  gcpClustersSelector,
  gcpLoadingSelector,
} from 'features/gcp/GoogleCloudSlice';
import AwsApi from 'api/AwsApi';
import K8sApi from 'api/K8sApi';
import GoogleCloudApi from 'api/GoogleCloudApi';
import { awsClustersSelector, awsLoadingSelector } from 'features/aws/AwsSlice';
import { startLoading, loadingFailed } from 'utils/LoadingUtils';

const Clusters = createSlice({
  name: 'Clusters',
  initialState: {
    isReady: true,
    isLoading: false,
    current: null,
    error: null,
    currentProvider: null,
    byUrl: {},
  },
  reducers: {
    addCluster(state, action) {
      const clusterToAdd = action.payload;
      state.byUrl[clusterToAdd.url] = clusterToAdd;
    },
    removeCluster(state, action) {
      const clusterToRemove = action.payload;
      delete state.byUrl[clusterToRemove.url];
    },
    updateCluster(state, action) {
      const updatedCluster = action.payload;
      state.byUrl[updatedCluster.url] = updatedCluster;
    },
    setCurrentCluster(state, action) {
      const selectedCluster = action.payload;
      state.current = selectedCluster.url;
    },
    setCurrentNamespace(state, action) {
      const { cluster, namespace } = action.payload;
      state.byUrl[cluster.url].currentNamespace = namespace;
    },
    setCurrentProvider(state, action) {
      const provider = action.payload;
      state.currentProvider = provider;
    },
    getAuthTokenFailed: loadingFailed,
    getAuthTokenSuccess(state, action) {
      const { cluster, token, tokenExpiration } = action.payload;
      if (tokenExpiration) {
        state.byUrl[cluster.url].tokenExpiration = tokenExpiration;
      }
      state.byUrl[cluster.url].token = token;
    },
    checkClusterStart(state, action) {
      const cluster = action.payload;
      state.byUrl[cluster.url].status = 'CHECKING';
    },
    checkClusterSuccess(state, action) {
      const { cluster, up, response } = action.payload;
      if (state.byUrl[cluster.url]) {
        let newStatus = up ? 'RUNNING' : 'DOWN';
        if (response === 'Unauthorized') {
          newStatus = 'UNAUTHORIZED';
        }
        state.byUrl[cluster.url].status = newStatus;
      }
    },
    fetchNamespacesStart: startLoading,
    fetchNamespacesFailed: loadingFailed,
    fetchNamespacesSuccess(state, action) {
      const { cluster, namespaces } = action.payload;
      state.byUrl[cluster.url].namespaces = namespaces;
      state.isLoading = false;
    },
  },
});

export const {
  addCluster,
  checkClusterStart,
  checkClusterSuccess,
  fetchNamespacesStart,
  fetchNamespacesSuccess,
  fetchNamespacesFailed,
  getAuthTokenSuccess,
  getAuthTokenFailed,
  removeCluster,
  setCurrentCluster,
  setCurrentNamespace,
  setCurrentProvider,
  updateCluster,
} = Clusters.actions;

export default Clusters.reducer;

// Selectors
export const allClustersSelector = state => state.clusters.byUrl;

export const currentClusterSelector = state =>
  state.clusters.byUrl[state.clusters.current];

export const currentNamespaceSelector = state =>
  state.clusters.byUrl[state.clusters.current].currentNamespace;

export const currentProviderSelector = state => state.clusters.currentProvider;

export const currentProviderLoadingSelector = createSelector(
  currentProviderSelector,
  awsLoadingSelector,
  gcpLoadingSelector,
  (provider, awsLoading, gcpLoading) => {
    if (provider === 'aws') {
      return awsLoading;
    }
    if (provider === 'gcp') {
      return gcpLoading;
    }
  },
);

export const clustersForCurrentProviderSelector = createSelector(
  currentProviderSelector,
  awsClustersSelector,
  gcpClustersSelector,
  (cloudProvider, awsClusters, gcpClusters) => {
    if (cloudProvider === 'aws' && awsClusters) {
      return awsClusters;
    }
    if (cloudProvider === 'gcp' && gcpClusters) {
      return gcpClusters;
    }
    return [];
  },
);

export const clustersFilteredByCloudProviderSelector = createSelector(
  currentProviderSelector,
  allClustersSelector,
  (cloudProvider, clusters) => {
    return Object.values(clusters).filter(
      cluster => cluster.cloudProvider === cloudProvider,
    );
  },
);

// Thunks
export const checkClusters = () => async (dispatch, getState) => {
  const state = getState();
  const clusters = Object.values(state.clusters.byUrl);
  return Promise.all(
    clusters.map(cluster => {
      return dispatch(checkCluster(cluster));
    }),
  );
};

export const checkCluster = cluster => async dispatch => {
  dispatch(checkClusterStart(cluster));
  const { up, response } = await K8sApi.checkCluster(cluster);
  dispatch(checkClusterSuccess({ cluster, up, response }));
  return Promise.resolve();
};

export const fetchNamespaces = cluster => async dispatch => {
  try {
    dispatch(fetchNamespacesStart());
    const clusterWithToken = await dispatch(getAuthToken(cluster));
    const namespaces = await K8sApi.fetchNamespaces(clusterWithToken);
    dispatch(fetchNamespacesSuccess({ cluster: clusterWithToken, namespaces }));
  } catch (err) {
    dispatch(fetchNamespacesFailed(err.toString()));
    return Promise.reject(err);
  }
};

export const getAuthToken = cluster => async (dispatch, getState) => {
  try {
    let state = getState();
    let token;
    if (cluster.cloudProvider === 'aws') {
      token = AwsApi.getAuthToken(cluster.name, state.aws.credentials);
    }
    if (cluster.cloudProvider === 'gcp') {
      if (
        // If access token does not exist,
        // Or token expiration is not set or has expired
        !cluster.token ||
        !state.gcp.user.tokenExpiration ||
        state.gcp.user.tokenExpiration - Date.now() <= 60 * 1000
      ) {
        // Fetch new token and reset expiration
        token = await GoogleCloudApi.refreshAccessToken(
          state.gcp.user.refreshToken,
        );
        dispatch(setTokenExpiration(Date.now() + 3600 * 1000));
      } else {
        // Otherwise, use existing token
        token = cluster.token;
      }
    }
    dispatch(getAuthTokenSuccess({ cluster, token }));
    state = getState();
    return state.clusters.byUrl[cluster.url];
  } catch (err) {
    dispatch(getAuthTokenFailed(err.toString()));
    return Promise.reject(err);
  }
};
