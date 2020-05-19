import { createSlice, createSelector } from '@reduxjs/toolkit';

import K8sApi from 'api/K8sApi';
import AlertUtils from 'utils/AlertUtils';
import { startLoading, loadingFailed } from 'utils/LoadingUtils';
import { getAuthToken, currentNamespaceSelector } from 'features/clusters/ClustersSlice';

const Entities = createSlice({
  name: 'Entities',
  initialState: {
    isLoading: false,
    error: null,
    entities: ['Pods', 'Services'],
    currentEntityTypeIndex: 0,
    current: null,
    pods: {},
    services: {},
  },
  reducers: {
    setCurrentEntity(state, action) {
      const entity = action.payload;
      state.current = entity;
    },
    setCurrentEntityTypeIndex(state, action) {
      const entityIndex = action.payload;
      state.currentEntityTypeIndex = entityIndex;
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
  setCurrentEntityTypeIndex,
  deleteEntityStart,
  deleteEntityFailed,
  deleteEntitySuccess,
  fetchEntitiesStart,
  fetchEntitiesFailed,
  fetchEntitiesSuccess,
} = Entities.actions;

export default Entities.reducer;

// Selectors
export const allEntitiesTypesSelector = state => state.entities.entities;

export const currentEntitySelector = state => state.entities.current;

export const currentEntityTypeIndexSelector = state =>
  state.entities.currentEntityTypeIndex;

export const currentEntityTypeSelector = state =>
  state.entities.entities[state.entities.currentEntityTypeIndex].toLowerCase();

export const entitiesForEntityTypeAndClusterSelector = state =>
  state.entities[
  state.entities.entities[state.entities.currentEntityTypeIndex].toLowerCase()
  ][state.clusters.current];

export const entitiesFilteredByNamespaceSelector = createSelector(
  currentNamespaceSelector,
  entitiesForEntityTypeAndClusterSelector,
  (namespace, entities) => {
    if (entities) {
      return Object.values(entities).filter(entity => {
        if (!namespace || namespace === 'All Namespaces') {
          return true;
        }
        return entity.metadata.namespace === namespace;
      });
    }
    return [];
  },
);

export const entitiesLoadingSelector = state => state.entities.isLoading;

// Thunks
export const fetchEntities = ({ clusterUrl, entityType }) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
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
