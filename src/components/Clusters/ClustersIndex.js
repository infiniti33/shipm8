import React, { useEffect, useCallback, useRef } from 'react';
import { View, Button, SafeAreaView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dropdown } from 'react-native-material-dropdown';
import EStyleSheet from 'react-native-extended-stylesheet';

import {
  checkClusters,
  removeCluster,
  fetchNamespaces,
  setCurrentCluster,
  setCurrentProvider,
  currentProviderSelector,
  clustersFilteredByCloudProviderSelector,
} from '../../reducers/ClustersSlice';
import AlertUtils from '../../utils/AlertUtils';
import SwipeableList from '../common/SwipeableList';
import CloudProviders from '../../data/CloudProviders';
import { fetchEntities } from '../../reducers/EntitiesSlice';

const ClustersIndex = ({ navigation }) => {
  const dispatch = useDispatch();

  // Redux Selectors
  const currentProvider = useSelector(currentProviderSelector);
  const clusters = useSelector(clustersFilteredByCloudProviderSelector);

  // Using a ref to allow use in useEffect without endless rerenders
  const clustersRef = useRef(clusters);

  useEffect(() => {
    dispatch(checkClusters());
    clustersRef.current.forEach(cluster => {
      const clusterUrl = cluster.url;
      dispatch(fetchEntities({ clusterUrl, entityType: 'pods' }));
      dispatch(fetchEntities({ clusterUrl, entityType: 'services' }));
    });
  }, [dispatch]);

  const handleProviderChange = useCallback(
    provider => {
      dispatch(setCurrentProvider(provider));
    },
    [dispatch],
  );

  const handleClusterPress = useCallback(
    cluster => {
      dispatch(setCurrentCluster(cluster));
      dispatch(fetchNamespaces(cluster));
      navigation.navigate('Entities', { title: cluster.name });
    },
    [dispatch, navigation],
  );

  const handleDeletePress = useCallback(
    cluster => {
      AlertUtils.deleteEntityPrompt(cluster.name, () =>
        dispatch(removeCluster(cluster)),
      );
    },
    [dispatch],
  );

  const handleRefresh = useCallback(async () => {
    return await dispatch(checkClusters());
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.dropDownView}>
        <Dropdown
          label={'Select Cloud Provider'}
          data={CloudProviders}
          value={currentProvider || 'gcp'}
          itemCount={4}
          dropdownPosition={0}
          dropdownOffset={styles.dropDownOffset}
          style={styles.dropDown}
          onChangeText={handleProviderChange}
        />
      </View>
      <SwipeableList
        listData={clusters}
        onItemPress={handleClusterPress}
        onDeletePress={handleDeletePress}
        onRefresh={handleRefresh}
        emptyValue={'Clusters'}
      />
      <View>
        <TouchableOpacity onPress={() => navigation.navigate('Add Cluster')}>
          <Icon
            style={styles.addClusterIcon}
            name="plus-circle"
            size={50}
            color="#1589FF"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.signOut}>
        <Button
          color="red"
          title="Sign Out"
          onPress={() =>
            navigation.reset({ routes: [{ name: 'Cloud Login' }] })
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default React.memo(ClustersIndex);

const styles = EStyleSheet.create({
  noContentText: {
    textAlign: 'center',
    marginTop: '9rem',
    fontSize: '1.3rem',
    color: 'gray',
  },
  dropDown: {
    textAlign: 'center',
    alignItems: 'center',
    fontSize: '1.1rem',
  },
  dropDownView: {
    width: '90%',
    alignSelf: 'center',
    marginTop: '8%',
    backgroundColor: 'white',
  },
  dropDownOffset: {
    top: 15,
    left: 0,
  },
  safeArea: {
    backgroundColor: 'white',
    marginHorizontal: '3%',
    height: '100%',
  },
  clusterScroll: {
    marginTop: '3%',
    borderRadius: 5,
    marginBottom: '.2rem',
    backgroundColor: 'white',
  },
  signOut: {
    marginTop: '3rem',
    backgroundColor: 'white',
    width: '30%',
    alignSelf: 'center',
  },
  addClusterIcon: {
    alignSelf: 'center',
    marginBottom: '-1.7rem',
  },
});
