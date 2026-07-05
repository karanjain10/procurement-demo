import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/StatusBadge';

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function ApprovalsTracking() {
  const { indents, approvals, getApprovalsByIndentId } = useStore();
  const navigate = useNavigate();

  const sentForApproval = indents.filter(i =>
    ['PENDING_L1', 'PENDING_L2', 'APPROVED', 'REJECTED'].includes(i.status)
  );

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Approvals Tracking</h2>
        <p className="text-dark-400 text-sm mt-1">Monitor L1 & L2 approval status for all indents</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Indent No.</th>
                <th className="table-header">Site</th>
                <th className="table-header">L1 Status</th>
                <th className="table-header">L1 By</th>
                <th className="table-header">L2 Status</th>
                <th className="table-header">L2 By</th>
                <th className="table-header">Overall</th>
                <th className="table-header">View</th>
              </tr>
            </thead>
            <tbody>
              {sentForApproval.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center text-dark-500 py-12">
                    No indents sent for approval yet
                  </td>
                </tr>
              ) : (
                sentForApproval.map(indent => {
                  const apprList = getApprovalsByIndentId(indent.id);
                  const l1 = apprList.find(a => a.level === 'L1');
                  const l2 = apprList.find(a => a.level === 'L2');
                  return (
                    <tr key={indent.id} className="table-row">
                      <td className="table-cell">
                        <span className="font-mono font-semibold text-primary text-sm">{indent.indent_number}</span>
                      </td>
                      <td className="table-cell text-dark-300">{indent.site_name}</td>
                      <td className="table-cell">
                        {l1 ? <StatusBadge status={l1.status} /> : <span className="text-dark-500 text-xs">—</span>}
                      </td>
                      <td className="table-cell text-xs text-dark-400">{l1?.actioned_by || '—'}</td>
                      <td className="table-cell">
                        {l2 ? <StatusBadge status={l2?.status} /> : <span className="text-dark-500 text-xs">—</span>}
                      </td>
                      <td className="table-cell text-xs text-dark-400">{l2?.actioned_by || '—'}</td>
                      <td className="table-cell"><StatusBadge status={indent.status} /></td>
                      <td className="table-cell">
                        <button
                          onClick={() => navigate(`/site-manager/indent/${indent.id}`)}
                          className="text-xs text-primary hover:text-primary-400 flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
