import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '@/services/api';
import Reveal from '@/components/ui/Reveal';
import SEO from '@/components/seo/SEO';
import Package from 'lucide-react/dist/esm/icons/package';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { money } from '@/utils/productUtils';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then((res) => setOrders(res.data.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="theme-page min-h-screen pb-20 pt-28">
      <SEO title="Order History" description="View your past orders and tracking statuses." />
      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-8 flex items-center justify-between">
            <h1 className="theme-text text-3xl font-black tracking-tight md:text-4xl">Order History</h1>
            <div className="theme-card-strong flex h-12 w-12 items-center justify-center rounded-full">
              <Package className="h-5 w-5 text-amber-500" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="theme-card h-24 w-full rounded-2xl overflow-hidden"><div className="shimmer h-full w-full" /></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="theme-card rounded-3xl py-16 text-center shadow-lg">
              <h3 className="theme-text text-xl font-bold">No orders yet</h3>
              <p className="theme-muted mt-2">When you place an order, it will appear here.</p>
              <Link to="/products" className="mt-6 inline-block rounded-full bg-amber-300 px-8 py-3 font-black text-black transition hover:bg-amber-200">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="theme-card group flex flex-col justify-between gap-4 rounded-2xl p-6 transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-xl sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="theme-text font-black text-lg">Order #{order._id.slice(-6)}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                        order.isDelivered ? 'bg-emerald-500/20 text-emerald-400' :
                        order.isPaid ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-500'
                      }`}>
                        {order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Unpaid'}
                      </span>
                    </div>
                    <p className="theme-muted mt-1 text-sm">{new Date(order.createdAt).toLocaleDateString()} • {order.orderItems.length} items</p>
                  </div>
                  <div className="flex items-center justify-between gap-6 sm:justify-end">
                    <p className="theme-text text-xl font-black">{money(order.totalPrice)}</p>
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-black/5 dark:bg-white/5 text-[var(--color-text)] transition group-hover:bg-amber-300 group-hover:text-black">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Reveal>
      </main>
    </div>
  );
};

export default OrderHistoryPage;
