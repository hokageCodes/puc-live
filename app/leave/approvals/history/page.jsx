'use client';

import { useEffect, useState, useMemo } from 'react';
import { useLeaveAuth } from '../../../../components/leave/LeaveAuthContext';
import { leaveApi } from '../../../../utils/api';

export default function MyApprovalsPage() {
  const { token, user } = useLeaveAuth();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('actions');
  const [search, setSearch] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const [actionsData, requestsData] = await Promise.all([
          leaveApi.getMyApprovals(token),
          leaveApi.getMyRequests(token),
        ]);
        setActions(actionsData || []);
        setRequests(requestsData || []);
      } catch (err) {
        console.error('Failed to load approvals history', err);
        setError('Failed to load approvals history');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  const filteredActions = useMemo(() => {
    return (actions || []).filter((a) => {
      if (filterEvent !== 'all' && a.event !== filterEvent) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (a.staffName || '').toLowerCase().includes(q) ||
        (a.leaveType || '').toLowerCase().includes(q)
      );
    });
  }, [actions, search, filterEvent]);

  const filteredRequests = useMemo(() => {
    return (requests || []).filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      const staffName = `${r.staff?.firstName || ''} ${r.staff?.lastName || ''}`.toLowerCase();
      return (
        staffName.includes(q) ||
        (r.leaveType?.name || '').toLowerCase().includes(q)
      );
    });
  }, [requests, search, filterStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#014634]"></div>
          <p className="mt-4 text-slate-600">Loading approval history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Approvals & Requests History</h1>
          <p className="mt-2 text-slate-600">Track all approvals and rejections you've performed, plus your own leave requests.</p>
        </div>

        {/* Tabs and Search */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTab('actions')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  tab === 'actions' 
                    ? 'bg-[#014634] text-white shadow-md' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}>
                My Actions
              </button>
              <button
                onClick={() => setTab('requests')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  tab === 'requests' 
                    ? 'bg-[#014634] text-white shadow-md' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}>
                My Requests
              </button>
            </div>

            <div className="sm:ml-auto flex items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by staff or leave type..."
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014634] focus:border-transparent w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Actions Tab */}
        {tab === 'actions' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm font-medium text-slate-700">Filter by:</label>
              <select 
                value={filterEvent} 
                onChange={(e) => setFilterEvent(e.target.value)} 
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014634] bg-white">
                <option value="all">All Actions</option>
                <option value="approved">Approvals Only</option>
                <option value="rejected">Rejections Only</option>
              </select>
              <span className="text-sm text-slate-500 ml-2">
                ({filteredActions.length} {filteredActions.length === 1 ? 'result' : 'results'})
              </span>
            </div>

            {filteredActions.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                <div className="text-slate-400 text-lg mb-2">No approval history found</div>
                <p className="text-slate-500 text-sm">Your approval actions will appear here</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredActions.map((a) => (
                  <div key={`${a.requestId}-${a.timestamp}`} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          a.event === 'approved' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {a.event === 'approved' ? '✓ Approved' : '✗ Rejected'}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">{a.staffName || 'Staff'}</div>
                          <div className="text-sm text-slate-500">{a.leaveType || 'Leave'}</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">{new Date(a.timestamp).toLocaleString()}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Period</div>
                        <div className="text-sm font-medium text-slate-700">
                          {new Date(a.startDate).toLocaleDateString()} – {new Date(a.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Duration</div>
                        <div className="text-sm font-medium text-slate-700">
                          {a.durationDays} {a.durationDays === 1 ? 'day' : 'days'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Note</div>
                        <div className="text-sm text-slate-700">{a.note || 'No note provided'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm font-medium text-slate-700">Filter by status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014634] bg-white">
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
              <span className="text-sm text-slate-500 ml-2">
                ({filteredRequests.length} {filteredRequests.length === 1 ? 'result' : 'results'})
              </span>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                <div className="text-slate-400 text-lg mb-2">No leave requests found</div>
                <p className="text-slate-500 text-sm">Your leave requests will appear here</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredRequests.map((r) => (
                  <div key={r._id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          r.status === 'approved' 
                            ? 'bg-green-100 text-green-700' 
                            : r.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {(r.staff?.firstName || '') + ' ' + (r.staff?.lastName || '')}
                          </div>
                          <div className="text-sm text-slate-500">{r.leaveType?.name || 'Leave'}</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleString()}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Period</div>
                        <div className="text-sm font-medium text-slate-700">
                          {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Duration</div>
                        <div className="text-sm font-medium text-slate-700">
                          {r.durationDays} {r.durationDays === 1 ? 'day' : 'days'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Reason</div>
                        <div className="text-sm text-slate-700">{r.reason || 'No reason provided'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
  );
}