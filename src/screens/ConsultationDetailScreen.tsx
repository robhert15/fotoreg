import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getConsultationById, updateConsultation, createDraftFromConsultation, moveDraftPhotosToConsultation, deleteDraft } from '@/db/api/consultations';
import { Consultation } from '@/types';
import { Colors } from '@/constants/theme';
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
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ConsultationForm
          formData={consultation as any}
          setFormData={setConsultation as any}
          isReadOnly={!isEditing}
          draftId={draftId}
          consultationId={consultationId}
        />
      </ScrollView>
      
      <View style={styles.footer}>
        {isEditing ? (
          <>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Guardar Cambios</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={[styles.button, styles.editButton]} onPress={handleStartEdit}>
            <Text style={styles.buttonText}>Editar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 120 },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.success,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    marginRight: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
