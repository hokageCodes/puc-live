'use client';

import { useState, useEffect } from 'react';
import AddUserModal from '../../../../components/admin/users/AddUserModal';
import { Search, Filter, UserPlus, Edit, Trash2, User, Building, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const base = "https://puc-backend-t8pl.onrender.com";

  const fetchData = async () => {
    const [staffRes, deptRes, teamRes, paRes] = await Promise.all([
      fetch(`${base}/api/staff`),
      fetch(`${base}/api/departments`),
      fetch(`${base}/api/teams`),
      fetch(`${base}/api/practice-areas`),
    ]);

    const [staffData, deptData, teamData, paData] = await Promise.all([
      staffRes.json(),
      deptRes.json(),
      teamRes.json(),
      paRes.json(),
    ]);

    setStaff(staffData);
    setFiltered(staffData);
    setDepartments(deptData);
    setTeams(teamData);
    setPracticeAreas(paData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    return <div className="flex items-center justify-center h-64"><div>Loading...</div></div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Staff Management</h1>
          <p className="text-sm text-slate-600">Complete staff database with website and leave management details</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          <UserPlus className="w-5 h-5 mr-2" /> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
        <div className="bg-white p-4 rounded border">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Total Staff</h3>
          <p className="text-3xl font-bold text-emerald-700">{staff.length}</p>
        </div>
        <div className="bg-white p-4 rounded border">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">On Website</h3>
          <p className="text-3xl font-bold text-green-700">{staff.filter(s => !s.isOnProbation).length}</p>
        </div>
        <div className="bg-white p-4 rounded border">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Team Leads</h3>
          <p className="text-3xl font-bold text-blue-700">{staff.filter(s => s.isTeamLead).length}</p>
        </div>
        <div className="bg-white p-4 rounded border">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Line Managers</h3>
          <p className="text-3xl font-bold text-purple-700">{staff.filter(s => s.isLineManager).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg" />
        </div>
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="w-4 h-4" /> {filtered.length} staff found
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Staff</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Dept/Team</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Roles</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((person) => (
                <tr key={person._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 p-2 mr-3" />
                      <div>
                        <div className="font-medium text-slate-900">{person.firstName} {person.lastName}</div>
                        <div className="text-sm text-slate-500">{person.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{person.email}</div>
                    <div className="text-xs text-slate-500">{person.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{person.department?.name || '-'}</div>
                    <div className="text-xs text-slate-500">{person.team?.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {person.isTeamLead && <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">Team Lead</span>}
                      {person.isLineManager && <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded">Line Mgr</span>}
                      {person.employeeId && <span className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded">#{person.employeeId}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {person.isOnProbation ? (
                      <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded">Probation</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">Confirmed</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-emerald-700 hover:bg-emerald-50 rounded transition">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AddUserModal
          onClose={() => { setShowModal(false); fetchData(); }}
          departments={departments}
          teams={teams}
          practiceAreas={practiceAreas}
        />
      )}
    </div>
  );
}

