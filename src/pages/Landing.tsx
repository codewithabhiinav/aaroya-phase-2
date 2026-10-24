import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mic, FileText, CheckCircle, QrCode, Smartphone, ArrowRight, Shield, AlertTriangle } from 'lucide-react';
import { createCase } from '../store';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
            <LanguageSwitcher />
            <Link to="/roadmap" className="text-sm text-gray-600 hover:text-[#12365B] hidden sm:block">{t('roadmap')}</Link>
            <Link to="/dashboard" className="px-4 py-2 bg-[#12365B] text-white rounded-lg text-sm font-medium hover:bg-[#0B2342] transition-colors">
              {t('openDashboard')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#20B6A0]/10 text-[#20B6A0] rounded-full text-sm font-medium mb-6">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t('notClinicallyValidated')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0B2342] leading-tight mb-6">
            {t('headline')}<br />
            <span className="text-[#20B6A0]">{t('headlineHighlight')}</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTryVoice}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-base font-semibold hover:opacity-90 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 animate-recording-pulse"
            >
              {t('tryVoiceInput')} <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/case/create"
              className="px-6 py-3 bg-[#20B6A0] text-white rounded-xl text-base font-semibold hover:bg-[#1a9e8a] transition-all shadow-lg shadow-[#20B6A0]/20 flex items-center justify-center gap-2"
            >
              {t('createEmergencyCase')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-white border border-gray-200 text-[#12365B] rounded-xl text-base font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              {t('openDashboard')}
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <Link to="/history" className="hover:text-[#20B6A0] transition-colors">{t('viewDemoCases')}</Link>
            <span>•</span>
            <Link to="/roadmap" className="hover:text-[#20B6A0] transition-colors">{t('howItWorks')}</Link>
            <span>•</span>
            <Link to="/settings" className="hover:text-[#20B6A0] transition-colors">{t('settings')}</Link>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2342] text-center mb-4">{t('howItWorks')}</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Mic, title: t('capture'), desc: t('captureDesc') },
              { icon: FileText, title: t('structure'), desc: t('structureDesc') },
              { icon: CheckCircle, title: t('verify'), desc: t('verifyDesc') },
              { icon: QrCode, title: t('generateQR'), desc: t('generateQRDesc') },
              { icon: Smartphone, title: t('scan'), desc: t('scanDesc') },
            ].map((step, i) => (
              <div key={i} className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#12365B] to-[#20B6A0] rounded-xl flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-bold text-[#20B6A0] mb-1">{t('step')} {i + 1}</div>
                <h3 className="font-semibold text-[#0B2342] mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2342] text-center mb-12">{t('currentCapabilities')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: t('capture'), desc: t('captureDesc') },
            { title: t('structure'), desc: t('structureDesc') },
            { title: t('verify'), desc: t('verifyDesc') },
            { title: t('generateQR'), desc: t('generateQRDesc') },
            { title: 'PDF Export', desc: 'Download or print structured handover records with all clinical details.' },
            { title: t('caseHistory'), desc: 'Search, filter, and manage all emergency cases from a single dashboard.' },
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
          <h2 className="text-xl font-bold mb-3">{t('settings')} & {t('info')}</h2>
          <p className="text-gray-300 text-sm max-w-2xl mx-auto">
            {t('hackathonPrototype')} — {t('teamHealthNova')} | {t('krmu')} | {t('somc')}
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
            <span className="font-semibold text-[#12365B]">{t('teamHealthNova')}</span>
          </div>
          <p className="text-sm text-gray-500">
            {t('krmu')} — {t('somc')}
          </p>
          <p className="text-xs text-gray-400 mt-2">{t('hackathonPrototype')} • {t('demoMode')}</p>
        </div>
      </footer>
    </div>
  );
}
