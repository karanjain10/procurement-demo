import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { useStore } from './store/useStore';

// Site Manager pages
import SMIndents from './pages/site-manager/SMIndents';
import RaiseIndent from './pages/site-manager/RaiseIndent';
import IndentDetail from './pages/site-manager/IndentDetail';

// Ops pages
import PendingIndents from './pages/ops/PendingIndents';
import SendRFQ from './pages/ops/SendRFQ';
import Quotations from './pages/ops/Quotations';
import ComparativeStatement from './pages/ops/ComparativeStatement';
import ApprovalsTracking from './pages/ops/ApprovalsTracking';
import PurchaseOrders from './pages/ops/PurchaseOrders';
import GRN from './pages/ops/GRN';

// Inventory pages
import SiteInventory from './pages/inventory/SiteInventory';

// Approver pages
import ApproverDashboard from './pages/approver/ApproverDashboard';

const ROLE_DEFAULT_ROUTES = {
  site_manager: '/site-manager',
  ops: '/ops/pending',
  approver_l1: '/approver-l1/pending',
  approver_l2: '/approver-l2/pending',
};

function App() {
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('currentRole') || 'site_manager');
  const navigate = useNavigate();
  const store = useStore();

  const notifications = store.getNotifications(currentRole);

  const handleRoleChange = (newRole) => {
    localStorage.setItem('currentRole', newRole);
    setCurrentRole(newRole);
    navigate(ROLE_DEFAULT_ROUTES[newRole] || '/');
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar currentRole={currentRole} onRoleChange={handleRoleChange} notifications={notifications} />
      <Sidebar currentRole={currentRole} />
      
      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-6">
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to={ROLE_DEFAULT_ROUTES[currentRole]} replace />} />

            {/* Site Manager routes */}
            <Route path="/site-manager" element={<SMIndents />} />
            <Route path="/site-manager/raise" element={<RaiseIndent />} />
            <Route path="/site-manager/indent/:id" element={<IndentDetail />} />
            <Route path="/site-manager/notifications" element={<NotificationsPage notifications={notifications} />} />
            <Route path="/site-manager/inventory" element={<SiteInventory />} />

            {/* Ops routes */}
            <Route path="/ops/pending" element={<PendingIndents />} />
            <Route path="/ops/rfq" element={<SendRFQ />} />
            <Route path="/ops/quotations" element={<Quotations />} />
            <Route path="/ops/comparative-statement" element={<ComparativeStatement />} />
            <Route path="/ops/approvals" element={<ApprovalsTracking />} />
            <Route path="/ops/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/ops/grn" element={<GRN />} />
            <Route path="/ops/inventory" element={<SiteInventory />} />

            {/* Approver L1 routes */}
            <Route path="/approver-l1/pending" element={<ApproverDashboard level="L1" />} />
            <Route path="/approver-l1/approved" element={<ApproverDashboard level="L1" />} />
            <Route path="/approver-l1/rejected" element={<ApproverDashboard level="L1" />} />

            {/* Approver L2 routes */}
            <Route path="/approver-l2/pending" element={<ApproverDashboard level="L2" />} />
            <Route path="/approver-l2/approved" element={<ApproverDashboard level="L2" />} />
            <Route path="/approver-l2/rejected" element={<ApproverDashboard level="L2" />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to={ROLE_DEFAULT_ROUTES[currentRole]} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// Simple notifications page for site manager
const NotificationsPage = ({ notifications }) => (
  <div className="space-y-4 animate-in">
    <h2 className="text-2xl font-bold text-white">Notifications</h2>
    {notifications.length === 0 ? (
      <div className="card p-12 text-center text-dark-500">No notifications</div>
    ) : (
      <div className="space-y-3">
        {notifications.map((n, i) => (
          <div key={i} className="card p-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm text-dark-200">{n.text}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default App;
