import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate, useSharedValue } from 'react-native-reanimated';

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  header: React.ReactNode;
  headerHeight: number;
  headerColor: string;
  scrollY: ReturnType<typeof useSharedValue<number>>;
}

export const ParallaxScrollView: React.FC<ParallaxScrollViewProps> = ({ children, header, headerHeight, headerColor, scrollY }) => {
  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, headerHeight],
      [0, -headerHeight],
      Extrapolate.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  return (
    <View style={styles.container}>
      {children}
      <Animated.View style={[styles.header, { height: headerHeight, backgroundColor: headerColor }, headerStyle]}>
        {header}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
