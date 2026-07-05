import { useState } from 'react';
import { Plus, Calculator, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Quotations() {
  const { indents, rfqs, quotations, addQuotation, updateIndentStatus, getRFQByIndentId, getQuotationsByIndentId } = useStore();
  const toast = useToast();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [targetIndent, setTargetIndent] = useState(null);
  const [form, setForm] = useState({ vendor_name: '', delivery_days: '', payment_terms: '', remarks: '', items: [] });

  const rfqIndents = indents.filter(i => i.status === 'RFQ_SENT' || i.status === 'QUOTATIONS_IN');

  const openModal = (indent) => {
    const rfq = getRFQByIndentId(indent.id);
    const existingQuots = getQuotationsByIndentId(indent.id);
    const usedVendors = existingQuots.map(q => q.vendor_name);
    const availableVendors = rfq?.vendors_contacted?.filter(v => !usedVendors.includes(v.name)) || [];

    setTargetIndent({ ...indent, rfq, availableVendors });
    setForm({
      vendor_name: availableVendors[0]?.name || '',
      delivery_days: '',
      payment_terms: '',
      remarks: '',
      items: indent.materials?.map(m => ({
        material_name: m.name,
        quantity: m.quantity,
        unit_price: '',
        taxes: 18,
        total: 0,
      })) || [],
    });
    setModalOpen(true);
  };

  const updateItem = (idx, field, value) => {
    setForm(prev => {
      const items = prev.items.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value };
        if (field === 'unit_price' || field === 'taxes') {
          const price = parseFloat(field === 'unit_price' ? value : item.unit_price) || 0;
          const tax = parseFloat(field === 'taxes' ? value : item.taxes) || 0;
          updated.total = Math.round(updated.quantity * price * (1 + tax / 100));
        }
        return updated;
      });
      return { ...prev, items };
    });
  };

  const handleSave = () => {
    if (!form.vendor_name) { toast('Select a vendor', 'error'); return; }
    if (form.items.some(i => !i.unit_price)) { toast('Enter unit price for all items', 'error'); return; }

    const rfq = getRFQByIndentId(targetIndent.id);
    addQuotation({
      rfq_id: rfq?.id,
      indent_id: targetIndent.id,
      vendor_name: form.vendor_name,
      delivery_days: Number(form.delivery_days),
      payment_terms: form.payment_terms,
      remarks: form.remarks,
      items: form.items,
    });

    // Update indent status
    const currentQuots = getQuotationsByIndentId(targetIndent.id);
    if (currentQuots.length >= 1) {
      updateIndentStatus(targetIndent.id, 'QUOTATIONS_IN');
    }

    toast(`Quotation from ${form.vendor_name} saved!`, 'success');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Quotations</h2>
        <p className="text-dark-400 text-sm mt-1">Enter vendor quotations for indents in RFQ stage</p>
      </div>

      <div className="space-y-4">
        {rfqIndents.length === 0 ? (
          <div className="card p-12 text-center text-dark-500">
            No indents in RFQ stage. Send RFQs first.
          </div>
        ) : rfqIndents.map(indent => {
          const quots = getQuotationsByIndentId(indent.id);
          const rfq = getRFQByIndentId(indent.id);
          const totalVendors = rfq?.vendors_contacted?.length || 0;
          const canPrepareCS = quots.length >= 2;

          return (
            <div key={indent.id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-primary">{indent.indent_number}</span>
                    <StatusBadge status={indent.status} />
                  </div>
                  <div className="text-xs text-dark-400 mt-1">{indent.site_name} · {indent.materials?.length} materials · {quots.length}/{totalVendors} quotations received</div>
                </div>
                <div className="flex items-center gap-2">
                  {canPrepareCS && (
                    <button
                      onClick={() => navigate('/ops/comparative-statement', { state: { indentId: indent.id } })}
                      className="btn-success text-xs"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      Prepare CS
                    </button>
                  )}
                  {rfq?.vendors_contacted?.some(v => !quots.find(q => q.vendor_name === v.name)) && (
                    <button onClick={() => openModal(indent)} className="btn-primary text-xs">
                      <Plus className="w-3.5 h-3.5" />
                      Add Quotation
                    </button>
                  )}
                </div>
              </div>

              {quots.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-dark-700">
                        <th className="table-header">Vendor</th>
                        <th className="table-header">Total Value</th>
                        <th className="table-header">Delivery</th>
                        <th className="table-header">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quots.map(q => (
                        <tr key={q.id} className="table-row">
                          <td className="table-cell font-medium">{q.vendor_name}</td>
                          <td className="table-cell text-green-400 font-semibold">{formatCurrency(q.items?.reduce((sum, i) => sum + (i.total || 0), 0))}</td>
                          <td className="table-cell">{q.delivery_days} days</td>
                          <td className="table-cell text-dark-400 text-xs">{q.payment_terms}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Quotation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Add Quotation — ${targetIndent?.indent_number}`} size="lg">
        {targetIndent && (
          <div className="space-y-6">
            {/* Vendor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Vendor *</label>
                <select
                  className="select-field"
                  value={form.vendor_name}
                  onChange={e => setForm(prev => ({ ...prev, vendor_name: e.target.value }))}
                >
                  {targetIndent.availableVendors?.map(v => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Delivery Days</label>
                <input type="number" className="input-field" value={form.delivery_days}
                  onChange={e => setForm(prev => ({ ...prev, delivery_days: e.target.value }))} placeholder="e.g. 3" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Payment Terms</label>
                <input type="text" className="input-field" value={form.payment_terms}
                  onChange={e => setForm(prev => ({ ...prev, payment_terms: e.target.value }))} placeholder="e.g. Immediate on delivery" />
              </div>
              <div>
                <label className="label">Remarks</label>
                <input type="text" className="input-field" value={form.remarks}
                  onChange={e => setForm(prev => ({ ...prev, remarks: e.target.value }))} placeholder="Optional remarks" />
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="label mb-3">Item-wise Pricing</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="table-header pl-0">Material</th>
                      <th className="table-header">Qty</th>
                      <th className="table-header">Unit Price (₹)</th>
                      <th className="table-header">Tax %</th>
                      <th className="table-header">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-dark-700/50">
                        <td className="table-cell pl-0 font-medium">{item.material_name}</td>
                        <td className="table-cell">{item.quantity}</td>
                        <td className="table-cell">
                          <input type="number" className="input-field w-28" placeholder="0.00"
                            value={item.unit_price}
                            onChange={e => updateItem(idx, 'unit_price', e.target.value)} />
                        </td>
                        <td className="table-cell">
                          <input type="number" className="input-field w-20" placeholder="18"
                            value={item.taxes}
                            onChange={e => updateItem(idx, 'taxes', e.target.value)} />
                        </td>
                        <td className="table-cell font-semibold text-green-400">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-dark-600">
                      <td colSpan={4} className="table-cell font-semibold text-dark-300">Grand Total</td>
                      <td className="table-cell font-bold text-green-400 text-base">
                        {formatCurrency(form.items.reduce((s, i) => s + (i.total || 0), 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">Save Quotation</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
