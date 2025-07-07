'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboardOverview() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [practiceAreas, setPracticeAreas] = useState([]);

  useEffect(() => {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

    const fetchAll = async () => {
      const [staffRes, deptRes, teamRes, paRes] = await Promise.all([
        fetch(`${backend}/api/staff`),
        fetch(`${backend}/api/departments`),
        fetch(`${backend}/api/teams`),
        fetch(`${backend}/api/practice-areas`),
      ]);

      const [staffData, deptData, teamData, paData] = await Promise.all([
        staffRes.json(),
        deptRes.json(),
        teamRes.json(),
        paRes.json(),
      ]);

      setStaff(staffData);
      setDepartments(deptData);
      setTeams(teamData);
      setPracticeAreas(paData);
    };

    fetchAll();
  }, []);

  // Fake activity feed for now (you’ll swap this with real logs later)
  const activityFeed = staff.slice().reverse().slice(0, 5).map((user) => ({
    id: user._id,
    type: 'Staff',
    message: `Added ${user.firstName} ${user.lastName}`,
    avatar: user.profilePhoto
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profilePhoto}`
      : '/default-avatar.png',
    timestamp: new Date(user.createdAt || user._id?.toString().slice(0, 8) * 1000).toLocaleDateString(), // fallback logic
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
      {/* Sidebar */}
      <aside className="w-full lg:w-1/3 space-y-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="font-semibold text-slate-700 text-lg">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-500">Staff</p>
              <p className="text-xl font-bold">{staff.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Departments</p>
              <p className="text-xl font-bold">{departments.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Teams</p>
              <p className="text-xl font-bold">{teams.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Practice Areas</p>
              <p className="text-xl font-bold">{practiceAreas.length}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-slate-700 text-lg mb-4">Recent Activity</h2>
          {activityFeed.length === 0 ? (
            <p className="text-slate-500 text-sm">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {activityFeed.map((item) => (
                <li key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.message}</p>
                    <p className="text-xs text-slate-400">
                      {item.type} · {item.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <main className="w-full lg:w-2/3 bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Welcome, Admin 👋</h1>
        <p className="text-slate-600 mb-6">
          This is your control panel. As more modules (onboarding, leave, tasks) go live, they’ll show up here.
        </p>

        <div className="bg-slate-50 p-4 rounded text-slate-500 text-sm">
          🚧 Modules under construction. More updates coming soon.
        </div>
      </main>
    </div>
  );
}
