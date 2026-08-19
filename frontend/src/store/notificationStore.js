/**
 * notificationStore.js — Zustand store for in-app notifications.
 *
 * Fixes vs original:
 *  1. loadNotifications() called only ONCE on init (was called twice — once for
 *     notifications array, once for unreadCount, causing two JSON.parse calls)
 *  2. unreadCount derived via selector, not stored separately — eliminates the
 *     double state update on every notification action
 *  3. Added getUnreadCount selector export for Navbar badge (subscribes to just count)
 */
import { create } from 'zustand';

const STORAGE_KEY = 'goldmarket_notifications';
const MAX_NOTIFICATIONS = 50;

const loadNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const persist = (notifications) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch { /* storage quota exceeded — silent fail */ }
};

// ── Derived selector — components can subscribe to ONLY the count
// without subscribing to the full notifications array
export const selectUnreadCount = (state) => state.unreadCount;
export const selectNotifications = (state) => state.notifications;

const _initial = loadNotifications(); // parse ONCE

export const useNotificationStore = create((set) => ({
  notifications: _initial,
  unreadCount: _initial.filter((n) => !n.read).length,

  addNotification: ({ type = 'info', title, message, icon } = {}) => {
    const notification = {
      id: `notif-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      type,
      title,
      message,
      icon,
      read: false,
      createdAt: Date.now(),
    };
    set((state) => {
      const next = [notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS);
      persist(next);
      return {
        notifications: next,
        unreadCount: state.unreadCount + 1, // increment instead of full recount
      };
    });
    return notification;
  },

  markAsRead: (id) => {
    set((state) => {
      const next = state.notifications.map((n) =>
        n.id === id && !n.read ? { ...n, read: true } : n
      );
      persist(next);
      // Decrement count only if it was actually unread
      const wasUnread = state.notifications.some((n) => n.id === id && !n.read);
      return {
        notifications: next,
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
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
      const target = state.notifications.find((n) => n.id === id);
      const next = state.notifications.filter((n) => n.id !== id);
      persist(next);
      return {
        notifications: next,
        unreadCount: target && !target.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },
}));
