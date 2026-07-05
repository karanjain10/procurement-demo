import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Send, Mail, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

const generateRFQEmail = (indent, vendors) => {
  const materialRows = indent.materials?.map(m =>
    `  - ${m.name}: ${m.quantity} ${m.unit} (Required by ${m.required_date})`
  ).join('\n');

  return `Dear [Vendor Name],

Greetings from Lokesh Infraproject!

We request your competitive quotation for the following materials required at ${indent.site_name} Mine Site:

Materials Required:
${materialRows}

Please submit your best quotation including:
• Unit prices with applicable taxes
• Delivery timeline (in days)
• Payment terms
• Any special conditions

Kindly revert with your quotation at your earliest convenience.

This RFQ Reference: ${indent.indent_number}
Date: ${new Date().toLocaleDateString('en-IN')}

Regards,
Rahul Sharma
Operations Executive
Lokesh Infraproject, Nagpur`;
};

export default function SendRFQ() {
  const location = useLocation();
  const navigate = useNavigate();
  const { indents, rfqs, createRFQ, updateIndentStatus, getRFQByIndentId } = useStore();
  const toast = useToast();

  // Indents that have been approved for RFQ (status = RFQ_SENT but no quotation stage yet)
  const rfqIndents = indents.filter(i => i.status === 'RFQ_SENT');

  const [selectedIndentId, setSelectedIndentId] = useState(location.state?.indentId || rfqIndents[0]?.id || '');
  const [vendors, setVendors] = useState([{ name: '', email: '' }]);
  const [emailText, setEmailText] = useState('');
  const [sent, setSent] = useState(false);

  const selectedIndent = indents.find(i => i.id === selectedIndentId);
  const existingRFQ = selectedIndentId ? getRFQByIndentId(selectedIndentId) : null;

  useEffect(() => {
    if (selectedIndent) {
      setEmailText(generateRFQEmail(selectedIndent, vendors));
      setSent(!!existingRFQ);
    }
  }, [selectedIndentId, selectedIndent]);

  const addVendor = () => {
    if (vendors.length < 5) setVendors(prev => [...prev, { name: '', email: '' }]);
  };
  const removeVendor = (idx) => setVendors(prev => prev.filter((_, i) => i !== idx));
  const updateVendor = (idx, field, value) => {
    setVendors(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const handleMarkSent = () => {
    const validVendors = vendors.filter(v => v.name && v.email);
    if (validVendors.length === 0) { toast('Add at least one vendor', 'error'); return; }
    if (!selectedIndentId) { toast('Select an indent', 'error'); return; }

    createRFQ({ indent_id: selectedIndentId, vendors_contacted: validVendors, status: 'SENT' });
    setSent(true);
    toast('RFQ marked as sent to all vendors!', 'success');
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-bold text-white">RFQ Management</h2>
        <p className="text-dark-400 text-sm mt-1">Send Request for Quotations to vendors</p>
      </div>

      {/* Indent selector */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Select Indent</h3>
        {rfqIndents.length === 0 ? (
          <div className="text-sm text-dark-500 py-4 text-center">
            No indents currently approved for RFQ. Review pending indents first.
          </div>
        ) : (
          <div className="grid gap-3">
            {rfqIndents.map(indent => {
              const rfq = getRFQByIndentId(indent.id);
              return (
                <button
                  key={indent.id}
                  onClick={() => { setSelectedIndentId(indent.id); setSent(!!rfq); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedIndentId === indent.id
                      ? 'border-primary bg-primary/10'
                      : 'border-dark-700 hover:border-dark-600 bg-dark-700/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono font-semibold text-primary">{indent.indent_number}</div>
                      <div className="text-xs text-dark-400 mt-0.5">{indent.site_name} · {indent.materials?.length} materials</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {rfq && <span className="text-xs text-green-400 font-medium">RFQ Sent</span>}
                      <StatusBadge status={indent.status} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedIndent && (
        <>
          {/* Indent Summary */}
          <div className="card p-6 space-y-3">
            <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Indent Summary — {selectedIndent.indent_number}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="table-header pl-0">Material</th>
                    <th className="table-header">Qty</th>
                    <th className="table-header">Unit</th>
                    <th className="table-header">Required By</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedIndent.materials?.map((m, i) => (
                    <tr key={i} className="border-b border-dark-700/50">
                      <td className="table-cell pl-0 font-medium">{m.name}</td>
                      <td className="table-cell">{m.quantity}</td>
                      <td className="table-cell">{m.unit}</td>
                      <td className="table-cell">{m.required_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendors */}
          {!sent && !existingRFQ && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Vendors to Contact</h3>
                <span className="text-xs text-dark-500">{vendors.length}/5 vendors</span>
              </div>

              <div className="space-y-3">
                {vendors.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-9 gap-3 items-center">
                    <div className="col-span-4">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Vendor Name"
                        value={v.name}
                        onChange={e => updateVendor(idx, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="email"
                        className="input-field"
                        placeholder="vendor@email.com"
                        value={v.email}
                        onChange={e => updateVendor(idx, 'email', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {vendors.length > 1 && (
                        <button onClick={() => removeVendor(idx)} className="p-1.5 text-dark-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {vendors.length < 5 && (
                <button onClick={addVendor} className="flex items-center gap-2 text-sm text-primary hover:text-primary-400 font-medium transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Another Vendor
                </button>
              )}
            </div>
          )}

          {/* Show existing RFQ vendors if already sent */}
          {existingRFQ && (
            <div className="card p-6 space-y-3">
              <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">Vendors Contacted</h3>
              <div className="grid gap-2">
                {existingRFQ.vendors_contacted?.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 bg-dark-700/30 rounded-lg px-3 py-2.5 border border-dark-700">
                    <Mail className="w-4 h-4 text-dark-400" />
                    <div>
                      <div className="text-sm font-medium text-dark-200">{v.name}</div>
                      <div className="text-xs text-dark-400">{v.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Preview */}
          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-dark-400" />
              <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">RFQ Email Preview (Editable)</h3>
            </div>
            <textarea
              className="input-field font-mono text-xs resize-none"
              rows={16}
              value={emailText}
              onChange={e => setEmailText(e.target.value)}
              readOnly={sent || !!existingRFQ}
            />
          </div>

          {/* Action */}
          {!sent && !existingRFQ && (
            <div className="flex justify-end">
              <button onClick={handleMarkSent} className="btn-primary gap-2 px-6">
                <Send className="w-4 h-4" />
                Mark RFQ as Sent
              </button>
            </div>
          )}

          {(sent || existingRFQ) && (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-green-400 font-medium">RFQ has been sent to all vendors</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
