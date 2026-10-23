import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, Copy, Printer, ExternalLink, CheckCircle, QrCode, ArrowLeft } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Layout from '../components/Layout';
import { getCaseById, getBaseUrl } from '../store';
import { EmergencyCase } from '../types';

export default function QRPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<EmergencyCase | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const c = getCaseById(id);
      if (c) {
        if (c.status !== 'verified') {
          navigate(`/case/${id}/verify`);
          return;
        }
        setCaseData(c);
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, navigate]);

  function getRecordUrl(): string {
    if (!caseData) return '';
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/record/${caseData.publicToken}`;
    console.log('=== QR URL Generation ===');
    console.log('Base URL:', baseUrl);
    console.log('Public Token:', caseData.publicToken);
    console.log('Token length:', caseData.publicToken.length);
    console.log('Full URL:', url);
    console.log('URL length:', url.length);
    console.log('========================');
    return url;
  }

  function handleCopyLink() {
    if (!caseData) return;
    const url = getRecordUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadQR() {
    if (!qrRef.current || !caseData) return;
    
    try {
      const canvas = qrRef.current.querySelector('canvas');
      if (!canvas) {
        setError('QR code canvas not found');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `aarogya-qr-${caseData.publicToken.substring(0, 8)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setError('');
    } catch (err: any) {
      setError(`Download failed: ${err.message}`);
    }
  }

  function handlePrintQR() {
    if (!qrRef.current || !caseData) return;
    
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) {
      setError('QR code canvas not found');
      return;
    }
    
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('Pop-up blocked. Please allow pop-ups for this site.');
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Aarogya QR - ${caseData.publicToken.substring(0, 8).toUpperCase()}</title>
        <style>
          body { font-family: Inter, -apple-system, sans-serif; text-align: center; padding: 40px; margin: 0; }
          h1 { font-size: 20px; color: #0B2342; margin-bottom: 8px; }
          .subtitle { font-size: 12px; color: #666; margin-bottom: 24px; }
          .qr-container { display: inline-block; padding: 16px; border: 3px solid #0B2342; border-radius: 12px; background: white; }
          .qr-container img { width: 280px; height: 280px; display: block; }
          .case-info { margin-top: 20px; font-size: 14px; color: #333; }
          .case-id { font-family: monospace; font-weight: bold; }
          .footer { font-size: 10px; color: #999; margin-top: 24px; line-height: 1.6; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Aarogya Emergency QR Scribe</h1>
        <p class="subtitle">Voice-First Emergency Handover</p>
        <div class="qr-container">
          <img src="${dataUrl}" alt="QR Code" />
        </div>
        <div class="case-info">
          <p class="case-id">Case: ${caseData.publicToken.substring(0, 8).toUpperCase()}</p>
          <p>${caseData.patientLabel}</p>
        </div>
        <p class="footer">
          Scan QR code to access emergency handover record<br>
          Generated: ${new Date().toLocaleString()}<br>
          Team HealthNova | KRMU SOMC
        </p>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 250); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
    setError('');
  }

  if (!caseData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-2 border-[#20B6A0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading case...</p>
        </div>
      </Layout>
    );
  }

  const recordUrl = getRecordUrl();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#12365B] mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-gray-400">{caseData.publicToken.substring(0, 8).toUpperCase()}</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Verified</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B2342]">QR Code Generated</h1>
          <p className="text-sm text-gray-500 mt-1">Share this QR code or test the link below.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Test Banner */}
        <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-2">✅ QR Code Ready to Test!</h3>
              <p className="text-sm text-green-800 mb-4">
                Click the button below to open the doctor record in a new tab and verify it works.
              </p>
              <a
                href={recordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg text-base font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ExternalLink className="w-5 h-5" />
                Test QR Link → Opens Record
              </a>
              <div className="mt-4 bg-white/70 rounded-lg p-3 border border-green-200">
                <p className="text-xs font-semibold text-green-800 mb-1">📋 Record URL (copy if needed):</p>
                <p className="text-xs font-mono text-green-900 break-all bg-white px-2 py-1 rounded border border-green-100">
                  {recordUrl}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <div ref={qrRef} className="inline-block p-4 bg-white border-2 border-[#0B2342] rounded-xl mb-4">
              <QRCodeCanvas
                value={recordUrl}
                size={280}
                level="H"
                includeMargin={false}
                bgColor="#FFFFFF"
                fgColor="#0B2342"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0B2342]">{caseData.patientLabel}</p>
              <p className="text-xs text-gray-400 mt-1">Case: {caseData.publicToken.substring(0, 8).toUpperCase()}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button 
                onClick={handleDownloadQR} 
                className="px-4 py-2.5 bg-[#12365B] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#0B2342] transition-colors"
              >
                <Download className="w-4 h-4" /> Download QR
              </button>
              <button 
                onClick={handleCopyLink} 
                className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button 
                onClick={handlePrintQR} 
                className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print QR
              </button>
              <a 
                href={recordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#20B6A0] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1a9e8a] transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open Record
              </a>
            </div>
          </div>

          {/* Record Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-[#0B2342] mb-4">Record Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Case ID</span>
                  <span className="font-mono text-[#0B2342]">{caseData.publicToken.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Patient</span>
                  <span className="text-[#0B2342]">{caseData.patientLabel}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-600 font-medium">Verified by Paramedic</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Created</span>
                  <span className="text-[#0B2342]">{new Date(caseData.createdAt).toLocaleString()}</span>
                </div>
                <div className="py-2">
                  <span className="text-gray-500 text-xs block mb-1">QR Link:</span>
                  <p className="text-[#20B6A0] text-xs font-mono break-all bg-gray-50 p-2 rounded">{recordUrl}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#12365B] rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-2">📱 How QR Works</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p><strong>Same device:</strong> Click "Test QR Link" above to verify.</p>
                <p><strong>Different device:</strong> Demo data is in localStorage, so QR only works on THIS device/browser.</p>
                <p><strong>Production:</strong> With Supabase backend, QR would work on any device.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/dashboard" className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium text-center hover:bg-gray-50 transition-colors">
                Dashboard
              </Link>
              <Link to="/test-qr" className="flex-1 px-4 py-2.5 bg-[#12365B] text-white rounded-lg text-sm font-medium text-center hover:bg-[#0B2342] transition-colors">
                Test All QR Codes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
