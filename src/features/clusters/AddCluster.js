import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from 'react-native-material-dropdown';
import EStyleSheet from 'react-native-extended-stylesheet';

import {
  addCluster,
  fetchNamespaces,
  setCurrentProvider,
  currentProviderSelector,
  currentProviderLoadingSelector,
  clustersForCurrentProviderSelector,
} from 'features/clusters/ClustersSlice';
import {
  fetchGkeClusters,
  fetchGcpProjects,
  gcpProjectsSelector,
} from 'features/gcp/GoogleCloudSlice';
import Loading from 'components/Loading';
import Regions from 'data/Regions';
import SwipeableList from 'components/SwipeableList';
import { fetchEksClusters } from 'features/aws/AwsSlice';

const AddCluster = ({ navigation }) => {
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dropdownValue, setDropdownValue] = useState(null);

  // Redux Selectors
  const gcpProjects = useSelector(gcpProjectsSelector);
  const currentProvider = useSelector(currentProviderSelector);
  const isLoading = useSelector(currentProviderLoadingSelector);
  const clusters = useSelector(clustersForCurrentProviderSelector);

  useEffect(() => {
    currentProvider === 'gcp' && dispatch(fetchGcpProjects());
  }, [currentProvider, dispatch]);

  const fetchClusters = async value => {
    if (!value) {
      value = dropdownValue;
    }
    return currentProvider === 'aws'
      ? await dispatch(fetchEksClusters(value))
      : await dispatch(fetchGkeClusters(value));
  };

  const handleClusterPress = useCallback(
    cluster => {
      dispatch(addCluster(cluster));
      dispatch(fetchNamespaces(cluster));
      dispatch(setCurrentProvider(cluster.cloudProvider));
      navigation.goBack();
    },
    [dispatch, navigation],
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchClusters();
    setIsRefreshing(false);
  };

  const handleDropdownChange = value => {
    setDropdownValue(value);
    fetchClusters(value);
  };

  const setDropdownValues = () => {
    return currentProvider === 'aws'
      ? Regions
      : gcpProjects || [{ value: 'Loading' }];
  };

  const regionOrProjectLabel = currentProvider === 'aws' ? 'Region' : 'Project';

  const setNoValueSelectedText = () => {
    return `Please select a ${regionOrProjectLabel} to view
    available clusters`;
  };

  const setDropdownLabel = () => {
    return `Select a ${regionOrProjectLabel}`;
  };

  return (
    <View>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.dropDownView}>
          <Dropdown
            label={setDropdownLabel()}
            data={setDropdownValues()}
            itemCount={4}
            dropdownPosition={0}
            dropdownOffset={styles.dropDownOffset}
            style={styles.dropDown}
            onChangeText={handleDropdownChange}
          />
        </View>
        {isLoading && !isRefreshing ? (
          <ScrollView>
            <Loading />
          </ScrollView>
        ) : (
            <View style={styles.clusterScroll}>
              {dropdownValue && (
                <SwipeableList
                  listData={clusters}
                  onRefresh={handleRefresh}
                  onItemPress={handleClusterPress}
                  onDeletePress={null}
                  emptyValue={'Clusters'}
                />
              )}
              {!dropdownValue && (
                <Text style={styles.noContentText}>
                  {setNoValueSelectedText()}
                </Text>
              )}
            </View>
          )}
      </SafeAreaView>
    </View>
  );
};

export default React.memo(AddCluster);

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

  clusterContainer: {
    marginTop: '3%',
    backgroundColor: 'white',
    flexDirection: 'row',
    height: '3rem',
    width: '96%',
    paddingVertical: 12,
    paddingLeft: 8,
    borderStyle: 'solid',
    borderColor: '#063CB9',
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'center',
  },
  clusterText: {
    fontSize: '1rem',
    marginRight: '3.8rem',
    width: '46%',
    backgroundColor: 'white',
    overflow: 'scroll',
  },
  statusText: {
    fontSize: '1rem',
    textAlign: 'right',
    backgroundColor: 'white',
    width: '5.65rem',
    color: 'gray',
    marginRight: '.18rem',
  },
  clusterScroll: {
    marginTop: '3%',
    height: '36rem',
    backgroundColor: 'white',
  },
  arrow: {
    marginLeft: '.4rem',
    marginTop: '.2rem',
  },
  badge: {
    marginLeft: '.4rem',
    marginTop: '.37rem',
    marginRight: '.2rem',
  },
});
