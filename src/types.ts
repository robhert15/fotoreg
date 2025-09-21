export interface Patient {
  id: number;
  name: string;
  last_name: string;
  birth_date: string;
  phone?: string;
  email?: string;
  created_at: string;
}

// Representa los datos que se guardan en el borrador (el formulario)
export interface NewConsultation {
  consultation_date?: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  medical_conditions?: any; // JSON de condiciones
  habits?: any; // JSON de hábitos
  shoe_type?: string;
}

// Representa la estructura de la tabla 'consultation_drafts'
export interface ConsultationDraft {
  id: number;
  patient_id: number;
  consultation_data: string; // JSON.stringify(NewConsultation)
  last_updated: string;
}

// Representa una consulta final guardada en la tabla 'consultations'
export interface Consultation {
  id: number;
  patient_id: number;
  consultation_date: string;
  reason?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  notes?: string | null;
  medical_conditions?: any | null;
  habits?: any | null;
  shoe_type?: string | null;
}

export interface Photo {
  id: number;
  consultation_id: number;
  local_uri: string;
  stage: 'antes' | 'despues';
  taken_at: string;
}