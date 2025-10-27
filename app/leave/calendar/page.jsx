'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import leaveApi from '../../../utils/leaveApi';

export default function PersonalCalendarPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchLeaves();
  }, [currentMonth]);

  const fetchLeaves = async () => {
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      const data = await leaveApi.getPersonalCalendar(startDate.toISOString(), endDate.toISOString());
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateInLeaveRange = (date) => {
    return leaves.some(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      return date >= start && date <= end;
    });
  };

  const getLeaveForDate = (date) => {
    return leaves.find(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      return date >= start && date <= end;
    });
  };

  const getLeaveColor = (leaveType) => {
    const colors = {
      'Sick Leave': 'bg-red-100 text-red-700',
      'Annual Leave': 'bg-blue-100 text-blue-700',
      'Maternity Leave': 'bg-pink-100 text-pink-700',
      'Paternity Leave': 'bg-purple-100 text-purple-700',
      'Exam Leave': 'bg-amber-100 text-amber-700',
      'Casual Leave': 'bg-green-100 text-green-700',
    };
    return colors[leaveType] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return <div className="text-center py-12">Loading calendar...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-emerald-700">My Leave Calendar</h1>
        <div className="flex space-x-2">
          <button onClick={previousMonth} className="p-2 rounded-lg hover:bg-emerald-50">
            <ChevronLeft className="w-5 h-5 text-emerald-700" />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-emerald-50">
            <ChevronRight className="w-5 h-5 text-emerald-700" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
        {/* Calendar Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-700 text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-slate-700 py-2">
              {day}
            </div>
          ))}

          {/* Empty spaces for days before month starts */}
          {Array(firstDayOfMonth).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}

          {/* Calendar Days */}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
            const isOnLeave = isDateInLeaveRange(date);
            const leave = getLeaveForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={i}
                className={`
                  aspect-square border-2 rounded-lg p-1 text-sm transition
                  ${isToday ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200'}
                  ${isOnLeave ? getLeaveColor(leave?.leaveType?.name) : ''}
                `}
              >
                <div className={`font-semibold mb-1 ${isOnLeave ? 'text-white' : 'text-slate-700'}`}>
                  {i + 1}
                </div>
                {isOnLeave && leave && (
                  <div className="text-xs truncate">
                    {leave.leaveType?.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm text-slate-600">Sick Leave</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-sm text-slate-600">Annual Leave</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
              <span className="text-sm text-slate-600">Exam Leave</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm text-slate-600">Casual Leave</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

