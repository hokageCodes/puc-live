import React from 'react';

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/staff`, {
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch team data');
  return res.json();
}

export default async function TeamPage() {
  const data = await getData();

  return (
    <div className="min-h-screen bg-white text-[#01553d] px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Team</h1>

      {data.length === 0 ? (
        <p className="text-center text-gray-600">No team data available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.map((member) => (
            <div
              key={member.id}
              className="bg-[#01553d] text-white p-4 rounded-lg shadow"
            >
              <h4 className="text-lg font-semibold">
                {member.firstName} {member.lastName}
              </h4>
              <p className="text-sm mt-1">Department: {member.department || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
