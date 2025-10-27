'use client';

import { useState } from 'react';
import { Download, Calendar, FileText } from 'lucide-react';
import leaveApi from '../../../utils/leaveApi';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      const data = await leaveApi.generateStaffReport(dateRange.startDate, dateRange.endDate);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const headers = ['Leave Type', 'Start Date', 'End Date', 'Days', 'Status'];
    const rows = reportData.leaves.map(leave => [
      leave.leaveType?.name || 'N/A',
      new Date(leave.startDate).toLocaleDateString(),
      new Date(leave.endDate).toLocaleDateString(),
      leave.totalDays,
      leave.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-report-${new Date().getTime()}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">Leave Reports</h1>

      {/* Report Generator */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100 mb-6">
        <h2 className="text-xl font-bold text-emerald-700 mb-4">Generate Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-emerald-700">Report Summary</h2>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-emerald-700">{reportData.summary.totalRequests}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-700">{reportData.summary.approved}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-700">{reportData.summary.rejected}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Total Days</p>
              <p className="text-2xl font-bold text-blue-700">{reportData.summary.totalDays}</p>
            </div>
          </div>

          {/* Leave Details */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Leave Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Days</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {leave.leaveType?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {leave.totalDays}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        leave.status.includes('approved') ? 'bg-green-100 text-green-700' :
                        leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {leave.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

