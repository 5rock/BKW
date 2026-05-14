import { create } from 'zustand';

const STORAGE_KEY = 'goldmarket_notifications';

const loadNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const persist = (notifications) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
  } catch { /* quota exceeded */ }
};

export const useNotificationStore = create((set, get) => ({
  notifications: loadNotifications(),
  unreadCount: loadNotifications().filter((n) => !n.read).length,

  addNotification: ({ type = 'info', title, message, icon }) => {
    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      title,
      message,
      icon,
      read: false,
      createdAt: Date.now(),
    };
    set((state) => {
      const next = [notification, ...state.notifications].slice(0, 50);
      persist(next);
      return { notifications: next, unreadCount: next.filter((n) => !n.read).length };
    });
    return notification;
  },

  markAsRead: (id) => {
    set((state) => {
      const next = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist(next);
      return { notifications: next, unreadCount: next.filter((n) => !n.read).length };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const next = state.notifications.map((n) => ({ ...n, read: true }));
      persist(next);
      return { notifications: next, unreadCount: 0 };
    });
  },

  clearAll: () => {
    persist([]);
    set({ notifications: [], unreadCount: 0 });
  },

  removeNotification: (id) => {
    set((state) => {
      const next = state.notifications.filter((n) => n.id !== id);
      persist(next);
      return { notifications: next, unreadCount: next.filter((n) => !n.read).length };
    });
  },
}));
