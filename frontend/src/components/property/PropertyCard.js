import React from "react";
import { Link } from "react-router-dom";

const PropertyCard = ({ property }) => {
  return (
    <Link
      to={`/properties/${property._id}`}
      className="block bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative">
        <img
          src={property.images[0]?.url || "/default-property.jpg"}
          alt={property.title}
          className="w-full h-48 object-cover"
        />

        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-sm font-semibold shadow-sm text-[#E28955] border border-[#E28955]">
          ₹{property.rent}/month
        </div>

        {property.verified && (
          <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs shadow-sm">
            Verified
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">
          {property.title}
        </h3>

        <p className="text-gray-500 text-sm mb-2">
          {property.location?.address}
        </p>

        <div className="flex items-center gap-3 text-[13px] text-gray-500 mb-3">
          <span className="font-medium">{property.type?.toUpperCase()}</span>
          <span className="text-gray-300">•</span>
          <span>{property.location?.city}</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {property.amenities?.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="bg-[#FFF3E5] text-[#E28955] px-2 py-[2px] rounded text-xs border border-[#F3D3B2]"
            >
              {amenity}
            </span>
          ))}

          {property.amenities?.length > 3 && (
            <span className="text-xs text-gray-500">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Rating & CTA */}
        <div className="flex justify-between items-center">
         <div className="flex items-center bg-black rounded-full px-3 py-1 shadow-sm border border-gray-700">
  <span className="text-yellow-400 text-lg leading-tight">★</span>
  <span className="ml-1 text-sm font-semibold text-white">
    {property.rating?.average > 0
      ? `${Number(property.rating.average).toFixed(1)} • ${property.rating.count} reviews`
      : "New Listing"}
  </span>
</div>



          <span className="text-sm font-medium text-[#E28955] hover:text-[#cf6e37] transition">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
