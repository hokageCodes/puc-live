"use client"

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import HeroSection from '../components/sections/HeroSection';

const AboutSection = dynamic(() => import('../components/sections/AboutSection'), { ssr: false });
const ValuesSection = dynamic(() => import('../components/sections/ValueSection'), { ssr: false });
const PracticeAreasSection = dynamic(() => import('../components/sections/OurPracticeAreas'), { ssr: false });
const TeamSection = dynamic(() => import('../components/sections/TeamSection'), { ssr: false });

export default function Home() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading About Section...</div>}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading Values...</div>}>
        <ValuesSection />
      </Suspense>
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading Practice Areas...</div>}>
        <PracticeAreasSection />
      </Suspense>
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading Team...</div>}>
        <TeamSection />
      </Suspense>
    </>
  );
}
