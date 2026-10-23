import { useState } from 'react';
import { Database, Globe, Trash2, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Layout from '../components/Layout';
import { getAllCases, seedDemoCases, deleteCase } from '../store';

export default function Settings() {
  const [cleared, setCleared] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const caseCount = getAllCases().length;

  function handleClearAll() {
    if (confirm('Are you sure you want to delete ALL cases? This cannot be undone.')) {
      const cases = getAllCases();
      cases.forEach(c => deleteCase(c.id));
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    }
  }

  function handleLoadDemo() {
    seedDemoCases();
    setDemoLoaded(true);
    setTimeout(() => setDemoLoaded(false), 3000);
  }

  function handleReload() {
    window.location.reload();
  }

  const speechSupported = !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0B2342]">Settings & Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">Application status, demo controls, and deployment information.</p>
        </div>

        <div className="space-y-6">
          {/* Current Mode */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0B2342] mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#20B6A0]" /> Current Mode
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Storage Mode</span>
                <span className="px-2 py-0.5 bg-[#20B6A0]/10 text-[#20B6A0] rounded-full text-xs font-medium flex items-center gap-1">
                  <Database className="w-3 h-3" /> Local Storage (Demo)
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">AI Mode</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Demo AI (Deterministic Parser)
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Speech Recognition</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${speechSupported ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {speechSupported ? '✓ Supported' : '✗ Not Supported'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Supabase</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  Not Configured
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Total Cases</span>
                <span className="text-sm font-medium text-[#0B2342]">{caseCount}</span>
              </div>
            </div>
          </section>

          {/* Base URL */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0B2342] mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#20B6A0]" /> Deployment & QR Base URL
            </h2>
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">Current QR Base URL:</p>
              <code className="text-sm text-[#12365B] font-mono bg-white px-3 py-1.5 rounded border border-gray-200 block">
                {window.location.origin}
              </code>
            </div>
            <div className="text-sm text-gray-500 space-y-2">
              <p>QR codes encode links using the current origin. When deployed:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                <li>Deploy to Vercel, Netlify, or any static host</li>
                <li>Set the base URL to your deployed domain</li>
                <li>QR links will then work from any device with network access</li>
                <li>For production: configure server-side authorization for record access</li>
              </ul>
            </div>
          </section>

          {/* Demo Controls */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0B2342] mb-4">Demo Controls</h2>
            <div className="space-y-3">
              <button
                onClick={handleLoadDemo}
                className="w-full px-4 py-3 bg-[#12365B] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#0B2342]"
              >
                <RefreshCw className="w-4 h-4" /> Load Demo Cases
              </button>
              {demoLoaded && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Demo cases loaded successfully.
                </div>
              )}
              <button
                onClick={handleClearAll}
                className="w-full px-4 py-3 border border-red-200 text-red-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" /> Clear All Cases
              </button>
              {cleared && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> All cases cleared.
                </div>
              )}
              <button
                onClick={handleReload}
                className="w-full px-4 py-3 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" /> Reload Application
              </button>
            </div>
          </section>

          {/* Environment Variables */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0B2342] mb-4">Environment Variables</h2>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto">
              <pre>{`# .env.example
# Supabase Configuration (optional)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Configuration (optional - falls back to demo mode)
VITE_AI_API_URL=your_ai_api_endpoint
VITE_AI_API_KEY=your_ai_api_key

# Base URL for QR codes (optional - defaults to window.location.origin)
VITE_BASE_URL=https://your-deployed-domain.com`}</pre>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              No environment variables are required for demo mode. The application works entirely with local storage when no credentials are configured.
            </p>
          </section>

          {/* Warnings */}
          <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 space-y-2">
                <p className="font-semibold">Important Limitations</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Local storage is NOT secure for real medical data</li>
                  <li>Demo AI output is deterministic, not from a real LLM</li>
                  <li>QR links have no server-side authorization in demo mode</li>
                  <li>No encryption, audit logging, or access control</li>
                  <li>This is a hackathon prototype, not a clinical product</li>
                  <li>Never use with real patient data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#0B2342] mb-4">About</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Aarogya Emergency QR Scribe</strong> — Scan to Save</p>
              <p>Voice-First Emergency Handover System</p>
              <p className="text-gray-400">Developed by <strong>Team HealthNova</strong></p>
              <p className="text-gray-400">K.R. Mangalam University (KRMU)</p>
              <p className="text-gray-400">School of Medical and Allied Sciences (SOMC)</p>
              <p className="text-gray-400 mt-3">24-Hour Hackathon Prototype • {new Date().getFullYear()}</p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
