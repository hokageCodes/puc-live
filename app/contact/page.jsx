/* eslint-disable react/prop-types */
"use client"
import { useState } from "react";
import ContactModal from "../../components/ContactModal";
import Locations from "../../components/OurLocations";

const ContactPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <main className="text-white">
      {/* Hero Banner Section */}
      <section
        className="relative h-[40vh] md:h-[50vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('/assets/img/Contact1.jpg')",
        }}
      >
      </section>

      <TextSection>
        <div className="mt-40">
          <Locations />
        </div>
      </TextSection>

      <ParallaxSection imageUrl="/assets/img/Contact2.jpg" />

      <TextSection>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-center text-gray-800 mb-4">
            Enquiries about recruitment?
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            We are here to help. Learn more about our recruitment process and find the right career opportunity for you.
          </p>
          <a
            href="/careers"
            className="px-6 py-3 bg-[#01553d] text-white transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#01553d] rounded"
            aria-label="Explore Careers"
          >
            Explore Careers
          </a>
        </div>
      </TextSection>

      <ParallaxSection imageUrl="/assets/img/contact3.jpg" />

      <TextSection>
        <div className="flex flex-col items-center text-center -mb-24 bg-white">
          <h2 className="text-5xl md:text-7xl font-bold text-center text-gray-800 mb-4">
            For further enquiries, send us a message
          </h2>
          <p className="text-gray-600 mb-6">
            We are always available to assist you with any questions. Reach out and we will get back to you shortly.
          </p>
          <button
            onClick={openModal}
            className="px-6 py-3 bg-[#01553d] text-white transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-[#01553d] rounded"
            aria-label="Contact Us"
          >
            Contact Us
          </button>
        </div>
      </TextSection>

      {isModalOpen && <ContactModal closeModal={closeModal} />}
    </main>
  );
};

const ParallaxSection = ({ title, imageUrl }) => (
  <section
    className="bg-cover bg-center bg-fixed h-[50vh] md:h-[35vh] lg:h-[70vh] flex justify-center items-center"
    style={{ backgroundImage: `url(${imageUrl})` }}
  >
    {title && <h2 className="text-4xl font-bold text-white">{title}</h2>}
  </section>  
);

const TextSection = ({ children }) => (
  <section className="px-4 py-12 bg-white text-black text-lg">
    {children}
  </section>
);

export default ContactPage;