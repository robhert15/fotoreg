import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, ScrollView } from 'react-native';
import { ConsultationCard } from '@/components/cards/ConsultationCard';
import { BaseCard } from '@/components/cards/BaseCard';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
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

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const patientData = await getPatientById(patientId);
          setPatient(patientData);
          if (patientData) {
            const consultationHistory = await getConsultationsForPatient(patientData.id);
            setConsultations(consultationHistory);
          }
        } catch (error) {
          Alert.alert('Error', 'No se pudo cargar la información del paciente.');
        }
      };
      loadData();
    }, [patientId])
  );

    if (!patient) {
    return (
      <ScreenLayout title="Cargando...">
        <Text style={globalStyles.emptyText}>Cargando datos del paciente...</Text>
      </ScreenLayout>
    );
  }
  
  const handleNewConsultation = () => {
    navigation.navigate('NewConsultation', { patientId: patient.id });
  };
  
    return (
    <ScreenLayout title={patient.name}>
      <View style={globalStyles.contentContainer}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }}>
          {/* Tarjeta de Detalles del Paciente */}
          <View style={{ marginBottom: 20 }}>
            <BaseCard>
              <Text style={globalStyles.title}>Detalles</Text>
              <Text style={globalStyles.bodyText}>Documento: {patient.documentNumber}</Text>
              <Text style={globalStyles.bodyText}>Ocupación: {patient.occupation || 'No especificado'}</Text>
              <Text style={globalStyles.bodyText}>Miembro desde: {new Date(patient.createdAt).toLocaleDateString('es-ES')}</Text>
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
        </ScrollView>
      </View>

      <Pressable style={globalStyles.fab} onPress={handleNewConsultation}>
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </ScreenLayout>
  );
}

