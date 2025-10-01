// App.tsx

import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';

import { initializeDatabase } from './db/database';
import AppNavigator from './navigation/AppNavigator';
import { logger } from '@/utils/logger';

// Silenciar aviso deprecado de SafeAreaView proveniente de dependencias externas (lo antes posible)
LogBox.ignoreLogs([
  "SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead. See https://github.com/th3rdwave/react-native-safe-area-context",
  'SafeAreaView has been deprecated',
]);

export default function App() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
        if (__DEV__) {
          logger.info('Base de datos inicializada correctamente.');
        }
        setIsDbInitialized(true); // Marcar la BD como lista
      } catch (error) {
        logger.error('Error fatal inicializando la base de datos', error as Error);
        // En un caso real, podríamos mostrar una pantalla de error aquí
      }
    };

    setupDatabase();
  }, []);

  // No renderizar nada hasta que la BD esté lista
  if (!isDbInitialized) {
    return null; // O un componente de pantalla de carga (Splash Screen)
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}