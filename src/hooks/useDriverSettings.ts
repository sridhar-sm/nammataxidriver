import { useState, useEffect, useCallback } from 'react';
import { DriverSettings, DEFAULT_DRIVER_SETTINGS } from '../types';
import * as storage from '../services/storage';

export function useDriverSettings() {
  const [settings, setSettings] = useState<DriverSettings>(DEFAULT_DRIVER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await storage.getDriverSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: DriverSettings): Promise<void> => {
    try {
      await storage.saveDriverSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to save settings');
    }
  };

  const updateSettings = async (updates: Partial<DriverSettings>): Promise<void> => {
    const newSettings = { ...settings, ...updates };
    await saveSettings(newSettings);
  };

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    updateSettings,
    refreshSettings: loadSettings,
  };
}
