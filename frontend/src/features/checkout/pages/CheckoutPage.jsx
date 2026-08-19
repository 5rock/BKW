import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import useCartStore from '@/store/cartStore';
import { createOrder, createPaymentIntent } from '@/services/api';
import { ShieldCheck, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// Use a fallback public key if env var is missing during dev (do NOT use this in production)
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx';
const stripePromise = loadStripe(STRIPE_PK);

const CheckoutForm = ({ clientSecret, orderId, totalPrice }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const clearCart = useCartStore((s) => s.clearCart);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}`,
      },
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      setLoading(false);
    } else {
      clearCart();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-bg-primary rounded-2xl p-6 border border-surface-border">
        <PaymentElement className="mb-4" />
      </div>
      <button
        disabled={!stripe || loading}
        className="luxury-button w-full justify-center flex items-center gap-2"
      >
        {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
        <Lock size={14} />
      </button>
      <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">
        <Lock size={12} />
        <span>Secured by Stripe &middot; 256-bit SSL</span>
      </div>
    </form>
  );
};

const CheckoutPage = () => {
  const cartItems = useCartStore((s) => s.cartItems);
  const cartTotal = useCartStore((s) => s.cartTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState({ address: '', city: '', postalCode: '', country: '' });
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && step === 1) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems, navigate, step]);

  const taxPrice = cartTotal * 0.08;
  const shippingPrice = cartTotal > 150 ? 0 : 25;
  const totalPrice = cartTotal + taxPrice + shippingPrice;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderPayload = {
        orderItems: cartItems.map((i) => ({
          product: i.productId,
          name: i.title,
          qty: i.quantity,
          price: i.price,
          image: i.image,
          seller: i.seller,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor,
        })),
        shippingAddress: shipping,
        paymentMethod: 'Stripe',
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const { data: orderData } = await createOrder(orderPayload);
      const newOrder = orderData.data.order;
      setOrder(newOrder);
      
      // Fetch Payment Intent
      try {
        const { data: intentData } = await createPaymentIntent({ amount: totalPrice, orderId: newOrder._id });
        if (intentData.clientSecret) {
          setClientSecret(intentData.clientSecret);
          setStep(2);
        } else {
           // Fallback to simulated checkout if payment intents fail (for demo)
           toast.success('Order created. Proceeding to simulation...');
           setStep(2);
        }
      } catch (err) {
         console.warn("Payment Intent failed (likely no Stripe secret set in backend), falling back to demo mode", err);
         setStep(2); // Still proceed to step 2 to allow demo UI
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-24">
      <Helmet>
        <title>Secure Checkout - GoldMarket</title>
      </Helmet>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        <div className="flex items-center justify-between mb-12">
          <Link to="/cart" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-color-gold transition-colors">
            <ArrowLeft size={16} /> Return to Bag
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
            <ShieldCheck size={16} className="text-color-gold" /> Secure Checkout
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-20">
          
          {/* Left Column: Form Steps */}
          <div>
            <h1 className="text-display text-4xl text-text-primary mb-12">Checkout</h1>
            
            {/* Stepper */}
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] mb-12">
              <div className={`flex items-center gap-3 transition-colors ${step >= 1 ? 'text-text-primary' : 'text-text-muted'}`}>
                <div className={`w-6 h-6 flex items-center justify-center rounded-full border ${step > 1 ? 'bg-color-gold border-color-gold text-bg-primary' : 'border-current'}`}>
                  {step > 1 ? <CheckCircle2 size={12} /> : '1'}
                </div>
                Shipping
              </div>
              <div className="w-12 h-px bg-surface-border" />
              <div className={`flex items-center gap-3 transition-colors ${step >= 2 ? 'text-text-primary' : 'text-text-muted'}`}>
                <div className={`w-6 h-6 flex items-center justify-center rounded-full border border-current`}>
                  2
                </div>
                Payment
              </div>
            </div>

            {/* Step 1: Shipping */}
            {step === 1 && (
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <h2 className="text-lg font-medium text-text-primary mb-6 border-b border-surface-border pb-4">Shipping Destination</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Street Address</label>
                    <input
                      id="address"
                      required
                      type="text"
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      className="w-full bg-surface-primary border border-surface-border rounded-xl p-4 text-sm text-text-primary focus:border-color-gold outline-none transition-colors"
                      placeholder="123 Luxury Avenue, Suite 400"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">City</label>
                      <input
                        id="city"
                        required
                        type="text"
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                        className="w-full bg-surface-primary border border-surface-border rounded-xl p-4 text-sm text-text-primary focus:border-color-gold outline-none transition-colors"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Postal Code</label>
                      <input
                        id="postalCode"
                        required
                        type="text"
                        value={shipping.postalCode}
                        onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                        className="w-full bg-surface-primary border border-surface-border rounded-xl p-4 text-sm text-text-primary focus:border-color-gold outline-none transition-colors"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Country</label>
                    <input
                      id="country"
                      required
                      type="text"
                      value={shipping.country}
                      onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                      className="w-full bg-surface-primary border border-surface-border rounded-xl p-4 text-sm text-text-primary focus:border-color-gold outline-none transition-colors"
                      placeholder="United States"
                    />
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    disabled={loading}
                    className="luxury-button w-full md:w-auto"
                  >
                    {loading ? 'Securing Order...' : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div>
                 <h2 className="text-lg font-medium text-text-primary mb-6 border-b border-surface-border pb-4">Payment Method</h2>
                 {clientSecret ? (
                   <Elements options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#C9A227', colorBackground: '#111111', colorText: '#ffffff' } } }} stripe={stripePromise}>
                     <CheckoutForm clientSecret={clientSecret} orderId={order._id} totalPrice={totalPrice} />
                   </Elements>
                 ) : (
                   <div className="bg-surface-primary border border-surface-border p-8 rounded-2xl text-center">
                      <p className="text-text-primary mb-6">Payment intent unavailable. Demo mode active.</p>
                      <button type="button" onClick={() => { clearCart(); navigate('/orders/' + order._id); }} className="luxury-button">
                        Simulate Successful Payment
                      </button>
                   </div>
                 )}
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <aside>
            <div className="bg-surface-primary border border-surface-border rounded-[2rem] p-8 sticky top-32">
              <h3 className="text-display text-xl text-text-primary mb-6">Order Details</h3>
              
              <div className="space-y-4 mb-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                     <div className="w-16 h-16 rounded-xl bg-bg-primary overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex flex-col justify-center flex-grow">
                        <p className="text-xs text-text-primary font-bold line-clamp-1">{item.title}</p>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                     </div>
                     <div className="flex items-center text-sm text-text-primary">
                        ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                     </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-surface-border pt-6 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="text-text-primary">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Taxes (8%)</span>
                  <span className="text-text-primary">${taxPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span className="text-text-primary">${shippingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-surface-border flex justify-between items-end">
                <span className="text-text-primary font-bold">Total</span>
                <span className="text-3xl text-text-primary font-light tracking-tight">${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
