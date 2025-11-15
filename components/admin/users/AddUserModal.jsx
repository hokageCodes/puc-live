'use client';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

const DIVISIONS = [
  { value: 'legal', label: 'Legal (Website-facing)' },
  { value: 'admin', label: 'Admin/Operations' },
  { value: 'other', label: 'Other' },
];

const ROLE_OPTIONS = [
  { value: 'teamLead', label: 'Team Lead', description: 'Approves team members' },
  { value: 'lineManager', label: 'Line Manager', description: 'Approves departments' },
  { value: 'hr', label: 'HR', description: 'Final approval & settings' },
  { value: 'admin', label: 'Admin (Website/CMS)', description: 'Manages public site' },
];

const ROLE_LABELS = {
  staff: 'Staff',
  teamLead: 'Team Lead',
  lineManager: 'Line Manager',
  hr: 'HR',
  admin: 'Admin',
};

export default function AddUserModal({ onClose, onSaved, departments, teams, practiceAreas, allStaff = [], editingStaff }) {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const [division, setDivision] = useState('legal');
  const [selectedRoles, setSelectedRoles] = useState(['staff']);
  const [leaveEnabled, setLeaveEnabled] = useState(true);
  const [hireDate, setHireDate] = useState('');
  const [confirmationDate, setConfirmationDate] = useState('');
  const [selectedTeamLeadId, setSelectedTeamLeadId] = useState('');
  const [selectedLineManagerId, setSelectedLineManagerId] = useState('');

  const reportingStaffId = editingStaff ? editingStaff._id : null;
  const reportingOptions = useMemo(
    () => (allStaff || []).filter((staffMember) => staffMember._id !== reportingStaffId),
    [allStaff, reportingStaffId]
  );

  const toggleRole = (role) => {
    if (role === 'staff') return;
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        const next = prev.filter((item) => item !== role);
        return next.length ? next : ['staff'];
      }
      return Array.from(new Set([...prev, role]));
    });
  };

  const hasRole = (role) => selectedRoles.includes(role);

  const togglePracticeArea = (id) => {
    setSelectedPracticeAreas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    if (editingStaff) {
      setCurrentStep(1);
      setFirstName(editingStaff.firstName || '');
      setLastName(editingStaff.lastName || '');
      setEmail(editingStaff.email || '');
      setPhoneNumber(editingStaff.phoneNumber || '');
      setPosition(editingStaff.position || '');
      setBio(editingStaff.bio || '');
      setEmployeeId(editingStaff.employeeId || '');
      setIsVisible(editingStaff.isVisible !== false);
      setDivision(editingStaff.division || 'legal');
      const incomingRoles = Array.isArray(editingStaff.roles) && editingStaff.roles.length
        ? Array.from(new Set(['staff', ...editingStaff.roles]))
        : ['staff'];
      setSelectedRoles(incomingRoles);
      setLeaveEnabled(editingStaff.leaveEnabled !== false);
      setHireDate(editingStaff.hireDate ? editingStaff.hireDate.slice(0, 10) : '');
      setConfirmationDate(editingStaff.confirmationDate ? editingStaff.confirmationDate.slice(0, 10) : '');
      setSelectedTeamLeadId(editingStaff.teamLeadId?._id || editingStaff.teamLeadId || '');
      setSelectedLineManagerId(editingStaff.lineManagerId?._id || editingStaff.lineManagerId || '');
      setSelectedDepartment(editingStaff.department?._id || editingStaff.department || '');
      setSelectedTeam(editingStaff.team?._id || editingStaff.team || '');
      setSelectedPracticeAreas(
        (editingStaff.practiceAreas || []).map((pa) => pa?._id || pa).filter(Boolean)
      );
      setSelectedFile(null);
      setRemoveExistingImage(false);
      setPreviewUrl('');
    } else {
      setCurrentStep(1);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setPosition('');
      setBio('');
      setEmployeeId('');
      setIsVisible(true);
      setDivision('legal');
      setSelectedRoles(['staff']);
      setLeaveEnabled(true);
      setHireDate('');
      setConfirmationDate('');
      setSelectedTeamLeadId('');
      setSelectedLineManagerId('');
      setSelectedDepartment('');
      setSelectedTeam('');
      setSelectedPracticeAreas([]);
      setSelectedFile(null);
      setRemoveExistingImage(false);
      setPreviewUrl('');
    }
  }, [editingStaff]);

  useEffect(() => {
    if (selectedDepartment && teams) {
      const filtered = teams.filter(t => {
        // Handle both populated and unpopulated department fields
        const deptId = t.department?._id || t.department;
        return deptId?.toString() === selectedDepartment;
      });
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams([]);
      setSelectedTeam(''); // Clear team selection when department changes
    }
  }, [selectedDepartment, teams]);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setPreviewUrl('');
    return undefined;
  }, [selectedFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);
      formData.append('position', position);
      formData.append('bio', bio);
      if (selectedDepartment !== undefined) {
        formData.append('department', selectedDepartment ?? '');
      }

      if (selectedTeam !== undefined) {
        formData.append('team', selectedTeam ?? '');
      }

      const normalizedEmployeeId = employeeId.trim();

      if (selectedPracticeAreas.length > 0) {
        selectedPracticeAreas.forEach((pa) => {
        formData.append('practiceAreas', pa);
      });
      } else {
        formData.append('practiceAreas', '');
      }

      formData.append('roles', selectedRoles.join(','));

      formData.append('division', division);
      formData.append('leaveEnabled', leaveEnabled ? 'true' : 'false');

      if (hireDate) {
        formData.append('hireDate', hireDate);
      } else if (editingStaff?.hireDate && !hireDate) {
        formData.append('hireDate', '');
      }

      if (confirmationDate) {
        formData.append('confirmationDate', confirmationDate);
      } else if (editingStaff?.confirmationDate && !confirmationDate) {
        formData.append('confirmationDate', '');
      }

      if (selectedTeamLeadId) {
        formData.append('teamLeadId', selectedTeamLeadId);
      } else if (editingStaff && !selectedTeamLeadId) {
        formData.append('teamLeadId', '');
      }

      if (selectedLineManagerId) {
        formData.append('lineManagerId', selectedLineManagerId);
      } else if (editingStaff && !selectedLineManagerId) {
        formData.append('lineManagerId', '');
      }

      if (normalizedEmployeeId) {
        formData.append('employeeId', normalizedEmployeeId);
      } else if (editingStaff?.employeeId) {
        formData.append('employeeId', '');
      }

      formData.append('isVisible', isVisible ? 'true' : 'false');

      if (selectedFile) {
        formData.append('profilePhoto', selectedFile);
      }

      if (removeExistingImage && !selectedFile) {
        formData.append('removeImage', 'true');
      }

      const url = editingStaff
        ? `${backendUrl}/api/staff/${editingStaff._id}`
        : `${backendUrl}/api/staff`;

      const method = editingStaff ? 'PUT' : 'POST';
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('admin_token') : null;

      const requestOptions = {
        method,
        credentials: 'include',
        body: formData,
      };

      if (token) {
        requestOptions.headers = { Authorization: `Bearer ${token}` };
      }

      const res = await fetch(url, requestOptions);

      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        toast.success(`Staff member ${editingStaff ? 'updated' : 'created'} successfully!`);
        onSaved?.();
      } else {
        console.error('Failed to save staff:', data);
        toast.error(data.message || data.error || 'Failed to save staff.');
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      toast.error(err.message || 'Failed to upload the staff record.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = (e) => {
    if (e) e.preventDefault();
    // Validate current step before proceeding - website only needs basic info
    if (currentStep === 1) {
      const requiredFieldsFilled =
        firstName.trim() &&
        lastName.trim() &&
        email.trim() &&
        phoneNumber.trim() &&
        position.trim();

      if (!requiredFieldsFilled) {
        toast.warn('Please provide the required personal information.');
        return;
      }
    }
    
    if (currentStep < stepCount) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      label: 'Personal Info',
      description: 'Core contact and profile details',
    },
    {
      label: 'Website & Leave',
      description: 'Departments, responsibilities, visibility',
    },
  ];
  const stepCount = steps.length;
  const showCurrentPhoto = Boolean(editingStaff?.profilePhoto && !removeExistingImage && !selectedFile);
  const showPreview = Boolean(previewUrl);
  const inputClasses = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition';
  const textareaClasses = `${inputClasses} min-h-[120px] resize-none`;
  const sectionCardClasses = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100';
  const badgeClasses = 'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-6">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl ring-1 ring-slate-100"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
          aria-label="Close add staff modal"
        >
          <span className="text-lg">×</span>
        </button>

        <div className="grid max-h-[85vh] gap-8 overflow-y-auto p-8">
          <header className="space-y-2 pr-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-600">Team Member</p>
            <h2 className="text-2xl font-bold text-slate-900">
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>
            <p className="text-sm text-slate-600">
              Capture both public-facing details and leave-management responsibilities in one place.
            </p>
          </header>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {steps.map((step, index) => {
                const isComplete = index + 1 < currentStep;
                const isActive = index + 1 === currentStep;

                return (
                  <div key={step.label} className="flex flex-1 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow shadow-emerald-200'
                          : isComplete
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border-slate-200 bg-white text-slate-400'
                      }`}
                    >
                    {index + 1}
                  </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                        {step.label}
                      </span>
                      <span className="text-xs text-slate-400">{step.description}</span>
                    </div>
                    {index < stepCount - 1 && (
                      <div
                        className={`h-px flex-1 rounded-full transition ${
                          index + 1 < currentStep ? 'bg-emerald-300' : 'bg-slate-200'
                        }`}
                      />
                  )}
                </div>
                );
              })}
              </div>

            <div className="mt-4 grid gap-6">
              {currentStep === 1 && (
                <section className={`${sectionCardClasses} space-y-6`}> 
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Personal information</h3>
                      <p className="text-sm text-slate-500">
                        These details power the contact cards and staff directory listings.
                      </p>
          </div>
                    {editingStaff?.staffCode && (
                      <span className={`${badgeClasses} bg-emerald-50/80 text-emerald-700`}>ID · {editingStaff.staffCode}</span>
                    )}
        </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employee ID (optional)</label>
                      <input
                        type="text"
                        className={inputClasses}
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="e.g. PUC-042"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Position</label>
                      <input
                        type="text"
                        className={inputClasses}
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        required
                        placeholder="Lead Associate"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">First name</label>
                      <input
                        type="text"
                        className={inputClasses}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Ada"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last name</label>
          <input
            type="text"
                        className={inputClasses}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
            required
                        placeholder="Obi"
          />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email address</label>
          <input
            type="email"
                        className={inputClasses}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
                        placeholder="ada@paulusoro.com"
          />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone number</label>
          <input
            type="tel"
                        className={inputClasses}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
                        placeholder="(+234) 801 234 5678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Short bio</label>
          <textarea
                      className={textareaClasses}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
                      placeholder="Summarise their expertise and notable achievements..."
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Division</label>
                      <select
                        className={inputClasses}
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                      >
                        {DIVISIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500">
                        Admin staff do not appear on the public website and route approvals directly to HR.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Leave access</label>
                      <button
                        type="button"
                        onClick={() => setLeaveEnabled((prev) => !prev)}
                        className={`w-full rounded-full border px-4 py-2 text-sm font-medium transition ${
                          leaveEnabled
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}
                      >
                        {leaveEnabled ? 'Enabled for leave management' : 'Disabled (cannot log into leave portal)'}
                      </button>
                      <p className="text-xs text-slate-500">
                        Disable access for contractors or consultants who should not request leave.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Responsibilities &amp; additional access</label>
                    <p className="text-xs text-slate-500">Staff role is always included. Toggle extra responsibilities below.</p>
                    <div className="flex flex-wrap gap-2">
                      {ROLE_OPTIONS.map((role) => {
                        const active = hasRole(role.value);
                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => toggleRole(role.value)}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                              active
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
                            }`}
                            title={role.description}
                          >
                            {role.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                    <div className="space-y-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile photo</span>
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {(showPreview || showCurrentPhoto) ? (
                          <img
                            src={showPreview ? previewUrl : editingStaff.profilePhoto}
                            alt="Profile preview"
                            className="h-40 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-40 w-full items-center justify-center bg-emerald-50 text-sm font-medium text-emerald-700">
                            No photo selected
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5">
                        <p className="text-sm font-medium text-slate-700">Upload profile photo</p>
                        <p className="mt-1 text-xs text-slate-500">JPG or PNG, at least 600×600px for crisp results (max 5MB).</p>
                        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
          <input
            type="file"
            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedFile(file);
                                setRemoveExistingImage(false);
                              }
                            }}
                          />
                          Choose image…
                        </label>
                        {selectedFile && (
                          <p className="mt-2 text-xs text-slate-500">Selected file: {selectedFile.name}</p>
                        )}
                        {showCurrentPhoto && (
                          <button
                            type="button"
                            className="mt-3 text-xs font-medium text-rose-600 hover:underline"
                            onClick={() => setRemoveExistingImage(true)}
                          >
                            Remove current photo
                          </button>
                        )}
                        {removeExistingImage && !selectedFile && (
                          <p className="mt-2 text-xs text-rose-600">Photo will be removed unless you upload a new one.</p>
                        )}
                      </div>
                    </div>
          </div>
                </section>
        )}

        {currentStep === 2 && (
                <section className={`${sectionCardClasses} space-y-6`}>
          <div>
                    <h3 className="text-base font-semibold text-slate-900">Website placement</h3>
                    <p className="text-sm text-slate-500">
                      Control where this profile appears by selecting the right department, team, and practice areas.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary department</label>
          <select
                        className={inputClasses}
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
                        <option value="">Select department</option>
            {departments?.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Team (optional)</label>
          <select
                        className={`${inputClasses} ${!selectedDepartment ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''}`}
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            disabled={!selectedDepartment}
          >
                        <option value="">Select team</option>
            {filteredTeams?.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Practice areas
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {practiceAreas?.length ? (
                        practiceAreas.map((pa) => {
                          const id = pa._id || pa.id;
                          const isSelected = selectedPracticeAreas.includes(id);
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => togglePracticeArea(id)}
                              className={`flex items-center justify-between rounded-xl border px-4 py-2 text-sm transition ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/70'
                              }`}
                            >
                              <span>{pa.name || pa.label}</span>
                              <span className={isSelected ? 'text-emerald-600' : 'text-slate-300'}>●</span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-sm text-slate-500">No practice areas configured yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Team lead</label>
                      <select
                        className={inputClasses}
                        value={selectedTeamLeadId}
                        onChange={(e) => setSelectedTeamLeadId(e.target.value)}
                      >
                        <option value="">No team lead</option>
                        {reportingOptions.map((staffMember) => (
                          <option key={staffMember._id} value={staffMember._id}>
                            {`${staffMember.staffCode || ''} ${staffMember.firstName} ${staffMember.lastName}`.trim()}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500">Select who approves first. Staff can submit requests even if they are a team lead.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Line manager</label>
                      <select
                        className={inputClasses}
                        value={selectedLineManagerId}
                        onChange={(e) => setSelectedLineManagerId(e.target.value)}
                      >
                        <option value="">No line manager</option>
                        {reportingOptions.map((staffMember) => (
                          <option key={staffMember._id} value={staffMember._id}>
                            {`${staffMember.staffCode || ''} ${staffMember.firstName} ${staffMember.lastName}`.trim()}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500">Line managers approve after team leads unless the requester is their own line manager.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hire date</label>
                      <input
                        type="date"
                        className={inputClasses}
                        value={hireDate}
                        onChange={(e) => setHireDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmation date</label>
            <input
                        type="date"
                        className={inputClasses}
                        value={confirmationDate}
                        onChange={(e) => setConfirmationDate(e.target.value)}
                      />
          </div>
          </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Visible on public website</p>
                      <p className="text-xs text-slate-500">Toggle off to hide this profile without deleting their record.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsVisible((prev) => !prev)}
                      className={`relative h-6 w-12 rounded-full transition ${
                        isVisible ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      aria-pressed={isVisible}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                          isVisible ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </section>
              )}
            </div>
        </div>

          <footer className="flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-slate-400">
              Step {currentStep} of {stepCount}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                ← Previous
              </button>
            )}
            
              {currentStep < stepCount ? (
              <button
                type="button"
                onClick={nextStep}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                  {loading ? (editingStaff ? 'Updating…' : 'Creating…') : editingStaff ? '✓ Save changes' : '✓ Create staff'}
              </button>
            )}
          </div>
          </footer>
        </div>
      </form>
    </div>
  );
}
