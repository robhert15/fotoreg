import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, FlatList, Alert, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { DatePickerInput } from './DatePickerInput';
import { CheckboxGroup } from './Checkbox';
import { RadioGroup } from './RadioGroup';
import ImageViewing from 'react-native-image-viewing';
import { NewConsultation, Photo } from '@/types';
import { addPhoto, getPhotosForConsultation } from '@/db/api/consultations';

export interface ConsultationFormProps {
  formData: Partial<NewConsultation>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<NewConsultation>>>;
  isReadOnly?: boolean;
  draftId: number | null;
  consultationId?: number; // para combinar fotos en modo edición/lectura
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  formData,
  setFormData,
  isReadOnly = false,
  draftId,
  consultationId,
}) => {
  const navigation = useNavigation<any>();

  // ---------- Handlers de campos simples ----------
  const handleSimpleChange = (
    field: keyof NewConsultation,
    value: string | boolean | null
  ) => {
    if (isReadOnly) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ---------- Historial (condiciones) ----------
  const localConditions = useMemo(() => formData.medical_conditions || [], [formData.medical_conditions]);
  const medicalConditionsOptions = useMemo(
    () => [
      'Diabetes',
      'Hipertensión arterial',
      'Problemas circulatorios',
      'Enfermedades cardíacas',
      'Artritis o reumatismo',
    ],
    []
  );

  const handleConditionsChange = (selectedNames: string[]) => {
    if (isReadOnly) return;
    const newConditions = selectedNames.map((name) => {
      const existing = localConditions.find((c: any) => c.name === name);
      return existing || { name };
    });
    setFormData((prev) => ({ ...prev, medical_conditions: newConditions }));
  };

  const updateConditionStatus = (conditionName: string, status: string | null) => {
    if (isReadOnly) return;
    const updatedConditions = localConditions.map((c: any) =>
      c.name === conditionName ? { ...c, status } : c
    );
    setFormData((prev) => ({ ...prev, medical_conditions: updatedConditions }));
  };

  const selectedConditionNames = useMemo(
    () => localConditions.map((c: any) => c.name),
    [localConditions]
  );
  const hasDiabetes = selectedConditionNames.includes('Diabetes');

  // ---------- Hábitos ----------
  const habits = useMemo(() => formData.habits || {}, [formData.habits]);
  const handleHabitChange = (field: string, value: boolean | null) => {
    if (isReadOnly) return;
    const newHabits = { ...habits, [field]: value };
    setFormData((prev) => ({ ...prev, habits: newHabits }));
  };

  const handleShoeTypeChange = (value: string) => {
    if (isReadOnly) return;
    setFormData((prev) => ({ ...prev, shoe_type: value }));
  };

  // ---------- Fotos ----------
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerImages, setViewerImages] = useState<{ uri: string }[]>([]);

  const loadPhotos = async () => {
    const combined: Photo[] = [];
    if (consultationId) {
      const existing = await getPhotosForConsultation(consultationId);
      combined.push(...existing);
    }
    if (draftId) {
      const draftPhotos = await getPhotosForConsultation(draftId);
      combined.push(...draftPhotos);
    }
    setPhotos(combined);
  };

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [draftId, consultationId])
  );

  const handleTakePhoto = (stage: 'antes' | 'despues') => {
    if (isReadOnly) return;
    if (!draftId) {
      Alert.alert('Error', 'No se puede añadir una foto sin un borrador activo.');
      return;
    }
    navigation.navigate('Camera', {
      onPictureTaken: async (uri: string) => {
        try {
          await addPhoto(draftId as number, uri, stage);
          await loadPhotos();
        } catch (err) {
          console.error('Error al guardar la foto:', err);
          Alert.alert('Error', 'No se pudo guardar la foto. Intenta nuevamente.');
        }
      },
    });
  };

  const beforePhotos = photos.filter((p) => p.stage === 'antes');
  const afterPhotos = photos.filter((p) => p.stage === 'despues');

  const openViewer = (group: 'antes' | 'despues', startIndex: number) => {
    const groupList = (group === 'antes' ? beforePhotos : afterPhotos).map((p) => ({ uri: p.local_uri }));
    setViewerImages(groupList);
    setViewerIndex(startIndex);
    setViewerVisible(true);
  };

  const renderPhotoItem = ({ item, index }: { item: Photo; index: number }) => (
    <Pressable onPress={() => openViewer(item.stage, index)}>
      <Image source={{ uri: item.local_uri }} style={styles.thumbnail} />
    </Pressable>
  );

  return (
    <View>
      {/* Consulta */}
      <Text style={styles.sectionTitle}>Consulta</Text>
      <View style={styles.sectionBox}>
        <DatePickerInput
          title="Fecha de la Consulta"
          date={formData.consultation_date ? new Date(formData.consultation_date) : new Date()}
          onDateChange={(newDate: Date) => handleSimpleChange('consultation_date', newDate.toISOString())}
          disabled={isReadOnly}
        />
        <TextInput
          style={[styles.input, isReadOnly && styles.inputDisabled]}
          placeholder="Motivo de la visita"
          value={formData.reason || ''}
          onChangeText={(t: string) => handleSimpleChange('reason', t)}
          editable={!isReadOnly}
        />
        <TextInput
          style={[styles.input, isReadOnly && styles.inputDisabled]}
          placeholder="Diagnóstico"
          value={formData.diagnosis || ''}
          onChangeText={(t: string) => handleSimpleChange('diagnosis', t)}
          editable={!isReadOnly}
        />
        <TextInput
          style={[styles.input, isReadOnly && styles.inputDisabled]}
          placeholder="Tratamiento"
          value={formData.treatment || ''}
          onChangeText={(t: string) => handleSimpleChange('treatment', t)}
          editable={!isReadOnly}
        />
        <TextInput
          style={[styles.input, { height: 100 }, isReadOnly && styles.inputDisabled]}
          placeholder="Notas adicionales"
          multiline
          value={formData.notes || ''}
          onChangeText={(t: string) => handleSimpleChange('notes', t)}
          editable={!isReadOnly}
        />
      </View>

      {/* Historial */}
      <Text style={styles.sectionTitle}>Historial</Text>
      <View style={styles.sectionBox}>
        <CheckboxGroup
          title="¿Padece alguna de las siguientes condiciones?"
          options={medicalConditionsOptions}
          selectedOptions={selectedConditionNames}
          onSelectionChange={handleConditionsChange}
          disabled={isReadOnly}
        />
        {hasDiabetes && (
          <View style={styles.conditionalContainer}>
            <RadioGroup
              title="¿Cómo tiene controlada la diabetes?"
              options={["Controlada", "No Controlada"]}
              selectedValue={localConditions.find((c: any) => c.name === 'Diabetes')?.status || null}
              onSelectionChange={(status: string | null) => updateConditionStatus('Diabetes', status)}
              disabled={isReadOnly}
            />
          </View>
        )}
      </View>

      {/* Hábitos */}
      <Text style={styles.sectionTitle}>Hábitos</Text>
      <View style={styles.sectionBox}>
        <RadioGroup
          title="¿Fuma?"
          options={["Sí", "No"]}
          selectedValue={habits.is_smoker === true ? 'Sí' : habits.is_smoker === false ? 'No' : null}
          onSelectionChange={(selection: string) =>
            handleHabitChange('is_smoker', selection === 'Sí' ? true : selection === 'No' ? false : null)
          }
          disabled={isReadOnly}
        />
        <RadioGroup
          title="¿Consume alcohol?"
          options={["Sí", "No"]}
          selectedValue={habits.consumes_alcohol === true ? 'Sí' : habits.consumes_alcohol === false ? 'No' : null}
          onSelectionChange={(selection: string) =>
            handleHabitChange('consumes_alcohol', selection === 'Sí' ? true : selection === 'No' ? false : null)
          }
          disabled={isReadOnly}
        />
        <TextInput
          style={[styles.input, isReadOnly && styles.inputDisabled]}
          placeholder="Tipo de Calzado Habitual"
          value={formData.shoe_type || ''}
          onChangeText={handleShoeTypeChange}
          editable={!isReadOnly}
        />
      </View>

      {/* Fotos */}
      <Text style={styles.sectionTitle}>Fotos</Text>
      <View style={styles.sectionBox}>
        {!isReadOnly && (
          <View>
            <Text style={styles.groupTitle}>Fotos de Inicio (Antes)</Text>
            <Pressable
              style={[styles.photoButton, (!draftId) && styles.photoButtonDisabled]}
              onPress={() => handleTakePhoto('antes')}
              disabled={!draftId}
            >
              <Text style={styles.photoButtonText}>+ Tomar Foto</Text>
            </Pressable>
            {!draftId && <Text style={styles.helperText}>Preparando borrador...</Text>}
          </View>
        )}
        <FlatList
          data={beforePhotos}
          renderItem={({ item, index }: { item: Photo; index: number }) => (
            <Pressable onPress={() => openViewer('antes', index)}>
              <Image source={{ uri: item.local_uri }} style={styles.thumbnail} />
            </Pressable>
          )}
          keyExtractor={(item: Photo) => `before-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
        {!isReadOnly && (
          <View>
            <Text style={styles.groupTitle}>Fotos de Seguimiento (Después)</Text>
            <Pressable
              style={[styles.photoButton, (!draftId) && styles.photoButtonDisabled]}
              onPress={() => handleTakePhoto('despues')}
              disabled={!draftId}
            >
              <Text style={styles.photoButtonText}>+ Tomar Foto</Text>
            </Pressable>
            {!draftId && <Text style={styles.helperText}>Preparando borrador...</Text>}
          </View>
        )}
        <FlatList
          data={afterPhotos}
          renderItem={({ item, index }: { item: Photo; index: number }) => (
            <Pressable onPress={() => openViewer('despues', index)}>
              <Image source={{ uri: item.local_uri }} style={styles.thumbnail} />
            </Pressable>
          )}
          keyExtractor={(item: Photo) => `after-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
        <ImageViewing
          images={viewerImages}
          imageIndex={viewerIndex}
          visible={viewerVisible}
          onRequestClose={() => setViewerVisible(false)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 8 },
  sectionBox: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', padding: 12, marginBottom: 16 },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff', marginBottom: 12 },
  groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  photoButton: { backgroundColor: '#30c7b5', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  photoButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  photoButtonDisabled: { backgroundColor: '#adb5bd' },
  thumbnail: { width: 100, height: 100, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
  conditionalContainer: { marginTop: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  readonlyItem: { fontSize: 16, color: '#333', marginBottom: 6 },
  label: { fontWeight: 'bold' },
  inputDisabled: { backgroundColor: '#f7f7f7', color: '#666', borderColor: '#ddd' },
  helperText: { marginTop: 6, color: '#666' },
});
