"use client";
import React, { useState, useMemo, useRef } from "react";
import { useInView } from "framer-motion";
import ApplicationModal from "../../components/ApplicationModal";
import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  DollarSign,
  Clock,
  ChevronRight,
} from "lucide-react";

const JobListingsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showGeneralModal, setShowGeneralModal] = useState(false);

  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true, amount: 0.3 });

  const jobs = [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      department: "Engineering",
      type: "Full-time",
      location: "Remote/Hybrid",
      salary: "$120k - $180k",
      experience: "5+ years",
      description: "Lead the development of scalable web applications...",
      skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
    },
    {
      id: 2,
      title: "UX/UI Designer",
      department: "Design",
      type: "Full-time",
      location: "New York, NY",
      salary: "$90k - $130k",
      experience: "3+ years",
      description: "Create beautiful, intuitive user experiences...",
      skills: ["Figma", "Adobe Creative Suite", "Prototyping", "User Research"],
    },
    // Add more jobs as needed...
  ];

  const departments = ["all", "Engineering", "Design", "Business", "Marketing"];

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some((s) =>
          s.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchDept =
        selectedDepartment === "all" || job.department === selectedDepartment;
      return matchSearch && matchDept;
    });
  }, [searchTerm, selectedDepartment]);

  const JobCard = ({ job, isListView }) => (
    <div
      className={`bg-white border transition-all duration-300 hover:shadow-md group rounded-xl p-6 ${
        isListView ? "" : "hover:border-[#01553d]"
      }`}
    >
      <div>
        <h3 className="text-lg font-bold text-[#01553d] mb-2">
          {job.title}
        </h3>
        <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
          <span className="bg-[#01553d]/10 text-[#01553d] px-3 py-1 rounded-full">
            {job.department}
          </span>
          <span className="border border-gray-300 px-3 py-1 rounded-full">
            {job.type}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#01553d]" />
            {job.location}
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#01553d]" />
            {job.salary}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#01553d]" />
            {job.experience}
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-4">{job.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.map((skill, i) => (
            <span
              key={i}
              className="bg-gray-100 text-gray-700 px-3 py-1 text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
        <button
          onClick={() => setSelectedJob(job)}
          className="w-full bg-[#01553d] text-white py-2 rounded-lg hover:bg-[#013d2e] transition-colors"
        >
          Apply Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="w-full text-center mb-16 mt-32" ref={headerRef}>
        <h2
          className={`text-5xl md:text-6xl lg:text-7xl font-black text-[#01553d] ${
            isInView ? "animate-title-reveal" : ""
          }`}
        >
          JOIN OUR TEAM
        </h2>
        <div
          className={`h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mx-auto mt-4 ${
            isInView ? "w-24" : "w-0"
          } transition-all duration-1000`}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-1/2">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search roles or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01553d]"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="text-[#01553d]" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "all" ? "All Departments" : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job listings */}
        {filteredJobs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isListView={viewMode === "list"}
              />
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-gray-500">
            No positions found. Try adjusting your search.
          </p>
        )}

        {/* General application CTA */}
        <div className="mt-20 bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-[#01553d] mb-4">
            Don't See a Role That Fits?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're always looking for passionate and talented individuals.
            Send us a general application and let’s connect.
          </p>
          <button
            onClick={() => setShowGeneralModal(true)}
            className="bg-[#01553d] text-white px-6 py-3 rounded-lg hover:bg-opacity-90"
          >
            Send General Application
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedJob && (
        <ApplicationModal
          jobTitle={selectedJob.title}
          onClose={() => setSelectedJob(null)}
        />
      )}
      {showGeneralModal && (
        <ApplicationModal
          jobTitle={null}
          onClose={() => setShowGeneralModal(false)}
        />
      )}
    </div>
  );
};

export default JobListingsPage;
