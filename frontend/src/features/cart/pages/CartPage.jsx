import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, ArrowLeft, Tag } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import CartItem from '@/features/cart/components/CartItem';
import { CartSkeleton } from '@/components/ui/LoadingSkeleton';

const CartPage = () => {
  const allCartItems = useCartStore((s) => s.cartItems);
  const cartTotal = useCartStore((s) => s.cartTotal);
  const loading = useCartStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);

  const cartItems = useMemo(() => allCartItems.filter(i => !i.savedForLater), [allCartItems]);
  const savedItems = useMemo(() => allCartItems.filter(i => i.savedForLater), [allCartItems]);

  const { tax, shipping, grandTotal } = useMemo(() => {
    const t = cartTotal * 0.08;
    const s = cartTotal > 150 ? 0 : 25; // Luxury shipping is typically higher unless free threshold met
    return { tax: t, shipping: s, grandTotal: cartTotal > 0 ? cartTotal + t + s : 0 };
  }, [cartTotal]);

  return (
    <div className="min-h-screen bg-bg-primary pt-32 pb-24">
      <main className="luxury-shell">
        <div className="flex items-center justify-between mb-12 border-b border-surface-border pb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-display text-4xl lg:text-5xl text-text-primary tracking-tight">
              Your Bag
            </h1>
            {!loading && cartItems.length > 0 && (
              <span className="bg-surface-primary text-text-primary border border-surface-border rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
              </span>
            )}
          </div>
          {!user && (
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted hidden sm:block">
              Guest Checkout Available
            </span>
          )}
        </div>

        {loading ? (
          <CartSkeleton />
        ) : (
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Bag Items */}
            <div className="flex-grow">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-surface-primary border border-surface-border rounded-3xl">
                  <div className="mb-8 p-6 rounded-full bg-bg-primary border border-surface-border shadow-inner">
                    <ShoppingBag size={48} className="text-text-muted" strokeWidth={1} />
                  </div>
                  <h3 className="text-display text-3xl text-text-primary mb-4">Your bag is empty</h3>
                  <p className="text-text-secondary max-w-sm mb-10">
                    Discover extraordinary pieces crafted with precision. Your next legacy awaits.
                  </p>
                  <Link to="/collections" className="luxury-button">
                    Explore Collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                  
                  <div className="pt-8 flex justify-between items-center border-t border-surface-border mt-8">
                    <Link
                      to="/collections"
                      className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-color-gold transition-colors"
                    >
                      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              )}

              {/* Saved Items */}
              {savedItems.length > 0 && (
                <div className="pt-20">
                  <h2 className="text-display text-2xl text-text-primary mb-8 border-b border-surface-border pb-4">Saved Pieces</h2>
                  <div className="space-y-6">
                    {savedItems.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            {cartItems.length > 0 && (
              <aside className="w-full lg:w-[440px] flex-shrink-0">
                <div className="sticky top-32 bg-surface-primary border border-surface-border rounded-[2rem] p-8 lg:p-10 shadow-2xl">
                  <h2 className="text-display text-2xl text-text-primary mb-8">Summary</h2>

                  {/* Promo Code */}
                  <div className="mb-10">
                    <div className="flex bg-bg-primary border border-surface-border rounded-full p-1.5 focus-within:border-color-gold transition-colors">
                      <div className="pl-4 flex items-center justify-center">
                        <Tag size={16} className="text-text-muted" />
                      </div>
                      <input
                        type="text"
                        placeholder="Complimentary Code"
                        className="flex-grow bg-transparent px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
                      />
                      <button className="bg-text-primary text-bg-primary px-6 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-color-gold transition-colors">
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5 border-b border-surface-border pb-8 text-sm tracking-wide">
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Subtotal</span>
                      <span className="text-text-primary font-medium">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Estimated Tax</span>
                      <span className="text-text-primary font-medium">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Insured Shipping</span>
                      {shipping === 0 ? (
                        <span className="text-color-gold font-bold uppercase tracking-widest text-[10px]">Complimentary</span>
                      ) : (
                        <span className="text-text-primary font-medium">${shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      )}
                    </div>
                  </div>

                  <div className="py-8">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-text-primary text-lg font-medium">Total</span>
                      <span className="text-text-primary text-4xl font-light tracking-tight">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-text-muted text-[10px] uppercase tracking-widest text-right">USD inclusive of applicable duties</p>
                  </div>

                  <Link to="/checkout" className="luxury-button w-full flex justify-between items-center">
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Link>

                  <div className="mt-10 space-y-6 pt-8 border-t border-surface-border">
                    {[
                      { Icon: ShieldCheck, title: 'Secure Payment', text: 'Encrypted & Authenticated' },
                      { Icon: Truck, title: 'Insured Delivery', text: 'Global tracked shipping' },
                    ].map(({ Icon, title, text }) => (
                      <div key={title} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-bg-primary border border-surface-border flex items-center justify-center flex-shrink-0 text-text-primary">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary tracking-wide mb-1">{title}</p>
                          <p className="text-xs text-text-secondary">{text}</p>
                        </div>
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
