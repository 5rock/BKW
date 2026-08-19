import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, Package, ShoppingBag, DollarSign, Activity, ShieldAlert } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/services/api';
import { money } from '@/utils/productUtils';
import { Helmet } from 'react-helmet-async';

const AdminDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } catch (err) {
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    if (user?.isAdmin) {
      fetchStats();
    }
  }, [user]);

  if (!user?.isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-24">
      <Helmet>
        <title>Director Command Center - GoldMarket</title>
      </Helmet>

      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 border-b border-surface-border pb-8">
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-color-gold mb-3">Director Operations</p>
           <h1 className="text-display text-4xl text-text-primary tracking-tight">Marketplace Command Center</h1>
           <p className="mt-4 text-sm text-text-secondary">Overview of GoldMarket operations and financial metrics.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-surface-primary border border-surface-border animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-950/20 p-8 flex items-center gap-4 text-red-400">
             <ShieldAlert size={24} />
             <div>
                <h3 className="font-bold">System Error</h3>
                <p className="text-sm">{error}</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-surface-primary border border-surface-border rounded-3xl p-8 relative overflow-hidden group hover:border-color-gold/50 transition-colors">
              <div className="relative z-10">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4">Active Clients</p>
                 <h3 className="text-display text-4xl text-text-primary mb-2">{stats?.totalUsers || 0}</h3>
              </div>
              <Users size={80} className="absolute -right-4 -bottom-4 text-bg-primary group-hover:text-surface-border transition-colors duration-500" />
            </div>

            <div className="bg-surface-primary border border-surface-border rounded-3xl p-8 relative overflow-hidden group hover:border-color-gold/50 transition-colors">
              <div className="relative z-10">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4">Total Inventory</p>
                 <h3 className="text-display text-4xl text-text-primary mb-2">{stats?.totalProducts || 0}</h3>
              </div>
              <Package size={80} className="absolute -right-4 -bottom-4 text-bg-primary group-hover:text-surface-border transition-colors duration-500" />
            </div>

            <div className="bg-surface-primary border border-surface-border rounded-3xl p-8 relative overflow-hidden group hover:border-color-gold/50 transition-colors">
              <div className="relative z-10">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4">Transactions</p>
                 <h3 className="text-display text-4xl text-text-primary mb-2">{stats?.totalOrders || 0}</h3>
              </div>
              <ShoppingBag size={80} className="absolute -right-4 -bottom-4 text-bg-primary group-hover:text-surface-border transition-colors duration-500" />
            </div>

            <div className="bg-surface-primary border border-surface-border rounded-3xl p-8 relative overflow-hidden group hover:border-color-gold/50 transition-colors">
              <div className="relative z-10">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4">Gross Volume</p>
                 <h3 className="text-display text-4xl text-text-primary mb-2">{money(stats?.totalRevenue || 0)}</h3>
              </div>
              <DollarSign size={80} className="absolute -right-4 -bottom-4 text-bg-primary group-hover:text-surface-border transition-colors duration-500" />
            </div>
          </div>
        )}

        <div className="mt-12 bg-surface-primary border border-surface-border rounded-3xl p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-color-gold to-transparent opacity-30" />
           <Activity size={32} className="mx-auto text-color-gold mb-6" />
           <h3 className="text-display text-2xl text-text-primary mb-4">System Operational</h3>
           <p className="text-text-secondary max-w-md mx-auto">Advanced administration modules (Client Management, Transaction Audits, Logistics Routing) will be exposed in subsequent system updates.</p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
