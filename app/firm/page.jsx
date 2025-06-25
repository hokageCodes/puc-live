/* eslint-disable react/prop-types */
"use client";
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TimelineSection from '../../components/TimelineSection';
import Locations from '../../components/OurLocations';

const AboutUsIntro = () => {
  return (
    <section className="bg-custom-color1 font-satoshi">
      <div className="max-w-7xl px-2 pb-8 pt-[100px] mx-auto text-black lg:pt-[130px]">

        {/* Page Heading */}
        <div className="text-[35px] md:text-[36px] lg:text-[44px] xl:text-[60px] leading-[45px] md:leading-[52px] lg:leading-[67px] font-bold text-black">
          <h1 className="text-primary">About Paul Usoro & Co.</h1>
        </div>

        {/* Introductory Text */}
        <div className="my-6 text-lg leading-8 md:text-xl md:leading-9 lg:leading-10 text-justify">
          <p className="mb-4">
            Paul Usoro & Co. ("PUC") is a leading full-service law firm, providing top-notch legal services to both local and international clients.
          </p>
          <p className="mb-4">
            We hold our clients in high esteem, providing them with sound legal advice and innovative business solutions. Strategically located in Lagos, Abuja, and Uyo, PUC has developed a reputation for solving complex legal and commercial issues across borders.
          </p>
          <p>
            In furtherance of our drive to deliver first-in-class services to our clients, our team of lawyers, well versed in existing and emerging areas of law, current global trends, regulatory and operational frameworks for businesses are ready to be deployed for the attainment of our clients’ goals.
          </p>
        </div>

        {/* Firm Image */}
        <div className="mb-8">
          <React.Suspense fallback={<Skeleton height={500} width="100%" />}>
            <img
              src="/assets/img/firm.jpg"
              alt="About Us"
              className="object-cover w-full h-[500px] rounded-lg"
            />
          </React.Suspense>
        </div>

        {/* Vision and Mission Section */}
        <div className="mt-10 space-y-10 text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#01553d] mb-2">Our Vision</h2>
            <p className="text-lg leading-relaxed text-black">
              Our vision is to be the foremost legal firm in Africa, with international affiliations.
            </p>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#01553d] mb-2">Our Mission</h2>
            <p className="text-lg leading-relaxed text-black">
              We strive to be judged by clients as unparalleled in service delivery, and to provide a conducive environment for the best and brightest minds in pursuit of excellence and career fulfilment.
            </p>
          </div>
        </div>

        {/* Tagline */}
 {/* Tagline Parallax Section */}
<div className="relative h-[300px] overflow-hidden my-16">
  <div
    className="absolute inset-0 bg-[url('/assets/img/law-background.jpg')] bg-cover bg-center transform scale-110"
    style={{ backgroundAttachment: 'fixed' }}
  ></div>
  <div className="relative z-10 flex items-center justify-center h-full bg-primary px-4">
    <h2 className="text-white text-center text-2xl md:text-4xl lg:text-5xl font-bold max-w-3xl">
      A law firm built on trust, expertise, and results.
    </h2>
  </div>
</div>


        {/* Timeline Section */}
        <TimelineSection />
      </div>

      {/* Locations Section */}
      <Locations />
    </section>
  );
};

export default AboutUsIntro;
