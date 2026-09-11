import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminInventory } from './AdminInventory';
import { AdminCoupons } from './AdminCoupons';
import { AdminCustomers } from './AdminCustomers';
import { AdminReviews } from './AdminReviews';
import { AdminSupport } from './AdminSupport';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminSettings } from './AdminSettings';
import { useAuth } from '../../context/AuthContext';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { user } = useAuth();

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <AdminDashboard onNavigate={setActiveTab} />}
      {activeTab === 'products' && <AdminProducts />}
      {activeTab === 'orders' && <AdminOrders />}
      {activeTab === 'inventory' && <AdminInventory />}
      {activeTab === 'coupons' && <AdminCoupons />}
      {activeTab === 'customers' && <AdminCustomers />}
      {activeTab === 'reviews' && <AdminReviews />}
      {activeTab === 'support' && <AdminSupport />}
      {activeTab === 'audit' && <AdminAuditLogs />}
      {activeTab === 'settings' && <AdminSettings />}
    </AdminLayout>
  );
};
