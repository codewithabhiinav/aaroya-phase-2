import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, QrCode, Search, Plus, Trash2, Eye, Edit, AlertTriangle, Mic } from 'lucide-react';
import Layout from '../components/Layout';
import { getAllCases, getCaseStats, deleteCase, seedDemoCases, createCase } from '../store';
import { EmergencyCase, CaseStatus } from '../types';

export default function Dashboard() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, awaitingVerification: 0, verified: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshData();
  }, []);

  function refreshData() {
    setCases(getAllCases());
    setStats(getCaseStats());
  }

  function handleDelete(id: string) {
    deleteCase(id);
    setDeleteConfirm(null);
    refreshData();
  }

  function handleLoadDemo() {
    seedDemoCases();
    refreshData();
  }

  function handleTryVoiceDemo() {
    const newCase = createCase({
      patientLabel: 'Voice Demo: Anonymous Patient',
      age: '',
      sex: '',
      emergencyCategory: '',
      chiefComplaint: '',
      status: 'draft',
    });
    navigate(`/case/${newCase.id}/scribe`);
  }

  const filtered = cases.filter(c => {
    const matchesSearch = search === '' || 
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.patientLabel.toLowerCase().includes(search.toLowerCase()) ||
      c.chiefComplaint.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function getStatusBadge(status: string) {
    switch (status) {
      case 'draft': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Draft</span>;
      case 'awaiting_verification': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Awaiting Verification</span>;
      case 'verified': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Verified</span>;
      default: return null;
    }
  }

  function getCaseActions(c: EmergencyCase) {
    const actions = [];
    if (c.status === 'draft') {
      actions.push({ label: 'Edit Draft', icon: Edit, action: () => navigate(`/case/${c.id}/scribe`) });
    }
    if (c.status === 'awaiting_verification') {
      actions.push({ label: 'Verify', icon: CheckCircle, action: () => navigate(`/case/${c.id}/verify`) });
    }
    if (c.status === 'verified') {
      actions.push({ label: 'View QR', icon: QrCode, action: () => navigate(`/case/${c.id}/qr`) });
    }
    actions.push({ label: 'Open', icon: Eye, action: () => navigate(`/case/${c.id}/scribe`) });
    if (c.isDemo) {
      actions.push({ label: 'Delete', icon: Trash2, action: () => setDeleteConfirm(c.id) });
    }
    return actions;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0B2342]">Paramedic Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#20B6A0]/10 text-[#20B6A0] rounded text-xs font-medium">
                Demo Mode
              </span>
              {' '}Local storage active • {stats.total} case(s)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleTryVoiceDemo} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2 shadow-lg shadow-red-200">
              <Mic className="w-4 h-4" /> 🎤 Try Voice Demo
            </button>
            <Link to="/test-qr" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2 shadow-lg shadow-blue-200">
              <QrCode className="w-4 h-4" /> 🧪 Test QR Codes
            </Link>
            <button onClick={handleLoadDemo} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              Load Demo Cases
            </button>
            <Link to="/case/create" className="px-4 py-2 bg-[#20B6A0] text-white rounded-lg text-sm font-medium hover:bg-[#1a9e8a] flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Case
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Cases', value: stats.total, icon: FileText, color: 'bg-[#12365B]' },
            { label: 'Drafts', value: stats.draft, icon: Clock, color: 'bg-yellow-500' },
            { label: 'Awaiting Verification', value: stats.awaitingVerification, icon: AlertTriangle, color: 'bg-blue-500' },
            { label: 'Verified (QR Ready)', value: stats.verified, icon: QrCode, color: 'bg-green-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0B2342]">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by case ID, patient, or complaint..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B6A0]/30 focus:border-[#20B6A0]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as CaseStatus)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B6A0]/30"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="awaiting_verification">Awaiting Verification</option>
            <option value="verified">Verified</option>
          </select>
        </div>

        {/* Cases List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-600 mb-2">No cases found</h3>
            <p className="text-sm text-gray-400 mb-4">Create a new emergency case or load demo data.</p>
            <div className="flex justify-center gap-3">
              <Link to="/case/create" className="px-4 py-2 bg-[#20B6A0] text-white rounded-lg text-sm font-medium">
                Create Case
              </Link>
              <button onClick={handleLoadDemo} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600">
                Load Demo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:shadow-sm transition-shadow">
                {c.isDemo && (
                  <div className="text-xs text-orange-500 font-medium mb-2">⚠ SYNTHETIC DEMO DATA</div>
                )}
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-gray-400">{c.publicToken.substring(0, 8).toUpperCase()}</span>
                      {getStatusBadge(c.status)}
                    </div>
                    <h3 className="font-semibold text-[#0B2342] truncate">{c.patientLabel || 'Anonymous Patient'}</h3>
                    <p className="text-sm text-gray-500 truncate">{c.chiefComplaint || 'No complaint recorded'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {new Date(c.createdAt).toLocaleString()}
                      {c.emergencyCategory && ` • ${c.emergencyCategory}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getCaseActions(c).map((action, i) => (
                      <button
                        key={i}
                        onClick={action.action}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                      >
                        <action.icon className="w-3.5 h-3.5" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delete confirmation */}
                {deleteConfirm === c.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-red-700">Delete this demo case permanently?</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg">
                        Confirm Delete
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 border border-gray-200 text-xs rounded-lg">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
