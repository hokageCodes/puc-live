'use client';
import { useState, useEffect } from 'react';

export default function AddUserModal({ onClose, departments, teams, practiceAreas }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Leave Management Fields
  const [isOnProbation, setIsOnProbation] = useState(true);
  const [employeeId, setEmployeeId] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [isTeamLead, setIsTeamLead] = useState(false);
  const [isLineManager, setIsLineManager] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);

  useEffect(() => {
    if (selectedDepartment && teams) {
      const filtered = teams.filter(t => t.department?.toString() === selectedDepartment);
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams([]);
    }
  }, [selectedDepartment, teams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse full name into firstName and lastName
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);
      formData.append('position', position);
      formData.append('bio', bio);
      formData.append('profilePhoto', selectedFile);
      formData.append('department', selectedDepartment);
      if (selectedTeam) formData.append('team', selectedTeam);
      formData.append('isOnProbation', isOnProbation ? 'true' : 'false');
      formData.append('employeeId', employeeId);
      if (hireDate) formData.append('hireDate', hireDate);
      formData.append('isTeamLead', isTeamLead ? 'true' : 'false');
      formData.append('isLineManager', isLineManager ? 'true' : 'false');
      
      // Add practice areas
      selectedPracticeAreas.forEach(pa => {
        formData.append('practiceAreas', pa);
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://puc-backend-t8pl.onrender.com'}/api/staff`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        alert('Staff member created successfully!');
        onClose();
      } else {
        alert(data.message || 'Failed to create staff');
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      alert('Failed to upload');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const stepNames = ['Basic Info', 'Department & Role', 'Leave Management'];

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4 overflow-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header with Step Indicator */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Add Staff Member</h2>
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between mb-2">
            {stepNames.map((name, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    index + 1 <= currentStep 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div className={`h-1 w-full mx-2 ${
                      index + 1 < currentStep ? 'bg-emerald-600' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-600 px-2">
            <span className={currentStep === 1 ? 'font-semibold text-emerald-700' : ''}>Personal Info</span>
            <span className={currentStep === 2 ? 'font-semibold text-emerald-700' : ''}>Department</span>
            <span className={currentStep === 3 ? 'font-semibold text-emerald-700' : ''}>Leave Settings</span>
          </div>
        </div>

        <div className="space-y-4">

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div>
            <h3 className="font-semibold text-slate-700 mb-3">Personal Information</h3>
          <input
            type="text"
            placeholder="Full Name (First Last)"
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Position"
            className="input"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
          <textarea
            placeholder="Bio"
            className="input"
            rows="3"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            required
          />
          </div>
        )}

        {/* Step 2: Department & Team */}
        {currentStep === 2 && (
          <div>
            <h3 className="font-semibold text-slate-700 mb-3">Department & Assignment</h3>
          <select
            className="input"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            required
          >
            <option value="">Select Department</option>
            {departments?.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            disabled={!selectedDepartment}
          >
            <option value="">Select Team (Optional)</option>
            {filteredTeams?.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
          </div>
        )}

        {/* Step 3: Leave Management */}
        {currentStep === 3 && (
          <div>
            <h3 className="font-semibold text-slate-700 mb-3">Leave Management Settings</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="isOnProbation"
              checked={isOnProbation}
              onChange={(e) => setIsOnProbation(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isOnProbation" className="text-sm text-slate-700">
              On Probation (Not on website yet, can't access leave system)
            </label>
          </div>

          <input
            type="text"
            placeholder="Employee ID"
            className="input"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
          
          <input
            type="date"
            placeholder="Hire Date"
            className="input"
            value={hireDate}
            onChange={(e) => setHireDate(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isTeamLead"
                checked={isTeamLead}
                onChange={(e) => setIsTeamLead(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="isTeamLead" className="text-sm text-slate-700">
                Team Lead
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isLineManager"
                checked={isLineManager}
                onChange={(e) => setIsLineManager(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="isLineManager" className="text-sm text-slate-700">
                Line Manager
              </label>
            </div>
          </div>
        </div>

          </div>
        )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-2 pt-6 mt-6 border-t">
          <button
            type="button"
            className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          
          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="bg-slate-200 px-6 py-2 rounded hover:bg-slate-300"
              >
                ← Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : '✓ Create Staff'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
