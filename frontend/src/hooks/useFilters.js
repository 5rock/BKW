import { useMemo } from 'react';
import { DEFAULT_FILTERS } from '../store/filterStore';
import { money } from '../utils/productUtils';

const labelMap = {
  category: 'Category',
  rating: 'Rating',
  availability: 'Availability',
  minDiscount: 'Discount',
  freeShipping: 'Free shipping',
  newArrivals: 'New arrivals',
  bestSellers: 'Best sellers',
  trending: 'Trending',
  premiumSellers: 'Verified sellers',
};

const booleanFilters = ['freeShipping', 'newArrivals', 'bestSellers', 'trending', 'premiumSellers'];

export const useFilters = (filters) =>
  useMemo(() => {
    const chips = [];

    if (filters.category !== DEFAULT_FILTERS.category) {
      chips.push({ key: 'category', label: `${labelMap.category}: ${filters.category}` });
    }

    if (
      filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
      filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]
    ) {
      chips.push({
        key: 'priceRange',
        label: `${money(filters.priceRange[0])} - ${money(filters.priceRange[1])}`,
      });
    }

    if (filters.rating > 0) chips.push({ key: 'rating', label: `${filters.rating}+ stars` });
    if (filters.availability !== 'all') chips.push({ key: 'availability', label: filters.availability === 'in' ? 'In stock' : 'Out of stock' });
    if (filters.minDiscount > 0) chips.push({ key: 'minDiscount', label: `${filters.minDiscount}% off or more` });

    filters.brands.forEach((value) => chips.push({ key: 'brands', value, label: value }));
    filters.colors.forEach((value) => chips.push({ key: 'colors', value, label: value }));
    filters.sizes.forEach((value) => chips.push({ key: 'sizes', value, label: `Size ${value}` }));
    booleanFilters.forEach((key) => {
      if (filters[key]) chips.push({ key, label: labelMap[key] });
    });

    return {
      appliedChips: chips,
      activeCount: chips.length,
      hasActiveFilters: chips.length > 0,
    };
  }, [filters]);
