import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Alert } from 'react-native';
import { globalStyles } from '@/styles/globalStyles';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Patient, PatientWithLastDiagnosis } from '@/types';
import { findPatients } from '@/db/api/patients';
import { getLastConsultationForPatient } from '@/db/api/consultations';

import { useThemeColor } from '@/hooks/use-theme-color';
import { PatientCard } from '@/components/PatientCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';

// Usamos 'any' porque esta pantalla ahora está anidada y no pertenece directamente al RootStack
type PatientListNavigationProp = StackNavigationProp<any>;

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
      const basicPatients = await findPatients(searchTerm);
      const enrichedPatients = await Promise.all(
        basicPatients.map(async (patient) => {
          const lastConsultation = await getLastConsultationForPatient(patient.id);
          return {
            ...patient,
            last_visit: lastConsultation?.consultation_date,
            last_diagnosis: lastConsultation?.diagnosis,
          };
        })
      );
      setPatients(enrichedPatients);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron buscar los pacientes.');
    }
  }, [searchTerm]);

    useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, [loadPatients])
  );

    return (
    <ScreenLayout title="Pacientes">
      <View style={globalStyles.contentContainer}>
        <FlatList
          data={patients}
          keyExtractor={(item: PatientWithLastDiagnosis) => item.id.toString()}
          renderItem={({ item }: { item: PatientWithLastDiagnosis }) => (
            <PatientCard 
              patient={item}
              onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
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
      </View>

      <Pressable 
        style={globalStyles.fab} 
        onPress={() => navigation.navigate('AddPatient', { onPatientAdded: loadPatients })}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </Pressable>
    </ScreenLayout>
  );
}

// Los estilos locales se han movido a globalStyles.ts
// Solo mantenemos los que son verdaderamente específicos de esta pantalla.
const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 150, // Aumentar espacio para el FAB flotante y la barra de navegación
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 10, // Reducir un poco el margen
  },
});
