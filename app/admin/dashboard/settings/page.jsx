'use client';

import { useEffect, useState } from 'react';
import { fetchStaff } from '../../../../utils/api';

export default function AdminDashboardPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff()
      .then(setStaff)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Staff Directory</h1>
        <div className="flex gap-2">
          <button className="bg-[#01553d] text-white px-4 py-2 rounded">Export</button>
          <button className="border border-[#01553d] text-[#01553d] px-4 py-2 rounded">
            Add Staff
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-[#01553d]/10 text-[#01553d] text-left">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Team</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="px-4 py-2">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2">{s.phoneNumber}</td>
                  <td className="px-4 py-2">{s.department?.name || '-'}</td>
                  <td className="px-4 py-2">{s.team?.name || '-'}</td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:underline text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
