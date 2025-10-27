'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import leaveApi from '../../../utils/leaveApi';

export default function SettingsPage() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultDays: '',
    requiresDocument: false
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const data = await leaveApi.getAllLeaveTypesAdmin();
      setLeaveTypes(data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingType) {
        await leaveApi.updateLeaveType(editingType._id, formData);
      } else {
        await leaveApi.createLeaveType(formData);
      }
      setModalOpen(false);
      setEditingType(null);
      setFormData({ name: '', description: '', defaultDays: '', requiresDocument: false });
      fetchLeaveTypes();
    } catch (error) {
      console.error('Error saving leave type:', error);
      alert('Failed to save leave type');
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      defaultDays: type.defaultDays,
      requiresDocument: type.requiresDocument
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to deactivate this leave type?')) {
      try {
        await leaveApi.deleteLeaveType(id);
        fetchLeaveTypes();
      } catch (error) {
        console.error('Error deleting leave type:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-emerald-700">Leave Management Settings</h1>
        <button
          onClick={() => {
            setEditingType(null);
            setFormData({ name: '', description: '', defaultDays: '', requiresDocument: false });
            setModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Leave Type
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
        <h2 className="text-xl font-bold text-emerald-700 mb-4">Leave Types</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Default Days</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Requires Document</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leaveTypes.map((type) => (
                <tr key={type._id}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{type.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{type.description || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{type.defaultDays}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {type.requiresDocument ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      type.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {type.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(type)}
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(type._id)}
                        className="p-1 text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-emerald-700 mb-4">
              {editingType ? 'Edit' : 'Add'} Leave Type
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Default Days *
                </label>
                <input
                  type="number"
                  value={formData.defaultDays}
                  onChange={(e) => setFormData({ ...formData, defaultDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  required
                  min="1"
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requiresDocument}
                    onChange={(e) => setFormData({ ...formData, requiresDocument: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700">Requires Document</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingType(null);
                    setFormData({ name: '', description: '', defaultDays: '', requiresDocument: false });
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition"
                >
                  {editingType ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

