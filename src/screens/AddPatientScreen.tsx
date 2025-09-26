import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { BaseCard } from '@/components/cards/BaseCard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { addPatient } from '@/db/api/patients';
import { globalStyles } from '@/styles/globalStyles';
import { NewPatient } from '@/types';
 

export default function AddPatientScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const navigation = useNavigation();

  const handleSavePatient = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      Alert.alert('Campos incompletos', 'Por favor, introduce al menos el nombre y el apellido.');
      return;
    }

    const newPatient: NewPatient = {
      first_name: trimmedFirstName,
      last_name: trimmedLastName,
      document_number: documentNumber.trim(),
    };

    try {
      await addPatient(newPatient);
      Alert.alert('Éxito', 'Paciente registrado correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
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
    <ScreenLayout title="Registrar Paciente">
      <View style={globalStyles.contentContainer}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <BaseCard>
            <Text style={globalStyles.label}>Nombres</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Nombres del paciente"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={globalStyles.label}>Apellidos</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Apellidos del paciente"
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={globalStyles.label}>Número de Documento</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="DNI o Cédula"
              value={documentNumber}
              onChangeText={setDocumentNumber}
              keyboardType="numeric"
            />
          </BaseCard>
        </ScrollView>
      </View>

      {/* Botones de Acción Flotantes */}
      <Pressable style={[globalStyles.fab, { right: 90, backgroundColor: '#6c757d' }]} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={24} color="white" />
      </Pressable>
      <Pressable style={globalStyles.fab} onPress={handleSavePatient}>
        <Ionicons name="checkmark" size={24} color="white" />
      </Pressable>
    </ScreenLayout>
  );
}

// ...los estilos permanecen iguales...
