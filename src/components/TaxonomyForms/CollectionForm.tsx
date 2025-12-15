import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, PlusIcon, XIcon } from 'lucide-react'
import { mockTaxonomies } from '../../utils/mockData'

type CollectionFormProps = {
  collectionId?: string // Optional for editing existing collections
}

type Filter = {
  id: string
  code: string
  operator: string
  value: string
}

export const CollectionForm: React.FC<CollectionFormProps> = ({
  collectionId,
}) => {
  const navigate = useNavigate()
  const isEditMode = !!collectionId

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    visibility: 'Public',
    scope: 'Marketplace',
    parentCollection: '',
    isPrivate: false,
    inheritFilters: true,
  })

  const [filters, setFilters] = useState<Filter[]>([])
  const [assets, setAssets] = useState<{ featuredAsset?: File; assets: File[] }>({
    assets: [],
  })

  // Load existing collection data when in edit mode
  useEffect(() => {
    if (isEditMode && collectionId) {
      // Find the collection in mock data
      const existingCollection = mockTaxonomies.find(
        (t) => t.id === collectionId && t.type === 'Collection',
      )

      if (existingCollection) {
        // Populate form data
        setFormData({
          name: existingCollection.name || '',
          slug: existingCollection.slug || '',
          description: existingCollection.description || '',
          visibility: existingCollection.visibility || 'Public',
          scope: existingCollection.scope || 'Marketplace',
          parentCollection: existingCollection.parentId || '',
          isPrivate: existingCollection.isPrivate || false,
          inheritFilters: existingCollection.inheritFilters || true,
        })

        // Load filters if available
        if (existingCollection.filters && Array.isArray(existingCollection.filters)) {
          setFilters(existingCollection.filters)
        }
      }
    }
  }, [isEditMode, collectionId])

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Auto-generate slug from name
    if (name === 'name' && !isEditMode) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  // Handle filter management
  const addFilter = () => {
    const newFilter: Filter = {
      id: Date.now().toString(),
      code: '',
      operator: 'contains',
      value: '',
    }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id))
  }

  const updateFilter = (id: string, field: keyof Filter, value: string) => {
    setFilters(
      filters.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    )
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const collectionData = {
      ...formData,
      filters: filters.filter((f) => f.code && f.value),
      assets,
      id: collectionId || Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    console.log('Collection submitted:', collectionData)
    // TODO: Save to backend

    navigate('/taxonomy-manager')
  }

  return (
    <div className="bg-gray-50 py-4 px-3 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/taxonomy-manager')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Collection' : 'Create New Collection'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Collections are hierarchical categories with parent-child
              relationships
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Basic Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Essential details about this collection
              </p>
            </div>
            <div className="p-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Electronics, Clothing, Services"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700"
                >
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-gray-600"
                  placeholder="auto-generated-slug"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL-friendly version of the name
                </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe this collection..."
                />
              </div>

              <div>
                <label
                  htmlFor="scope"
                  className="block text-sm font-medium text-gray-700"
                >
                  Scope *
                </label>
                <select
                  id="scope"
                  name="scope"
                  value={formData.scope}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Marketplace">Marketplace</option>
                  <option value="Content">Content</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="visibility"
                  className="block text-sm font-medium text-gray-700"
                >
                  Visibility *
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="parentCollection"
                  className="block text-sm font-medium text-gray-700"
                >
                  Parent Collection
                </label>
                <select
                  id="parentCollection"
                  name="parentCollection"
                  value={formData.parentCollection}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">None (Top Level)</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="services">Services</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select a parent collection to create a hierarchy
                </p>
              </div>

              <div className="sm:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPrivate"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Private collection (hidden from public)
                </label>
              </div>

              <div className="sm:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  id="inheritFilters"
                  name="inheritFilters"
                  checked={formData.inheritFilters}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="inheritFilters"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Inherit filters from parent collection
                </label>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Collection Filters
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Define rules to automatically include items in this
                    collection
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addFilter}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Filter
                </button>
              </div>
            </div>
            <div className="p-4">
              {filters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">
                    No filters added. Click "Add Filter" to create rules.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filters.map((filter, index) => (
                    <div
                      key={filter.id}
                      className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Field
                          </label>
                          <select
                            value={filter.code}
                            onChange={(e) =>
                              updateFilter(filter.id, 'code', e.target.value)
                            }
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select field...</option>
                            <option value="name">Name</option>
                            <option value="sku">SKU</option>
                            <option value="price">Price</option>
                            <option value="category">Category</option>
                            <option value="tag">Tag</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Operator
                          </label>
                          <select
                            value={filter.operator}
                            onChange={(e) =>
                              updateFilter(
                                filter.id,
                                'operator',
                                e.target.value,
                              )
                            }
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="contains">Contains</option>
                            <option value="equals">Equals</option>
                            <option value="startsWith">Starts with</option>
                            <option value="endsWith">Ends with</option>
                            <option value="greaterThan">Greater than</option>
                            <option value="lessThan">Less than</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Value
                          </label>
                          <input
                            type="text"
                            value={filter.value}
                            onChange={(e) =>
                              updateFilter(filter.id, 'value', e.target.value)
                            }
                            placeholder="Enter value..."
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFilter(filter.id)}
                        className="mt-6 p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pb-6">
            <button
              type="button"
              onClick={() => navigate('/taxonomy-manager')}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditMode ? 'Update Collection' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
