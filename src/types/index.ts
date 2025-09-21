// --- Pacientes ---
export interface Patient {
  id: number;
  name: string;
  documentNumber: string;
  dateOfBirth?: string;
  occupation?: string;
  createdAt: string;
}
export type NewPatient = Omit<Patient, 'id'>;


// --- Consultas (SIN PODOGRAMA) ---
interface MedicalCondition {
  name: string;
  status?: string | null;
}

interface Habits {
  is_smoker?: boolean | null;
  consumes_alcohol?: boolean | null;
}

export interface Consultation {
  id: number;
  patient_id: number;
  consultation_date: string;
  reason?: string; // 'reason' es el campo en la DB
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  medical_conditions?: string; // JSON de MedicalCondition[]
  habits?: string; // JSON de Habits
  shoe_type?: string;
}

// Tipo para el estado del formulario, antes de ser serializado a JSON
export interface NewConsultation {
  patient_id?: number;
  consultation_date?: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  medical_conditions?: MedicalCondition[];
  habits?: Habits;
  shoe_type?: string;
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

// --- Borradores ---
export interface ConsultationDraft {
  id: number;
  patient_id: number;
  consultation_data: string; // JSON de un objeto Partial<NewConsultation>
  last_updated: string;
}
