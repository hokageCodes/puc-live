'use client';

import { useEffect, useRef } from 'react';
import '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../admin/AdminAuthContext';

async function uploadImageToBackend(file, getAuthHeaders) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://puc-backend-t8pl.onrender.com';
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${backendUrl}/api/blogs/upload-image`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Image upload failed');
  }

  const { url } = await res.json();
  return url;
}

export default function SimpleEditor({ value, onChange }) {
  const initialised = useRef(false);
  const { getAuthHeaders } = useAdminAuth();

  const editor = useCreateBlockNote({
    uploadFile: async (file) => {
      try {
        return await uploadImageToBackend(file, getAuthHeaders);
      } catch (err) {
        console.error('Inline image upload error:', err);
        toast.error(err.message || 'Failed to upload image');
        throw err;
      }
    },
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
