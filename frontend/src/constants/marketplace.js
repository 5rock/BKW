import BadgeCheck from 'lucide-react/dist/esm/icons/badge-check';
import Banknote from 'lucide-react/dist/esm/icons/banknote';
import Clock3 from 'lucide-react/dist/esm/icons/clock-3';
import Gem from 'lucide-react/dist/esm/icons/gem';
import Globe2 from 'lucide-react/dist/esm/icons/globe-2';
import Headphones from 'lucide-react/dist/esm/icons/headphones';
import HeartHandshake from 'lucide-react/dist/esm/icons/heart-handshake';
import Home from 'lucide-react/dist/esm/icons/home';
import Laptop from 'lucide-react/dist/esm/icons/laptop';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import PackageCheck from 'lucide-react/dist/esm/icons/package-check';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Shirt from 'lucide-react/dist/esm/icons/shirt';
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Star from 'lucide-react/dist/esm/icons/star';
import Truck from 'lucide-react/dist/esm/icons/truck';
import Watch from 'lucide-react/dist/esm/icons/watch';
import Dumbbell from 'lucide-react/dist/esm/icons/dumbbell';

export const brand = {
  name: 'GoldMarket',
  altName: 'MarketX',
  tagline: 'Luxury marketplace for verified fashion, watches, sneakers, electronics, and rare lifestyle drops.',
};

export const heroSlides = [
  {
    eyebrow: 'MarketX Private Drop',
    title: 'Luxury that moves at marketplace speed.',
    copy: 'Curated premium products, verified sellers, secure checkout, and concierge-grade delivery in one cinematic shopping experience.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2200&q=85',
    badge: 'Up to 45% private access',
  },
  {
    eyebrow: 'Swiss Icons',
    title: 'Timepieces with provenance, polish, and protection.',
    copy: 'Authenticated watches, insured shipping, transparent seller ratings, and luxury aftercare built into every order.',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=2200&q=85',
    badge: 'Verified collectibles',
  },
  {
    eyebrow: 'Premium Streetwear',
    title: 'The season’s rarest edit, delivered beautifully.',
    copy: 'Discover sneakers, accessories, beauty, home, and designer apparel inside a responsive premium storefront.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2200&q=85',
    badge: 'New arrivals live',
  },
];

export const categories = [
  { name: 'Fashion', count: '18.4K', icon: Shirt, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80' },
  { name: 'Electronics', count: '9.7K', icon: Laptop, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80' },
  { name: 'Sneakers', count: '6.1K', icon: ShoppingBag, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' },
  { name: 'Watches', count: '3.8K', icon: Watch, image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80' },
  { name: 'Accessories', count: '12.2K', icon: Gem, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80' },
  { name: 'Home Decor', count: '5.9K', icon: Home, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80' },
  { name: 'Beauty', count: '7.5K', icon: Sparkles, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80' },
  { name: 'Sports', count: '4.4K', icon: Dumbbell, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80' },
];

export const trustItems = [
  { icon: ShieldCheck, title: '100% Authentic', copy: 'Identity, product, and seller checks on every premium listing.' },
  { icon: Truck, title: 'Fast Delivery', copy: 'Priority dispatch, express lanes, and live delivery visibility.' },
  { icon: RotateCcw, title: 'Easy Returns', copy: 'Guided returns with inspection updates and refund tracking.' },
  { icon: Banknote, title: 'Secure Payments', copy: 'Encrypted checkout with buyer protection and fraud monitoring.' },
  { icon: BadgeCheck, title: 'Verified Sellers', copy: 'Performance scoring, compliance checks, and transparent histories.' },
];

export const showcaseProducts = [
  {
    id: 'marketx-watch-01',
    title: 'Aurum Chronograph 42mm',
    brand: 'Maison Aurelia',
    category: 'Watches',
    price: 2299,
    discountPrice: 1849,
    rating: 4.9,
    reviewsCount: 284,
    stock: 4,
    featured: true,
    thumbnail: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'marketx-bag-02',
    title: 'Noir Pebbled Leather Tote',
    brand: 'Atelier Voss',
    category: 'Fashion',
    price: 1290,
    discountPrice: 990,
    rating: 4.8,
    reviewsCount: 178,
    stock: 12,
    thumbnail: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'marketx-sneaker-03',
    title: 'Edition Zero Court Sneaker',
    brand: 'Northline Studio',
    category: 'Sneakers',
    price: 420,
    discountPrice: 329,
    rating: 4.7,
    reviewsCount: 642,
    stock: 7,
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'marketx-audio-04',
    title: 'Obsidian Spatial Headphones',
    brand: 'Sonic Atelier',
    category: 'Electronics',
    price: 599,
    discountPrice: 449,
    rating: 4.9,
    reviewsCount: 391,
    stock: 18,
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
    ],
  },
];

export const aboutStats = [
  { label: 'Luxury shoppers', value: 50000, suffix: '+' },
  { label: 'Verified sellers', value: 1200, suffix: '+' },
  { label: 'Countries served', value: 42, suffix: '' },
  { label: 'Authentication score', value: 99, suffix: '%' },
];

export const supportChannels = [
  { icon: Headphones, title: 'Live Concierge', copy: 'Priority support for orders, fit, availability, and returns.' },
  { icon: Clock3, title: '24/7 Response', copy: 'Round-the-clock assistance across email, chat, and phone.' },
  { icon: MapPin, title: 'Global Hubs', copy: 'New York, London, Dubai, Mumbai, Singapore, and Paris.' },
];

export const deliveryTimeline = [
  'Order verified',
  'Seller confirms stock',
  'Authentication and packing',
  'Insured dispatch',
  'Live delivery handoff',
];

export const returnSteps = [
  'Start a guided return request',
  'Upload photos and reason',
  'Schedule pickup or drop-off',
  'Inspection and approval',
  'Refund or exchange issued',
];

export const footerLinks = {
  Company: ['About Us', 'Careers', 'Press & Media', 'Blog', 'Contact Us', 'Investor Relations'],
  'Customer Service': ['Help Center', 'Shipping Info', 'Returns & Refunds', 'Order Tracking', 'FAQs', 'Live Support'],
  Policies: ['Privacy Policy', 'Terms & Conditions', 'Cookie Policy', 'Seller Policy', 'Buyer Protection'],
};

export const globalPresence = [
  { city: 'New York', x: '24%', y: '42%' },
  { city: 'London', x: '47%', y: '34%' },
  { city: 'Dubai', x: '58%', y: '49%' },
  { city: 'Mumbai', x: '67%', y: '57%' },
  { city: 'Singapore', x: '74%', y: '64%' },
  { city: 'Tokyo', x: '82%', y: '44%' },
];

export const processIcons = [PackageCheck, Globe2, HeartHandshake, Star];
