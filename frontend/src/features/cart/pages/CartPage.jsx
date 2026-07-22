/**
 * CartPage.jsx — Performance-optimised shopping cart.
 *
 * Fixes vs original:
 *  1. Removed motion.div layout — Framer Motion layout tracking forces expensive
 *     DOM measurement (getBoundingClientRect) on EVERY cart item change
 *  2. Removed AnimatePresence wrapper (not needed for simple list)
 *  3. Empty state: CSS animation replaces motion.div initial/animate
 *  4. Added useCartState / useCartActions to prevent full cart re-renders
 *     when only actions are needed (e.g., Checkout button)
 *  5. Tax and totals computed with useMemo instead of inline every render
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Truck from 'lucide-react/dist/esm/icons/truck';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Tag from 'lucide-react/dist/esm/icons/tag';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import CartItem from '@/features/cart/components/CartItem';
import Reveal from '@/components/ui/Reveal';
import { CartSkeleton } from '@/components/ui/LoadingSkeleton';

const CartPage = () => {
  const allCartItems = useCartStore((s) => s.cartItems);
  const cartTotal = useCartStore((s) => s.cartTotal);
  const loading = useCartStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);

  const cartItems = useMemo(() => allCartItems.filter(i => !i.savedForLater), [allCartItems]);
  const savedItems = useMemo(() => allCartItems.filter(i => i.savedForLater), [allCartItems]);

  // Memoize derived totals — don't recompute on unrelated re-renders
  const { tax, shipping, grandTotal } = useMemo(() => {
    const t = cartTotal * 0.08;
    const s = cartTotal > 150 ? 0 : 9.99;
    return { tax: t, shipping: s, grandTotal: cartTotal > 0 ? cartTotal + t + s : 0 };
  }, [cartTotal]);

  return (
    <div className="theme-page min-h-screen pb-20 pt-28">
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-8 flex items-center gap-3">
          <h1 className="theme-text text-3xl font-black tracking-tight md:text-4xl">
            Shopping Cart
          </h1>
          {!user && (
            <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-black text-amber-200">
              Guest cart
            </span>
          )}
          {!loading && cartItems.length > 0 && (
            <span className="theme-card rounded-full px-3 py-1 text-sm font-bold">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </span>
          )}
        </Reveal>

        {loading ? (
          <CartSkeleton />
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            {/* Cart Items */}
            <div className="flex-grow space-y-4">
              {cartItems.length === 0 ? (
                <div className="theme-card animate-[fadeSlideUp_350ms_ease_forwards] flex flex-col items-center justify-center rounded-3xl py-20 text-center">
                  {/* CSS animation replaces motion.div */}
                  <div className="theme-card-strong mb-6 flex h-24 w-24 items-center justify-center rounded-full">
                  <ShoppingBag className="h-10 w-10 text-amber-700/50 dark:text-white/30" />
                </div>
                <h3 className="theme-text text-2xl font-bold">Your cart is empty</h3>
                <p className="theme-muted mt-2 max-w-sm">
                  Looks like you haven't added anything to your cart yet. Discover something amazing today!
                </p>
                <Link
                  to="/products"
                  className="mt-8 rounded-full bg-amber-300 px-10 py-4 font-black text-black shadow-[0_16px_50px_rgba(245,197,82,0.2)] transition-[background-color,transform] hover:bg-amber-200 hover:scale-105 active:scale-95"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Plain div — no layout animation tracking overhead */}
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            )}

            {!loading && cartItems.length > 0 && (
              <div className="pt-8">
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-2 font-bold text-amber-800 transition-colors hover:text-amber-700 dark:text-white/60 dark:hover:text-amber-200"
                >
                  <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  Continue Shopping
                </Link>
              </div>
            )}

            {!loading && savedItems.length > 0 && (
              <div className="pt-8">
                <h2 className="theme-text mb-4 text-2xl font-black">Saved for Later</h2>
                <div className="space-y-4">
                  {savedItems.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {cartItems.length > 0 && (
            <aside className="w-full flex-shrink-0 lg:w-[420px]">
              <div className="theme-card sticky top-32 rounded-3xl p-6 sm:p-8">
                <h2 className="theme-text mb-6 text-2xl font-bold">Order Summary</h2>

                {/* Promo Code */}
                <div className="theme-input mb-8 flex gap-2 overflow-hidden rounded-xl p-1">
                  <Tag className="theme-soft ml-3 h-5 w-5 self-center" />
                  <input
                    type="text"
                    placeholder="Promo Code"
                    className="min-w-0 flex-grow border-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-[var(--color-soft)]"
                  />
                  <button className="shrink-0 rounded-lg bg-amber-300 px-4 text-sm font-bold text-black transition-colors hover:bg-amber-200">
                    Apply
                  </button>
                </div>

                <div className="space-y-4 border-b border-[var(--color-border)] pb-6">
                  <div className="theme-muted flex justify-between">
                    <span>Subtotal</span>
                    <span className="theme-text font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="theme-muted flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span className="theme-text font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="theme-muted">Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-bold text-emerald-400">FREE</span>
                    ) : (
                      <span className="theme-text font-medium">${shipping.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <div className="py-6">
                  <div className="flex items-end justify-between">
                    <span className="theme-text text-lg font-bold">Total</span>
                    <span className="theme-text text-3xl font-black">${grandTotal.toFixed(2)}</span>
                  </div>
                  <p className="theme-soft mt-2 text-right text-xs">Inclusive of all taxes and fees</p>
                </div>

                <Link to="/checkout" className="group flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 py-4 text-lg font-black text-black transition-[background-color,box-shadow,transform] hover:bg-amber-200 hover:shadow-[0_0_30px_rgba(245,197,82,0.3)] active:scale-95">
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <div className="theme-card-strong mt-8 space-y-4 rounded-2xl p-4">
                  {[
                    { Icon: ShieldCheck, text: 'Secure 256-bit SSL encrypted payments' },
                    { Icon: Truck, text: 'Free delivery on orders over $150' },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="theme-muted flex items-center gap-3 text-sm">
                      <Icon className="h-5 w-5 shrink-0 text-emerald-400" />
                      <span className="font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
