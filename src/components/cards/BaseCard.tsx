import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { addOpacity } from '@/utils/colorUtils';

export type IndicatorVariant = 'default' | 'danger' | 'warning' | 'info' | 'success';

interface BaseCardProps extends PressableProps {
  children: React.ReactNode;
  variant?: 'default' | 'form'; // 'default' para listas, 'form' para formularios
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  indicatorColor?: string; // Color para la barra lateral
  indicatorVariant?: IndicatorVariant;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'none';
  testID?: string;
}

export const BaseCard = ({
  children,
  variant = 'default',
  onPress,
  disabled = false,
  selected = false,
  indicatorColor,
  indicatorVariant = 'default',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
  style,
  ...props
}: BaseCardProps) => {
  // Colores del tema
  const surface = useThemeColor({}, 'surface');
  const outline = useThemeColor({}, 'outline');
  const primary = useThemeColor({}, 'primary');

  // BorderColor con opacity por plataforma (iOS 0.8, Android 0.6)
  const baseBorder = Platform.select({ ios: addOpacity(outline, 0.8), android: addOpacity(outline, 0.6), default: addOpacity(outline, 0.8) });

  // Ripple Android (12%) y overlay iOS (negro 0.04 en claro, blanco 0.08 en oscuro)
  const rippleColor = addOpacity(primary, 0.12);
  const overlayLight = 'rgba(0,0,0,0.04)';
  const overlayDark = 'rgba(255,255,255,0.08)';

  const [focused, setFocused] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const variantColors: Record<IndicatorVariant, string> = {
    default: primary,
    danger: '#DC2626',
    warning: '#F59E0B',
    info: '#3B82F6',
    success: '#10B981',
  };
  const finalIndicatorColor = indicatorColor || variantColors[indicatorVariant];

  const dynamicStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const externalStyle = typeof style === 'function' ? style(state) : style;
    return [
      styles.card,
      {
        backgroundColor: surface,
        borderColor: selected ? primary : baseBorder,
        borderWidth: selected ? 2 : focused ? 2 : 1,
        opacity: disabled ? 0.5 : 1,
        transform: [{ scale: state.pressed ? 0.98 : 1 }],
      },
      focused && Platform.OS === 'web' && styles.focusWeb,
      externalStyle,
    ];
  };

  return (
    <Pressable
      style={dynamicStyle}
      onPress={disabled ? undefined : onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      android_ripple={
        Platform.OS === 'android'
          ? { color: rippleColor, borderless: false, foreground: true }
          : undefined
      }
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={onPress ? accessibilityRole : 'none'}
      accessibilityState={{ disabled, selected }}
      testID={testID}
      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      {...props}
    >
      {({ pressed }) => (
        <>
          {/* Indicador lateral (solo para la variante por defecto) */}
          {variant === 'default' && (
            <View style={[styles.cardIndicator, { backgroundColor: finalIndicatorColor }]} />
          )}

          {/* Overlay iOS (pressed) */}
          {Platform.OS !== 'android' && pressed && (
            <View
              pointerEvents="none"
              style={[styles.overlay, { backgroundColor: colorScheme === 'dark' ? overlayDark : overlayLight }]}
            />
          )}

          {/* Overlay seleccionado (tinte muy sutil) */}
          {selected && (
            <View pointerEvents="none" style={[styles.overlay, { backgroundColor: addOpacity(primary, 0.02) }]} />
          )}

          {/* Contenido */}
          <View style={[styles.contentContainer, { paddingLeft: variant === 'default' ? 25 : 0 }]}>
            {children}
          </View>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  focusWeb: {
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineOffset: 2,
    borderRadius: 18,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    minHeight: 44,
    position: 'relative',
    overflow: 'hidden', // Para ripple/overlays y bordes
    // Sin sombras
    // No shadows by default
    shadowColor: 'transparent',
    elevation: 0,
  },
  cardIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  contentContainer: {
    // El padding se ajustará dinámicamente
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
});
