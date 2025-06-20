"use client"
import Image from "next/image"

const practiceAreas = [
  {
    title: "Adr & Advocacy",
    description:
      "We provide comprehensive corporate law services, ensuring your business operates within legal boundaries while maximizing growth opportunities.",
    image: "/assets/img/adr.jpg",
  },
  {
    title: "Transportation Law",
    description:
      "Our real estate experts handle all matters related to property transactions, disputes, and regulatory compliance with unmatched precision.",
    image: "/assets/img/road.jpg",
  },
  {
    title: "Banking and Finance",
    description:
      "Navigating employer-employee relations can be complex. Our practice in employment law provides guidance in maintaining compliance and resolving disputes.",
    image: "/assets/img/banking.jpg",
  },
  {
    title: "Capital Market",
    description:
      "Protecting your intellectual property is crucial in today’s market. Our lawyers help safeguard your creations, innovations, and trademarks.",
    image: "/assets/img/capital.jpg",
  },
  {
    title: "Communications Law",
    description:
      "When conflicts arise, our experienced litigators are ready to represent your interests and seek favorable outcomes.",
    image: "/assets/img/comms.jpg",
  },
  {
    title: "Energy and Environmental Law",
    description:
      "Our tax law experts help individuals and businesses navigate the complexities of tax regulations while minimizing liabilities.",
    image: "/assets/img/energy.jpg",
  },
];

const PracticeAreasSection = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background animated grid */}
      <div className="absolute inset-0 opacity-[0.015] z-0 pointer-events-none">
        <div className="grid grid-cols-12 gap-2 h-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="border border-[#01553d] animate-pulse"
              style={{ animationDelay: `${i * 0.12}s`, animationDuration: '5s' }}
            ></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#01553d] mb-4 relative">
              OUR PRACTICE AREAS
              <div className="absolute top-0 left-0 text-[#01553d]/20 -translate-x-1 -translate-y-1 -z-10">
              OUR PRACTICE AREAS
              </div>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mx-auto mt-4"></div>
          </div>
          <p className="text-xl text-gray-600 mt-8 max-w-2xl mx-auto leading-relaxed">
            Pioneering legal excellence through innovation, integrity, and unwavering commitment to justice.
          </p>
        </div>

        {/* Practice Areas Grid */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {practiceAreas.map((area, index) => (
            <div
              key={index}
              className="group rounded-3xl overflow-hidden border-2 border-[#01553d]/10 bg-white shadow-md hover:shadow-xl hover:border-[#01553d]/30 transition-all duration-500"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={area.image}
                  alt={area.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-[#01553d]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="p-6 relative">
                <h3 className="text-2xl font-bold text-[#01553d] mb-3">{area.title}</h3>
                <div className="w-16 h-1 bg-[#01553d]/50 mb-4" />
                <p className="text-gray-700 leading-relaxed text-base">{area.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* CTA Button */}
      <div className="mt-16 text-center">
        <a
          href="/practice-areas"
          className="inline-block px-8 py-4 text-base font-medium text-white bg-[#01553d] rounded-full hover:bg-[#014634] transition"
        >
          See All Practice Areas
        </a>
      </div>
        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#01553d] to-transparent"></div>
    </section>
  );
};

export default PracticeAreasSection;
