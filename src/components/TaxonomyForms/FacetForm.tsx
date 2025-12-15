import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, PlusIcon, XIcon, GripVerticalIcon } from 'lucide-react'
import { mockTaxonomies } from '../../utils/mockData'

type FacetFormProps = {
  facetId?: string // Optional for editing existing facets
}

type FacetValue = {
  id: string
  name: string
  code: string
}

export const FacetForm: React.FC<FacetFormProps> = ({ facetId }) => {
  const navigate = useNavigate()
  const isEditMode = !!facetId

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    scope: 'Marketplace',
    visibility: 'Public',
    isPrivate: false,
  })

  const [facetValues, setFacetValues] = useState<FacetValue[]>([])
  const [newValueName, setNewValueName] = useState('')

  // Load existing facet data when in edit mode
  useEffect(() => {
    if (isEditMode && facetId) {
      // Find the facet in mock data
      const existingFacet = mockTaxonomies.find(
        (t) => t.id === facetId && t.type === 'Facet',
      )

      if (existingFacet) {
        // Populate form data
        setFormData({
          name: existingFacet.name || '',
          code: existingFacet.code || existingFacet.slug || '',
          scope: existingFacet.scope || 'Marketplace',
          visibility: existingFacet.visibility || 'Public',
          isPrivate: existingFacet.isPrivate || false,
        })

        // Load facet values if available
        if (existingFacet.values && Array.isArray(existingFacet.values)) {
          setFacetValues(existingFacet.values)
        }
      }
    }
  }, [isEditMode, facetId])

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Auto-generate code from name
    if (name === 'name' && !isEditMode) {
      const code = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData((prev) => ({ ...prev, code }))
    }
  }

  // Handle facet value management
  const addFacetValue = () => {
    if (!newValueName.trim()) return

    const code = newValueName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const newValue: FacetValue = {
      id: Date.now().toString(),
      name: newValueName.trim(),
      code,
    }

    setFacetValues([...facetValues, newValue])
    setNewValueName('')
  }

  const removeFacetValue = (id: string) => {
    setFacetValues(facetValues.filter((v) => v.id !== id))
  }

  const updateFacetValue = (
    id: string,
    field: keyof FacetValue,
    value: string,
  ) => {
    setFacetValues(
      facetValues.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addFacetValue()
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const facetData = {
      ...formData,
      values: facetValues,
      id: facetId || Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    console.log('Facet submitted:', facetData)
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
              {isEditMode ? 'Edit Facet' : 'Create New Facet'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Facets are filterable attributes with predefined values (e.g.,
              color, size, material)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Facet Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Define the basic properties of this facet
              </p>
            </div>
            <div className="p-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Facet Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Color, Size, Material, Brand"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Code *
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-gray-600"
                  placeholder="auto-generated-code"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Unique identifier for API and internal use
                </p>
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
                  Private facet (hidden from public filters)
                </label>
              </div>
            </div>
          </div>

          {/* Facet Values Section */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Facet Values
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Add all possible values for this facet
              </p>
            </div>
            <div className="p-4">
              {/* Add New Value Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newValueName}
                  onChange={(e) => setNewValueName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter facet value name (e.g., Red, Large, Cotton)"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addFacetValue}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>

              {/* Values List */}
              {facetValues.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm">
                    No values added yet. Add values using the input above.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {facetValues.map((value, index) => (
                    <div
                      key={value.id}
                      className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <GripVerticalIcon className="h-5 w-5 text-gray-400 cursor-move" />
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Value Name
                          </label>
                          <input
                            type="text"
                            value={value.name}
                            onChange={(e) =>
                              updateFacetValue(value.id, 'name', e.target.value)
                            }
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Code
                          </label>
                          <input
                            type="text"
                            value={value.code}
                            onChange={(e) =>
                              updateFacetValue(value.id, 'code', e.target.value)
                            }
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-gray-600"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFacetValue(value.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {facetValues.length > 0 && (
                <p className="mt-3 text-xs text-gray-500">
                  💡 Tip: Drag values to reorder them. Values are displayed in
                  this order in filters.
                </p>
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
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {isEditMode ? 'Update Facet' : 'Create Facet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
