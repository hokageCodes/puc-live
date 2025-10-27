'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Edit, Trash2, User, Settings, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export default function LeaveManagementPage() {
  const [staff, setStaff] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const base = "https://puc-backend-t8pl.onrender.com";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [staffRes, deptRes] = await Promise.all([
        fetch(`${base}/api/staff`),
        fetch(`${base}/api/departments`),
      ]);

      const [staffData, departmentsData] = await Promise.all([
        staffRes.json(),
        deptRes.json(),
      ]);

      setStaff(staffData);
      setFiltered(staffData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filteredList = [...staff];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredList = filteredList.filter((person) =>
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(term) ||
        person.email?.toLowerCase().includes(term) ||
        person.position?.toLowerCase().includes(term)
      );
    }

    if (departmentFilter) {
      filteredList = filteredList.filter((person) => person.department?._id === departmentFilter);
    }

    setFiltered(filteredList);
  }, [searchTerm, departmentFilter, staff]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
          <p className="text-sm text-slate-600 mt-1">Manage staff, roles, approvals, and leave settings</p>
        </div>
        <Link href="/leave/settings">
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            <Settings className="w-5 h-5 mr-2" />
            Leave Settings
          </button>
        </Link>
      </div>

      {/* Info Alert */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">ℹ️ Leave Management System</p>
        <p>This section manages all staff with full leave management capabilities including roles, reporting structure, and leave approvals.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Link href="/leave/dashboard" className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-md transition">
          <Calendar className="w-8 h-8 text-emerald-700 mb-2" />
          <h3 className="font-semibold text-slate-700">Leave Dashboard</h3>
          <p className="text-sm text-slate-600">View all requests</p>
        </Link>
        <Link href="/leave/approvals" className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-md transition">
          <User className="w-8 h-8 text-blue-700 mb-2" />
          <h3 className="font-semibold text-slate-700">Approvals</h3>
          <p className="text-sm text-slate-600">Pending approvals</p>
        </Link>
        <Link href="/leave/reports" className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-md transition">
          <FileText className="w-8 h-8 text-purple-700 mb-2" />
          <h3 className="font-semibold text-slate-700">Reports</h3>
          <p className="text-sm text-slate-600">Generate reports</p>
        </Link>
        <Link href="/leave/settings" className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-md transition">
          <Settings className="w-8 h-8 text-orange-700 mb-2" />
          <h3 className="font-semibold text-slate-700">Settings</h3>
          <p className="text-sm text-slate-600">Configure system</p>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-2">Total Staff</h3>
          <p className="text-3xl font-bold text-emerald-700">{staff.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-2">On Probation</h3>
          <p className="text-3xl font-bold text-orange-700">
            {staff.filter(s => s.isOnProbation).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-700 mb-2">Confirmed</h3>
          <p className="text-3xl font-bold text-green-700">
            {staff.filter(s => !s.isOnProbation).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4" />
            <span>{filtered.length} staff members</span>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Staff</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Department</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length > 0 ? (
                filtered.map((person) => (
                  <tr key={person._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-slate-900">
                            {person.firstName} {person.lastName}
                          </div>
                          <div className="text-sm text-slate-500">{person.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{person.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {person.department?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {person.isTeamLead && (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            Team Lead
                          </span>
                        )}
                        {person.isLineManager && (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            Line Manager
                          </span>
                        )}
                        {!person.isTeamLead && !person.isLineManager && (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            Staff
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {person.isOnProbation ? (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          On Probation
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Confirmed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          className="p-2 text-emerald-700 hover:bg-emerald-50 rounded transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No staff members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

