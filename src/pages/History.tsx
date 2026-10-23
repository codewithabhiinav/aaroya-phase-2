import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, QrCode, Trash2, FileText, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { getAllCases, deleteCase } from '../store';
import { EmergencyCase, CaseStatus } from '../types';

export default function History() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCases(getAllCases());
  }, []);

  function refresh() {
    setCases(getAllCases());
  }

  function handleDelete(id: string) {
    deleteCase(id);
    setDeleteConfirm(null);
    refresh();
  }

  const filtered = cases.filter(c => {
    const matchesSearch = search === '' ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.publicToken.toLowerCase().includes(search.toLowerCase()) ||
      c.patientLabel.toLowerCase().includes(search.toLowerCase()) ||
      c.chiefComplaint.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function getStatusBadge(status: string) {
    switch (status) {
      case 'draft': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Draft</span>;
      case 'awaiting_verification': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Pending</span>;
      case 'verified': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Verified</span>;
      default: return null;
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0B2342]">Case History</h1>
          <p className="text-sm text-gray-500 mt-1">Search, filter, and manage all emergency cases.</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by case ID, token, patient, or complaint..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B6A0]/30 focus:border-[#20B6A0]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as CaseStatus)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B6A0]/30"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="awaiting_verification">Pending Verification</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-400 mb-4">{filtered.length} case(s) found</p>

        {/* Cases */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-600 mb-2">No cases found</h3>
            <p className="text-sm text-gray-400 mb-4">
              {search || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Create your first emergency case to get started.'}
            </p>
            <Link to="/case/create" className="inline-block px-4 py-2 bg-[#20B6A0] text-white rounded-lg text-sm font-medium">
              Create Case
            </Link>
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
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleString()}</span>
                      {c.emergencyCategory && <span>• {c.emergencyCategory}</span>}
                      {c.age && <span>• Age: {c.age}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/case/${c.id}/scribe`)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Open
                    </button>
                    {c.status === 'verified' && (
                      <button
                        onClick={() => navigate(`/case/${c.id}/qr`)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#20B6A0] text-white hover:bg-[#1a9e8a] flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" /> QR
                      </button>
                    )}
                    {c.isDemo && (
                      <button
                        onClick={() => setDeleteConfirm(c.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </div>

                {deleteConfirm === c.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-red-700">Delete this case permanently?</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg">Confirm</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 border border-gray-200 text-xs rounded-lg">Cancel</button>
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
