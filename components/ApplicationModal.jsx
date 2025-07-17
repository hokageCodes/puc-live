'use client';
import { X } from 'lucide-react';
import { useState } from 'react';

export default function ApplicationModal({ jobTitle, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    coverLetter: '',
    resume: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send to backend or email API
    // console.log('Submitting:', formData);
    onClose(); // Close modal on submit for now
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#01553d]"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-[#01553d] mb-4">
          {jobTitle ? `Apply for: ${jobTitle}` : 'Submit General Application'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            required
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="email"
            name="email"
            required
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <textarea
            name="coverLetter"
            onChange={handleChange}
            rows={4}
            placeholder="Cover Letter"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="file"
            name="resume"
            accept=".pdf"
            required
            onChange={handleChange}
            className="w-full"
          />
          <button
            type="submit"
            className="w-full bg-[#01553d] text-white py-2 rounded-lg hover:bg-[#013d2e]"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
