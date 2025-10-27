'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, AlertCircle } from 'lucide-react';
import leaveApi from '../../../utils/leaveApi';

export default function RequestLeavePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateDays();
  }, [formData.startDate, formData.endDate, formData.leaveTypeId]);

  const fetchData = async () => {
    try {
      const [types, balance] = await Promise.all([
        leaveApi.getLeaveTypes(),
        leaveApi.getMyBalance()
      ]);
      setLeaveTypes(types);
      setBalances(balance);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) {
      setTotalDays(0);
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end < start) {
      setTotalDays(0);
      return;
    }

    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    setTotalDays(count);

    // Update available balance
    if (formData.leaveTypeId) {
      const balance = balances.find(b => b.leaveType._id === formData.leaveTypeId);
      if (balance) {
        setAvailableBalance(balance.allocated - balance.used);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (totalDays > availableBalance) {
      alert('Insufficient leave balance');
      return;
    }

    if (totalDays === 0) {
      alert('Invalid date range');
      return;
    }

    setLoading(true);
    try {
      await leaveApi.createLeaveRequest({
        leaveTypeId: formData.leaveTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        totalDays
      });
      router.push('/leave/my-leaves');
    } catch (error) {
      console.error('Error creating leave request:', error);
      alert('Failed to create leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">Request Leave</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
        {/* Leave Type */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Leave Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.leaveTypeId}
            onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          >
            <option value="">Select leave type</option>
            {leaveTypes.map((type) => {
              const balance = balances.find(b => b.leaveType._id === type._id);
              const remaining = balance ? balance.allocated - balance.used : 0;
              return (
                <option key={type._id} value={type._id}>
                  {type.name} (Available: {remaining} days)
                </option>
              );
            })}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Days Summary */}
        {totalDays > 0 && (
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-emerald-700">Total Working Days:</span>
              <span className="text-lg font-bold text-emerald-700">{totalDays} days</span>
            </div>
            {formData.leaveTypeId && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Available Balance:</span>
                <span className={`text-sm font-semibold ${availableBalance >= totalDays ? 'text-emerald-700' : 'text-red-600'}`}>
                  {availableBalance} days
                </span>
              </div>
            )}
            {availableBalance < totalDays && (
              <div className="mt-2 flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Insufficient balance for this request
              </div>
            )}
          </div>
        )}

        {/* Reason */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Please provide a reason for your leave request"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || totalDays === 0 || availableBalance < totalDays}
            className="px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

