'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import leaveApi from '../../../utils/leaveApi';

export default function BalancesPage() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const data = await leaveApi.getMyBalance();
      setBalances(data);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading balances...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">My Leave Balance</h1>

      {balances.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-emerald-100 text-center">
          <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-600 mb-2">No leave balances yet</p>
          <p className="text-slate-500">Contact HR to initialize your leave balance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {balances.map((balance) => {
            const remaining = balance.allocated - balance.used;
            const usagePercent = balance.allocated > 0 ? (balance.used / balance.allocated) * 100 : 0;

            return (
              <div key={balance._id} className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-emerald-700">
                    {balance.leaveType?.name}
                  </h3>
                  <Clock className="w-6 h-6 text-emerald-600 opacity-20" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Allocated:</span>
                    <span className="font-semibold text-slate-700">{balance.allocated} days</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Used:</span>
                    <span className="font-semibold text-slate-700">{balance.used} days</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-emerald-700">Remaining:</span>
                      <span className="text-xl font-bold text-emerald-700">{remaining} days</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usagePercent < 50 ? 'bg-green-500' : usagePercent < 75 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {usagePercent.toFixed(1)}% used
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

