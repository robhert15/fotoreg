// --- Pacientes ---
export interface Patient {
  id: number;
  first_name: string;
  paternal_last_name: string;
  maternal_last_name?: string;
  document_number?: string;
  date_of_birth?: string;
  gender?: 'masculino' | 'femenino' | 'otro' | 'no especificado';
  address?: string;
  occupation?: string;
  whatsapp?: string;
  contact_phone?: string;
  physical_activity?: string; // Ej: "Correr, 3 veces por semana"
  created_at: string;
}
export type NewPatient = Omit<Patient, 'id' | 'created_at'>;

// --- Responsables ---
export interface Guardian {
  id: number;
  first_name: string;
  last_name: string;
  document_number?: string;
  relationship?: string;
  created_at: string;
}
export type NewGuardian = Omit<Guardian, 'id' | 'created_at'>;

// --- Consultas (Ahora con objetos/arrays nativos) ---
interface MedicalCondition {
  name: string;
  status?: string;
}

interface Habits {
  is_smoker?: boolean;
  consumes_alcohol?: boolean;
}

export interface Consultation {
  id: number;
  patient_id: number;
  consultation_date: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  medical_conditions?: MedicalCondition[];
  habits?: Habits;
  shoe_type?: string;
  is_draft?: boolean;
}
export type NewConsultation = Omit<Consultation, 'id' | 'is_draft'>;

// --- Borradores ---
export interface ConsultationDraft {
  id: number;
  patient_id: number;
  consultation_data: string; // JSON de un objeto Partial<NewConsultation>
  last_updated: string;
}

// --- Fotos ---
export interface Photo {
  id: number;
  consultation_id: number;
  local_uri: string;
  stage: 'antes' | 'despues' | 'voucher';
  taken_at: string;
}
export type NewPhoto = Omit<Photo, 'id'>;

// --- Anotaciones de Fotos ---
export interface PhotoAnnotationData {
  strokes: { path: string; color: string; strokeWidth: number }[];
  width: number;
  height: number;
}

// --- Tipos compuestos ---
export type PatientWithLastDiagnosis = Patient & {
  last_visit?: string | null;
  last_diagnosis?: string | null;
};
