import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { FabButton } from '@/components/buttons/FabButton';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getConsultationById, updateConsultation, createDraftFromConsultation, moveDraftPhotosToConsultation, deleteDraft } from '@/db/api/consultations';
import { getPatientById } from '@/db/api/patients';
import { NewConsultation, Patient } from '@/types';
import { globalStyles } from '@/styles/globalStyles';
import { PatientInfoCard } from '@/components/cards/PatientInfoCard';
import { Colors } from '@/constants/theme'; // Keep for ActivityIndicator color
import { ConsultationForm } from '@/components/forms/ConsultationForm';
import { logger } from '@/utils/logger';


export default function ConsultationDetailScreen() {

  const route = useRoute();
  const navigation = useNavigation();
  const { height } = useWindowDimensions();
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { consultationId } = route.params as { consultationId: number };
  
  const [consultation, setConsultation] = useState<Partial<NewConsultation>>({});
  const [originalConsultation, setOriginalConsultation] = useState<Partial<NewConsultation>>({});
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draftId, setDraftId] = useState<number | null>(null);

  useEffect(() => {
    const loadConsultation = async () => {
      try {
        setLoading(true);
        const data = await getConsultationById(consultationId);
        if (data) {
          const formData: Partial<NewConsultation> = {
            ...data,
            // Ya llegan deserializados desde la capa de datos; usamos fallbacks seguros
            medical_conditions: Array.isArray((data as any).medical_conditions)
              ? (data as any).medical_conditions
              : [],
            habits:
              typeof (data as any).habits === 'object' && (data as any).habits !== null
                ? (data as any).habits
                : {},
          };
          setConsultation(formData);
          setOriginalConsultation(formData);

          // Cargar información del paciente
          if (formData.patient_id) {
            const patientData = await getPatientById(formData.patient_id);
            setPatient(patientData);
          }
        } else {
          throw new Error('Consulta no encontrada');
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar la consulta.');
      } finally {
        setLoading(false);
      }
    };
    loadConsultation();
  }, [consultationId]);

  const handleSave = async () => {
    try {
      // La capa de datos serializa internamente; enviamos el objeto tal cual
      await updateConsultation(consultationId, consultation);
      if (draftId) {
        await moveDraftPhotosToConsultation(draftId, consultationId);
        await deleteDraft(draftId);
        setDraftId(null);
      }
      Alert.alert('Éxito', 'Consulta actualizada correctamente.');
      setOriginalConsultation(consultation);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar los cambios.');
      logger.error('ConsultationDetailScreen save failed', error as Error);
    }
  };

  const handleCancel = async () => {
    try {
      if (draftId) {
        await deleteDraft(draftId);
        setDraftId(null);
      }
    } finally {
      setConsultation(originalConsultation);
      setIsEditing(false);
    }
  };

  const handleStartEdit = async () => {
    if (!consultation || !consultation.patient_id) {
      Alert.alert('Error', 'No se puede iniciar la edición: falta el paciente.');
      return;
    }
    try {
      const draft = await createDraftFromConsultation(consultation.patient_id, consultationId);
      setDraftId(draft.id);
      setIsEditing(true);
    } catch (e) {
      Alert.alert('Error', 'No se pudo iniciar la edición.');
      logger.error('ConsultationDetailScreen start edit failed', e as Error);
    }
  };

    if (loading) {
    return (
      <ScreenLayout title="Cargando...">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </ScreenLayout>
    );
  }

  const lastNames = patient ? [patient.paternal_last_name, patient.maternal_last_name].filter(Boolean).join(' ') : '';
  const displayName = patient && lastNames ? `${lastNames}, ${patient.first_name}` : (patient?.first_name || 'Paciente');

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout title={displayName} scrollRef={scrollRef}>
        <View style={{ paddingBottom: 150 }}>
          {/* Tarjeta de información del paciente */}
          {patient && (
            <View style={{ marginBottom: 20 }}>
              <Text style={globalStyles.title}>Datos del Paciente</Text>
              <PatientInfoCard patient={patient} />
            </View>
          )}


          {/* Formulario de consulta */}
          <ConsultationForm
            formData={consultation}
            setFormData={setConsultation}
            isReadOnly={!isEditing}
            draftId={draftId}
            consultationId={consultationId}
            autoFocusFirstInput={isEditing}
            scrollRef={scrollRef}
          />
        </View>
      </ScreenLayout>

      <View style={[styles.fabContainer, { top: height * 0.5 }]}>
        {isEditing ? (
          <>
            <FabButton
              variant="neutral"
              onPress={handleCancel}
              accessibilityLabel="Cancelar edición"
              icon={<Ionicons name="close" size={24} color="white" />}
            />
            <FabButton
              variant="primary"
              onPress={handleSave}
              accessibilityLabel="Guardar cambios"
              icon={<Ionicons name="checkmark" size={24} color="white" />}
            />
          </>
        ) : (
          <FabButton
            variant="primary"
            onPress={handleStartEdit}
            accessibilityLabel="Editar consulta"
            icon={<Ionicons name="pencil" size={24} color="white" />}
          />
        )}
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
});
