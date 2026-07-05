import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function PendingIndents() {
  const { indents, updateIndentStatus } = useStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [reviewingIndent, setReviewingIndent] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Show all indents for ops context, filterable
  const relevantIndents = indents.filter(i => i.status === 'SUBMITTED');

  const handleApproveForRFQ = (indent) => {
    updateIndentStatus(indent.id, 'OPS_REVIEW');
    setTimeout(() => {
      updateIndentStatus(indent.id, 'RFQ_SENT');
      toast(`${indent.indent_number} approved — proceed to send RFQ`, 'success');
      setReviewingIndent(null);
      navigate('/ops/rfq', { state: { indentId: indent.id } });
    }, 400);
  };

  const handleReject = (indent) => {
    if (!rejectRemarks.trim()) { toast('Please enter rejection remarks', 'error'); return; }
    updateIndentStatus(indent.id, 'REJECTED');
    toast(`${indent.indent_number} rejected`, 'info');
    setReviewingIndent(null);
    setRejectRemarks('');
    setShowRejectInput(false);
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Pending Indents</h2>
        <p className="text-dark-400 text-sm mt-1">Indents awaiting ops review — {relevantIndents.length} pending</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Indent No.</th>
                <th className="table-header">Site</th>
                <th className="table-header">Raised By</th>
                <th className="table-header">Materials</th>
                <th className="table-header">Date</th>
                <th className="table-header">Status</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {relevantIndents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center text-dark-500 py-12">
                    <CheckCircle className="w-10 h-10 text-green-500/40 mx-auto mb-2" />
                    No pending indents — all caught up!
                  </td>
                </tr>
              ) : (
                relevantIndents.map(indent => (
                  <tr key={indent.id} className="table-row">
                    <td className="table-cell">
                      <span className="font-mono font-semibold text-primary text-sm">{indent.indent_number}</span>
                    </td>
                    <td className="table-cell text-dark-200">{indent.site_name}</td>
                    <td className="table-cell text-dark-300 text-xs">{indent.created_by}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                          {indent.materials?.length}
                        </span>
                        <span className="text-xs text-dark-400">{indent.materials?.[0]?.name}{indent.materials?.length > 1 ? ` +${indent.materials.length - 1}` : ''}</span>
                      </div>
                    </td>
                    <td className="table-cell text-dark-400">{formatDate(indent.created_at)}</td>
                    <td className="table-cell"><StatusBadge status={indent.status} /></td>
                    <td className="table-cell">
                      <button
                        onClick={() => { setReviewingIndent(indent); setShowRejectInput(false); setRejectRemarks(''); }}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* All indents view */}
      <div>
        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-3">All Indents — Pipeline Overview</h3>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Indent No.</th>
                  <th className="table-header">Site</th>
                  <th className="table-header">Materials</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">View</th>
                </tr>
              </thead>
              <tbody>
                {[...indents].reverse().map(indent => (
                  <tr key={indent.id} className="table-row">
                    <td className="table-cell">
                      <span className="font-mono font-semibold text-primary text-sm">{indent.indent_number}</span>
                    </td>
                    <td className="table-cell text-dark-200">{indent.site_name}</td>
                    <td className="table-cell text-dark-400 text-xs">{indent.materials?.length} items</td>
                    <td className="table-cell text-dark-400">{formatDate(indent.created_at)}</td>
                    <td className="table-cell"><StatusBadge status={indent.status} /></td>
                    <td className="table-cell">
                      <button
                        onClick={() => navigate(`/site-manager/indent/${indent.id}`)}
                        className="text-xs text-primary hover:text-primary-400 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Slide-over panel */}
      {reviewingIndent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReviewingIndent(null)} />
          <div className="relative w-full max-w-lg bg-dark-800 border-l border-dark-700 h-full overflow-y-auto slide-panel shadow-[0_0_60px_rgba(0,0,0,0.8)]">
            <div className="p-6 space-y-6">
              {/* Panel header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Review Indent</h3>
                <button onClick={() => setReviewingIndent(null)} className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Indent summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-primary text-lg">{reviewingIndent.indent_number}</span>
                  <StatusBadge status={reviewingIndent.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-dark-400">Site: </span><span className="text-dark-200">{reviewingIndent.site_name}</span></div>
                  <div><span className="text-dark-400">Raised by: </span><span className="text-dark-200 text-xs">{reviewingIndent.created_by}</span></div>
                </div>
                {reviewingIndent.remarks && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-300 italic">
                    "{reviewingIndent.remarks}"
                  </div>
                )}
              </div>

              {/* Materials */}
              <div>
                <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-3">Materials Required</h4>
                <div className="space-y-2">
                  {reviewingIndent.materials?.map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-dark-700/30 rounded-lg px-3 py-2.5 border border-dark-700">
                      <div>
                        <div className="text-sm font-medium text-dark-100">{m.name}</div>
                        <div className="text-xs text-dark-400">Required by {m.required_date}</div>
                      </div>
                      <div className="text-sm font-bold text-primary">{m.quantity} {m.unit}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reject input */}
              {showRejectInput && (
                <div className="space-y-2">
                  <label className="label">Rejection Remarks *</label>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    placeholder="State reason for rejection..."
                    value={rejectRemarks}
                    onChange={e => setRejectRemarks(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {!showRejectInput ? (
                  <>
                    <button onClick={() => handleApproveForRFQ(reviewingIndent)} className="btn-success flex-1">
                      <CheckCircle className="w-4 h-4" />
                      Approve for RFQ
                    </button>
                    <button onClick={() => setShowRejectInput(true)} className="btn-danger flex-1">
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleReject(reviewingIndent)} className="btn-danger flex-1">
                      Confirm Rejection
                    </button>
                    <button onClick={() => setShowRejectInput(false)} className="btn-secondary flex-1">
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
