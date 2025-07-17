import React from 'react';

// Fetch individual staff data
async function getStaffDetail(id) {
  const res = await fetch(`https://puc-backend-t8pl.onrender.com/api/staff/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch staff: ${res.status} - ${errText}`);
  }
  return res.json();
}

// Format bio: bolden detected section titles
function formatBioText(bio) {
  if (!bio) return '';

  const boldTitles = [
    'Education', 'Experience', 'Background', 'Expertise', 'Publications',
    'Memberships', 'Awards', 'Training', 'Career', 'Professional',
    'Qualifications', 'Specialization', 'Areas of Practice', 'Notable Cases',
    'Achievements', 'Academic', 'Research', 'Bar Admission', 'Honors', 'Leadership'
  ];

  const lines = bio.split('\n');

  return lines
    .map((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return '<br>';

      const match = boldTitles.find((title) =>
        trimmedLine.toLowerCase().startsWith(title.toLowerCase())
      );
      return match
        ? `<p><strong>${trimmedLine}</strong></p>`
        : `<p>${trimmedLine}</p>`;
    })
    .join('');
}

export default async function StaffDetailPage({ params }) {
  const staff = await getStaffDetail(params.id);
  // console.log('✅ Raw staff data:', staff);


  // Ensure we gracefully handle practiceAreas being an array of objects or empty
  const practiceAreas = Array.isArray(staff.practiceAreas)
    ? staff.practiceAreas.map((area) =>
        typeof area === 'object' && area !== null ? area.name : ''
      ).filter(Boolean)
    : [];

  const baseUrl = 'https://puc-backend-t8pl.onrender.com';
  const imageUrl = staff.profilePhoto
    ? `${baseUrl}/${staff.profilePhoto.replace(/^\/?uploads\//, 'uploads/')}`
    : null;

  return (
    <div className="min-h-screen pt-28 px-4 pb-12 sm:px-6 lg:px-24 text-[#014634]">
      {/* Back Link */}
      <div className="mb-8">
        <a href="/people" className="text-sm text-[#014634] hover:underline">
          ← Back to Our People
        </a>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-72 h-108 sm:w-108 sm:h-108 rounded-full overflow-hidden shadow-lg mb-6 border-2 border-[#01553d]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${staff.firstName} ${staff.lastName}`}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              No Photo
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-2">
          {staff.firstName} {staff.lastName}
        </h1>
        {staff.position && (
          <p className="text-emerald-700 font-medium text-xl mb-4">{staff.position}</p>
        )}
      </div>

      {/* Contact & Practice Areas Cards */}
      <div className="max-w-4xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-[#014634]">Contact Information</h3>
          <div className="space-y-3">
            {staff.email && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a href={`mailto:${staff.email}`} className="text-gray-700 hover:text-emerald-600 hover:underline">
                  {staff.email}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-[#014634]">Practice Areas</h3>
          {practiceAreas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {practiceAreas.map((area, i) => (
                <span key={i} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                  {area}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No practice areas found</p>
          )}
        </div>
      </div>

      {/* Biography Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-[#014634]">Biography</h2>
          <div
            className="text-gray-700 leading-relaxed prose prose-lg max-w-none text-justify"
            style={{ fontSize: '16px', lineHeight: '1.7' }}
            dangerouslySetInnerHTML={{ __html: formatBioText(staff.bio) }}
          />
        </div>
      </div>
    </div>
  );
}
