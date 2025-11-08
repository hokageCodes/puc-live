import React from 'react';
import { getImageUrl } from '../../../lib/getImageUrl';

// Fetch individual staff data
async function getStaffDetail(id) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
  const res = await fetch(`${baseUrl}/api/staff/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch staff: ${res.status} - ${errText}`);
  }
  return res.json();
}

// Format bio: bolden detected section titles
function parseBioSections(bio) {
  if (!bio) return [];

  const headings = [
    'Education', 'Experience', 'Background', 'Expertise', 'Publications',
    'Memberships', 'Awards', 'Training', 'Career', 'Professional',
    'Qualifications', 'Specialization', 'Areas of Practice', 'Notable Cases',
    'Achievements', 'Academic', 'Research', 'Bar Admission', 'Honors', 'Leadership'
  ];

  const lines = bio.split(/\r?\n/);
  const sections = [];
  let current = { title: null, paragraphs: [] };
  let buffer = [];

  const commitParagraph = () => {
    if (buffer.length) {
      current.paragraphs.push(buffer.join(' '));
      buffer = [];
    }
  };

  const commitSection = () => {
    commitParagraph();
    if (current.title || current.paragraphs.length) {
      sections.push(current);
    }
    current = { title: null, paragraphs: [] };
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      commitParagraph();
      return;
    }

    const headingMatch = headings.find((title) =>
      trimmed.toLowerCase().startsWith(title.toLowerCase())
    );

    if (headingMatch) {
      commitSection();
      current.title = trimmed.replace(/:$/, '');
    } else {
      buffer.push(trimmed);
    }
  });

  commitSection();

  if (sections.length === 0) {
    return [{ title: null, paragraphs: [bio] }];
  }

  return sections;
}

export default async function StaffDetailPage({ params }) {
  const staff = await getStaffDetail(params.id);
  // console.log('✅ Raw staff data:', staff);


  // Ensure we gracefully handle practiceAreas being an array of objects or empty
  const practiceAreas = Array.isArray(staff.practiceAreas)
    ? staff.practiceAreas
        .map((area) => (typeof area === 'object' && area !== null ? area.name : area))
        .filter(Boolean)
    : [];

  const imageUrl = getImageUrl(staff.profilePhoto);
  const bioSections = parseBioSections(staff.bio);

  return (
    <div className="min-h-screen pt-28 px-4 pb-16 sm:px-6 lg:px-20 xl:px-32 text-[#014634] bg-slate-50">
      {/* Back Link */}
      <div className="mb-8">
        <a href="/people" className="text-sm text-[#014634] hover:underline">
          ← Back to Our People
        </a>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden shadow-xl mb-6 border-4 border-[#01553d]/30 bg-white">
          {staff.profilePhoto ? (
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
      <div className="max-w-5xl mx-auto mb-12 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-[#014634]">Contact Information</h3>
          <div className="space-y-3 text-left">
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
            {staff.phoneNumber && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.437a1 1 0 01-.54 1.046l-1.548.774a11.037 11.037 0 005.012 5.012l.774-1.548a1 1 0 011.046-.54l4.437.74A1 1 0 0118 14.847V17a1 1 0 01-1 1h-1C7.82 18 2 12.18 2 5V4a1 1 0 011-1z" />
                </svg>
                <span className="text-gray-700">{staff.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
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
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-10 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-[#014634]">Biography</h2>
          {bioSections.length > 0 ? (
            <div className="text-gray-700 leading-relaxed space-y-6 text-left">
              {bioSections.map((section, index) => (
                <div key={index} className="space-y-3">
                  {section.title && (
                    <h3 className="text-lg font-semibold text-emerald-700 tracking-wide uppercase">
                      {section.title}
                    </h3>
                  )}
                  {section.paragraphs.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-base leading-7 text-slate-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base leading-7 text-slate-700">Biography coming soon.</p>
          )}
        </div>
      </div>
    </div>
  );
}
