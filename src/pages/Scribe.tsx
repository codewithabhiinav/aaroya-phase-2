import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, FileText, ArrowRight, AlertTriangle, Loader2, Save, Trash2, Play } from 'lucide-react';
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
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micStatus, setMicStatus] = useState<'idle' | 'requesting' | 'active' | 'error'>('idle');
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (id) {
      const c = getCaseById(id);
      if (c) {
        setCaseData(c);
        setTranscript(c.originalTranscript || '');
        finalTranscriptRef.current = c.originalTranscript || '';
        if (c.aiDraft) {
          try { setAiDraft(JSON.parse(c.aiDraft)); } catch { setAiDraft(null); }
        }
      } else {
        navigate('/dashboard');
      }
    }
    return () => {
      cleanupRecording();
    };
  }, [id, navigate]);

  function cleanupRecording() {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
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
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }

  function startAudioVisualizer(stream: MediaStream) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioContext = new AudioContextClass();
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
        const normalized = Math.min(100, (avg / 80) * 100);
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      }
      updateLevel();
    } catch (e) {
      console.warn('Audio visualizer not available:', e);
    }
  }

  async function startRecording() {
    setError('');
    setInterimText('');
    setMicStatus('requesting');

    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('❌ Speech recognition not supported. Please use Chrome, Edge, or Safari.');
      setMicStatus('error');
      return;
    }

    // Request microphone access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      startAudioVisualizer(stream);
    } catch (err: any) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('❌ Microphone permission denied. Please allow microphone access in your browser settings and refresh the page.');
      } else if (err.name === 'NotFoundError') {
        setError('❌ No microphone found. Please connect a microphone.');
      } else {
        setError(`❌ Microphone error: ${err.message}`);
      }
      setMicStatus('error');
      return;
    }

    // Setup speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let currentFinalTranscript = finalTranscriptRef.current;

    recognition.onresult = (event: any) => {
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript_piece = result[0].transcript;
        
        if (result.isFinal) {
          currentFinalTranscript += transcript_piece + ' ';
          finalTranscriptRef.current = currentFinalTranscript;
          setTranscript(currentFinalTranscript);
          setInterimText('');
        } else {
          interim += transcript_piece;
          setInterimText(interim);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('❌ Microphone access denied. Please allow microphone permission.');
        setMicStatus('error');
        cleanupRecording();
        setIsRecording(false);
      } else if (event.error === 'no-speech') {
        // Keep listening, no error
      } else if (event.error === 'aborted') {
        // Normal stop
      } else if (event.error === 'network') {
        setError('❌ Network error. Please check your internet connection for speech recognition.');
        setMicStatus('error');
        cleanupRecording();
        setIsRecording(false);
      } else {
        setError(`⚠️ Speech error: ${event.error}. You can still type manually.`);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still recording
      if (isRecording && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch (e) {
          console.log('Recognition restart failed:', e);
          setIsRecording(false);
          setMicStatus('idle');
        }
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
      setIsRecording(true);
      setMicStatus('active');
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError('❌ Failed to start speech recognition. Please try again.');
      setMicStatus('error');
      cleanupRecording();
    }
  }

  function stopRecording() {
    cleanupRecording();
    setIsRecording(false);
    setMicStatus('idle');
    setAudioLevel(0);
    setInterimText('');
    
    // Save transcript
    if (id && transcript) {
      updateCase(id, { originalTranscript: transcript });
    }
  }

  function handleGenerateDraft() {
    const textToProcess = transcript.trim();
    if (!textToProcess) {
      setError('❌ Please enter or record a transcript first. Click the microphone button or type below.');
      return;
    }
    
    setIsGenerating(true);
    setError('');

    // Simulate AI processing
    setTimeout(() => {
      const draft = generateAIDraft(textToProcess);
      setAiDraft(draft);
      setIsGenerating(false);

      if (id) {
        updateCase(id, {
          originalTranscript: textToProcess,
          aiDraft: JSON.stringify(draft),
          status: 'awaiting_verification',
        });
        setCaseData(prev => prev ? { 
          ...prev, 
          status: 'awaiting_verification', 
          aiDraft: JSON.stringify(draft), 
          originalTranscript: textToProcess 
        } : null);
      }
    }, 1500);
  }

  function handleSaveTranscript() {
    if (id) {
      updateCase(id, { originalTranscript: transcript });
      setError('✅ Transcript saved!');
      setTimeout(() => setError(''), 2000);
    }
  }

  function handleClearTranscript() {
    setTranscript('');
    setInterimText('');
    finalTranscriptRef.current = '';
    if (id) {
      updateCase(id, { originalTranscript: '' });
    }
  }

  function loadSampleTranscript() {
    const sample = "Patient reports chest pain and dizziness. Blood pressure reading is 90 over 60. Allergy information is unknown. Patient appears pale and anxious. Heart rate is elevated.";
    setTranscript(sample);
    finalTranscriptRef.current = sample;
    if (id) {
      updateCase(id, { originalTranscript: sample });
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
          <h1 className="text-2xl font-bold text-[#0B2342]">🎤 AI Scribe & Transcript</h1>
          <p className="text-sm text-gray-500 mt-1">{caseData.patientLabel || 'Anonymous Patient'}</p>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
            error.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-700' :
            'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <div className="space-y-6">
          {/* ===== MICROPHONE RECORDING PANEL ===== */}
          <section className={`rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
            isRecording 
              ? 'border-red-300 bg-gradient-to-br from-red-50 via-white to-red-50 shadow-xl shadow-red-100' 
              : 'border-gray-200 bg-white'
          }`}>
            {/* Recording Status Bar */}
            {isRecording && (
              <div className="bg-red-500 text-white px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-50"></div>
                  </div>
                  <span className="text-sm font-bold tracking-wide">● RECORDING</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold">{formatTime(recordingTime)}</span>
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Large Mic Button */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {isRecording && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                      <div className="absolute -inset-4 rounded-full bg-red-400/10 animate-ping" style={{ animationDuration: '2s' }}></div>
                    </>
                  )}
                  
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={micStatus === 'requesting'}
                    className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl disabled:opacity-40 ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-300'
                        : micStatus === 'requesting'
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-gradient-to-br from-[#12365B] to-[#20B6A0] hover:scale-105 shadow-[#12365B]/40'
                    }`}
                  >
                    {micStatus === 'requesting' ? (
                      <Loader2 className="w-12 h-12 text-white animate-spin" />
                    ) : isRecording ? (
                      <MicOff className="w-12 h-12 text-white" />
                    ) : (
                      <Mic className="w-12 h-12 text-white" />
                    )}
                  </button>
                </div>

                {/* Status Text */}
                <p className={`text-base font-semibold mb-2 ${isRecording ? 'text-red-600' : 'text-gray-700'}`}>
                  {isRecording ? '🎙️ Listening... Speak now' : 
                   micStatus === 'requesting' ? '🔄 Requesting microphone access...' :
                   micStatus === 'error' ? '❌ Microphone error - see above' :
                   '👆 Tap microphone to start voice input'}
                </p>

                {/* Audio Level Meter */}
                {isRecording && (
                  <div className="w-full max-w-md mt-4">
                    <div className="flex items-center gap-1 h-10 justify-center">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const threshold = (i / 24) * 100;
                        const active = audioLevel > threshold;
                        const height = 10 + (i * 1.5);
                        return (
                          <div
                            key={i}
                            className={`w-2 rounded-full transition-all duration-75 ${
                              active 
                                ? i < 16 ? 'bg-[#20B6A0]' : i < 20 ? 'bg-yellow-500' : 'bg-red-500'
                                : 'bg-gray-200'
                            }`}
                            style={{ height: `${height}px` }}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">Audio Level Meter</p>
                  </div>
                )}
              </div>

              {/* Live Transcript Display */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">📝 Live Transcript</span>
                  <div className="flex items-center gap-3">
                    {isRecording && (
                      <span className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{transcript.length} chars</span>
                  </div>
                </div>
                <div className="p-4 min-h-[150px] max-h-[300px] overflow-y-auto">
                  {transcript || interimText ? (
                    <div className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                      <span>{transcript}</span>
                      {interimText && (
                        <span className="text-[#20B6A0] italic opacity-80">{interimText}</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-base text-gray-400 italic flex items-center justify-center h-full min-h-[120px]">
                      {isRecording 
                        ? '🎙️ Waiting for speech... Start talking.' 
                        : '📝 Your transcript will appear here. Click the mic button or type below.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {transcript && (
                    <button onClick={handleClearTranscript} className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                  <button onClick={loadSampleTranscript} className="px-3 py-1.5 text-xs font-medium text-blue-500 hover:bg-blue-50 rounded-lg flex items-center gap-1">
                    <Play className="w-3 h-3" /> Load Sample
                  </button>
                </div>
                <button onClick={handleSaveTranscript} className="px-3 py-1.5 text-xs font-medium text-[#20B6A0] hover:bg-[#20B6A0]/10 rounded-lg flex items-center gap-1">
                  <Save className="w-3 h-3" /> Save
                </button>
              </div>
            </div>
          </section>

          {/* ===== MANUAL TEXT ENTRY ===== */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[#0B2342]">✍️ Manual Text Entry</h2>
              <span className="text-xs text-gray-400">Type or edit transcript</span>
            </div>
            <textarea
              value={transcript}
              onChange={e => {
                setTranscript(e.target.value);
                finalTranscriptRef.current = e.target.value;
              }}
              rows={4}
              placeholder="Type emergency observations here...&#10;&#10;Example: 'Patient reports chest pain and dizziness. Blood pressure reading is 90 over 60. Allergy information is unknown.'"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B6A0]/30 focus:border-[#20B6A0] resize-y"
              disabled={isRecording}
            />
          </section>

          {/* ===== GENERATE BUTTON ===== */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerateDraft}
              disabled={isGenerating || !transcript.trim()}
              className="px-8 py-4 bg-gradient-to-r from-[#20B6A0] to-[#45C98A] text-white rounded-2xl text-base font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl shadow-[#20B6A0]/30 transition-all hover:scale-105 disabled:hover:scale-100"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating Report...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" /> Generate Emergency Report
                </>
              )}
            </button>
          </div>

          {/* ===== AI DRAFT / REPORT PREVIEW ===== */}
          {aiDraft && (
            <section className="bg-white rounded-xl border-2 border-[#20B6A0] p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-xl font-bold text-[#0B2342]">📋 Emergency Report</h2>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                  Draft — Verification Required
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { label: '🎯 Chief Complaint', value: aiDraft.chiefComplaint, color: 'bg-red-50 border-red-200' },
                  { label: '📊 Reported Symptoms', value: aiDraft.symptoms, color: 'bg-blue-50 border-blue-200' },
                  { label: '💓 Vitals', value: aiDraft.vitals, color: 'bg-pink-50 border-pink-200' },
                  { label: '📜 Medical History', value: aiDraft.medicalHistory, color: 'bg-purple-50 border-purple-200' },
                  { label: '⚠️ Known Allergies', value: aiDraft.allergies, color: 'bg-yellow-50 border-yellow-200' },
                  { label: '💊 Medications', value: aiDraft.medications, color: 'bg-green-50 border-green-200' },
                  { label: '🏥 Interventions', value: aiDraft.interventions, color: 'bg-indigo-50 border-indigo-200' },
                ].map((field, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${field.color}`}>
                    <h3 className="text-sm font-bold text-gray-800 mb-2">{field.label}</h3>
                    <p className="text-sm text-gray-700">{field.value}</p>
                  </div>
                ))}

                <div className="p-4 rounded-lg border bg-orange-50 border-orange-200">
                  <h3 className="text-sm font-bold text-orange-800 mb-2">❓ Missing Information</h3>
                  {aiDraft.missingInfo.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                      {aiDraft.missingInfo.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-600 font-semibold">✅ All fields populated</p>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-[#12365B] text-white">
                  <h3 className="text-sm font-bold mb-2">📝 Handover Summary</h3>
                  <p className="text-sm leading-relaxed">{aiDraft.summary}</p>
                </div>
              </div>

              {/* Original Transcript */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-2">📄 Original Transcript</h3>
                <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">{transcript}</p>
              </div>
            </section>
          )}

          {/* Navigation */}
          {aiDraft && (
            <div className="flex justify-end">
              <button
                onClick={() => navigate(`/case/${id}/verify`)}
                className="px-6 py-3 bg-[#12365B] text-white rounded-xl text-sm font-bold hover:bg-[#0B2342] flex items-center gap-2 shadow-lg"
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
