'use client';
import Image from 'next/image';

export default function TeamCard({ member }) {
  return (
    <div className="min-w-[250px] max-w-[300px] flex-shrink-0 flex flex-col items-center p-4 border rounded-xl bg-white">
      <div className="w-full aspect-square relative rounded-xl overflow-hidden">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover object-top"
        />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-[#01553d] text-center capitalize">
        {member.name}
      </h2>
      <p className="mt-1 mb-4 text-[#01553d] text-center capitalize">{member.role}</p>
    </div>
  );
}
