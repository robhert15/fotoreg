import React, { useState } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Platform,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { addOpacity } from '@/utils/colorUtils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

interface BaseButtonProps extends PressableProps {
  title?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const BaseButton: React.FC<BaseButtonProps> = ({
  title,
  children,
  variant = 'primary',
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  style,
  ...props
}) => {
  const primary = useThemeColor({}, 'primary');
  const secondary = useThemeColor({}, 'secondary');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const outline = useThemeColor({}, 'outline');
  const white = useThemeColor({}, 'white');

  const rippleColor = Platform.OS === 'android' ? addOpacity(primary, 0.12) : undefined;
  const overlayLight = 'rgba(0,0,0,0.06)';
  const overlayDark = 'rgba(255,255,255,0.08)';

  const [focused, setFocused] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: primary, fg: white, border: primary };
      case 'secondary':
        return { bg: secondary, fg: white, border: secondary };
      case 'outline':
        return { bg: surface, fg: text, border: outline };
      case 'text':
        return { bg: 'transparent', fg: primary, border: 'transparent' };
      default:
        return { bg: primary, fg: white, border: primary };
    }
  };

  const colors = getColors();

  return (
    <Pressable
      android_ripple={
        Platform.OS === 'android'
          ? { color: rippleColor as string, foreground: true, borderless: false }
          : undefined
      }
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      style={(state: PressableStateCallbackType) => {
        const externalStyle = typeof style === 'function' ? style(state) : style;
        return [
          styles.button,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale: state.pressed ? 0.98 : 1 }],
            alignSelf: fullWidth ? 'stretch' : 'auto',
          },
          focused && styles.focused,
          variant === 'text' && styles.textButton,
          externalStyle,
        ];
      }}
      {...props}
    >
      {({ pressed }) => (
        <>
          {Platform.OS !== 'android' && pressed && variant !== 'text' && (
            <View pointerEvents="none" style={[styles.overlay, { backgroundColor: colorScheme === 'dark' ? overlayDark : overlayLight }]} />
          )}
          <View style={styles.contentRow}>
            {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
            {title ? (
              <Text
                style={[
                  styles.title,
                  { color: colors.fg },
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
            ) : (
              children
            )}
            {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
          </View>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  textButton: {
    borderWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 36,
  },
  focused: {
    borderWidth: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
