import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Svg, Rect, Path, Defs, ClipPath, G } from 'react-native-svg';

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
        <View style={{ height: headerHeight - ARC_HEIGHT, width: '100%', backgroundColor: headerFill }}>
          {header}
        </View>
        {/* Arco en 3 partes con SVG: solo la píldora encima (animada) y los laterales fijos
            DEBUG: Colores visibles para verificar las piezas */}
        <View pointerEvents="none" style={[styles.headerArc, { height: ARC_HEIGHT }]}>          
          {/* Píldora con clipPath: top fijo y bottom animado, sin costuras */}
          {/* Top fijo (sin transparencia) clippeado a la forma completa de la cápsula */}
          <Svg width={SCREEN_WIDTH} height={ARC_HEIGHT} style={StyleSheet.absoluteFill}>
            <Defs>
              <ClipPath id="pillClipTop">
                <Path d={`M ${ARC_HEIGHT} 0 H ${SCREEN_WIDTH - ARC_HEIGHT} A ${ARC_HEIGHT} ${ARC_HEIGHT} 0 0 1 ${SCREEN_WIDTH} ${ARC_HEIGHT} H 0 A ${ARC_HEIGHT} ${ARC_HEIGHT} 0 0 1 ${ARC_HEIGHT} 0 Z`} />
              </ClipPath>
            </Defs>
            <G clipPath="url(#pillClipTop)">
              <Rect x={0} y={0} width={SCREEN_WIDTH} height={ARC_HEIGHT / 2} fill={backgroundColor} />
            </G>
          </Svg>
          {/* Bottom animado (se desvanece) */}
          <Animated.View style={[StyleSheet.absoluteFill, pillAnimatedStyle]}>
            <Svg width={SCREEN_WIDTH} height={ARC_HEIGHT}>
              <Defs>
                <ClipPath id="pillClipBottom">
                  <Path d={`M ${ARC_HEIGHT} 0 H ${SCREEN_WIDTH - ARC_HEIGHT} A ${ARC_HEIGHT} ${ARC_HEIGHT} 0 0 1 ${SCREEN_WIDTH} ${ARC_HEIGHT} H 0 A ${ARC_HEIGHT} ${ARC_HEIGHT} 0 0 1 ${ARC_HEIGHT} 0 Z`} />
                </ClipPath>
              </Defs>
              <G clipPath="url(#pillClipBottom)">
                <Rect x={0} y={ARC_HEIGHT / 2} width={SCREEN_WIDTH} height={ARC_HEIGHT / 2} fill={backgroundColor} />
              </G>
            </Svg>
          </Animated.View>

          {/* Semicírculos laterales fijos (no se desvanecen) */}
          <Svg width={SCREEN_WIDTH} height={ARC_HEIGHT} style={StyleSheet.absoluteFill}>
            {/* Precise wedge-shaped enjutas (turquoise header color) */}
            <Path d={`M 0 0 H ${ARC_HEIGHT} A ${ARC_HEIGHT} ${ARC_HEIGHT} 0 0 0 0 ${ARC_HEIGHT} Z`} fill={headerFill} />
            <Path d={`M ${SCREEN_WIDTH} 0 H ${SCREEN_WIDTH - ARC_HEIGHT} A ${ARC_HEIGHT} ${ARC_HEIGHT} 0 0 1 ${SCREEN_WIDTH} ${ARC_HEIGHT} Z`} fill={headerFill} />
            {/* Quarter-circles (white) */}
            <QuarterCircle cx={ARC_HEIGHT} cy={ARC_HEIGHT} r={ARC_HEIGHT} quadrant="tl" fill={backgroundColor} />
            <QuarterCircle cx={ARC_HEIGHT} cy={ARC_HEIGHT} r={ARC_HEIGHT} quadrant="bl" fill={backgroundColor} />
            <QuarterCircle cx={SCREEN_WIDTH - ARC_HEIGHT} cy={ARC_HEIGHT} r={ARC_HEIGHT} quadrant="tr" fill={backgroundColor} />
            <QuarterCircle cx={SCREEN_WIDTH - ARC_HEIGHT} cy={ARC_HEIGHT} r={ARC_HEIGHT} quadrant="br" fill={backgroundColor} />
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
    bottom: 0,
  }
});
