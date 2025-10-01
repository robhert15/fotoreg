import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { globalStyles } from '@/styles/globalStyles';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FabButton } from '@/components/buttons/FabButton';

import { PatientWithLastDiagnosis } from '@/types';
import { findPatientsWithLastConsultation } from '@/db/api/patients';

import { useThemeColor } from '@/hooks/use-theme-color';
import { PatientCard } from '@/components/PatientCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, BottomTabParamList } from '@/navigation/AppNavigator';

// Definimos un tipo de navegación compuesto para manejar la anidación
type PatientListNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'PatientsStack'>,
  StackNavigationProp<RootStackParamList>
>;

export default function PatientListScreen() {
  const navigation = useNavigation<PatientListNavigationProp>();
  const [patients, setPatients] = useState<PatientWithLastDiagnosis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Carga de colores del tema
  const colors = {
    primary: useThemeColor({}, 'primary'),
    secondary: useThemeColor({}, 'secondary'),
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    textLight: useThemeColor({}, 'textLight'),
    white: useThemeColor({}, 'white'),
    borderColor: useThemeColor({}, 'borderColor'),
  };

  const loadPatients = useCallback(async () => {
    try {
      const patientsData = await findPatientsWithLastConsultation(searchTerm);
      setPatients(patientsData);
    } catch (error) {
      console.error('loadPatients failed:', error);
      Alert.alert('Error', 'No se pudieron buscar los pacientes.');
    }
  }, [searchTerm]);

    // Efecto para la búsqueda en tiempo real con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      loadPatients();
    }, 300); // 300ms de debounce

    // Limpieza: cancela el timeout si el usuario sigue escribiendo
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, loadPatients]);

  // Efecto para recargar al volver a la pantalla (sin el término de búsqueda)
  useFocusEffect(
    useCallback(() => {
      // Solo recarga si el campo de búsqueda está vacío, 
      // para no interferir con una búsqueda activa.
      if (searchTerm === '') {
        loadPatients();
      }
    }, [searchTerm, loadPatients]) // se mantiene la dependencia por si acaso
  );

    return (
      <View style={{ flex: 1 }}>
        <ScreenLayout
          title="Pacientes"
          renderScrollable={({ onScroll, scrollEventThrottle, contentContainerStyle }) => (
            <Animated.FlatList
              data={patients}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <PatientCard 
                  patient={item}
                  onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
                />
              )}
              onScroll={onScroll}
              scrollEventThrottle={scrollEventThrottle}
              contentContainerStyle={[styles.listContent, contentContainerStyle]}
              ListHeaderComponent={
                <>
                  <View style={globalStyles.searchSection}>
                    <View style={globalStyles.searchContainer}>
                      <Ionicons name="search" size={18} color={colors.textLight} style={globalStyles.searchIcon} />
                      <TextInput
                        style={[globalStyles.searchInput, { borderColor: colors.borderColor, color: colors.text, backgroundColor: colors.background }]}
                        placeholder="Buscar por nombre o documento..."
                        placeholderTextColor={colors.textLight}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                      />
                    </View>
                  </View>
                  <Text style={[styles.resultsCount, { color: colors.textLight }]}>
                    {patients.length} pacientes encontrados
                  </Text>
                </>
              }
            />
          )}
        />
        <FabButton
          style={globalStyles.fab}
          variant="primary"
          onPress={() => navigation.navigate('AddPatient')}
          accessibilityLabel="Registrar paciente"
          icon={<Ionicons name="add" size={24} color={colors.white} />}
        />
      </View>
  );
}

// Los estilos locales se han movido a globalStyles.ts
// Solo mantenemos los que son verdaderamente específicos de esta pantalla.
const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 150, // Aumentar espacio para el FAB flotante y la barra de navegación
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 10, // Reducir un poco el margen
  },
});
