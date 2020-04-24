import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from 'react-native-material-dropdown';
import EStyleSheet from 'react-native-extended-stylesheet';

import {
  deleteEntity,
  fetchEntities,
  setCurrentEntity,
  setCurrentEntityType,
} from '../../reducers/EntitiesSlice';
import Loading from '../common/Loading';
import AlertUtils from '../../utils/AlertUtils';
import SwipeableList from '../common/SwipeableList';
import EntitiesSegmentedTabs from '../common/SegmentedTabs';
import { setCurrentNamespace } from '../../reducers/ClustersSlice';

const EntitiesDisplay = ({ navigation, route }) => {
  navigation.setOptions({
    title: route.params.title,
  });

  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeTabIndex = useSelector(
    state => state.entities.currentEntityIndex,
  );
  const tabs = useSelector(state => state.entities.entities);
  const isLoading = useSelector(state => state.entities.isLoading);
  const cluster = useSelector(
    state => state.clusters.byUrl[state.clusters.current],
  );
  const currentNamespace = useSelector(
    state => state.clusters.byUrl[state.clusters.current].currentNamespace,
  );
  const entityType = useSelector(state =>
    state.entities.entities[state.entities.currentEntityIndex].toLowerCase(),
  );

  useEffect(() => {
    const clusterUrl = cluster.url;
    dispatch(fetchEntities({ clusterUrl, entityType }));
  }, [entityType, dispatch, cluster.url]);

  const filterEntities = entitiesToFilter => {
    return entitiesToFilter.filter(entity => {
      if (!currentNamespace || currentNamespace === 'All Namespaces') {
        return true;
      }
      return entity.metadata.namespace === currentNamespace;
    });
  };

  const entities = useSelector(state => {
    if (state.entities[entityType][cluster.url]) {
      const allEntities = Object.values(
        state.entities[entityType][cluster.url],
      );
      return filterEntities(allEntities);
    }
    return [];
  });

  const handleNamespaceChange = useCallback(
    namespace => {
      dispatch(setCurrentNamespace({ cluster, namespace }));
    },
    [cluster, dispatch],
  );

  const handleEntityPress = useCallback(
    entity => {
      dispatch(setCurrentEntity({ entity, entityType }));
      navigation.navigate('Entity Details');
    },
    [entityType, dispatch, navigation],
  );

  const handleDeletePress = useCallback(
    entity => {
      AlertUtils.deleteEntityPrompt(entity, () =>
        dispatch(deleteEntity({ cluster, entity, entityType })),
      );
    },
    [cluster, entityType, dispatch],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchEntities({ cluster, entityType }));
    setIsRefreshing(false);
  }, [cluster, entityType, dispatch]);

  const createNamespaceList = namespaces => {
    const namespaceList = namespaces.map(namespace => {
      return { value: namespace };
    });
    return [{ value: 'All Namespaces' }, ...namespaceList];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <EntitiesSegmentedTabs
        onTabPress={idx => dispatch(setCurrentEntityType(idx))}
        tabs={tabs}
        activeTabIndex={activeTabIndex}
      />
      <View style={styles.dropDownView}>
        <Dropdown
          label="Select a Namespace"
          data={createNamespaceList(cluster.namespaces)}
          value={
            cluster.currentNamespace
              ? cluster.currentNamespace
              : 'All Namespaces'
          }
          itemCount={4}
          dropdownOffset={styles.dropDownOffset}
          style={styles.dropDown}
          onChangeText={handleNamespaceChange}
        />
      </View>

      <View style={styles.podScroll}>
        {isLoading && !isRefreshing && !entities.length ? (
          <ScrollView>
            <Loading />
          </ScrollView>
        ) : (
          <SwipeableList
            listData={entities}
            onItemPress={handleEntityPress}
            onDeletePress={handleDeletePress}
            onRefresh={handleRefresh}
            emptyValue={`${entityType}`}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(EntitiesDisplay);

const styles = EStyleSheet.create({
  safeArea: {
    height: '100%',
    flex: 1,
    backgroundColor: 'white',
  },
  dropDownView: {
    width: '90%',
    alignSelf: 'center',
    marginTop: '7%',
    backgroundColor: 'white',
  },
  loading: {
    alignItems: 'center',
    flex: 1,
  },
  dropDownOffset: {
    top: 15,
    left: 0,
  },
  dropDown: {
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  noPodsFound: {
    textAlign: 'center',
    marginTop: '9rem',
    fontSize: '1.3rem',
    color: 'gray',
  },
  podScroll: {
    justifyContent: 'center',
    alignSelf: 'center',
    flex: 1,
    height: '100%',
    width: '94%',
    marginTop: '1%',
    borderRadius: 5,
    marginBottom: '1.2rem',
  },
  podContainer: {
    marginTop: '.7rem',
    backgroundColor: 'white',
    flexDirection: 'row',
    height: '3rem',
    width: '96%',
    paddingLeft: '1%',
    borderStyle: 'solid',
    borderColor: '#063CB9',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  logo: {
    width: '2.4rem',
    height: '2.4rem',
  },
  podText: {
    fontSize: '1rem',
    marginLeft: '.5rem',
    width: '12.2rem',
    marginRight: '1.2rem',
    backgroundColor: 'white',
    overflow: 'scroll',
  },
  statusText: {
    fontSize: '1rem',
    backgroundColor: 'white',
    color: 'gray',
    textAlign: 'right',
  },
  badge: {
    marginLeft: '.6rem',
    marginTop: '.1rem',
    marginRight: '.2rem',
  },
  arrow: {
    marginLeft: '.4rem',
    marginTop: '.2rem',
  },
});
