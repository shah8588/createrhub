"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code, Minus, Undo, Redo, Link as LinkIcon,
} from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={cn(
      "rounded p-1.5 text-xs transition-colors",
      active ? "bg-surface-border text-paper" : "text-muted hover:bg-surface-border hover:text-paper",
      disabled && "cursor-not-allowed opacity-40"
    )}
  >
    {children}
  </button>
);

export default function TiptapEditor({ value, onChange, placeholder, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-accent underline" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Write your lesson content here…" }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none min-h-48 p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. lesson switch)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border border-surface-border bg-surface-2", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-surface-border px-2 py-1.5">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">
          <Code className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px bg-surface-border" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Add link">
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px bg-surface-border" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
