import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { BaseCard } from './BaseCard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Consultation } from '@/types';

interface ConsultationCardProps {
  consultation: Consultation;
  onPress: () => void;
}

export const ConsultationCard = ({ consultation, onPress }: ConsultationCardProps) => {
  const textLightColor = useThemeColor({}, 'textLight');
  const textColor = useThemeColor({}, 'text');

  const indicatorVariant = useMemo(() => {
    const reason = (consultation.reason || '').toLowerCase();
    if (/(urg|emerg|prioridad)/.test(reason)) return 'danger' as const;
    return 'default' as const;
  }, [consultation.reason]);

  return (
    <BaseCard onPress={onPress} indicatorVariant={indicatorVariant}>
      <Text style={[styles.dateText, { color: textLightColor }]}>
        {new Date(consultation.consultation_date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      <Text style={[styles.reasonText, { color: textColor }]}>
        {consultation.reason || 'Consulta general'}
      </Text>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  dateText: {
    fontSize: 13,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
