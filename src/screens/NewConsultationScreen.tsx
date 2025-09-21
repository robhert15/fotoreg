import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NewConsultation } from '@/types';
import { 
  findOrCreateDraft, 
  updateDraft, 
  finalizeConsultation,
  deletePhotosForConsultation,
  deleteDraft,
} from '@/db/api/consultations';
import { ConsultationForm } from '@/components/forms/ConsultationForm';
import { globalStyles } from '@/styles/globalStyles';

// --- FIN componentes internos ---

// --- COMPONENTE PRINCIPAL ---

export default function NewConsultationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { patientId } = route.params as { patientId: number };
  
  const [draftId, setDraftId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<NewConsultation>>({});

  // useEffect de carga SIMPLIFICADO: solo para crear.
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await findOrCreateDraft(patientId);
        // Limpiar cualquier dato residual del borrador y sus fotos
        await deletePhotosForConsultation(draft.id);
        await updateDraft(draft.id, {});
        setDraftId(draft.id);
        setFormData({});
      } catch (error) {
        Alert.alert('Error', 'No se pudo iniciar la nueva consulta.');
        console.error(error);
      }
    };
    loadDraft();
  }, [patientId]);

  const handleCancel = () => {
    if (!draftId) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      'Cancelar',
      'Se descartarán los cambios y las fotos tomadas en esta nueva consulta. ¿Deseas continuar?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, descartar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhotosForConsultation(draftId);
              await deleteDraft(draftId);
            } catch (err) {
              console.error(err);
            } finally {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  // Autoguardado
  useEffect(() => {
    if (draftId) {
      const handler = setTimeout(() => {
        // Guardamos el borrador tal cual (objetos/arrays nativos). updateDraft serializa el objeto completo.
        updateDraft(draftId, formData);
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [formData, draftId]);

  // handleFinalSave SIMPLIFICADO: solo para crear.
  const handleFinalSave = async () => {
    if (!draftId) {
      Alert.alert('Error', 'No hay un borrador activo para guardar.');
      return;
    }
    try {
      const finalData: NewConsultation = {
        ...formData,
        consultation_date: formData.consultation_date || new Date().toISOString(),
        medical_conditions: JSON.stringify(formData.medical_conditions || []),
        habits: JSON.stringify(formData.habits || {}),
      } as any;

      await finalizeConsultation(draftId, patientId, finalData);
      Alert.alert('Éxito', 'La consulta ha sido guardada correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al guardar la consulta.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>Nueva Consulta</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <ConsultationForm
          formData={formData}
          setFormData={setFormData}
          isReadOnly={false}
          draftId={draftId}
        />
      </ScrollView>
      <View style={globalStyles.footer}>
        <Pressable style={[globalStyles.button, globalStyles.buttonCancel, { marginRight: 10 }]} onPress={handleCancel}>
          <Text style={globalStyles.buttonText}>Cancelar</Text>
        </Pressable>
        <Pressable style={[globalStyles.button, globalStyles.buttonPrimary, { marginLeft: 10 }]} onPress={handleFinalSave}>
          <Text style={globalStyles.buttonText}>Guardar Consulta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}