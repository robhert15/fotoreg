import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FabButton } from '@/components/buttons/FabButton';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getConsultationById, updateConsultation, createDraftFromConsultation, moveDraftPhotosToConsultation, deleteDraft } from '@/db/api/consultations';
import { getPatientById } from '@/db/api/patients';
import { NewConsultation, Patient } from '@/types';
import { globalStyles } from '@/styles/globalStyles';
import { BaseCard } from '@/components/cards/BaseCard';
import { Colors } from '@/constants/theme'; // Keep for ActivityIndicator color
import { ConsultationForm } from '@/components/forms/ConsultationForm';
import { logger } from '@/utils/logger';


export default function ConsultationDetailScreen() {

  const route = useRoute();
  const navigation = useNavigation();
  const { height } = useWindowDimensions();
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

    const consultationDate = new Date(consultation.consultation_date || Date.now()).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const patientName = patient ? [patient.first_name, patient.paternal_last_name, patient.maternal_last_name].filter(Boolean).join(' ') : 'Paciente';

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout title={`Consulta del ${consultationDate}`}>
        <View style={{ paddingBottom: 150 }}>
          {/* Tarjeta de información del paciente */}
          {patient && (
            <View style={{ marginBottom: 20 }}>
              <BaseCard 
                onPress={() => (navigation as any).navigate('PatientDetail', { patientId: patient.id })}
                indicatorVariant="info"
              >
                <Text style={globalStyles.title}>Paciente</Text>
                <Text style={globalStyles.bodyText}>Nombre: {patientName}</Text>
                <Text style={globalStyles.bodyText}>Documento: {patient.document_number || 'No especificado'}</Text>
                {patient.date_of_birth && (
                  <Text style={globalStyles.bodyText}>
                    Edad: {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} años
                  </Text>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Ionicons name="person-outline" size={16} color="#3B82F6" style={{ marginRight: 5 }} />
                  <Text style={[globalStyles.bodyText, { color: '#3B82F6' }]}>Ver perfil completo</Text>
                </View>
              </BaseCard>
            </View>
          )}

          {/* Tarjeta de información de la consulta */}
          <View style={{ marginBottom: 20 }}>
            <BaseCard indicatorVariant="success">
              <Text style={globalStyles.title}>Información de la Consulta</Text>
              <Text style={globalStyles.bodyText}>Fecha: {consultationDate}</Text>
              {consultation.reason && (
                <Text style={globalStyles.bodyText}>Motivo: {consultation.reason}</Text>
              )}
              {consultation.diagnosis && (
                <Text style={globalStyles.bodyText}>Diagnóstico: {consultation.diagnosis}</Text>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Ionicons 
                  name={isEditing ? "create-outline" : "document-text-outline"} 
                  size={16} 
                  color={isEditing ? "#F59E0B" : "#10B981"} 
                  style={{ marginRight: 5 }} 
                />
                <Text style={[globalStyles.bodyText, { color: isEditing ? "#F59E0B" : "#10B981" }]}>
                  {isEditing ? 'Editando...' : 'Solo lectura'}
                </Text>
              </View>
            </BaseCard>
          </View>

          {/* Formulario de consulta */}
          <ConsultationForm
            formData={consultation}
            setFormData={setConsultation}
            isReadOnly={!isEditing}
            draftId={draftId}
            consultationId={consultationId}
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
