import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, Bell,
  ClipboardList, Send, Quote, BarChart2, ShoppingBag, CheckSquare,
  ThumbsUp, ThumbsDown, FileCheck, PackageCheck, Warehouse,
} from 'lucide-react';

const SIDEBAR_LINKS = {
  site_manager: [
    { to: '/site-manager', icon: LayoutDashboard, label: 'My Indents', end: true },
    { to: '/site-manager/raise', icon: PlusCircle, label: 'Raise New Indent' },
    { to: '/site-manager/notifications', icon: Bell, label: 'Notifications' },
    { divider: true, label: 'Inventory' },
    { to: '/site-manager/inventory', icon: Warehouse, label: 'Site Inventory' },
  ],
  ops: [
    { to: '/ops/pending', icon: ClipboardList, label: 'Pending Indents' },
    { to: '/ops/rfq', icon: Send, label: 'RFQ Management' },
    { to: '/ops/quotations', icon: Quote, label: 'Quotations' },
    { to: '/ops/approvals', icon: CheckSquare, label: 'Approvals' },
    { to: '/ops/purchase-orders', icon: ShoppingBag, label: 'Purchase Orders' },
    { divider: true, label: 'Inventory' },
    { to: '/ops/grn', icon: PackageCheck, label: 'GRN Management' },
    { to: '/ops/inventory', icon: Warehouse, label: 'Site Inventory' },
  ],
  approver_l1: [
    { to: '/approver-l1/pending', icon: FileText, label: 'Pending Approvals' },
    { to: '/approver-l1/approved', icon: ThumbsUp, label: 'Approved' },
    { to: '/approver-l1/rejected', icon: ThumbsDown, label: 'Rejected' },
  ],
  approver_l2: [
    { to: '/approver-l2/pending', icon: FileText, label: 'Pending Approvals' },
    { to: '/approver-l2/approved', icon: ThumbsUp, label: 'Approved' },
    { to: '/approver-l2/rejected', icon: ThumbsDown, label: 'Rejected' },
  ],
};

const ROLE_LABELS = {
  site_manager: { title: 'Site Manager', subtitle: 'Rajesh Kumar' },
  ops: { title: 'Ops Executive', subtitle: 'Rahul Sharma' },
  approver_l1: { title: 'Approver L1', subtitle: 'Ajay — Finance Head' },
  approver_l2: { title: 'Approver L2', subtitle: 'Ajay — Director' },
};

export const Sidebar = ({ currentRole }) => {
  const links = SIDEBAR_LINKS[currentRole] || [];
  const roleInfo = ROLE_LABELS[currentRole] || {};

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 bg-dark-900 border-r border-dark-700 flex flex-col z-30">
      {/* Role info */}
      <div className="px-4 py-4 border-b border-dark-700">
        <div className="text-xs font-semibold text-primary uppercase tracking-wider">{roleInfo.title}</div>
        <div className="text-sm text-dark-300 mt-0.5">{roleInfo.subtitle}</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link, i) =>
          link.divider ? (
            <div key={`divider-${i}`} className="pt-4 pb-1">
              <div className="text-[10px] font-semibold text-dark-600 uppercase tracking-widest px-2">
                {link.label}
              </div>
            </div>
          ) : (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <link.icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          )
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-dark-700">
        <div className="text-[10px] text-dark-600 text-center">
          ProcurePro v1.0 — Demo Build
        </div>
      </div>
    </aside>
  );
};
