'use client';

import { useState, useEffect } from 'react';

export default function AddUserModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [practiceAreas, setPracticeAreas] = useState([]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    position: '',
    bio: '',
    profilePhoto: '',
    department: '',
    team: '',
    practiceAreas: [],
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePracticeAreaChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setForm((prev) => ({ ...prev, practiceAreas: selected }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
  
      Object.entries(form).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v)); // For practiceAreas
        } else {
          formData.append(key, value);
        }
      });
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/staff`, {
        method: 'POST',
        body: formData,
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        console.error('🚨 Backend error:', result);
        throw new Error(result.error || 'Failed to create user');
      }
  
      console.log('✅ User created:', result);
      onClose();
    } catch (err) {
      console.error('❌ Error:', err.message);
      alert(err.message);
    }
  };
  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

        const [deptRes, teamRes, paRes] = await Promise.all([
          fetch(`${backend}/api/departments`),
          fetch(`${backend}/api/teams`),
          fetch(`${backend}/api/practice-areas`),
        ]);

        const [deptData, teamData, paData] = await Promise.all([
          deptRes.json(),
          teamRes.json(),
          paRes.json(),
        ]);
        
        console.log({ deptData, teamData, paData })
        setDepartments(deptData);
        setTeams(teamData);
        setPracticeAreas(paData);
      } catch (err) {
        console.error('Error fetching form options:', err);
      }
    };

    fetchOptions();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-700"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4">Add New Staff</h2>

        {step === 1 && (
          <div className="space-y-4">
            <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} className="input" />
            <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} className="input" />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} className="input" />
            <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} className="input" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input type="text" name="position" placeholder="Position" onChange={handleChange} className="input" />
            <textarea name="bio" placeholder="Bio" onChange={handleChange} className="input" />
            <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={(e) => setForm(prev => ({ ...prev, profilePhoto: e.target.files[0] }))}
                className="input"
            />

          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label>Department</label>
            <select name="department" onChange={handleChange} className="input" value={form.department}>
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>

            <label>Team</label>
            <select name="team" onChange={handleChange} className="input" value={form.team}>
              <option value="">Select Team (optional)</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>

            <label>Practice Areas</label>
            <select
              name="practiceAreas"
              multiple
              onChange={handlePracticeAreaChange}
              className="input h-32"
              value={form.practiceAreas}
            >
              {practiceAreas.map((pa) => (
                <option key={pa._id} value={pa._id}>{pa.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="text-slate-600">Back</button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="bg-emerald-600 text-white px-4 py-2 rounded">Next</button>
          ) : (
            <button onClick={handleSubmit} className="bg-emerald-600 text-white px-4 py-2 rounded">Submit</button>
          )}
        </div>
      </div>
    </div>
  );
}
