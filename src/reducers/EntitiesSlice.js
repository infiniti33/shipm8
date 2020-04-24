import { createSlice } from '@reduxjs/toolkit';

import K8sApi from '../api/K8sApi';
import AlertUtils from '../utils/AlertUtils';
import { getAuthToken } from './ClustersSlice';
import { startLoading, loadingFailed } from '../utils/LoadingUtils';

const Entities = createSlice({
  name: 'Entities',
  initialState: {
    isLoading: false,
    error: null,
    entities: ['Pods', 'Services'],
    currentEntityIndex: 0,
    pods: {
      current: null,
    },
    services: {
      current: null,
    },
  },
  reducers: {
    setCurrentEntity(state, action) {
      const { entity, entityType } = action.payload;
      state[entityType].current = entity.metadata.uid;
    },
    setCurrentEntityType(state, action) {
      const entityIndex = action.payload;
      state.currentEntityIndex = entityIndex;
    },
    deleteEntityStart: startLoading,
    deleteEntityFailed: loadingFailed,
    deleteEntitySuccess(state, action) {
      const { cluster, entityType, uid } = action.payload;
      delete state[entityType][cluster.url][uid];
      state.isLoading = false;
    },
    fetchEntitiesStart: startLoading,
    fetchEntitiesFailed: loadingFailed,
    fetchEntitiesSuccess(state, action) {
      const { cluster, entities, entityType } = action.payload;
      state[entityType][cluster.url] = entities;
      state.isLoading = false;
    },
  },
});

export const {
  setCurrentEntity,
  setCurrentEntityType,
  deleteEntityStart,
  deleteEntityFailed,
  deleteEntitySuccess,
  fetchEntitiesStart,
  fetchEntitiesFailed,
  fetchEntitiesSuccess,
} = Entities.actions;

export default Entities.reducer;

// Thunks
export const fetchEntities = ({ clusterUrl, entityType }) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    if (state.isLoading) {
      return;
    }
    const cluster = state.clusters.byUrl[clusterUrl];
    dispatch(fetchEntitiesStart());
    const clusterWithAuth = await dispatch(getAuthToken(cluster));
    const response = await K8sApi.fetchEntities({
      cluster: clusterWithAuth,
      entityType,
    });
    const entities = {};
    response.items.forEach(entity => {
      entity.kind = entityType;
      entities[entity.metadata.uid] = entity;
    });
    dispatch(fetchEntitiesSuccess({ cluster, entities, entityType }));
    return Promise.resolve();
  } catch (err) {
    dispatch(fetchEntitiesFailed(err.toString()));
  }
};

export const deleteEntity = ({
  cluster,
  entity,
  entityType,
}) => async dispatch => {
  try {
    dispatch(deleteEntityStart());
    const clusterWithAuth = await dispatch(getAuthToken(cluster));
    const response = await K8sApi.deleteEntity({
      clusterWithAuth,
      entity,
      entityType,
    });
    if (response.kind === 'Pod') {
      const uid = response.metadata.uid;
      dispatch(deleteEntitySuccess({ cluster, uid }));
      return AlertUtils.deleteSuccessAlert(entity);
    } else {
      return AlertUtils.deleteFailedAlert(response);
    }
  } catch (err) {
    dispatch(deleteEntityFailed(err.toString()));
  }
};
