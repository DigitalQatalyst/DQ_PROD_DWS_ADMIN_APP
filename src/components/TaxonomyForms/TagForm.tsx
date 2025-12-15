import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from 'lucide-react'
import { mockTaxonomies } from '../../utils/mockData'

type TagFormProps = {
  tagId?: string // Optional for editing existing tags
}

export const TagForm: React.FC<TagFormProps> = ({ tagId }) => {
  const navigate = useNavigate()
  const isEditMode = !!tagId

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#3b82f6', // Default blue color
    description: '',
    scope: 'Marketplace',
    visibility: 'Public',
  })

  // Load existing tag data when in edit mode
  useEffect(() => {
    if (isEditMode && tagId) {
      // Find the tag in mock data
      const existingTag = mockTaxonomies.find(
        (t) => t.id === tagId && t.type === 'Tag',
      )

      if (existingTag) {
        // Populate form data
        setFormData({
          name: existingTag.name || '',
          slug: existingTag.slug || '',
          color: existingTag.color || '#3b82f6',
          description: existingTag.description || '',
          scope: existingTag.scope || 'Marketplace',
          visibility: existingTag.visibility || 'Public',
        })
      }
    }
  }, [isEditMode, tagId])

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const tagData = {
      ...formData,
      id: tagId || Date.now().toString(),
      createdAt: new Date().toISOString(),
      usageCount: 0,
    }

    console.log('Tag submitted:', tagData)
    // TODO: Save to backend

    navigate('/taxonomy-manager')
  }

  // Predefined color options
  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Gray', value: '#6b7280' },
  ]

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
              {isEditMode ? 'Edit Tag' : 'Create New Tag'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Tags are simple labels for flexible content organization and
              filtering
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Tag Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Define the properties of this tag
              </p>
            </div>
            <div className="p-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tag Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Featured, New Arrival, Best Seller, Seasonal"
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
                  URL-friendly version of the tag name
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
                  placeholder="Describe the purpose or usage of this tag..."
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
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Appearance</h2>
              <p className="mt-1 text-sm text-gray-500">
                Customize how this tag appears in the UI
              </p>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tag Color *
              </label>

              {/* Color Picker Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color: color.value }))
                    }
                    className={`h-10 w-10 rounded-lg border-2 transition-all hover:scale-110 ${
                      formData.color === color.value
                        ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label
                    htmlFor="color"
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    Custom Color (Hex)
                  </label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    placeholder="#3b82f6"
                  />
                </div>
                <div className="pt-5">
                  <div
                    className="h-10 w-10 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
              </div>

              {/* Tag Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Preview:
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: formData.color + '20',
                      color: formData.color,
                      border: `1px solid ${formData.color}40`,
                    }}
                  >
                    {formData.name || 'Tag Name'}
                  </span>
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium"
                    style={{
                      backgroundColor: formData.color,
                      color: '#ffffff',
                    }}
                  >
                    {formData.name || 'Tag Name'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              💡 Tag Best Practices
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Keep tag names short and descriptive</li>
              <li>Use consistent naming conventions across similar tags</li>
              <li>Avoid creating too many similar tags</li>
              <li>
                Tags are flexible - they can be applied to any content or item
              </li>
              <li>Choose colors that visually group related tags</li>
            </ul>
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
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {isEditMode ? 'Update Tag' : 'Create Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
