import { TimerConfig } from '../types/Timer';

const STORAGE_KEYS = {
  TIMERS: 'timer_app_timers',
  ACTIVE_TIMER: 'timer_app_active_timer',
  SETTINGS: 'timer_app_settings'
};

export const storage = {
  // Timers salvos
  getTimers: (): TimerConfig[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTimers: (timers: TimerConfig[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMERS, JSON.stringify(timers));
    } catch (error) {
      console.error('Erro ao salvar timers:', error);
    }
  },

  // Timer ativo
  getActiveTimer: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveActiveTimer: (timer: any): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(timer));
    } catch (error) {
      console.error('Erro ao salvar timer ativo:', error);
    }
  },

  clearActiveTimer: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
  },

  // Configurações
  getSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { soundEnabled: true, visualEnabled: true, volume: 0.7 };
    } catch {
      return { soundEnabled: true, visualEnabled: true, volume: 0.7 };
    }
  },

  saveSettings: (settings: any): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }
};
