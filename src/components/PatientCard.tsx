import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseCard } from './cards/BaseCard';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Patient } from '@/types';

interface PatientCardProps {
  patient: Patient;
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
          <Text style={[styles.patientName, { color: textColor }]}>{patient.name}</Text>
          <Text style={[styles.patientId, { color: textLightColor }]}>Doc: {patient.documentNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
          <Text style={[styles.statusText, { color: successColor }]}>Activo</Text>
        </View>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={primaryColor} />
          <Text style={[styles.detailText, { color: textLightColor }]}>Última visita: 15 Sep</Text>
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
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
});
