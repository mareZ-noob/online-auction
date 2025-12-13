import { Button } from "@/components/ui/button";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const blankParagraph = "<p></p>";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: boolean;
};

export default function RichTextEditor({
  value,
  onChange,
  onBlur,
  error,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
    ],
    content: value && value.trim().length ? value : blankParagraph,
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] whitespace-pre-wrap rounded-md border bg-background px-3 py-2 text-sm focus:outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const nextValue = currentEditor.getHTML();
      onChange(nextValue);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleBlur = () => {
      onBlur();
    };

    editor.on("blur", handleBlur);

    return () => {
      editor.off("blur", handleBlur);
    };
  }, [editor, onBlur]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextHTML = value && value.trim().length ? value : blankParagraph;
    const currentHTML = editor.getHTML();

    if (currentHTML === nextHTML) {
      return;
    }

    editor.commands.setContent(nextHTML, { emitUpdate: false });
  }, [editor, value]);

  const toolbarButtons = editor
    ? [
        {
          label: "Bold",
          onClick: () => editor.chain().focus().toggleBold().run(),
          isActive: editor.isActive("bold"),
          disabled: !editor.can().chain().focus().toggleBold().run(),
        },
        {
          label: "Italic",
          onClick: () => editor.chain().focus().toggleItalic().run(),
          isActive: editor.isActive("italic"),
          disabled: !editor.can().chain().focus().toggleItalic().run(),
        },
        {
          label: "Strike",
          onClick: () => editor.chain().focus().toggleStrike().run(),
          isActive: editor.isActive("strike"),
          disabled: !editor.can().chain().focus().toggleStrike().run(),
        },
        {
          label: "Code",
          onClick: () => editor.chain().focus().toggleCodeBlock().run(),
          isActive: editor.isActive("codeBlock"),
          disabled: !editor.can().chain().focus().toggleCodeBlock().run(),
        },
        {
          label: "H1",
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: editor.isActive("heading", { level: 1 }),
          disabled: !editor
            .can()
            .chain()
            .focus()
            .toggleHeading({ level: 1 })
            .run(),
        },
        {
          label: "H2",
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: editor.isActive("heading", { level: 2 }),
          disabled: !editor
            .can()
            .chain()
            .focus()
            .toggleHeading({ level: 2 })
            .run(),
        },
        {
          label: "H3",
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: editor.isActive("heading", { level: 3 }),
          disabled: !editor
            .can()
            .chain()
            .focus()
            .toggleHeading({ level: 3 })
            .run(),
        },
        {
          label: "H4",
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 4 }).run(),
          isActive: editor.isActive("heading", { level: 4 }),
          disabled: !editor
            .can()
            .chain()
            .focus()
            .toggleHeading({ level: 4 })
            .run(),
        },
        {
          label: "Bullet List",
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          isActive: editor.isActive("bulletList"),
          disabled: !editor.can().chain().focus().toggleBulletList().run(),
        },
        {
          label: "Ordered List",
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: editor.isActive("orderedList"),
          disabled: !editor.can().chain().focus().toggleOrderedList().run(),
        },
        {
          label: "Undo",
          onClick: () => editor.chain().focus().undo().run(),
          isActive: false,
          disabled: !editor.can().undo(),
        },
        {
          label: "Redo",
          onClick: () => editor.chain().focus().redo().run(),
          isActive: false,
          disabled: !editor.can().redo(),
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {toolbarButtons.map(({ label, onClick, isActive, disabled }) => (
          <Button
            key={label}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            onClick={onClick}
            disabled={!editor || disabled}
          >
            {label}
          </Button>
        ))}
      </div>
      <div
        className={cn(
          "rounded-md border bg-background",
          error ? "border-destructive" : "border-input"
        )}
      >
        <EditorContent
          className="prose prose-neutral max-w-none"
          editor={editor}
        />
      </div>
    </div>
  );
}
