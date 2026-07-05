import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/StatusBadge';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function SMIndents() {
  const { indents } = useStore();
  const navigate = useNavigate();

  // Stats
  const total = indents.length;
  const approved = indents.filter(i => ['APPROVED', 'PO_SENT'].includes(i.status)).length;
  const pending = indents.filter(i => ['SUBMITTED', 'OPS_REVIEW', 'PENDING_L1', 'PENDING_L2'].includes(i.status)).length;
  const inProgress = indents.filter(i => ['RFQ_SENT', 'QUOTATIONS_IN'].includes(i.status)).length;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Indents</h2>
          <p className="text-dark-400 text-sm mt-1">Track all your material indent requests</p>
        </div>
        <button onClick={() => navigate('/site-manager/raise')} className="btn-primary">
          <Plus className="w-4 h-4" />
          Raise New Indent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-400 uppercase tracking-wide">Total</span>
            <Package className="w-4 h-4 text-dark-400" />
          </div>
          <div className="text-3xl font-bold text-white mt-1">{total}</div>
          <div className="text-xs text-dark-500">Indent requests</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-400 uppercase tracking-wide">Pending</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400 mt-1">{pending}</div>
          <div className="text-xs text-dark-500">Awaiting action</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-400 uppercase tracking-wide">In Progress</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-400 mt-1">{inProgress}</div>
          <div className="text-xs text-dark-500">RFQ / Quotations</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-400 uppercase tracking-wide">Approved</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400 mt-1">{approved}</div>
          <div className="text-xs text-dark-500">Completed</div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Indent No.</th>
                <th className="table-header">Site</th>
                <th className="table-header">Materials</th>
                <th className="table-header">Raised On</th>
                <th className="table-header">Status</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {indents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-dark-500 py-12">
                    No indents yet. Click "Raise New Indent" to get started.
                  </td>
                </tr>
              ) : (
                [...indents].reverse().map(indent => (
                  <tr key={indent.id} className="table-row">
                    <td className="table-cell">
                      <span className="font-mono font-semibold text-primary text-sm">{indent.indent_number}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-dark-200">{indent.site_name}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                          {indent.materials?.length || 0}
                        </span>
                        <span className="text-dark-400 text-xs">
                          {indent.materials?.slice(0, 2).map(m => m.name).join(', ')}
                          {indent.materials?.length > 2 ? ` +${indent.materials.length - 2}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-dark-400">{formatDate(indent.created_at)}</td>
                    <td className="table-cell">
                      <StatusBadge status={indent.status} />
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => navigate(`/site-manager/indent/${indent.id}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-400 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
