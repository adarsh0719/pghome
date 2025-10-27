import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AddProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pg',
    rent: '',
    securityDeposit: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    amenities: [],
    rules: [],
    liveViewAvailable: false,
    videoUrl: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const amenitiesList = ['WiFi', 'AC', 'Food', 'Laundry', 'Parking', 'Security', 'Gym', 'Pool', 'TV', 'Refrigerator'];
  const rulesList = ['No Smoking', 'No Pets', 'No Parties', 'No Guests', 'No Alcohol', 'Curfew Time'];

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and size
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    // Create previews
    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleRuleChange = (rule) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.includes(rule)
        ? prev.rules.filter(r => r !== rule)
        : [...prev.rules, rule]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      const submitData = new FormData();
      
      // Append form data
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('type', formData.type);
      submitData.append('rent', formData.rent);
      submitData.append('securityDeposit', formData.securityDeposit || '0');
      submitData.append('location[address]', formData.location.address);
      submitData.append('location[city]', formData.location.city);
      submitData.append('location[state]', formData.location.state);
      submitData.append('location[pincode]', formData.location.pincode);
      submitData.append('location[landmark]', formData.location.landmark);
      submitData.append('amenities', JSON.stringify(formData.amenities));
      submitData.append('rules', JSON.stringify(formData.rules));
      submitData.append('liveViewAvailable', formData.liveViewAvailable);
      submitData.append('videoUrl', formData.videoUrl);

      // Append images
      images.forEach(image => {
        submitData.append('images', image);
      });
      console.log('User token before sending:', user?.token);

      const response = await axios.post('/api/properties', submitData, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });
      console.log('Sending token:', user?.token);


      toast.success('Property listed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'Error listing property. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (user?.userType !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only property owners can list properties.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">List Your Property</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., Spacious PG for Students near College"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="pg">PG</option>
                  <option value="flat">Flat</option>
                  <option value="room">Room</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Describe your property in detail..."
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Property Images</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-md border border-gray-300 inline-block mb-4"
                >
                  Choose Images
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload up to 10 images (max 5MB each)
                </p>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Video URL Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Video Tour</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL (YouTube, Vimeo, etc.)
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="https://youtube.com/embed/..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Paste the embed URL of your property video tour
                  </p>
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="liveViewAvailable"
                    checked={formData.liveViewAvailable}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Live Video View Available</span>
                </label>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent (₹) *
                </label>
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., 8000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., 10000"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Full address with street details"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  name="location.landmark"
                  value={formData.location.landmark}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nearby landmark"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenitiesList.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div>
              <h3 className="text-lg font-semibold mb-4">House Rules</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {rulesList.map((rule) => (
                  <label key={rule} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.rules.includes(rule)}
                      onChange={() => handleRuleChange(rule)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{rule}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Listing Property...' : 'List Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;