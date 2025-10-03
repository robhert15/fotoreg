import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, useWindowDimensions, TextInputProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { BaseCard } from '@/components/cards/BaseCard';
import { Ionicons } from '@expo/vector-icons';
import { FabButton } from '@/components/buttons/FabButton';
import { useNavigation } from '@react-navigation/native';
import { addPatient } from '@/db/api/patients';
import { globalStyles } from '@/styles/globalStyles';
import { NewPatient, Patient } from '@/types';
import { logger } from '@/utils/logger';
import { Colors } from '@/constants/theme';
import { DatePickerInput } from '@/components/forms/DatePickerInput';

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 20,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 1,
  },
});

// Input con borde destacado al enfocar (usa tu tema)
const fiStyles = StyleSheet.create({
  focused: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
});

const FocusedInput = React.forwardRef<TextInput, TextInputProps>(
  ({ style, onFocus, onBlur, editable = true, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    return (
      <TextInput
        ref={ref}
        {...rest}
        editable={editable}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[globalStyles.input, style, editable && focused && fiStyles.focused]}
      />
    );
  }
);

export default function AddPatientScreen() {
  const [firstName, setFirstName] = useState('');
  const [paternalLastName, setPaternalLastName] = useState('');
  const [maternalLastName, setMaternalLastName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [physicalActivity, setPhysicalActivity] = useState('');

  const navigation = useNavigation();
  const { height } = useWindowDimensions();
  const firstNameInputRef = useRef<TextInput>(null);

  const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const dobDate = dateOfBirth ? new Date(dateOfBirth) : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      firstNameInputRef.current?.focus();
    }, 100); // Pequeño retardo para asegurar que la transición de pantalla haya terminado
    return () => clearTimeout(timer);
  }, []);

  const handleSavePatient = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedPaternalLastName = paternalLastName.trim();

    if (!trimmedFirstName || !trimmedPaternalLastName) {
      Alert.alert('Campos incompletos', 'Por favor, introduce al menos el nombre y el apellido paterno.');
      return;
    }

    const allowedGenders: Patient['gender'][] = ['masculino', 'femenino', 'otro', 'no especificado'];
    const normalizedGender = (() => {
      const g = gender.trim().toLowerCase();
      return (allowedGenders as string[]).includes(g) ? (g as Patient['gender']) : undefined;
    })();

    const newPatient: NewPatient = {
      first_name: trimmedFirstName,
      paternal_last_name: trimmedPaternalLastName,
      maternal_last_name: maternalLastName.trim(),
      document_number: documentNumber.trim(),
      date_of_birth: dateOfBirth.trim(),
      gender: normalizedGender,
      address: address.trim(),
      occupation: occupation.trim(),
      whatsapp: whatsapp.trim(),
      contact_phone: contactPhone.trim(),
      physical_activity: physicalActivity.trim(),
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
      logger.error('Error saving patient', error as Error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout title="Registrar Paciente">
        <View style={{ paddingBottom: 150 }}>
          <BaseCard>
            <Text style={globalStyles.label}>Nombres *</Text>
            <FocusedInput ref={firstNameInputRef} placeholder="Nombres del paciente" value={firstName} onChangeText={setFirstName} />

            <Text style={globalStyles.label}>Apellido Paterno *</Text>
            <FocusedInput placeholder="Apellido paterno" value={paternalLastName} onChangeText={setPaternalLastName} />

            <Text style={globalStyles.label}>Apellido Materno</Text>
            <FocusedInput placeholder="Apellido materno" value={maternalLastName} onChangeText={setMaternalLastName} />

            <Text style={globalStyles.label}>Número de Documento</Text>
            <FocusedInput placeholder="DNI o Cédula" value={documentNumber} onChangeText={setDocumentNumber} keyboardType="numeric" />

            <DatePickerInput
              title="Fecha de Nacimiento"
              date={dobDate}
              onDateChange={(d) => setDateOfBirth(toISODate(d))}
              display="spinner"
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />

            <Text style={globalStyles.label}>Sexo</Text>
            <FocusedInput placeholder="masculino / femenino / otro" value={gender} onChangeText={setGender} />

            <Text style={globalStyles.label}>Domicilio</Text>
            <FocusedInput placeholder="Dirección del paciente" value={address} onChangeText={setAddress} />
            
            <Text style={globalStyles.label}>Ocupación</Text>
            <FocusedInput placeholder="Ocupación actual" value={occupation} onChangeText={setOccupation} />

            <Text style={globalStyles.label}>WhatsApp</Text>
            <FocusedInput placeholder="Número de WhatsApp" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />

            <Text style={globalStyles.label}>Celular de Contacto</Text>
            <FocusedInput placeholder="Otro celular de contacto" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
            <FocusedInput placeholder="Tipo y frecuencia. Ej: Correr, 3/semana" value={physicalActivity} onChangeText={setPhysicalActivity} />
          </BaseCard>
        </View>
      </ScreenLayout>

      <View style={[styles.fabContainer, { top: height * 0.5 }]}>
        <FabButton
          variant="primary"
          onPress={handleSavePatient}
          accessibilityLabel="Guardar paciente"
          icon={<Ionicons name="checkmark" size={24} color="white" />}
        />
        <FabButton
          variant="neutral"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Cancelar registro"
          icon={<Ionicons name="close" size={24} color="white" />}
        />
      </View>
    </View>
  );
}
