import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowRight, Edit3, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import { getCaseById, updateCase, verifyCase, invalidateVerification, generateAIDraft } from '../store';
import { EmergencyCase, AIDraft } from '../types';

export default function Verify() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<EmergencyCase | null>(null);
  const [aiDraft, setAiDraft] = useState<AIDraft | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (id) {
      const c = getCaseById(id);
      if (c) {
        setCaseData(c);
        if (c.aiDraft) {
          try { setAiDraft(JSON.parse(c.aiDraft)); } catch { setAiDraft(null); }
        }
        setVerified(c.status === 'verified');
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, navigate]);

  function startEdit(field: string, currentValue: string) {
    setEditingField(field);
    setEditValue(currentValue);
  }

  function saveEdit() {
    if (!aiDraft || !editingField || !id) return;
    const updated = { ...aiDraft, [editingField]: editValue };
    setAiDraft(updated);
    setEditingField(null);
    
    // If already verified, invalidate verification
    if (caseData?.status === 'verified') {
      invalidateVerification(id);
      setVerified(false);
      setCaseData(prev => prev ? { ...prev, status: 'awaiting_verification' as const, verifiedAt: '' } : null);
    }
    
    // Save updated draft
    updateCase(id, { aiDraft: JSON.stringify(updated) });
  }

  function cancelEdit() {
    setEditingField(null);
    setEditValue('');
  }

  function handleVerify() {
    if (!id) return;
    const result = verifyCase(id);
    if (result) {
      setCaseData(result);
      setVerified(true);
    }
  }

  if (!caseData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>
      </Layout>
    );
  }

  function renderField(label: string, field: string, value: string) {
    const isEditing = editingField === field;
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
          {!isEditing && (
            <button onClick={() => startEdit(field, value)} className="text-xs text-[#20B6A0] hover:underline flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-[#20B6A0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B6A0]/30"
            />
            <div className="flex gap-2">
              <button onClick={saveEdit} className="px-3 py-1 bg-[#20B6A0] text-white text-xs rounded-lg">Save</button>
              <button onClick={cancelEdit} className="px-3 py-1 border border-gray-200 text-xs rounded-lg">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">{value || 'Not specified'}</p>
        )}
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-gray-400">{caseData.publicToken.substring(0, 8).toUpperCase()}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              verified ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {verified ? 'Verified' : 'Awaiting Verification'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B2342]">Human Verification & Review</h1>
          <p className="text-sm text-gray-500 mt-1">Review and confirm all information before generating QR code.</p>
        </div>

        {verified && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-700">
              <strong>Verified by Paramedic.</strong> This record has been confirmed as accurate. 
              Editing any field will invalidate verification and require re-review.
              <br /><span className="text-xs">Verified at: {caseData.verifiedAt ? new Date(caseData.verifiedAt).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        )}

        {!verified && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <strong>Review Required.</strong> Please verify that all information accurately represents what was reported or observed. 
              Edit any field that needs correction before confirming.
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Original Transcript */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0B2342] mb-3">Original Transcript</h2>
            <p className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded-lg">
              {caseData.originalTranscript || 'No transcript recorded.'}
            </p>
          </section>

          {/* AI Draft Review */}
          {aiDraft && (
            <section className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-[#0B2342]">Generated Note — Edit & Verify</h2>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  Verification Required
                </span>
              </div>

              <div className="space-y-4">
                {renderField('Chief Complaint', 'chiefComplaint', aiDraft.chiefComplaint)}
                {renderField('Reported Symptoms', 'symptoms', aiDraft.symptoms)}
                {renderField('Vitals', 'vitals', aiDraft.vitals)}
                {renderField('Medical History', 'medicalHistory', aiDraft.medicalHistory)}
                {renderField('Known Allergies', 'allergies', aiDraft.allergies)}
                {renderField('Medications', 'medications', aiDraft.medications)}
                {renderField('Interventions', 'interventions', aiDraft.interventions)}
                {renderField('Handover Summary', 'summary', aiDraft.summary)}

                {/* Missing info */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-orange-700 mb-2">Missing / Unconfirmed Information</h3>
                  {aiDraft.missingInfo.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-orange-600">
                      {aiDraft.missingInfo.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-600">✓ All fields appear populated.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {!aiDraft && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No AI draft generated yet. Go to the Scribe page first.</p>
              <button onClick={() => navigate(`/case/${id}/scribe`)} className="px-4 py-2 bg-[#20B6A0] text-white rounded-lg text-sm">
                Go to AI Scribe
              </button>
            </div>
          )}

          {/* Verification Actions */}
          {aiDraft && !verified && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-[#0B2342] mb-3">Confirm Verification</h2>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  By clicking "Verify and Save Record", you confirm that:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                  <li>The information accurately represents what was reported or observed</li>
                  <li>Missing fields are correctly marked as unknown</li>
                  <li>No fabricated data has been introduced</li>
                  <li>The record is ready for QR code generation</li>
                </ul>
              </div>
              <button
                onClick={handleVerify}
                className="w-full px-6 py-3 bg-[#20B6A0] text-white rounded-xl text-sm font-semibold hover:bg-[#1a9e8a] flex items-center justify-center gap-2 shadow-lg shadow-[#20B6A0]/20"
              >
                <CheckCircle className="w-4 h-4" /> Verify and Save Record
              </button>
            </div>
          )}

          {/* Post-verification navigation */}
          {verified && (
            <div className="flex justify-end">
              <button
                onClick={() => navigate(`/case/${id}/qr`)}
                className="px-6 py-3 bg-[#12365B] text-white rounded-xl text-sm font-semibold hover:bg-[#0B2342] flex items-center gap-2"
              >
                Generate QR Code <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


