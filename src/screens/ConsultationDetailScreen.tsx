import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
            medical_conditions: data.medical_conditions ? JSON.parse(data.medical_conditions) : [],
            habits: data.habits ? JSON.parse(data.habits) : {},
          };
          setConsultation(formData);
          setOriginalConsultation(formData);
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
      const dataToSave: any = {
        ...consultation,
        medical_conditions: JSON.stringify(consultation.medical_conditions || []),
        habits: JSON.stringify(consultation.habits || {}),
      };
      await updateConsultation(consultationId, dataToSave);
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
    <ScreenLayout title={`Consulta del ${consultationDate}`}>
      <View style={globalStyles.contentContainer}>
        <ScrollView 
          contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
          keyboardShouldPersistTaps="handled"
        >
          <ConsultationForm
            formData={consultation as any}
            setFormData={setConsultation as any}
            isReadOnly={!isEditing}
            draftId={draftId}
            consultationId={consultationId}
          />
        </ScrollView>
      </View>

      {isEditing ? (
        <>
          <Pressable style={[globalStyles.fab, { right: 90, backgroundColor: Colors.light.icon }]} onPress={handleCancel}>
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
          <Pressable style={globalStyles.fab} onPress={handleSave}>
            <Ionicons name="checkmark" size={24} color="white" />
          </Pressable>
        </>
      ) : (
        <Pressable style={globalStyles.fab} onPress={handleStartEdit}>
          <Ionicons name="pencil" size={24} color="white" />
        </Pressable>
      )}
    </ScreenLayout>
  );
}

