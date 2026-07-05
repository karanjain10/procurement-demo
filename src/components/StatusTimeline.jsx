import { Check } from 'lucide-react';

const STEPS = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'OPS_REVIEW', label: 'Ops Review' },
  { key: 'RFQ_SENT', label: 'RFQ Sent' },
  { key: 'QUOTATIONS_IN', label: 'Quotations In' },
  { key: 'PENDING_L1', label: 'Pending L1' },
  { key: 'PENDING_L2', label: 'Pending L2' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'PO_SENT', label: 'PO Sent' },
];

const STATUS_ORDER = {
  SUBMITTED: 0,
  OPS_REVIEW: 1,
  RFQ_SENT: 2,
  QUOTATIONS_IN: 3,
  PENDING_L1: 4,
  PENDING_L2: 5,
  APPROVED: 6,
  PO_SENT: 7,
};

export const StatusTimeline = ({ status }) => {
  const currentIdx = STATUS_ORDER[status] ?? -1;
  const isRejected = status === 'REJECTED';

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-start min-w-[700px]">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 z-0">
                  <div className={`h-full transition-all duration-300 ${isDone ? 'bg-primary' : 'bg-dark-600'}`} />
                </div>
              )}

              {/* Circle */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isRejected && isCurrent ? 'border-red-500 bg-red-500/20' :
                isDone ? 'border-primary bg-primary' :
                isCurrent ? 'border-primary bg-primary/20 ring-4 ring-primary/20' :
                'border-dark-600 bg-dark-800'
              }`}>
                {isDone ? (
                  <Check className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <div className={`w-2.5 h-2.5 rounded-full ${isRejected ? 'bg-red-500' : 'bg-primary animate-pulse'}`} />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-dark-500" />
                )}
              </div>

              {/* Label */}
              <span className={`mt-2 text-[10px] font-medium text-center leading-tight px-1 ${
                isDone ? 'text-primary' :
                isCurrent ? (isRejected ? 'text-red-400' : 'text-primary') :
                'text-dark-500'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}

        {/* Rejected step (special) */}
        {isRejected && (
          <div className="flex flex-col items-center ml-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-red-500 bg-red-500/20">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
            <span className="mt-2 text-[10px] font-medium text-center text-red-400">Rejected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusTimeline;
