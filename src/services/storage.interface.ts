export interface StorageService {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface StorageEventHandler {
  onStorageChange(key: string, newValue: any): void;
} 