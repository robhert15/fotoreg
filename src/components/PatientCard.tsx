import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseCard } from './cards/BaseCard';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PatientWithLastDiagnosis } from '@/types';

// Tarjeta individual para un paciente en la lista
interface PatientCardProps {
  patient: PatientWithLastDiagnosis;
  onPress: () => void;
}

export const PatientCard = ({ patient, onPress }: PatientCardProps) => {
  const textColor = useThemeColor({}, 'text');
  const textLightColor = useThemeColor({}, 'textLight');
  const successColor = useThemeColor({}, 'success');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <BaseCard onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.patientInfo}>
          <Text style={[styles.patientName, { color: textColor }]}>{`${patient.first_name} ${patient.last_name}`}</Text>
          <Text style={[styles.patientId, { color: textLightColor }]}>Doc: {patient.document_number}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
          <Text style={[styles.statusText, { color: successColor }]}>Activo</Text>
        </View>
      </View>
      <View style={styles.cardDetails}>
                <View style={styles.detailsContainer}>
          <View style={[styles.detailItem, { width: '55%' }]}>
            <Ionicons name="calendar-outline" size={14} color={primaryColor} />
            <Text style={[styles.detailText, { color: textLightColor }]} numberOfLines={1} ellipsizeMode="tail">
              Última visita: {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'N/A'}
            </Text>
          </View>
          <View style={[styles.detailItem, { width: '45%' }]}>
            {patient.last_diagnosis ? (
              <>
                <Ionicons name="document-text-outline" size={14} color={primaryColor} />
                <Text style={[styles.detailText, { color: textLightColor }]} numberOfLines={1} ellipsizeMode="tail">
                  {patient.last_diagnosis}
                </Text>
              </>
            ) : (
              <Text style={[styles.detailText, { color: textLightColor, fontStyle: 'italic' }]}>
                Sin Dx
              </Text>
            )}
          </View>
        </View>
      </View>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {},
  patientName: {
    fontSize: 18,
    fontWeight: '600',
  },
  patientId: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
    cardDetails: {
    marginTop: 15,
  },
    detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
});
