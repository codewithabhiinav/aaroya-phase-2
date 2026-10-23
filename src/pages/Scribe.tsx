import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, FileText, ArrowRight, AlertTriangle, Loader2, Save } from 'lucide-react';
import Layout from '../components/Layout';
import { getCaseById, updateCase, generateAIDraft } from '../store';
import { EmergencyCase, AIDraft } from '../types';

export default function Scribe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<EmergencyCase | null>(null);
  const [transcript, setTranscript] = useState('');
  const [aiDraft, setAiDraft] = useState<AIDraft | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      const c = getCaseById(id);
      if (c) {
        setCaseData(c);
        setTranscript(c.originalTranscript || '');
        if (c.aiDraft) {
          try { setAiDraft(JSON.parse(c.aiDraft)); } catch { setAiDraft(null); }
        }
      } else {
        navigate('/dashboard');
      }
    }
    // Check speech support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, [id, navigate]);

  function startRecording() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use manual text entry.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted') {
        setError(`Speech recognition error: ${event.error}. You can still type manually.`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setError('');
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }

  function handleGenerateDraft() {
    if (!transcript.trim()) {
      setError('Please enter or record a transcript first.');
      return;
    }
    setIsGenerating(true);
    setError('');

    // Simulate processing delay
    setTimeout(() => {
      const draft = generateAIDraft(transcript);
      setAiDraft(draft);
      setIsGenerating(false);

      // Save to case
      if (id) {
        updateCase(id, {
          originalTranscript: transcript,
          aiDraft: JSON.stringify(draft),
          status: 'awaiting_verification',
        });
      }
    }, 1000);
  }

  function handleSaveTranscript() {
    if (id) {
      updateCase(id, { originalTranscript: transcript });
    }
  }

  if (!caseData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#20B6A0]" />
          <p className="text-gray-500 mt-4">Loading case...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-gray-400">{caseData.publicToken.substring(0, 8).toUpperCase()}</span>
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              {caseData.status === 'draft' ? 'Draft' : 'Awaiting Verification'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B2342]">AI Scribe & Transcript</h1>
          <p className="text-sm text-gray-500 mt-1">{caseData.patientLabel || 'Anonymous Patient'}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Voice / Text Input */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0B2342]">Emergency Transcript</h2>
              <div className="flex items-center gap-2">
                {!speechSupported && (
                  <span className="text-xs text-gray-400">Voice not supported</span>
                )}
                {isRecording ? (
                  <button onClick={stopRecording} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 animate-pulse">
                    <MicOff className="w-4 h-4" /> Stop
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    disabled={!speechSupported}
                    className="px-3 py-1.5 bg-[#12365B] text-white rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mic className="w-4 h-4" /> Record
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              rows={6}
              placeholder="Type or dictate the emergency observations here...&#10;&#10;Example: 'Patient reports chest pain and dizziness. Blood pressure reading is 90 over 60. Allergy information is unknown.'"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B6A0]/30 focus:border-[#20B6A0] resize-y"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">{transcript.length} characters</span>
              <button onClick={handleSaveTranscript} className="text-xs text-[#20B6A0] hover:underline flex items-center gap-1">
                <Save className="w-3 h-3" /> Save transcript
              </button>
            </div>
          </section>

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerateDraft}
              disabled={isGenerating || !transcript.trim()}
              className="px-6 py-3 bg-[#20B6A0] text-white rounded-xl text-sm font-semibold hover:bg-[#1a9e8a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#20B6A0]/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating Structured Note...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Generate Structured Note
                </>
              )}
            </button>
          </div>

          {/* AI Draft Preview */}
          {aiDraft && (
            <section className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-[#0B2342]">AI Draft</h2>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  Demo AI Output — Verification Required
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Chief Complaint</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{aiDraft.chiefComplaint}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Reported Symptoms</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{aiDraft.symptoms}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Measured / Observed Vitals</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{aiDraft.vitals}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Medical History</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{aiDraft.medicalHistory}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Known Allergies</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{aiDraft.allergies}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Medications</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{aiDraft.medications}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Interventions Performed</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{aiDraft.interventions}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Missing / Unconfirmed Information</h3>
                  {aiDraft.missingInfo.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                      {aiDraft.missingInfo.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">All fields appear populated.</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Emergency Handover Summary</h3>
                  <p className="text-sm text-gray-700 bg-[#12365B]/5 p-3 rounded-lg font-medium">{aiDraft.summary}</p>
                </div>
              </div>

              {/* Original Transcript */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Original Transcript (Preserved)</h3>
                <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">{transcript}</p>
              </div>
            </section>
          )}

          {/* Navigation */}
          {aiDraft && (
            <div className="flex justify-end">
              <button
                onClick={() => navigate(`/case/${id}/verify`)}
                className="px-6 py-3 bg-[#12365B] text-white rounded-xl text-sm font-semibold hover:bg-[#0B2342] flex items-center gap-2"
              >
                Continue to Verification <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
