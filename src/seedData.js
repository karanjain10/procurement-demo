export const seedData = {
  indents: [
    {
      id: "ind_001",
      indent_number: "IND-2026-001",
      site_name: "Adasa-2",
      created_by: "Rajesh Kumar (Site Manager)",
      created_at: "2026-06-18T09:30:00Z",
      status: "PO_SENT",
      remarks: "Urgent requirement for ongoing excavation work",
      materials: [
        { name: "HSD Diesel", quantity: 5000, unit: "Ltr", required_date: "2026-06-22" },
        { name: "Hydraulic Oil 68", quantity: 200, unit: "Ltr", required_date: "2026-06-22" }
      ]
    },
    {
      id: "ind_002",
      indent_number: "IND-2026-002",
      site_name: "Adasa-3",
      created_by: "Suresh Patel (Site Manager)",
      created_at: "2026-06-20T11:00:00Z",
      status: "RFQ_SENT",
      remarks: "Monthly consumables restock",
      materials: [
        { name: "Safety Helmets (Full Brim)", quantity: 50, unit: "Nos", required_date: "2026-06-28" },
        { name: "Safety Boots (Size 7-10)", quantity: 30, unit: "Nos", required_date: "2026-06-28" },
        { name: "Reflective Safety Jackets", quantity: 50, unit: "Nos", required_date: "2026-06-28" }
      ]
    },
    {
      id: "ind_003",
      indent_number: "IND-2026-003",
      site_name: "Adasa-2",
      created_by: "Rajesh Kumar (Site Manager)",
      created_at: "2026-06-21T08:15:00Z",
      status: "PENDING_L1",
      remarks: "Tyre replacement for 3 tippers — urgent, affecting trips",
      materials: [
        { name: "Tipper Tyres 10.00x20 (16PR)", quantity: 12, unit: "Nos", required_date: "2026-06-26" },
        { name: "Tyre Tubes 10.00x20", quantity: 12, unit: "Nos", required_date: "2026-06-26" },
        { name: "Flaps 10.00x20", quantity: 12, unit: "Nos", required_date: "2026-06-26" }
      ]
    },
    {
      id: "ind_004",
      indent_number: "IND-2026-004",
      site_name: "Adasa-3",
      created_by: "Suresh Patel (Site Manager)",
      created_at: "2026-06-22T14:00:00Z",
      status: "APPROVED",
      remarks: "Excavator maintenance parts — scheduled service due",
      materials: [
        { name: "Engine Oil CF4 15W40", quantity: 100, unit: "Ltr", required_date: "2026-06-30" },
        { name: "Oil Filter (Excavator)", quantity: 5, unit: "Nos", required_date: "2026-06-30" },
        { name: "Air Filter (Excavator)", quantity: 5, unit: "Nos", required_date: "2026-06-30" },
        { name: "Fuel Filter (Excavator)", quantity: 5, unit: "Nos", required_date: "2026-06-30" }
      ]
    },
    {
      id: "ind_005",
      indent_number: "IND-2026-005",
      site_name: "Adasa-2",
      created_by: "Rajesh Kumar (Site Manager)",
      created_at: "2026-06-23T10:30:00Z",
      status: "SUBMITTED",
      remarks: "Blasting consumables required for next week operations",
      materials: [
        { name: "ANFO Explosive", quantity: 500, unit: "Kg", required_date: "2026-07-01" },
        { name: "Detonators (Electric)", quantity: 200, unit: "Nos", required_date: "2026-07-01" },
        { name: "Safety Fuse Wire", quantity: 100, unit: "MT", required_date: "2026-07-01" }
      ]
    }
  ],

  rfqs: [
    {
      id: "rfq_001",
      indent_id: "ind_001",
      sent_at: "2026-06-18T14:00:00Z",
      status: "COMPLETED",
      vendors_contacted: [
        { name: "Bharat Petroleum (Nagpur)", email: "sales.nagpur@bpcl.in" },
        { name: "Indian Oil Corporation (Nagpur)", email: "iocl.nagpur@indianoil.in" },
        { name: "HP Petroleum Dealers", email: "hpdealer.nagpur@hpcl.com" }
      ]
    },
    {
      id: "rfq_002",
      indent_id: "ind_002",
      sent_at: "2026-06-20T13:00:00Z",
      status: "SENT",
      vendors_contacted: [
        { name: "Safetech Safety Equipments", email: "sales@safetech.in" },
        { name: "Prima Safety Products Nagpur", email: "prima.safety@gmail.com" },
        { name: "Karam Safety (Distributor)", email: "karam.ngp@distributor.com" }
      ]
    },
    {
      id: "rfq_003",
      indent_id: "ind_003",
      sent_at: "2026-06-21T10:00:00Z",
      status: "COMPLETED",
      vendors_contacted: [
        { name: "MRF Tyres (Nagpur Dealer)", email: "mrf.nagpur@dealer.com" },
        { name: "Apollo Tyres Distributor", email: "apollo.ngp@gmail.com" },
        { name: "CEAT Tyre Center Nagpur", email: "ceat.nagpur@gmail.com" }
      ]
    },
    {
      id: "rfq_004",
      indent_id: "ind_004",
      sent_at: "2026-06-22T15:30:00Z",
      status: "COMPLETED",
      vendors_contacted: [
        { name: "Castrol Authorised Dealer Nagpur", email: "castrol.ngp@dealer.in" },
        { name: "Tide Water Oil (Veedol)", email: "veedol.nagpur@tidewateroil.com" },
        { name: "Gulf Oil Corporation Nagpur", email: "gulf.nagpur@gulfoil.in" }
      ]
    }
  ],

  quotations: [
    {
      id: "quot_001a", rfq_id: "rfq_001", indent_id: "ind_001",
      vendor_name: "Bharat Petroleum (Nagpur)",
      submitted_at: "2026-06-19T10:00:00Z", delivery_days: 2,
      payment_terms: "Immediate on delivery",
      remarks: "Price valid for 7 days. Tank lorry delivery at site.",
      items: [
        { material_name: "HSD Diesel", quantity: 5000, unit_price: 91.50, taxes: 0, total: 457500 },
        { material_name: "Hydraulic Oil 68", quantity: 200, unit_price: 285, taxes: 18, total: 67260 }
      ]
    },
    {
      id: "quot_001b", rfq_id: "rfq_001", indent_id: "ind_001",
      vendor_name: "Indian Oil Corporation (Nagpur)",
      submitted_at: "2026-06-19T14:00:00Z", delivery_days: 1,
      payment_terms: "Immediate on delivery",
      remarks: "IOCL retail price. Delivery within 24 hours.",
      items: [
        { material_name: "HSD Diesel", quantity: 5000, unit_price: 91.20, taxes: 0, total: 456000 },
        { material_name: "Hydraulic Oil 68", quantity: 200, unit_price: 292, taxes: 18, total: 68912 }
      ]
    },
    {
      id: "quot_001c", rfq_id: "rfq_001", indent_id: "ind_001",
      vendor_name: "HP Petroleum Dealers",
      submitted_at: "2026-06-19T16:30:00Z", delivery_days: 3,
      payment_terms: "7 days credit",
      remarks: "Credit available for registered contractors.",
      items: [
        { material_name: "HSD Diesel", quantity: 5000, unit_price: 92.00, taxes: 0, total: 460000 },
        { material_name: "Hydraulic Oil 68", quantity: 200, unit_price: 278, taxes: 18, total: 65608 }
      ]
    },
    {
      id: "quot_003a", rfq_id: "rfq_003", indent_id: "ind_003",
      vendor_name: "MRF Tyres (Nagpur Dealer)",
      submitted_at: "2026-06-21T14:00:00Z", delivery_days: 3,
      payment_terms: "50% advance, 50% on delivery",
      remarks: "MRF SHAKTI LT tyres. Best load rating in class.",
      items: [
        { material_name: "Tipper Tyres 10.00x20 (16PR)", quantity: 12, unit_price: 18500, taxes: 28, total: 284544 },
        { material_name: "Tyre Tubes 10.00x20", quantity: 12, unit_price: 1200, taxes: 28, total: 18432 },
        { material_name: "Flaps 10.00x20", quantity: 12, unit_price: 450, taxes: 28, total: 6912 }
      ]
    },
    {
      id: "quot_003b", rfq_id: "rfq_003", indent_id: "ind_003",
      vendor_name: "Apollo Tyres Distributor",
      submitted_at: "2026-06-21T16:00:00Z", delivery_days: 2,
      payment_terms: "Full advance",
      remarks: "Apollo AMAR tyres. Discount of 3% on full advance payment.",
      items: [
        { material_name: "Tipper Tyres 10.00x20 (16PR)", quantity: 12, unit_price: 17800, taxes: 28, total: 273869 },
        { material_name: "Tyre Tubes 10.00x20", quantity: 12, unit_price: 1150, taxes: 28, total: 17664 },
        { material_name: "Flaps 10.00x20", quantity: 12, unit_price: 420, taxes: 28, total: 6451 }
      ]
    },
    {
      id: "quot_003c", rfq_id: "rfq_003", indent_id: "ind_003",
      vendor_name: "CEAT Tyre Center Nagpur",
      submitted_at: "2026-06-22T09:30:00Z", delivery_days: 4,
      payment_terms: "30 days credit",
      remarks: "CEAT GRIPP XL. Credit facility available for WCL contractors.",
      items: [
        { material_name: "Tipper Tyres 10.00x20 (16PR)", quantity: 12, unit_price: 18200, taxes: 28, total: 279475 },
        { material_name: "Tyre Tubes 10.00x20", quantity: 12, unit_price: 1180, taxes: 28, total: 18125 },
        { material_name: "Flaps 10.00x20", quantity: 12, unit_price: 440, taxes: 28, total: 6758 }
      ]
    },
    {
      id: "quot_004a", rfq_id: "rfq_004", indent_id: "ind_004",
      vendor_name: "Castrol Authorised Dealer Nagpur",
      submitted_at: "2026-06-23T10:00:00Z", delivery_days: 2,
      payment_terms: "Immediate on delivery",
      remarks: "Castrol VECTON CF4. Recommended for Komatsu & Hitachi excavators.",
      items: [
        { material_name: "Engine Oil CF4 15W40", quantity: 100, unit_price: 320, taxes: 18, total: 37760 },
        { material_name: "Oil Filter (Excavator)", quantity: 5, unit_price: 850, taxes: 18, total: 5015 },
        { material_name: "Air Filter (Excavator)", quantity: 5, unit_price: 1200, taxes: 18, total: 7080 },
        { material_name: "Fuel Filter (Excavator)", quantity: 5, unit_price: 950, taxes: 18, total: 5605 }
      ]
    },
    {
      id: "quot_004b", rfq_id: "rfq_004", indent_id: "ind_004",
      vendor_name: "Gulf Oil Corporation Nagpur",
      submitted_at: "2026-06-23T13:00:00Z", delivery_days: 1,
      payment_terms: "7 days credit",
      remarks: "Gulf Supreme Duty Plus. Free delivery for orders above ₹25,000.",
      items: [
        { material_name: "Engine Oil CF4 15W40", quantity: 100, unit_price: 305, taxes: 18, total: 35990 },
        { material_name: "Oil Filter (Excavator)", quantity: 5, unit_price: 820, taxes: 18, total: 4838 },
        { material_name: "Air Filter (Excavator)", quantity: 5, unit_price: 1150, taxes: 18, total: 6785 },
        { material_name: "Fuel Filter (Excavator)", quantity: 5, unit_price: 920, taxes: 18, total: 5428 }
      ]
    }
  ],

  comparative_statements: [
    {
      id: "cs_001", indent_id: "ind_001",
      prepared_at: "2026-06-19T17:00:00Z",
      prepared_by: "Rahul (Ops Executive)",
      selected_vendor: "Indian Oil Corporation (Nagpur)",
      ops_remarks: "IOCL selected — lowest diesel price + fastest delivery (24hrs). Hydraulic oil slightly higher but overall best value.",
      status: "CONFIRMED"
    },
    {
      id: "cs_003", indent_id: "ind_003",
      prepared_at: "2026-06-22T11:00:00Z",
      prepared_by: "Rahul (Ops Executive)",
      selected_vendor: "Apollo Tyres Distributor",
      ops_remarks: "Apollo selected — lowest total cost by ~₹11,000 and 2-day delivery. Full advance acceptable given urgency.",
      status: "CONFIRMED"
    },
    {
      id: "cs_004", indent_id: "ind_004",
      prepared_at: "2026-06-23T15:00:00Z",
      prepared_by: "Rahul (Ops Executive)",
      selected_vendor: "Gulf Oil Corporation Nagpur",
      ops_remarks: "Gulf selected — better pricing across all items, 7-day credit is favorable for cash flow, free delivery.",
      status: "CONFIRMED"
    }
  ],

  approvals: [
    {
      id: "appr_001_L1", indent_id: "ind_001", level: "L1", status: "APPROVED",
      actioned_by: "Ajay (Finance Head)", actioned_at: "2026-06-20T09:30:00Z",
      remarks: "Approved. IOCL is the right choice, pricing aligns with market rate."
    },
    {
      id: "appr_001_L2", indent_id: "ind_001", level: "L2", status: "APPROVED",
      actioned_by: "Ajay (Director)", actioned_at: "2026-06-20T11:00:00Z",
      remarks: "Approved."
    },
    {
      id: "appr_003_L1", indent_id: "ind_003", level: "L1", status: "PENDING",
      actioned_by: null, actioned_at: null, remarks: null
    },
    {
      id: "appr_003_L2", indent_id: "ind_003", level: "L2", status: "PENDING",
      actioned_by: null, actioned_at: null, remarks: null
    },
    {
      id: "appr_004_L1", indent_id: "ind_004", level: "L1", status: "APPROVED",
      actioned_by: "Ajay (Finance Head)", actioned_at: "2026-06-24T10:00:00Z",
      remarks: "Approved. Gulf Oil credit terms are favorable."
    },
    {
      id: "appr_004_L2", indent_id: "ind_004", level: "L2", status: "APPROVED",
      actioned_by: "Ajay (Director)", actioned_at: "2026-06-24T14:30:00Z",
      remarks: "Approved. Proceed with PO immediately."
    }
  ],

  purchase_orders: [
    {
      id: "po_001", po_number: "PO-2026-001", indent_id: "ind_001",
      generated_at: "2026-06-20T12:00:00Z", status: "PO_SENT",
      selected_vendor: "Indian Oil Corporation (Nagpur)",
      vendor_email: "iocl.nagpur@indianoil.in",
      delivery_address: "Lokesh Infraproject, Adasa-2 Mine Site, Kamptee Road, Nagpur - 441202",
      payment_terms: "Immediate on delivery",
      special_instructions: "Deliver via tank lorry. Contact site supervisor Rajesh Kumar (9876543210) before arrival.",
      total_value: 524912,
      items: [
        { material_name: "HSD Diesel", quantity: 5000, unit: "Ltr", unit_price: 91.20, taxes: 0, total: 456000 },
        { material_name: "Hydraulic Oil 68", quantity: 200, unit: "Ltr", unit_price: 292, taxes: 18, total: 68912 }
      ]
    }
  ],

  grns: [
    {
      id: "grn_001",
      grn_number: "GRN-2026-001",
      po_id: "po_001",
      indent_id: "ind_001",
      site_name: "Adasa-2",
      received_by: "Rajesh Kumar (Site Manager)",
      created_at: "2026-06-21T10:30:00Z",
      confirmed_at: "2026-06-21T11:00:00Z",
      status: "CONFIRMED",
      vehicle_number: "MH-31-AB-1234",
      driver_name: "Ramesh Yadav",
      remarks: "Delivery complete. Tank lorry arrived on time.",
      items: [
        { material_name: "HSD Diesel", ordered_qty: 5000, received_qty: 5000, unit: "Ltr", condition: "GOOD" },
        { material_name: "Hydraulic Oil 68", ordered_qty: 200, received_qty: 185, unit: "Ltr", condition: "SHORT" }
      ]
    }
  ],

  inventory: [
    {
      id: "inv_001",
      site_name: "Adasa-2",
      material_name: "HSD Diesel",
      unit: "Ltr",
      total_received: 5000,
      allocated: 3200
    },
    {
      id: "inv_002",
      site_name: "Adasa-2",
      material_name: "Hydraulic Oil 68",
      unit: "Ltr",
      total_received: 185,
      allocated: 60
    }
  ],

  machine_allocations: [
    {
      id: "alloc_001",
      site_name: "Adasa-2",
      machine_id: "mach_001",
      machine_name: "CAT 374D Excavator",
      machine_type: "Excavator",
      material_name: "HSD Diesel",
      unit: "Ltr",
      quantity: 2000,
      allocated_at: "2026-06-21T12:00:00Z",
      allocated_by: "Rajesh Kumar (Site Manager)",
      notes: "Weekly fuel fill — Excavator #1"
    },
    {
      id: "alloc_002",
      site_name: "Adasa-2",
      machine_id: "mach_003",
      machine_name: "TATA Prima 2825K Tipper",
      machine_type: "Tipper",
      material_name: "HSD Diesel",
      unit: "Ltr",
      quantity: 1200,
      allocated_at: "2026-06-21T12:30:00Z",
      allocated_by: "Rajesh Kumar (Site Manager)",
      notes: "Fleet top-up — 3 tippers"
    },
    {
      id: "alloc_003",
      site_name: "Adasa-2",
      machine_id: "mach_001",
      machine_name: "CAT 374D Excavator",
      machine_type: "Excavator",
      material_name: "Hydraulic Oil 68",
      unit: "Ltr",
      quantity: 60,
      allocated_at: "2026-06-21T13:00:00Z",
      allocated_by: "Rajesh Kumar (Site Manager)",
      notes: "Hydraulic system top-up"
    }
  ],

  vendors: [
    { id: "v_001", name: "Bharat Petroleum (Nagpur)", email: "sales.nagpur@bpcl.in", phone: "9823456789", category: "Fuel & Lubricants", gst: "27AAACB0123A1Z5", rating: 4.2 },
    { id: "v_002", name: "Indian Oil Corporation (Nagpur)", email: "iocl.nagpur@indianoil.in", phone: "9845671234", category: "Fuel & Lubricants", gst: "27AAACI0234B1Z3", rating: 4.5 },
    { id: "v_003", name: "HP Petroleum Dealers", email: "hpdealer.nagpur@hpcl.com", phone: "9812345678", category: "Fuel & Lubricants", gst: "27AAACH0345C1Z1", rating: 3.8 },
    { id: "v_004", name: "Safetech Safety Equipments", email: "sales@safetech.in", phone: "9988776655", category: "Safety Equipment", gst: "27AAACS0456D1Z9", rating: 4.0 },
    { id: "v_005", name: "MRF Tyres (Nagpur Dealer)", email: "mrf.nagpur@dealer.com", phone: "9977665544", category: "Tyres & Tubes", gst: "27AAACM0567E1Z7", rating: 4.6 },
    { id: "v_006", name: "Apollo Tyres Distributor", email: "apollo.ngp@gmail.com", phone: "9966554433", category: "Tyres & Tubes", gst: "27AAACA0678F1Z5", rating: 4.3 },
    { id: "v_007", name: "CEAT Tyre Center Nagpur", email: "ceat.nagpur@gmail.com", phone: "9955443322", category: "Tyres & Tubes", gst: "27AAACC0789G1Z3", rating: 4.1 },
    { id: "v_008", name: "Castrol Authorised Dealer Nagpur", email: "castrol.ngp@dealer.in", phone: "9944332211", category: "Lubricants & Filters", gst: "27AAACL0890H1Z1", rating: 4.4 },
    { id: "v_009", name: "Gulf Oil Corporation Nagpur", email: "gulf.nagpur@gulfoil.in", phone: "9933221100", category: "Lubricants & Filters", gst: "27AAACG0901I1Z9", rating: 4.2 }
  ]
};

export const initializeApp = () => {
  if (!localStorage.getItem('hasSeeded')) {
    localStorage.setItem('indents', JSON.stringify(seedData.indents));
    localStorage.setItem('rfqs', JSON.stringify(seedData.rfqs));
    localStorage.setItem('quotations', JSON.stringify(seedData.quotations));
    localStorage.setItem('comparative_statements', JSON.stringify(seedData.comparative_statements));
    localStorage.setItem('approvals', JSON.stringify(seedData.approvals));
    localStorage.setItem('purchase_orders', JSON.stringify(seedData.purchase_orders));
    localStorage.setItem('vendors', JSON.stringify(seedData.vendors));
    localStorage.setItem('grns', JSON.stringify(seedData.grns));
    localStorage.setItem('inventory', JSON.stringify(seedData.inventory));
    localStorage.setItem('machine_allocations', JSON.stringify(seedData.machine_allocations));
    localStorage.setItem('hasSeeded', 'true');
    localStorage.setItem('hasSeededV2', 'true');
  }
  // Migration for existing installs — seed new collections without wiping existing data
  if (!localStorage.getItem('hasSeededV2')) {
    localStorage.setItem('grns', JSON.stringify(seedData.grns));
    localStorage.setItem('inventory', JSON.stringify(seedData.inventory));
    localStorage.setItem('machine_allocations', JSON.stringify(seedData.machine_allocations));
    // Update ind_001 status to GRN_DONE (GRN is confirmed for it)
    try {
      const indents = JSON.parse(localStorage.getItem('indents') || '[]');
      const updated = indents.map(i => i.id === 'ind_001' ? { ...i, status: 'GRN_DONE' } : i);
      localStorage.setItem('indents', JSON.stringify(updated));
    } catch {}
    localStorage.setItem('hasSeededV2', 'true');
  }
};

