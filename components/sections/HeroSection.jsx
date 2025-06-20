'use client'; 

export default function HeroSection() { 
  return ( 
    <section className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
             style={{
               backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4)), url('/assets/img/hero-puc.jpg')`
             }}> 
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Content container */}
      <div className="relative z-10 px-4 mx-auto sm:px-6 lg:px-8 max-w-4xl text-center"> 
        <div className="max-w-4xl mx-auto"> 
          <h1 className="text-5xl leading-[50px] font-normal text-white uppercase sm:text-5xl lg:text-6xl xl:text-9xl drop-shadow-lg">
            PAUL USORO <span className="text-white">& CO</span>
          </h1> 
          <p className="mt-6 text-lg font-normal text-gray-100 sm:text-xl max-w-2xl mx-auto drop-shadow-md">
            A leading full-service law firm, providing top-notch legal services to both local and international clients.
          </p> 
          <div className="mt-8 sm:mt-10"> 
            <a href="/practice-areas" 
               className="inline-flex items-center justify-center px-8 py-4 text-base font-normal text-white transition-all duration-200 rounded-full bg-[#01553d] hover:bg-[#013d2d] shadow-lg hover:shadow-xl transform hover:scale-105" 
               role="button"> 
              Our Practice Areas 
            </a> 
          </div> 
        </div> 
      </div> 
    </section> 
  ); 
}