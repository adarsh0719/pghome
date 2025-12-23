import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BrokerListingSection = ({ user }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [listing, setListing] = useState({
        propertyId: "",
        price: "",
        description: "",
        facilities: "",
        images: [],
        isActive: true,
        packages: []
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [keptImages, setKeptImages] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [availableRooms, setAvailableRooms] = useState(0);

    useEffect(() => {
        // Fetch all properties to populate dropdown
        const fetchProperties = async () => {
            try {
                const { data } = await axios.get("/api/properties");
                setProperties(data.properties || data);
            } catch (err) {
                console.error("Failed to fetch properties");
            }
        };

        // Fetch existing broker listing
        const fetchListing = async () => {
            if (!user) return;
            try {
                const { data } = await axios.get("/api/users/broker-listing", {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (data && data._id) {
                    setListing({
                        propertyId: data.property?._id || data.property,
                        price: data.price,
                        description: data.description,
                        facilities: data.facilities ? (Array.isArray(data.facilities) ? data.facilities.join(',') : data.facilities) : "",
                        images: [], // We don't use this for display directly anymore, we use keptImages
                        isActive: data.isActive,
                        packages: data.packages && Array.isArray(data.packages) ? data.packages.map(p => ({
                            ...p,
                            amenities: Array.isArray(p.amenities) ? p.amenities.join(', ') : p.amenities
                        })) : []
                    });
                    setKeptImages(data.images || []);
                }
            } catch (err) {
                console.error("Failed to fetch listing");
            }
        };



        // Fetch user profile for available rooms
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data } = await axios.get("/api/roommate/profile", {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setAvailableRooms(data.availableRooms || 0);
            } catch (err) {
                console.error("Failed to fetch profile");
            }
        };

        fetchProperties();
        fetchListing();
        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setListing({ ...listing, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles([...imageFiles, ...files]); // Append new files
    };

    const removeNewImage = (index) => {
        const newFiles = [...imageFiles];
        newFiles.splice(index, 1);
        setImageFiles(newFiles);
    };

    const removeKeptImage = (index) => {
        const newKept = [...keptImages];
        newKept.splice(index, 1);
        setKeptImages(newKept);
    };

    // --- Package Handlers ---
    const handleAddPackage = () => {
        setListing(prev => ({
            ...prev,
            packages: [...prev.packages, { name: '', price: '', amenities: '' }]
        }));
    };

    const handleRemovePackage = (index) => {
        setListing(prev => ({
            ...prev,
            packages: prev.packages.filter((_, i) => i !== index)
        }));
    };

    const handlePackageChange = (index, field, value) => {
        setListing(prev => {
            const newPackages = [...prev.packages];
            newPackages[index] = { ...newPackages[index], [field]: value };
            return { ...prev, packages: newPackages };
        });
    };

    const handleDeleteListing = async () => {
        if (!window.confirm("Are you sure you want to delete your broker listing? This cannot be undone.")) return;
        setLoading(true);
        try {
            await axios.delete("/api/users/broker-listing", {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success("Listing deleted successfully");
            setListing({
                propertyId: "",
                price: "",
                description: "",
                facilities: "",
                images: [],
                isActive: true,
                packages: []
            });
            setKeptImages([]);
            setImageFiles([]);
            setShowForm(false);
        } catch (err) {
            toast.error("Failed to delete listing");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("propertyId", listing.propertyId);
            formData.append("price", listing.price);
            formData.append("description", listing.description);
            formData.append("facilities", listing.facilities);
            formData.append("isActive", listing.isActive);

            // Process and append packages
            const refinedPackages = listing.packages.map(pkg => ({
                ...pkg,
                price: Number(pkg.price),
                amenities: typeof pkg.amenities === 'string'
                    ? pkg.amenities.split(',').map(a => a.trim()).filter(a => a)
                    : pkg.amenities
            })).filter(pkg => pkg.name && pkg.price);

            formData.append("packages", JSON.stringify(refinedPackages));

            formData.append("keptImages", JSON.stringify(keptImages));

            imageFiles.forEach((file) => {
                formData.append("images", file);
            });

            const { data } = await axios.put("/api/users/broker-listing", formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "multipart/form-data",
                },

            });

            // Update available rooms
            await axios.put("/api/roommate/available-rooms",
                { availableRooms: availableRooms },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            toast.success("Broker listing updated successfully!");
            // Update state with new data
            if (data.images) {
                setKeptImages(data.images);
                setImageFiles([]);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update listing");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Manage Your Broker Listing</h3>
                {showForm && (
                    <button
                        onClick={() => setShowForm(false)}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1 transition"
                    >
                        Show Less
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                )}
                {keptImages.length > 0 && (
                    <button
                        onClick={handleDeleteListing}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold border border-red-200 hover:bg-red-50 px-3 py-1 rounded-lg transition"
                    >
                        Delete Listing
                    </button>
                )}
            </div>
            <p className="text-sm text-gray-500 mb-6">
                List a property with your own pricing and details. You earn the difference as rewards!
            </p>

            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full md:w-auto px-10 bg-[#d16729] hover:bg-[#b54015] text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:scale-[1.05] flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    {keptImages.length > 0 ? "Manage Your Listing" : "Create Broker Listing"}
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                    {/* Property Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Property</label>
                        <select
                            name="propertyId"
                            value={listing.propertyId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#d16729] focus:border-transparent"
                            required
                        >
                            <option value="">-- Choose a Property --</option>
                            {Array.isArray(properties) && properties.map((prop) => (
                                <option key={prop._id} value={prop._id}>
                                    {prop.title} (Owner Price: ₹{prop.rent})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={listing.price}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#d16729] focus:border-transparent"
                                placeholder="e.g. 4000"
                                required
                            />
                        </div>
                        <div className="flex items-center pt-8">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={listing.isActive}
                                    onChange={(e) => setListing({ ...listing, isActive: e.target.checked })}
                                    className="w-5 h-5 text-[#d16729] rounded focus:ring-[#d16729]"
                                />
                                <span className="text-gray-700 font-medium">Listing Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={listing.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#d16729] focus:border-transparent"
                            placeholder="Describe the property/room..."
                        ></textarea>
                    </div>

                    {/* Packages Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Packages <span className="text-gray-400 text-sm font-normal">(Optional)</span></h3>
                        <p className="text-gray-500 text-xs mb-4">
                            Define different packages (e.g., Basic, Premium) with specific prices and amenities.
                        </p>

                        <div className="space-y-4 mb-4">
                            {listing.packages.map((pkg, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white relative shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePackage(index)}
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center transition"
                                    >
                                        ×
                                    </button>
                                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Package Name</label>
                                            <input
                                                type="text"
                                                value={pkg.name}
                                                onChange={(e) => handlePackageChange(index, 'name', e.target.value)}
                                                placeholder="e.g. Premium Single"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#d16729] outline-none text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Price (₹/mo)</label>
                                            <input
                                                type="number"
                                                value={pkg.price}
                                                onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                                                placeholder="e.g. 8000"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#d16729] outline-none text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Amenities (comma separated)</label>
                                        <input
                                            type="text"
                                            value={pkg.amenities}
                                            onChange={(e) => handlePackageChange(index, 'amenities', e.target.value)}
                                            placeholder="e.g. AC, WiFi, TV"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#d16729] outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddPackage}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#d16729] hover:text-[#d16729] transition font-medium text-sm"
                        >
                            + Add Package
                        </button>
                    </div>

                    {/* Facilities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facilities <span className="text-gray-400 text-xs">(comma separated)</span></label>
                        <input
                            type="text"
                            name="facilities"
                            value={listing.facilities}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#d16729] focus:border-transparent"
                            placeholder="WiFi, AC, Food..."
                        />
                    </div>

                    {/* Available Rooms */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Rooms <span className="text-gray-400 text-xs">(for Roommate Finder)</span></label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            value={availableRooms}
                            onChange={(e) => setAvailableRooms(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#d16729] focus:border-transparent"
                            placeholder="0"
                        />
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photos</label>
                        <input
                            type="file"
                            multiple
                            onChange={handleImageChange}
                            accept="image/*"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#d16729] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#d16729]/10 file:text-[#d16729] hover:file:bg-[#d16729]/20"
                        />

                        {/* Kept Images Preview */}
                        {keptImages.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs text-gray-500 mb-2">Existing Images:</p>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {keptImages.map((img, i) => (
                                        <div key={i} className="relative w-20 h-20 flex-shrink-0 group">
                                            <img src={img} alt={`kept-${i}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                            <button
                                                type="button"
                                                onClick={() => removeKeptImage(i)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Images Preview */}
                        {imageFiles.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs text-green-600 mb-2">New Uploads:</p>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {Array.from(imageFiles).map((file, i) => (
                                        <div key={i} className="relative w-20 h-20 flex-shrink-0 group">
                                            <img src={URL.createObjectURL(file)} alt={`new-${i}`} className="w-full h-full object-cover rounded-lg border border-green-200 ring-2 ring-green-100" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(i)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-lg disabled:opacity-50"
                    >
                        {loading ? "Saving..." : (keptImages.length > 0 ? "Update Broker Listing" : "Create Broker Listing")}
                    </button>
                </form>
            )}
        </div>
    );
};

export default BrokerListingSection;
