import React from 'react';
import { Text } from 'react-native';
import { BaseCard } from './BaseCard';
import { globalStyles } from '@/styles/globalStyles';
import { Patient } from '@/types';

interface PatientInfoCardProps {
  patient: Patient;
}

const calculateAge = (dob: string | undefined) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const PatientInfoCard = ({ patient }: PatientInfoCardProps) => {
  const displayDocument = patient.document_number ?? 'No especificado';
  const displayCreatedAt = new Date(patient.created_at).toLocaleDateString('es-ES');
  const age = calculateAge(patient.date_of_birth);

  return (
    <BaseCard variant="form">
      <Text style={globalStyles.title}>Datos del Paciente</Text>
      <Text style={globalStyles.bodyText}>Documento: {displayDocument}</Text>
      {patient.date_of_birth && <Text style={globalStyles.bodyText}>Fecha de Nacimiento: {new Date(patient.date_of_birth).toLocaleDateString('es-ES')}{age !== null ? ` (${age} años)` : ''}</Text>}
      {patient.gender && <Text style={globalStyles.bodyText}>Sexo: {patient.gender}</Text>}
      <Text style={globalStyles.bodyText}>Ocupación: {patient.occupation || 'No especificado'}</Text>
      {patient.address && <Text style={globalStyles.bodyText}>Domicilio: {patient.address}</Text>}
      {patient.whatsapp && <Text style={globalStyles.bodyText}>WhatsApp: {patient.whatsapp}</Text>}
      {patient.contact_phone && <Text style={globalStyles.bodyText}>Celular: {patient.contact_phone}</Text>}
      {patient.physical_activity && <Text style={globalStyles.bodyText}>Actividad Física: {patient.physical_activity}</Text>}
      <Text style={globalStyles.bodyText}>Paciente desde el: {displayCreatedAt}</Text>
    </BaseCard>
  );
};
