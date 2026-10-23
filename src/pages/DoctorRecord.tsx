import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Copy, Download, Printer, AlertTriangle, Shield, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { getCaseByToken, getAllCases } from '../store';
import { EmergencyCase } from '../types';
import jsPDF from 'jspdf';

export default function DoctorRecord() {
  const { token } = useParams<{ token: string }>();
  const [caseData, setCaseData] = useState<EmergencyCase | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('=== DoctorRecord Loading ===');
    console.log('Token from URL:', token);
    
    if (token) {
      // Small delay to ensure localStorage is ready
      setTimeout(() => {
        const c = getCaseByToken(token);
        console.log('Case found:', c);
        
        if (c) {
          setCaseData(c);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      }, 100);
    } else {
      console.log('No token provided');
      setNotFound(true);
      setLoading(false);
    }
  }, [token]);

  function getHandoverSummary(): string {
    if (!caseData) return '';
    let aiDraft = null;
    try { aiDraft = JSON.parse(caseData.aiDraft); } catch {}
    
    if (aiDraft) {
      return aiDraft.summary || '';
    }
    
    const parts = [];
    if (caseData.chiefComplaint) parts.push(`Chief complaint: ${caseData.chiefComplaint}`);
    if (caseData.symptoms) parts.push(`Symptoms: ${caseData.symptoms}`);
    if (caseData.vitals.bloodPressure) parts.push(`BP: ${caseData.vitals.bloodPressure}`);
    if (caseData.vitals.heartRate) parts.push(`HR: ${caseData.vitals.heartRate} bpm`);
    if (caseData.vitals.oxygenSaturation) parts.push(`SpO2: ${caseData.vitals.oxygenSaturation}%`);
    if (caseData.allergies) parts.push(`Allergies: ${caseData.allergies}`);
    if (caseData.interventions) parts.push(`Interventions: ${caseData.interventions}`);
    return parts.join('. ') || 'No summary available.';
  }

  function handleCopySummary() {
    const summary = getHandoverSummary();
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadPDF() {
    if (!caseData) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(16);
    doc.setTextColor(11, 54, 91);
    doc.text('AAROGYA EMERGENCY QR SCRIBE', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Emergency Handover Record', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(11);
    doc.setTextColor(11, 54, 91);
    doc.text(`Case ID: ${caseData.publicToken.substring(0, 8).toUpperCase()}`, 20, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Created: ${new Date(caseData.createdAt).toLocaleString()}`, 20, y);
    y += 5;
    doc.text(`Status: ${caseData.status === 'verified' ? 'Verified by Paramedic' : caseData.status}`, 20, y);
    y += 5;
    if (caseData.verifiedAt) {
      doc.text(`Verified: ${new Date(caseData.verifiedAt).toLocaleString()}`, 20, y);
      y += 5;
    }
    y += 5;

    doc.setFontSize(11);
    doc.setTextColor(11, 54, 91);
    doc.text('Patient Information', 20, y);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(60);
    
    const patientInfo = [
      ['Patient:', caseData.patientLabel || 'Anonymous'],
      ['Age:', caseData.age || 'Unknown'],
      ['Sex:', caseData.sex || 'Unknown'],
      ['Category:', caseData.emergencyCategory || 'Not specified'],
      ['Location:', caseData.incidentLocation || 'Not reported'],
    ];
    patientInfo.forEach(([label, value]) => {
      doc.text(`${label} ${value}`, 25, y);
      y += 5;
    });
    y += 5;

    doc.setFontSize(11);
    doc.setTextColor(11, 54, 91);
    doc.text('Clinical Information', 20, y);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(60);

    const clinicalInfo = [
      ['Chief Complaint:', caseData.chiefComplaint || 'Not specified'],
      ['Symptoms:', caseData.symptoms || 'Not reported'],
      ['Onset:', caseData.symptomOnset || 'Unknown'],
      ['Medical History:', caseData.medicalHistory || 'Not reported'],
      ['Allergies:', caseData.allergies || 'Not reported'],
      ['Medications:', caseData.medications || 'Not reported'],
    ];
    clinicalInfo.forEach(([label, value]) => {
      const lines = doc.splitTextToSize(`${label} ${value}`, pageWidth - 50);
      doc.text(lines, 25, y);
      y += lines.length * 5 + 2;
    });
    y += 3;

    doc.setFontSize(11);
    doc.setTextColor(11, 54, 91);
    doc.text('Vital Signs', 20, y);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(60);

    const vitals = [
      ['Blood Pressure:', caseData.vitals.bloodPressure ? `${caseData.vitals.bloodPressure} mmHg` : 'Not recorded'],
      ['Heart Rate:', caseData.vitals.heartRate ? `${caseData.vitals.heartRate} bpm` : 'Not recorded'],
      ['Respiratory Rate:', caseData.vitals.respiratoryRate ? `${caseData.vitals.respiratoryRate} /min` : 'Not recorded'],
      ['Oxygen Saturation:', caseData.vitals.oxygenSaturation ? `${caseData.vitals.oxygenSaturation}%` : 'Not recorded'],
      ['Temperature:', caseData.vitals.temperature ? `${caseData.vitals.temperature}°F` : 'Not recorded'],
      ['GCS:', caseData.vitals.glasgowComaScale || 'Not recorded'],
    ];
    vitals.forEach(([label, value]) => {
      doc.text(`${label} ${value}`, 25, y);
      y += 5;
    });
    y += 5;

    doc.setFontSize(11);
    doc.setTextColor(11, 54, 91);
    doc.text('Interventions', 20, y);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(60);
    const intLines = doc.splitTextToSize(caseData.interventions || 'Not reported', pageWidth - 50);
    doc.text(intLines, 25, y);
    y += intLines.length * 5 + 5;

    doc.setFontSize(11);
    doc.setTextColor(11, 54, 91);
    doc.text('Handover Summary', 20, y);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(60);
    const summaryLines = doc.splitTextToSize(getHandoverSummary(), pageWidth - 50);
    doc.text(summaryLines, 25, y);
    y += summaryLines.length * 5 + 10;

    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text('SYNTHETIC DEMO DATA — Not for clinical use', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text('Aarogya Emergency QR Scribe | Team HealthNova | KRMU SOMC', pageWidth / 2, y, { align: 'center' });

    doc.save(`aarogya-handover-${caseData.publicToken.substring(0, 8)}.pdf`);
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#20B6A0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading record...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    const allCases = getAllCases();
    return (
      <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center p-4">
        <div className="text-center max-w-2xl w-full">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-[#0B2342] mb-2">Record Not Found</h1>
          <p className="text-sm text-gray-500 mb-4">
            This QR code link is invalid or the record has been deleted.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-xs font-semibold text-yellow-800 mb-2">🔍 Debug Information:</p>
            <p className="text-xs text-yellow-700 mb-2">Token: {token || 'none'}</p>
            {allCases.length > 0 && (
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <p className="text-xs font-semibold text-yellow-800 mb-2">Available Cases ({allCases.length}):</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {allCases.map(c => (
                    <div key={c.id} className="text-xs text-yellow-700 flex justify-between items-center bg-yellow-100/50 px-2 py-1 rounded">
                      <span className="font-mono">{c.publicToken}</span>
                      <Link to={`/record/${c.publicToken}`} className="text-blue-600 hover:underline">Open →</Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {allCases.length === 0 && (
              <p className="text-xs text-yellow-700 mt-2">No cases found. Create a case first!</p>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <Link to="/dashboard" className="px-6 py-2 bg-[#12365B] text-white rounded-lg text-sm font-medium hover:bg-[#0B2342]">
              Go to Dashboard
            </Link>
            <Link to="/test-qr" className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              Test QR Codes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <div className="min-h-screen bg-[#FCFBF8] print:bg-white">
      <header className="bg-white border-b border-gray-100 print:hidden">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="w-8 h-8 bg-gradient-to-br from-[#12365B] to-[#20B6A0] rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#12365B] text-sm">Aarogya Scribe</span>
              <p className="text-xs text-gray-400">Emergency Handover</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopySummary} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg flex items-center gap-1 hover:bg-gray-50">
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleDownloadPDF} className="px-3 py-1.5 text-xs font-medium bg-[#12365B] text-white rounded-lg flex items-center gap-1 hover:bg-[#0B2342]">
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg flex items-center gap-1 hover:bg-gray-50">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
          caseData.status === 'verified' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          {caseData.status === 'verified' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`text-sm font-semibold ${caseData.status === 'verified' ? 'text-green-700' : 'text-yellow-700'}`}>
              {caseData.status === 'verified' ? 'Verified by Paramedic' : 'Draft — Not Yet Verified'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Case: {caseData.publicToken.substring(0, 8).toUpperCase()} | Created: {new Date(caseData.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {caseData.isDemo && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-600 font-medium text-center">
            ⚠ SYNTHETIC DEMO DATA — Not real patient information
          </div>
        )}

        <section className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h2 className="text-base font-semibold text-[#0B2342] mb-3">Patient Information</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div><span className="text-xs text-gray-400">Patient</span><p className="text-sm font-medium text-[#0B2342]">{caseData.patientLabel || 'Anonymous'}</p></div>
            <div><span className="text-xs text-gray-400">Age</span><p className="text-sm font-medium text-[#0B2342]">{caseData.age || 'Unknown'}</p></div>
            <div><span className="text-xs text-gray-400">Sex</span><p className="text-sm font-medium text-[#0B2342]">{caseData.sex || 'Unknown'}</p></div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h2 className="text-base font-semibold text-[#0B2342] mb-3">Chief Complaint</h2>
          <p className="text-sm text-gray-700 font-medium">{caseData.chiefComplaint || 'Not specified'}</p>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h2 className="text-base font-semibold text-[#0B2342] mb-3">Vital Signs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div><span className="text-xs text-gray-400">Blood Pressure</span><p className="text-sm font-medium text-[#0B2342]">{caseData.vitals.bloodPressure ? `${caseData.vitals.bloodPressure} mmHg` : 'Not recorded'}</p></div>
            <div><span className="text-xs text-gray-400">Heart Rate</span><p className="text-sm font-medium text-[#0B2342]">{caseData.vitals.heartRate ? `${caseData.vitals.heartRate} bpm` : 'Not recorded'}</p></div>
            <div><span className="text-xs text-gray-400">SpO2</span><p className="text-sm font-medium text-[#0B2342]">{caseData.vitals.oxygenSaturation ? `${caseData.vitals.oxygenSaturation}%` : 'Not recorded'}</p></div>
          </div>
        </section>

        <section className="bg-[#12365B] rounded-xl p-5 mb-6 text-white">
          <h2 className="text-base font-semibold mb-3">Handover Summary</h2>
          <p className="text-sm leading-relaxed">{getHandoverSummary()}</p>
        </section>

        <footer className="text-center py-4 border-t border-gray-100 print:hidden">
          <p className="text-xs text-gray-400">Team HealthNova | KRMU SOMC | Hackathon Prototype</p>
        </footer>
      </div>
    </div>
  );
}
