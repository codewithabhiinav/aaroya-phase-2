import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mic, FileText, CheckCircle, QrCode, Smartphone, ArrowRight, Shield, AlertTriangle } from 'lucide-react';
import { createCase } from '../store';

export default function Landing() {
  const navigate = useNavigate();

  function handleTryVoice() {
    const newCase = createCase({
      patientLabel: 'Voice Demo Patient',
      status: 'draft',
    });
    navigate(`/case/${newCase.id}/scribe`);
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#12365B] to-[#20B6A0] rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#12365B] text-lg">HealthNova</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/roadmap" className="text-sm text-gray-600 hover:text-[#12365B] hidden sm:block">Roadmap</Link>
            <Link to="/dashboard" className="px-4 py-2 bg-[#12365B] text-white rounded-lg text-sm font-medium hover:bg-[#0B2342] transition-colors">
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#20B6A0]/10 text-[#20B6A0] rounded-full text-sm font-medium mb-6">
            <AlertTriangle className="w-3.5 h-3.5" />
            Hackathon Prototype — Not Clinically Validated
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0B2342] leading-tight mb-6">
            Every Second Matters.<br />
            <span className="text-[#20B6A0]">Every Handover Counts.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Turn emergency voice notes into structured, paramedic-verified handover records accessible through a unique QR link.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTryVoice}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-base font-semibold hover:opacity-90 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 animate-recording-pulse"
            >
              🎤 Try Voice Input <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/case/create"
              className="px-6 py-3 bg-[#20B6A0] text-white rounded-xl text-base font-semibold hover:bg-[#1a9e8a] transition-all shadow-lg shadow-[#20B6A0]/20 flex items-center justify-center gap-2"
            >
              Create Emergency Case <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-white border border-gray-200 text-[#12365B] rounded-xl text-base font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              Open Dashboard
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <Link to="/history" className="hover:text-[#20B6A0] transition-colors">View Demo Cases</Link>
            <span>•</span>
            <Link to="/roadmap" className="hover:text-[#20B6A0] transition-colors">How It Works</Link>
            <span>•</span>
            <Link to="/settings" className="hover:text-[#20B6A0] transition-colors">Settings</Link>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2342] text-center mb-4">How It Works</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            A streamlined workflow from emergency capture to doctor-facing record.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Mic, title: 'Capture', desc: 'Voice or text input of emergency observations' },
              { icon: FileText, title: 'Structure', desc: 'AI-assisted structured note generation' },
              { icon: CheckCircle, title: 'Verify', desc: 'Paramedic reviews and confirms accuracy' },
              { icon: QrCode, title: 'Generate QR', desc: 'Unique QR code links to the record' },
              { icon: Smartphone, title: 'Scan', desc: 'Doctor accesses record via QR link' },
            ].map((step, i) => (
              <div key={i} className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#12365B] to-[#20B6A0] rounded-xl flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-bold text-[#20B6A0] mb-1">STEP {i + 1}</div>
                <h3 className="font-semibold text-[#0B2342] mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Demo Highlight */}
      <section className="bg-gradient-to-br from-[#0B2342] to-[#12365B] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-medium mb-6">
            <Mic className="w-4 h-4" /> Working Microphone Feature
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">🎤 Voice-First Emergency Capture</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Click the big microphone button, speak your emergency observations, and watch the transcript appear in real-time. 
            Works in Chrome, Edge, and Safari. No setup required.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/20">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl animate-recording-pulse">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <p className="text-white font-semibold mb-2">Tap to Start Recording</p>
            <div className="flex items-center justify-center gap-1 h-6 mb-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-1 bg-[#20B6A0] rounded-full" style={{ height: `${8 + Math.random() * 16}px` }}></div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Live audio level meter • Real-time transcript</p>
          </div>
          <button
            onClick={handleTryVoice}
            className="mt-8 px-8 py-4 bg-red-500 text-white rounded-xl text-base font-bold hover:bg-red-600 transition-all shadow-xl shadow-red-500/30 inline-flex items-center gap-2"
          >
            🎤 Try It Now — Click to Start Voice Demo
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2342] text-center mb-12">Current Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Voice & Text Input', desc: 'Browser Web Speech API with manual text fallback for all environments.' },
            { title: 'AI Structured Drafts', desc: 'Deterministic demo parser extracts structured fields from free-text input.' },
            { title: 'Human Verification', desc: 'Paramedic must review and confirm before any record becomes QR-ready.' },
            { title: 'Unique QR Codes', desc: 'Each verified case gets a unique QR linking to a doctor-facing browser page.' },
            { title: 'PDF Export', desc: 'Download or print structured handover records with all clinical details.' },
            { title: 'Case History', desc: 'Search, filter, and manage all emergency cases from a single dashboard.' },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-[#0B2342] mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety Notice */}
      <section className="bg-[#0B2342] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-8 h-8 mx-auto mb-4 text-[#20B6A0]" />
          <h2 className="text-xl font-bold mb-3">Safety & Limitations</h2>
          <p className="text-gray-300 text-sm max-w-2xl mx-auto">
            This is a hackathon prototype developed by Team HealthNova at K.R. Mangalam University (KRMU), School of Medical and Allied Sciences (SOMC). 
            It uses synthetic data only. It is NOT clinically validated, NOT regulatory compliant, and should NOT be used for real patient data. 
            Production deployment requires security review, clinical validation, proper authentication, and regulatory approval.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#12365B] to-[#20B6A0] rounded-md flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-[#12365B]">Team HealthNova</span>
          </div>
          <p className="text-sm text-gray-500">
            K.R. Mangalam University (KRMU) — School of Medical and Allied Sciences (SOMC)
          </p>
          <p className="text-xs text-gray-400 mt-2">24-Hour Hackathon Prototype • Demo Mode Active</p>
        </div>
      </footer>
    </div>
  );
}
