import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PropertyCard from '../../components/property/PropertyCard';
import SearchFilters from '../../components/property/SearchFilters';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch properties — accepts optional filters
  const fetchProperties = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value) && value.length > 0) {
            params.append(key, value.join(','));
          } else if (!Array.isArray(value)) {
            params.append(key, value);
          }
        }
      });

      const response = await axios.get(`/api/properties?${params}`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all properties initially
  useEffect(() => {
    fetchProperties(); // no filters => show all
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Space</h1>
          <Link
            to="/add-property"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            List Property
          </Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters onSearch={fetchProperties} />
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
                <p className="text-gray-400">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
