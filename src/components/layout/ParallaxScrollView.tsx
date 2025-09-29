import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Svg, Rect, Circle } from 'react-native-svg';

import { useThemeColor } from '@/hooks/use-theme-color';

const DEFAULT_HEADER_HEIGHT = 250;
const MIN_HEADER_HEIGHT = 100; // Altura final de la cabecera
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  header: React.ReactNode;
  headerHeight?: number;
  headerColor?: string; // Color de la cabecera para el fondo turquesa del arco
}

export const ParallaxScrollView: React.FC<ParallaxScrollViewProps> = ({
  children,
  header,
  headerHeight = DEFAULT_HEADER_HEIGHT,
  headerColor,
}) => {
  const scrollY = useSharedValue(0);
  const backgroundColor = useThemeColor({}, 'background'); // Blanco (contenido)
  const defaultHeaderColor = useThemeColor({}, 'primary'); // Turquesa por defecto
  const headerFill = headerColor ?? defaultHeaderColor;

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
        {/* Arco en 3 partes con SVG: base turquesa + píldora blanca encima */}
        <View pointerEvents="none" style={[styles.headerArc, { height: ARC_HEIGHT }]}>
          <Svg width={SCREEN_WIDTH} height={ARC_HEIGHT}>
            {/* Base turquesa detrás (mismo color que la cabecera) */}
            <Rect x={0} y={0} width={SCREEN_WIDTH} height={ARC_HEIGHT} fill={headerFill} />
            {/* Píldora blanca encima (rectángulo central + semicírculos) */}
            <Rect x={ARC_HEIGHT} y={0} width={SCREEN_WIDTH - ARC_HEIGHT * 2} height={ARC_HEIGHT} fill={backgroundColor} />
            <Circle cx={ARC_HEIGHT} cy={ARC_HEIGHT} r={ARC_HEIGHT} fill={backgroundColor} />
            <Circle cx={SCREEN_WIDTH - ARC_HEIGHT} cy={ARC_HEIGHT} r={ARC_HEIGHT} fill={backgroundColor} />
          </Svg>
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
