import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { BaseButton } from '@/components/buttons/BaseButton';

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
    return <SafeAreaView style={styles.container}><Text>Cargando...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nueva Consulta</Text>
      </View>
      
      <ScrollView keyboardShouldPersistTaps="handled">
        <ConsultationForm
          formData={formData}
          setFormData={setFormData}
          isReadOnly={false}
          draftId={draftId}
        />
      </ScrollView>
      
      <View style={styles.footer}>
        <BaseButton title="Cancelar" variant="outline" onPress={handleCancel} style={{ flex: 1, marginRight: 5 }} />
        <BaseButton title="Guardar" variant="primary" onPress={handleFinalSave} style={{ flex: 1, marginLeft: 5 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    backgroundColor: Colors.light.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  footer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderColor,
  },
  // Botones migrados a BaseButton
});