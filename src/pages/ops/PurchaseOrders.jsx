import { useState } from 'react';
import { ShoppingBag, FileText, Printer, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

let poCounter = 2;

export default function PurchaseOrders() {
  const { indents, purchaseOrders, createPO, updatePOStatus, getCSByIndentId, getQuotationsByIndentId, getPOByIndentId } = useStore();
  const toast = useToast();

  const [generateModal, setGenerateModal] = useState(null); // indent
  const [previewModal, setPreviewModal] = useState(null); // po
  const [poForm, setPoForm] = useState({});

  const approvedIndents = indents.filter(i => i.status === 'APPROVED');

  const openGeneratePO = (indent) => {
    const cs = getCSByIndentId(indent.id);
    const quots = getQuotationsByIndentId(indent.id);
    const selectedQuot = quots.find(q => q.vendor_name === cs?.selected_vendor);
    const allPos = purchaseOrders;

    setPoForm({
      indent_id: indent.id,
      po_number: `PO-2026-${String(allPos.length + poCounter).padStart(3, '0')}`,
      selected_vendor: cs?.selected_vendor || '',
      vendor_email: '',
      delivery_address: `Lokesh Infraproject, ${indent.site_name} Mine Site, Kamptee Road, Nagpur - 441202`,
      payment_terms: selectedQuot?.payment_terms || '',
      special_instructions: '',
      items: selectedQuot?.items?.map(i => ({ ...i })) || indent.materials?.map(m => ({
        material_name: m.name, quantity: m.quantity, unit: m.unit, unit_price: 0, taxes: 0, total: 0,
      })) || [],
    });
    setGenerateModal(indent);
  };

  const updateItem = (idx, field, value) => {
    setPoForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== idx) return item;
        const upd = { ...item, [field]: value };
        upd.total = Math.round(upd.quantity * (parseFloat(upd.unit_price) || 0) * (1 + (parseFloat(upd.taxes) || 0) / 100));
        return upd;
      }),
    }));
  };

  const handleGenerate = () => {
    const po = createPO({
      ...poForm,
      total_value: poForm.items.reduce((s, i) => s + (i.total || 0), 0),
    });
    toast(`${po.po_number} generated!`, 'success');
    setGenerateModal(null);
    setPreviewModal(po);
  };

  const handleMarkSent = (po) => {
    updatePOStatus(po.id, 'PO_SENT');
    // Also update indent
    toast(`${po.po_number} marked as sent!`, 'success');
    setPreviewModal(null);
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Purchase Orders</h2>
        <p className="text-dark-400 text-sm mt-1">Generate and manage POs for approved indents</p>
      </div>

      {/* Approved indents ready for PO */}
      {approvedIndents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-3">Ready to Generate PO</h3>
          <div className="grid gap-4">
            {approvedIndents.map(indent => {
              const cs = getCSByIndentId(indent.id);
              const existingPO = getPOByIndentId(indent.id);
              return (
                <div key={indent.id} className="card p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">{indent.indent_number}</span>
                      <StatusBadge status={indent.status} />
                    </div>
                    <div className="text-xs text-dark-400 mt-1">
                      {indent.site_name} · Vendor: {cs?.selected_vendor || '—'}
                    </div>
                  </div>
                  {!existingPO ? (
                    <button onClick={() => openGeneratePO(indent)} className="btn-primary">
                      <Plus className="w-4 h-4" />
                      Generate PO
                    </button>
                  ) : (
                    <button onClick={() => setPreviewModal(existingPO)} className="btn-secondary">
                      <FileText className="w-4 h-4" />
                      View PO
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All POs */}
      <div>
        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-3">All Purchase Orders</h3>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">PO Number</th>
                  <th className="table-header">Indent</th>
                  <th className="table-header">Vendor</th>
                  <th className="table-header">Total Value</th>
                  <th className="table-header">Generated</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center text-dark-500 py-10">
                      No purchase orders generated yet
                    </td>
                  </tr>
                ) : purchaseOrders.map(po => {
                  const indent = indents.find(i => i.id === po.indent_id);
                  return (
                    <tr key={po.id} className="table-row">
                      <td className="table-cell">
                        <span className="font-mono font-bold text-primary">{po.po_number}</span>
                      </td>
                      <td className="table-cell text-dark-300">{indent?.indent_number}</td>
                      <td className="table-cell text-dark-200 text-xs">{po.selected_vendor}</td>
                      <td className="table-cell font-semibold text-green-400">{formatCurrency(po.total_value)}</td>
                      <td className="table-cell text-dark-400">{formatDate(po.generated_at)}</td>
                      <td className="table-cell"><StatusBadge status={po.status} /></td>
                      <td className="table-cell">
                        <button onClick={() => setPreviewModal(po)} className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-400 transition-colors">
                          <Printer className="w-3.5 h-3.5" />
                          Preview
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate PO Modal */}
      <Modal isOpen={!!generateModal} onClose={() => setGenerateModal(null)} title={`Generate Purchase Order — ${generateModal?.indent_number}`} size="xl">
        {generateModal && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">PO Number</label>
                <input className="input-field font-mono" value={poForm.po_number} readOnly />
              </div>
              <div>
                <label className="label">Vendor</label>
                <input className="input-field" value={poForm.selected_vendor}
                  onChange={e => setPoForm(p => ({ ...p, selected_vendor: e.target.value }))} />
              </div>
              <div>
                <label className="label">Vendor Email</label>
                <input type="email" className="input-field" value={poForm.vendor_email}
                  onChange={e => setPoForm(p => ({ ...p, vendor_email: e.target.value }))} placeholder="vendor@email.com" />
              </div>
              <div>
                <label className="label">Payment Terms</label>
                <input className="input-field" value={poForm.payment_terms}
                  onChange={e => setPoForm(p => ({ ...p, payment_terms: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Delivery Address</label>
              <input className="input-field" value={poForm.delivery_address}
                onChange={e => setPoForm(p => ({ ...p, delivery_address: e.target.value }))} />
            </div>
            <div>
              <label className="label">Special Instructions</label>
              <textarea className="input-field resize-none" rows={2} value={poForm.special_instructions}
                onChange={e => setPoForm(p => ({ ...p, special_instructions: e.target.value }))} />
            </div>

            {/* Line items */}
            <div>
              <label className="label mb-3">Line Items</label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="table-header pl-0">Material</th>
                      <th className="table-header">Qty</th>
                      <th className="table-header">Unit Price</th>
                      <th className="table-header">Tax %</th>
                      <th className="table-header">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poForm.items?.map((item, idx) => (
                      <tr key={idx} className="border-b border-dark-700/50">
                        <td className="table-cell pl-0 font-medium">{item.material_name}</td>
                        <td className="table-cell">
                          <input type="number" className="input-field w-20" value={item.quantity}
                            onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                        </td>
                        <td className="table-cell">
                          <input type="number" className="input-field w-28" value={item.unit_price}
                            onChange={e => updateItem(idx, 'unit_price', e.target.value)} />
                        </td>
                        <td className="table-cell">
                          <input type="number" className="input-field w-20" value={item.taxes}
                            onChange={e => updateItem(idx, 'taxes', e.target.value)} />
                        </td>
                        <td className="table-cell font-semibold text-green-400">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-dark-600">
                      <td colSpan={4} className="table-cell font-bold text-dark-200">Grand Total</td>
                      <td className="table-cell font-bold text-green-400 text-base">
                        {formatCurrency(poForm.items?.reduce((s, i) => s + (i.total || 0), 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setGenerateModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleGenerate} className="btn-primary">
                <ShoppingBag className="w-4 h-4" />
                Generate PO
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* PO Preview Modal */}
      <Modal isOpen={!!previewModal} onClose={() => setPreviewModal(null)} title="Purchase Order Preview" size="xl">
        {previewModal && <POPreview po={previewModal} onMarkSent={handleMarkSent} indents={indents} />}
      </Modal>
    </div>
  );
}

const POPreview = ({ po, onMarkSent, indents }) => {
  const indent = indents.find(i => i.id === po.indent_id);
  return (
    <div className="bg-white text-gray-900 rounded-xl p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-orange-500 pb-4">
        <div>
          <div className="text-2xl font-black text-orange-600">LOKESH INFRAPROJECT</div>
          <div className="text-xs text-gray-500">Adasa Mine Site, Kamptee Road, Nagpur - 441202</div>
          <div className="text-xs text-gray-500">GSTIN: 27AAALM0045B1Z5</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-800">PURCHASE ORDER</div>
          <div className="font-mono text-orange-600 font-bold text-lg">{po.po_number}</div>
          <div className="text-xs text-gray-500">Date: {formatDate(po.generated_at)}</div>
        </div>
      </div>

      {/* Vendor & Delivery */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase">Bill To (Vendor)</div>
          <div className="font-bold text-gray-800">{po.selected_vendor}</div>
          {po.vendor_email && <div className="text-xs text-gray-500">{po.vendor_email}</div>}
        </div>
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase">Delivery Address</div>
          <div className="text-sm text-gray-700">{po.delivery_address}</div>
        </div>
      </div>

      {/* Items */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-orange-500 text-white">
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Material</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2 text-right">Unit Price</th>
            <th className="px-3 py-2 text-right">Tax %</th>
            <th className="px-3 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {po.items?.map((item, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="px-3 py-2 text-gray-500">{i + 1}</td>
              <td className="px-3 py-2 font-medium">{item.material_name}</td>
              <td className="px-3 py-2 text-right">{item.quantity} {item.unit}</td>
              <td className="px-3 py-2 text-right">₹{item.unit_price}</td>
              <td className="px-3 py-2 text-right">{item.taxes}%</td>
              <td className="px-3 py-2 text-right font-semibold">₹{item.total?.toLocaleString('en-IN')}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-orange-500 bg-orange-50">
            <td colSpan={5} className="px-3 py-2 font-bold text-right text-gray-800">Grand Total</td>
            <td className="px-3 py-2 font-bold text-right text-orange-600 text-base">₹{po.total_value?.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      {/* Terms */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-semibold text-gray-600 text-xs uppercase">Payment Terms</div>
          <div className="text-gray-800">{po.payment_terms}</div>
        </div>
        {po.special_instructions && (
          <div>
            <div className="font-semibold text-gray-600 text-xs uppercase">Special Instructions</div>
            <div className="text-gray-700 text-xs">{po.special_instructions}</div>
          </div>
        )}
      </div>

      {/* Signature */}
      <div className="border-t border-gray-200 pt-4 grid grid-cols-3 gap-8 text-center">
        <div>
          <div className="h-12 border-b border-gray-300 mb-1" />
          <div className="text-xs text-gray-500">Prepared By (Ops)</div>
        </div>
        <div>
          <div className="h-12 border-b border-gray-300 mb-1" />
          <div className="text-xs text-gray-500">Approved By (L1)</div>
        </div>
        <div>
          <div className="h-12 border-b border-gray-300 mb-1" />
          <div className="text-xs text-gray-500">Authorized By (Director)</div>
        </div>
      </div>

      {/* Action */}
      <div className="no-print flex justify-end gap-3 pt-2 border-t border-gray-200">
        {po.status !== 'PO_SENT' && (
          <button
            onClick={() => onMarkSent(po)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Mark PO as Sent
          </button>
        )}
        {po.status === 'PO_SENT' && (
          <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
            <CheckCircle className="w-4 h-4" />
            PO has been sent to vendor
          </div>
        )}
      </div>
    </div>
  );
};
