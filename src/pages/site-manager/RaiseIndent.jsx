import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Send } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/Toast';

const SITES = ['Adasa-2', 'Adasa-3'];
const UNITS = ['Nos', 'Kg', 'Ltr', 'Bag', 'MT'];

const emptyMaterial = () => ({ name: '', quantity: '', unit: 'Nos', required_date: '' });

export default function RaiseIndent() {
  const navigate = useNavigate();
  const { createIndent } = useStore();
  const toast = useToast();

  const [form, setForm] = useState({
    site_name: 'Adasa-2',
    remarks: '',
    materials: [emptyMaterial()],
  });
  const [submitting, setSubmitting] = useState(false);

  const updateMaterial = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      materials: prev.materials.map((m, i) => i === idx ? { ...m, [field]: value } : m)
    }));
  };

  const addMaterial = () => {
    setForm(prev => ({ ...prev, materials: [...prev.materials, emptyMaterial()] }));
  };

  const removeMaterial = (idx) => {
    setForm(prev => ({ ...prev, materials: prev.materials.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate
    if (!form.site_name) { toast('Please select a site', 'error'); return; }
    if (form.materials.some(m => !m.name || !m.quantity || !m.required_date)) {
      toast('Please fill all material fields', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const indent = createIndent({
        site_name: form.site_name,
        remarks: form.remarks,
        materials: form.materials.map(m => ({ ...m, quantity: Number(m.quantity) })),
        created_by: 'Rajesh Kumar (Site Manager)',
      });
      toast(`Indent ${indent.indent_number} raised successfully!`, 'success');
      navigate('/site-manager');
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/site-manager')} className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Raise New Indent</h2>
          <p className="text-dark-400 text-sm">Submit a material requisition for site</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site selection */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-dark-200 uppercase tracking-wide">Indent Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Site Name *</label>
              <select
                className="select-field"
                value={form.site_name}
                onChange={e => setForm(prev => ({ ...prev, site_name: e.target.value }))}
              >
                {SITES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Remarks / Notes</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Additional notes or urgency details..."
              value={form.remarks}
              onChange={e => setForm(prev => ({ ...prev, remarks: e.target.value }))}
            />
          </div>
        </div>

        {/* Materials */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-dark-200 uppercase tracking-wide">
              Materials <span className="text-primary">({form.materials.length})</span>
            </h3>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 px-1">
            <div className="col-span-4 label mb-0">Material Name</div>
            <div className="col-span-2 label mb-0">Quantity</div>
            <div className="col-span-2 label mb-0">Unit</div>
            <div className="col-span-3 label mb-0">Required By</div>
            <div className="col-span-1" />
          </div>

          <div className="space-y-3">
            {form.materials.map((mat, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-dark-700/30 rounded-xl p-3 border border-dark-700">
                <div className="col-span-4">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. HSD Diesel"
                    value={mat.name}
                    onChange={e => updateMaterial(idx, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    className="input-field"
                    placeholder="0"
                    min="0"
                    value={mat.quantity}
                    onChange={e => updateMaterial(idx, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <select
                    className="select-field"
                    value={mat.unit}
                    onChange={e => updateMaterial(idx, 'unit', e.target.value)}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="date"
                    className="input-field"
                    value={mat.required_date}
                    onChange={e => updateMaterial(idx, 'required_date', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-1 flex justify-center pt-1">
                  {form.materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(idx)}
                      className="p-1.5 text-dark-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMaterial}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary-400 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another Material
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <button type="button" onClick={() => navigate('/site-manager')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Indent'}
          </button>
        </div>
      </form>
    </div>
  );
}
