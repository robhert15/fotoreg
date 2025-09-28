import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, FadeIn, FadeOut } from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  isInitiallyExpanded?: boolean;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ title, children, isInitiallyExpanded = false }) => {
  const { isDark } = useColorScheme();
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(isExpanded ? '90deg' : '0deg') }],
    };
  });

  const headerColor = isDark ? '#E5E5E7' : '#1C1C1E';
  const borderColor = isDark ? '#3A3A3C' : '#E5E5E5';

  return (
    <View style={[styles.container, { borderBottomColor: borderColor }]}>
      <Pressable onPress={() => setIsExpanded(prev => !prev)} style={styles.header}>
        <Text style={[styles.title, { color: headerColor }]}>{title}</Text>
        <Animated.View style={iconStyle}>
          <Ionicons name="chevron-forward" size={22} color={headerColor} />
        </Animated.View>
      </Pressable>
      {isExpanded && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.content}>
          {children}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginHorizontal: 15, // Para alinear con el contenido de las tarjetas
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingTop: 10,
  },
});
