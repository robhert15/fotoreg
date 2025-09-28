import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';

const DEFAULT_HEADER_HEIGHT = 250;

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
      [0, headerHeight],
      [0, -headerHeight / 2], // La cabecera se mueve a la mitad de la velocidad del scroll
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

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.header,
          { height: headerHeight },
          headerAnimatedStyle,
        ]}>
        {header}
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
    borderBottomLeftRadius: 24, // Forma de cápsula
    borderBottomRightRadius: 24, // Forma de cápsula
  },
});
