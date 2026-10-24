import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { seedDemoCases } from './store';
import { LanguageProvider } from './context/LanguageContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateCase from './pages/CreateCase';
import Scribe from './pages/Scribe';
import Verify from './pages/Verify';
import QRPage from './pages/QRPage';
import DoctorRecord from './pages/DoctorRecord';
import History from './pages/History';
import Roadmap from './pages/Roadmap';
import Settings from './pages/Settings';
import TestQRCodes from './pages/TestQRCodes';

function App() {
  useEffect(() => {
    seedDemoCases();
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/case/create" element={<CreateCase />} />
          <Route path="/case/:id/scribe" element={<Scribe />} />
          <Route path="/case/:id/verify" element={<Verify />} />
          <Route path="/case/:id/qr" element={<QRPage />} />
          <Route path="/record/:token" element={<DoctorRecord />} />
          <Route path="/history" element={<History />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/test-qr" element={<TestQRCodes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
