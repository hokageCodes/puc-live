'use client';

import { useEffect, useRef } from 'react';
import '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

async function uploadImageToBackend(file) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://puc-backend-t8pl.onrender.com';
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${backendUrl}/api/blogs/upload-image`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return data.url;
}

export default function SimpleEditor({ value, onChange }) {
  const initialised = useRef(false);

  const editor = useCreateBlockNote({
    uploadFile: uploadImageToBackend,
  });

  // Load existing HTML content once on mount
  useEffect(() => {
    if (initialised.current || !value) return;
    initialised.current = true;

    const blocks = editor.tryParseHTMLToBlocks(value);
    editor.replaceBlocks(editor.document, blocks);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = () => {
    const html = editor.blocksToHTMLLossy(editor.document);
    onChange(html);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[420px]">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
}
