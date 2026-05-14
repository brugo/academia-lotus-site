"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3,
  List, ListOrdered, ImageIcon, Upload, AlignLeft, AlignCenter,
  AlignJustify, Undo, Redo, Type, Minus
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rich-content-image',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'rich-editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content from outside only if editor content is truly different
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `desc-${Date.now()}.${fileExt}`;
    const filePath = `services/content/${fileName}`;

    const { error } = await supabase.storage.from('images').upload(filePath, file, { upsert: true });

    if (error) {
      alert(`Erro no upload: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
    editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
    setUploading(false);

    // Reset file input
    e.target.value = '';
  }, [editor, supabase]);

  if (!editor) return null;

  const ToolButton = ({ onClick, isActive, children, title, disabled }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        isActive
          ? 'bg-gold-500/30 text-gold-400 border border-gold-500/40'
          : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-midnight-950 focus-within:border-gold-500/50 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-white/10 bg-midnight-900/50">
        {/* Text formatting */}
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Negrito (Ctrl+B)"
        >
          <Bold size={16} />
        </ToolButton>

        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Itálico (Ctrl+I)"
        >
          <Italic size={16} />
        </ToolButton>

        <ToolButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </ToolButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Headings */}
        <ToolButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph') && !editor.isActive('heading')}
          title="Texto Normal"
        >
          <Type size={16} />
        </ToolButton>

        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Subtítulo Grande"
        >
          <Heading2 size={16} />
        </ToolButton>

        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Subtítulo Pequeno"
        >
          <Heading3 size={16} />
        </ToolButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Lists */}
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Lista com Marcadores"
        >
          <List size={16} />
        </ToolButton>

        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Lista Numerada"
        >
          <ListOrdered size={16} />
        </ToolButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Alignment */}
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Alinhar à Esquerda"
        >
          <AlignLeft size={16} />
        </ToolButton>

        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Centralizar"
        >
          <AlignCenter size={16} />
        </ToolButton>

        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Justificar"
        >
          <AlignJustify size={16} />
        </ToolButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Horizontal Rule */}
        <ToolButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Linha Divisória"
        >
          <Minus size={16} />
        </ToolButton>

        {/* Image Upload */}
        <label
          title="Inserir Imagem"
          className={`p-2 rounded-lg transition-all cursor-pointer border border-transparent ${
            uploading
              ? 'text-gold-400 bg-gold-500/10 animate-pulse'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ImageIcon size={16} />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Undo/Redo */}
        <ToolButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo size={16} />
        </ToolButton>

        <ToolButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Refazer (Ctrl+Shift+Z)"
        >
          <Redo size={16} />
        </ToolButton>
      </div>

      {/* Editor Area */}
      <div className="relative">
        <EditorContent editor={editor} />
        {!content && placeholder && (
          <div className="absolute top-4 left-4 text-slate-600 pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>

    </div>
  );
}
