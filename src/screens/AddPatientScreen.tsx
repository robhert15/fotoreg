import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { addPatient } from '@/db/api/patients';
import { globalStyles } from '@/styles/globalStyles';
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
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>Registrar Paciente</Text>
      </View>

      <View style={globalStyles.formContainer}>
        <Text style={globalStyles.label}>Nombre Completo</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Nombre y Apellido del paciente"
          value={name}
          onChangeText={setName}
        />

        <Text style={globalStyles.label}>Número de Documento</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="DNI o Cédula"
          value={documentNumber}
          onChangeText={setDocumentNumber}
          keyboardType="numeric"
        />
      </View>

      <Pressable style={[globalStyles.button, globalStyles.buttonPrimary, { margin: 20 }]} onPress={handleSavePatient}>
        <Text style={globalStyles.buttonText}>Guardar Paciente</Text>
      </Pressable>
    </SafeAreaView>
  );
}

// ...los estilos permanecen iguales...
