import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FabButton } from '@/components/buttons/FabButton';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getConsultationById, updateConsultation, createDraftFromConsultation, moveDraftPhotosToConsultation, deleteDraft } from '@/db/api/consultations';
import { Consultation } from '@/types';
import { globalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme'; // Keep for ActivityIndicator color
import { ConsultationForm } from '@/components/forms/ConsultationForm';


export default function ConsultationDetailScreen() {

  const route = useRoute();
  const navigation = useNavigation();
  const { consultationId } = route.params as { consultationId: number };
  
  const [consultation, setConsultation] = useState<Partial<Consultation>>({});
  const [originalConsultation, setOriginalConsultation] = useState<Partial<Consultation>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draftId, setDraftId] = useState<number | null>(null);

  useEffect(() => {
    const loadConsultation = async () => {
      try {
        setLoading(true);
        const data = await getConsultationById(consultationId);
        if (data) {
          const formData: Partial<Consultation> = {
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
      await updateConsultation(consultationId, consultation as any);
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
      console.error(error);
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
      console.error(e);
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

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout title={`Consulta del ${consultationDate}`}>
        <View style={{ padding: 20, paddingBottom: 150 }}>
          <ConsultationForm
            formData={consultation as any}
            setFormData={setConsultation as any}
            isReadOnly={!isEditing}
            draftId={draftId}
            consultationId={consultationId}
          />
        </View>
      </ScreenLayout>

      {isEditing ? (
        <>
          <FabButton
            style={[globalStyles.fab, { right: 90 }]}
            variant="neutral"
            onPress={handleCancel}
            accessibilityLabel="Cancelar edición"
            icon={<Ionicons name="close" size={24} color="white" />}
          />
          <FabButton
            style={globalStyles.fab}
            variant="primary"
            onPress={handleSave}
            accessibilityLabel="Guardar cambios"
            icon={<Ionicons name="checkmark" size={24} color="white" />}
          />
        </>
      ) : (
        <FabButton
          style={globalStyles.fab}
          variant="primary"
          onPress={handleStartEdit}
          accessibilityLabel="Editar consulta"
          icon={<Ionicons name="pencil" size={24} color="white" />}
        />
      )}
    </View>
  );
}

