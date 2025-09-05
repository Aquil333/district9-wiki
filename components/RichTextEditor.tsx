"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  Image as ImageIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-400 hover:text-purple-300 underline'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4'
        }
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] p-6 focus:outline-none',
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Введите URL изображения:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Введите URL ссылки:');
    if (url) {
      editor.chain().focus().toggleLink({ href: url }).run();
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    active = false, 
    disabled = false,
    children,
    title
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded transition-colors
        ${active 
          ? 'bg-purple-500/20 text-purple-400' 
          : 'hover:bg-white/10 text-gray-400 hover:text-white'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div className="w-px h-6 bg-white/20 mx-1" />
  );

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 bg-white/5 border border-white/10 rounded-t-lg">
        {/* История */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Отменить"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Повторить"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Заголовки */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Заголовок 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Заголовок 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Заголовок 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Форматирование текста */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Жирный"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Курсив"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Подчеркнутый"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Зачеркнутый"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Код"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Списки */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Маркированный список"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Нумерованный список"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Цитата"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Горизонтальная линия"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Вставки */}
        <ToolbarButton
          onClick={addLink}
          active={editor.isActive('link')}
          title="Добавить ссылку"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={addImage}
          title="Добавить изображение"
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="bg-white/5 border border-t-0 border-white/10 rounded-b-lg">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        /* Стили для редактора */
        .ProseMirror {
          min-height: 400px;
          padding: 1.5rem;
          outline: none;
        }

        .ProseMirror p {
          margin-bottom: 1rem;
        }

        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .ProseMirror h2 {
          font-size: 1.75rem;
          font-weight: bold;
          margin-bottom: 0.875rem;
        }

        .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .ProseMirror li {
          margin-bottom: 0.25rem;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #a855f7;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #d1d5db;
        }

        .ProseMirror code {
          background: rgba(139, 92, 246, 0.2);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          color: #c084fc;
          font-family: monospace;
        }

        .ProseMirror pre {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 0.375rem;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
        }

        .ProseMirror hr {
          border: none;
          border-top: 2px solid rgba(255, 255, 255, 0.1);
          margin: 2rem 0;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #6b7280;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}