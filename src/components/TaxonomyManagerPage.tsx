import React, { useEffect, useState, Fragment, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  SearchIcon,
  ChevronDownIcon,
  DownloadIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  TagIcon,
  LayersIcon,
  FolderIcon,
  ArchiveIcon,
  TrendingUpIcon,
  XIcon,
  RefreshCwIcon,
} from 'lucide-react'
import { TaxonomyDetailsDrawer } from './TaxonomyDetailsDrawer'
import { TabsSimple } from './TabVariations'
import type { SimpleSection } from './TabVariations'
import { mockTaxonomies } from '../utils/mockData'
import vendureClient from '../lib/vendureClient'
import type { VendureFacet } from '../lib/vendureClient'
export function TaxonomyManagerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [scopeFilter, setScopeFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [activeTypeTab, setActiveTypeTab] = useState(0) // 0 = All, 1 = Collections, 2 = Facets, 3 = Tags
  const [vendureFacets, setVendureFacets] = useState<VendureFacet[]>([])
  const [isLoadingFacets, setIsLoadingFacets] = useState(false)
  const [facetsError, setFacetsError] = useState<string | null>(null)
  // Define type tabs
  const typeTabs: SimpleSection[] = [
    {
      id: 'all',
      title: 'All Types',
    },
    {
      id: 'collection',
      title: 'Collections',
    },
    {
      id: 'facet',
      title: 'Facets',
    },
    {
      id: 'tag',
      title: 'Tags',
    },
  ]
  // Get active type filter based on tab
  const getActiveTypeFilter = () => {
    switch (activeTypeTab) {
      case 1:
        return 'Collection'
      case 2:
        return 'Facet'
      case 3:
        return 'Tag'
      default:
        return 'All'
    }
  }
  // Update type filter when tab changes
  useEffect(() => {
    const newTypeFilter = getActiveTypeFilter()
    setTypeFilter(newTypeFilter)
    setCurrentPage(1) // Reset to first page when changing tabs
  }, [activeTypeTab])

  // Apply scope filter from URL query params on initial render
  useEffect(() => {
    const scope = searchParams.get('scope')
    if (scope === 'Content' || scope === 'Marketplace') {
      setScopeFilter(scope)
    }
  }, [searchParams])

  // Check URL for deep linking on initial render
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const taxonomyId = urlParams.get('taxonomyId')
    if (taxonomyId) {
      const taxonomy = mockTaxonomies.find((t) => t.id === taxonomyId)
      if (taxonomy) {
        setSelectedTaxonomy(taxonomy)
        setIsDrawerOpen(true)
      }
    }
  }, [])

  // Fetch facets from Vendure API via backend proxy
  const fetchFacets = useCallback(async () => {
    console.log('[Vendure] Starting to fetch facets...')
    setIsLoadingFacets(true)
    setFacetsError(null)
    try {
      const facets = await vendureClient.getFacets()
      console.log('[Vendure] Successfully fetched facets:', facets.length, 'items')
      console.log('[Vendure] Facet details:', facets)
      setVendureFacets(facets)
    } catch (error) {
      console.error('[Vendure] Error fetching facets:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch facets'
      console.error('[Vendure] Error details:', errorMessage)
      setFacetsError(errorMessage)
    } finally {
      setIsLoadingFacets(false)
    }
  }, [])

  useEffect(() => {
    fetchFacets()
  }, [fetchFacets])

  // Convert Vendure facets to taxonomy format
  const convertVendureFacetsToTaxonomies = useCallback((facets: VendureFacet[]) => {
    console.log('[Vendure] Converting facets to taxonomy format:', facets.length, 'facets')
    const converted = facets.map((facet, index) => ({
      id: `vendure-${facet.id}`,
      name: facet.name,
      type: 'Facet',
      scope: 'Marketplace',
      slug: facet.code.toLowerCase(),
      description: `Facet imported from Vendure: ${facet.name}`,
      status: 'Active',
      valuesCount: facet.values.length,
      lastUpdated: new Date().toISOString(),
      createdBy: 'Vendure System',
      values: facet.values.map((value, valueIndex) => ({
        id: `v-${value.id}`,
        name: value.name,
        code: value.code,
        displayOrder: valueIndex + 1,
        usageCount: 0,
        status: 'Active',
      })),
    }))
    console.log('[Vendure] Converted taxonomies:', converted)
    return converted
  }, [])

  // Merge Vendure facets with mock taxonomies using useMemo
  const allTaxonomies = useMemo(() => {
    const vendureTaxonomies = convertVendureFacetsToTaxonomies(vendureFacets)
    console.log('[Vendure] Total taxonomies:', mockTaxonomies.length, 'mock +', vendureTaxonomies.length, 'vendure =', mockTaxonomies.length + vendureTaxonomies.length, 'total')
    return [
      ...mockTaxonomies,
      ...vendureTaxonomies,
    ]
  }, [vendureFacets, convertVendureFacetsToTaxonomies])

  // Summary data calculation
  const summaryData = [
    {
      id: 'total',
      title: 'Total Taxonomies',
      count: allTaxonomies.length,
      icon: LayersIcon,
      color: 'bg-blue-100 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      id: 'active',
      title: 'Active Taxonomies',
      count: allTaxonomies.filter((t) => t.status === 'Active').length,
      icon: TagIcon,
      color: 'bg-green-100 text-green-600',
      borderColor: 'border-green-200',
    },
    {
      id: 'values',
      title: 'Values Assigned',
      count: allTaxonomies.reduce((sum, t) => sum + t.valuesCount, 0),
      icon: FolderIcon,
      color: 'bg-purple-100 text-purple-600',
      borderColor: 'border-purple-200',
    },
    {
      id: 'archived',
      title: 'Archived',
      count: allTaxonomies.filter((t) => t.status === 'Archived').length,
      icon: ArchiveIcon,
      color: 'bg-gray-100 text-gray-600',
      borderColor: 'border-gray-200',
    },
  ]
  // Filter and sort taxonomies
  const filteredTaxonomies = allTaxonomies
    .filter((taxonomy) => {
      if (typeFilter !== 'All' && taxonomy.type !== typeFilter) return false
      if (statusFilter !== 'All' && taxonomy.status !== statusFilter)
        return false
      if (scopeFilter !== 'All' && taxonomy.scope !== scopeFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          taxonomy.name.toLowerCase().includes(query) ||
          taxonomy.description.toLowerCase().includes(query) ||
          taxonomy.type.toLowerCase().includes(query)
        )
      }
      return true
    })
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    )
  // Pagination logic
  const totalPages = Math.ceil(filteredTaxonomies.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, filteredTaxonomies.length)
  const paginatedTaxonomies = filteredTaxonomies.slice(startIndex, endIndex)
  // Render type badge with Vendure colors
  const renderType = (type: string) => {
    const typeStyles: Record<string, string> = {
      Collection: 'bg-blue-100 text-blue-800 border border-blue-200',
      Facet: 'bg-purple-100 text-purple-800 border border-purple-200',
      Tag: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    }
    return (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${typeStyles[type] || 'bg-gray-100 text-gray-800'}`}
      >
        {type}
      </span>
    )
  }
  // Render status badge
  const renderStatus = (status: string) => {
    const statusStyles: Record<string, string> = {
      Active: 'bg-green-100 text-green-800 border border-green-200',
      Archived: 'bg-gray-100 text-gray-800 border border-gray-200',
    }
    return (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {status}
      </span>
    )
  }
  // Render scope badge
  const renderScope = (scope: string) => {
    const scopeStyles: Record<string, string> = {
      Marketplace: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      Content: 'bg-amber-100 text-amber-800 border border-amber-200',
    }
    return (
      <span
        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${scopeStyles[scope] || 'bg-gray-100 text-gray-800'}`}
      >
        {scope}
      </span>
    )
  }
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  // Handle row click to open drawer
  const handleRowClick = (taxonomyId: string) => {
    const taxonomy = allTaxonomies.find((item) => item.id === taxonomyId)
    if (taxonomy) {
      setSelectedTaxonomy(taxonomy)
      setIsDrawerOpen(true)
      const url = new URL(window.location.href)
      url.searchParams.set('taxonomyId', taxonomyId)
      window.history.replaceState({}, '', url.toString())
    }
  }
  // Handle row keyboard interaction
  const handleRowKeyDown = (e: React.KeyboardEvent, taxonomyId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleRowClick(taxonomyId)
    }
  }
  // Handle create new taxonomy
  const handleCreateTaxonomy = (type: 'Collection' | 'Facet' | 'Tag') => {
    setShowCreateModal(false)
    // Navigate to the appropriate form
    if (type === 'Collection') {
      navigate('/taxonomy-manager/collection/new')
    } else if (type === 'Facet') {
      navigate('/taxonomy-manager/facet/new')
    } else if (type === 'Tag') {
      navigate('/taxonomy-manager/tag/new')
    }
  }
  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    const url = new URL(window.location.href)
    url.searchParams.delete('taxonomyId')
    window.history.replaceState({}, '', url.toString())
  }
  // Handle clear filters
  const handleClearFilters = () => {
    setActiveTypeTab(0) // Reset to "All Types"
    setTypeFilter('All')
    setStatusFilter('All')
    setScopeFilter('All')
    setSearchQuery('')
    setCurrentPage(1)
  }
  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }
  return (
    <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left">
              Taxonomy Manager
            </h1>
            <p className="text-sm text-gray-500 text-center sm:text-left">
              Create, organize, and manage taxonomies used across the platform —
              including categories, tags, and facets.
            </p>
            <div className="flex items-center gap-2 mt-2 text-center sm:text-left justify-center sm:justify-start">
              {isLoadingFacets && (
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <RefreshCwIcon className="h-3 w-3 animate-spin" />
                  Loading {vendureFacets.length > 0 ? 'more ' : ''}facets from Vendure...
                </p>
              )}
              {!isLoadingFacets && vendureFacets.length > 0 && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  ✓ Loaded {vendureFacets.length} facets from Vendure
                </p>
              )}
              {facetsError && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-red-600">
                    Error: {facetsError}
                  </p>
                  <button
                    onClick={fetchFacets}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Retry
                  </button>
                </div>
              )}
              {!isLoadingFacets && !facetsError && vendureFacets.length === 0 && (
                <button
                  onClick={fetchFacets}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <RefreshCwIcon className="h-3 w-3" />
                  Load Vendure facets
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add New Taxonomy
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {summaryData.map((item) => (
          <div
            key={item.id}
            className="rounded-xl shadow-sm border border-gray-100 bg-white px-3 py-4 hover:shadow-md transition-all duration-200 ease-in-out"
          >
            <div className="flex items-center">
              <div className={`p-2.5 rounded-full ${item.color} mr-3`}>
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-[13px] text-gray-600 font-medium">
                  {item.title}
                </h3>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                  {item.count}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="text-green-500">+3%</span> from last week
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="sticky top-[3.5rem] bg-gray-50 z-20 pb-2">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-xs"
                placeholder="Search taxonomies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Chips */}
            <div className="flex overflow-x-auto gap-3 px-1 pb-2 scrollbar-hide">
              <div className="min-w-[140px] relative">
                <select
                  className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>

              <div className="min-w-[140px] relative">
                <select
                  className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value)}
                >
                  <option value="All">All Scopes</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="Content">Content</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>

              <div className="flex-shrink-0">
                <button className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                  <DownloadIcon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>

              {(activeTypeTab !== 0 ||
                statusFilter !== 'All' ||
                scopeFilter !== 'All' ||
                searchQuery) && (
                <div className="flex-shrink-0">
                  <button
                    className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Taxonomies Table - Desktop View */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 hidden md:block mt-2">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Taxonomies
              </h2>
              {filteredTaxonomies.length > 0 && (
                <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                  Showing {startIndex + 1}-{endIndex} of{' '}
                  {filteredTaxonomies.length} taxonomies
                </p>
              )}
            </div>

            {/* Type Tabs */}
            <div className="border-b border-gray-200 -mb-px">
              <TabsSimple
                sections={typeTabs}
                activeTabIndex={activeTypeTab}
                onTabChange={setActiveTypeTab}
                data-id="taxonomy-type-tabs"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Scope
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Values Count
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                  Last Updated
                </th>
                <th className="relative px-4 py-3 w-16">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedTaxonomies.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    No taxonomies found
                  </td>
                </tr>
              ) : (
                paginatedTaxonomies.map((taxonomy) => (
                  <tr
                    key={taxonomy.id}
                    onClick={() => handleRowClick(taxonomy.id)}
                    onKeyDown={(e) => handleRowKeyDown(e, taxonomy.id)}
                    tabIndex={0}
                    role="button"
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                    aria-label={`View details for ${taxonomy.name}`}
                  >
                    <td className="px-4 py-3 text-[13px] font-medium text-gray-900">
                      {taxonomy.name}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {renderType(taxonomy.type)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {renderScope(taxonomy.scope)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 text-center">
                      {taxonomy.valuesCount}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {renderStatus(taxonomy.status)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      {formatDate(taxonomy.lastUpdated)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-right text-gray-500">
                      <div className="flex items-center justify-end space-x-2">
                        <EyeIcon className="h-4 w-4 text-gray-500" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Taxonomies Mobile Card View */}
      <div className="md:hidden space-y-3 mt-2">
        {/* Mobile Type Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-3">
          <TabsSimple
            sections={typeTabs}
            activeTabIndex={activeTypeTab}
            onTabChange={setActiveTypeTab}
            data-id="taxonomy-type-tabs-mobile"
          />
        </div>

        {paginatedTaxonomies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-500">No taxonomies found</p>
          </div>
        ) : (
          paginatedTaxonomies.map((taxonomy) => (
            <div
              key={taxonomy.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200"
              onClick={() => handleRowClick(taxonomy.id)}
              onKeyDown={(e) => handleRowKeyDown(e, taxonomy.id)}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${taxonomy.name}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-900 leading-snug pr-2">
                  {taxonomy.name}
                </h3>
                {renderStatus(taxonomy.status)}
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-[12px] mb-3">
                <div>
                  <span className="text-gray-500">Type:</span>{' '}
                  {renderType(taxonomy.type)}
                </div>
                <div>
                  <span className="text-gray-500">Scope:</span>{' '}
                  {renderScope(taxonomy.scope)}
                </div>
                <div>
                  <span className="text-gray-500">Values:</span>{' '}
                  <span className="font-medium">{taxonomy.valuesCount}</span>
                </div>
                <div>
                  <span className="text-gray-500">Updated:</span>{' '}
                  <span className="font-medium">
                    {formatDate(taxonomy.lastUpdated)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="text-[11px] text-gray-500">
                  {taxonomy.createdBy}
                </div>
                <button className="text-blue-600 text-[12px] font-medium flex items-center">
                  View
                  <EyeIcon className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {filteredTaxonomies.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mt-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <label
              htmlFor="rows-per-page"
              className="text-[12px] sm:text-sm text-gray-600 mr-2"
            >
              Rows per page:
            </label>
            <select
              id="rows-per-page"
              className="border border-gray-300 rounded-md text-[12px] sm:text-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center justify-center">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm border border-gray-300 rounded-l-md hover:bg-gray-50 transition-colors duration-150 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <div className="hidden sm:flex">
                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, i) => i + 1,
                )
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    )
                  })
                  .map((page, i, arr) => (
                    <Fragment key={page}>
                      {i > 0 && arr[i - 1] !== page - 1 && (
                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm text-gray-500 border-t border-b border-gray-300">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm border-t border-b border-gray-300 ${currentPage === page ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        {page}
                      </button>
                    </Fragment>
                  ))}
              </div>
              <div className="flex sm:hidden items-center border-t border-b border-gray-300 px-3 py-1">
                <span className="text-[12px] text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm border border-gray-300 rounded-r-md hover:bg-gray-50 transition-colors duration-150 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="text-[12px] sm:text-sm text-gray-600 text-center sm:text-left">
              Showing {startIndex + 1}-{endIndex} of {filteredTaxonomies.length}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTaxonomies.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center mt-2">
          <div className="mx-auto max-w-md">
            <div className="bg-gray-100 p-4 sm:p-6 rounded-full inline-flex items-center justify-center mb-4">
              <FilterIcon className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No taxonomies found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your search or filter criteria to find what you're
              looking for.
            </p>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              onClick={handleClearFilters}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-16 right-5 sm:bottom-6 sm:right-6 z-30">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Add new taxonomy"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Create Taxonomy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-black bg-opacity-30"
              onClick={() => setShowCreateModal(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Create New Taxonomy
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Choose the type of taxonomy you want to create:
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleCreateTaxonomy('Collection')}
                      className="w-full flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-150 text-left group"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <LayersIcon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          Collection
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Hierarchical categories with parent-child
                          relationships
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleCreateTaxonomy('Facet')}
                      className="w-full flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-150 text-left group"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <FolderIcon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          Facet
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Filterable attributes with predefined values (color,
                          size, etc.)
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleCreateTaxonomy('Tag')}
                      className="w-full flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-150 text-left group"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <TagIcon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          Tag
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Simple labels for flexible content organization
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Taxonomy Details Drawer */}
      {selectedTaxonomy && (
        <TaxonomyDetailsDrawer
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          taxonomy={selectedTaxonomy}
        />
      )}
    </div>
  )
}
