export interface Vitals {
  bloodPressure: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  temperature: string;
  glasgowComaScale: string;
}

export interface EmergencyCase {
  id: string;
  publicToken: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'awaiting_verification' | 'verified';
  patientLabel: string;
  age: string;
  sex: string;
  emergencyCategory: string;
  incidentLocation: string;
  chiefComplaint: string;
  symptoms: string;
  symptomOnset: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  vitals: Vitals;
  interventions: string;
  interventionTime: string;
  handoverNotes: string;
  originalTranscript: string;
  aiDraft: string;
  verifiedAt: string;
  isDemo: boolean;
}

export interface AIDraft {
  chiefComplaint: string;
  symptoms: string;
  vitals: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  interventions: string;
  missingInfo: string[];
  summary: string;
}

export type CaseStatus = 'all' | 'draft' | 'awaiting_verification' | 'verified';
