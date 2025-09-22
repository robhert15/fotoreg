import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { globalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import { FlashList } from '@shopify/flash-list';
import { Patient } from '@/types';
import { findPatients } from '@/db/api/patients';
import { RootStackParamList } from '@/navigation/AppNavigator';

type PatientListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientList'>;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listContainer: {
    flex: 1,
  },
});

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
    <Pressable onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })} style={globalStyles.card}>
      <Text style={globalStyles.cardTitle}>{item.name}</Text>
      <Text style={globalStyles.cardSubtitle}>Doc: {item.documentNumber}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={globalStyles.title}>Buscar Pacientes</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Buscar por nombre, apellido o documento..."
          value={searchTerm}
          onChangeText={(text: string) => {
            setSearchTerm(text);
            handleSearch(text);
          }}
        />
      </View>
      <View style={styles.listContainer}>
        <FlashList
          data={patients}
          renderItem={renderPatientItem}
          keyExtractor={(item: Patient) => item.id.toString()}
          // @ts-ignore: La propiedad estimatedItemSize es válida pero los tipos de la librería no son compatibles con la versión actual de React
          estimatedItemSize={70}
          ListEmptyComponent={<Text style={globalStyles.emptyText}>No se encontraron pacientes.</Text>}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        />
      </View>
      <View style={globalStyles.footer}>
        <Pressable style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={handleAddPatient}>
          <Text style={globalStyles.buttonText}>Agregar Paciente</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
