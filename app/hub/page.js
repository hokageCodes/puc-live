"use client"
import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function FirmHub() {
  const links = [
    {
      name: 'Blog / News',
      description: 'Stay updated with the latest news and updates.',
      url: 'https://paulusoro.com/news',
    },
    {
      name: 'Leave Request and Approval',
      description: 'Manage leave requests and approvals seamlessly.',
      url: 'https://paulusoro.com/leave/dashboard',
    },
  ];

  return (
    <div className="pt-32 bg-white text-black">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Welcome to <span className="text-green">PUC Hub</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your centralized portal for accessing internal tools, client-facing products, and development resources.
        </p>
      </section>

      {/* Links Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold mb-8">Quick Links</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {links.map((link, index) => (
            <div
              key={index}
              className="bg-gray-100 border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold mb-2">{link.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{link.description}</p>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-green hover:text-green-dark transition-colors"
              >
                Visit <ExternalLink size={16} className="ml-2" />
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}