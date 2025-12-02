import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProperties = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/properties', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProperties(res.data);
        } catch (err) {
            toast.error('Failed to fetch properties');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const deleteProperty = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/properties/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Property deleted successfully');
            setProperties(properties.filter(p => p._id !== id));
        } catch (err) {
            toast.error('Failed to delete property');
            console.error(err);
        }
    };

    if (loading) return <div className="text-center py-10">Loading properties...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">All Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <div key={property._id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-48 bg-gray-200 relative">
                            {property.images && property.images.length > 0 ? (
                                <img
                                    src={property.images[0].url || property.images[0]}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                            )}
                            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold shadow">
                                {property.type.toUpperCase()}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-1 truncate">{property.title}</h3>
                            <p className="text-gray-600 text-sm mb-2 truncate">
                                {property.location.city}, {property.location.state}
                            </p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[#d16729] font-bold">₹{property.rent}/mo</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${property.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {property.availability}
                                </span>
                            </div>
                            <div className="border-t pt-3 flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    Owner: {property.owner?.name || 'Unknown'}
                                </div>
                                <button
                                    onClick={() => deleteProperty(property._id)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {properties.length === 0 && (
                <p className="text-center text-gray-500 mt-10">No properties found.</p>
            )}
        </div>
    );
};

export default AdminProperties;
