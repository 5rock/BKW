import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrderById } from '@/services/api';
import { Package, Truck, CheckCircle2, Clock, Check, ArrowLeft, Receipt, ShieldCheck } from 'lucide-react';
import { money } from '@/utils/productUtils';
import { Helmet } from 'react-helmet-async';

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
      <div className="min-h-screen bg-bg-primary pt-32 pb-24">
        <div className="max-w-[1000px] mx-auto px-4 text-center">
           <div className="w-8 h-8 border-2 border-color-gold border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center pt-24 px-4">
        <div className="text-center">
           <h1 className="text-display text-4xl text-text-primary mb-4">Order Not Found</h1>
           <p className="text-text-secondary mb-8">We could not locate this order in our system.</p>
           <Link to="/products" className="luxury-button">Return to Collections</Link>
        </div>
      </div>
    );
  }

  // Determine timeline steps
  const steps = [
    { 
       id: 'placed', 
       title: 'Order Placed', 
       date: order.createdAt, 
       completed: true, 
       icon: Receipt 
    },
    { 
       id: 'paid', 
       title: 'Payment Secured', 
       date: order.paidAt, 
       completed: order.isPaid, 
       icon: ShieldCheck 
    },
    { 
       id: 'dispatched', 
       title: 'Dispatched', 
       date: order.dispatchedAt, // Assuming backend might have this, if not we fake it based on status
       completed: order.status === 'Dispatched' || order.status === 'Shipped' || order.isDelivered, 
       icon: Package 
    },
    { 
       id: 'delivered', 
       title: 'Delivered', 
       date: order.deliveredAt, 
       completed: order.isDelivered, 
       icon: CheckCircle2 
    }
  ];

  const currentStepIndex = steps.findLastIndex(s => s.completed);

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-24">
      <Helmet>
        <title>Order {order._id.substring(0, 8)} - GoldMarket</title>
      </Helmet>

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6">
        
        <div className="mb-12">
          <Link to="/orders" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary hover:text-color-gold transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Order History
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-border pb-6">
            <div>
              <h1 className="text-display text-4xl text-text-primary mb-2">Order Details</h1>
              <p className="text-xs font-mono tracking-widest text-text-muted uppercase">Ref: {order._id}</p>
            </div>
            <div className="text-left md:text-right">
               <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">Total</p>
               <p className="text-2xl text-text-primary font-light">{money(order.totalPrice)}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">
          
          {/* Main Content */}
          <div className="space-y-12">
            
            {/* Tracking Timeline */}
            <section className="bg-surface-primary border border-surface-border rounded-3xl p-8 lg:p-10">
               <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-10">Tracking Status</h2>
               
               <div className="relative pl-4 md:pl-8">
                 {/* Vertical connecting line */}
                 <div className="absolute left-[27px] md:left-[43px] top-4 bottom-8 w-px bg-surface-border" />
                 
                 <div className="space-y-10">
                   {steps.map((step, idx) => {
                     const isCompleted = step.completed;
                     const isCurrent = idx === currentStepIndex;
                     const Icon = step.icon;
                     
                     return (
                       <div key={step.id} className="relative flex items-start gap-6">
                         {/* Marker */}
                         <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 bg-bg-primary transition-colors duration-500 ${isCompleted ? 'border-color-gold text-color-gold' : 'border-surface-border text-text-muted'}`}>
                           {isCompleted && !isCurrent ? (
                             <Check size={16} strokeWidth={3} />
                           ) : (
                             <Icon size={16} className={isCurrent ? 'animate-pulse' : ''} />
                           )}
                         </div>
                         
                         {/* Content */}
                         <div className="pt-2">
                           <h3 className={`text-base font-medium mb-1 transition-colors ${isCompleted ? 'text-text-primary' : 'text-text-muted'}`}>
                             {step.title}
                           </h3>
                           {step.date ? (
                             <p className="text-xs text-text-secondary uppercase tracking-widest">
                               {new Date(step.date).toLocaleDateString()} {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                           ) : (
                             <p className="text-[10px] text-text-muted uppercase tracking-widest">Pending</p>
                           )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
            </section>

            {/* Order Items */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-6 border-b border-surface-border pb-4">Acquired Pieces</h2>
              <div className="space-y-6">
                {order.orderItems.map((item, i) => (
                  <div key={i} className="flex gap-6 items-center p-4 bg-surface-primary border border-surface-border rounded-2xl group">
                    <div className="h-24 w-24 bg-bg-primary rounded-xl overflow-hidden shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-sm font-bold text-text-primary tracking-wide mb-1 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-text-secondary uppercase tracking-widest mb-3">
                        Qty: {item.qty} {item.selectedSize && `| Size: ${item.selectedSize}`} {item.selectedColor && `| Color: ${item.selectedColor}`}
                      </p>
                      <p className="text-text-primary font-light">{money(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            
            <div className="bg-surface-primary border border-surface-border rounded-3xl p-8">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary mb-6">Delivery Destination</h2>
              <div className="text-sm text-text-primary leading-relaxed">
                <p className="font-medium">{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p className="uppercase tracking-widest text-[10px] mt-2 text-text-secondary font-bold">{order.shippingAddress.country}</p>
              </div>
            </div>

            <div className="bg-surface-primary border border-surface-border rounded-3xl p-8">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary mb-6">Transaction Summary</h2>
              
              <div className="space-y-4 border-b border-surface-border pb-6 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary font-medium">{money(order.totalPrice - order.taxPrice - order.shippingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Tax</span>
                  <span className="text-text-primary font-medium">{money(order.taxPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping</span>
                  <span className="text-text-primary font-medium">{money(order.shippingPrice)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <span className="text-text-primary font-bold">Total Settled</span>
                <span className="text-text-primary font-light text-2xl">{money(order.totalPrice)}</span>
              </div>
            </div>

          </aside>

        </div>
      </main>
    </div>
  );
};

export default OrderDetailsPage;
