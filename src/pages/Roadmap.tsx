import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Rocket, Shield, FlaskConical, Building2 } from 'lucide-react';
import Layout from '../components/Layout';

export default function Roadmap() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0B2342]">Project Roadmap</h1>
          <p className="text-sm text-gray-500 mt-1">Current capabilities and future development plan for Aarogya Emergency QR Scribe.</p>
        </div>

        <div className="space-y-8">
          {/* Phase 1 */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0B2342]">Phase 1 — Current Hackathon Prototype</h2>
                <span className="text-xs text-green-600 font-medium">✓ Active</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Voice/text capture via Web Speech API',
                'Deterministic AI structured draft generation',
                'Human verification workflow',
                'Unique QR code generation per case',
                'Doctor-facing browser record page',
                'Case history with search and filter',
                'PDF export and print functionality',
                'Demo mode with synthetic data',
                'Local storage persistence',
                'Responsive mobile-first design',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          {/* Phase 2 */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0B2342]">Phase 2 — Validation</h2>
                <span className="text-xs text-blue-600 font-medium">Planned</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Simulated emergency usability tests',
                'Noisy-ambulance speech recognition testing',
                'Note accuracy evaluation with medical professionals',
                'Privacy and security review',
                'Medical professional feedback collection',
                'Performance benchmarking under load',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          {/* Phase 3 */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0B2342]">Phase 3 — Future Research</h2>
                <span className="text-xs text-purple-600 font-medium">Research Stage</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Physical QR wristband prototype',
                'Biodegradable basil-seed film feasibility study',
                'Offline record access and synchronization',
                'Secure wearable identification systems',
                'Cross-platform mobile application',
                'Multi-language voice recognition',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Rocket className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg text-xs text-purple-700">
              <strong>Note:</strong> Physical wristband and biodegradable film concepts are future research directions. 
              They are NOT implemented in the current prototype.
            </div>
          </section>

          {/* Phase 4 */}
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0B2342]">Phase 4 — Future Integration</h2>
                <span className="text-xs text-gray-500 font-medium">Vision</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Evaluate authorized ABHA/ABDM integration',
                'Hospital information system integrations',
                'Clinical validation and pilot readiness',
                'Regulatory compliance (HIPAA, DISHA)',
                'Audit logging and access controls',
                'End-to-end encryption for data at rest and transit',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
              <strong>Note:</strong> ABHA/ABDM integration has NOT been implemented or authorized. 
              It remains a future evaluation target pending proper authorization and technical readiness.
            </div>
          </section>

          {/* Security & Privacy */}
          <section className="bg-[#0B2342] rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-[#20B6A0]" />
              <h2 className="text-lg font-semibold">Security & Privacy Considerations</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
              {[
                'Server-side authorization for QR record access',
                'End-to-end encryption for patient data',
                'Role-based access control (paramedic, doctor, admin)',
                'Audit logging for all record access',
                'Data retention and deletion policies',
                'Penetration testing and security review',
                'Consent management framework',
                'Compliance with applicable health data regulations',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#20B6A0] rounded-full flex-shrink-0"></div>
                  {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              These are production requirements. The current prototype uses local storage and does NOT implement these security measures.
            </p>
          </section>

          {/* CTA */}
          <div className="text-center py-8">
            <h2 className="text-xl font-bold text-[#0B2342] mb-3">Ready to try the prototype?</h2>
            <p className="text-sm text-gray-500 mb-6">Create a demo case and experience the full workflow.</p>
            <div className="flex justify-center gap-3">
              <Link to="/case/create" className="px-6 py-3 bg-[#20B6A0] text-white rounded-xl text-sm font-semibold hover:bg-[#1a9e8a]">
                Create Emergency Case
              </Link>
              <Link to="/dashboard" className="px-6 py-3 border border-gray-200 text-[#12365B] rounded-xl text-sm font-semibold hover:bg-gray-50">
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
