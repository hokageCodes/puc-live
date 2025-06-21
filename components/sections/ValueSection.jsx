"use client"
import { useState } from 'react'

const ValuesSection = () => {
  const [activeValue, setActiveValue] = useState(0)

  const values = [
    {
      title: "TEAMWORK",
      description:
        "Fostering collaboration, mutual respect, and shared success within our dynamic and innovative law firm.",
    },
    {
      title: "INTEGRITY",
      description:
        "Integrity is fundamental. It guides our ethical conduct, actions, and commitment to transparency within our law firm.",
    },
    {
      title: "MASTERY",
      description:
        "Mastery is paramount, driving our pursuit of excellence, continuous learning, and expertise in delivering exceptional legal services and counsel.",
    },
    {
      title: "EXCELLENCE",
      description:
        "Excellence defines us, inspiring our relentless pursuit of quality, innovation, and client satisfaction in every aspect of our practice.",
    },
    {
      title: "ENTREPRENEURIAL ORIENTATION",
      description:
        "By embracing entrepreneurial spirit, we foster a culture of innovation, risk-taking, and initiative, empowering our team to pioneer new solutions and drive transformative change in the legal industry.",
    },
  ]

  return (
    <section className="relative bg-white py-24 overflow-hidden">
      {/* Light futuristic background grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute w-full h-full grid grid-cols-12 opacity-5 gap-1">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="border border-[#01553d]/10"
            ></div>
          ))}
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/70 to-white"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative flex flex-col items-center text-center">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#01553d] mb-4 relative">
                OUR VALUES
                <div className="absolute top-0 left-0 text-[#01553d]/20 -translate-x-1 -translate-y-1 -z-10">
                OUR VALUES
                </div>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mt-4" />
            </div>


        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-10 mt-12">
          {values.map((value, index) => (
            <div
              key={index}
              className={`relative rounded-3xl border-2 p-8 cursor-pointer transition duration-500 ${
                activeValue === index
                  ? 'bg-[#01553d] text-white shadow-xl'
                  : 'bg-white text-[#01553d] hover:bg-[#01553d]/10'
              }`}
              onMouseEnter={() => setActiveValue(index)}
            >
              {/* Value number */}
              <div className={`absolute top-4 right-4 w-10 h-10 text-sm font-bold flex items-center justify-center rounded-full border ${
                activeValue === index
                  ? 'bg-white text-[#01553d]'
                  : 'bg-[#01553d] text-white'
              }`}>
                {String(index + 1).padStart(2, '0')}
              </div>

              <h3 className="text-2xl md:text-3xl font-bold mb-4">{value.title}</h3>
              <p className="text-base md:text-lg font-light leading-relaxed">
                {value.description}
              </p>

              {/* Tech corners */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-current opacity-10"></div>
              <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-current opacity-10"></div>
            </div>
          ))}
        </div>
      </div>
            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#01553d] to-transparent"></div>
    </section>
  )
}

export default ValuesSection
