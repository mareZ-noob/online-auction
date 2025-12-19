import { Button } from "@/components/ui/button";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const blankParagraph = "<p></p>";

type ToolbarButton = {
  label: string;
  onClick: () => void;
  isActive: boolean;
  disabled: boolean;
};

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
  const { t } = useTranslation();
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

  const toolbarButtons = useMemo<ToolbarButton[]>(() => {
    if (!editor) {
      return [];
    }

    return [
      {
        label: t("publish.editor.bold"),
        onClick: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive("bold"),
        disabled: !editor.can().chain().focus().toggleBold().run(),
      },
      {
        label: t("publish.editor.italic"),
        onClick: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive("italic"),
        disabled: !editor.can().chain().focus().toggleItalic().run(),
      },
      {
        label: t("publish.editor.strike"),
        onClick: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive("strike"),
        disabled: !editor.can().chain().focus().toggleStrike().run(),
      },
      {
        label: t("publish.editor.code"),
        onClick: () => editor.chain().focus().toggleCodeBlock().run(),
        isActive: editor.isActive("codeBlock"),
        disabled: !editor.can().chain().focus().toggleCodeBlock().run(),
      },
      {
        label: t("publish.editor.heading1"),
        onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: editor.isActive("heading", { level: 1 }),
        disabled: !editor
          .can()
          .chain()
          .focus()
          .toggleHeading({ level: 1 })
          .run(),
      },
      {
        label: t("publish.editor.heading2"),
        onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive("heading", { level: 2 }),
        disabled: !editor
          .can()
          .chain()
          .focus()
          .toggleHeading({ level: 2 })
          .run(),
      },
      {
        label: t("publish.editor.heading3"),
        onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: editor.isActive("heading", { level: 3 }),
        disabled: !editor
          .can()
          .chain()
          .focus()
          .toggleHeading({ level: 3 })
          .run(),
      },
      {
        label: t("publish.editor.heading4"),
        onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
        isActive: editor.isActive("heading", { level: 4 }),
        disabled: !editor
          .can()
          .chain()
          .focus()
          .toggleHeading({ level: 4 })
          .run(),
      },
      {
        label: t("publish.editor.bulletList"),
        onClick: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive("bulletList"),
        disabled: !editor.can().chain().focus().toggleBulletList().run(),
      },
      {
        label: t("publish.editor.orderedList"),
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive("orderedList"),
        disabled: !editor.can().chain().focus().toggleOrderedList().run(),
      },
      {
        label: t("publish.editor.undo"),
        onClick: () => editor.chain().focus().undo().run(),
        isActive: false,
        disabled: !editor.can().undo(),
      },
      {
        label: t("publish.editor.redo"),
        onClick: () => editor.chain().focus().redo().run(),
        isActive: false,
        disabled: !editor.can().redo(),
      },
    ];
  }, [editor, t]);

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
