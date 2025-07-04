import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage.interface';
import localStorageService from '../services/localStorage.service';

export function useLocalStorage<T>(key: string, initialValue: T, storageService: StorageService = localStorageService): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = storageService.getItem<T>(key);
    return item !== null ? item : initialValue;
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    storageService.setItem(key, value);
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        const newValue = storageService.getItem<T>(key);
        if (newValue !== null) {
          setStoredValue(newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, storageService]);

  return [storedValue, setValue];
} 