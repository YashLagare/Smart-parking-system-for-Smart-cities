import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'OPERATOR' | 'DRIVER' | 'CITY_AUTHORITY' | 'SUPPORT';
}

interface AppState {
  token: string | null;
  user: User | null;
  activeRole: 'SUPER_ADMIN' | 'OPERATOR' | 'DRIVER' | 'CITY_AUTHORITY' | 'SUPPORT';
  lots: any[];
  reservations: any[];
  notifications: any[];
  isSimulationRunning: boolean;
  
  setAuth: (user: User | null, token: string | null) => void;
  setActiveRole: (role: 'SUPER_ADMIN' | 'OPERATOR' | 'DRIVER' | 'CITY_AUTHORITY' | 'SUPPORT') => void;
  setLots: (lots: any[]) => void;
  setReservations: (reservations: any[]) => void;
  setNotifications: (notifications: any[]) => void;
  toggleSimulation: () => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('smartpark_token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('smartpark_user') || 'null') : null,
  activeRole: 'DRIVER', // default role
  lots: [],
  reservations: [],
  notifications: [
    { id: 1, title: 'Welcome to SmartPark AI', message: 'Locate, reserve, and navigate to slots in real-time.', time: 'Just now' },
    { id: 2, title: 'EV Charging Enabled', message: 'Lots with EV charging slots are highlighted with green badges.', time: '5m ago' }
  ],
  isSimulationRunning: true,

  setAuth: (user, token) => {
    if (user && token) {
      localStorage.setItem('smartpark_token', token);
      localStorage.setItem('smartpark_user', JSON.stringify(user));
      set({ user, token, activeRole: user.role });
    } else {
      localStorage.removeItem('smartpark_token');
      localStorage.removeItem('smartpark_user');
      set({ user: null, token: null });
    }
  },

  setActiveRole: (role) => set({ activeRole: role }),
  setLots: (lots) => set({ lots }),
  setReservations: (reservations) => set({ reservations }),
  setNotifications: (notifications) => set({ notifications }),
  toggleSimulation: () => set((state) => ({ isSimulationRunning: !state.isSimulationRunning })),
  logout: () => {
    localStorage.removeItem('smartpark_token');
    localStorage.removeItem('smartpark_user');
    set({ user: null, token: null, activeRole: 'DRIVER' });
  }
}));
