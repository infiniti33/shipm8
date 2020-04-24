import React, { useState } from 'react';
import { Animated } from 'react-native';
import { ScrollableTabBar } from 'react-native-scrollable-tab-view';

const SegmentedTabs = ({ activeTabIndex, onTabPress, tabs }) => {
  const [scrollValue, setScrollValue] = useState(
    new Animated.Value(activeTabIndex),
  );

  return (
    <ScrollableTabBar
      tabs={tabs}
      activeTab={activeTabIndex}
      goToPage={idx => {
        onTabPress(idx);
        setScrollValue(new Animated.Value(idx));
      }}
      scrollValue={scrollValue}
    />
  );
};

export default SegmentedTabs;
