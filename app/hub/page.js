"use client"
import React, { useState } from 'react';
import { ExternalLink, CalendarCheck2, Loader2 } from 'lucide-react';

export default function FirmHub() {
  const [loadingCard, setLoadingCard] = useState(null);

  const links = [
    {
      name: 'Leave Requests',
      description: 'Submit and track your leave requests easily.',
      url: 'https://paulusoro.com/leave/dashboard',
      cta: 'Manage Leave',
      icon: <CalendarCheck2 className="w-6 h-6" />,
      image: '/assets/leave.jpeg',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Car Requests',
      description: 'Book a company car for official use.',
      url: 'https://paulusoro.com/car-requests',
      cta: 'Request a Car',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13l2-5a2 2 0 0 1 1.9-1.37h10.2A2 2 0 0 1 19 8l2 5M5 13v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4M7 16h10" /></svg>,
      image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'IT Tickets',
      description: 'Report IT issues and track support tickets.',
      url: 'https://paulusoro.com/it-tickets',
      cta: 'Open IT Ticket',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a4 4 0 0 1 8 0v2" /></svg>,
      image: '/assets/ticket.jpeg',
      color: 'from-purple-500 to-pink-600'
    },
    {
      name: 'Resources',
      description: 'Access HR policies, documentation, and more.',
      url: 'https://paulusoro.com/resources',
      cta: 'View Resources',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><rect x="4" y="3" width="16" height="14" rx="2" /></svg>,
      image: '/assets/resources.jpeg',
      color: 'from-amber-500 to-orange-600'
    },
    {
      name: 'Blog / News',
      description: 'Stay updated with the latest news and updates.',
      url: 'https://paulusoro.com/news',
      cta: 'Read News',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>,
      image: '/assets/news.jpeg',
      color: 'from-gray-500 to-gray-700'
    },
  ];

  const handleCardClick = (index, url) => {
    if (url === '#') return;
    setLoadingCard(index);
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
      setLoadingCard(null);
    }, 300);
  };

  return (
    <div className="min-h-screen pt-32 bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">PUC Hub</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your centralized portal for accessing internal tools, client-facing products, and development resources.
        </p>
      </section>

      {/* Links Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-3">
          {links.map((link, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden max-w-md mx-auto w-full transform hover:-translate-y-1 cursor-pointer"
              onClick={() => handleCardClick(index, link.url)}
            >
              {/* Fuller Image, no gradient overlay */}
              <div className="relative w-full h-56 overflow-hidden">
                <img
                  src={link.image}
                  alt={link.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Card content */}
              <div className="p-6 flex flex-col gap-3">
                {/* Icon row */}
                <div className="flex items-center justify-start">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${link.color} text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
                    {link.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mt-2">{link.name}</h3>
                <p className="text-gray-600 text-base flex-1">{link.description}</p>

                {/* CTA Button */}
                <button
                  disabled={link.url === '#' || loadingCard === index}
                  className={`mt-4 w-full px-6 py-3 rounded-xl font-semibold text-base shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
                    link.url === '#'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : `bg-gradient-to-r ${link.color} text-white hover:shadow-xl hover:scale-[1.02] active:scale-95`
                  }`}
                >
                  {loadingCard === index ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      {link.cta}
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}