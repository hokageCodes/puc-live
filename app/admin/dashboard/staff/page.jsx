'use client';

import { useState, useEffect } from 'react';
import AddUserModal from '../../../../components/admin/users/AddUserModal';
import { Search, UserPlus, Edit, Trash2, Users, Eye, EyeOff, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../../../lib/getImageUrl';

const ROLE_LABELS = {
  staff: 'Staff',
  teamLead: 'Team Lead',
  lineManager: 'Line Manager',
  hr: 'HR',
  admin: 'Admin',
  cms: 'CMS',
};

const DIVISION_LABELS = {
  legal: 'Legal',
  admin: 'Admin/Operations',
  other: 'Other',
};

const STATUS_BADGE_CLASSES = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  muted: 'bg-slate-200 text-slate-600',
};

const formatDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getActivationStatus = (person) => {
  const activatedAt = person?.passwordSetAt;
  const invitedAt = person?.lastInviteSentAt;
  const lastLoginAt = person?.lastLoginAt;

  if (activatedAt) {
    return {
      state: 'active',
      label: 'Active',
      badgeClass: STATUS_BADGE_CLASSES.success,
      description: `Activated ${formatDateTime(activatedAt)}`,
      subtext: lastLoginAt ? `Last login ${formatDateTime(lastLoginAt)}` : 'No login activity yet',
    };
  }

  if (invitedAt) {
    return {
      state: 'invited',
      label: 'Invite sent',
      badgeClass: STATUS_BADGE_CLASSES.warning,
      description: `Invite sent ${formatDateTime(invitedAt)}`,
      subtext: 'Awaiting activation',
    };
  }

  return {
    state: 'pending',
    label: 'Not invited',
    badgeClass: STATUS_BADGE_CLASSES.muted,
    description: 'Send an invite to let this staff member activate their account.',
    subtext: null,
  };
};

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [inviteLoadingId, setInviteLoadingId] = useState(null);

  const pageSize = 25;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const applyStaffUpdate = (id, changes) => {
    setStaff((prev) =>
      prev.map((item) => (item._id === id ? { ...item, ...changes } : item))
    );
    setFiltered((prev) =>
      prev.map((item) => (item._id === id ? { ...item, ...changes } : item))
    );
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('admin_token') : null;
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      const responses = await Promise.all([
        fetch(`${backendUrl}/api/staff`, { credentials: 'include', headers: authHeaders }),
        fetch(`${backendUrl}/api/departments`, { credentials: 'include', headers: authHeaders }),
        fetch(`${backendUrl}/api/teams`, { credentials: 'include', headers: authHeaders }),
        fetch(`${backendUrl}/api/practice-areas`, { credentials: 'include', headers: authHeaders }),
      ]);

      responses.forEach((res) => {
        if (!res.ok) {
          throw new Error('Unable to load staff data. Please try again.');
        }
      });

      const [staffData, deptData, teamData, paData] = await Promise.all(
        responses.map((res) => res.json())
      );

      setStaff(staffData);
      setFiltered(staffData);
      setCurrentPage(1);
      setDepartments(deptData);
      setTeams(teamData);
      setPracticeAreas(paData);
    } catch (error) {
      console.error('Failed to fetch staff data:', error);
      toast.error(error.message || 'Failed to fetch staff data.');
    } finally {
      setLoading(false);
    }
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
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, staff]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filtered, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStaff = filtered.slice(startIndex, startIndex + pageSize);
  const showingFrom = filtered.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, filtered.length);
  const totalVisible = staff.filter((person) => person.isVisible !== false).length;
  const totalHidden = Math.max(0, staff.length - totalVisible);

  const handleAdd = () => {
    setEditingStaff(null);
    setShowModal(true);
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setShowModal(true);
  };

  const handleDelete = async (staffId) => {
    const confirmed = window.confirm('Are you sure you want to delete this staff member?');
    if (!confirmed) return;

    try {
      const res = await fetch(`${backendUrl}/api/staff/${staffId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && window.localStorage.getItem('admin_token')
            ? { Authorization: `Bearer ${window.localStorage.getItem('admin_token')}` }
            : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Delete failed');
      }

      setStaff((prev) => prev.filter((s) => s._id !== staffId));
      setFiltered((prev) => prev.filter((s) => s._id !== staffId));
      toast.success('Staff member deleted successfully.');
    } catch (err) {
      console.error('Delete staff failed:', err);
      toast.error(err.message || 'Failed to delete staff. Please try again.');
    }
  };

  const handleToggleVisibility = async (staffMember) => {
    const current = staffMember.isVisible === false ? false : true;
    const newValue = !current;

    const formData = new FormData();
    formData.append('isVisible', String(newValue));

    try {
      const res = await fetch(`${backendUrl}/api/staff/${staffMember._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          ...(typeof window !== 'undefined' && window.localStorage.getItem('admin_token')
            ? { Authorization: `Bearer ${window.localStorage.getItem('admin_token')}` }
            : {}),
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update visibility.');
      }

      setStaff((prev) =>
        prev.map((item) =>
          item._id === staffMember._id ? { ...item, isVisible: newValue } : item
        )
      );
      setFiltered((prev) =>
        prev.map((item) =>
          item._id === staffMember._id ? { ...item, isVisible: newValue } : item
        )
      );

      toast.success(`Staff member is now ${newValue ? 'visible' : 'hidden'} on the website.`);
    } catch (error) {
      console.error('Toggle visibility failed:', error);
      toast.error(error.message || 'Failed to update visibility.');
    }
  };

  const handleSendInvite = async (staffMember) => {
    setInviteLoadingId(staffMember._id);
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('admin_token') : null;
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(`${backendUrl}/api/auth/invite`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ email: staffMember.email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send activation email.');
      }

      toast.success('Activation email sent successfully.');
      const nowIso = new Date().toISOString();
      applyStaffUpdate(staffMember._id, { lastInviteSentAt: nowIso });
    } catch (error) {
      console.error('Send invite failed:', error);
      toast.error(error.message || 'Failed to send activation email.');
    } finally {
      setInviteLoadingId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div>Loading...</div></div>;
  }

  return (
    <div className="admin-page w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold admin-text">All Staff Directory</h1>
          <p className="text-sm md:text-base admin-text-muted">
            Search, curate, and manage everyone who appears across the website in one streamlined view.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-surface rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide admin-text-muted">Total Staff</p>
              <p className="mt-2 text-3xl font-semibold admin-text">{staff.length}</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs admin-text-muted">All profiles in the system, regardless of visibility.</p>
        </div>

        <div className="admin-surface rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide admin-text-muted">Live On Website</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">{totalVisible}</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Eye className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs admin-text-muted">Staff currently visible on public pages.</p>
        </div>

        <div className="admin-surface rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide admin-text-muted">Hidden</p>
              <p className="mt-2 text-3xl font-semibold admin-text">{totalHidden}</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <EyeOff className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs admin-text-muted">Profiles prepared but not published yet.</p>
        </div>

        <div className="admin-surface rounded-xl border border-dashed border-amber-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Tip</p>
          <p className="mt-3 text-sm admin-text-muted">
            Use filters to narrow down by department. Toggle visibility directly from the table without opening edit forms.
          </p>
        </div>
      </div>

      <div className="admin-surface rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 md:justify-end">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="min-w-[200px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            <span className="text-xs font-medium uppercase tracking-wide admin-text-muted">
              {filtered.length} result{filtered.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <div className="admin-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col gap-2 border-b admin-border px-6 py-4 text-sm admin-text-muted md:flex-row md:items-center md:justify-between">
          <div>
            Showing {showingFrom === 0 ? 0 : `${showingFrom}-${showingTo}`} of {filtered.length} staff
          </div>
          <div>
            Page {currentPage} of {Math.max(totalPages, 1)}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-sm text-slate-700">
            <thead className="bg-emerald-500/5 text-xs uppercase tracking-wide admin-text-muted">
              <tr className="text-left">
                <th className="px-6 py-3 font-semibold">Staff</th>
                <th className="px-6 py-3 font-semibold">Contact</th>
                <th className="px-6 py-3 font-semibold">Dept & Team</th>
                <th className="px-6 py-3 font-semibold">Practice Areas</th>
                <th className="px-6 py-3 font-semibold">Roles</th>
                <th className="px-6 py-3 font-semibold text-center">Activation</th>
                <th className="px-6 py-3 font-semibold text-center">Leave Access</th>
                <th className="px-6 py-3 font-semibold text-center">Website</th>
                <th className="px-6 py-3 font-semibold text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedStaff.map((person) => {
                const isCurrentlyVisible = person.isVisible === false ? false : true;
                const roles = Array.isArray(person.roles) ? person.roles : [];
                const extraRoles = roles.filter((role) => role !== 'staff');
                const divisionLabel = DIVISION_LABELS[person.division] || DIVISION_LABELS.legal;
                const leaveActive = person.leaveEnabled !== false;
                const activation = getActivationStatus(person);
                const inviteDisabled = activation.state === 'active';
                const inviteButtonLabel =
                  activation.state === 'invited' ? 'Resend' : 'Invite';

                return (
                  <tr key={person._id} className="transition hover:bg-emerald-500/5">
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-emerald-50">
                          {person.profilePhoto ? (
                            <img
                              src={getImageUrl(person.profilePhoto)}
                              alt={`${person.firstName} ${person.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                              No Photo
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold admin-text">
                            {person.firstName} {person.lastName}
                          </div>
                          <div className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                            {person.position || 'Role pending'}
                          </div>
                          <div className="text-xs admin-text-muted">
                            Code: {person.staffCode || '—'}
                          </div>
                          {person.bio && (
                            <p className="max-w-sm text-xs admin-text-muted line-clamp-2">{person.bio}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="space-y-2 text-sm">
                        {person.email && (
                          <a
                            href={`mailto:${person.email}`}
                            className="block admin-text hover:text-emerald-600 underline-offset-2 hover:underline"
                          >
                            {person.email}
                          </a>
                        )}
                        {person.phoneNumber && (
                          <span className="block text-xs admin-text-muted">{person.phoneNumber}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="space-y-1">
                        <div className="text-sm font-medium admin-text">
                          {person.department?.name || <span className="text-slate-400">Department TBD</span>}
                        </div>
                        <div className="text-xs uppercase tracking-wide admin-text-muted">
                          {person.team?.name || '—'}
                        </div>
                        <div className="text-xs admin-text-muted">Division: {divisionLabel}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-wrap gap-2">
                        {person.practiceAreas && person.practiceAreas.length > 0 ? (
                          person.practiceAreas.map((area) => {
                            const key = typeof area === 'object' ? area._id || area.name : area;
                            const label = typeof area === 'object' ? area.name : area;
                            return (
                              <span
                                key={key}
                                className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                              >
                                {label}
                              </span>
                            );
                          })
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium admin-text-muted">
                            General Staff
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-wrap gap-2">
                        {extraRoles.length ? (
                          extraRoles.map((role) => (
                            <span
                              key={role}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium admin-text"
                            >
                              {ROLE_LABELS[role] || role}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium admin-text-muted">
                            Staff
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col items-center gap-2 text-xs text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${activation.badgeClass}`}
                        >
                          {activation.label}
                        </span>
                        {activation.description && (
                          <span className="block text-xs admin-text-muted">
                            {activation.description}
                          </span>
                        )}
                        {activation.subtext && (
                          <span className="block text-[11px] text-slate-400">
                            {activation.subtext}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center align-top">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                          leaveActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-300/50 text-slate-600'
                        }`}
                      >
                        {leaveActive ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center align-top">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                          isCurrentlyVisible
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-300/50 text-slate-600'
                        }`}
                      >
                        {isCurrentlyVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => handleSendInvite(person)}
                          disabled={inviteLoadingId === person._id || inviteDisabled}
                          title={
                            inviteDisabled
                              ? 'Account already activated'
                              : 'Send activation email'
                          }
                        >
                          <Send className="h-3.5 w-3.5" />
                          {inviteLoadingId === person._id ? 'Sending…' : inviteButtonLabel}
                        </button>
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => handleEdit(person)}
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => handleToggleVisibility(person)}
                          title={isCurrentlyVisible ? 'Hide from website' : 'Show on website'}
                        >
                          {isCurrentlyVisible ? 'Hide' : 'Show'}
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-red-600 transition hover:border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(person._id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-xs uppercase tracking-wide admin-text-muted">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const isActive = page === currentPage;
                const showLabel =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1 ||
                  (currentPage === 1 && page <= 3) ||
                  (currentPage === totalPages && page >= totalPages - 2);

                if (!showLabel) {
                  if (
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={page} className="px-2 text-slate-400">
                        …
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-full text-sm font-medium transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                        : 'border border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <AddUserModal
          onClose={() => {
            setShowModal(false);
            setEditingStaff(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingStaff(null);
            fetchData();
          }}
          departments={departments}
          teams={teams}
          practiceAreas={practiceAreas}
          allStaff={staff}
          editingStaff={editingStaff}
        />
      )}
    </div>
  );
}

