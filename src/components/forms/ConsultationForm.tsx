import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import Animated from 'react-native-reanimated';
import { View, Text, TextInput, StyleSheet, Pressable, Image, FlatList, Alert, useWindowDimensions } from 'react-native';
import { FabButton } from '@/components/buttons/FabButton';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '@/styles/globalStyles';
import { BaseCard } from '../cards/BaseCard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { DatePickerInput } from '@/components/forms/DatePickerInput';
import { CheckboxGroup } from './Checkbox';
import { RadioGroup } from './RadioGroup';
import { ImageLightbox } from '@/components/viewers/ImageLightbox';
import { NewConsultation, Photo } from '@/types/index';
import { getPhotosForConsultation } from '@/db/api/consultations';
import { Colors } from '@/constants/theme';

export interface ConsultationFormProps {
  formData: Partial<NewConsultation>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<NewConsultation>>>;
  isReadOnly?: boolean;
  draftId: number | null;
  consultationId?: number; // para combinar fotos en modo edición/lectura
  autoFocusFirstInput?: boolean;
    scrollRef?: React.Ref<Animated.ScrollView>;
}

// Tipos locales ligeros (evitamos dependencias no exportadas)
type MedicalConditionLite = { name: string; status?: string };
type HabitsLike = { [key: string]: boolean | null | undefined; is_smoker?: boolean; consumes_alcohol?: boolean };


const styles = StyleSheet.create({
  photoActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  focusedInput: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
});

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  formData,
  setFormData,
  isReadOnly = false,
  draftId,
  consultationId,
  autoFocusFirstInput = false,
  scrollRef,
}) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const firstInputRef = useRef<TextInput>(null);
  const { height: screenHeight } = useWindowDimensions();
  const [focusReason, setFocusReason] = useState(false);
  const [focusDiagnosis, setFocusDiagnosis] = useState(false);
  const [focusTreatment, setFocusTreatment] = useState(false);
  const [focusNotes, setFocusNotes] = useState(false);
  const [focusShoeType, setFocusShoeType] = useState(false);

  useEffect(() => {
    if (autoFocusFirstInput && scrollRef && 'current' in scrollRef && scrollRef.current) {
      const timer = setTimeout(() => {
        const inputNode = firstInputRef.current;
        const scrollNode = scrollRef.current;

        if (inputNode && scrollNode) {
          inputNode.focus();

          // Usamos measureLayout con la referencia correcta (de useAnimatedRef)
          // para obtener la posición 'y' del campo RELATIVA al ScrollView.
          inputNode.measureLayout(
            scrollNode as any, // Cast necesario por la complejidad de tipos de reanimated
            (x, y) => {
              // Calculamos el desplazamiento para que el campo quede a un 20% de la altura de la pantalla
              const targetY = screenHeight * 0.2;
              const scrollToY = y - targetY;

              // Solo nos desplazamos si es necesario (evita saltos si ya está visible)
              if (scrollToY > 0) {
                scrollNode.scrollTo({ y: scrollToY, animated: true });
              }
            },
            () => { /* Medición fallida, no hacer nada */ }
          );
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [autoFocusFirstInput, scrollRef, screenHeight]);

  // ---------- Handlers de campos simples ----------
  const handleSimpleChange = (
    field: keyof NewConsultation,
    value: string | boolean | null
  ) => {
    if (isReadOnly) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ---------- Historial (condiciones) ----------
  const localConditions = useMemo<MedicalConditionLite[]>(
    () => (Array.isArray(formData.medical_conditions) ? formData.medical_conditions : []),
    [formData.medical_conditions]
  );
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
    const newConditions: MedicalConditionLite[] = selectedNames.map((name) => {
      const existing = localConditions.find((c) => c.name === name);
      return existing || { name };
    });
    setFormData((prev) => ({ ...prev, medical_conditions: newConditions }));
  };

  const updateConditionStatus = (conditionName: string, status: string | null) => {
    if (isReadOnly) return;
    const updatedConditions: MedicalConditionLite[] = localConditions.map((c) =>
      c.name === conditionName ? { ...c, status: status ?? undefined } : c
    );
    setFormData((prev) => ({ ...prev, medical_conditions: updatedConditions }));
  };

  const selectedConditionNames = useMemo(
    () => localConditions.map((c) => c.name),
    [localConditions]
  );
  const hasDiabetes = selectedConditionNames.includes('Diabetes');

  // ---------- Hábitos ----------
  const habits = useMemo<HabitsLike>(() => (formData.habits as HabitsLike) || {}, [formData.habits]);
  const handleHabitChange = (field: string, value: boolean | null) => {
    if (isReadOnly) return;
    const newHabits = { ...habits, [field]: value ?? undefined };
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
      <View style={{ marginBottom: 20 }}>
        <Text style={globalStyles.sectionTitle}>Consulta</Text>
        <BaseCard variant="form">
          <DatePickerInput
            title="Fecha de la Consulta"
            date={formData.consultation_date ? new Date(formData.consultation_date) : new Date()}
            onDateChange={(newDate: Date) => handleSimpleChange('consultation_date', newDate.toISOString())}
            disabled={isReadOnly}
          />
          <TextInput
            ref={firstInputRef}
            style={[
              globalStyles.input,
              isReadOnly && globalStyles.inputDisabled,
              !isReadOnly && focusReason && styles.focusedInput,
            ]}
            placeholder="Motivo de la visita"
            value={formData.reason || ''}
            onChangeText={(t: string) => handleSimpleChange('reason', t)}
            onFocus={() => setFocusReason(true)}
            onBlur={() => setFocusReason(false)}
            editable={!isReadOnly}
          />
          <TextInput
            style={[
              globalStyles.input,
              isReadOnly && globalStyles.inputDisabled,
              !isReadOnly && focusDiagnosis && styles.focusedInput,
            ]}
            placeholder="Diagnóstico"
            value={formData.diagnosis || ''}
            onChangeText={(t: string) => handleSimpleChange('diagnosis', t)}
            onFocus={() => setFocusDiagnosis(true)}
            onBlur={() => setFocusDiagnosis(false)}
            editable={!isReadOnly}
          />
          <TextInput
            style={[
              globalStyles.input,
              isReadOnly && globalStyles.inputDisabled,
              !isReadOnly && focusTreatment && styles.focusedInput,
            ]}
            placeholder="Tratamiento"
            value={formData.treatment || ''}
            onChangeText={(t: string) => handleSimpleChange('treatment', t)}
            onFocus={() => setFocusTreatment(true)}
            onBlur={() => setFocusTreatment(false)}
            editable={!isReadOnly}
          />
          <TextInput
            style={[
              globalStyles.input,
              { height: 100 },
              isReadOnly && globalStyles.inputDisabled,
              !isReadOnly && focusNotes && styles.focusedInput,
            ]}
            placeholder="Notas adicionales"
            multiline
            value={formData.notes || ''}
            onChangeText={(t: string) => handleSimpleChange('notes', t)}
            onFocus={() => setFocusNotes(true)}
            onBlur={() => setFocusNotes(false)}
            editable={!isReadOnly}
          />
        </BaseCard>
      </View>

      {/* --- Sección Historial --- */}
      <View style={{ marginBottom: 20 }}>
        <Text style={globalStyles.sectionTitle}>Historial</Text>
        <BaseCard variant="form">
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
                selectedValue={localConditions.find((c) => c.name === 'Diabetes')?.status || null}
                onSelectionChange={(status: string | null) => updateConditionStatus('Diabetes', status)}
                disabled={isReadOnly}
              />
            </View>
          )}
        </BaseCard>
      </View>

      {/* --- Sección Hábitos --- */}
      <View style={{ marginBottom: 20 }}>
        <Text style={globalStyles.sectionTitle}>Hábitos</Text>
        <BaseCard variant="form">
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
            style={[
              globalStyles.input,
              isReadOnly && globalStyles.inputDisabled,
              !isReadOnly && focusShoeType && styles.focusedInput,
            ]}
            placeholder="Tipo de Calzado Habitual"
            value={formData.shoe_type || ''}
            onChangeText={handleShoeTypeChange}
            onFocus={() => setFocusShoeType(true)}
            onBlur={() => setFocusShoeType(false)}
            editable={!isReadOnly}
          />
        </BaseCard>
      </View>

      {/* --- Sección Fotos --- */}
      <View style={{ marginBottom: 20 }}>
        <Text style={globalStyles.sectionTitle}>Fotos</Text>
        <BaseCard variant="form">
          {!isReadOnly && (
            <>
              <View style={styles.photoActionContainer}>
                <Text style={globalStyles.label}>Fotos de Inicio (Antes)</Text>
                <FabButton
                  size="mini"
                  variant="secondary"
                  onPress={() => handleTakePhoto('antes')}
                  disabled={!draftId}
                  accessibilityLabel="Tomar foto antes"
                  icon={<Ionicons name="camera" size={24} color="white" />}
                />
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
                <FabButton
                  size="mini"
                  variant="secondary"
                  onPress={() => handleTakePhoto('despues')}
                  disabled={!draftId}
                  accessibilityLabel="Tomar foto después"
                  icon={<Ionicons name="camera" size={24} color="white" />}
                />
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
      </View>

      {/* --- Sección Voucher de Pago --- */}
      <View style={{ marginBottom: 20 }}>
        <Text style={globalStyles.sectionTitle}>Voucher de Pago</Text>
        <BaseCard variant="form">
          {!isReadOnly && (
            <>
              <View style={styles.photoActionContainer}>
                <Text style={globalStyles.label}>Foto del Voucher</Text>
                <FabButton
                  size="mini"
                  variant="secondary"
                  onPress={() => handleTakePhoto('voucher')}
                  disabled={!draftId}
                  accessibilityLabel="Tomar foto del voucher"
                  icon={<Ionicons name="camera" size={24} color="white" />}
                />
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
      </View>

      <ImageLightbox
        images={viewerImages}
        initialIndex={viewerIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
};

