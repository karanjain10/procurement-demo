import { useState } from 'react';
import {
  PackageCheck, ClipboardCheck, Plus, Eye, CheckCircle2,
  Truck, AlertTriangle, Package, ChevronDown,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const CONDITION_OPTIONS = ['GOOD', 'SHORT', 'DAMAGED'];
const CONDITION_COLORS = {
  GOOD: 'text-emerald-400',
  SHORT: 'text-yellow-400',
  DAMAGED: 'text-red-400',
};

// Pre-seeded machines per site for dropdown
const SITE_MACHINES = {
  'Adasa-2': [
    { id: 'mach_001', name: 'CAT 374D Excavator', type: 'Excavator' },
    { id: 'mach_002', name: 'Komatsu PC210 Excavator', type: 'Excavator' },
    { id: 'mach_003', name: 'TATA Prima 2825K Tipper', type: 'Tipper' },
    { id: 'mach_004', name: 'TATA Prima 4028S Tipper', type: 'Tipper' },
    { id: 'mach_005', name: 'L&T JD 824 Motor Grader', type: 'Grader' },
  ],
  'Adasa-3': [
    { id: 'mach_006', name: 'Hitachi ZX350 Excavator', type: 'Excavator' },
    { id: 'mach_007', name: 'Volvo EC480 Excavator', type: 'Excavator' },
    { id: 'mach_008', name: 'BharatBenz 2523 Tipper', type: 'Tipper' },
    { id: 'mach_009', name: 'Ashok Leyland 3518 Tipper', type: 'Tipper' },
    { id: 'mach_010', name: 'Caterpillar 12M3 Grader', type: 'Grader' },
  ],
};

export default function GRN() {
  const {
    purchaseOrders, indents, grns,
    createGRN, updateGRN, confirmGRN,
    getGRNByPOId, getIndentById,
  } = useStore();
  const toast = useToast();

  const [createModal, setCreateModal] = useState(null); // po object
  const [viewModal, setViewModal] = useState(null); // grn object
  const [grnForm, setGrnForm] = useState({});

  const sentPOs = purchaseOrders.filter(p => p.status === 'PO_SENT');

  const openCreateGRN = (po) => {
    const indent = getIndentById(po.indent_id);
    setGrnForm({
      po_id: po.id,
      indent_id: po.indent_id,
      site_name: indent?.site_name || '',
      received_by: 'Rahul Sharma (Ops Executive)',
      vehicle_number: '',
      driver_name: '',
      remarks: '',
      items: po.items?.map(item => ({
        material_name: item.material_name,
        ordered_qty: item.quantity,
        received_qty: item.quantity,
        unit: item.unit || '',
        condition: 'GOOD',
      })) || [],
    });
    setCreateModal(po);
  };

  const updateFormItem = (idx, field, value) => {
    setGrnForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  const handleSaveDraft = () => {
    const grn = createGRN({ ...grnForm, status: 'DRAFT' });
    toast(`${grn.grn_number} saved as draft`, 'info');
    setCreateModal(null);
  };

  const handleConfirmGRN = (grnId) => {
    confirmGRN(grnId);
    toast('GRN confirmed! Inventory updated.', 'success');
    setViewModal(null);
  };

  const handleCreateAndConfirm = () => {
    const grn = createGRN({ ...grnForm, status: 'DRAFT' });
    confirmGRN(grn.id);
    toast(`${grn.grn_number} created & confirmed. Inventory updated!`, 'success');
    setCreateModal(null);
  };

  // Stats
  const confirmedGRNs = grns.filter(g => g.status === 'CONFIRMED');
  const draftGRNs = grns.filter(g => g.status === 'DRAFT');
  const pendingPOs = sentPOs.filter(po => !getGRNByPOId(po.id));

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <PackageCheck className="w-6 h-6 text-primary" />
          Goods Receipt Notes
        </h2>
        <p className="text-dark-400 text-sm mt-1">Record and confirm goods received against Purchase Orders</p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending GRN', value: pendingPOs.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Drafts', value: draftGRNs.length, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
          { label: 'Confirmed', value: confirmedGRNs.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(stat => (
          <div key={stat.label} className={`card p-4 border ${stat.bg} text-center`}>
            <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-dark-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* POs Awaiting GRN */}
      {pendingPOs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            POs Awaiting GRN ({pendingPOs.length})
          </h3>
          <div className="grid gap-3">
            {pendingPOs.map(po => {
              const indent = getIndentById(po.indent_id);
              return (
                <div key={po.id} className="card p-4 border border-amber-500/20 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{po.po_number}</span>
                        <StatusBadge status={po.status} />
                      </div>
                      <div className="text-xs text-dark-400 mt-0.5">
                        {indent?.site_name} · Vendor: {po.selected_vendor} · {formatDate(po.generated_at)}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => openCreateGRN(po)} className="btn-primary text-sm">
                    <Plus className="w-4 h-4" />
                    Create GRN
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All GRNs Table */}
      <div>
        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-3">All GRNs</h3>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">GRN Number</th>
                  <th className="table-header">PO Number</th>
                  <th className="table-header">Site</th>
                  <th className="table-header">Vendor</th>
                  <th className="table-header">Received By</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {grns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="table-cell text-center text-dark-500 py-10">
                      No GRNs created yet
                    </td>
                  </tr>
                ) : (
                  [...grns].reverse().map(grn => {
                    const po = purchaseOrders.find(p => p.id === grn.po_id);
                    return (
                      <tr key={grn.id} className="table-row">
                        <td className="table-cell">
                          <span className="font-mono font-bold text-primary">{grn.grn_number}</span>
                        </td>
                        <td className="table-cell text-dark-300 font-mono text-xs">{po?.po_number || '—'}</td>
                        <td className="table-cell text-dark-200">{grn.site_name}</td>
                        <td className="table-cell text-dark-400 text-xs">{po?.selected_vendor || '—'}</td>
                        <td className="table-cell text-dark-400 text-xs">{grn.received_by}</td>
                        <td className="table-cell text-dark-400">{formatDate(grn.created_at)}</td>
                        <td className="table-cell"><StatusBadge status={grn.status} /></td>
                        <td className="table-cell">
                          <button
                            onClick={() => setViewModal(grn)}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-400 transition-colors"
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

      {/* Create GRN Modal */}
      <Modal
        isOpen={!!createModal}
        onClose={() => setCreateModal(null)}
        title={`Create GRN — ${createModal?.po_number}`}
        size="xl"
      >
        {createModal && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Received By</label>
                <input
                  className="input-field"
                  value={grnForm.received_by}
                  onChange={e => setGrnForm(p => ({ ...p, received_by: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Site</label>
                <input className="input-field" value={grnForm.site_name} readOnly />
              </div>
              <div>
                <label className="label">Vehicle Number</label>
                <input
                  className="input-field"
                  placeholder="MH-31-AB-XXXX"
                  value={grnForm.vehicle_number}
                  onChange={e => setGrnForm(p => ({ ...p, vehicle_number: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Driver Name</label>
                <input
                  className="input-field"
                  placeholder="Driver name"
                  value={grnForm.driver_name}
                  onChange={e => setGrnForm(p => ({ ...p, driver_name: e.target.value }))}
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <label className="label mb-3">Items Received</label>
              <div className="space-y-3">
                {grnForm.items?.map((item, idx) => (
                  <div key={idx} className="bg-dark-800 border border-dark-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        {item.material_name}
                      </span>
                      <span className="text-xs text-dark-400">Ordered: {item.ordered_qty} {item.unit}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-dark-400 mb-1 block">Received Qty</label>
                        <input
                          type="number"
                          className="input-field"
                          value={item.received_qty}
                          onChange={e => updateFormItem(idx, 'received_qty', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-dark-400 mb-1 block">Unit</label>
                        <input
                          className="input-field"
                          value={item.unit}
                          onChange={e => updateFormItem(idx, 'unit', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-dark-400 mb-1 block">Condition</label>
                        <div className="relative">
                          <select
                            className="input-field appearance-none pr-8"
                            value={item.condition}
                            onChange={e => updateFormItem(idx, 'condition', e.target.value)}
                          >
                            {CONDITION_OPTIONS.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    {parseFloat(item.received_qty) < parseFloat(item.ordered_qty) && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-yellow-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Short by {item.ordered_qty - item.received_qty} {item.unit}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Remarks</label>
              <textarea
                className="input-field resize-none"
                rows={2}
                placeholder="Any delivery notes or observations…"
                value={grnForm.remarks}
                onChange={e => setGrnForm(p => ({ ...p, remarks: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setCreateModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveDraft} className="btn-secondary">
                Save as Draft
              </button>
              <button onClick={handleCreateAndConfirm} className="btn-primary">
                <ClipboardCheck className="w-4 h-4" />
                Confirm GRN & Update Inventory
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View GRN Modal */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title={`GRN — ${viewModal?.grn_number}`}
        size="xl"
      >
        {viewModal && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'GRN Number', value: viewModal.grn_number },
                { label: 'Status', value: <StatusBadge status={viewModal.status} /> },
                { label: 'Site', value: viewModal.site_name },
                { label: 'Received By', value: viewModal.received_by },
                { label: 'Vehicle', value: viewModal.vehicle_number || '—' },
                { label: 'Driver', value: viewModal.driver_name || '—' },
                { label: 'Created', value: formatDate(viewModal.created_at) },
                { label: 'Confirmed', value: viewModal.confirmed_at ? formatDate(viewModal.confirmed_at) : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-dark-500 uppercase tracking-wide mb-0.5">{label}</div>
                  <div className="text-dark-200 font-medium">{value}</div>
                </div>
              ))}
            </div>

            {viewModal.remarks && (
              <div className="bg-dark-800 border border-dark-700 rounded-lg p-3 text-sm text-dark-300">
                <span className="text-dark-500 text-xs uppercase tracking-wide">Remarks: </span>
                {viewModal.remarks}
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-dark-300 mb-3">Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="table-header pl-0">Material</th>
                      <th className="table-header">Ordered</th>
                      <th className="table-header">Received</th>
                      <th className="table-header">Unit</th>
                      <th className="table-header">Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewModal.items?.map((item, i) => (
                      <tr key={i} className="border-b border-dark-700/50">
                        <td className="table-cell pl-0 font-medium text-dark-200">{item.material_name}</td>
                        <td className="table-cell text-dark-400">{item.ordered_qty}</td>
                        <td className={`table-cell font-semibold ${parseFloat(item.received_qty) < parseFloat(item.ordered_qty) ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          {item.received_qty}
                        </td>
                        <td className="table-cell text-dark-400">{item.unit}</td>
                        <td className="table-cell">
                          <span className={`text-xs font-semibold ${CONDITION_COLORS[item.condition] || 'text-dark-400'}`}>
                            ● {item.condition}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {viewModal.status === 'DRAFT' && (
              <div className="flex justify-end">
                <button
                  onClick={() => handleConfirmGRN(viewModal.id)}
                  className="btn-primary"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm GRN & Update Inventory
                </button>
              </div>
            )}
            {viewModal.status === 'CONFIRMED' && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                GRN Confirmed — Inventory has been updated
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
