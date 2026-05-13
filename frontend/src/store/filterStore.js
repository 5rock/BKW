import { create } from 'zustand';

export const DEFAULT_FILTERS = {
  category: 'All',
  priceRange: [0, 5000],
  rating: 0,
  brands: [],
  colors: [],
  sizes: [],
  availability: 'all',
  minDiscount: 0,
  freeShipping: false,
  newArrivals: false,
  bestSellers: false,
  trending: false,
  premiumSellers: false,
  sort: 'latest',
};

const toggleListValue = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

export const useFilterStore = create((set) => ({
  filters: DEFAULT_FILTERS,
  isFiltering: false,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  setFilters: (nextFilters) =>
    set((state) => ({
      filters: typeof nextFilters === 'function' ? nextFilters(state.filters) : { ...state.filters, ...nextFilters },
    })),
  toggleArrayFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: toggleListValue(state.filters[key] || [], value),
      },
    })),
  toggleBooleanFilter: (key) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: !state.filters[key],
      },
    })),
  clearFilter: (key, value) =>
    set((state) => {
      const current = state.filters[key];
      if (Array.isArray(current)) {
        return { filters: { ...state.filters, [key]: current.filter((item) => item !== value) } };
      }
      return { filters: { ...state.filters, [key]: DEFAULT_FILTERS[key] } };
    }),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setIsFiltering: (isFiltering) => set({ isFiltering }),
}));
