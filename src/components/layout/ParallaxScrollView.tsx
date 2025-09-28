import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import Animated, {
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';

const DEFAULT_HEADER_HEIGHT = 250;
const MIN_HEADER_HEIGHT = 100; // Altura final de la cabecera

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  header: React.ReactNode;
  headerHeight?: number;
}

export const ParallaxScrollView: React.FC<ParallaxScrollViewProps> = ({
  children,
  header,
  headerHeight = DEFAULT_HEADER_HEIGHT,
}) => {
  const scrollY = useSharedValue(0);
  const backgroundColor = useThemeColor({}, 'background');

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
      scrollY.value,
      [0, headerHeight - MIN_HEADER_HEIGHT],
      [0, -(headerHeight - MIN_HEADER_HEIGHT)], // Se desplaza solo la diferencia de altura
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [-headerHeight, 0],
      [2, 1], // Efecto de "pull-to-zoom" al hacer scroll hacia arriba
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const ARC_HEIGHT = 20; // Altura de la base de la cápsula

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.header,
          { height: headerHeight },
          headerAnimatedStyle,
        ]}>
        {header}
        {/* Arco blanco en la base de la cabecera */}
        <View pointerEvents="none" style={[styles.headerArc, { height: ARC_HEIGHT }]}>
          <View 
            style={{
              flex: 1,
              backgroundColor: backgroundColor,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          />
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight }}>
        {children}
      </Animated.ScrollView>
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
    width: '100%', // Forzar el ancho completo
    zIndex: 1,
    overflow: 'hidden',
  },
  headerArc: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
  }
});
