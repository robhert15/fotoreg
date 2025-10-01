import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollViewProps,
  FlatListProps,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ParallaxScrollView } from './ParallaxScrollView'; // Asumimos que la lógica base se mantiene aquí
import { useThemeColor } from '@/hooks/use-theme-color';
import { globalStyles } from '@/styles/globalStyles';

// --- Tipos Flexibles para el Componente de Scroll ---
type ScrollableComponentProps<T> = 
  | ({ scrollComponent: 'ScrollView' } & ScrollViewProps)
  | ({ scrollComponent: 'FlatList' } & FlatListProps<T>);

// --- Props del Layout Principal ---
interface ScreenLayoutProps<T> {
  title: string;
  children?: React.ReactNode; // Children is now optional
  headerRight?: React.ReactNode;
  renderScrollable?: (props: {
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle: number;
    contentContainerStyle: StyleProp<ViewStyle>;
  }) => React.ReactNode;
  contentPadding?: number;
  contentBottomPadding?: number;
}

// --- Componente de Cabecera por Defecto ---
const DefaultHeader = ({ title, headerRight }: { title: string, headerRight?: React.ReactNode }) => {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.headerContainer}>
      {canGoBack ? (
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
      ) : <View style={{ width: 44 }} /> // Placeholder for alignment
      }
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      {headerRight || <View style={{ width: 44 }} /> // Placeholder for alignment
      }
    </View>
  );
};

// --- Layout Principal con Parallax Integrado ---
export const ScreenLayout = <T extends {}>({ title, children, headerRight, renderScrollable, contentPadding = 20, contentBottomPadding = 150 }: ScreenLayoutProps<T>) => {
  const scrollY = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerBackgroundColor = useThemeColor({}, 'primary');
  const insets = useSafeAreaInsets();
  const headerBaseHeight = 110; // Reducido en ~20% desde 138
  const headerHeight = headerBaseHeight + insets.top; // include safe area top

  const scrollableContent = renderScrollable ? (
    renderScrollable({
      onScroll: handleScroll,
      scrollEventThrottle: 16,
      contentContainerStyle: { paddingTop: headerHeight },
    })
  ) : (
    <Animated.ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingTop: headerHeight, paddingHorizontal: contentPadding, paddingBottom: contentBottomPadding }}
    >
      {children}
    </Animated.ScrollView>
  );

  return (
    <ParallaxScrollView
      headerHeight={headerHeight}
      headerColor={headerBackgroundColor}
      header={<DefaultHeader title={title} headerRight={headerRight} />}
      scrollY={scrollY} // Pasar scrollY para que ParallaxScrollView lo use
    >
      {scrollableContent}
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1, // Ocupar todo el espacio vertical disponible
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Alinear items en la parte inferior
    paddingHorizontal: 10,
    paddingBottom: 12, // Un pequeño margen inferior
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white', // Restaurar el color del texto
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
  },
});
