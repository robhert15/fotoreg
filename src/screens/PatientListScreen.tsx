import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Patient } from '@/types';
import { findPatients } from '@/db/api/patients';
import { RootStackParamList } from '@/navigation/AppNavigator';

type PatientListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientList'>;

export default function PatientListScreen() {
  const navigation = useNavigation<PatientListNavigationProp>();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);

  const handleSearch = useCallback(async (term: string) => {
    try {
      const results = await findPatients(term);
      setPatients(results);
    } catch (error) {
      console.error('Error searching patients:', error);
      Alert.alert('Error', 'No se pudieron buscar los pacientes.');
    }
  }, []);

  // Carga inicial de pacientes cuando el componente se monta
  useEffect(() => {
    handleSearch(''); // Llama con un término vacío para traer a todos los pacientes
  }, [handleSearch]);

  const handleAddPatient = () => {
    navigation.navigate('AddPatient', { onPatientAdded: () => handleSearch('') });
  };
  
  const renderPatientItem = ({ item }: { item: Patient }) => (
    <Pressable onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>Doc: {item.documentNumber}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar Pacientes</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, apellido o documento..."
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            handleSearch(text);
          }}
        />
      </View>

      <FlashList
        data={patients}
        renderItem={renderPatientItem}
        keyExtractor={(item) => item.id.toString()}
        // @ts-ignore: La propiedad estimatedItemSize es válida pero los tipos de la librería no son compatibles con la versión actual de React
        estimatedItemSize={70}
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron pacientes.</Text>}
        contentContainerStyle={styles.listContent}
      />

      <Pressable style={styles.addButton} onPress={handleAddPatient}>
        <Text style={styles.addButtonText}>Agregar Paciente</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  addButton: {
    backgroundColor: '#007bff',
    margin: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
