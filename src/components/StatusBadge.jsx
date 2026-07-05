const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  OPS_REVIEW: { label: 'Ops Review', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  RFQ_SENT: { label: 'RFQ Sent', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  QUOTATIONS_IN: { label: 'Quotations In', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  PENDING_L1: { label: 'Pending L1', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  PENDING_L2: { label: 'Pending L2', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  APPROVED: { label: 'Approved', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  PO_SENT: { label: 'PO Sent', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  GENERATED: { label: 'Generated', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  // GRN statuses
  GRN_DONE: { label: 'GRN Done', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  DRAFT: { label: 'Draft', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  // Item condition statuses
  GOOD: { label: 'Good', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  SHORT: { label: 'Short', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  DAMAGED: { label: 'Damaged', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  // Allocation
  ALLOCATED: { label: 'Allocated', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  // Approval statuses
  PENDING: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  // RFQ statuses
  SENT: { label: 'Sent', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

export const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-dark-600 text-dark-300 border-dark-500' };
  return (
    <span className={`badge border ${config.color} ${className}`}>
      {config.label}
    </span>
  );
};

export const getStatusLabel = (status) => STATUS_CONFIG[status]?.label || status;

export default StatusBadge;
