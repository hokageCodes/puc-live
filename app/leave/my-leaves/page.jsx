'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import leaveApi from '../../../utils/leaveApi';

export default function MyLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = await leaveApi.getMyLeaves();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-300' },
      approved_teamlead: { icon: CheckCircle, color: 'bg-blue-100 text-blue-700 border-blue-300' },
      approved_linemanager: { icon: CheckCircle, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
      approved_hr: { icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-300' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-300' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-12">Loading leave history...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">My Leaves</h1>

      {leaves.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-emerald-100 text-center">
          <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-600 mb-2">No leave requests yet</p>
          <p className="text-slate-500">Start by submitting a leave request</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leaves.map((leave) => (
            <div key={leave._id} className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-emerald-700 mb-2">
                    {leave.leaveType?.name || 'Leave Request'}
                  </h3>
                  <div className="flex items-center text-sm text-slate-600 space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                    <span>{leave.totalDays} working days</span>
                  </div>
                </div>
                {getStatusBadge(leave.status)}
              </div>

              {leave.reason && (
                <p className="text-sm text-slate-700 mb-4">{leave.reason}</p>
              )}

              {/* Approval History */}
              {leave.approvalHistory && leave.approvalHistory.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Approval History</h4>
                  <div className="space-y-2">
                    {leave.approvalHistory.map((entry, index) => (
                      <div key={index} className="flex items-start text-sm">
                        <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                          entry.action === 'approved' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <span className="font-medium">
                            {entry.role}: {entry.action}
                          </span>
                          {entry.comment && (
                            <p className="text-slate-600">{entry.comment}</p>
                          )}
                          <p className="text-xs text-slate-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

