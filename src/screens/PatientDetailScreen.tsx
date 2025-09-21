import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, FlatList } from 'react-native';
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
    return <View style={globalStyles.container}><Text style={globalStyles.emptyText}>Cargando...</Text></View>;
  }
  
  const handleNewConsultation = () => {
    navigation.navigate('NewConsultation', { patientId: patient.id });
  };
  
  const renderConsultationItem = ({ item }: { item: Consultation }) => (
    <Pressable 
      style={globalStyles.card}
      onPress={() => navigation.navigate('ConsultationDetail', { consultationId: item.id })}
    >
      <Text style={globalStyles.cardSubtitle}>
        {new Date(item.consultation_date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      <Text style={globalStyles.cardTitle}>{item.visit_reason || 'Consulta general'}</Text>
    </Pressable>
  );

  return (
    <View style={globalStyles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={[globalStyles.sectionBox, { marginBottom: 20 }]}>
              <Text style={globalStyles.title}>{patient.name}</Text>
              <Text style={globalStyles.bodyText}>Documento: {patient.documentNumber}</Text>
            </View>
            <Pressable style={[globalStyles.button, globalStyles.buttonPrimary, { flex: 0, marginBottom: 20 }]} onPress={handleNewConsultation}>
              <Text style={globalStyles.buttonText}>+ Nueva Consulta</Text>
            </Pressable>
            <Text style={globalStyles.sectionTitle}>Historial de Consultas</Text>
          </>
        }
        data={consultations}
        renderItem={renderConsultationItem}
        keyExtractor={(item: Consultation) => item.id.toString()}
        ListEmptyComponent={<Text style={globalStyles.emptyText}>Este paciente aún no tiene consultas registradas.</Text>}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

