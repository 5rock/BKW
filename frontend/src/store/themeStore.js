import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: false,
      setDarkMode: (isDark) => set({ darkMode: isDark }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'goldmarket_theme_store',
      // We also listen to system preference on initial load
      onRehydrateStorage: () => (state) => {
        if (!state) {
          const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
          useThemeStore.setState({ darkMode: prefersDark });
        }
      },
    }
  )
);

export default useThemeStore;
