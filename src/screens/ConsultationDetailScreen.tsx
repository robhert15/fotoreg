import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
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
    return <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={Colors.light.primary} /></View>;
  }

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <ConsultationForm
          formData={consultation as any}
          setFormData={setConsultation as any}
          isReadOnly={!isEditing}
          draftId={draftId}
          consultationId={consultationId}
        />
      </ScrollView>
      
      <View style={globalStyles.footer}>
        {isEditing ? (
          <>
            <Pressable style={[globalStyles.button, globalStyles.buttonCancel, { marginRight: 10 }]} onPress={handleCancel}>
              <Text style={globalStyles.buttonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={[globalStyles.button, globalStyles.buttonPrimary, { marginLeft: 10 }]} onPress={handleSave}>
              <Text style={globalStyles.buttonText}>Guardar Cambios</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={handleStartEdit}>
            <Text style={globalStyles.buttonText}>Editar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

