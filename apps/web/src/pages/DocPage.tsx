import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Editor from '@/components/Editor';
import DocBar from '@/components/DocBar';
import { CommandPaletteModal, useCommandPalette } from '@/components/CommandPalette';

export default function DocPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [editor, setEditor] = useState<any>(null);
  const { open, setOpen, commands } = useCommandPalette(editor, id ?? undefined);

  if (!id || !token) return null;

  const runCommand = (c: { run: () => void }) => c.run();

  return (
    <>
      <CommandPaletteModal open={open} onClose={() => setOpen(false)} commands={commands} onRun={runCommand} />
      <DocBar docId={id} editor={editor} />
      <div className="flex-1 overflow-auto">
        <Editor docId={id} token={token} onEditorReady={setEditor} />
      </div>
    </>
  );
}
