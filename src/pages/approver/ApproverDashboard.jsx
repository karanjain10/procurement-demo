import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function ApproverDashboard({ level }) {
  const { indents, approvals, actionApproval, updateIndentStatus, getApprovalsByIndentId, getCSByIndentId, getQuotationsByIndentId } = useStore();
  const toast = useToast();
  const navigate = useNavigate();

  const [reviewingIndent, setReviewingIndent] = useState(null);
  const [action, setAction] = useState(null); // 'approve' | 'reject'
  const [remarks, setRemarks] = useState('');

  const LEVEL = level; // 'L1' or 'L2'
  const actioned_by = LEVEL === 'L1' ? 'Ajay (Finance Head)' : 'Ajay (Director)';
  const routePrefix = LEVEL === 'L1' ? '/approver-l1' : '/approver-l2';

  // Filter indents by what this level can see/action
  const getPendingIndents = () => {
    if (LEVEL === 'L1') {
      return indents.filter(i => {
        const apprList = getApprovalsByIndentId(i.id);
        const l1 = apprList.find(a => a.level === 'L1');
        return l1?.status === 'PENDING';
      });
    } else {
      // L2: only show if L1 is approved
      return indents.filter(i => {
        const apprList = getApprovalsByIndentId(i.id);
        const l1 = apprList.find(a => a.level === 'L1');
        const l2 = apprList.find(a => a.level === 'L2');
        return l1?.status === 'APPROVED' && l2?.status === 'PENDING';
      });
    }
  };

  const getApprovedIndents = () => indents.filter(i => {
    const apprList = getApprovalsByIndentId(i.id);
    return apprList.find(a => a.level === LEVEL && a.status === 'APPROVED');
  });

  const getRejectedIndents = () => indents.filter(i => {
    const apprList = getApprovalsByIndentId(i.id);
    return apprList.find(a => a.level === LEVEL && a.status === 'REJECTED');
  });

  const pendingIndents = getPendingIndents();
  const approvedIndents = getApprovedIndents();
  const rejectedIndents = getRejectedIndents();

  // Determine current tab from URL
  const path = window.location.pathname;
  const tab = path.includes('approved') ? 'approved' : path.includes('rejected') ? 'rejected' : 'pending';

  const displayIndents = tab === 'pending' ? pendingIndents : tab === 'approved' ? approvedIndents : rejectedIndents;

  const handleAction = () => {
    if (!remarks.trim()) { toast('Please enter remarks', 'error'); return; }
    const indent = reviewingIndent;

    if (action === 'approve') {
      actionApproval(indent.id, LEVEL, 'APPROVED', remarks, actioned_by);
      if (LEVEL === 'L1') {
        updateIndentStatus(indent.id, 'PENDING_L2');
        toast(`${indent.indent_number} approved — forwarded to L2`, 'success');
      } else {
        updateIndentStatus(indent.id, 'APPROVED');
        toast(`${indent.indent_number} fully approved! Ops notified.`, 'success');
      }
    } else {
      actionApproval(indent.id, LEVEL, 'REJECTED', remarks, actioned_by);
      updateIndentStatus(indent.id, 'REJECTED');
      toast(`${indent.indent_number} rejected`, 'info');
    }

    setReviewingIndent(null);
    setAction(null);
    setRemarks('');
  };

  const reviewIndent = reviewingIndent;
  const reviewCS = reviewIndent ? getCSByIndentId(reviewIndent?.id) : null;
  const reviewQuots = reviewIndent ? getQuotationsByIndentId(reviewIndent?.id) : [];
  const reviewL1 = reviewIndent ? getApprovalsByIndentId(reviewIndent.id).find(a => a.level === 'L1') : null;

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-bold text-white">
          {LEVEL === 'L1' ? 'L1 Approvals — Finance Head' : 'L2 Approvals — Director'}
        </h2>
        <p className="text-dark-400 text-sm mt-1">
          {tab === 'pending' ? `${pendingIndents.length} pending` : tab === 'approved' ? `${approvedIndents.length} approved` : `${rejectedIndents.length} rejected`}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => navigate(`${routePrefix}/pending`)} className={`stat-card text-left hover:border-primary/50 transition-all ${tab === 'pending' ? 'border border-primary' : ''}`}>
          <div className="text-xs text-dark-400 uppercase tracking-wide">Pending</div>
          <div className="text-3xl font-bold text-yellow-400">{pendingIndents.length}</div>
        </button>
        <button onClick={() => navigate(`${routePrefix}/approved`)} className={`stat-card text-left hover:border-primary/50 transition-all ${tab === 'approved' ? 'border border-primary' : ''}`}>
          <div className="text-xs text-dark-400 uppercase tracking-wide">Approved</div>
          <div className="text-3xl font-bold text-green-400">{approvedIndents.length}</div>
        </button>
        <button onClick={() => navigate(`${routePrefix}/rejected`)} className={`stat-card text-left hover:border-primary/50 transition-all ${tab === 'rejected' ? 'border border-primary' : ''}`}>
          <div className="text-xs text-dark-400 uppercase tracking-wide">Rejected</div>
          <div className="text-3xl font-bold text-red-400">{rejectedIndents.length}</div>
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Indent No.</th>
                <th className="table-header">Site</th>
                <th className="table-header">Total Value</th>
                <th className="table-header">Selected Vendor</th>
                <th className="table-header">Sent On</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayIndents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-dark-500 py-12">
                    {tab === 'pending' ? (
                      LEVEL === 'L2' ? 'No L2 approvals pending — L1 must approve first' : 'No pending approvals'
                    ) : `No ${tab} approvals`}
                  </td>
                </tr>
              ) : (
                displayIndents.map(indent => {
                  const cs = getCSByIndentId(indent.id);
                  const quots = getQuotationsByIndentId(indent.id);
                  const selectedQuot = quots.find(q => q.vendor_name === cs?.selected_vendor);
                  const totalValue = selectedQuot?.items?.reduce((s, i) => s + (i.total || 0), 0) || 0;
                  const apprList = getApprovalsByIndentId(indent.id);
                  const myAppr = apprList.find(a => a.level === LEVEL);

                  return (
                    <tr key={indent.id} className="table-row">
                      <td className="table-cell">
                        <span className="font-mono font-semibold text-primary text-sm">{indent.indent_number}</span>
                      </td>
                      <td className="table-cell text-dark-300">{indent.site_name}</td>
                      <td className="table-cell font-semibold text-green-400">{formatCurrency(totalValue)}</td>
                      <td className="table-cell text-dark-200 text-xs">{cs?.selected_vendor || '—'}</td>
                      <td className="table-cell text-dark-400">{formatDate(indent.created_at)}</td>
                      <td className="table-cell">
                        {tab === 'pending' ? (
                          <button
                            onClick={() => setReviewingIndent(indent)}
                            className="btn-primary text-xs px-3 py-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <StatusBadge status={myAppr?.status || indent.status} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={!!reviewingIndent && !action} onClose={() => setReviewingIndent(null)} title={`Review — ${reviewIndent?.indent_number}`} size="xl">
        {reviewIndent && (
          <div className="space-y-6">
            {/* Indent Summary */}
            <div className="bg-dark-700/30 rounded-xl p-4 border border-dark-700 space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-primary">{reviewIndent.indent_number}</span>
                <StatusBadge status={reviewIndent.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-dark-400">Site: </span><span className="text-dark-200">{reviewIndent.site_name}</span></div>
                <div><span className="text-dark-400">Raised by: </span><span className="text-dark-200 text-xs">{reviewIndent.created_by}</span></div>
              </div>
              {reviewIndent.remarks && <p className="text-xs text-amber-300 italic">"{reviewIndent.remarks}"</p>}
            </div>

            {/* L1 Approval info for L2 */}
            {LEVEL === 'L2' && reviewL1 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">L1 Approval</div>
                <div className="text-sm text-green-300">Approved by <strong>{reviewL1.actioned_by}</strong></div>
                {reviewL1.remarks && <div className="text-xs text-green-400 mt-1 italic">"{reviewL1.remarks}"</div>}
              </div>
            )}

            {/* CS Remarks */}
            {reviewCS && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">Ops Recommendation</div>
                <div className="text-sm text-blue-300">Selected Vendor: <strong>{reviewCS.selected_vendor}</strong></div>
                {reviewCS.ops_remarks && <div className="text-xs text-blue-400 mt-1 italic">"{reviewCS.ops_remarks}"</div>}
              </div>
            )}

            {/* Comparative Statement table */}
            {reviewQuots.length >= 2 && (
              <div>
                <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-3">Comparative Statement</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-dark-700">
                        <th className="table-header">Field</th>
                        {reviewQuots.map(q => (
                          <th key={q.id} className={`table-header text-center ${q.vendor_name === reviewCS?.selected_vendor ? 'text-green-400' : ''}`}>
                            {q.vendor_name === reviewCS?.selected_vendor && <div className="text-[9px]">✓ Selected</div>}
                            {q.vendor_name.split(' ').slice(0, 3).join(' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-row">
                        <td className="table-cell font-medium">Total Value</td>
                        {reviewQuots.map(q => (
                          <td key={q.id} className={`table-cell text-center font-semibold ${q.vendor_name === reviewCS?.selected_vendor ? 'text-green-400' : ''}`}>
                            {formatCurrency(q.items?.reduce((s, i) => s + (i.total || 0), 0))}
                          </td>
                        ))}
                      </tr>
                      <tr className="table-row">
                        <td className="table-cell font-medium">Delivery</td>
                        {reviewQuots.map(q => <td key={q.id} className="table-cell text-center">{q.delivery_days} days</td>)}
                      </tr>
                      <tr className="table-row">
                        <td className="table-cell font-medium">Payment</td>
                        {reviewQuots.map(q => <td key={q.id} className="table-cell text-center text-xs text-dark-300">{q.payment_terms}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setAction('approve')}
                className="btn-success flex-1 justify-center py-3 text-base"
              >
                <CheckCircle className="w-5 h-5" />
                Approve
              </button>
              <button
                onClick={() => setAction('reject')}
                className="btn-danger flex-1 justify-center py-3 text-base"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Remarks Modal */}
      <Modal isOpen={!!action} onClose={() => setAction(null)} title={action === 'approve' ? '✅ Confirm Approval' : '❌ Confirm Rejection'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">{action === 'approve' ? 'Approval Remarks *' : 'Rejection Reason *'}</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder={action === 'approve' ? 'e.g. Approved. Pricing is competitive.' : 'e.g. Rejected. Vendor pricing too high.'}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAction}
              className={action === 'approve' ? 'btn-success flex-1' : 'btn-danger flex-1'}
            >
              Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
            </button>
            <button onClick={() => setAction(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
