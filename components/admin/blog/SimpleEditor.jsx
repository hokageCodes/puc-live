'use client';

import { useRef } from 'react';

export default function SimpleEditor({ value, onChange }) {
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const insertAtCursor = (insertText) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = value.substring(0, start) + insertText + value.substring(end);
    onChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-100 border-b border-slate-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => insertAtCursor('<strong>bold</strong>')}
          className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('<em>italic</em>')}
          className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('<a href="URL">link</a>')}
          className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50"
          title="Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('<img src="URL" alt="description" />')}
          className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50"
          title="Image"
        >
          🖼️
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('<h2>Heading</h2>')}
          className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50"
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('<ul><li>list item</li></ul>')}
          className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50"
          title="List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('<blockquote>quote</blockquote>')}
          className="px-3 py-1 text-sm bg-white border border-slate-300 rounded hover:bg-slate-50"
          title="Quote"
        >
          " Quote
        </button>
      </div>
      
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        rows={20}
        className="w-full p-4 resize-none focus:outline-none font-mono text-sm"
        placeholder="Start writing your blog post... Use the toolbar above to insert HTML formatting..."
      />
      
      <div className="bg-slate-50 border-t border-slate-300 p-2 text-xs text-slate-500">
        💡 You can use HTML tags for formatting. The toolbar above inserts common tags.
      </div>
    </div>
  );
}

