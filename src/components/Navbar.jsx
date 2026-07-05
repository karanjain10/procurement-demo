import { useState, useRef, useEffect } from 'react';
import { Bell, Package, ChevronRight } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { useNavigate } from 'react-router-dom';

const ROLE_TITLES = {
  site_manager: 'Site Manager Portal',
  ops: 'Operations Dashboard',
  approver_l1: 'Approver L1 — Finance Head',
  approver_l2: 'Approver L2 — Director',
};

export const Navbar = ({ currentRole, onRoleChange, notifications = [] }) => {
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700 flex items-center px-6 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center shadow-glow-orange">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div className="hidden md:block">
          <div className="text-sm font-bold text-white leading-tight">ProcurePro</div>
          <div className="text-[10px] text-dark-400 leading-tight">Lokesh Infraproject</div>
        </div>
      </div>

      {/* Title */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-sm font-semibold text-dark-300 hidden sm:block">
          {ROLE_TITLES[currentRole]}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen(o => !o)}
            className="relative p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-all"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {Math.min(notifications.length, 9)}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-dark-800 border border-dark-600 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-in">
              <div className="px-4 py-3 border-b border-dark-700">
                <div className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
                  Notifications {notifications.length > 0 ? `(${notifications.length})` : ''}
                </div>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-dark-500">
                  No pending actions
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => { navigate(n.link); setBellOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-700 transition-colors border-b border-dark-700/50 last:border-0 text-left"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-dark-200 flex-1">{n.text}</span>
                      <ChevronRight className="w-4 h-4 text-dark-500 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Role switcher */}
        <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
      </div>
    </header>
  );
};
