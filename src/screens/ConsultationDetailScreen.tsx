import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, FlatList, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { getConsultationById, getPhotosForConsultation } from '@/db/api/consultations';
import { Consultation, Photo } from '@/types';
import { Colors } from '@/constants/theme';

// Helper para renderizar secciones con datos simples
const DetailSection = ({ title, data }: { title: string; data: string | null | undefined }) => {
  if (!data || data.trim() === '') return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{data}</Text>
    </View>
  );
};

// Helper para renderizar datos de un JSON (listas, objetos, etc.)
const JsonDetailSection = ({ title, jsonData, renderItem }: { title: string; jsonData: string | null | undefined; renderItem: (item: any, index?: number) => React.ReactNode }) => {
  try {
    if (!jsonData) return null;
    const data = JSON.parse(jsonData);
    if (!data || (Array.isArray(data) && data.length === 0)) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {Array.isArray(data) ? data.map(renderItem) : renderItem(data)}
      </View>
    );
  } catch (e) {
    return null; // No renderizar si el JSON es inválido o no existe
  }
};


export default function ConsultationDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { consultationId } = route.params as { consultationId: number };
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const consultationData = await getConsultationById(consultationId);
        setConsultation(consultationData);
        if (consultationData) {
          const photoData = await getPhotosForConsultation(consultationData.id);
          setPhotos(photoData);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar la consulta.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [consultationId]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }
  if (!consultation) {
    return <View style={styles.centered}><Text>No se encontró la consulta.</Text></View>;
  }

  const handleEdit = () => {
    if (consultation) {
      navigation.navigate('NewConsultation', { 
        patientId: consultation.patient_id, 
        consultationId: consultation.id 
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerDate}>
          {new Date(consultation.consultation_date).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </Text>
      </View>

      <Pressable style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editButtonText}>Editar Consulta</Text>
      </Pressable>
      
      <View style={styles.content}>
        <DetailSection title="Motivo de la Visita" data={consultation.reason} />
        <DetailSection title="Diagnóstico" data={consultation.diagnosis} />
        <DetailSection title="Tratamiento" data={consultation.treatment} />
        <DetailSection title="Notas Adicionales" data={consultation.notes} />

        <JsonDetailSection
          title="Condiciones Médicas"
          jsonData={consultation.medical_conditions}
          renderItem={(item: { name: string; status?: string }, index: number) => <Text key={index} style={styles.listItem}>• {item.name} ({item.status || 'No especificado'})</Text>}
        />
        
        <JsonDetailSection
          title="Hábitos"
          jsonData={consultation.habits}
          renderItem={(habits: { is_smoker: boolean; consumes_alcohol: boolean }) => (
            <View key="habits-view">
              <Text style={styles.listItem}>• Fuma: {habits.is_smoker ? 'Sí' : 'No'}</Text>
              <Text style={styles.listItem}>• Consume Alcohol: {habits.consumes_alcohol ? 'Sí' : 'No'}</Text>
            </View>
          )}
        />
        
        <DetailSection title="Tipo de Calzado" data={consultation.shoe_type} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotos</Text>
          <FlatList
            data={photos}
            renderItem={({ item }: { item: Photo }) => <Image source={{ uri: item.local_uri }} style={styles.thumbnail} />}
            keyExtractor={(item: Photo) => item.id.toString()}
            horizontal
            ListEmptyComponent={<Text style={styles.emptyText}>No hay fotos para esta consulta.</Text>}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: Colors.primary, padding: 20 },
  headerDate: { fontSize: 22, fontWeight: 'bold', color: Colors.white, textAlign: 'center' },
  content: { padding: 20 },
  section: { backgroundColor: Colors.white, borderRadius: 8, padding: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  sectionContent: { fontSize: 16, color: '#555' },
  listItem: { fontSize: 16, color: '#555', marginBottom: 5 },
  thumbnail: { width: 100, height: 100, borderRadius: 8, marginRight: 10 },
  emptyText: { fontStyle: 'italic', color: '#888' },
  editButton: {
    backgroundColor: Colors.success, // O el color que prefieras para editar
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: -10, // Para que se solape un poco con el header
    marginBottom: 20,
    zIndex: 1,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
