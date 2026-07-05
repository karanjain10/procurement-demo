import { useState, useCallback } from 'react';

// Helper to read from localStorage
const ls = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  },
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Generate unique IDs
export const genId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

// Central state hook — reads all from localStorage, provides update functions
export const useStore = () => {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  const indents = ls.get('indents');
  const rfqs = ls.get('rfqs');
  const quotations = ls.get('quotations');
  const comparativeStatements = ls.get('comparative_statements');
  const approvals = ls.get('approvals');
  const purchaseOrders = ls.get('purchase_orders');
  const vendors = ls.get('vendors');
  const grns = ls.get('grns');
  const inventory = ls.get('inventory');
  const machineAllocations = ls.get('machine_allocations');

  // ─── INDENT ACTIONS ──────────────────────────────────────────────────────────
  const createIndent = (data) => {
    const existing = ls.get('indents');
    const newIndent = {
      id: genId('ind'),
      indent_number: `IND-2026-${String(existing.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
      status: 'SUBMITTED',
      ...data
    };
    ls.set('indents', [...existing, newIndent]);
    refresh();
    return newIndent;
  };

  const updateIndentStatus = (indentId, status, extra = {}) => {
    const all = ls.get('indents').map(i =>
      i.id === indentId ? { ...i, status, ...extra } : i
    );
    ls.set('indents', all);
    refresh();
  };

  // ─── RFQ ACTIONS ──────────────────────────────────────────────────────────────
  const createRFQ = (data) => {
    const all = ls.get('rfqs');
    const rfq = { id: genId('rfq'), sent_at: new Date().toISOString(), status: 'SENT', ...data };
    ls.set('rfqs', [...all, rfq]);
    refresh();
    return rfq;
  };

  const updateRFQStatus = (rfqId, status) => {
    ls.set('rfqs', ls.get('rfqs').map(r => r.id === rfqId ? { ...r, status } : r));
    refresh();
  };

  // ─── QUOTATION ACTIONS ──────────────────────────────────────────────────────
  const addQuotation = (data) => {
    const all = ls.get('quotations');
    const quot = { id: genId('quot'), submitted_at: new Date().toISOString(), ...data };
    ls.set('quotations', [...all, quot]);
    refresh();
    return quot;
  };

  // ─── COMPARATIVE STATEMENT ───────────────────────────────────────────────────
  const saveComparativeStatement = (data) => {
    const all = ls.get('comparative_statements');
    const existing = all.find(cs => cs.indent_id === data.indent_id);
    if (existing) {
      ls.set('comparative_statements', all.map(cs => cs.indent_id === data.indent_id ? { ...cs, ...data } : cs));
    } else {
      ls.set('comparative_statements', [...all, { id: genId('cs'), prepared_at: new Date().toISOString(), ...data }]);
    }
    refresh();
  };

  // ─── APPROVAL ACTIONS ────────────────────────────────────────────────────────
  const createApprovals = (indentId) => {
    const all = ls.get('approvals');
    const newApprovals = [
      { id: genId('appr'), indent_id: indentId, level: 'L1', status: 'PENDING', actioned_by: null, actioned_at: null, remarks: null },
      { id: genId('appr'), indent_id: indentId, level: 'L2', status: 'PENDING', actioned_by: null, actioned_at: null, remarks: null },
    ];
    ls.set('approvals', [...all, ...newApprovals]);
    refresh();
  };

  const actionApproval = (indentId, level, status, remarks, actioned_by) => {
    ls.set('approvals', ls.get('approvals').map(a =>
      a.indent_id === indentId && a.level === level
        ? { ...a, status, remarks, actioned_by, actioned_at: new Date().toISOString() }
        : a
    ));
    refresh();
  };

  // ─── PURCHASE ORDER ACTIONS ──────────────────────────────────────────────────
  const createPO = (data) => {
    const all = ls.get('purchase_orders');
    const po = {
      id: genId('po'),
      po_number: `PO-2026-${String(all.length + 1).padStart(3, '0')}`,
      generated_at: new Date().toISOString(),
      status: 'GENERATED',
      ...data
    };
    ls.set('purchase_orders', [...all, po]);
    refresh();
    return po;
  };

  const updatePOStatus = (poId, status) => {
    ls.set('purchase_orders', ls.get('purchase_orders').map(p => p.id === poId ? { ...p, status } : p));
    refresh();
  };

  // ─── GRN ACTIONS ─────────────────────────────────────────────────────────────
  const createGRN = (data) => {
    const all = ls.get('grns');
    const grn = {
      id: genId('grn'),
      grn_number: `GRN-2026-${String(all.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
      status: 'DRAFT',
      ...data,
    };
    ls.set('grns', [...all, grn]);
    refresh();
    return grn;
  };

  const updateGRN = (grnId, updates) => {
    ls.set('grns', ls.get('grns').map(g => g.id === grnId ? { ...g, ...updates } : g));
    refresh();
  };

  const confirmGRN = (grnId) => {
    const allGRNs = ls.get('grns');
    const grn = allGRNs.find(g => g.id === grnId);
    if (!grn) return;

    // Mark GRN as confirmed
    ls.set('grns', allGRNs.map(g => g.id === grnId ? { ...g, status: 'CONFIRMED', confirmed_at: new Date().toISOString() } : g));

    // Update inventory for each received item
    const currentInventory = ls.get('inventory');
    grn.items.forEach(item => {
      const receivedQty = parseFloat(item.received_qty) || 0;
      if (receivedQty <= 0) return;
      const existing = currentInventory.find(
        inv => inv.site_name === grn.site_name && inv.material_name === item.material_name
      );
      if (existing) {
        existing.total_received = (parseFloat(existing.total_received) || 0) + receivedQty;
        ls.set('inventory', currentInventory.map(inv =>
          inv.id === existing.id ? existing : inv
        ));
      } else {
        const newItem = {
          id: genId('inv'),
          site_name: grn.site_name,
          material_name: item.material_name,
          unit: item.unit,
          total_received: receivedQty,
          allocated: 0,
        };
        currentInventory.push(newItem);
        ls.set('inventory', currentInventory);
      }
    });

    // Update indent status to GRN_DONE
    const indents = ls.get('indents');
    const po = ls.get('purchase_orders').find(p => p.id === grn.po_id);
    if (po) {
      ls.set('indents', indents.map(i => i.id === po.indent_id ? { ...i, status: 'GRN_DONE' } : i));
    }

    refresh();
  };

  // ─── INVENTORY ACTIONS ───────────────────────────────────────────────────────
  const allocateToMachine = (data) => {
    const allAllocations = ls.get('machine_allocations');
    const allInventory = ls.get('inventory');

    const inventoryItem = allInventory.find(
      inv => inv.site_name === data.site_name && inv.material_name === data.material_name
    );
    if (!inventoryItem) return { error: 'Inventory item not found' };

    const available = (parseFloat(inventoryItem.total_received) || 0) - (parseFloat(inventoryItem.allocated) || 0);
    if (parseFloat(data.quantity) > available) return { error: 'Insufficient quantity available' };

    // Increment allocated
    ls.set('inventory', allInventory.map(inv =>
      inv.id === inventoryItem.id
        ? { ...inv, allocated: (parseFloat(inv.allocated) || 0) + parseFloat(data.quantity) }
        : inv
    ));

    // Create allocation record
    const allocation = {
      id: genId('alloc'),
      allocated_at: new Date().toISOString(),
      ...data,
    };
    ls.set('machine_allocations', [...allAllocations, allocation]);
    refresh();
    return allocation;
  };

  const deallocate = (allocationId) => {
    const allAllocations = ls.get('machine_allocations');
    const alloc = allAllocations.find(a => a.id === allocationId);
    if (!alloc) return;

    // Decrement allocated in inventory
    const allInventory = ls.get('inventory');
    ls.set('inventory', allInventory.map(inv =>
      inv.site_name === alloc.site_name && inv.material_name === alloc.material_name
        ? { ...inv, allocated: Math.max(0, (parseFloat(inv.allocated) || 0) - parseFloat(alloc.quantity)) }
        : inv
    ));

    // Remove allocation
    ls.set('machine_allocations', allAllocations.filter(a => a.id !== allocationId));
    refresh();
  };

  // ─── DERIVED HELPERS ─────────────────────────────────────────────────────────
  const getIndentById = (id) => indents.find(i => i.id === id);
  const getRFQByIndentId = (indentId) => rfqs.find(r => r.indent_id === indentId);
  const getQuotationsByIndentId = (indentId) => quotations.filter(q => q.indent_id === indentId);
  const getCSByIndentId = (indentId) => comparativeStatements.find(cs => cs.indent_id === indentId);
  const getApprovalsByIndentId = (indentId) => approvals.filter(a => a.indent_id === indentId);
  const getPOByIndentId = (indentId) => purchaseOrders.find(p => p.indent_id === indentId);
  const getGRNByPOId = (poId) => grns.find(g => g.po_id === poId);
  const getInventoryBySite = (siteName) => inventory.filter(inv => inv.site_name === siteName);
  const getAllocationsBySite = (siteName) => machineAllocations.filter(a => a.site_name === siteName);

  // ─── NOTIFICATION COUNTS (per role) ─────────────────────────────────────────
  const getNotifications = (role) => {
    const notes = [];
    if (role === 'site_manager') {
      // nothing actionable for SM, just info
    }
    if (role === 'ops') {
      const submitted = indents.filter(i => i.status === 'SUBMITTED');
      submitted.forEach(i => notes.push({ id: i.id, text: `${i.indent_number} needs ops review`, link: `/ops/pending` }));
      const rfqSent = indents.filter(i => i.status === 'RFQ_SENT');
      rfqSent.forEach(i => {
        const quots = getQuotationsByIndentId(i.id);
        if (quots.length < 2) notes.push({ id: i.id + '_q', text: `Add quotations for ${i.indent_number}`, link: `/ops/quotations` });
      });
      const approved = indents.filter(i => i.status === 'APPROVED');
      approved.forEach(i => {
        const po = getPOByIndentId(i.id);
        if (!po) notes.push({ id: i.id + '_po', text: `Generate PO for ${i.indent_number}`, link: `/ops/purchase-orders` });
      });
      // GRN notifications — PO sent but no GRN yet
      const poSent = purchaseOrders.filter(p => p.status === 'PO_SENT');
      poSent.forEach(po => {
        const grn = getGRNByPOId(po.id);
        if (!grn) notes.push({ id: po.id + '_grn', text: `Create GRN for ${po.po_number}`, link: `/ops/grn` });
      });
    }
    if (role === 'approver_l1') {
      const pendingL1 = approvals.filter(a => a.level === 'L1' && a.status === 'PENDING');
      pendingL1.forEach(a => {
        const indent = getIndentById(a.indent_id);
        if (indent) notes.push({ id: a.id, text: `${indent.indent_number} pending your approval (L1)`, link: `/approver-l1/pending` });
      });
    }
    if (role === 'approver_l2') {
      const l1Approved = approvals.filter(a => a.level === 'L1' && a.status === 'APPROVED');
      l1Approved.forEach(a => {
        const l2 = approvals.find(x => x.indent_id === a.indent_id && x.level === 'L2' && x.status === 'PENDING');
        if (l2) {
          const indent = getIndentById(a.indent_id);
          if (indent) notes.push({ id: l2.id, text: `${indent.indent_number} pending your approval (L2)`, link: `/approver-l2/pending` });
        }
      });
    }
    return notes;
  };

  return {
    // Data
    indents, rfqs, quotations, comparativeStatements, approvals, purchaseOrders, vendors,
    grns, inventory, machineAllocations,
    // Actions
    createIndent, updateIndentStatus,
    createRFQ, updateRFQStatus,
    addQuotation,
    saveComparativeStatement,
    createApprovals, actionApproval,
    createPO, updatePOStatus,
    createGRN, updateGRN, confirmGRN,
    allocateToMachine, deallocate,
    // Helpers
    getIndentById, getRFQByIndentId, getQuotationsByIndentId,
    getCSByIndentId, getApprovalsByIndentId, getPOByIndentId,
    getGRNByPOId, getInventoryBySite, getAllocationsBySite,
    getNotifications,
    refresh,
  };
};
