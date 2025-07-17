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
        <div className="text-[35px] md:text-[36px] lg:text-[44px] xl:text-[60px] leading-[45px] md:leading-[52px] lg:leading-[67px] text-black">
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
              src="/assets/img/firm.webp"
              alt="About Us"
              className="object-cover w-full h-[500px] rounded-lg"
            />
          </React.Suspense>
        </div>

        {/* Vision and Mission Section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  <div className="bg-white shadow-md rounded-xl p-6">
    <h2 className="text-2xl md:text-3xl font-bold text-[#01553d] mb-2">Our Vision</h2>
    <p className="text-lg leading-relaxed text-black">
      Our vision is to be the foremost legal firm in Africa.
    </p>
  </div>

  <div className="bg-white shadow-md rounded-xl p-6">
    <h2 className="text-2xl md:text-3xl font-bold text-[#01553d] mb-2">Our Mission</h2>
    <p className="text-lg leading-relaxed text-black">
      To contribute to societal growth through unparalleled legal services.
    </p>
  </div>
</div>


        {/* Tagline Parallax Section */}
        <div className="relative h-screen overflow-hidden">
          {/* Background Image Layer */}
          <div
            className="absolute inset-0 bg-[url('/assets/img/Contact3.webp')] bg-cover bg-center"
            style={{ backgroundAttachment: 'fixed', zIndex: 1 }}
          ></div>

          {/* Overlay with dark tint (optional) */}
          <div className="absolute inset-0 bg-black/40 z-10"></div>

          {/* Text Content */}
          <div className="relative z-20 flex items-center justify-center h-full px-4">
            <h2 className="text-white text-center text-3xl md:text-5xl lg:text-7xl font-bold max-w-4xl">
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
