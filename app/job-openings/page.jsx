"use client"
import React, { useState, useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import ApplicationModal from '@/components/ApplicationModal';
import { Search, Filter, Grid, List, MapPin, DollarSign, Clock, ChevronRight } from 'lucide-react';

const JobListingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedJob, setSelectedJob] = useState(null); // For job apply
const [showGeneralModal, setShowGeneralModal] = useState(false);
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true, amount: 0.3 });

  const jobs = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Remote/Hybrid',
      salary: '$120k - $180k',
      experience: '5+ years',
      description: 'Lead the development of scalable web applications using modern technologies. Work with a dynamic team to build innovative solutions that impact millions of users worldwide.',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL']
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      department: 'Design',
      type: 'Full-time',
      location: 'New York, NY',
      salary: '$90k - $130k',
      experience: '3+ years',
      description: 'Create beautiful, intuitive user experiences that delight customers. Responsible for the entire design process from research to final implementation.',
      skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems']
    },
    {
      id: 3,
      title: 'Business Development Manager',
      department: 'Business',
      type: 'Full-time',
      location: 'San Francisco, CA',
      salary: '$110k - $150k + Commission',
      experience: '4+ years',
      description: 'Drive strategic partnerships and revenue growth. Identify new business opportunities and build relationships with key stakeholders.',
      skills: ['Strategic Planning', 'Negotiation', 'CRM', 'Market Analysis', 'Partnership Development']
    },
    {
      id: 4,
      title: 'Digital Marketing Specialist',
      department: 'Marketing',
      type: 'Full-time',
      location: 'Remote',
      salary: '$70k - $95k',
      experience: '2+ years',
      description: 'Execute comprehensive digital marketing campaigns across multiple channels. Analyze performance metrics and optimize strategies.',
      skills: ['Google Ads', 'Social Media', 'Analytics', 'Content Marketing', 'SEO/SEM']
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Austin, TX',
      salary: '$130k - $170k',
      experience: '4+ years',
      description: 'Build and maintain cloud infrastructure and deployment pipelines. Ensure systems are scalable, secure, and highly available.',
      skills: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Monitoring']
    },
    {
      id: 6,
      title: 'Product Manager',
      department: 'Business',
      type: 'Full-time',
      location: 'Seattle, WA',
      salary: '$140k - $190k',
      experience: '5+ years',
      description: 'Lead product strategy and roadmap development. Work cross-functionally to deliver products that solve real customer problems.',
      skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'Roadmapping']
    }
  ];

  const departments = ['all', 'Engineering', 'Design', 'Business', 'Marketing'];

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [searchTerm, selectedDepartment]);

  const JobCard = ({ job, isListView }) => (
    <div className={`bg-white hover:border-[#01553d] transition-all duration-300 hover:shadow-lg ${
      isListView ? 'rounded-lg p-4 sm:p-6' : 'rounded-xl p-6 sm:p-8'
    } group cursor-pointer transform hover:-translate-y-1`}>
      <div className={`${isListView ? 'flex flex-col sm:flex-row sm:items-center sm:justify-between' : ''}`}>
        <div className={`${isListView ? 'flex-1' : ''}`}>
          <div className={`${isListView ? 'flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3' : 'mb-4'}`}>
            <div className={`${isListView ? 'flex-1 sm:mr-6' : ''}`}>
              <h3 className="text-lg sm:text-xl font-bold text-[#01553d] mb-2 group-hover:text-opacity-80 transition-colors">
                {job.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                <span className="px-2 sm:px-3 py-1 bg-[#01553d] bg-opacity-10 text-[#01553d] rounded-full font-medium">
                  {job.department}
                </span>
                <span className="border border-gray-300 px-2 sm:px-3 py-1 rounded-full">
                  {job.type}
                </span>
              </div>
            </div>
            {!isListView && (
              <ChevronRight className="w-5 h-5 text-[#01553d] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
            )}
          </div>

          <div className={`grid ${isListView ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'} gap-2 sm:gap-3 mb-4 text-xs sm:text-sm text-gray-600`}>
            <div className="flex items-center">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#01553d] flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#01553d] flex-shrink-0" />
              <span className="truncate">{job.salary}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#01553d] flex-shrink-0" />
              <span className="truncate">{job.experience}</span>
            </div>
          </div>

          {!isListView && (
            <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
              {job.description}
            </p>
          )}

          <div className={`flex flex-wrap gap-1 sm:gap-2 ${isListView ? 'mb-4 sm:mb-0' : 'mb-6'}`}>
            {job.skills.slice(0, isListView ? 3 : 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 sm:px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border hover:bg-[#01553d] hover:text-white transition-colors"
              >
                {skill}
              </span>
            ))}
            {isListView && job.skills.length > 3 && (
              <span className="px-2 sm:px-3 py-1 text-xs text-gray-500 rounded-full">
                +{job.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {isListView && (
          <div className="flex items-center justify-between sm:justify-end mt-4 sm:mt-0">
            <button
            onClick={() => setSelectedJob(job)}
            className="bg-[#01553d] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm sm:text-base"
            >
            Apply Now
            </button>

            <ChevronRight className="w-5 h-5 text-[#01553d] ml-2 sm:ml-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      {!isListView && (
        <button className="w-full bg-[#01553d] text-white py-2 sm:py-3 rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm sm:text-base">
          Apply Now
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
            {/* Heading */}
            <div className="w-full text-center mb-16 mt-32" ref={headerRef}>
        <h2
          className={`relative text-5xl md:text-6xl lg:text-7xl font-black text-[#01553d] transition-all duration-1000 ease-out ${
            isInView ? 'animate-title-reveal' : ''
          }`}
        >
          <span className="relative z-10">JOIN OUR TEAM</span>
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[#01553d]/20 pointer-events-none z-0 text-[12vw] md:text-[5vw] whitespace-nowrap">
          JOIN OUR TEAM
          </span>
        </h2>
        <div
          className={`h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mx-auto mt-4 transition-all duration-1000 ease-out ${
            isInView ? 'w-24' : 'w-0'
          }`}
        />
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6 sm:mb-8">
          <div className="space-y-4">
            {/* Search - Full width on mobile */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search positions, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01553d] focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filters and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              {/* Department Filter */}
              <div className="flex items-center space-x-3 flex-1 sm:flex-none">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-[#01553d] flex-shrink-0" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="flex-1 sm:flex-none sm:min-w-[180px] px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01553d] focus:border-transparent bg-white text-sm sm:text-base"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center justify-center sm:justify-end">
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-all duration-200 ${viewMode === 'grid' 
                      ? 'bg-[#01553d] text-white shadow-sm' 
                      : 'text-gray-600 hover:text-[#01553d] hover:bg-white'
                    }`}
                  >
                    <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-all duration-200 ${viewMode === 'list' 
                      ? 'bg-[#01553d] text-white shadow-sm' 
                      : 'text-gray-600 hover:text-[#01553d] hover:bg-white'
                    }`}
                  >
                    <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Showing {filteredJobs.length} position{filteredJobs.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedDepartment !== 'all' && ` in ${selectedDepartment}`}
          </p>
        </div>

        {/* Jobs Grid/List */}
        {filteredJobs.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
              : 'space-y-3 sm:space-y-4'
          }>
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} isListView={viewMode === 'list'} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No positions found</h3>
            <p className="text-sm sm:text-base text-gray-500 px-4">Try adjusting your search criteria or browse all positions.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 bg-white rounded-xl p-6 sm:p-12 text-center border border-gray-200 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#01553d] mb-4 sm:mb-6">
            Don't See Your Perfect Role?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            We're always looking for exceptional talent. Send us your resume and tell us 
            how you'd like to contribute to our mission.
          </p>
          <button className="bg-[#01553d] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-opacity-90 transition-colors font-medium text-base sm:text-lg">
            Send General Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobListingsPage;