import React from "react";
import { Link } from "react-router-dom";

const PropertyCard = ({ property }) => {
  return (
    <Link
      to={`/properties/${property._id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative">
        <img
          src={property.images[0]?.url || "/default-property.jpg"}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold">
          ₹{property.rent}/month
        </div>
        {property.verified && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
            Verified
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{property.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{property.location?.address}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span>{property.type?.toUpperCase()}</span>
          <span>•</span>
          <span>{property.location?.city}</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-4">
          {property.amenities?.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600"
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

        {/* Rating */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="ml-1 text-sm text-gray-600">
              {property.rating?.average || "New"}
            </span>
          </div>
          <span className="text-indigo-600 text-sm font-medium">View Details →</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
