import { CheckboxGroup } from '@/components/forms/Checkbox';
import { DatePickerInput } from '@/components/forms/DatePickerInput';
import { RadioGroup } from '@/components/forms/RadioGroup';
import {
  addPhoto,
  createDraftFromConsultation,
  deleteDraft,
  finalizeConsultation,
  findOrCreateDraft,
  getPhotosForConsultation,
  moveDraftPhotosToConsultation,
  updateConsultation,
  updateDraft,
} from '@/db/api/consultations';
import { NewConsultation, Photo } from '@/types';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import ImageViewing from 'react-native-image-viewing';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- PESTAÑAS INTERNAS ---

const ConsultationTab = ({
  formData,
  setFormData,
}: {
  formData: Partial<NewConsultation>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<NewConsultation>>>;
}) => {
  const handleSimpleChange = (
    field: keyof NewConsultation,
    value: string | boolean | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.tabContent}>
      <DatePickerInput
        title="Fecha de la Consulta"
        date={
          formData.consultation_date
            ? new Date(formData.consultation_date)
            : new Date()
        }
        onDateChange={(newDate: Date) =>
          handleSimpleChange('consultation_date', newDate.toISOString())
        }
      />
      <Text style={styles.title}>Motivo de la Visita</Text>
      <TextInput
        style={styles.input}
        value={formData.reason || ''}
        onChangeText={(text) => handleSimpleChange('reason', text)}
      />
      <Text style={styles.title}>Diagnóstico</Text>
      <TextInput
        style={styles.input}
        value={formData.diagnosis || ''}
        onChangeText={(text) => handleSimpleChange('diagnosis', text)}
      />
      <Text style={styles.title}>Tratamiento</Text>
      <TextInput
        style={styles.input}
        value={formData.treatment || ''}
        onChangeText={(text) => handleSimpleChange('treatment', text)}
      />
      <Text style={styles.title}>Notas Adicionales</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={formData.notes || ''}
        onChangeText={(text) => handleSimpleChange('notes', text)}
        multiline
      />
    </View>
  );
};

const HistoryTab = ({
  formData,
  setFormData,
}: {
  formData: Partial<NewConsultation>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<NewConsultation>>>;
}) => {
  // Siempre trabajamos con un array
  const localConditions = formData.medical_conditions || [];

  const updateMainForm = (newConditions: any[]) => {
    setFormData((prev) => ({ ...prev, medical_conditions: newConditions }));
  };

  const medicalConditionsOptions = [
    'Diabetes',
    'Hipertensión arterial',
    'Problemas circulatorios',
    'Enfermedades cardíacas',
    'Artritis o reumatismo',
  ];

  const handleConditionsChange = (selectedNames: string[]) => {
    const newConditions = selectedNames.map((name) => {
      const existing = localConditions.find((c: any) => c.name === name);
      return existing || { name };
    });
    updateMainForm(newConditions);
  };

  const updateConditionStatus = (conditionName: string, status: string | null) => {
    const updatedConditions = localConditions.map((c: any) =>
      c.name === conditionName ? { ...c, status } : c
    );
    updateMainForm(updatedConditions);
  };

  const selectedConditionNames = localConditions.map((c: any) => c.name);
  const hasDiabetes = selectedConditionNames.includes('Diabetes');

  return (
    <View style={styles.tabContent}>
      <CheckboxGroup
        title="¿Padece alguna de las siguientes condiciones?"
        options={medicalConditionsOptions}
        selectedOptions={selectedConditionNames}
        onSelectionChange={handleConditionsChange}
      />
      {hasDiabetes && (
        <View style={styles.conditionalContainer}>
          <RadioGroup
            title="¿Cómo tiene controlada la diabetes?"
            options={['Controlada', 'No Controlada']}
            selectedValue={localConditions.find((c: any) => c.name === 'Diabetes')?.status || null}
            onSelectionChange={(status: string | null) =>
              updateConditionStatus('Diabetes', status)
            }
          />
        </View>
      )}
    </View>
  );
};

const HabitsTab = ({
  formData,
  setFormData,
}: {
  formData: Partial<NewConsultation>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<NewConsultation>>>;
}) => {
  // Siempre trabajamos con un objeto
  const habits = formData.habits || {};

  const handleHabitChange = (field: string, value: boolean | null) => {
    const newHabits = { ...habits, [field]: value };
    setFormData((prev) => ({ ...prev, habits: newHabits }));
  };

  const handleShoeTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, shoe_type: value }));
  };

  return (
    <View style={styles.tabContent}>
      <RadioGroup
        title="¿Fuma?"
        options={['Sí', 'No']}
        selectedValue={
          habits.is_smoker === true ? 'Sí' : habits.is_smoker === false ? 'No' : null
        }
        onSelectionChange={(selection: string) =>
          handleHabitChange(
            'is_smoker',
            selection === 'Sí' ? true : selection === 'No' ? false : null
          )
        }
      />
      <RadioGroup
        title="¿Consume alcohol?"
        options={['Sí', 'No']}
        selectedValue={
          habits.consumes_alcohol === true
            ? 'Sí'
            : habits.consumes_alcohol === false
            ? 'No'
            : null
        }
        onSelectionChange={(selection: string) =>
          handleHabitChange(
            'consumes_alcohol',
            selection === 'Sí' ? true : selection === 'No' ? false : null
          )
        }
      />
      <Text style={styles.title}>Tipo de Calzado Habitual</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Deportivo, Zapatillas, Zapatos de cuero..."
        value={formData.shoe_type || ''}
        onChangeText={handleShoeTypeChange}
      />
    </View>
  );
};

const PhotosTab = ({ draft_id, consultation_id }: { draft_id: number | null, consultation_id?: number }) => {
  const navigation = useNavigation<any>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerImages, setViewerImages] = useState<{ uri: string }[]>([]);

  const loadPhotos = async () => {
    // Cargar fotos tanto de la consulta original (modo edición) como del borrador actual
    const combined: Photo[] = [];
    if (consultation_id) {
      const existing = await getPhotosForConsultation(consultation_id);
      combined.push(...existing);
    }
    if (draft_id) {
      const draftPhotos = await getPhotosForConsultation(draft_id);
      combined.push(...draftPhotos);
    }
    setPhotos(combined);
  };

  useFocusEffect(useCallback(() => { loadPhotos(); }, [draft_id, consultation_id]));

  const handleTakePhoto = (stage: 'antes' | 'despues') => {
    if (!draft_id) {
      Alert.alert('Error', 'No se puede añadir una foto sin un borrador activo.');
      return;
    }
    navigation.navigate('Camera', {
      onPictureTaken: async (uri: string) => {
        try {
          await addPhoto(draft_id as number, uri, stage);
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

  const renderBeforePhotoItem = ({ item, index }: { item: Photo; index: number }) => (
    <Pressable onPress={() => openViewer('antes', index)}>
      <Image source={{ uri: item.local_uri }} style={styles.thumbnail} />
    </Pressable>
  );

  const renderAfterPhotoItem = ({ item, index }: { item: Photo; index: number }) => (
    <Pressable onPress={() => openViewer('despues', index)}>
      <Image source={{ uri: item.local_uri }} style={styles.thumbnail} />
    </Pressable>
  );

  return (
    <View style={styles.tabContent}>
      <View style={styles.photoSection}>
        <Text style={styles.groupTitle}>Fotos de Inicio (Antes)</Text>
        <Pressable style={styles.photoButton} onPress={() => handleTakePhoto('antes')}>
          <Text style={styles.photoButtonText}>+ Tomar Foto</Text>
        </Pressable>
        <FlatList
          data={beforePhotos}
          renderItem={renderBeforePhotoItem}
          keyExtractor={(item: Photo) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      </View>
      <View style={styles.photoSection}>
        <Text style={styles.groupTitle}>Fotos de Seguimiento (Después)</Text>
        <Pressable style={styles.photoButton} onPress={() => handleTakePhoto('despues')}>
          <Text style={styles.photoButtonText}>+ Tomar Foto</Text>
        </Pressable>
        <FlatList
          data={afterPhotos}
          renderItem={renderAfterPhotoItem}
          keyExtractor={(item: Photo) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      </View>
      <ImageViewing
        images={viewerImages}
        imageIndex={viewerIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </View>
  );
}
;

// --- COMPONENTE PRINCIPAL ---

export default function NewConsultationScreen() {
  const route = useRoute();
  const { patientId, consultationId } = route.params as {
    patientId: number;
    consultationId?: number;
  };
  const [draftId, setDraftId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<NewConsultation>>({});
  const navigation = useNavigation<any>();

  // Carga de datos (Creación vs Edición)
  useEffect(() => {
    const loadData = async () => {
      try {
        let draft;
        if (consultationId) {
          draft = await createDraftFromConsultation(patientId, consultationId);
        } else {
          draft = await findOrCreateDraft(patientId);
        }

        if (draft) {
          const parsedData = JSON.parse(draft.consultation_data);

          // medical_conditions: asegurar array
          if (typeof parsedData.medical_conditions === 'string') {
            try { parsedData.medical_conditions = JSON.parse(parsedData.medical_conditions); } catch { parsedData.medical_conditions = []; }
          }
          if (!Array.isArray(parsedData.medical_conditions)) {
            parsedData.medical_conditions = [];
          }

          // habits: asegurar objeto y normalizar booleanos
          if (typeof parsedData.habits === 'string') {
            try { parsedData.habits = JSON.parse(parsedData.habits); } catch { parsedData.habits = {}; }
          }
          parsedData.habits = parsedData.habits || {};
          const normalizeBool = (v: any) => v === true || v === 'true' || v === 1 || v === '1' ? true : (v === false || v === 'false' || v === 0 || v === '0' ? false : null);
          if (parsedData.habits) {
            parsedData.habits.is_smoker = normalizeBool(parsedData.habits.is_smoker);
            parsedData.habits.consumes_alcohol = normalizeBool(parsedData.habits.consumes_alcohol);
          }

          setFormData(parsedData);
          setDraftId(draft.id);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los datos para la consulta.');
        console.error(error);
      }
    };
    loadData();
  }, [patientId, consultationId]);

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

  // Guardado Final
  const handleFinalSave = async () => {
    if (!draftId) {
      Alert.alert('Error', 'No hay un borrador activo para guardar.');
      return;
    }

    const dataToSave: NewConsultation = {
      patient_id: patientId,
      ...formData,
      consultation_date: formData.consultation_date || new Date().toISOString(),
      medical_conditions: JSON.stringify(formData.medical_conditions || []),
      habits: JSON.stringify(formData.habits || {}),
    };

    try {
      if (consultationId) {
        await updateConsultation(consultationId, dataToSave);
        // Mover las fotos nuevas tomadas en el borrador hacia la consulta editada
        await moveDraftPhotosToConsultation(draftId, consultationId);
        await deleteDraft(draftId);
        Alert.alert('Éxito', 'La consulta ha sido actualizada correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await finalizeConsultation(draftId, patientId, dataToSave);
        Alert.alert('Éxito', 'La consulta ha sido guardada correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al guardar los cambios.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.headerTitle}>
        {consultationId ? 'Editar Consulta' : 'Nueva Consulta'}
      </Text>
      <ScrollView contentContainerStyle={styles.tabContent}>
        <ConsultationTab formData={formData} setFormData={setFormData} />
        <HistoryTab formData={formData} setFormData={setFormData} />
        <HabitsTab formData={formData} setFormData={setFormData} />
        <PhotosTab draft_id={draftId} consultation_id={consultationId} />
      </ScrollView>
      <Pressable style={styles.saveButton} onPress={handleFinalSave}>
        <Text style={styles.saveButtonText}>Guardar Consulta</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conditionalContainer: { marginTop: 10, marginBottom: 20, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  safeArea: { flex: 1, backgroundColor: 'white' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', padding: 20, paddingBottom: 10, textAlign: 'center' },
  tabContent: { padding: 20 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff', marginBottom: 20 },
  photoSection: { marginBottom: 20 },
  groupTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  photoButton: { backgroundColor: '#6c757d', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  photoButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  thumbnail: { width: 100, height: 100, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
  saveButton: { backgroundColor: '#28a745', paddingVertical: 15, margin: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});