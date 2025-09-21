import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, FlatList } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getPatientById } from '@/db/api/patients';
import { getConsultationsForPatient } from '@/db/api/consultations';
import { Patient, Consultation } from '@/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Colors } from '@/constants/theme';

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
    return <View style={styles.container}><Text>Cargando...</Text></View>;
  }
  
  const handleNewConsultation = () => {
    navigation.navigate('NewConsultation', { patientId: patient.id });
  };
  
  const renderConsultationItem = ({ item }: { item: Consultation }) => (
    <Pressable 
      style={styles.card}
      onPress={() => navigation.navigate('ConsultationDetail', { consultationId: item.id })}
    >
      <Text style={styles.cardDate}>
        {new Date(item.consultation_date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      <Text style={styles.cardReason}>{item.reason || 'Consulta general'}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.name}>{patient.name}</Text>
              <Text style={styles.detail}>Documento: {patient.documentNumber}</Text>
            </View>
            <Pressable style={styles.button} onPress={handleNewConsultation}>
              <Text style={styles.buttonText}>+ Nueva Consulta</Text>
            </Pressable>
            <Text style={styles.historyTitle}>Historial de Consultas</Text>
          </>
        }
        data={consultations}
        renderItem={renderConsultationItem}
        keyExtractor={(item: Consultation) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Este paciente aún no tiene consultas registradas.</Text>}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text,
  },
  detail: {
    fontSize: 16,
    color: '#555',
  },
  button: {
    backgroundColor: Colors.primary, // <-- Usando el color corporativo
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cardReason: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});
