import {
  BadgeCheck,
  Gem,
  Headphones,
  Home,
  Laptop,
  Shirt,
  ShoppingBag,
  Sparkles,
  Trophy,
  Watch,
} from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../utils/productUtils';

export const CATEGORY_OPTIONS = [
  { label: 'All', icon: ShoppingBag, count: 0 },
  ...PRODUCT_CATEGORIES.map((label) => ({
    label,
    icon:
      {
        'Fashion & Apparel': Shirt,
        Electronics: Laptop,
        Sneakers: Trophy,
        Watches: Watch,
        Accessories: Gem,
        'Home Decor': Home,
        Beauty: Sparkles,
        Sports: Trophy,
        Books: BadgeCheck,
      }[label] || ShoppingBag,
    count: 0,
  })),
];

export const BRAND_OPTIONS = [
  { label: 'Nike', logo: 'N' },
  { label: 'Adidas', logo: 'A' },
  { label: 'Puma', logo: 'P' },
  { label: 'Apple', logo: 'AP' },
  { label: 'Samsung', logo: 'S' },
  { label: 'Sony', logo: 'S' },
  { label: "Levi's", logo: 'L' },
  { label: 'MarketX', logo: 'MX' },
  { label: 'GoldMarket', logo: 'GM' },
  { label: 'Zara', logo: 'Z' },
  { label: 'H&M', logo: 'H' },
  { label: 'Rolex', logo: 'R' },
];

export const COLOR_OPTIONS = [
  { label: 'Black', value: '#050505', ring: 'ring-gray-950' },
  { label: 'White', value: '#ffffff', ring: 'ring-gray-300' },
  { label: 'Red', value: '#ef4444', ring: 'ring-red-500' },
  { label: 'Blue', value: '#2563eb', ring: 'ring-blue-500' },
  { label: 'Green', value: '#16a34a', ring: 'ring-green-500' },
  { label: 'Gold', value: '#d4af37', ring: 'ring-yellow-500' },
  { label: 'Silver', value: '#cbd5e1', ring: 'ring-slate-300' },
];

export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
export const SHOE_SIZES = ['6', '7', '8', '9', '10', '11', '12'];

export const ADVANCED_FILTERS = [
  { key: 'freeShipping', label: 'Free shipping', icon: Headphones },
  { key: 'newArrivals', label: 'New arrivals', icon: Sparkles },
  { key: 'bestSellers', label: 'Best sellers', icon: Trophy },
  { key: 'trending', label: 'Trending products', icon: BadgeCheck },
  { key: 'premiumSellers', label: 'Premium verified sellers', icon: Gem },
];
