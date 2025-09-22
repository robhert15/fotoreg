import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { globalStyles } from '@/styles/globalStyles';

interface ScreenLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const ScreenLayout = ({ title, children }: ScreenLayoutProps) => {
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <View style={globalStyles.container}>
      {/* Encabezado temporal con color sólido para evitar crasheo */}
      <View style={[globalStyles.header, { backgroundColor: primaryColor }]}>
        <Text style={globalStyles.headerTitle}>{title}</Text>
      </View>
      
      {/* El contenido de la pantalla se renderiza aquí */}
      {children}
    </View>
  );
};
