// App.tsx

import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initializeDatabase } from './db/database';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
        console.log('Base de datos inicializada correctamente.');
        setIsDbInitialized(true); // Marcar la BD como lista
      } catch (error) {
        console.error('Error fatal inicializando la base de datos:', error);
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