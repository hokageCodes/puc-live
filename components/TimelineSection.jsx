"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';

function TimelineSection() {
  return (
    <div className="bg-white py-24">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-left md:text-center mb-12 text-[#01553d]">Our Journey</h2>
        <Swiper
          className='mb-24'
          modules={[Autoplay]}
          spaceBetween={50}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            1024: {
              slidesPerView: 4,
            },
          }}
        >
          {[
            { year: '1990', event: 'PUC was founded in Kaduna, Nigeria, to provide comprehensive legal services, including litigation and transactions.' },
            { year: '1993', event: 'Recognizing Lagos as Nigeria\'s commercial hub, PUC moved its head office to Lagos Island while keeping the Kaduna office as a branch.' },
            { year: '1997', event: 'The head office is strategically located in Victoria Island, serving clients in sectors such as Banking, Oil and Gas, Communications, and Maritime.' },
            { year: '2004', event: 'PUC expanded its network with branch offices in Abuja and Uyo, enhancing its capacity to serve diverse clients across Nigeria.' },
          ].map((item, index) => (
            <SwiperSlide key={index}>
              <div className="text-left md:text-center">
                
                <div className="mb-2">
                  <div className="inline-block border-t-4 border-[#01553d] w-24 mb-2"></div>
                </div>
                <div className="text-2xl font-black mb-2">{item.year}</div>
                <p className="text-gray-900"><b>{item.event}</b></p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Mobile Arrow Indicators */}
        <div className="flex justify-center mt-[-80px] md:hidden">
          <button className="bg-[#01553d] text-white p-2 rounded-l">
            &lt; {/* Left Arrow */}
          </button>
          <button className="bg-[#01553d] text-white p-2 rounded-r">
            &gt; {/* Right Arrow */}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimelineSection;