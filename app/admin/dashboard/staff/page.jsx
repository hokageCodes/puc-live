'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AddUserModal from '../../../../components/admin/users/AddUserModal';
import { Search, UserPlus, Edit2, Trash2, Eye, EyeOff, Send, ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle2, Clock, CircleDashed, GripVertical, ArrowUpDown, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../../../lib/getImageUrl';
import { useAdminAuth } from '../../../../components/admin/AdminAuthContext';
import { useRefetchOnVisible } from '../../../../hooks/useRefetchOnVisible';

const ROLE_LABELS = {
  staff: 'Staff', teamLead: 'Team Lead', lineManager: 'Line Manager',
  hr: 'HR', admin: 'Admin', cms: 'CMS',
};

const OFFICE_LOCATION_LABELS = {
  lagos: 'PUC Lagos',
  abuja: 'PUC Abuja',
  uyo: 'PUC Uyo',
};

const POSITION_GROUPS = {
  'Executive Leadership': ['senior partner', 'managing partner', 'partner'],
  'Team Leadership': ['managing associate', 'senior associate'],
  'Associates': ['associate'],
};

const fmt = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
};

const getStatus = (p) => {
  if (p?.passwordSetAt) return { key: 'active', label: 'Active', since: fmt(p.passwordSetAt) };
  if (p?.lastInviteSentAt) return { key: 'invited', label: 'Invited', since: fmt(p.lastInviteSentAt) };
  return { key: 'pending', label: 'Pending', since: null };
};

const StatusDot = ({ status }) => {
  const map = {
    active:  { icon: CheckCircle2, cls: 'text-emerald-500' },
    invited: { icon: Clock,         cls: 'text-amber-400'  },
    pending: { icon: CircleDashed,  cls: 'text-slate-400'  },
  };
  const { icon: Icon, cls } = map[status.key] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {status.label}
      {status.since && <span className="font-normal text-slate-400">· {status.since}</span>}
    </span>
  );
};

function ActionsMenu({ person, onEdit, onDelete, onToggleVisibility, onSendInvite, inviteLoading }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const status = getStatus(person);
  const visible = person.isVisible !== false;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-52 origin-top-right rounded-xl border border-slate-100 bg-white py-1 shadow-xl shadow-slate-200/60">
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-400" /> Edit profile
          </button>
          {status.key === 'pending' && (
            <button
              onClick={() => { onSendInvite(); setOpen(false); }}
              disabled={inviteLoading}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5 text-slate-400" />
              {inviteLoading ? 'Sending…' : 'Send invite'}
            </button>
          )}
          {(status.key === 'invited' || status.key === 'active') && (
            <button
              onClick={() => {
                if (status.key === 'active') return;
                onSendInvite();
                setOpen(false);
              }}
              disabled={inviteLoading || status.key === 'active'}
              title={status.key === 'active' ? 'This person has already activated their account.' : undefined}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5 text-slate-400" />
              {inviteLoading ? 'Sending…' : 'Resend invite'}
            </button>
          )}
          <button
            onClick={() => { onToggleVisibility(); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            {visible
              ? <><EyeOff className="h-3.5 w-3.5 text-slate-400" /> Hide from site</>
              : <><Eye className="h-3.5 w-3.5 text-slate-400" /> Show on site</>}
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function Avatar({ person }) {
  const initials = `${person.firstName?.[0] ?? ''}${person.lastName?.[0] ?? ''}`.toUpperCase();
  const src = getImageUrl(person.profilePhoto);
  return src && !src.includes('default-avatar') ? (
    <img src={src} alt={initials} className="h-9 w-9 rounded-full object-cover ring-2 ring-white" />
  ) : (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-semibold text-white ring-2 ring-white">
      {initials || '?'}
    </span>
  );
}

function ArrangeView({ staff, base, getAuthHeaders, onDone }) {
  const buildGroups = (list) => {
    const groups = {};
    Object.keys(POSITION_GROUPS).forEach((g) => { groups[g] = []; });
    groups['Other'] = [];
    list.forEach((p) => {
      const pos = p.position?.trim().toLowerCase() || '';
      let placed = false;
      for (const [group, positions] of Object.entries(POSITION_GROUPS)) {
        if (positions.includes(pos)) { groups[group].push(p); placed = true; break; }
      }
      if (!placed) groups['Other'].push(p);
    });
    Object.keys(groups).forEach((g) => {
      groups[g].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    });
    return groups;
  };

  const [groups, setGroups] = useState(() => buildGroups(staff));
  const [saving, setSaving] = useState(false);
  const dragSrc = useRef(null); // { group, index }

  useEffect(() => {
    setGroups(buildGroups(staff));
  }, [staff]);

  const handleDragStart = (group, index) => {
    dragSrc.current = { group, index };
  };

  const handleDragOver = (e, group, index) => {
    e.preventDefault();
    if (!dragSrc.current || dragSrc.current.group !== group) return;
    const src = dragSrc.current.index;
    if (src === index) return;
    setGroups((prev) => {
      const next = { ...prev, [group]: [...prev[group]] };
      const [moved] = next[group].splice(src, 1);
      next[group].splice(index, 0, moved);
      dragSrc.current = { group, index };
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [];
      Object.values(groups).forEach((members) => {
        members.forEach((m, i) => updates.push({ id: m._id, displayOrder: i }));
      });
      const r = await fetch(`${base}/api/staff/reorder`, {
        method: 'PATCH',
        cache: 'no-store',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ updates }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Save failed');
      toast.success('Order saved — website will reflect this order.');
      onDone();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3">
        <p className="text-sm text-emerald-800">
          Drag staff within each category. The order here is how they appear on the website.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onDone}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save order'}
          </button>
        </div>
      </div>

      {Object.entries(groups).map(([groupName, members]) => {
        if (members.length === 0) return null;
        return (
          <div key={groupName} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{groupName}</p>
              <p className="text-xs text-slate-400">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
            <ul className="divide-y divide-slate-100">
              {members.map((person, index) => (
                <li
                  key={person._id}
                  draggable
                  onDragStart={() => handleDragStart(groupName, index)}
                  onDragOver={(e) => handleDragOver(e, groupName, index)}
                  className="flex items-center gap-3 px-5 py-3 cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors select-none"
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                  <span className="w-5 text-center text-xs font-medium text-slate-400">{index + 1}</span>
                  <Avatar person={person} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {person.firstName} {person.lastName}
                    </p>
                    {person.position && (
                      <p className="truncate text-xs text-emerald-600">{person.position}</p>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${person.isVisible !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {person.isVisible !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {person.isVisible !== false ? 'Live' : 'Hidden'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default function StaffManagementPage() {
  const { getAuthHeaders } = useAdminAuth();
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
  const [arrangeMode, setArrangeMode] = useState(false);

  const pageSize = 25;
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://puc-backend.vercel.app';

  const applyUpdate = (id, changes) => {
    const patch = (list) => list.map((x) => (x._id === id ? { ...x, ...changes } : x));
    setStaff(patch);
    setFiltered(patch);
  };

  const fetchData = useCallback(async ({ soft = false } = {}) => {
    if (!soft) setLoading(true);
    try {
      const h = getAuthHeaders();
      const [r1, r2, r3, r4] = await Promise.all([
        fetch(`${base}/api/staff`, { cache: 'no-store', credentials: 'include', headers: h }),
        fetch(`${base}/api/departments`, { cache: 'no-store', credentials: 'include', headers: h }),
        fetch(`${base}/api/teams`, { cache: 'no-store', credentials: 'include', headers: h }),
        fetch(`${base}/api/practice-areas`, { cache: 'no-store', credentials: 'include', headers: h }),
      ]);
      if (![r1, r2, r3, r4].every((r) => r.ok)) throw new Error('Failed to load staff data.');
      const [s, d, t, p] = await Promise.all([r1, r2, r3, r4].map((r) => r.json()));
      setStaff(s); setFiltered(s); setCurrentPage(1);
      setDepartments(d); setTeams(t); setPracticeAreas(p);
    } catch (e) {
      toast.error(e.message || 'Failed to load staff data.');
    } finally {
      if (!soft) setLoading(false);
    }
  }, [base, getAuthHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useRefetchOnVisible(() => fetchData({ soft: true }));

  useEffect(() => {
    let list = [...staff];
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      list = list.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(t) ||
        p.email?.toLowerCase().includes(t) ||
        p.position?.toLowerCase().includes(t)
      );
    }
    if (departmentFilter) list = list.filter((p) => p.department?._id === departmentFilter);
    setFiltered(list);
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, staff]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const totalVisible = staff.filter((p) => p.isVisible !== false).length;
  const totalActive = staff.filter((p) => p.passwordSetAt).length;

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this staff member?')) return;
    try {
      const r = await fetch(`${base}/api/staff/${id}`, { method: 'DELETE', cache: 'no-store', credentials: 'include', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Delete failed');
      setStaff((p) => p.filter((s) => s._id !== id));
      setFiltered((p) => p.filter((s) => s._id !== id));
      toast.success('Staff member deleted.');
    } catch (e) { toast.error(e.message); }
  };

  const handleToggleVisibility = async (person) => {
    const isVisible = person.isVisible !== false;
    const next = !isVisible;
    const fd = new FormData();
    fd.append('isVisible', String(next));
    try {
      const r = await fetch(`${base}/api/staff/${person._id}`, { method: 'PUT', cache: 'no-store', credentials: 'include', headers: getAuthHeaders(), body: fd });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Update failed');
      applyUpdate(person._id, { isVisible: next });
      toast.success(`${next ? 'Now visible' : 'Hidden'} on website.`);
    } catch (e) { toast.error(e.message); }
  };

  const handleSendInvite = async (person) => {
    setInviteLoadingId(person._id);
    try {
      const r = await fetch(`${base}/api/auth/invite`, { method: 'POST', cache: 'no-store', credentials: 'include', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify({ email: person.email }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Failed to send invite');
      toast.success('Activation email sent.');
      applyUpdate(person._id, { lastInviteSentAt: new Date().toISOString() });
    } catch (e) { toast.error(e.message); }
    finally { setInviteLoadingId(null); }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
        <p className="text-sm text-slate-500">Loading staff directory…</p>
      </div>
    );
  }

  if (arrangeMode) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Arrange Staff Order</h1>
            <p className="mt-0.5 text-sm text-slate-500">Drag to set the display order per category on the website.</p>
          </div>
        </div>
        <ArrangeView
          staff={staff}
          base={base}
          getAuthHeaders={getAuthHeaders}
          onDone={() => { setArrangeMode(false); fetchData(); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Staff Directory</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {staff.length} members · {totalVisible} visible on site · {totalActive} activated
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Reload directory from server"
            onClick={() => fetchData({ soft: true })}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => setArrangeMode(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowUpDown className="h-4 w-4" />
            Arrange order
          </button>
          <button
            onClick={() => { setEditingStaff(null); setShowModal(true); }}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <UserPlus className="h-4 w-4" />
            Add staff
          </button>
        </div>
      </div>

      {/* ── Metrics strip ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total staff', value: staff.length, sub: 'in directory' },
          { label: 'Live on site', value: totalVisible, sub: 'publicly visible', accent: true },
          { label: 'Activated', value: totalActive, sub: 'portal access' },
          { label: 'Pending', value: staff.length - totalActive, sub: 'not yet activated' },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${accent ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email or position…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="">All departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        {(searchTerm || departmentFilter) && (
          <span className="shrink-0 text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Person</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Office</th>
                <th className="px-5 py-3">Practice areas</th>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3">Site</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slice.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-sm text-slate-400">
                    No staff match your filter.
                  </td>
                </tr>
              )}
              {slice.map((person) => {
                const status = getStatus(person);
                const visible = person.isVisible !== false;
                const roles = (person.roles || []).filter((r) => r !== 'staff');
                const pas = person.practiceAreas || [];

                return (
                  <tr key={person._id} className="group transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar person={person} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {person.firstName} {person.lastName}
                          </p>
                          <p className="truncate text-xs text-slate-500">{person.email}</p>
                          {person.position && (
                            <p className="truncate text-xs text-emerald-600 font-medium">{person.position}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-700">{person.department?.name || <span className="text-slate-400">—</span>}</p>
                      {person.team?.name && <p className="text-xs text-slate-400">{person.team.name}</p>}
                      {roles.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {roles.map((r) => (
                            <span key={r} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                              {ROLE_LABELS[r] || r}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {person.officeLocation ? (
                        <span className="inline-flex rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800">
                          {OFFICE_LOCATION_LABELS[person.officeLocation] || person.officeLocation}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {pas.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {pas.slice(0, 3).map((a) => {
                            const k = typeof a === 'object' ? a._id : a;
                            const l = typeof a === 'object' ? a.name : a;
                            return (
                              <span key={k} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                                {l}
                              </span>
                            );
                          })}
                          {pas.length > 3 && (
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">+{pas.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusDot status={status} />
                      <p className="mt-1 text-[10px] text-slate-400">
                        Leave: {person.leaveEnabled !== false ? 'enabled' : 'disabled'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {visible ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <ActionsMenu
                        person={person}
                        onEdit={() => { setEditingStaff(person); setShowModal(true); }}
                        onDelete={() => handleDelete(person._id)}
                        onToggleVisibility={() => handleToggleVisibility(person)}
                        onSendInvite={() => handleSendInvite(person)}
                        inviteLoading={inviteLoadingId === person._id}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={safePage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {(() => {
                const pages = [];
                for (let n = 1; n <= totalPages; n++) {
                  if (n === 1 || n === totalPages || Math.abs(n - safePage) <= 1) pages.push(n);
                }
                const items = [];
                for (let i = 0; i < pages.length; i++) {
                  if (i > 0 && pages[i] - pages[i - 1] > 1) {
                    items.push(<span key={`gap-${i}`} className="w-7 text-center text-xs text-slate-400">…</span>);
                  }
                  const n = pages[i];
                  items.push(
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className={`h-7 w-7 rounded-md text-xs font-medium transition ${n === safePage ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {n}
                    </button>
                  );
                }
                return items;
              })()}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={safePage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <AddUserModal
          onClose={() => { setShowModal(false); setEditingStaff(null); }}
          onSaved={() => { setShowModal(false); setEditingStaff(null); fetchData(); }}
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
