'use client';
import Image from 'next/image';

export default function PracticeAreaCard({ title, description, image }) {
  return (
    <div className="group rounded-3xl overflow-hidden border-2 border-[#01553d]/10 bg-white shadow-md hover:shadow-xl hover:border-[#01553d]/30 transition-all duration-500">
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-[#01553d]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-6 relative">
        <h3 className="text-2xl font-bold text-[#01553d] mb-3">{title}</h3>
        <div className="w-16 h-1 bg-[#01553d]/50 mb-4" />
        <p className="text-gray-700 leading-relaxed text-base">{description}</p>
      </div>
    </div>
  );
}
