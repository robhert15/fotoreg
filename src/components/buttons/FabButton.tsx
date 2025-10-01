import React, { useState } from 'react';
import { Pressable, View, StyleSheet, type PressableProps, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { addOpacity } from '@/utils/colorUtils';

export type FabVariant = 'primary' | 'secondary' | 'neutral';
export type FabSize = 'default' | 'mini';

interface FabButtonProps extends Omit<PressableProps, 'style'> {
  icon: React.ReactNode;
  variant?: FabVariant;
  size?: FabSize;
  style?: StyleProp<ViewStyle>; // allow positioning overrides
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const FabButton: React.FC<FabButtonProps> = ({
  icon,
  variant = 'primary',
  size = 'default',
  style,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  testID,
  ...props
}) => {
  const primary = useThemeColor({}, 'primary');
  const secondary = useThemeColor({}, 'secondary');
  const tertiary = useThemeColor({}, 'tertiary');

  const getBg = () => {
    switch (variant) {
      case 'secondary':
        return secondary;
      case 'neutral':
        return tertiary;
      default:
        return primary;
    }
  };

  const diameter = size === 'mini' ? 48 : 56;
  const ripple = Platform.OS === 'android' ? addOpacity('#FFFFFF', 0.24) : undefined;

  const [focused, setFocused] = useState(false);
  const ringColor = addOpacity('#FFFFFF', 0.8);

  return (
    <Pressable
      android_ripple={
        Platform.OS === 'android'
          ? { color: ripple as string, foreground: true, borderless: false }
          : undefined
      }
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      style={({ pressed }) => [
        styles.base,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: getBg(),
          opacity: disabled ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        focused && { borderWidth: 2, borderColor: ringColor },
        style,
      ]}
      {...props}
    >
      {({ pressed }) => (
        <>
          {Platform.OS !== 'android' && pressed && (
            <View pointerEvents="none" style={[styles.overlay, { borderRadius: diameter / 2 }]} />
          )}
          <View style={styles.iconWrap}>{icon}</View>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
