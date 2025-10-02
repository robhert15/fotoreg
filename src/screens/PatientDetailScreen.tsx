import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { ConsultationCard } from '@/components/cards/ConsultationCard';
import { BaseCard } from '@/components/cards/BaseCard';
import { Ionicons } from '@expo/vector-icons';
import { FabButton } from '@/components/buttons/FabButton';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFabPosition } from '@/hooks/useFabPosition';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { globalStyles } from '@/styles/globalStyles';
import { Patient, Consultation } from '@/types';
import { getPatientById } from '@/db/api/patients';
import { getConsultationsForPatient } from '@/db/api/consultations';
import { logger } from '@/utils/logger';
import { RootStackParamList } from '@/navigation/AppNavigator';

type PatientDetailScreenRouteProp = RouteProp<RootStackParamList, 'PatientDetail'>;
type PatientDetailNavigationProp = StackNavigationProp<RootStackParamList, 'PatientDetail'>;

export default function PatientDetailScreen() {
  const navigation = useNavigation<PatientDetailNavigationProp>();
  const route = useRoute<PatientDetailScreenRouteProp>();
  const { fabTop } = useFabPosition();
  const { patientId } = route.params;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const headerBackgroundColor = useThemeColor({}, 'primary');
  const contentBackgroundColor = useThemeColor({}, 'background');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadData = async () => {
        try {
          const patientData = await getPatientById(patientId);
          if (!isMounted) return;

          if (!patientData) {
            throw new Error('Paciente no encontrado');
          }
          setPatient(patientData);

          const consultationHistory = await getConsultationsForPatient(patientData.id);
          if (isMounted) {
            setConsultations(consultationHistory);
          }
        } catch (error) {
          if (isMounted) {
            Alert.alert('Error', 'No se pudo cargar la información del paciente.');
          }
          logger.error('PatientDetailScreen loadData failed', error as Error);
        }
      };

      loadData();

      return () => {
        isMounted = false;
      };
    }, [patientId])
  );

  if (!patient) {
    return (
      <ScreenLayout title="Cargando...">
        <View style={[styles.contentContainer, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color={headerBackgroundColor} />
        </View>
      </ScreenLayout>
    );
  }

  const handleNewConsultation = () => {
    navigation.navigate('NewConsultation', { patientId: patient.id });
  };

  const displayName = [patient.first_name, patient.paternal_last_name, patient.maternal_last_name].filter(Boolean).join(' ');
  const displayDocument = patient.document_number ?? 'No especificado';
  const displayCreatedAt = new Date(patient.created_at).toLocaleDateString('es-ES');

  const calculateAge = (dob: string | undefined) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(patient.date_of_birth);

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout title={displayName || 'Paciente'}>
        <View style={[styles.contentContainer, { backgroundColor: contentBackgroundColor }]}>
            <View style={{ marginBottom: 20 }}>
              <BaseCard>
                <Text style={globalStyles.title}>Detalles</Text>
                <Text style={globalStyles.bodyText}>Documento: {displayDocument}</Text>
                {patient.date_of_birth && <Text style={globalStyles.bodyText}>Fecha de Nacimiento: {new Date(patient.date_of_birth).toLocaleDateString('es-ES')}{age !== null ? ` (${age} años)` : ''}</Text>}
                {patient.gender && <Text style={globalStyles.bodyText}>Sexo: {patient.gender}</Text>}
                <Text style={globalStyles.bodyText}>Ocupación: {patient.occupation || 'No especificado'}</Text>
                {patient.address && <Text style={globalStyles.bodyText}>Domicilio: {patient.address}</Text>}
                {patient.whatsapp && <Text style={globalStyles.bodyText}>WhatsApp: {patient.whatsapp}</Text>}
                {patient.contact_phone && <Text style={globalStyles.bodyText}>Celular: {patient.contact_phone}</Text>}
                {patient.physical_activity && <Text style={globalStyles.bodyText}>Actividad Física: {patient.physical_activity}</Text>}
                <Text style={globalStyles.bodyText}>Miembro desde: {displayCreatedAt}</Text>
              </BaseCard>
            </View>

            <Text style={globalStyles.title}>Historial de Consultas</Text>
            {consultations.length > 0 ? (
              consultations.map((item) => (
                <ConsultationCard
                  key={item.id}
                  consultation={item}
                  onPress={() => navigation.navigate('ConsultationDetail', { consultationId: item.id })}
                />
              ))
            ) : (
              <Text style={globalStyles.emptyText}>Este paciente aún no tiene consultas.</Text>
            )}
        </View>
      </ScreenLayout>

      <FabButton
        style={[globalStyles.fab, { top: fabTop }]}
        variant="primary"
        onPress={handleNewConsultation}
        accessibilityLabel="Nueva consulta"
        icon={<Ionicons name="add" size={24} color="white" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 150,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
});
