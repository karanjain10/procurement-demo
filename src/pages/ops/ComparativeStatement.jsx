import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function ComparativeStatement() {
  const location = useLocation();
  const navigate = useNavigate();
  const { indents, quotations, saveComparativeStatement, updateIndentStatus, createApprovals, getQuotationsByIndentId, getCSByIndentId } = useStore();
  const toast = useToast();

  const eligibleIndents = indents.filter(i => {
    const quots = getQuotationsByIndentId(i.id);
    return quots.length >= 2 && ['QUOTATIONS_IN', 'RFQ_SENT', 'PENDING_L1', 'PENDING_L2'].includes(i.status);
  });

  const [selectedIndentId, setSelectedIndentId] = useState(location.state?.indentId || eligibleIndents[0]?.id || '');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [opsRemarks, setOpsRemarks] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedIndent = indents.find(i => i.id === selectedIndentId);
  const indentQuots = selectedIndentId ? getQuotationsByIndentId(selectedIndentId) : [];
  const existingCS = selectedIndentId ? getCSByIndentId(selectedIndentId) : null;

  useEffect(() => {
    if (existingCS) {
      setSelectedVendor(existingCS.selected_vendor);
      setOpsRemarks(existingCS.ops_remarks || '');
      setSubmitted(true);
    } else {
      setSelectedVendor('');
      setOpsRemarks('');
      setSubmitted(false);
    }
  }, [selectedIndentId, existingCS]);

  const allMaterials = selectedIndent?.materials?.map(m => m.name) || [];

  const getVendorTotal = (quot) => quot.items?.reduce((s, i) => s + (i.total || 0), 0) || 0;

  const handleSendForApproval = () => {
    if (!selectedVendor) { toast('Select a preferred vendor', 'error'); return; }
    if (!opsRemarks.trim()) { toast('Add ops remarks', 'error'); return; }

    saveComparativeStatement({
      indent_id: selectedIndentId,
      prepared_by: 'Rahul (Ops Executive)',
      selected_vendor: selectedVendor,
      ops_remarks: opsRemarks,
      status: 'CONFIRMED',
    });
    createApprovals(selectedIndentId);
    updateIndentStatus(selectedIndentId, 'PENDING_L1');
    setSubmitted(true);
    toast('Sent for L1 Approval!', 'success');
    setTimeout(() => navigate('/ops/approvals'), 1000);
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Comparative Statement</h2>
        <p className="text-dark-400 text-sm mt-1">Compare vendor quotations and select preferred vendor</p>
      </div>

      {/* Indent selector */}
      {eligibleIndents.length > 1 && (
        <div className="card p-4">
          <div className="flex gap-3 flex-wrap">
            {eligibleIndents.map(i => (
              <button
                key={i.id}
                onClick={() => setSelectedIndentId(i.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedIndentId === i.id ? 'bg-primary text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}
              >
                {i.indent_number}
              </button>
            ))}
          </div>
        </div>
      )}

      {eligibleIndents.length === 0 ? (
        <div className="card p-12 text-center text-dark-500">
          Need at least 2 quotations for an indent to prepare a comparative statement.
        </div>
      ) : selectedIndent && indentQuots.length >= 2 && (
        <>
          {/* CS Table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-primary">{selectedIndent.indent_number}</span>
                <span className="text-dark-400 text-sm">· {selectedIndent.site_name}</span>
                <StatusBadge status={selectedIndent.status} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="table-header w-48">Material / Field</th>
                    {indentQuots.map(q => (
                      <th key={q.id} className={`table-header text-center ${selectedVendor === q.vendor_name ? 'text-primary' : ''}`}>
                        <div>{q.vendor_name.split(' ').slice(0, 3).join(' ')}</div>
                        {selectedVendor === q.vendor_name && (
                          <div className="text-[10px] font-normal text-primary mt-0.5">✓ Selected</div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allMaterials.map(mat => {
                    const minPrice = Math.min(...indentQuots.map(q => q.items?.find(i => i.material_name === mat)?.unit_price || Infinity));
                    return (
                      <tr key={mat} className="table-row">
                        <td className="table-cell font-medium text-dark-200">{mat}</td>
                        {indentQuots.map(q => {
                          const item = q.items?.find(i => i.material_name === mat);
                          const isLowest = item?.unit_price === minPrice;
                          return (
                            <td key={q.id} className={`table-cell text-center ${isLowest ? 'text-green-400 font-semibold' : ''}`}>
                              {item ? (
                                <div>
                                  <div>₹{item.unit_price}</div>
                                  <div className="text-[10px] text-dark-500">{item.taxes}% tax</div>
                                </div>
                              ) : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Total row */}
                  <tr className="border-t-2 border-dark-600 bg-dark-700/20">
                    <td className="table-cell font-bold text-dark-200">Total Value</td>
                    {indentQuots.map(q => {
                      const total = getVendorTotal(q);
                      const minTotal = Math.min(...indentQuots.map(x => getVendorTotal(x)));
                      const isLowest = total === minTotal;
                      return (
                        <td key={q.id} className={`table-cell text-center font-bold ${isLowest ? 'text-green-400' : 'text-dark-200'}`}>
                          {formatCurrency(total)}
                          {isLowest && <div className="text-[10px] text-green-500">Lowest</div>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Delivery */}
                  <tr className="table-row">
                    <td className="table-cell font-medium text-dark-300">Delivery Days</td>
                    {indentQuots.map(q => (
                      <td key={q.id} className="table-cell text-center">{q.delivery_days} days</td>
                    ))}
                  </tr>

                  {/* Payment */}
                  <tr className="table-row">
                    <td className="table-cell font-medium text-dark-300">Payment Terms</td>
                    {indentQuots.map(q => (
                      <td key={q.id} className="table-cell text-center text-xs text-dark-300">{q.payment_terms}</td>
                    ))}
                  </tr>

                  {/* Remarks */}
                  <tr className="table-row">
                    <td className="table-cell font-medium text-dark-300">Remarks</td>
                    {indentQuots.map(q => (
                      <td key={q.id} className="table-cell text-center text-xs text-dark-400 italic">{q.remarks || '—'}</td>
                    ))}
                  </tr>

                  {/* Radio select */}
                  {!submitted && (
                    <tr className="border-t-2 border-primary/30 bg-primary/5">
                      <td className="table-cell font-semibold text-primary">Select Vendor</td>
                      {indentQuots.map(q => (
                        <td key={q.id} className="table-cell text-center">
                          <label className="flex items-center justify-center cursor-pointer">
                            <input
                              type="radio"
                              name="selectedVendor"
                              value={q.vendor_name}
                              checked={selectedVendor === q.vendor_name}
                              onChange={e => setSelectedVendor(e.target.value)}
                              className="accent-primary w-4 h-4"
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected vendor highlight */}
          {selectedVendor && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-300">
                Preferred Vendor: <strong>{selectedVendor}</strong>
                {' '}— Total: <strong>{formatCurrency(getVendorTotal(indentQuots.find(q => q.vendor_name === selectedVendor)))}</strong>
              </span>
            </div>
          )}

          {/* Remarks + Send */}
          {!submitted ? (
            <div className="card p-6 space-y-4">
              <div>
                <label className="label">Ops Remarks / Justification *</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Explain vendor selection rationale..."
                  value={opsRemarks}
                  onChange={e => setOpsRemarks(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button onClick={handleSendForApproval} className="btn-primary gap-2">
                  Send for Approval
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-6 space-y-3">
              <div className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Ops Remarks</div>
              <p className="text-sm text-dark-300 italic">"{existingCS?.ops_remarks || opsRemarks}"</p>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Sent for approval — awaiting L1 action
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
