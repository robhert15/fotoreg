import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, useWindowDimensions, TextInputProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { BaseCard } from '@/components/cards/BaseCard';
import { Ionicons } from '@expo/vector-icons';
import { FabButton } from '@/components/buttons/FabButton';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { addPatient, updatePatient } from '@/db/api/patients';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { globalStyles } from '@/styles/globalStyles';
import { NewPatient, Patient } from '@/types';
import { logger } from '@/utils/logger';
import { Colors } from '@/constants/theme';
import BirthDateInput from '@/components/forms/BirthDateInput';
import GenderInput from '@/components/forms/GenderInput';

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

type AddPatientScreenRouteProp = RouteProp<RootStackParamList, 'AddPatient'>;

export default function AddPatientScreen() {
  const route = useRoute<AddPatientScreenRouteProp>();
  const patientToEdit = route.params?.patient; // Paciente opcional para editar
  const isEditing = !!patientToEdit;
  const [firstName, setFirstName] = useState(patientToEdit?.first_name || '');
  const [paternalLastName, setPaternalLastName] = useState(patientToEdit?.paternal_last_name || '');
  const [maternalLastName, setMaternalLastName] = useState(patientToEdit?.maternal_last_name || '');
  const [documentNumber, setDocumentNumber] = useState(patientToEdit?.document_number || '');
  const [dateOfBirth, setDateOfBirth] = useState(patientToEdit?.date_of_birth || '');
  const [gender, setGender] = useState<'Masculino' | 'Femenino' | null>(
    patientToEdit?.gender ? (patientToEdit.gender.charAt(0).toUpperCase() + patientToEdit.gender.slice(1) as any) : null
  );
  const [address, setAddress] = useState(patientToEdit?.address || '');
  const [occupation, setOccupation] = useState(patientToEdit?.occupation || '');
  const [whatsapp, setWhatsapp] = useState(patientToEdit?.whatsapp || '');
  const [contactPhone, setContactPhone] = useState(patientToEdit?.contact_phone || '');
  const [physicalActivity, setPhysicalActivity] = useState(patientToEdit?.physical_activity || '');

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { height } = useWindowDimensions();
  const firstNameInputRef = useRef<TextInput>(null);

  const isoToDdmmyyyy = (iso: string): string => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const ddmmyyyyToISO = (ddmmyyyy: string | null): string => {
    if (!ddmmyyyy) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  useEffect(() => {
    if (!isEditing) {
      const timer = setTimeout(() => {
        firstNameInputRef.current?.focus();
      }, 100); // Pequeño retardo para asegurar que la transición de pantalla haya terminado
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const handleSavePatient = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedPaternalLastName = paternalLastName.trim();

    if (!trimmedFirstName || !trimmedPaternalLastName) {
      Alert.alert('Campos incompletos', 'Por favor, introduce al menos el nombre y el apellido paterno.');
      return;
    }

    const normalizedGender = gender ? (gender.toLowerCase() as Patient['gender']) : undefined;

    const patientData = {
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
      if (isEditing && patientToEdit) {
        await updatePatient(patientToEdit.id, patientData);
        Alert.alert('Éxito', 'Paciente actualizado correctamente.', [
          { text: 'OK', onPress: () => navigation.navigate('PatientDetail', { patientId: patientToEdit.id }) },
        ]);
      } else {
        await addPatient(patientData as NewPatient);
        Alert.alert('Éxito', 'Paciente registrado correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        Alert.alert('Error', 'El número de documento ya existe.');
      } else {
        Alert.alert('Error', `No se pudo ${isEditing ? 'actualizar' : 'registrar'} el paciente.`);
      }
      logger.error(`Error saving patient (editing: ${isEditing})`, error as Error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout title={isEditing ? 'Editar Paciente' : 'Registrar Paciente'}>
        <View style={{ paddingBottom: 150 }}>
          <BaseCard variant="form">
            <Text style={globalStyles.label}>Nombres *</Text>
            <FocusedInput ref={firstNameInputRef} placeholder="Nombres del paciente" value={firstName} onChangeText={setFirstName} />

            <Text style={globalStyles.label}>Apellido Paterno *</Text>
            <FocusedInput placeholder="Apellido paterno" value={paternalLastName} onChangeText={setPaternalLastName} />

            <Text style={globalStyles.label}>Apellido Materno</Text>
            <FocusedInput placeholder="Apellido materno" value={maternalLastName} onChangeText={setMaternalLastName} />

            <Text style={globalStyles.label}>Número de Documento</Text>
            <FocusedInput placeholder="DNI o Cédula" value={documentNumber} onChangeText={setDocumentNumber} keyboardType="numeric" />

            <BirthDateInput
              label="Fecha de Nacimiento"
              value={isoToDdmmyyyy(dateOfBirth)}
              onChange={(d) => setDateOfBirth(ddmmyyyyToISO(d))}
            />

            <GenderInput label="Sexo" value={gender} onValueChange={setGender} />

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
