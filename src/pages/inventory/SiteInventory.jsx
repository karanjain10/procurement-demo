import { useState } from 'react';
import {
  Warehouse, Cpu, TrendingDown, PackagePlus, Trash2,
  ChevronDown, BarChart3, Layers, Wrench,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';

const SITES = ['Adasa-2', 'Adasa-3'];

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

const MACHINE_TYPE_ICONS = {
  Excavator: '🦺',
  Tipper: '🚛',
  Grader: '🚧',
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const AvailabilityBar = ({ total, allocated }) => {
  const available = Math.max(0, total - allocated);
  const pct = total > 0 ? Math.round((allocated / total) * 100) : 0;
  const color = pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-dark-400 shrink-0">{pct}%</span>
    </div>
  );
};

export default function SiteInventory() {
  const {
    inventory, machineAllocations,
    allocateToMachine, deallocate,
    getInventoryBySite, getAllocationsBySite,
  } = useStore();
  const toast = useToast();

  const [activeSite, setActiveSite] = useState(SITES[0]);
  const [allocModal, setAllocModal] = useState(null); // inventory item
  const [allocForm, setAllocForm] = useState({});

  const siteInventory = getInventoryBySite(activeSite);
  const siteAllocations = getAllocationsBySite(activeSite);

  // Group allocations by machine
  const allocationsByMachine = siteAllocations.reduce((acc, alloc) => {
    const key = alloc.machine_id;
    if (!acc[key]) acc[key] = { machine_name: alloc.machine_name, machine_type: alloc.machine_type, items: [] };
    acc[key].items.push(alloc);
    return acc;
  }, {});

  const openAllocModal = (invItem) => {
    const available = (invItem.total_received || 0) - (invItem.allocated || 0);
    setAllocForm({
      site_name: activeSite,
      material_name: invItem.material_name,
      unit: invItem.unit,
      machine_id: SITE_MACHINES[activeSite]?.[0]?.id || '',
      machine_name: SITE_MACHINES[activeSite]?.[0]?.name || '',
      machine_type: SITE_MACHINES[activeSite]?.[0]?.type || '',
      quantity: '',
      allocated_by: 'Rajesh Kumar (Site Manager)',
      notes: '',
      _available: available,
    });
    setAllocModal(invItem);
  };

  const handleMachineChange = (machineId) => {
    const machine = SITE_MACHINES[activeSite]?.find(m => m.id === machineId);
    setAllocForm(prev => ({
      ...prev,
      machine_id: machineId,
      machine_name: machine?.name || '',
      machine_type: machine?.type || '',
    }));
  };

  const handleAllocate = () => {
    if (!allocForm.quantity || parseFloat(allocForm.quantity) <= 0) {
      toast('Please enter a valid quantity', 'error');
      return;
    }
    if (parseFloat(allocForm.quantity) > allocForm._available) {
      toast(`Only ${allocForm._available} ${allocForm.unit} available`, 'error');
      return;
    }
    const { _available, ...data } = allocForm;
    const result = allocateToMachine(data);
    if (result?.error) {
      toast(result.error, 'error');
    } else {
      toast(`Allocated ${allocForm.quantity} ${allocForm.unit} of ${allocForm.material_name} to ${allocForm.machine_name}`, 'success');
      setAllocModal(null);
    }
  };

  const handleDeallocate = (allocationId, machineName, materialName) => {
    deallocate(allocationId);
    toast(`Deallocated ${materialName} from ${machineName}`, 'info');
  };

  // Site-level stats
  const totalItems = siteInventory.length;
  const totalAllocated = siteInventory.reduce((s, i) => s + (i.allocated || 0), 0);
  const totalAvailable = siteInventory.reduce((s, i) => s + Math.max(0, (i.total_received || 0) - (i.allocated || 0)), 0);

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Warehouse className="w-6 h-6 text-primary" />
          Site Inventory
        </h2>
        <p className="text-dark-400 text-sm mt-1">Track materials per site and allocate to machines</p>
      </div>

      {/* Site Tabs */}
      <div className="flex gap-2 border-b border-dark-700 pb-0">
        {SITES.map(site => (
          <button
            key={site}
            onClick={() => setActiveSite(site)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 -mb-px ${
              activeSite === site
                ? 'text-primary border-primary bg-primary/5'
                : 'text-dark-400 border-transparent hover:text-dark-200'
            }`}
          >
            {site}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Material Types', value: totalItems, icon: Layers, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
          { label: 'Total Allocated', value: totalAllocated.toLocaleString('en-IN'), icon: Cpu, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
          { label: 'Total Available', value: totalAvailable.toLocaleString('en-IN'), icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(stat => (
          <div key={stat.label} className={`card p-4 border ${stat.bg} flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-dark-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Table */}
      <div>
        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-3">
          Inventory at {activeSite}
        </h3>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Material</th>
                  <th className="table-header">Unit</th>
                  <th className="table-header">Total Received</th>
                  <th className="table-header">Allocated</th>
                  <th className="table-header">Available</th>
                  <th className="table-header">Utilization</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {siteInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center text-dark-500 py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Warehouse className="w-8 h-8 text-dark-700" />
                        <span>No inventory at {activeSite} yet</span>
                        <span className="text-xs text-dark-600">Confirm a GRN for this site to add items</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  siteInventory.map(item => {
                    const available = Math.max(0, (item.total_received || 0) - (item.allocated || 0));
                    return (
                      <tr key={item.id} className="table-row">
                        <td className="table-cell font-medium text-dark-200">{item.material_name}</td>
                        <td className="table-cell text-dark-400">{item.unit}</td>
                        <td className="table-cell text-dark-300">{(item.total_received || 0).toLocaleString('en-IN')}</td>
                        <td className="table-cell text-violet-400 font-medium">{(item.allocated || 0).toLocaleString('en-IN')}</td>
                        <td className={`table-cell font-bold ${available <= 0 ? 'text-red-400' : available < item.total_received * 0.2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {available.toLocaleString('en-IN')}
                        </td>
                        <td className="table-cell min-w-[120px]">
                          <AvailabilityBar total={item.total_received || 0} allocated={item.allocated || 0} />
                        </td>
                        <td className="table-cell">
                          {available > 0 ? (
                            <button
                              onClick={() => openAllocModal(item)}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-400 transition-colors"
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                              Allocate
                            </button>
                          ) : (
                            <span className="text-xs text-dark-600">Fully allocated</span>
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
      </div>

      {/* Machine Allocations */}
      <div>
        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-3">
          Machine Allocations at {activeSite}
        </h3>

        {Object.keys(allocationsByMachine).length === 0 ? (
          <div className="card p-10 text-center text-dark-500">
            <Wrench className="w-8 h-8 text-dark-700 mx-auto mb-2" />
            <p>No allocations yet</p>
            <p className="text-xs text-dark-600 mt-1">Allocate inventory items to machines from the table above</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {Object.entries(allocationsByMachine).map(([machineId, machineData]) => (
              <div key={machineId} className="card overflow-hidden">
                {/* Machine Header */}
                <div className="px-5 py-3 bg-dark-800 border-b border-dark-700 flex items-center gap-3">
                  <span className="text-2xl">{MACHINE_TYPE_ICONS[machineData.machine_type] || '⚙️'}</span>
                  <div>
                    <div className="font-semibold text-white">{machineData.machine_name}</div>
                    <div className="text-xs text-dark-400">{machineData.machine_type} · {activeSite}</div>
                  </div>
                  <span className="ml-auto text-xs text-dark-500">{machineData.items.length} item{machineData.items.length !== 1 ? 's' : ''} allocated</span>
                </div>

                {/* Allocation Items */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-dark-700">
                        <th className="table-header">Material</th>
                        <th className="table-header">Quantity</th>
                        <th className="table-header">Unit</th>
                        <th className="table-header">Allocated By</th>
                        <th className="table-header">Date</th>
                        <th className="table-header">Notes</th>
                        <th className="table-header">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {machineData.items.map(alloc => (
                        <tr key={alloc.id} className="table-row">
                          <td className="table-cell font-medium text-dark-200">{alloc.material_name}</td>
                          <td className="table-cell font-bold text-violet-400">{Number(alloc.quantity).toLocaleString('en-IN')}</td>
                          <td className="table-cell text-dark-400">{alloc.unit}</td>
                          <td className="table-cell text-dark-400 text-xs">{alloc.allocated_by}</td>
                          <td className="table-cell text-dark-400">{formatDate(alloc.allocated_at)}</td>
                          <td className="table-cell text-dark-500 text-xs max-w-[160px] truncate">{alloc.notes || '—'}</td>
                          <td className="table-cell">
                            <button
                              onClick={() => handleDeallocate(alloc.id, machineData.machine_name, alloc.material_name)}
                              className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Allocate Modal */}
      <Modal
        isOpen={!!allocModal}
        onClose={() => setAllocModal(null)}
        title={`Allocate — ${allocModal?.material_name}`}
        size="md"
      >
        {allocModal && (
          <div className="space-y-5">
            {/* Info bar */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex gap-6">
              <div>
                <div className="text-xs text-dark-500">Total Received</div>
                <div className="font-bold text-dark-200">{(allocModal.total_received || 0).toLocaleString('en-IN')} {allocModal.unit}</div>
              </div>
              <div>
                <div className="text-xs text-dark-500">Already Allocated</div>
                <div className="font-bold text-violet-400">{(allocModal.allocated || 0).toLocaleString('en-IN')} {allocModal.unit}</div>
              </div>
              <div>
                <div className="text-xs text-dark-500">Available</div>
                <div className="font-bold text-emerald-400">{allocForm._available?.toLocaleString('en-IN')} {allocModal.unit}</div>
              </div>
            </div>

            <div>
              <label className="label">Select Machine</label>
              <div className="relative">
                <select
                  className="input-field appearance-none pr-8"
                  value={allocForm.machine_id}
                  onChange={e => handleMachineChange(e.target.value)}
                >
                  {(SITE_MACHINES[activeSite] || []).map(m => (
                    <option key={m.id} value={m.id}>{MACHINE_TYPE_ICONS[m.type] || '⚙️'} {m.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="label">Quantity to Allocate ({allocModal.unit})</label>
              <input
                type="number"
                className="input-field"
                placeholder={`Max: ${allocForm._available}`}
                value={allocForm.quantity}
                min={1}
                max={allocForm._available}
                onChange={e => setAllocForm(p => ({ ...p, quantity: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Allocated By</label>
              <input
                className="input-field"
                value={allocForm.allocated_by}
                onChange={e => setAllocForm(p => ({ ...p, allocated_by: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                className="input-field resize-none"
                rows={2}
                placeholder="Purpose, shift details, etc."
                value={allocForm.notes}
                onChange={e => setAllocForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setAllocModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleAllocate} className="btn-primary">
                <PackagePlus className="w-4 h-4" />
                Confirm Allocation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
