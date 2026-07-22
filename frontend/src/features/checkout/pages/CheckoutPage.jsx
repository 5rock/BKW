import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import useCartStore from '@/store/cartStore';
import { createOrder, createPaymentIntent } from '@/services/api';
import Reveal from '@/components/ui/Reveal';
import SEO from '@/components/seo/SEO';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Lock from 'lucide-react/dist/esm/icons/lock';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';

// Use a fallback public key if env var is missing during dev (do NOT use this in production)
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx';
const stripePromise = loadStripe(STRIPE_PK);

const CheckoutForm = ({ clientSecret, orderId }) => {
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
      // The return_url handles success
      clearCart();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="mb-4" />
      <button
        disabled={!stripe || loading}
        className="w-full rounded-full bg-amber-300 py-4 font-black text-black transition hover:bg-amber-200 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      <p className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
        <Lock className="h-3 w-3" /> Payments are secure and encrypted
      </p>
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
  const shippingPrice = cartTotal > 150 ? 0 : 9.99;
  const totalPrice = cartTotal + taxPrice + shippingPrice;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create Order
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

      // 2. Create Payment Intent
      const { data: paymentData } = await createPaymentIntent({ orderId: newOrder._id });
      setClientSecret(paymentData.data.clientSecret);
      
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-page min-h-screen pb-20 pt-28">
      <SEO title="Secure Checkout" description="Complete your secure checkout." />
      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-8 flex items-center justify-between">
            <h1 className="theme-text text-3xl font-black md:text-4xl">Secure Checkout</h1>
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
          </div>

          {/* Stepper */}
          <div className="mb-10 flex items-center gap-4 text-sm font-bold">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-600 dark:text-amber-300' : 'theme-soft'}`}>
              <div className="grid h-6 w-6 place-items-center rounded-full border-2 border-current">1</div>
              Shipping
            </div>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-600 dark:text-amber-300' : 'theme-soft'}`}>
              <div className="grid h-6 w-6 place-items-center rounded-full border-2 border-current">2</div>
              Payment
            </div>
          </div>
        </Reveal>

        <div className="theme-card rounded-3xl p-6 sm:p-10 shadow-2xl">
          {step === 1 && (
            <Reveal delay={0.1}>
              <h2 className="theme-text mb-6 text-xl font-black">Shipping Details</h2>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="theme-text mb-1 block text-sm font-bold">Address</label>
                  <input
                    required
                    type="text"
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    className="theme-input w-full rounded-xl p-3"
                    placeholder="123 Market St"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="theme-text mb-1 block text-sm font-bold">City</label>
                    <input
                      required
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="theme-input w-full rounded-xl p-3"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="theme-text mb-1 block text-sm font-bold">Postal Code</label>
                    <input
                      required
                      type="text"
                      value={shipping.postalCode}
                      onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                      className="theme-input w-full rounded-xl p-3"
                      placeholder="10001"
                    />
                  </div>
                </div>
                <div>
                  <label className="theme-text mb-1 block text-sm font-bold">Country</label>
                  <input
                    required
                    type="text"
                    value={shipping.country}
                    onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                    className="theme-input w-full rounded-xl p-3"
                    placeholder="USA"
                  />
                </div>
                <div className="pt-6">
                  <button
                    disabled={loading}
                    className="w-full rounded-full bg-amber-300 py-4 font-black text-black transition hover:bg-amber-200 disabled:opacity-50"
                  >
                    {loading ? 'Creating Order...' : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            </Reveal>
          )}

          {step === 2 && clientSecret && (
            <Reveal delay={0.1}>
              <div className="mb-6 rounded-2xl border border-[var(--color-border)] p-4">
                <div className="flex items-center justify-between">
                  <span className="theme-soft text-sm font-bold">Total to pay</span>
                  <span className="theme-text text-xl font-black">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Elements options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#f5c552' } } }} stripe={stripePromise}>
                <CheckoutForm clientSecret={clientSecret} orderId={order._id} />
              </Elements>
            </Reveal>
          )}
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
