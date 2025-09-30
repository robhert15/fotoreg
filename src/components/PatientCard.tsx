import React, { useMemo } from 'react';
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

  const displayName = [patient.first_name, patient.paternal_last_name, patient.maternal_last_name].filter(Boolean).join(' ');

  const indicatorVariant = useMemo(() => {
    // Si hay última visita y es muy antigua (>180 días), marcar warning; si no, success por "Activo"
    if (patient.last_visit) {
      const last = new Date(patient.last_visit).getTime();
      const now = Date.now();
      const days = (now - last) / (1000 * 60 * 60 * 24);
      if (days > 180) return 'warning' as const;
      return 'success' as const;
    }
    return 'default' as const;
  }, [patient.last_visit]);

  return (
    <BaseCard onPress={onPress} indicatorVariant={indicatorVariant}>
      <View style={styles.cardHeader}>
        <View style={styles.patientInfo}>
          <Text style={[styles.patientName, { color: textColor }]} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
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
  patientInfo: {
    flex: 1, // Ocupa el espacio disponible, permitiendo que el texto se trunque
    marginRight: 8, // Añade un pequeño espacio antes de la insignia
  },
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
