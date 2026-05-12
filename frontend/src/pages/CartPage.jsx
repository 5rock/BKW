import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, ArrowLeft, Tag } from 'lucide-react';

const CartPage = () => {
  const { cartItems, savedItems, cartTotal, loading } = useCart();
  const { user } = useAuth();

  const tax = cartTotal * 0.08;
  const shipping = cartTotal > 150 ? 0 : 9.99;
  const grandTotal = cartTotal > 0 ? cartTotal + tax + shipping : 0;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pt-28 pb-20">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-text-light dark:text-text-dark tracking-tight">Shopping Cart</h1>
          {!user && <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">Guest cart</span>}
          {cartItems.length > 0 && (
            <span className="bg-gray-200 dark:bg-gray-800 text-text-light dark:text-text-dark text-sm font-bold px-3 py-1 rounded-full">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="flex-grow space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-40 animate-pulse" />
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2">Your cart is empty</h3>
                <p className="text-text-muted-light dark:text-text-muted-dark mb-8 max-w-sm">Looks like you haven't added anything to your cart yet. Discover something amazing today!</p>
                <Link to="/products" className="bg-brand-yellow text-text-light font-bold px-10 py-4 rounded-full hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-md">
                  Start Shopping
                </Link>
              </motion.div>
            ) : (
              <motion.div layout className="space-y-4">
                <AnimatePresence>
                  {cartItems.map((item) => <CartItem key={item.id} item={item} />)}
                </AnimatePresence>
              </motion.div>
            )}

            {!loading && cartItems.length > 0 && (
              <div className="pt-8">
                <Link to="/products" className="inline-flex items-center gap-2 font-bold text-text-light dark:text-text-dark hover:text-brand-yellow dark:hover:text-brand-yellow transition-colors group">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  Continue Shopping
                </Link>
              </div>
            )}

            {!loading && savedItems.length > 0 && (
              <div className="pt-8">
                <h2 className="mb-4 text-2xl font-black text-text-light dark:text-white">Saved for Later</h2>
                <div className="space-y-4">
                  {savedItems.map((item) => <CartItem key={item.id} item={item} />)}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <aside className="w-full lg:w-[420px] flex-shrink-0">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-800 sticky top-32">
                <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-text-dark">Order Summary</h2>

                {/* Promo Code */}
                <div className="flex gap-2 mb-8 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-brand-yellow transition-all">
                  <Tag className="h-5 w-5 text-gray-400 self-center ml-2" />
                  <input
                    type="text"
                    placeholder="Promo Code"
                    className="flex-grow bg-transparent border-none px-2 py-2 text-sm focus:outline-none dark:text-white placeholder-gray-400"
                  />
                  <button className="bg-text-light dark:bg-white text-white dark:text-text-light px-4 rounded-lg text-sm font-bold hover:bg-black transition-colors shrink-0">
                    Apply
                  </button>
                </div>

                <div className="space-y-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                  <div className="flex justify-between text-text-muted-light dark:text-text-muted-dark">
                    <span>Subtotal</span>
                    <span className="font-medium text-text-light dark:text-text-dark">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-text-muted-light dark:text-text-muted-dark">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-medium text-text-light dark:text-text-dark">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted-light dark:text-text-muted-dark">Shipping</span>
                    {shipping === 0
                      ? <span className="text-green-500 font-bold">FREE</span>
                      : <span className="font-medium text-text-light dark:text-text-dark">${shipping.toFixed(2)}</span>
                    }
                  </div>
                </div>

                <div className="py-6">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-text-light dark:text-text-dark">Total</span>
                    <span className="font-black text-3xl text-text-light dark:text-text-dark">${grandTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-2 text-right">Inclusive of all taxes and fees</p>
                </div>

                <button className="w-full bg-brand-yellow text-text-light py-4 rounded-full font-black text-lg flex items-center justify-center gap-2 hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] active:scale-95 transition-all group">
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-8 space-y-4 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  {[
                    { icon: ShieldCheck, text: 'Secure 256-bit SSL encrypted payments' },
                    { icon: Truck, text: 'Free delivery on orders over $150' },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center gap-3 text-text-muted-light dark:text-text-muted-dark text-sm">
                        <Icon className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="font-medium">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default CartPage;
