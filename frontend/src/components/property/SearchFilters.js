import React, { useState } from 'react';

const SearchFilters = ({ onSearch }) => {
  const [localFilters, setLocalFilters] = useState({
    city: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    amenities: []
  });

  const amenitiesList = ['WiFi', 'AC', 'Food', 'Laundry', 'Parking', 'Security', 'Gym', 'Pool'];

  const handleInputChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: field === 'minPrice' || field === 'maxPrice' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setLocalFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSearchClick = () => {
    onSearch(localFilters);
  };

  const clearFilters = () => {
    setLocalFilters({
      city: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      amenities: []
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold">Filters</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        <input
          type="text"
          value={localFilters.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          placeholder="Enter city"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
        <select
          value={localFilters.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          <option value="pg">PG</option>
          <option value="flat">Flat</option>
          <option value="room">Room</option>
          <option value="hostel">Hostel</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
          <input
            type="number"
            value={localFilters.minPrice}
            onChange={(e) => handleInputChange('minPrice', e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
          <input
            type="number"
            value={localFilters.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {amenitiesList.map((amenity) => (
            <label key={amenity} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localFilters.amenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleSearchClick}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Search
        </button>
        <button
          onClick={clearFilters}
          className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
