"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Heading1, Heading2, List } from "lucide-react";
import { Button } from "./ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[300px] text-base md:text-xl leading-relaxed tiptap-editor",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col bg-background/50 rounded-2xl border p-6 shadow-lg backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50">
      {/* The main editor content */}
      <div className="flex-1 overflow-y-auto mb-16">
        <EditorContent editor={editor} />
      </div>

      {/* Thumb Toolbar (Sticks to bottom, minimal footprint for mobile) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/90 p-2 rounded-full border shadow-xl backdrop-blur-xl">
        <Button
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="rounded-full w-10 h-10"
          type="button"
        >
          <Heading1 className="w-5 h-5" />
        </Button>
        <Button
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="rounded-full w-10 h-10"
          type="button"
        >
          <Heading2 className="w-5 h-5" />
        </Button>
        <Button
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="rounded-full w-10 h-10"
          type="button"
        >
          <List className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
