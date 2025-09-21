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
export interface Consultation {
  id: number;
  patient_id: number;
  consultation_date: string;
  visit_reason?: string;
  medical_conditions?: string; // JSON de objetos: [{ name, status? }]
  foot_issues?: string; // JSON de strings: ["uña_encarnada", ...]
  surgery_history?: string; // JSON: { has_surgery, details }
  allergies?: string; // JSON de objetos: [{ type, details }]
  medications?: string; // JSON: { is_taking, details }
  habits?: string; // JSON: { is_smoker, consumes_alcohol }
  shoe_type?: string;
}
export type NewConsultation = Omit<Consultation, 'id'>;


// --- Fotos ---
export interface Photo {
  id: number;
  consultation_id: number;
  local_uri: string;
  stage: 'antes' | 'despues';
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
