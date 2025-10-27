'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Clock4, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import leaveApi from '../../../utils/leaveApi';

export default function LeaveDashboard() {
  const [stats, setStats] = useState({
    pendingLeaves: 0,
    approvedLeaves: 0,
    remainingBalance: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [myLeaves, balance, approvals] = await Promise.all([
        leaveApi.getMyLeaves(),
        leaveApi.getMyBalance(),
        leaveApi.getPendingApprovals()
      ]);

      const pending = myLeaves.filter(l => l.status === 'pending').length;
      const approved = myLeaves.filter(l => l.status.includes('approved')).length;
      const totalBalance = balance.reduce((sum, b) => sum + (b.allocated - b.used), 0);

      setStats({
        pendingLeaves: pending,
        approvedLeaves: approved,
        remainingBalance: totalBalance,
        pendingApprovals: approvals.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-700 mb-2">Leave Dashboard</h1>
        <p className="text-slate-600">Manage your leave requests and track your balance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Pending Leaves</p>
              <p className="text-2xl font-bold text-emerald-700">{stats.pendingLeaves}</p>
            </div>
            <Clock className="w-12 h-12 text-emerald-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Approved Leaves</p>
              <p className="text-2xl font-bold text-green-700">{stats.approvedLeaves}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Leave Balance</p>
              <p className="text-2xl font-bold text-blue-700">{stats.remainingBalance} days</p>
            </div>
            <Clock4 className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-amber-700">{stats.pendingApprovals}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-amber-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100 mb-8">
        <h2 className="text-xl font-bold text-emerald-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/leave/request"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-emerald-200 hover:border-emerald-700 transition bg-emerald-50"
          >
            <PlusCircle className="w-6 h-6 text-emerald-700" />
            <div>
              <p className="font-semibold text-emerald-700">Request Leave</p>
              <p className="text-sm text-slate-600">Submit a new leave request</p>
            </div>
          </Link>

          <Link
            href="/leave/my-leaves"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-emerald-700 transition"
          >
            <Calendar className="w-6 h-6 text-emerald-700" />
            <div>
              <p className="font-semibold text-emerald-700">My Leaves</p>
              <p className="text-sm text-slate-600">View your leave history</p>
            </div>
          </Link>

          <Link
            href="/leave/balances"
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-emerald-700 transition"
          >
            <Clock4 className="w-6 h-6 text-emerald-700" />
            <div>
              <p className="font-semibold text-emerald-700">Leave Balance</p>
              <p className="text-sm text-slate-600">Check your leave balance</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

