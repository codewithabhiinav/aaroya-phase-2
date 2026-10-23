import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Copy, CheckCircle, QrCode } from 'lucide-react';
import Layout from '../components/Layout';
import { getAllCases } from '../store';
import { EmergencyCase } from '../types';

export default function TestQRCodes() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    setCases(getAllCases());
  }, []);

  function copyLink(token: string) {
    const url = `${window.location.origin}/record/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    });
  }

  const verifiedCases = cases.filter(c => c.status === 'verified');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0B2342]">🧪 QR Code Test Helper</h1>
          <p className="text-sm text-gray-500 mt-1">
            Test all verified case QR links. Click any link to open the doctor record.
          </p>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h2 className="font-semibold text-blue-900 mb-2">📋 How to Test QR Codes</h2>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Click any "Open Record" link below to test in the same browser</li>
            <li>The doctor record page should load with the case details</li>
            <li>To test on mobile: copy the link and open it on your phone's browser</li>
            <li>Note: Demo data is in localStorage, so it only works on THIS device</li>
          </ol>
        </div>

        {/* Verified Cases with QR */}
        {verifiedCases.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#0B2342]">
              Verified Cases ({verifiedCases.length})
            </h2>
            {verifiedCases.map(c => {
              const recordUrl = `${window.location.origin}/record/${c.publicToken}`;
              return (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Verified
                        </span>
                        {c.isDemo && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            Demo
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-[#0B2342]">{c.patientLabel || 'Anonymous'}</h3>
                      <p className="text-sm text-gray-500">{c.chiefComplaint || 'No complaint'}</p>
                    </div>
                    <QrCode className="w-8 h-8 text-[#20B6A0] flex-shrink-0" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 flex-shrink-0">Token:</span>
                      <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded flex-1 overflow-x-auto">
                        {c.publicToken}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 flex-shrink-0">URL:</span>
                      <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded flex-1 overflow-x-auto text-[#20B6A0]">
                        {recordUrl}
                      </code>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link
                      to={`/record/${c.publicToken}`}
                      target="_blank"
                      className="flex-1 px-4 py-2 bg-[#20B6A0] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1a9e8a] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Record
                    </Link>
                    <button
                      onClick={() => copyLink(c.publicToken)}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      {copiedToken === c.publicToken ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-600 mb-2">No Verified Cases</h3>
            <p className="text-sm text-gray-400 mb-4">
              Create and verify a case to generate a QR code.
            </p>
            <Link
              to="/dashboard"
              className="inline-block px-4 py-2 bg-[#20B6A0] text-white rounded-lg text-sm font-medium hover:bg-[#1a9e8a]"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* All Cases */}
        {cases.length > 0 && cases.length !== verifiedCases.length && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[#0B2342] mb-4">
              All Cases ({cases.length})
            </h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="space-y-2">
                {cases.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm bg-white px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        c.status === 'verified' ? 'bg-green-500' :
                        c.status === 'awaiting_verification' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`}></span>
                      <span className="font-mono text-xs text-gray-600">{c.publicToken.substring(0, 8)}</span>
                      <span className="text-gray-700">{c.patientLabel?.substring(0, 30) || 'Anonymous'}</span>
                    </div>
                    <span className="text-xs text-gray-400 capitalize">{c.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 flex gap-3">
          <Link to="/dashboard" className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium text-center hover:bg-gray-50">
            Dashboard
          </Link>
          <Link to="/case/create" className="flex-1 px-4 py-2.5 bg-[#20B6A0] text-white rounded-lg text-sm font-medium text-center hover:bg-[#1a9e8a]">
            Create New Case
          </Link>
        </div>
      </div>
    </Layout>
  );
}
