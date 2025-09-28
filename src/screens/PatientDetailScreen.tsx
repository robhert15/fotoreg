import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      const loadData = async () => {
        try {
          const patientData = await getPatientById(patientId);
          if (!patientData) {
            throw new Error('Paciente no encontrado');
          }
          setPatient(patientData);
          try {
            const consultationHistory = await getConsultationsForPatient(patientData.id);
            setConsultations(consultationHistory);
          } catch (e) {
            console.warn('No se pudo obtener el historial de consultas para el paciente', patientId, e);
            setConsultations([]);
          }
        } catch (error) {
          Alert.alert('Error', 'No se pudo cargar la información del paciente.');
          console.error('PatientDetailScreen loadData failed:', error);
        }
      };
      loadData();
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
  
    // Compatibilidad V2/V3: construir valores seguros para mostrar
  const displayName = ((patient as any).name as string) ?? [
    (patient as any).first_name,
    (patient as any).last_name,
  ]
    .filter(Boolean)
    .join(' ');
  const displayDocument = ((patient as any).documentNumber as string) ?? (patient as any).document_number ?? 'No especificado';
  const displayCreatedAt = new Date(((patient as any).createdAt ?? (patient as any).created_at) ?? new Date().toISOString()).toLocaleDateString('es-ES');

  return (
    <View style={globalStyles.container}>
      <ParallaxScrollView
        headerHeight={138}
        header={
          <View style={[styles.headerContainer, { backgroundColor: headerBackgroundColor }]}>
            <Text style={styles.headerTitle}>{displayName || 'Paciente'}</Text>
          </View>
        }>
        <View style={[styles.contentContainer, { backgroundColor: contentBackgroundColor }]}>
            {/* Tarjeta de Detalles del Paciente */}
            <View style={{ marginBottom: 20 }}>
              <BaseCard>
                <Text style={globalStyles.title}>Detalles</Text>
                <Text style={globalStyles.bodyText}>Documento: {displayDocument}</Text>
                <Text style={globalStyles.bodyText}>Ocupación: {(patient as any).occupation || 'No especificado'}</Text>
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

      {/* Botones de navegación flotantes */}
      <SafeAreaView style={styles.headerOverlay}>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
      </SafeAreaView>

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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  headerButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
  },
});


