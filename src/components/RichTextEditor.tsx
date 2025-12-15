import { useEffect, useRef, useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import DOMPurify from 'dompurify'
import { uploadFile } from '../lib/storageProvider'

type Props = {
  valueJson?: any
  valueHtml?: string
  onChange: (json: any, html: string, plainText: string) => void
  placeholder?: string
  className?: string
  onUploadImage?: (file: File) => Promise<string>
}

export default function RichTextEditor({
  valueJson,
  valueHtml,
  onChange,
  placeholder = 'Write your article…',
  className = '',
  onUploadImage,
}: Props) {
  const editorRef = useRef<any>(null)
  const lastEmittedHtmlRef = useRef<string>('')
  const isApplyingFromProps = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Warn if valueJson is provided (we only use HTML)
  useEffect(() => {
    if (valueJson && import.meta.env.DEV) {
      console.warn(
        'RichTextEditor: valueJson prop is provided but ignored. CKEditor uses HTML as the source of truth. Convert JSON to HTML before passing to the editor.'
      )
    }
  }, [valueJson])

  // Client-side only mount (for SSR frameworks)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update editor when external valueHtml changes
  useEffect(() => {
    if (!mounted || !editorRef.current || isApplyingFromProps.current) return

    const editor = editorRef.current
    if (!editor) return

    const html = valueHtml || ''
    
    // Skip if it's our own echo
    if (lastEmittedHtmlRef.current !== '' && html === lastEmittedHtmlRef.current) {
      return
    }

    const currentHtml = editor.getData()
    
    // Update if HTML actually changed
    // This handles both initial load and updates when editing
    if (currentHtml !== html) {
      isApplyingFromProps.current = true
      editor.setData(html)
      // Small delay to ensure setData completes before resetting flag
      setTimeout(() => {
        isApplyingFromProps.current = false
      }, 50)
    }
  }, [valueHtml, mounted])

  const handleEditorChange = (_event: any, editor: any) => {
    // Don't process if we're applying data from props
    if (isApplyingFromProps.current) return

    const content = editor.getData()

    // Sanitize HTML
    const sanitizedHtml = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote',
        'a',
        'img',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'width', 'height', 'style'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    })

    // Extract plain text
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = sanitizedHtml
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    // Record what we're emitting to prevent echo loop
    lastEmittedHtmlRef.current = sanitizedHtml

    // Emit immediately - debouncing is handled in MarkdownEditor
    onChange(null, sanitizedHtml, plainText)
  }

  // Image upload adapter
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

          return {
            default: imageUrl,
          }
        } catch (error: any) {
          console.error('Image upload failed:', error)
          throw new Error(error?.message || 'Image upload failed')
        } finally {
          setUploading(false)
        }
      },
      abort: () => {
        // Cancel upload if needed
      },
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
        'blockQuote',
        '|',
        'link', 'imageUpload',
      ],
      shouldNotGroupWhenFull: true,
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1' as const, view: { name: 'h1', classes: 'ck-heading_heading1' }, title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2' as const, view: { name: 'h2', classes: 'ck-heading_heading2' }, title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3' as const, view: { name: 'h3', classes: 'ck-heading_heading3' }, title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4' as const, view: { name: 'h4', classes: 'ck-heading_heading4' }, title: 'Heading 4', class: 'ck-heading_heading4' },
      ],
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
    editorRef.current = editor

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
