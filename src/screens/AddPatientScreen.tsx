import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { addPatient } from '@/db/api/patients';
import { NewPatient } from '@/types';
import { RootStackParamList } from '@/navigation/AppNavigator';

type AddPatientScreenRouteProp = RouteProp<RootStackParamList, 'AddPatient'>;

export default function AddPatientScreen() {
  const [name, setName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const navigation = useNavigation();
  const route = useRoute<AddPatientScreenRouteProp>();

  const handleSavePatient = async () => {
    const trimmedName = name.trim();
    const trimmedDocumentNumber = documentNumber.trim();

    if (!trimmedName || !trimmedDocumentNumber) {
      Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos.');
      return;
    }

    const newPatient: NewPatient = {
      name: trimmedName,
      documentNumber: trimmedDocumentNumber,
      createdAt: new Date().toISOString(),
    };

    try {
      await addPatient(newPatient);
      Alert.alert('Éxito', 'Paciente registrado correctamente.', [
        { text: 'OK', onPress: () => {
            route.params.onPatientAdded(); // Refresca la lista
            navigation.goBack();
          } 
        },
      ]);
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        Alert.alert('Error', 'El número de documento ya existe.');
      } else {
        Alert.alert('Error', 'No se pudo registrar el paciente.');
      }
      console.error('Error saving patient:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registrar Paciente</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre y Apellido del paciente"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Número de Documento</Text>
        <TextInput
          style={styles.input}
          placeholder="DNI o Cédula"
          value={documentNumber}
          onChangeText={setDocumentNumber}
          keyboardType="numeric"
        />
      </View>

      <Pressable style={styles.saveButton} onPress={handleSavePatient}>
        <Text style={styles.saveButtonText}>Guardar Paciente</Text>
      </Pressable>
    </SafeAreaView>
  );
}

// ...los estilos permanecen iguales...
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
    color: '#333',
  },
  formContainer: {
    padding: 20,
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#28a745',
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
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
