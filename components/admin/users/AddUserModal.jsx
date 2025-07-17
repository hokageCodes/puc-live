'use client';
import { useState } from 'react';

export default function AddUserModal({ onClose }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('position', position);
    formData.append('profilePhoto', selectedFile);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/staff`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      // console.log('✅ Uploaded:', data);
      alert('Staff member created!');
      onClose();
    } catch (err) {
      console.error('❌ Upload error:', err);
      alert('Failed to upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold">Add Staff</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Position"
          className="input"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          className="input"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          required
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-4 py-2 rounded"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
