import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, Copy, Printer, ExternalLink, CheckCircle, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import Layout from '../components/Layout';
import { getCaseById, getBaseUrl } from '../store';
import { EmergencyCase } from '../types';

export default function QRPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<EmergencyCase | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (id) {
      const c = getCaseById(id);
      if (c) {
        if (c.status !== 'verified') {
          navigate(`/case/${id}/verify`);
          return;
        }
        setCaseData(c);
        const url = `${getBaseUrl()}/record/${c.publicToken}`;
        QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: { dark: '#0B2342', light: '#FFFFFF' },
          errorCorrectionLevel: 'H',
        }).then(setQrDataUrl).catch(err => console.error('QR generation error:', err));
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, navigate]);

  function handleCopyLink() {
    if (!caseData) return;
    const url = `${getBaseUrl()}/record/${caseData.publicToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadQR() {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `aarogya-qr-${caseData?.publicToken.substring(0, 8)}.png`;
    link.href = qrDataUrl;
    link.click();
  }

  function handlePrintQR() {
    if (!qrDataUrl || !caseData) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Aarogya QR - ${caseData.publicToken.substring(0, 8).toUpperCase()}</title>
        <style>
          body { font-family: Inter, sans-serif; text-align: center; padding: 40px; }
          h1 { font-size: 18px; color: #0B2342; }
          .case-id { font-size: 12px; color: #666; margin-bottom: 20px; }
          img { max-width: 300px; margin: 20px auto; }
          .footer { font-size: 10px; color: #999; margin-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Aarogya Emergency QR Scribe</h1>
        <p class="case-id">Case: ${caseData.publicToken.substring(0, 8).toUpperCase()} | ${caseData.patientLabel}</p>
        <img src="${qrDataUrl}" alt="QR Code" />
        <p class="footer">Scan to access emergency handover record<br>Generated: ${new Date().toLocaleString()}</p>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  if (!caseData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>
      </Layout>
    );
  }

  const recordUrl = `${getBaseUrl()}/record/${caseData.publicToken}`;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-gray-400">{caseData.publicToken.substring(0, 8).toUpperCase()}</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Verified</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B2342]">QR Code Generated</h1>
          <p className="text-sm text-gray-500 mt-1">Share this QR code with the receiving doctor or print for the patient.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            {qrDataUrl ? (
              <div className="space-y-4">
                <div className="inline-block p-4 bg-white border-2 border-[#0B2342] rounded-xl">
                  <img src={qrDataUrl} alt="QR Code" className="w-64 h-64 mx-auto" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0B2342]">{caseData.patientLabel}</p>
                  <p className="text-xs text-gray-400 mt-1">Case: {caseData.publicToken.substring(0, 8).toUpperCase()}</p>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="py-12">
                <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-gray-400">Generating QR code...</p>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={handleDownloadQR} className="px-4 py-2.5 bg-[#12365B] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#0B2342]">
                <Download className="w-4 h-4" /> Download QR
              </button>
              <button onClick={handleCopyLink} className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button onClick={handlePrintQR} className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                <Printer className="w-4 h-4" /> Print QR
              </button>
              <Link to={`/record/${caseData.publicToken}`} target="_blank" className="px-4 py-2.5 bg-[#20B6A0] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1a9e8a]">
                <ExternalLink className="w-4 h-4" /> Open Doctor View
              </Link>
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
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Verified</span>
                  <span className="text-[#0B2342]">{caseData.verifiedAt ? new Date(caseData.verifiedAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">QR Link</span>
                  <span className="text-[#20B6A0] text-xs font-mono break-all">{recordUrl}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#12365B] rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-2">Deployment Note</h3>
              <p className="text-sm text-gray-300">
                This QR link uses the current deployment URL. When deployed to a public domain, 
                the QR code will be scannable from any device with network access. 
                In demo mode, links point to this browser session's storage.
              </p>
            </div>

            <div className="flex gap-3">
              <Link to="/dashboard" className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium text-center hover:bg-gray-50">
                Back to Dashboard
              </Link>
              <Link to="/history" className="flex-1 px-4 py-2.5 bg-[#12365B] text-white rounded-lg text-sm font-medium text-center hover:bg-[#0B2342]">
                View Case History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
