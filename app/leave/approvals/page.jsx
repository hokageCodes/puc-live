'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import leaveApi from '../../../utils/leaveApi';

export default function ApprovalsPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const data = await leaveApi.getPendingApprovals();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setModalOpen(true);
  };

  const submitAction = async () => {
    if (!selectedLeave || processing) return;

    setProcessing(true);
    try {
      if (actionType === 'approve') {
        await leaveApi.approveLeave(selectedLeave._id, comment);
      } else {
        await leaveApi.rejectLeave(selectedLeave._id, reason, comment);
      }
      setModalOpen(false);
      setComment('');
      setReason('');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Failed to process approval');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading pending approvals...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">Pending Approvals</h1>

      {leaves.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-emerald-100 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-xl text-slate-600 mb-2">No pending approvals</p>
          <p className="text-slate-500">All leave requests have been processed</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leaves.map((leave) => (
            <div key={leave._id} className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-emerald-700">
                      {leave.staff?.firstName} {leave.staff?.lastName}
                    </h3>
                    {leave.staff?.email && (
                      <span className="text-sm text-slate-500">{leave.staff.email}</span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 space-x-4 mb-2">
                    <span>{leave.leaveType?.name}</span>
                    <span>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                    <span>{leave.totalDays} days</span>
                  </div>
                  {leave.reason && (
                    <p className="text-sm text-slate-700">{leave.reason}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAction(leave, 'approve')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(leave, 'reject')}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-emerald-700 mb-4">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </h3>

            {actionType === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for Rejection *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="Enter reason"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                placeholder="Add any comments (optional)"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setComment('');
                  setReason('');
                }}
                disabled={processing}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={processing || (actionType === 'reject' && !reason)}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {processing ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

