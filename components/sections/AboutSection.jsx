import Image from 'next/image'
import { Briefcase, Gavel, Smile } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="text-center min-h-screen bg-white relative overflow-hidden">
      {/* Geometric Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Large geometric shapes */}
        <div className="absolute top-20 -right-32 w-64 h-64 border-2 border-[#01553d]/10 rotate-45 rounded-3xl"></div>
        <div className="absolute bottom-20 -left-32 w-80 h-80 bg-[#01553d]/5 rotate-12 rounded-full blur-sm"></div>
        <div className="absolute top-1/2 right-20 w-32 h-32 border border-[#01553d]/20 rotate-[30deg] rounded-lg"></div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#01553d]/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-[#01553d]/40 rounded-full animate-bounce"></div>
        <div
          className="absolute top-1/3 right-1/4 w-3 h-3 border border-[#01553d]/20 rounded-full animate-spin"
          style={{ animationDuration: '8s' }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#01553d] mb-4 relative">
              ABOUT US
              <div className="absolute top-0 left-0 text-[#01553d]/20 -translate-x-1 -translate-y-1 -z-10">
                ABOUT US
              </div>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#01553d] to-[#01553d]/50 mx-auto mt-4"></div>
          </div>
          <p className="text-xl text-gray-600 mt-8 max-w-2xl mx-auto leading-relaxed">
            Pioneering legal excellence through innovation, integrity, and unwavering commitment to justice.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center -mt-10">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="relative">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                At Paul Usoro & Co, we merge traditional legal expertise with cutting-edge approaches to deliver unparalleled service. Our forward-thinking methodology ensures that every client receives innovative solutions tailored to the complexities of modern legal challenges.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                With decades of combined experience and a reputation built on excellence, we stand at the forefront of legal practice, consistently pushing boundaries and setting new standards in the industry.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
  {/* Years Experience */}
  <div className="text-center p-4 bg-[#01553d]/5 rounded-2xl border border-[#01553d]/10 hover:bg-[#01553d]/10 transition-colors duration-300">
    <div className="text-3xl font-black text-[#01553d] mb-2">35+</div>
    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide sm:block hidden">
      Years Experience
    </div>
    <div className="text-[10px] font-semibold uppercase tracking-wide text-[#01553d] block sm:hidden">
      Years of Experience
    </div>
  </div>

  {/* Cases Won */}
  <div className="text-center p-4 bg-[#01553d]/5 rounded-2xl border border-[#01553d]/10 hover:bg-[#01553d]/10 transition-colors duration-300">
    <div className="text-3xl font-black text-[#01553d] mb-2">500+</div>
    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide sm:block hidden">
      Cases Won
    </div>
    <div className="text-[10px] font-semibold uppercase tracking-wide text-[#01553d] block sm:hidden">
      Cases Won
    </div>
  </div>

  {/* Client Satisfaction */}
        <div className="text-center p-4 bg-[#01553d]/5 rounded-2xl border border-[#01553d]/10 hover:bg-[#01553d]/10 transition-colors duration-300">
            <div className="text-3xl font-black text-[#01553d] mb-2">100%</div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wide sm:block hidden">
            Client Satisfaction
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#01553d] block sm:hidden">
            Client Satisfaction
            </div>
        </div>
        </div>

          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative w-full h-[500px] lg:h-[600px] group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#01553d]/20 to-[#01553d]/10 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-[#01553d]/20 group-hover:border-[#01553d]/40 transition-colors duration-300">
                <Image
                  src="/assets/img/who-we-are.jpg"
                  alt="Paul Usoro & Co Law Office"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#01553d]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Floating accent elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 border-2 border-[#01553d] rounded-full animate-pulse"></div>
              <div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-[#01553d] rounded-full animate-bounce"
                style={{ animationDelay: '1s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#01553d] to-transparent"></div>
    </section>
  )
}

export default AboutSection
