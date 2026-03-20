import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = typeof newValue === 'function' ? (newValue as (p: T) => T)(prev) : newValue;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
      }
      return resolved;
    });
  }, [key]);

  const clear = useCallback(() => {
    localStorage.removeItem(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return [value, set, clear] as const;
}
