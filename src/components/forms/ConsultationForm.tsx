import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '@/styles/globalStyles';
import { BaseCard } from '../cards/BaseCard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { DatePickerInput } from './DatePickerInput';
import { CheckboxGroup } from './Checkbox';
import { RadioGroup } from './RadioGroup';
import { ImageLightbox } from '@/components/viewers/ImageLightbox';
import { Collapsible } from '../Collapsible';
import { NewConsultation, Photo } from '@/types/index';
import { getPhotosForConsultation } from '@/db/api/consultations';

export interface ConsultationFormProps {
  formData: Partial<NewConsultation>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<NewConsultation>>>;
  isReadOnly?: boolean;
  draftId: number | null;
  consultationId?: number; // para combinar fotos en modo edición/lectura
}


const styles = StyleSheet.create({
  photoActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

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
    value: any
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
  const [viewerImages, setViewerImages] = useState<{ uri: string; id?: number }[]>([]);

  const loadPhotos = useCallback(async () => {
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
  }, [consultationId, draftId]);

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos])
  );

  const handleTakePhoto = (stage: 'antes' | 'despues' | 'voucher') => {
    if (isReadOnly) return;
    if (!draftId) {
      Alert.alert('Error', 'No se puede añadir una foto sin un borrador activo.');
      return;
    }
    navigation.navigate('Camera', { draftId: draftId as number, stage });
  };

  const beforePhotos = photos.filter((p) => p.stage === 'antes');
  const afterPhotos = photos.filter((p) => p.stage === 'despues');
  const voucherPhotos = photos.filter((p) => p.stage === 'voucher');

  const openViewer = (group: 'antes' | 'despues' | 'voucher', startIndex: number) => {
    let groupList: { uri: string; id?: number }[] = [];
    switch (group) {
      case 'antes':
        groupList = beforePhotos.map((p) => ({ uri: p.local_uri, id: p.id }));
        break;
      case 'despues':
        groupList = afterPhotos.map((p) => ({ uri: p.local_uri, id: p.id }));
        break;
      case 'voucher':
        groupList = voucherPhotos.map((p) => ({ uri: p.local_uri, id: p.id }));
        break;
      default:
        groupList = [];
    }
    setViewerImages(groupList);
    setViewerIndex(startIndex);
    setViewerVisible(true);
  };

  const renderPhotoItem = ({ item, index }: { item: Photo; index: number }) => (
    <Pressable onPress={() => openViewer(item.stage, index)}>
      <Image source={{ uri: item.local_uri }} style={globalStyles.thumbnail} />
    </Pressable>
  );

    return (
    <View style={{ paddingBottom: 40 }}>
      {/* --- Sección Consulta --- */}
      <View style={{ marginHorizontal: 15, marginBottom: 20 }}>
        <Text style={globalStyles.sectionTitle}>Consulta</Text>
        <BaseCard>
          <DatePickerInput
            title="Fecha de la Consulta"
            date={formData.consultation_date ? new Date(formData.consultation_date) : new Date()}
            onDateChange={(newDate: Date) => handleSimpleChange('consultation_date', newDate.toISOString())}
            disabled={isReadOnly}
          />
          <TextInput
            style={[globalStyles.input, isReadOnly && globalStyles.inputDisabled]}
            placeholder="Motivo de la visita"
            value={formData.reason || ''}
            onChangeText={(t: string) => handleSimpleChange('reason', t)}
            editable={!isReadOnly}
          />
          <TextInput
            style={[globalStyles.input, isReadOnly && globalStyles.inputDisabled]}
            placeholder="Diagnóstico"
            value={formData.diagnosis || ''}
            onChangeText={(t: string) => handleSimpleChange('diagnosis', t)}
            editable={!isReadOnly}
          />
          <TextInput
            style={[globalStyles.input, isReadOnly && globalStyles.inputDisabled]}
            placeholder="Tratamiento"
            value={formData.treatment || ''}
            onChangeText={(t: string) => handleSimpleChange('treatment', t)}
            editable={!isReadOnly}
          />
          <TextInput
            style={[globalStyles.input, { height: 100 }, isReadOnly && globalStyles.inputDisabled]}
            placeholder="Notas adicionales"
            multiline
            value={formData.notes || ''}
            onChangeText={(t: string) => handleSimpleChange('notes', t)}
            editable={!isReadOnly}
          />
        </BaseCard>
      </View>

      {/* --- Secciones Colapsables --- */}
      <Collapsible title="Historial">
        <BaseCard>
          <CheckboxGroup
            title="¿Padece alguna de las siguientes condiciones?"
            options={medicalConditionsOptions}
            selectedOptions={selectedConditionNames}
            onSelectionChange={handleConditionsChange}
            disabled={isReadOnly}
          />
          {hasDiabetes && (
            <View style={globalStyles.conditionalContainer}>
              <RadioGroup
                title="¿Cómo tiene controlada la diabetes?"
                options={["Controlada", "No Controlada"]}
                selectedValue={localConditions.find((c: any) => c.name === 'Diabetes')?.status || null}
                onSelectionChange={(status: string | null) => updateConditionStatus('Diabetes', status)}
                disabled={isReadOnly}
              />
            </View>
          )}
        </BaseCard>
      </Collapsible>

      <Collapsible title="Hábitos">
        <BaseCard>
          <RadioGroup
            title="¿Fuma?"
            options={["Sí", "No"]}
            selectedValue={habits.is_smoker === true ? 'Sí' : habits.is_smoker === false ? 'No' : null}
            onSelectionChange={(selection: string | null) =>
              handleHabitChange('is_smoker', selection === 'Sí' ? true : selection === 'No' ? false : null)
            }
            disabled={isReadOnly}
          />
          <RadioGroup
            title="¿Consume alcohol?"
            options={["Sí", "No"]}
            selectedValue={habits.consumes_alcohol === true ? 'Sí' : habits.consumes_alcohol === false ? 'No' : null}
            onSelectionChange={(selection: string | null) =>
              handleHabitChange('consumes_alcohol', selection === 'Sí' ? true : selection === 'No' ? false : null)
            }
            disabled={isReadOnly}
          />
          <TextInput
            style={[globalStyles.input, isReadOnly && globalStyles.inputDisabled]}
            placeholder="Tipo de Calzado Habitual"
            value={formData.shoe_type || ''}
            onChangeText={handleShoeTypeChange}
            editable={!isReadOnly}
          />
        </BaseCard>
      </Collapsible>

      <Collapsible title="Fotos" isInitiallyExpanded={true}>
        <BaseCard>
          {!isReadOnly && (
            <>
              <View style={styles.photoActionContainer}>
                <Text style={globalStyles.label}>Fotos de Inicio (Antes)</Text>
                <Pressable
                  style={[globalStyles.miniFab, !draftId && globalStyles.inputDisabled]}
                  onPress={() => handleTakePhoto('antes')}
                  disabled={!draftId}
                >
                  <Ionicons name="camera" size={24} color="white" />
                </Pressable>
              </View>
              {!draftId && <Text style={globalStyles.helperText}>Preparando borrador...</Text>}
            </>
          )}
          <FlatList
            data={beforePhotos}
            renderItem={renderPhotoItem}
            keyExtractor={(item: Photo) => `before-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
          {!isReadOnly && (
            <>
              <View style={[styles.photoActionContainer, { marginTop: 20 }]}>
                <Text style={globalStyles.label}>Fotos de Seguimiento (Después)</Text>
                <Pressable
                  style={[globalStyles.miniFab, !draftId && globalStyles.inputDisabled]}
                  onPress={() => handleTakePhoto('despues')}
                  disabled={!draftId}
                >
                  <Ionicons name="camera" size={24} color="white" />
                </Pressable>
              </View>
              {!draftId && <Text style={globalStyles.helperText}>Preparando borrador...</Text>}
            </>
          )}
          <FlatList
            data={afterPhotos}
            renderItem={renderPhotoItem}
            keyExtractor={(item: Photo) => `after-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        </BaseCard>
      </Collapsible>

      <Collapsible title="Voucher de Pago">
        <BaseCard>
          {!isReadOnly && (
            <>
              <View style={styles.photoActionContainer}>
                <Text style={globalStyles.label}>Foto del Voucher</Text>
                <Pressable
                  style={[globalStyles.miniFab, !draftId && globalStyles.inputDisabled]}
                  onPress={() => handleTakePhoto('voucher')}
                  disabled={!draftId}
                >
                  <Ionicons name="camera" size={24} color="white" />
                </Pressable>
              </View>
              {!draftId && <Text style={globalStyles.helperText}>Preparando borrador...</Text>}
            </>
          )}
          <FlatList
            data={voucherPhotos}
            renderItem={renderPhotoItem}
            keyExtractor={(item: Photo) => `voucher-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        </BaseCard>
      </Collapsible>

      <ImageLightbox
        images={viewerImages}
        initialIndex={viewerIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
};

