import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Users } from 'lucide-react';

export const ROLES = [
  { id: 'site_manager', label: 'Site Manager', subtitle: 'Raise & track indents', avatar: 'RK', color: 'bg-blue-500' },
  { id: 'ops', label: 'Rahul — Ops Executive', subtitle: 'Review, RFQ & PO management', avatar: 'RO', color: 'bg-purple-500' },
  { id: 'approver_l1', label: 'Ajay — Approver L1', subtitle: 'Finance Head approval', avatar: 'AJ', color: 'bg-amber-500' },
  { id: 'approver_l2', label: 'Ajay — Approver L2', subtitle: 'Director final approval', avatar: 'AD', color: 'bg-green-500' },
];

export const RoleSwitcher = ({ currentRole, onRoleChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const role = ROLES.find(r => r.id === currentRole) || ROLES[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 bg-dark-800 border border-dark-600 hover:border-primary/50 rounded-xl px-3 py-2 transition-all duration-200 hover:shadow-glow-orange group"
        title="Switch Role"
      >
        <div className={`w-7 h-7 rounded-lg ${role.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {role.avatar}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-semibold text-dark-100 leading-tight">{role.label}</div>
          <div className="text-[10px] text-dark-400 leading-tight">{role.subtitle}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-dark-800 border border-dark-600 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-in">
          <div className="px-4 py-3 border-b border-dark-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-dark-400 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              Switch Role (Demo)
            </div>
          </div>
          {ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => { onRoleChange(r.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-dark-700 transition-colors ${currentRole === r.id ? 'bg-primary/10' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl ${r.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                {r.avatar}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${currentRole === r.id ? 'text-primary' : 'text-dark-100'}`}>{r.label}</div>
                <div className="text-xs text-dark-400">{r.subtitle}</div>
              </div>
              {currentRole === r.id && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
