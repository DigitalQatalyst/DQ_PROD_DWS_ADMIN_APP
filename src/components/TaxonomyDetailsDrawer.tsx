import React, { useEffect, useState, useRef, Children } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  XIcon,
  MaximizeIcon,
  MinimizeIcon,
  CopyIcon,
  DownloadIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  TagIcon,
  LayersIcon,
  FolderIcon,
  CheckCircleIcon,
  ArchiveIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  GripVerticalIcon,
  MoveIcon,
} from 'lucide-react'
import { createFocusTrap } from 'focus-trap'
import { TabsSimple } from './TabVariations'
import type { SimpleSection } from './TabVariations'
type TaxonomyDetailsDrawerProps = {
  isOpen: boolean
  onClose: () => void
  taxonomy: any
}
export function TaxonomyDetailsDrawer({
  isOpen,
  onClose,
  taxonomy,
}: TaxonomyDetailsDrawerProps) {
  const navigate = useNavigate()
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const drawerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const lastFocusedElementRef = useRef<HTMLElement | null>(null)
  const focusTrapRef = useRef<ReturnType<typeof createFocusTrap> | null>(null)
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  // Set up focus trap
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement
      focusTrapRef.current = createFocusTrap(drawerRef.current, {
        fallbackFocus: drawerRef.current,
        escapeDeactivates: false,
        allowOutsideClick: true,
      })
      setTimeout(() => {
        focusTrapRef.current?.activate()
      }, 100)
    }
    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate()
        if (lastFocusedElementRef.current) {
          lastFocusedElementRef.current.focus()
        }
      }
    }
  }, [isOpen])
  // Prevent body scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isOpen])
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        e.preventDefault()
        if (isExpanded) {
          toggleExpanded()
        } else {
          handleClose()
        }
      }
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault()
        toggleExpanded()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isExpanded])
  // Apply content scale effect
  useEffect(() => {
    if (isOpen && contentRef.current && !prefersReducedMotion.current) {
      contentRef.current.style.transform = 'scale(0.98)'
      contentRef.current.style.opacity = '0'
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transform = 'scale(1)'
          contentRef.current.style.opacity = '1'
        }
      }, 50)
    }
  }, [isOpen])
  if (!isOpen) return null
  // Get tabs based on taxonomy type
  const getAvailableTabs = (): SimpleSection[] => {
    if (taxonomy.type === 'Collection') {
      return [
        {
          id: 'details',
          title: 'Details',
        },
        {
          id: 'hierarchy',
          title: 'Hierarchy',
        },
        {
          id: 'assignments',
          title: 'Assignments',
        },
      ]
    } else if (taxonomy.type === 'Facet') {
      return [
        {
          id: 'details',
          title: 'Details',
        },
        {
          id: 'values',
          title: 'Facet Values',
        },
        {
          id: 'assignments',
          title: 'Assignments',
        },
      ]
    } else {
      // Tag
      return [
        {
          id: 'details',
          title: 'Details',
        },
        {
          id: 'usage',
          title: 'Usage',
        },
      ]
    }
  }
  const availableTabs = getAvailableTabs()
  const getActiveTabId = () => {
    return availableTabs[activeTabIndex]?.id || 'details'
  }
  const copyDeepLink = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('taxonomyId', taxonomy.id)
    navigator.clipboard.writeText(url.toString())
    alert('Link copied to clipboard!')
  }
  const exportPdf = () => {
    alert('Exporting taxonomy details as PDF...')
  }
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }
  const handleClose = () => {
    if (focusTrapRef.current) {
      focusTrapRef.current.deactivate()
    }
    const url = new URL(window.location.href)
    url.searchParams.delete('taxonomyId')
    window.history.replaceState({}, '', url.toString())
    onClose()
  }

  const handleEdit = () => {
    // Navigate to the appropriate edit page based on taxonomy type
    if (taxonomy.type === 'Collection') {
      navigate(`/taxonomy-manager/collection/${taxonomy.id}`)
    } else if (taxonomy.type === 'Facet') {
      navigate(`/taxonomy-manager/facet/${taxonomy.id}`)
    } else if (taxonomy.type === 'Tag') {
      navigate(`/taxonomy-manager/tag/${taxonomy.id}`)
    }
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
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
  // Toggle node expansion in tree
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }
  // Render tree node recursively for Collections
  const renderTreeNode = (node: any, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const indent = level * 24
    return (
      <div key={node.id}>
        <div
          className="flex items-center py-2 px-3 hover:bg-gray-50 rounded-md group cursor-pointer"
          style={{
            paddingLeft: `${indent + 12}px`,
          }}
        >
          <button
            onClick={() => hasChildren && toggleNode(node.id)}
            className="mr-2 text-gray-400 hover:text-gray-600"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>
          <GripVerticalIcon className="w-4 h-4 text-gray-300 mr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
          <LayersIcon className="w-4 h-4 text-blue-500 mr-2" />
          <span className="text-sm text-gray-900 flex-1">{node.name}</span>
          {node.usageCount !== undefined && (
            <span className="text-xs text-gray-500 mr-2">
              {node.usageCount} items
            </span>
          )}
          {renderStatus(node.status)}
          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
              <EditIcon className="w-3 h-3" />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child: any) =>
              renderTreeNode(child, level + 1),
            )}
          </div>
        )}
      </div>
    )
  }
  // Render Details tab (common for all types)
  const renderDetails = () => (
    <div className="px-6 lg:px-8">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Basic Information
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue={taxonomy.name}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Slug</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue={taxonomy.slug}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue={taxonomy.description}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              {renderType(taxonomy.type)}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Scope</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option
                  value="Marketplace"
                  selected={taxonomy.scope === 'Marketplace'}
                >
                  Marketplace
                </option>
                <option value="Content" selected={taxonomy.scope === 'Content'}>
                  Content
                </option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Active" selected={taxonomy.status === 'Active'}>
                  Active
                </option>
                <option
                  value="Archived"
                  selected={taxonomy.status === 'Archived'}
                >
                  Archived
                </option>
              </select>
            </div>
            {taxonomy.type === 'Collection' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Display Order
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={taxonomy.displayOrder || 0}
                />
              </div>
            )}
          </div>
          {taxonomy.type === 'Collection' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Parent Collection
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">None (Root Level)</option>
                <option value="1">Business Stage</option>
                <option value="2">Service Category</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Metadata</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Created By
            </label>
            <p className="text-sm text-gray-700">{taxonomy.createdBy}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Last Updated
            </label>
            <p className="text-sm text-gray-700">
              {formatDate(taxonomy.lastUpdated)}
            </p>
          </div>
          {taxonomy.type === 'Tag' && taxonomy.usageCount !== undefined && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Total Usage
              </label>
              <p className="text-sm font-medium text-gray-900">
                {taxonomy.usageCount} items
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {taxonomy.status === 'Active' ? (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-150"
            >
              <ArchiveIcon className="h-4 w-4 mr-1.5" />
              Archive
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1.5" />
              Activate
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            <TrashIcon className="h-4 w-4 mr-1.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
  // Render Hierarchy tab (Collections only)
  const renderHierarchy = () => (
    <div className="px-6 lg:px-8">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-800">
          Collection Hierarchy
        </h3>
        <button
          type="button"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Child Collection
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs text-gray-500 mb-3 flex items-center">
          <MoveIcon className="w-3 h-3 mr-1" />
          Drag to reorder collections
        </div>
        {taxonomy.children && taxonomy.children.length > 0 ? (
          <div className="space-y-1">
            {taxonomy.children.map((child: any) => renderTreeNode(child, 0))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <LayersIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No child collections yet</p>
            <p className="text-xs mt-1">
              Click "Add Child Collection" to create one
            </p>
          </div>
        )}
      </div>
    </div>
  )
  // Render Values tab (Facets only)
  const renderValues = () => (
    <div className="px-6 lg:px-8">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-800">Facet Values</h3>
        <button
          type="button"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Value
        </button>
      </div>

      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Value Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-4 py-3 w-24">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {taxonomy.values && taxonomy.values.length > 0 ? (
                taxonomy.values.map((value: any) => (
                  <tr
                    key={value.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center">
                        <GripVerticalIcon className="w-4 h-4 text-gray-300 mr-2 cursor-move" />
                        <span>{value.displayOrder}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {value.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {value.code}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center">
                        <div
                          className="w-6 h-6 rounded border border-gray-300 mr-2"
                          style={{
                            backgroundColor: value.color,
                          }}
                        ></div>
                        <span className="text-xs text-gray-500">
                          {value.color}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="text-xs text-gray-500">
                        {value.icon}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      {value.usageCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {renderStatus(value.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          aria-label="Edit value"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          aria-label="Delete value"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No values yet. Click "Add Value" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
  // Render Usage tab (Tags only)
  const renderUsage = () => (
    <div className="px-6 lg:px-8">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Tag Usage</h3>
        <p className="text-sm text-gray-600">
          This tag is currently used in {taxonomy.usageCount || 0} items across
          the platform.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-3">
          Individual Tags
        </h4>
        {taxonomy.tags && taxonomy.tags.length > 0 ? (
          <div className="space-y-2">
            {taxonomy.tags.map((tag: any) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <TagIcon className="w-4 h-4 text-emerald-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {tag.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    /{tag.slug}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-600">
                    {tag.usageCount} items
                  </span>
                  {renderStatus(tag.status)}
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <EditIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <TagIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No individual tags defined</p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
        <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Usage Details
        </h4>
        <p className="text-sm text-gray-500 mb-4">
          View detailed breakdown of where these tags are being used across
          services, content, and other resources.
        </p>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
        >
          View Usage Report
        </button>
      </div>
    </div>
  )
  // Render Assignments tab (Collections and Facets)
  const renderAssignments = () => (
    <div className="px-6 lg:px-8">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Usage & Assignments
        </h3>
        <p className="text-sm text-gray-600">
          This {taxonomy.type.toLowerCase()} is currently assigned to{' '}
          {taxonomy.valuesCount} items across the platform.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
        <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Assignment Details
        </h4>
        <p className="text-sm text-gray-500 mb-4">
          View and manage where this {taxonomy.type.toLowerCase()} is being used
          across services, content, and other resources.
        </p>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
        >
          View All Assignments
        </button>
      </div>
    </div>
  )
  const getDrawerWidth = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 767) {
      return '100vw'
    }
    if (typeof window !== 'undefined' && window.innerWidth <= 1279) {
      return isExpanded ? '100vw' : '60vw'
    }
    return isExpanded ? '100vw' : '40vw'
  }
  const transitionClass = prefersReducedMotion.current
    ? ''
    : 'transition-all duration-300 ease-in-out'
  const overlayOpacity =
    typeof window !== 'undefined' && window.innerWidth <= 767
      ? 'opacity-50'
      : 'opacity-30'
  const renderTabContent = () => {
    const activeTabId = getActiveTabId()
    if (taxonomy.type === 'Collection') {
      switch (activeTabId) {
        case 'details':
          return renderDetails()
        case 'hierarchy':
          return renderHierarchy()
        case 'assignments':
          return renderAssignments()
        default:
          return renderDetails()
      }
    } else if (taxonomy.type === 'Facet') {
      switch (activeTabId) {
        case 'details':
          return renderDetails()
        case 'values':
          return renderValues()
        case 'assignments':
          return renderAssignments()
        default:
          return renderDetails()
      }
    } else {
      // Tag
      switch (activeTabId) {
        case 'details':
          return renderDetails()
        case 'usage':
          return renderUsage()
        default:
          return renderDetails()
      }
    }
  }
  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div
        className={`absolute inset-0 bg-black ${transitionClass} ${isOpen ? overlayOpacity : 'opacity-0'}`}
        onClick={isExpanded ? undefined : handleClose}
        aria-hidden="true"
      ></div>

      <div
        className={`fixed inset-y-0 right-0 ${transitionClass}`}
        style={{
          width: getDrawerWidth(),
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
        ref={drawerRef}
      >
        <div className="h-full bg-white shadow-xl overflow-hidden flex flex-col">
          <div
            ref={contentRef}
            className={`flex flex-col h-full ${transitionClass}`}
            style={{
              opacity: 1,
              transform: 'scale(1)',
            }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
              <div className={`${isExpanded ? 'mx-auto max-w-6xl' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center sm:items-start">
                    <button
                      type="button"
                      className="sm:hidden mr-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {taxonomy.name}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {renderType(taxonomy.type)}
                        {renderScope(taxonomy.scope)}
                        {renderStatus(taxonomy.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-2 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150"
                      onClick={handleEdit}
                      title="Edit"
                    >
                      <span className="sr-only">Edit</span>
                      <EditIcon className="h-5 w-5" />
                    </button>
                    {isExpanded && (
                      <>
                        <button
                          type="button"
                          className="hidden sm:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150"
                          onClick={exportPdf}
                          title="Export as PDF"
                        >
                          <span className="sr-only">Export as PDF</span>
                          <DownloadIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          className="hidden sm:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150"
                          onClick={copyDeepLink}
                          title="Copy Link"
                        >
                          <span className="sr-only">Copy Link</span>
                          <CopyIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="hidden sm:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150"
                      onClick={toggleExpanded}
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <span className="sr-only">
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </span>
                      {isExpanded ? (
                        <MinimizeIcon className="h-5 w-5" />
                      ) : (
                        <MaximizeIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="hidden sm:block rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150"
                      onClick={handleClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-[57px] sm:top-[72px] z-10 bg-white border-b border-gray-200">
              <div
                className={`${isExpanded ? 'mx-auto max-w-6xl' : ''} px-4 sm:px-6`}
              >
                <TabsSimple
                  sections={availableTabs}
                  activeTabIndex={activeTabIndex}
                  onTabChange={setActiveTabIndex}
                  data-id="taxonomy-details-tabs"
                />
              </div>
            </div>

            {/* Content */}
            <div
              className="flex-1 overflow-y-auto"
              style={{
                maxHeight: 'calc(100vh - 160px)',
              }}
            >
              <div className={`py-6 ${isExpanded ? 'mx-auto max-w-6xl' : ''}`}>
                {renderTabContent()}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-4 py-4 sm:px-6 shadow-inner">
              <div className={`${isExpanded ? 'mx-auto max-w-6xl' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
                  <button
                    type="button"
                    className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                    onClick={isExpanded ? toggleExpanded : handleClose}
                  >
                    {isExpanded ? 'Collapse' : 'Close'}
                  </button>
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    Save Changes
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  <span className="hidden sm:inline">
                    Keyboard shortcuts: Esc to close, Shift+Enter to toggle full
                    view
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
