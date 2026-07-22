import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrderById } from '@/services/api';
import Reveal from '@/components/ui/Reveal';
import Package from 'lucide-react/dist/esm/icons/package';
import Truck from 'lucide-react/dist/esm/icons/truck';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import { money } from '@/utils/productUtils';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderById(id)
      .then((res) => setOrder(res.data.data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="theme-page min-h-screen pt-28">
        <div className="mx-auto max-w-4xl px-4 text-center">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="theme-page min-h-screen pt-28">
        <div className="mx-auto max-w-4xl px-4 text-center text-xl font-bold">Order not found</div>
      </div>
    );
  }

  return (
    <div className="theme-page min-h-screen pb-20 pt-28">
      <main className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-8">
            <h1 className="theme-text text-3xl font-black md:text-4xl">Order Details</h1>
            <p className="theme-muted mt-2 font-mono text-sm">Order #{order._id}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="theme-card rounded-3xl p-6">
                <h2 className="theme-text text-lg font-black mb-4">Items</h2>
                <div className="space-y-4">
                  {order.orderItems.map((item, i) => (
                    <div key={i} className="flex gap-4 items-center border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
                      <div className="h-20 w-20 bg-neutral-900 rounded-xl overflow-hidden shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="theme-text font-bold">{item.name}</p>
                        <p className="theme-soft text-sm mt-1">Qty: {item.qty} {item.selectedSize && `| Size: ${item.selectedSize}`} {item.selectedColor && `| Color: ${item.selectedColor}`}</p>
                      </div>
                      <div className="theme-text font-black">{money(item.price)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="theme-card rounded-3xl p-6">
                <h2 className="theme-text text-lg font-black mb-4">Shipping Address</h2>
                <p className="theme-text">{order.shippingAddress.address}</p>
                <p className="theme-text">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p className="theme-text">{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-6">
              <div className="theme-card rounded-3xl p-6">
                <h2 className="theme-text text-lg font-black mb-4">Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-8 w-8 place-items-center rounded-full ${order.isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {order.isPaid ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="theme-text font-bold text-sm">Payment</p>
                      <p className="theme-soft text-xs">{order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Pending'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`grid h-8 w-8 place-items-center rounded-full ${order.isDelivered ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {order.isDelivered ? <Package className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="theme-text font-bold text-sm">Delivery</p>
                      <p className="theme-soft text-xs">{order.isDelivered ? `Delivered ${new Date(order.deliveredAt).toLocaleDateString()}` : order.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="theme-card rounded-3xl p-6">
                <h2 className="theme-text text-lg font-black mb-4">Summary</h2>
                <div className="space-y-2 border-b border-[var(--color-border)] pb-4 mb-4 text-sm">
                  <div className="flex justify-between"><span className="theme-muted">Items</span><span className="theme-text font-medium">{money(order.totalPrice - order.taxPrice - order.shippingPrice)}</span></div>
                  <div className="flex justify-between"><span className="theme-muted">Shipping</span><span className="theme-text font-medium">{money(order.shippingPrice)}</span></div>
                  <div className="flex justify-between"><span className="theme-muted">Tax</span><span className="theme-text font-medium">{money(order.taxPrice)}</span></div>
                </div>
                <div className="flex justify-between items-end">
                  <span className="theme-text font-bold">Total</span>
                  <span className="theme-text font-black text-2xl">{money(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  );
};

export default OrderDetailsPage;
