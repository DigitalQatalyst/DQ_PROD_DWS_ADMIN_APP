/**
 * Vendure Service
 *
 * Server-side service for communicating with Vendure GraphQL API.
 * Handles all Vendure API requests to avoid CORS issues.
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

export interface GetFacetsResponse {
  facets: {
    items: VendureFacet[]
  }
}

export class VendureService {
  private baseUrl: string

  constructor(baseUrl?: string) {
    // Use environment variable or provided URL
    this.baseUrl = baseUrl || process.env.VENDURE_API_URL || 'https://90va0q4bccgp.share.zrok.io/services-api'
  }

  /**
   * Execute a GraphQL query against Vendure API
   */
  private async query<T>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Vendure Service] HTTP Error:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        console.error('[Vendure Service] GraphQL Errors:', result.errors)
        throw new Error(result.errors[0]?.message || 'GraphQL query failed')
      }

      return result.data
    } catch (error) {
      console.error('[Vendure Service] Query failed:', error)
      throw error
    }
  }

  /**
   * Get all facets with their values
   */
  async getFacets(): Promise<VendureFacet[]> {
    console.log('[Vendure Service] Fetching facets from:', this.baseUrl)

    const query = `
      query GetFacets {
        facets {
          items {
            id
            name
            code
            values {
              id
              name
              code
            }
          }
        }
      }
    `

    const data = await this.query<GetFacetsResponse>(query)
    console.log('[Vendure Service] Successfully fetched', data.facets.items.length, 'facets')

    return data.facets.items
  }
}

// Create singleton instance
export const vendureService = new VendureService()
