/**
 * Vendure Client
 *
 * Frontend client for fetching Vendure data through our backend proxy.
 * Uses the backend API to avoid CORS issues.
 */

export interface VendureFacetValue {
  id: string
  name: string
  code: string
}

export interface VendureFacet {
  id: string
  name: string
  code: string
  values: VendureFacetValue[]
}

export interface VendureProxyResponse<T> {
  data: T
  cached?: boolean
}

class VendureClient {
  private baseUrl: string

  constructor() {
    // Use backend proxy endpoint instead of direct Vendure API
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
  }

  /**
   * Get all facets with their values
   * Fetches from backend proxy instead of direct Vendure API
   */
  async getFacets(): Promise<VendureFacet[]> {
    try {
      console.log('[Vendure Client] Fetching facets from backend proxy:', `${this.baseUrl}/vendure/facets`)

      const response = await fetch(`${this.baseUrl}/vendure/facets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result: VendureProxyResponse<VendureFacet[]> = await response.json()

      console.log('[Vendure Client] Successfully fetched facets:', result.data.length, 'items')
      if (result.cached) {
        console.log('[Vendure Client] Data served from cache')
      }

      return result.data
    } catch (error) {
      console.error('[Vendure Client] Error fetching facets:', error)
      throw error
    }
  }

}

// Create singleton instance
const vendureClient = new VendureClient()

export default vendureClient
