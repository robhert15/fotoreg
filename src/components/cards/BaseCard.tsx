import React from 'react';
import { View, StyleSheet, Pressable, type PressableProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface BaseCardProps extends PressableProps {
  children: React.ReactNode;
  indicatorColor?: string; // Color para la barra lateral
}

export const BaseCard = ({ children, indicatorColor, ...props }: BaseCardProps) => {
  const cardBackgroundColor = useThemeColor({}, 'white');
  const borderColor = useThemeColor({}, 'borderColor');
  const primaryColor = useThemeColor({}, 'primary');

  const finalIndicatorColor = indicatorColor || primaryColor;

  return (
    <Pressable style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor }]} {...props}>
      <View style={[styles.cardIndicator, { backgroundColor: finalIndicatorColor }]} />
      <View style={styles.contentContainer}>
        {children}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden', // Asegura que el indicador no se salga
  },
  cardIndicator: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 5,
  },
  contentContainer: {
    padding: 20,
    marginLeft: 5, // Compensa el espacio del indicador
  },
});
