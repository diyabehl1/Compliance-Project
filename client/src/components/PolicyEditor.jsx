import { useCallback, useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Table2,
  Undo2,
} from "lucide-react";

const extensions = (placeholder) => [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  Placeholder.configure({ placeholder: placeholder || "Start writing your policy…" }),
  CharacterCount,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];

export default function PolicyEditor({ value, onChange, placeholder }) {
  const debounce = useRef(null);
  const boot = useRef(true);
  const exts = useMemo(() => extensions(placeholder), [placeholder]);

  const editor = useEditor({
    extensions: exts,
    content: value || { type: "doc", content: [] },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate dark:prose-invert max-w-none min-h-[320px] focus:outline-none px-4 py-3 text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor, transaction }) => {
      if (!transaction.docChanged) return;
      if (boot.current) {
        boot.current = false;
        return;
      }
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => {
        onChange?.(editor.getJSON());
      }, 1200);
    },
  });

  useEffect(() => {
    if (!editor || !value) return;
    const cur = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(value);
    if (cur !== next) editor.commands.setContent(value, false);
  }, [editor, value]);

  const run = useCallback(
    (fn) => {
      if (!editor) return;
      fn(editor);
      editor.chain().focus();
    },
    [editor]
  );

  if (!editor) return <div className="glass-inner h-80 animate-pulse rounded-xl" />;

  return (
    <div className="glass-inner overflow-hidden rounded-xl border border-white/20 dark:border-white/10">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-white/30 px-2 py-2 dark:bg-white/5">
        <ToolbarBtn onClick={() => run((e) => e.chain().toggleBold().run())} active={editor.isActive("bold")} icon={Bold} />
        <ToolbarBtn onClick={() => run((e) => e.chain().toggleItalic().run())} active={editor.isActive("italic")} icon={Italic} />
        <ToolbarBtn
          onClick={() => run((e) => e.chain().toggleHeading({ level: 1 }).run())}
          active={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
        />
        <ToolbarBtn
          onClick={() => run((e) => e.chain().toggleHeading({ level: 2 }).run())}
          active={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
        />
        <ToolbarBtn onClick={() => run((e) => e.chain().toggleBulletList().run())} active={editor.isActive("bulletList")} icon={List} />
        <ToolbarBtn
          onClick={() => run((e) => e.chain().toggleOrderedList().run())}
          active={editor.isActive("orderedList")}
          icon={ListOrdered}
        />
        <ToolbarBtn
          onClick={() =>
            run((e) =>
              e
                .chain()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            )
          }
          icon={Table2}
        />
        <span className="mx-2 h-5 w-px bg-white/20" />
        <ToolbarBtn onClick={() => run((e) => e.chain().undo().run())} icon={Undo2} />
        <ToolbarBtn onClick={() => run((e) => e.chain().redo().run())} icon={Redo2} />
        <span className="ml-auto text-xs text-slate-500">
          {typeof editor.storage.characterCount?.characters === "function" ? editor.storage.characterCount.characters() : 0} chars
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarBtn({ onClick, active, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg p-2 transition ${active ? "bg-nova-600/20 text-nova-700 dark:text-nova-200" : "text-slate-600 hover:bg-white/40 dark:text-slate-300 dark:hover:bg-white/10"}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
