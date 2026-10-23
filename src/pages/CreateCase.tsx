import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowRight, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import { createCase } from '../store';
import { Vitals } from '../types';

export default function CreateCase() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
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
    } as Vitals,
    interventions: '',
    interventionTime: '',
    handoverNotes: '',
  });

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function updateVital(field: string, value: string) {
    setForm(prev => ({ ...prev, vitals: { ...prev.vitals, [field]: value } }));
  }

  function handleSaveDraft() {
    const newCase = createCase({
      patientLabel: form.patientLabel || 'Anonymous Patient',
      age: form.age,
      sex: form.sex,
      emergencyCategory: form.emergencyCategory,
      incidentLocation: form.incidentLocation,
      chiefComplaint: form.chiefComplaint,
      symptoms: form.symptoms,
      symptomOnset: form.symptomOnset,
      medicalHistory: form.medicalHistory,
      allergies: form.allergies,
      medications: form.medications,
      vitals: form.vitals,
      interventions: form.interventions,
      interventionTime: form.interventionTime,
      handoverNotes: form.handoverNotes,
      status: 'draft',
    });
    setSaved(true);
    setTimeout(() => navigate(`/case/${newCase.id}/scribe`), 800);
  }

  function handleContinueToScribe() {
    const newCase = createCase({
      patientLabel: form.patientLabel || 'Anonymous Patient',
      age: form.age,
      sex: form.sex,
      emergencyCategory: form.emergencyCategory,
      incidentLocation: form.incidentLocation,
      chiefComplaint: form.chiefComplaint,
      symptoms: form.symptoms,
      symptomOnset: form.symptomOnset,
      medicalHistory: form.medicalHistory,
      allergies: form.allergies,
      medications: form.medications,
      vitals: form.vitals,
      interventions: form.interventions,
      interventionTime: form.interventionTime,
      handoverNotes: form.handoverNotes,
      status: 'draft',
    });
    navigate(`/case/${newCase.id}/scribe`);
  }

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B6A0]/30 focus:border-[#20B6A0]";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0B2342]">Create Emergency Case</h1>
          <p className="text-sm text-gray-500 mt-1">Enter patient observations. Unknown fields can remain blank.</p>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Case saved as draft. Redirecting to AI Scribe...
          </div>
        )}

        <div className="space-y-8">
          {/* Case Information */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0B2342] mb-4">Case Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Patient Label / Anonymous ID</label>
                <input type="text" value={form.patientLabel} onChange={e => updateField('patientLabel', e.target.value)} placeholder="e.g., Anonymous Male ~40" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Age (approximate)</label>
                <input type="text" value={form.age} onChange={e => updateField('age', e.target.value)} placeholder="e.g., ~40" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Sex</label>
                <select value={form.sex} onChange={e => updateField('sex', e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Emergency Category</label>
                <select value={form.emergencyCategory} onChange={e => updateField('emergencyCategory', e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  <option value="Cardiac">Cardiac</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Respiratory">Respiratory</option>
                  <option value="Neurological">Neurological</option>
                  <option value="Medical">Medical</option>
                  <option value="Obstetric">Obstetric</option>
                  <option value="Pediatric">Pediatric</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Incident Location</label>
                <input type="text" value={form.incidentLocation} onChange={e => updateField('incidentLocation', e.target.value)} placeholder="e.g., Highway near Sector 14" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Clinical Information */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0B2342] mb-4">Clinical Information</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Chief Complaint *</label>
                <input type="text" value={form.chiefComplaint} onChange={e => updateField('chiefComplaint', e.target.value)} placeholder="e.g., Chest pain and dizziness" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Reported Symptoms</label>
                <textarea value={form.symptoms} onChange={e => updateField('symptoms', e.target.value)} rows={2} placeholder="e.g., Chest tightness, nausea, sweating" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Symptom Onset</label>
                <input type="text" value={form.symptomOnset} onChange={e => updateField('symptomOnset', e.target.value)} placeholder="e.g., 30 minutes ago" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Relevant Medical History</label>
                <textarea value={form.medicalHistory} onChange={e => updateField('medicalHistory', e.target.value)} rows={2} placeholder="e.g., Diabetes, hypertension" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Known Allergies</label>
                  <input type="text" value={form.allergies} onChange={e => updateField('allergies', e.target.value)} placeholder="e.g., Penicillin or Unknown" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Current Medications</label>
                  <input type="text" value={form.medications} onChange={e => updateField('medications', e.target.value)} placeholder="e.g., Metformin 500mg" className={inputClass} />
                </div>
              </div>
            </div>
          </section>

          {/* Vital Signs */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0B2342] mb-4">Vital Signs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Blood Pressure (mmHg)</label>
                <input type="text" value={form.vitals.bloodPressure} onChange={e => updateVital('bloodPressure', e.target.value)} placeholder="e.g., 120/80" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Heart Rate (bpm)</label>
                <input type="text" value={form.vitals.heartRate} onChange={e => updateVital('heartRate', e.target.value)} placeholder="e.g., 72" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Respiratory Rate (/min)</label>
                <input type="text" value={form.vitals.respiratoryRate} onChange={e => updateVital('respiratoryRate', e.target.value)} placeholder="e.g., 16" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Oxygen Saturation (%)</label>
                <input type="text" value={form.vitals.oxygenSaturation} onChange={e => updateVital('oxygenSaturation', e.target.value)} placeholder="e.g., 98" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Temperature (°F)</label>
                <input type="text" value={form.vitals.temperature} onChange={e => updateVital('temperature', e.target.value)} placeholder="e.g., 98.6" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Glasgow Coma Scale (GCS)</label>
                <input type="text" value={form.vitals.glasgowComaScale} onChange={e => updateVital('glasgowComaScale', e.target.value)} placeholder="e.g., 15" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Emergency Details */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0B2342] mb-4">Emergency Details</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Interventions Performed</label>
                <textarea value={form.interventions} onChange={e => updateField('interventions', e.target.value)} rows={2} placeholder="e.g., CPR started, oxygen administered" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Intervention Time</label>
                <input type="text" value={form.interventionTime} onChange={e => updateField('interventionTime', e.target.value)} placeholder="e.g., 14:30 hrs" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Additional Handover Notes</label>
                <textarea value={form.handoverNotes} onChange={e => updateField('handoverNotes', e.target.value)} rows={3} placeholder="Any additional observations or notes..." className={inputClass} />
              </div>
            </div>
          </section>

          {/* Safety Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This data is stored in browser local storage only. Do not enter real patient information. 
              All fields are optional except Chief Complaint. Unknown fields should remain blank.
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={handleSaveDraft}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button
              onClick={handleContinueToScribe}
              className="px-6 py-3 bg-[#20B6A0] text-white rounded-xl text-sm font-semibold hover:bg-[#1a9e8a] flex items-center justify-center gap-2 shadow-lg shadow-[#20B6A0]/20"
            >
              Continue to AI Scribe <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
