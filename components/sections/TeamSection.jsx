"use client"
import Image from "next/image"

const teamMembers = [
  {
    name: "Paul Usoro, SAN",
    role: "Managing Partner",
    image: "/assets/img/PP.jpg",
  },
  {
    name: "Munirudeen Liadi",
    role: "Head of Corporate Law",
    image: "/assets/img/Alj.jpg",
  },
  {
    name: "Obafolahan",
    role: "Senior Litigation Counsel",
    image: "/assets/img/kabi.jpg",
  },
  {
    name: "Barr (Mrs). Mfon Usoro",
    role: "Energy & Environmental Specialist",
    image: "/assets/img/MP.jpg",
  },
  {
    name: "Chinedu Anyaso",
    role: "Capital Markets Consultant",
    image: "/assets/img/chi.jpg",
  },
]

const TeamSection = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[#01553d] relative inline-block">
            OUR TEAM
            <div className="absolute top-0 left-1 -translate-x-1 -translate-y-1 text-[#01553d]/20 -z-10">
              OUR TEAM
            </div>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mx-auto mt-4" />
          <p className="text-gray-700 max-w-2xl mx-auto mt-6 text-lg">
            Meet the dedicated professionals behind our firm — a team of seasoned lawyers committed to delivering
            exceptional results, trusted counsel, and innovative solutions.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group text-center p-4 rounded-2xl border border-[#01553d]/10 bg-white hover:shadow-lg transition duration-300"
            >
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={128}
                  height={128}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold text-[#01553d]">{member.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TeamSection
