import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, MapPin, User, Calendar, Package } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/StatusBadge';
import { StatusTimeline } from '../../components/StatusTimeline';

const formatDate = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function IndentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getIndentById, getRFQByIndentId, getApprovalsByIndentId, getPOByIndentId, getCSByIndentId } = useStore();

  const indent = getIndentById(id);
  if (!indent) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertTriangle className="w-12 h-12 text-red-400" />
      <p className="text-dark-400">Indent not found</p>
      <button onClick={() => navigate('/site-manager')} className="btn-secondary">Go Back</button>
    </div>
  );

  const rfq = getRFQByIndentId(id);
  const approvals = getApprovalsByIndentId(id);
  const po = getPOByIndentId(id);
  const cs = getCSByIndentId(id);
  const l1 = approvals.find(a => a.level === 'L1');
  const l2 = approvals.find(a => a.level === 'L2');

  return (
    <div className="max-w-4xl space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/site-manager')} className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-all mt-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-white">{indent.indent_number}</h2>
            <StatusBadge status={indent.status} />
          </div>
          <p className="text-dark-400 text-sm mt-1">Indent Detail View</p>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-4">Procurement Progress</h3>
        <StatusTimeline status={indent.status} />
      </div>

      {/* Rejection callout */}
      {indent.status === 'REJECTED' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-red-400 mb-1">Indent Rejected</div>
            {l1?.status === 'REJECTED' && (
              <div className="text-xs text-red-300"><strong>L1 Remarks:</strong> {l1.remarks}</div>
            )}
            {l2?.status === 'REJECTED' && (
              <div className="text-xs text-red-300 mt-1"><strong>L2 Remarks:</strong> {l2.remarks}</div>
            )}
          </div>
        </div>
      )}

      {/* Indent Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Indent Information</h3>
          <div className="space-y-3">
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Site" value={indent.site_name} />
            <InfoRow icon={<User className="w-4 h-4" />} label="Raised By" value={indent.created_by} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Created At" value={formatDate(indent.created_at)} />
            {indent.remarks && (
              <div>
                <div className="text-xs text-dark-400 mb-1">Remarks</div>
                <p className="text-sm text-dark-200 bg-dark-700/50 rounded-lg px-3 py-2">{indent.remarks}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide flex items-center gap-2">
            <Package className="w-4 h-4" />
            Materials ({indent.materials?.length})
          </h3>
          <div className="space-y-2">
            {indent.materials?.map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-dark-700/30 rounded-lg px-3 py-2.5 border border-dark-700">
                <div>
                  <div className="text-sm font-medium text-dark-100">{m.name}</div>
                  <div className="text-xs text-dark-400">Required by {m.required_date}</div>
                </div>
                <div className="text-sm font-semibold text-primary">{m.quantity} {m.unit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RFQ Info */}
      {rfq && (
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">RFQ Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoRow label="RFQ Sent On" value={formatDate(rfq.sent_at)} />
            <InfoRow label="Status" value={<StatusBadge status={rfq.status} />} />
          </div>
          <div>
            <div className="text-xs text-dark-400 mb-2">Vendors Contacted</div>
            <div className="flex flex-wrap gap-2">
              {rfq.vendors_contacted?.map((v, i) => (
                <div key={i} className="bg-dark-700/50 border border-dark-600 rounded-lg px-3 py-1.5">
                  <div className="text-xs font-medium text-dark-200">{v.name}</div>
                  <div className="text-[10px] text-dark-400">{v.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Approval Status */}
      {approvals.length > 0 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Approval Trail</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[l1, l2].filter(Boolean).map(appr => (
              <div key={appr.id} className={`rounded-xl p-4 border ${
                appr.status === 'APPROVED' ? 'bg-green-500/5 border-green-500/20' :
                appr.status === 'REJECTED' ? 'bg-red-500/5 border-red-500/20' :
                'bg-dark-700/30 border-dark-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-dark-300">Level {appr.level}</span>
                  <StatusBadge status={appr.status} />
                </div>
                {appr.actioned_by && <div className="text-xs text-dark-400">By: {appr.actioned_by}</div>}
                {appr.actioned_at && <div className="text-xs text-dark-500">{formatDate(appr.actioned_at)}</div>}
                {appr.remarks && <div className="text-xs text-dark-300 mt-2 italic">"{appr.remarks}"</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PO Info */}
      {po && (
        <div className="card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Purchase Order</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <InfoRow label="PO Number" value={<span className="font-mono text-primary">{po.po_number}</span>} />
            <InfoRow label="Vendor" value={po.selected_vendor} />
            <InfoRow label="Total Value" value={<span className="text-green-400 font-semibold">₹{po.total_value?.toLocaleString('en-IN')}</span>} />
          </div>
        </div>
      )}
    </div>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    {icon && <div className="text-dark-400 mt-0.5">{icon}</div>}
    <div className="flex-1">
      <div className="text-xs text-dark-400">{label}</div>
      <div className="text-sm text-dark-200 mt-0.5">{typeof value === 'string' ? value : value}</div>
    </div>
  </div>
);
