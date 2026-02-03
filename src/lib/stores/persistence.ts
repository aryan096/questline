// LocalStorage persistence utilities

import type { AppData } from '$lib/types';
import { SCHEMA_VERSION } from '$lib/types';
import { isValidAppData, isCompatibleVersion } from '$lib/utils/validation';

const STORAGE_KEY = 'questline_data';

/**
 * Load data from LocalStorage
 */
export function loadFromLocalStorage(): AppData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // Validate data structure
    if (!isValidAppData(data)) {
      console.warn('Invalid data structure in LocalStorage');
      return null;
    }
    
    // Check version compatibility
    if (!isCompatibleVersion(data.version)) {
      console.warn(`Incompatible schema version: ${data.version}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error loading from LocalStorage:', error);
    return null;
  }
}

/**
 * Save data to LocalStorage
 */
export function saveToLocalStorage(data: AppData): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch (error) {
    console.error('Error saving to LocalStorage:', error);
    
    // Check if quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded!');
    }
    
    return false;
  }
}

/**
 * Clear all data from LocalStorage
 */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing LocalStorage:', error);
  }
}

/**
 * Get initial app data (empty state)
 */
export function getInitialAppData(): AppData {
  return {
    version: SCHEMA_VERSION,
    user: {
      totalXP: 0,
      level: 0,
      completedQuestCount: 0
    },
    quests: []
  };
}
