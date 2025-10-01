import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NewConsultation } from '@/types';
import { 
  findOrCreateDraft, 
  updateDraft, 
  finalizeConsultation,
  deletePhotosForConsultation,
  deleteDraft
} from '@/db/api/consultations';
import { ConsultationForm } from '@/components/forms/ConsultationForm';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { FabButton } from '@/components/buttons/FabButton';
import { globalStyles } from '@/styles/globalStyles';

export default function NewConsultationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { patientId } = route.params as { patientId: number };
  
  const [draftId, setDraftId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<NewConsultation>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await findOrCreateDraft(patientId);
        const parsedData = draft.consultation_data ? JSON.parse(draft.consultation_data) : {};

        if (Object.keys(parsedData).length > 0) {
          Alert.alert(
            "Borrador Encontrado",
            "Se encontró una consulta sin terminar. ¿Qué deseas hacer?",
            [
              {
                text: "Continuar Borrador",
                onPress: () => {
                  setFormData(parsedData);
                  setDraftId(draft.id);
                  setIsLoading(false);
                }
              },
              {
                text: "Empezar Nuevo",
                onPress: async () => {
                  await deletePhotosForConsultation(draft.id);
                  await updateDraft(draft.id, {});
                  setFormData({});
                  setDraftId(draft.id);
                  setIsLoading(false);
                }
              },
              { text: "Cancelar", style: "cancel", onPress: () => navigation.goBack() }
            ]
          );
        } else {
          setFormData({});
          setDraftId(draft.id);
          setIsLoading(false);
        }
      } catch (error) {
        Alert.alert("Error", "No se pudo iniciar la nueva consulta.");
        console.error(error);
        navigation.goBack();
      }
    };

    loadDraft();
  }, [patientId, navigation]);

  useEffect(() => {
    if (!isLoading && draftId) {
      const handler = setTimeout(() => {
        updateDraft(draftId, formData);
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [formData, draftId, isLoading]);

  const handleFinalSave = useCallback(async () => {
    if (!draftId) return;
    try {
      await finalizeConsultation(draftId, patientId, formData);
      Alert.alert('Éxito', 'La consulta ha sido guardada correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al guardar la consulta.');
      console.error(error);
    }
  }, [draftId, patientId, formData, navigation]);

  const handleCancel = useCallback(() => {
    if (!draftId) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      'Cancelar',
      'Se descartarán los cambios y las fotos tomadas. ¿Deseas continuar?',
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
              console.error('Error al descartar el borrador:', err);
            } finally {
              navigation.goBack();
            }
          },
        },
      ]
    );
  }, [draftId, navigation]);
  
  if (isLoading) {
    return <ScreenLayout title="Cargando..."><View /></ScreenLayout>; // Render placeholder content
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout title="Nueva Consulta">
        <View style={{ padding: 20, paddingBottom: 150 }}>
          <ConsultationForm
            formData={formData}
            setFormData={setFormData}
            isReadOnly={false}
            draftId={draftId}
          />
        </View>
      </ScreenLayout>

      {/* Botones de Acción Flotantes en el pie de página */}
      <FabButton
        style={[globalStyles.fab, { right: 90 }]}
        variant="neutral"
        onPress={handleCancel}
        accessibilityLabel="Cancelar consulta"
        icon={<Ionicons name="close" size={24} color="white" />}
      />
      <FabButton
        style={globalStyles.fab}
        variant="primary"
        onPress={handleFinalSave}
        accessibilityLabel="Guardar consulta"
        icon={<Ionicons name="checkmark" size={24} color="white" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Los estilos de los botones ahora se manejan globalmente a través de FabButton y globalStyles
});