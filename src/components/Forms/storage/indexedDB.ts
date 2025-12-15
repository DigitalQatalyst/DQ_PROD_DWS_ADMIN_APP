import Dexie, { Table } from 'dexie';
// Form data interface for IndexedDB
export interface StoredFormData {
  id: string;
  formId: string;
  formTitle: string;
  data: any;
  lastModified: Date;
  version: number;
}
// Form completion status interface
export interface FormCompletionStatus {
  id: string;
  formId: string;
  completedSteps: number[];
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  lastUpdated: Date;
}
// IndexedDB database class
export class FormDatabase extends Dexie {
  formData!: Table<StoredFormData>;
  completionStatus!: Table<FormCompletionStatus>;
  constructor() {
    super('FormDatabase');
    this.version(1).stores({
      formData: 'id, formId, formTitle, lastModified',
      completionStatus: 'id, formId, lastUpdated'
    });
  }
}
// Create database instance
export const db = new FormDatabase();
// Form data operations
export class FormDataService {
  // Auto-save form data
  static async autoSaveFormData(formId: string, formTitle: string, data: any, version: number = 1): Promise<void> {
    try {
      await db.formData.put({
        id: formId,
        formId,
        formTitle,
        data,
        lastModified: new Date(),
        version
      });
    } catch (error) {
      console.error('Failed to auto-save form data:', error);
    }
  }
  // Load saved form data
  static async loadFormData(formId: string): Promise<any> {
    try {
      const stored = await db.formData.get(formId);
      return stored?.data || {};
    } catch (error) {
      console.error('Failed to load form data:', error);
      return {};
    }
  }
  // Get all saved forms
  static async getAllSavedForms(): Promise<StoredFormData[]> {
    try {
      return await db.formData.orderBy('lastModified').reverse().toArray();
    } catch (error) {
      console.error('Failed to get saved forms:', error);
      return [];
    }
  }
  // Delete saved form data
  static async deleteFormData(formId: string): Promise<void> {
    try {
      await db.formData.delete(formId);
      await db.completionStatus.delete(formId);
    } catch (error) {
      console.error('Failed to delete form data:', error);
    }
  }
  // Save completion status
  static async saveCompletionStatus(formId: string, completedSteps: number[], currentStep: number, totalSteps: number): Promise<void> {
    try {
      const completionPercentage = Math.round(completedSteps.length / totalSteps * 100);
      await db.completionStatus.put({
        id: formId,
        formId,
        completedSteps,
        currentStep,
        totalSteps,
        completionPercentage,
        lastUpdated: new Date()
      });
      // Also save to localStorage for quick access
      localStorage.setItem(`form_completion_${formId}`, JSON.stringify({
        completedSteps,
        currentStep,
        totalSteps,
        completionPercentage,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save completion status:', error);
    }
  }
  // Load completion status
  static async loadCompletionStatus(formId: string): Promise<FormCompletionStatus | null> {
    try {
      // Try IndexedDB first
      const stored = await db.completionStatus.get(formId);
      if (stored) return stored;
      // Fallback to localStorage
      const localStored = localStorage.getItem(`form_completion_${formId}`);
      if (localStored) {
        const parsed = JSON.parse(localStored);
        return {
          id: formId,
          formId,
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated)
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to load completion status:', error);
      return null;
    }
  }
}