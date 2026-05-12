import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Truck, RotateCcw, TrendingUp } from 'lucide-react';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { name: 'Fashion & Apparel', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Sneakers', img: 'https://images.unsplash.com/photo-1552346154-21d32810baa3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Watches', img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Accessories', img: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Home Decor', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: '100% Authentic', desc: 'Every product is verified for quality and authenticity.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Get your orders delivered within 24-48 hours locally.' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'No-questions-asked 30 day return policy.' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState({ h: 11, m: 59, s: 42 });

  useEffect(() => {
    getProducts({ sort: 'top_rated', limit: 8 })
      .then((res) => setFeaturedProducts(res.products.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setTimer((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { h: 23, m: 59, s: 59 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pt-24 pb-12">
      
      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
          <img
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Big Sale Banner"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex flex-col justify-center px-8 md:px-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <span className="inline-block bg-brand-yellow text-text-light px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-md animate-bounce-slow">
                Grand Festive Sale
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                Upgrade Your <br/>
                <span className="text-gradient">Style Today.</span>
              </h1>
              <p className="text-lg text-gray-200 mb-8 max-w-md">
                Discover millions of premium products with unbeatable discounts and next-day delivery.
              </p>
              <div className="flex gap-4">
                <button onClick={() => navigate('/products')} className="bg-brand-yellow text-text-light font-bold px-8 py-3.5 rounded-full hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                  Shop Now
                </button>
                <button className="glass text-white font-bold px-8 py-3.5 rounded-full hover:bg-white/20 transition-all flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Circular Categories Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark tracking-tight">Shop by Category</h2>
            <p className="text-text-muted-light dark:text-text-muted-dark mt-1">Explore our wide range of collections</p>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
          {CATEGORIES.map((cat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={cat.name} 
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
              className="flex flex-col items-center gap-3 cursor-pointer group min-w-[100px] sm:min-w-[120px] snap-center"
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg group-hover:shadow-brand-yellow/30 group-hover:border-brand-yellow transition-all duration-300">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="font-medium text-sm sm:text-base text-center text-text-light dark:text-text-dark group-hover:text-brand-yellow transition-colors">
                {cat.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gradient-to-r from-brand-red to-red-600 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Decorative shapes */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 text-white text-center md:text-left flex-1">
            <span className="inline-block bg-white text-brand-red font-bold px-3 py-1 rounded-md text-sm mb-4 animate-pulse">
              Deal of the Day
            </span>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-2 tracking-tight">Flash Sale Is On!</h2>
            <p className="text-lg text-red-100">Grab the best deals up to 60% off. Hurry, time is running out.</p>
          </div>
          
          <div className="relative z-10 flex gap-4 items-center">
            {[['h', 'Hours'], ['m', 'Mins'], ['s', 'Secs']].map(([key, label]) => (
              <div key={key} className="flex flex-col items-center">
                <div className="glass w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl text-white font-black text-2xl sm:text-3xl shadow-lg border-white/30">
                  {pad(timer[key])}
                </div>
                <span className="text-red-100 text-xs uppercase tracking-wider mt-2 font-bold">{label}</span>
              </div>
            ))}
          </div>
          
          <div className="relative z-10">
            <button onClick={() => navigate('/products')} className="bg-white text-brand-red font-black px-8 py-4 rounded-full hover:bg-gray-100 hover:scale-105 transition-all shadow-xl whitespace-nowrap">
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark tracking-tight">Trending Now</h2>
            <p className="text-text-muted-light dark:text-text-muted-dark mt-1">Products loved by our customers</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-1 text-brand-red font-semibold hover:text-red-700 transition-colors">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-[350px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((p, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                key={p.id || p._id}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {TRUST_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-yellow-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-yellow/20 transition-all duration-300">
                    <Icon className="h-8 w-8 text-brand-yellow" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-text-light dark:text-text-dark">{item.title}</h4>
                  <p className="text-text-muted-light dark:text-text-muted-dark leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
