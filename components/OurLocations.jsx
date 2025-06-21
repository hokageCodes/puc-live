/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const locations = {
  CA: [
    {
      name: 'Lagos, Nigeria',
      address: 'PUC Tower, Plot 999C, 7th floor, Danmole Street, P O Box 71605, Victoria Island, Lagos, Nigeria.',
      phone: '234 (01) 2714842-5',
      imageUrl: '/assets/img/Lagos.webp',
    },
    {
      name: 'Abuja, Nigeria',
      address: 'Abia House Central Business District, Abuja, Nigeria.',
      phone: '+234 (09) 623 2182',
      imageUrl: '/assets/img/abuja.webp',
    },
    {
      name: 'Uyo, Nigeria',
      address: '1st Floor, Left Wing, APICO House, Abak Road, P. O. Box 2212, Uyo, Akwa Ibom State, Nigeria.',
      phone: '+234 85 203690',
      imageUrl: '/assets/img/uyo.jpg',
    },
  ],
};

const LocationCard = ({ name, address, phone, imageUrl, isLoading }) => (
  <div className="block bg-white rounded-lg shadow-lg overflow-hidden">
    {isLoading ? (
      <Skeleton height={192} width="100%" />
    ) : (
      <img 
        src={imageUrl} 
        alt={`Location at ${name}`} 
        className="object-cover h-72 w-full" 
      />
    )}

    <div className="p-4">
      <h3 className="text-xl sm:text-2xl font-bold mb-2">
        {isLoading ? <Skeleton width={200} /> : name}
      </h3>
      <p className="text-gray-600 text-sm sm:text-base mb-2">
        {isLoading ? <Skeleton width="80%" /> : address}
      </p>
      <p className="text-gray-600 text-sm sm:text-base">
        {isLoading ? <Skeleton width={150} /> : `📞 ${phone}`}
      </p>
    </div>
  </div>
);

const Locations = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data fetching delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // 2 seconds delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="px-2 mt-[-80px] pb-24">
      <h2 className="text-4xl md:text-5xl font-bold text-left md:text-center mb-8 text-[#01553d]">
        Our Locations
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {locations.CA.map((location, index) => (
          <LocationCard key={index} {...location} isLoading={isLoading} />
        ))}
      </div>
    </div>
  );
};

export default Locations;