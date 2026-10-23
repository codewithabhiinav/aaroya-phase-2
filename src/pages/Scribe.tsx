import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, FileText, ArrowRight, AlertTriangle, Loader2, Save, Volume2, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { getCaseById, updateCase, generateAIDraft } from '../store';
import { EmergencyCase, AIDraft } from '../types';

export default function Scribe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<EmergencyCase | null>(null);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [aiDraft, setAiDraft] = useState<AIDraft | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
    // Check mic permission
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as any }).then((result: any) => {
        setMicPermission(result.state);
        result.onchange = () => setMicPermission(result.state);
      }).catch(() => {});
    }
    return () => {
      cleanupRecording();
    };
  }, [id, navigate]);

  // Scroll transcript to bottom when new text arrives
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, interimText]);

  function cleanupRecording() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }

  // Audio level visualizer
  function startAudioVisualizer(stream: MediaStream) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      function updateLevel() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, (avg / 128) * 100);
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      }
      updateLevel();
    } catch (e) {
      console.warn('Audio visualizer not available:', e);
    }
  }

  async function startRecording() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari. You can still type manually.');
      return;
    }

    setError('');
    setInterimText('');

    // Request microphone access for visualizer
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermission('granted');
      startAudioVisualizer(stream);
    } catch (err: any) {
      console.warn('Mic access failed:', err);
      setMicPermission('denied');
      // Still proceed with speech recognition even without visualizer
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let lastFinalIndex = 0;

    recognition.onresult = (event: any) => {
      let interim = '';
      let newFinal = '';

      for (let i = lastFinalIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript + ' ';
          lastFinalIndex = i + 1;
        } else {
          interim += result[0].transcript;
        }
      }

      if (newFinal) {
        setTranscript(prev => prev + newFinal);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setMicPermission('denied');
        setError('Microphone access denied. Please allow microphone permission in your browser settings and try again.');
        setIsRecording(false);
        cleanupRecording();
      } else if (event.error === 'no-speech') {
        // Don't show error for no-speech, just keep listening
      } else if (event.error !== 'aborted') {
        setError(`Speech recognition error: ${event.error}. You can still type manually below.`);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be recording
      if (isRecording && recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          setIsRecording(false);
        }
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Failed to start speech recognition. Please try again.');
      cleanupRecording();
    }
  }

  function stopRecording() {
    cleanupRecording();
    setIsRecording(false);
    setAudioLevel(0);
    setInterimText('');
    // Save transcript
    if (id && transcript) {
      updateCase(id, { originalTranscript: transcript });
    }
  }

  function handleGenerateDraft() {
    if (!transcript.trim()) {
      setError('Please enter or record a transcript first.');
      return;
    }
    setIsGenerating(true);
    setError('');

    setTimeout(() => {
      const draft = generateAIDraft(transcript);
      setAiDraft(draft);
      setIsGenerating(false);

      if (id) {
        updateCase(id, {
          originalTranscript: transcript,
          aiDraft: JSON.stringify(draft),
          status: 'awaiting_verification',
        });
        setCaseData(prev => prev ? { ...prev, status: 'awaiting_verification', aiDraft: JSON.stringify(draft), originalTranscript: transcript } : null);
      }
    }, 1200);
  }

  function handleSaveTranscript() {
    if (id) {
      updateCase(id, { originalTranscript: transcript });
    }
  }

  function handleClearTranscript() {
    setTranscript('');
    setInterimText('');
    if (id) {
      updateCase(id, { originalTranscript: '' });
    }
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
            <div>
              <p>{error}</p>
              {micPermission === 'denied' && (
                <p className="mt-1 text-xs">Tip: Click the lock/info icon in your browser's address bar to allow microphone access.</p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* ===== MICROPHONE RECORDING PANEL ===== */}
          <section className={`rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
            isRecording 
              ? 'border-red-300 bg-gradient-to-br from-red-50 via-white to-red-50 shadow-lg shadow-red-100' 
              : 'border-gray-200 bg-white'
          }`}>
            {/* Recording Status Bar */}
            {isRecording && (
              <div className="bg-red-500 text-white px-5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-50"></div>
                  </div>
                  <span className="text-sm font-semibold tracking-wide">● RECORDING</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Large Mic Button Area */}
              <div className="flex flex-col items-center mb-6">
                {/* Ripple rings when recording */}
                <div className="relative mb-4">
                  {isRecording && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                      <div className="absolute -inset-3 rounded-full bg-red-400/10 animate-ping" style={{ animationDuration: '2s' }}></div>
                      <div className="absolute -inset-6 rounded-full bg-red-400/5 animate-ping" style={{ animationDuration: '2.5s' }}></div>
                    </>
                  )}
                  
                  {/* Main Mic Button */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!speechSupported}
                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-200'
                        : 'bg-gradient-to-br from-[#12365B] to-[#20B6A0] hover:scale-105 shadow-[#12365B]/30'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-10 h-10 text-white" />
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                  </button>
                </div>

                {/* Status Text */}
                <p className={`text-sm font-medium mb-2 ${isRecording ? 'text-red-600' : 'text-gray-500'}`}>
                  {isRecording ? 'Listening... Speak now' : speechSupported ? 'Tap microphone to start voice input' : 'Voice input not available in this browser'}
                </p>

                {/* Audio Level Meter (visible when recording) */}
                {isRecording && (
                  <div className="w-full max-w-xs mt-3">
                    <div className="flex items-center gap-1 h-8 justify-center">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const threshold = (i / 20) * 100;
                        const active = audioLevel > threshold;
                        const height = 8 + (i * 1.2);
                        return (
                          <div
                            key={i}
                            className={`w-1.5 rounded-full transition-all duration-75 ${
                              active 
                                ? i < 14 ? 'bg-[#20B6A0]' : 'bg-red-500'
                                : 'bg-gray-200'
                            }`}
                            style={{ height: `${height}px` }}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-1">Audio Level</p>
                  </div>
                )}

                {/* Mic permission hint */}
                {!isRecording && micPermission === 'denied' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700 max-w-sm text-center">
                    <strong>Microphone access denied.</strong> Click the 🔒 icon in your address bar → Site settings → Allow microphone.
                  </div>
                )}
              </div>

              {/* Live Transcript Display */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Live Transcript</span>
                  <div className="flex items-center gap-3">
                    {isRecording && (
                      <span className="flex items-center gap-1.5 text-xs text-red-500">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Live
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{transcript.length} chars</span>
                  </div>
                </div>
                <div className="p-4 min-h-[120px] max-h-[250px] overflow-y-auto">
                  {transcript || interimText ? (
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      <span>{transcript}</span>
                      {interimText && (
                        <span className="text-[#20B6A0] italic opacity-70">{interimText}</span>
                      )}
                      <div ref={transcriptEndRef} />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic flex items-center justify-center h-full min-h-[80px]">
                      {isRecording 
                        ? 'Waiting for speech... Start talking.' 
                        : 'Your transcript will appear here. Click the mic button or type below.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Recording controls row */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {transcript && (
                    <button onClick={handleClearTranscript} className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors">
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
                <button onClick={handleSaveTranscript} className="text-xs text-[#20B6A0] hover:underline flex items-center gap-1 font-medium">
                  <Save className="w-3 h-3" /> Save transcript
                </button>
              </div>
            </div>
          </section>

          {/* ===== MANUAL TEXT ENTRY ===== */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[#0B2342]">Manual Text Entry</h2>
              <span className="text-xs text-gray-400">Type or edit transcript below</span>
            </div>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              rows={4}
              placeholder="Type emergency observations here...&#10;&#10;Example: 'Patient reports chest pain and dizziness. Blood pressure reading is 90 over 60. Allergy information is unknown.'"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B6A0]/30 focus:border-[#20B6A0] resize-y"
              disabled={isRecording}
            />
            {!speechSupported && (
              <p className="text-xs text-gray-400 mt-2">
                💡 Voice input requires Chrome, Edge, or Safari. You can type manually here.
              </p>
            )}
          </section>

          {/* ===== GENERATE BUTTON ===== */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerateDraft}
              disabled={isGenerating || !transcript.trim()}
              className="px-8 py-4 bg-gradient-to-r from-[#20B6A0] to-[#45C98A] text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl shadow-[#20B6A0]/25 transition-all hover:scale-[1.02] disabled:hover:scale-100"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating Structured Note...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" /> Generate Structured Note
                </>
              )}
            </button>
          </div>

          {/* ===== AI DRAFT PREVIEW ===== */}
          {aiDraft && (
            <section className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-lg font-semibold text-[#0B2342]">AI Draft</h2>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  Demo AI Output — Verification Required
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Chief Complaint', value: aiDraft.chiefComplaint },
                  { label: 'Reported Symptoms', value: aiDraft.symptoms },
                  { label: 'Measured / Observed Vitals', value: aiDraft.vitals },
                  { label: 'Medical History', value: aiDraft.medicalHistory },
                  { label: 'Known Allergies', value: aiDraft.allergies },
                  { label: 'Medications', value: aiDraft.medications },
                  { label: 'Interventions Performed', value: aiDraft.interventions },
                ].map((field, i) => (
                  <div key={i}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">{field.label}</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{field.value}</p>
                  </div>
                ))}

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Missing / Unconfirmed Information</h3>
                  {aiDraft.missingInfo.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-orange-600 bg-orange-50 p-3 rounded-lg space-y-0.5">
                      {aiDraft.missingInfo.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">✓ All fields appear populated.</p>
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
                className="px-6 py-3 bg-[#12365B] text-white rounded-xl text-sm font-semibold hover:bg-[#0B2342] flex items-center gap-2 shadow-lg"
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
