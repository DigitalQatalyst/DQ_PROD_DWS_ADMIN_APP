import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import YouTube from '@tiptap/extension-youtube';
import TurndownService from 'turndown';
import { marked } from 'marked';

interface MarkdownEditorProps {
  value?: string; // Markdown value
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
  onUploadImage?: (file: File) => Promise<string>;
}

// Configure marked for HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Convert HTML to Markdown
const htmlToMarkdown = (html: string): string => {
  if (!html || html.trim() === '' || html === '<p></p>') {
    return '';
  }
  
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
  });
  
  // Handle images
  turndownService.addRule('images', {
    filter: 'img',
    replacement: (content, node: any) => {
      const alt = node.alt || '';
      const src = node.src || '';
      return `![${alt}](${src})`;
    }
  });
  
  // Handle YouTube embeds
  turndownService.addRule('youtube', {
    filter: (node: any) => {
      return node.nodeName === 'DIV' && 
             node.classList && 
             node.classList.contains('youtube-embed');
    },
    replacement: (content, node: any) => {
      const iframe = node.querySelector('iframe');
      if (iframe && iframe.src) {
        const url = iframe.src;
        const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (match) {
          return `![youtube](https://www.youtube.com/watch?v=${match[1]})`;
        }
      }
      return '';
    }
  });
  
  try {
    const markdown = turndownService.turndown(html).trim();
    return markdown.replace(/\n{3,}/g, '\n\n');
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    return '';
  }
};

// Convert Markdown to HTML
const markdownToHtml = (markdown: string): string => {
  if (!markdown || markdown.trim() === '') {
    return '';
  }
  
  try {
    let html = marked.parse(markdown) as string;
    
    // Convert YouTube links to embeds
    html = html.replace(
      /!\[youtube\]\(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)\)/g,
      '<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
    );
    
    return html;
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error);
    return markdown;
  }
};

export default function MarkdownEditor({
  value = '',
  onChange,
  placeholder = 'Write your content...',
  className = '',
  onUploadImage,
}: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // We'll use custom heading extension
      }),
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      YouTube.configure({
        controls: true,
        nocookie: false,
      }),
    ],
    content: value ? markdownToHtml(value) : '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // Update editor content when value prop changes (e.g., when editing existing content)
  useEffect(() => {
    if (editor && value !== undefined) {
      const htmlFromMarkdown = value ? markdownToHtml(value) : '';
      const currentHtml = editor.getHTML();
      
      // Only update if content actually changed
      if (htmlFromMarkdown !== currentHtml) {
        editor.commands.setContent(htmlFromMarkdown, false);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addImage = async () => {
    if (!onUploadImage) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const url = await onUploadImage(file);
          editor.chain().focus().setImage({ src: url }).run();
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    };
    input.click();
  };

  const addYouTubeVideo = () => {
    const url = prompt('Enter YouTube video URL:');
    if (url) {
      // Extract video ID from various YouTube URL formats
      let videoId = '';
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
        /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/,
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          videoId = match[1];
          break;
        }
      }
      
      if (videoId) {
        editor.chain().focus().setYoutubeVideo({ src: `https://www.youtube.com/embed/${videoId}` }).run();
      } else {
        alert('Invalid YouTube URL. Please enter a valid YouTube video URL.');
      }
    }
  };

  return (
    <div className={`border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden ${className}`}>
      <style>{`
        .tiptap-editor {
          border: none;
        }
        .tiptap-editor .ProseMirror {
          outline: none;
          min-height: 400px;
          padding: 24px;
        }
        .tiptap-editor .ProseMirror h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
          color: #111827;
        }
        .tiptap-editor .ProseMirror h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          color: #111827;
        }
        .tiptap-editor .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
          color: #111827;
        }
        .tiptap-editor .ProseMirror h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
          color: #111827;
        }
        .tiptap-editor .ProseMirror p {
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .tiptap-editor .ProseMirror ul, .tiptap-editor .ProseMirror ol {
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          padding-left: 1.75rem;
        }
        .tiptap-editor .ProseMirror blockquote {
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
        .tiptap-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        .tiptap-editor .ProseMirror iframe {
          max-width: 100%;
          border-radius: 0.5rem;
        }
        .tiptap-editor .ProseMirror .youtube-embed {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          margin: 1.5rem 0;
        }
        .tiptap-editor .ProseMirror .youtube-embed iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .tiptap-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          padding: 8px 12px;
          border-bottom: 1px solid #e5e7eb;
          background: #fafafa;
        }
        .tiptap-toolbar button {
          padding: 6px 12px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.15s;
        }
        .tiptap-toolbar button:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
        .tiptap-toolbar button.is-active {
          background: #dbeafe;
          border-color: #3b82f6;
          color: #1e40af;
        }
        .tiptap-toolbar select {
          padding: 6px 12px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
      `}</style>
      
      <div className="tiptap-toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <em>I</em>
        </button>
        
        <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />
        
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run();
            }
          }}
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' :
            editor.isActive('heading', { level: 4 }) ? '4' : '0'
          }
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>
        
        <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
        >
          Quote
        </button>
        
        <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />
        
        <button onClick={addImage}>
          📷 Image
        </button>
        <button onClick={addYouTubeVideo}>
          ▶️ Video
        </button>
        <button
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={editor.isActive('link') ? 'is-active' : ''}
        >
          🔗 Link
        </button>
        
        <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />
        
        <button onClick={() => editor.chain().focus().undo().run()}>
          ↶ Undo
        </button>
        <button onClick={() => editor.chain().focus().redo().run()}>
          ↷ Redo
        </button>
      </div>
      
      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
