/**
 * API Client
 * 
 * Handles communication with the backend API endpoints.
 * Uses internal JWT for authorization (federated identity pattern).
 */

import { getInternalJWT } from './federatedAuth';
import { getApiBaseUrl } from './apiConfig';

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  reason: string;
  message: string;
}

export interface FilterOptions {
  [key: string]: any;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    // Use centralized API config utility for consistent URL handling
    this.baseUrl = getApiBaseUrl();
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Get authentication headers
   * Uses internal JWT from federated identity pattern
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get internal JWT (preferred for federated identity)
    const internalJWT = getInternalJWT();
    
    if (internalJWT) {
      headers['Authorization'] = `Bearer ${internalJWT}`;
    } else if (this.authToken) {
      // Fallback to manually set token (legacy)
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Build URL - handle both absolute and relative baseUrl
    let urlString: string;
    if (/^https?:\/\//i.test(this.baseUrl)) {
      // Absolute URL (production)
      urlString = `${this.baseUrl}${endpoint}`;
    } else {
      // Relative URL (local dev with proxy)
      urlString = `${window.location.origin}${this.baseUrl}${endpoint}`;
    }
    
    const response = await fetch(urlString, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    // Handle no-content responses (e.g., DELETE 204)
    if (response.status === 204) {
      return { data: undefined as unknown as T } as ApiResponse<T>;
    }

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    // Build URL - handle both absolute and relative baseUrl
    let urlString: string;
    if (/^https?:\/\//i.test(this.baseUrl)) {
      // Absolute URL (production)
      const url = new URL(`${this.baseUrl}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      urlString = url.toString();
    } else {
      // Relative URL (local dev with proxy)
      const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      urlString = url.toString();
    }

    const response = await fetch(urlString, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async deleteRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * List records with filtering and pagination
   */
  async list<T>(
    module: string,
    filters?: FilterOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResponse<T>> {
    const params: Record<string, any> = {};

    // Add pagination parameters
    if (pagination?.page) params.page = pagination.page;
    if (pagination?.limit) params.limit = pagination.limit;
    if (pagination?.offset) params.offset = pagination.offset;

    // Add filter parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value;
        }
      });
    }

    const response = await this.get<T[]>(`/${module}`, params);
    
    return {
      data: response.data,
      total: response.pagination?.total || response.data.length,
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || 10,
      totalPages: response.pagination?.totalPages || 1,
    };
  }

  /**
   * Get single record by ID
   */
  async getById<T>(module: string, id: string): Promise<T> {
    const response = await this.get<T>(`/${module}/${id}`);
    return response.data;
  }

  /**
   * Create new record
   */
  async create<T>(module: string, data: Partial<T>): Promise<T> {
    const response = await this.post<T>(`/${module}`, data);
    return response.data;
  }

  /**
   * Update existing record
   */
  async update<T>(module: string, id: string, data: Partial<T>): Promise<T> {
    const response = await this.put<T>(`/${module}/${id}`, data);
    return response.data;
  }

  /**
   * Delete record
   */
  async remove(module: string, id: string): Promise<void> {
    await this.deleteRequest<void>(`/${module}/${id}`);
  }

  /**
   * Approve record (for services, contents, etc.)
   */
  async approve<T>(module: string, id: string, approvalData?: any): Promise<T> {
    const response = await this.post<T>(`/${module}/${id}/approve`, approvalData);
    return response.data;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
