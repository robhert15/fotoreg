import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Patient } from '@/types';
import { findPatients } from '@/db/api/patients';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PatientCard } from '@/components/PatientCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';

// Usamos 'any' porque esta pantalla ahora está anidada y no pertenece directamente al RootStack
type PatientListNavigationProp = StackNavigationProp<any>;

export default function PatientListScreen() {
  const navigation = useNavigation<PatientListNavigationProp>();
  const [patients, setPatients] = useState<Patient[]>([]);
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
      const results = await findPatients(searchTerm);
      setPatients(results);
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
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <View style={[styles.header, {backgroundColor: colors.primary}]}>
        <Text style={styles.headerTitle}>Pacientes</Text>
      </View>
      
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { borderColor: colors.borderColor, color: colors.text, backgroundColor: colors.background }]}
            placeholder="Buscar por nombre o documento..."
            placeholderTextColor={colors.textLight}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>
      
      <FlatList
        data={patients}
        keyExtractor={(item: Patient) => item.id.toString()}
        renderItem={({ item }: { item: Patient }) => (
          <PatientCard 
            patient={item}
            onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={[styles.resultsCount, { color: colors.textLight }]}>{patients.length} pacientes encontrados</Text>}
      />

      <Pressable 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddPatient', { onPatientAdded: loadPatients })}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60, // Aumentar para SafeArea
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  searchSection: {
    padding: 20,
    marginTop: -20, // Para que se solape con el gradiente
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'white', // Se sobreescribe con el color del tema
  },
  searchContainer: {
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 18,
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingLeft: 50,
    borderWidth: 2,
    borderRadius: 16,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Espacio para el FAB y la barra de navegación
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 115, // Posición sobre la barra de navegación
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00AECB', // Usar color primario
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
