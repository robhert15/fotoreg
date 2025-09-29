import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { ConsultationCard } from '@/components/cards/ConsultationCard';
import { BaseCard } from '@/components/cards/BaseCard';
import { Ionicons } from '@expo/vector-icons';
import { ParallaxScrollView } from '@/components/layout/ParallaxScrollView';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getPatientById } from '@/db/api/patients';
import { getConsultationsForPatient } from '@/db/api/consultations';
import { Patient, Consultation } from '@/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { globalStyles } from '@/styles/globalStyles';

type PatientDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PatientDetail'
>;

export default function PatientDetailScreen() {
  const navigation = useNavigation<PatientDetailNavigationProp>();
  const route = useRoute();
  const { patientId } = route.params as { patientId: number };
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const headerBackgroundColor = useThemeColor({}, 'primary');
  const contentBackgroundColor = useThemeColor({}, 'background');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true; // Flag to check if component is still mounted

      const loadData = async () => {
        try {
          const patientData = await getPatientById(patientId);
          if (!isMounted) return; // Exit if component was unmounted

          if (!patientData) {
            throw new Error('Paciente no encontrado');
          }
          setPatient(patientData);

          try {
            const consultationHistory = await getConsultationsForPatient(patientData.id);
            if (isMounted) { // Check again before setting state
              setConsultations(consultationHistory);
            }
          } catch (e) {
            console.warn('No se pudo obtener el historial de consultas para el paciente', patientId, e);
            if (isMounted) {
              setConsultations([]);
            }
          }
        } catch (error) {
          if (isMounted) { // Only show alert if component is mounted
            Alert.alert('Error', 'No se pudo cargar la información del paciente.');
          }
          console.error('PatientDetailScreen loadData failed:', error);
        }
      };

      loadData();

      return () => {
        isMounted = false; // Cleanup function sets flag to false
      };
    }, [patientId])
  );

  if (!patient) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={globalStyles.emptyText}>Cargando datos del paciente...</Text>
      </View>
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
    <View style={globalStyles.container}>
      <ParallaxScrollView
        headerHeight={138}
        header={
          <View style={[styles.headerContainer, { backgroundColor: headerBackgroundColor }]}>
            <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Text style={styles.headerTitle}>{displayName || 'Paciente'}</Text>
            {/* Spacer to keep title centered */}
            <View style={{ width: 44 }} />
          </View>
        }>
        <View style={[styles.contentContainer, { backgroundColor: contentBackgroundColor }]}>
            {/* Tarjeta de Detalles del Paciente */}
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

            {/* Historial de Consultas */}
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
      </ParallaxScrollView>

      <Pressable style={globalStyles.fab} onPress={handleNewConsultation}>
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingBottom: 150,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden', // Forzar al contenido a respetar los bordes redondeados
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
  },
});


