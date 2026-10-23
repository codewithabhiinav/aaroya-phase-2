import { EmergencyCase, AIDraft } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'aarogya_cases';

export function getAllCases(): EmergencyCase[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getCaseById(id: string): EmergencyCase | null {
  const cases = getAllCases();
  return cases.find(c => c.id === id) || null;
}

export function getCaseByToken(token: string): EmergencyCase | null {
  console.log('=== getCaseByToken called ===');
  console.log('Looking for token:', token);
  console.log('Token length:', token?.length);
  console.log('Token type:', typeof token);
  
  const cases = getAllCases();
  console.log('Total cases in storage:', cases.length);
  
  const allTokens = cases.map(c => ({
    token: c.publicToken,
    length: c.publicToken.length,
    patient: c.patientLabel
  }));
  console.log('All available tokens:', allTokens);
  
  // Try exact match first
  let found = cases.find(c => c.publicToken === token) || null;
  console.log('Exact match result:', found ? 'FOUND' : 'NOT FOUND');
  
  // If not found, try case-insensitive match
  if (!found && token) {
    found = cases.find(c => c.publicToken.toLowerCase() === token.toLowerCase()) || null;
    console.log('Case-insensitive match result:', found ? 'FOUND' : 'NOT FOUND');
  }
  
  // If still not found, try partial match (first 16 chars)
  if (!found && token) {
    found = cases.find(c => c.publicToken.substring(0, 16) === token.substring(0, 16)) || null;
    console.log('Partial match result:', found ? 'FOUND' : 'NOT FOUND');
  }
  
  console.log('Final result:', found ? `Found case: ${found.patientLabel}` : 'No case found');
  console.log('=== End getCaseByToken ===');
  
  return found;
}

export function createCase(partial: Partial<EmergencyCase>): EmergencyCase {
  const newCase: EmergencyCase = {
    id: uuidv4(),
    publicToken: uuidv4().replace(/-/g, '').substring(0, 16),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    patientLabel: '',
    age: '',
    sex: '',
    emergencyCategory: '',
    incidentLocation: '',
    chiefComplaint: '',
    symptoms: '',
    symptomOnset: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      temperature: '',
      glasgowComaScale: '',
    },
    interventions: '',
    interventionTime: '',
    handoverNotes: '',
    originalTranscript: '',
    aiDraft: '',
    verifiedAt: '',
    isDemo: false,
    ...partial,
  };
  const cases = getAllCases();
  cases.push(newCase);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  console.log('Created case:', newCase);
  return newCase;
}

export function updateCase(id: string, updates: Partial<EmergencyCase>): EmergencyCase | null {
  const cases = getAllCases();
  const index = cases.findIndex(c => c.id === id);
  if (index === -1) return null;
  cases[index] = { ...cases[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  return cases[index];
}

export function deleteCase(id: string): boolean {
  const cases = getAllCases();
  const filtered = cases.filter(c => c.id !== id);
  if (filtered.length === cases.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function verifyCase(id: string): EmergencyCase | null {
  return updateCase(id, {
    status: 'verified',
    verifiedAt: new Date().toISOString(),
  });
}

export function invalidateVerification(id: string): EmergencyCase | null {
  return updateCase(id, {
    status: 'awaiting_verification',
    verifiedAt: '',
  });
}

export function generateAIDraft(transcript: string): AIDraft {
  const lower = transcript.toLowerCase();
  const missingInfo: string[] = [];

  // Extract chief complaint
  let chiefComplaint = 'Not specified';
  const complaintPatterns = [
    /(?:reports?|complains? of|presenting with|chief complaint[:\s]+)([^.]+)/i,
    /(?:chest pain|abdominal pain|headache|breathing difficulty|shortness of breath|dizziness|bleeding|fracture|injury)/i,
  ];
  for (const pattern of complaintPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      chiefComplaint = match[1]?.trim() || match[0].trim();
      break;
    }
  }

  // Extract symptoms
  const symptomKeywords = ['pain', 'dizziness', 'nausea', 'vomiting', 'bleeding', 'swelling', 'numbness', 'weakness', 'difficulty breathing', 'shortness of breath', 'chest pain', 'headache', 'fever', 'cough', 'confusion'];
  const foundSymptoms: string[] = [];
  symptomKeywords.forEach(s => {
    if (lower.includes(s)) foundSymptoms.push(s);
  });
  const symptoms = foundSymptoms.length > 0 ? foundSymptoms.join(', ') : 'Not specified';

  // Extract vitals
  let vitals = 'Not reported';
  const bpMatch = transcript.match(/blood pressure\s*(?:reading\s*(?:is|was)?)?\s*(\d+\s*(?:\/|over|to)\s*\d+)/i);
  const hrMatch = transcript.match(/(?:heart rate|pulse)\s*(?:is|was|reading)?\s*(\d+)/i);
  const o2Match = transcript.match(/(?:oxygen|spo2|saturation)\s*(?:is|was|reading|level)?\s*(\d+)/i);
  const tempMatch = transcript.match(/temperature\s*(?:is|was|reading)?\s*(\d+\.?\d*)/i);
  
  const vitalParts: string[] = [];
  if (bpMatch) vitalParts.push(`BP: ${bpMatch[1]}`);
  if (hrMatch) vitalParts.push(`HR: ${hrMatch[1]} bpm`);
  if (o2Match) vitalParts.push(`SpO2: ${o2Match[1]}%`);
  if (tempMatch) vitalParts.push(`Temp: ${tempMatch[1]}°F`);
  if (vitalParts.length > 0) vitals = vitalParts.join(', ');

  // Extract allergies
  let allergies = 'Not specified';
  if (lower.includes('allergy') || lower.includes('allergic')) {
    const allergyMatch = transcript.match(/allerg(?:y|ies|ic to)\s*(?:to)?\s*([^.]*)/i);
    if (allergyMatch) {
      const allergyText = allergyMatch[1].trim();
      if (allergyText.includes('unknown') || allergyText.includes('not known') || allergyText.includes('no known')) {
        allergies = 'Unknown / Not reported';
      } else {
        allergies = allergyText || 'Not specified';
      }
    }
  }
  if (lower.includes('unknown') && lower.includes('allergy')) {
    allergies = 'Unknown';
  }

  // Extract medical history
  let medicalHistory = 'Not reported';
  const historyKeywords = ['diabetes', 'hypertension', 'asthma', 'cardiac', 'heart disease', 'cancer', 'seizure', 'stroke'];
  const foundHistory: string[] = [];
  historyKeywords.forEach(h => {
    if (lower.includes(h)) foundHistory.push(h);
  });
  if (foundHistory.length > 0) medicalHistory = foundHistory.join(', ');

  // Extract medications
  let medications = 'Not reported';
  if (lower.includes('medication') || lower.includes('taking') || lower.includes('on ')) {
    const medMatch = transcript.match(/(?:taking|on|medication)[:\s]+([^.]*)/i);
    if (medMatch) medications = medMatch[1].trim();
  }

  // Extract interventions
  let interventions = 'Not reported';
  const interventionKeywords = ['cpr', 'bandage', 'splint', 'iv', 'oxygen', 'administered', 'applied', 'given'];
  const foundInterventions: string[] = [];
  interventionKeywords.forEach(i => {
    if (lower.includes(i)) foundInterventions.push(i);
  });
  if (foundInterventions.length > 0) interventions = foundInterventions.join(', ');

  // Determine missing info
  if (chiefComplaint === 'Not specified') missingInfo.push('Chief complaint not clearly stated');
  if (symptoms === 'Not specified') missingInfo.push('Symptoms not identified');
  if (vitals === 'Not reported') missingInfo.push('Vital signs not reported');
  if (allergies === 'Not specified') missingInfo.push('Allergy status unknown');
  if (medicalHistory === 'Not reported') missingInfo.push('Medical history not reported');
  if (medications === 'Not reported') missingInfo.push('Current medications not reported');
  if (interventions === 'Not reported') missingInfo.push('Interventions not reported');

  // Generate summary
  const summary = `Emergency handover: Patient presenting with ${chiefComplaint.toLowerCase()}. ${
    foundSymptoms.length > 0 ? `Reported symptoms include ${foundSymptoms.join(', ')}.` : ''
  } ${vitalParts.length > 0 ? `Vitals: ${vitalParts.join(', ')}.` : 'Vital signs not available.'} ${
    allergies !== 'Not specified' ? `Allergies: ${allergies}.` : 'Allergy status unknown.'
  } ${missingInfo.length > 0 ? `Note: ${missingInfo.length} field(s) require confirmation.` : ''}`;

  return {
    chiefComplaint,
    symptoms,
    vitals,
    medicalHistory,
    allergies,
    medications,
    interventions,
    missingInfo,
    summary,
  };
}

export function seedDemoCases(): void {
  const existing = getAllCases();
  if (existing.some(c => c.isDemo)) return;

  const demoCases: Partial<EmergencyCase>[] = [
    {
      patientLabel: 'DEMO-001: Anonymous Male, ~45 yrs',
      age: '~45',
      sex: 'Male',
      emergencyCategory: 'Cardiac',
      incidentLocation: 'Highway near Sector 14',
      chiefComplaint: 'Chest pain and dizziness',
      symptoms: 'chest pain, dizziness',
      symptomOnset: 'Approximately 30 minutes ago',
      medicalHistory: 'Not reported',
      allergies: 'Unknown',
      medications: 'Not reported',
      vitals: { bloodPressure: '90/60', heartRate: '', respiratoryRate: '', oxygenSaturation: '', temperature: '', glasgowComaScale: '' },
      interventions: 'Not reported',
      originalTranscript: 'Patient reports chest pain and dizziness. Blood pressure reading is 90 over 60. Allergy information is unknown. Patient appears pale and anxious.',
      status: 'verified',
      isDemo: true,
      verifiedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      patientLabel: 'DEMO-002: Anonymous Female, ~28 yrs',
      age: '~28',
      sex: 'Female',
      emergencyCategory: 'Trauma',
      incidentLocation: 'Ring Road intersection',
      chiefComplaint: 'Right arm injury from road accident',
      symptoms: 'arm pain, swelling, limited mobility',
      symptomOnset: '20 minutes ago',
      medicalHistory: 'Not reported',
      allergies: 'Unknown',
      medications: 'Not reported',
      vitals: { bloodPressure: '', heartRate: '110', respiratoryRate: '', oxygenSaturation: '', temperature: '', glasgowComaScale: '' },
      interventions: 'Splint applied to right arm',
      originalTranscript: 'Female patient involved in road accident. Right arm injury with visible swelling. Patient reports severe pain. Heart rate is 110. Allergy status unknown. Splint applied to right arm at scene.',
      status: 'awaiting_verification',
      isDemo: true,
    },
    {
      patientLabel: 'DEMO-003: Anonymous, age unknown',
      age: '',
      sex: '',
      emergencyCategory: 'Respiratory',
      incidentLocation: 'City Park, near fountain',
      chiefComplaint: 'Severe breathing difficulty',
      symptoms: 'breathing difficulty, wheezing',
      symptomOnset: 'Sudden onset, ~10 minutes ago',
      medicalHistory: 'Not reported',
      allergies: 'Not reported',
      medications: 'Not reported',
      vitals: { bloodPressure: '', heartRate: '', respiratoryRate: '28', oxygenSaturation: '89', temperature: '', glasgowComaScale: '' },
      interventions: 'Patient positioned upright, oxygen not yet available',
      originalTranscript: 'Patient experiencing severe breathing difficulty. Respiratory rate appears elevated at 28. Oxygen saturation measured at 89 percent. Patient positioned upright. Some vital measurements unavailable. No history obtained yet.',
      status: 'draft',
      isDemo: true,
    },
  ];

  demoCases.forEach(dc => createCase(dc));
}

export function getCaseStats() {
  const cases = getAllCases();
  return {
    total: cases.length,
    draft: cases.filter(c => c.status === 'draft').length,
    awaitingVerification: cases.filter(c => c.status === 'awaiting_verification').length,
    verified: cases.filter(c => c.status === 'verified').length,
  };
}

export function getBaseUrl(): string {
  // Use the current origin (protocol + hostname + port)
  return window.location.origin;
}
