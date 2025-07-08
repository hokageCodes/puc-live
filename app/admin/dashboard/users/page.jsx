'use client';

import { useEffect, useState } from 'react';
import AddUserModal from '../../../../components/admin/users/AddUserModal';
import { getImageUrl } from '../../../../lib/getImageUrl';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [practiceAreas, setPracticeAreas] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [practiceAreaFilter, setPracticeAreaFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const base = "https://puc-backend-t8pl.onrender.com";

  const fetchData = async () => {
    const [staffRes, deptRes, teamRes, paRes] = await Promise.all([
      fetch(`${base}/api/staff`),
      fetch(`${base}/api/departments`),
      fetch(`${base}/api/teams`),
      fetch(`${base}/api/practice-areas`),
    ]);

    const [staff, departments, teams, practiceAreas] = await Promise.all([
      staffRes.json(),
      deptRes.json(),
      teamRes.json(),
      paRes.json(),
    ]);

    setUsers(staff);
    setFiltered(staff);
    setDepartments(departments);
    setTeams(teams);
    setPracticeAreas(practiceAreas);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filteredList = [...users];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredList = filteredList.filter((user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.position?.toLowerCase().includes(term)
      );
    }

    if (departmentFilter) {
      filteredList = filteredList.filter((user) => user.department?._id === departmentFilter);
    }

    if (teamFilter) {
      filteredList = filteredList.filter((user) => user.team?._id === teamFilter);
    }

    if (practiceAreaFilter) {
      filteredList = filteredList.filter((user) =>
        user.practiceAreas?.some((pa) => pa._id === practiceAreaFilter)
      );
    }

    setFiltered(filteredList);
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, teamFilter, practiceAreaFilter, users]);

  const handleEdit = (user) => {
    setEditingStaff(user);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirmed = confirm('Are you sure you want to delete this staff?');
    if (!confirmed) return;

    try {
      const res = await fetch(`${base}/api/staff/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        alert('Failed to delete staff.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUsers = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Staff</h1>
        <button
          onClick={() => {
            setEditingStaff(null);
            setShowModal(true);
          }}
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition"
        >
          + Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email or position"
          className="input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="input" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <select className="input" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
        <select className="input" value={practiceAreaFilter} onChange={(e) => setPracticeAreaFilter(e.target.value)}>
          <option value="">All Practice Areas</option>
          {practiceAreas.map((pa) => (
            <option key={pa._id} value={pa._id}>{pa.name}</option>
          ))}
        </select>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {currentUsers.length > 0 ? currentUsers.map((user) => (
          <div key={user._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4 mb-2">
              <img
                src={getImageUrl(user.profilePhoto)}
                alt={user.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">{user.position || 'No position'}</p>
            <p className="text-xs text-slate-400">{user.department?.name || 'No department'}</p>

            <div className="mt-4 flex justify-between text-sm">
              <button
                onClick={() => handleEdit(user)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <Link
                href={`/admin/staff/${user._id}`}
                className="text-slate-700 hover:underline"
              >
                View
              </Link>
              <button
                onClick={() => handleDelete(user._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        )) : (
          <p className="text-slate-500 text-sm col-span-full">No users match your filter.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-slate-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <AddUserModal
          onClose={() => {
            setShowModal(false);
            setEditingStaff(null);
            fetchData(); // re-fetch to refresh state
          }}
          editingStaff={editingStaff}
          departments={departments}
          teams={teams}
          practiceAreas={practiceAreas}
        />
      )}
    </div>
  );
}
