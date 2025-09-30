import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Svg, Rect, Path } from 'react-native-svg';

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

  const pillAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, (headerHeight - MIN_HEADER_HEIGHT) / 2],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  // Componente auxiliar: cuarto de círculo relleno
  const QuarterCircle = ({
    cx,
    cy,
    r,
    quadrant,
    fill,
  }: {
    cx: number;
    cy: number;
    r: number;
    quadrant: 'tl' | 'tr' | 'bl' | 'br';
    fill: string;
  }) => {
    let d = '';
    switch (quadrant) {
      case 'tl':
        // Top-Left: del centro hacia arriba y luego arco hacia la izquierda
        d = `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx - r} ${cy} Z`;
        break;
      case 'bl':
        // Bottom-Left: del centro hacia la izquierda y arco hacia abajo
        d = `M ${cx} ${cy} L ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`;
        break;
      case 'tr':
        // Top-Right: del centro hacia arriba y arco hacia la derecha
        d = `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`;
        break;
      case 'br':
        // Bottom-Right: del centro hacia la derecha y arco hacia abajo
        d = `M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`;
        break;
    }
    return <Path d={d} fill={fill} />;
  };

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
        {/* Arco en 3 partes con SVG: solo la píldora encima (animada) y los laterales fijos
            DEBUG: Colores visibles para verificar las piezas */}
        <View pointerEvents="none" style={[styles.headerArc, { height: ARC_HEIGHT }]}>          
          {/* Píldora blanca animada: SOLO el rectángulo central se desvanece */}
          <Animated.View style={[StyleSheet.absoluteFill, pillAnimatedStyle]}>
            <Svg width={SCREEN_WIDTH} height={ARC_HEIGHT}>
              {/* DEBUG: rectángulo central en amarillo */}
              <Rect x={ARC_HEIGHT} y={0} width={SCREEN_WIDTH - ARC_HEIGHT * 2} height={ARC_HEIGHT} fill="#FFD54F" />
            </Svg>
          </Animated.View>

          {/* Semicírculos laterales fijos (no se desvanecen) */}
          <Svg width={SCREEN_WIDTH} height={ARC_HEIGHT} style={StyleSheet.absoluteFill}>
            {/* DEBUG: semicírculo izquierdo compuesto por dos cuartos */}
            <QuarterCircle cx={ARC_HEIGHT} cy={ARC_HEIGHT} r={ARC_HEIGHT} quadrant="tl" fill="#E53935" />
            <QuarterCircle cx={ARC_HEIGHT} cy={ARC_HEIGHT} r={ARC_HEIGHT} quadrant="bl" fill="#1E88E5" />
            {/* DEBUG: semicírculo derecho compuesto por dos cuartos */}
            <QuarterCircle cx={SCREEN_WIDTH - ARC_HEIGHT} cy={ARC_HEIGHT} r={ARC_HEIGHT} quadrant="tr" fill="#43A047" />
            <QuarterCircle cx={SCREEN_WIDTH - ARC_HEIGHT} cy={ARC_HEIGHT} r={ARC_HEIGHT} quadrant="br" fill="#8E24AA" />
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
