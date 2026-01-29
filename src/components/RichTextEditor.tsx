import { useEffect, useRef, useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { uploadFile } from '../lib/storageProvider'

type Props = {
  valueHtml?: string
  onChange: (json: any, html: string, plainText: string) => void
  placeholder?: string
  className?: string
  onUploadImage?: (file: File) => Promise<string>
}

/**
 * Utility to convert potential markdown content to HTML
 * if it doesn't already appear to be HTML.
 */
const ensureHtml = (content: string): string => {
  if (!content) return ''
  const trimmed = content.trim()

  // If it starts with common HTML tags, assume it's already HTML
  if (trimmed.startsWith('<p') || trimmed.startsWith('<div') || trimmed.startsWith('<h') || trimmed.startsWith('<ul')) {
    return content
  }

  // Check for common markdown patterns
  const hasMarkdown = /^#+\s/m.test(content) ||
    /(\*\*|__)(.*?)\1/.test(content) ||
    /\[(.*?)\]\((.*?)\)/.test(content) ||
    /^\s*[-*+]\s/m.test(content) ||
    /^\s*\d+\.\s/m.test(content)

  if (hasMarkdown) {
    try {
      return marked.parse(content) as string
    } catch (e) {
      console.error('Failed to parse markdown:', e)
      return content
    }
  }

  return content
}

export default function RichTextEditor({
  valueHtml,
  onChange,
  placeholder = 'Write your article…',
  className = '',
  onUploadImage,
}: Props) {
  const [editorInstance, setEditorInstance] = useState<any>(null)
  const lastEmittedHtmlRef = useRef<string>('')
  const isApplyingFromProps = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Client-side only mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update editor when external valueHtml changes
  useEffect(() => {
    if (!mounted || !editorInstance || isApplyingFromProps.current) return

    const editor = editorInstance
    if (!editor) return

    // Convert potential markdown in initial data to HTML
    const html = ensureHtml(valueHtml || '')

    // Skip if it's our own echo
    if (lastEmittedHtmlRef.current !== '' && html === lastEmittedHtmlRef.current) {
      return
    }

    const currentHtml = editor.getData()

    // Update if HTML actually changed
    if (currentHtml !== html) {
      isApplyingFromProps.current = true
      editor.setData(html)
      setTimeout(() => {
        isApplyingFromProps.current = false
      }, 50)
    }
  }, [valueHtml, mounted, editorInstance])

  const handleEditorChange = (_event: any, editor: any) => {
    if (isApplyingFromProps.current) return

    const content = editor.getData()

    // Sanitize HTML - ensure we allow table tags now
    const sanitizedHtml = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote',
        'a',
        'img',
        // Table tags
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'width', 'height', 'style', 'rowspan', 'colspan'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    })

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = sanitizedHtml
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    lastEmittedHtmlRef.current = sanitizedHtml
    onChange(null, sanitizedHtml, plainText)
  }

  // Image upload adapter (unchanged but keeping context)
  const createImageUploadAdapter = (loader: any) => {
    return {
      upload: async () => {
        setUploading(true)
        try {
          const file = await loader.file
          let imageUrl: string
          if (onUploadImage) {
            imageUrl = await onUploadImage(file)
          } else {
            const result = await uploadFile({ file, dir: 'thumbnails' })
            imageUrl = result.publicUrl
          }
          return { default: imageUrl }
        } catch (error: any) {
          console.error('Image upload failed:', error)
          throw new Error(error?.message || 'Image upload failed')
        } finally {
          setUploading(false)
        }
      },
      abort: () => { },
    }
  }

  // CKEditor configuration
  const editorConfiguration: any = {
    placeholder,
    toolbar: {
      items: [
        'undo', 'redo',
        '|',
        'heading',
        '|',
        'bold', 'italic',
        '|',
        'numberedList', 'bulletedList',
        '|',
        'insertTable',
        '|',
        'blockQuote',
        '|',
        'link', 'imageUpload',
      ],
      shouldNotGroupWhenFull: true,
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
      ],
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells'
      ]
    },
    link: {
      decorators: {
        openInNewTab: {
          mode: 'manual',
          label: 'Open in a new tab',
          attributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
      },
    },
    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'imageTextAlternative',
        '|',
        'toggleImageCaption',
        '|',
        'imageResize',
      ],
      resizeUnit: 'px',
      resizeOptions: [
        {
          name: 'imageResize:original',
          label: 'Original',
          value: null,
        },
        {
          name: 'imageResize:50',
          label: '50%',
          value: '50',
        },
        {
          name: 'imageResize:75',
          label: '75%',
          value: '75',
        },
        {
          name: 'imageResize:100',
          label: '100%',
          value: '100',
        },
      ],
      styles: ['full', 'side', 'alignLeft', 'alignCenter', 'alignRight'],
    },
    simpleUpload: {
      uploadUrl: '', // Not used, we use custom adapter
    },
  }

  // Setup image upload adapter when editor is ready
  const handleEditorReady = (editor: any) => {
    setEditorInstance(editor)

    // Configure image upload adapter
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return createImageUploadAdapter(loader)
    }
  }

  if (!mounted) {
    return (
      <div className={`border rounded-lg bg-white ${className}`}>
        <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          Loading editor…
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md relative ${className}`}>
      {uploading && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-2 text-sm text-blue-700">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
          Uploading image...
        </div>
      )}
      <style>{`
        /* Modern CKEditor styling */
        .ck.ck-editor {
          border: none;
          position: relative;
        }
        .ck.ck-toolbar {
          position: sticky;
          top: 0;
          z-index: 10;
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background: #fafafa;
          padding: 8px 12px;
          border-radius: 0;
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
          transition: box-shadow 0.2s ease;
        }
        .ck.ck-toolbar .ck-toolbar__separator {
          background: #e5e7eb;
        }
        .ck.ck-button {
          border-radius: 4px;
          transition: all 0.15s ease;
        }
        .ck.ck-button:hover:not(.ck-disabled) {
          background: #f3f4f6;
        }
        .ck.ck-button.ck-on {
          background: #dbeafe;
          color: #1e40af;
        }
        .ck.ck-editor__main > .ck-editor__editable {
          border: none;
          border-radius: 0;
          min-height: 400px;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 16px;
          line-height: 1.7;
          color: #1f2937;
          background: #ffffff;
        }
        .ck.ck-editor__main > .ck-editor__editable:focus {
          outline: none;
          box-shadow: none;
        }
        .ck.ck-editor__main > .ck-editor__editable.ck-placeholder::before {
          color: #9ca3af;
          font-style: italic;
        }
        .ck-editor__editable h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
          color: #111827;
        }
        .ck-editor__editable h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          color: #111827;
        }
        .ck-editor__editable h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
          color: #111827;
        }
        .ck-editor__editable h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
          color: #111827;
        }
        .ck-editor__editable p {
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .ck-editor__editable ul, .ck-editor__editable ol {
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          padding-left: 1.75rem;
        }
        .ck-editor__editable ul {
          list-style-type: disc;
        }
        .ck-editor__editable ol {
          list-style-type: decimal;
        }
        .ck-editor__editable li {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .ck-editor__editable blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.25rem;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          font-style: italic;
          background-color: #eff6ff;
          color: #1e40af;
        }
        .ck-editor__editable a {
          color: #2563eb;
          text-decoration: underline;
          transition: color 0.15s ease;
        }
        .ck-editor__editable a:hover {
          color: #1d4ed8;
        }
        .ck-editor__editable img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        .ck-editor__editable figure {
          margin: 1.5rem 0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        .ck-editor__editable figure.image {
          text-align: center;
        }
        .ck-editor__editable figure.image img {
          display: inline-block;
        }
        .ck-editor__editable figcaption {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
          text-align: center;
        }
        
        /* Table Styles */
        .ck-editor__editable table {
          border-collapse: collapse;
          border-spacing: 0;
          width: 100%;
          height: 100%;
          border: 1px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .ck-editor__editable table td,
        .ck-editor__editable table th {
          min-width: 2em;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          text-align: left;
        }
        .ck-editor__editable table th {
          background-color: #f9fafb;
          font-weight: 700;
        }
      `}</style>
      <CKEditor
        editor={ClassicEditor as any}
        data=""
        config={editorConfiguration}
        onReady={handleEditorReady}
        onChange={handleEditorChange}
      />
    </div>
  )
}
