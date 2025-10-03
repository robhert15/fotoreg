import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, useFocusEffect, RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, BottomTabParamList } from '@/navigation/AppNavigator';

import { ConsultationCard } from '@/components/cards/ConsultationCard';
import { PatientInfoCard } from '@/components/cards/PatientInfoCard';
import { Ionicons } from '@expo/vector-icons';
import { FabButton } from '@/components/buttons/FabButton';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { globalStyles } from '@/styles/globalStyles';
import { Patient, Consultation } from '@/types';
import { getPatientById, updatePatientAccessTimestamp } from '@/db/api/patients';
import { getConsultationsForPatient } from '@/db/api/consultations';
import { logger } from '@/utils/logger';

type PatientDetailScreenRouteProp = RouteProp<RootStackParamList, 'PatientDetail'>;

type PatientDetailNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList, 'PatientDetail'>,
  BottomTabNavigationProp<BottomTabParamList>
>;

export default function PatientDetailScreen() {
  const navigation = useNavigation<PatientDetailNavigationProp>();
  const route = useRoute<PatientDetailScreenRouteProp>();
  const { height } = useWindowDimensions();
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

          // Actualizar la marca de tiempo de último acceso
          await updatePatientAccessTimestamp(patientId);

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

  const lastNames = [patient.paternal_last_name, patient.maternal_last_name].filter(Boolean).join(' ');
  const displayName = lastNames ? `${lastNames}, ${patient.first_name}` : patient.first_name;

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout 
        title={displayName || 'Paciente'}
        onBackPress={() => navigation.navigate('MainTabs', { screen: 'PatientsStack' })}
      >
        <View style={[styles.contentContainer, { backgroundColor: contentBackgroundColor }]}>
            <View style={{ marginBottom: 20 }}>
              <Text style={globalStyles.title}>Datos del Paciente</Text>
              <PatientInfoCard patient={patient} />
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

      <View style={[styles.fabContainer, { top: height * 0.5 }]}>
        <FabButton
          variant="primary"
          onPress={() => navigation.navigate('AddPatient', { patient: patient })}
          accessibilityLabel="Editar paciente"
          icon={<Ionicons name="pencil" size={24} color="white" />}
        />
        <FabButton
          variant="primary"
          onPress={handleNewConsultation}
          accessibilityLabel="Nueva consulta"
          icon={<Ionicons name="add" size={24} color="white" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 20,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 1,
  },
  contentContainer: {
    paddingBottom: 150,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
});
