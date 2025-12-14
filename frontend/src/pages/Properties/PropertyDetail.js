import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LiveVideoTour from '../../components/property/LiveVideoTour'; // make sure the path is correct
import ReviewSection from './ReviewSection';


const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [liveTourActive, setLiveTourActive] = useState(false);
  const [paymentModalActive, setPaymentModalActive] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  useEffect(() => {
    console.log("Fetching property for ID:", id);
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`/api/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactOwner = () => {
    if (!user) {
      toast.info('Please login to contact the owner');
      return;
    }

    if (user?.subscription?.active && new Date(user.subscription.expiresAt) > new Date()) {
      setShowOwnerDetails(true);
    } else {
      toast.warning('You need to subscribe to view owner contact details');
    }
  };





  const handleBooking = async () => {
    if (!user) {
      toast.info('Please login to book a visit');
      return;
    }
    if (user._id === property.owner?._id) {
      toast.info("You are the owner of this property.");
      return;
    }
    navigate('/booking-checkout', { state: { property } });
  };


  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const res = await axios.delete(`/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success(res.data.message || 'Property deleted successfully!');
      navigate('/dashboard'); // Redirect after deletion
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to delete property');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Property Not Found</h2>
          <Link to="/properties" className="text-indigo-600 hover:text-indigo-700">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-32">
      <div className="max-w-6xl mx-auto px-4">

        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="text-gray-400 hover:text-gray-500">Home</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><Link to="/properties" className="text-gray-400 hover:text-gray-500">Properties</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900">{property.title}</span></li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative">
            <div className="h-96 overflow-hidden">
              <img
                src={property.images[activeImage]?.url || '/default-property.jpg'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>

            {property.images.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex space-x-2 overflow-x-auto">
                {property.images.map((imageObj, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${activeImage === index ? 'border-indigo-600' : 'border-gray-300'
                      }`}
                  >
                    <img
                      src={imageObj.url}
                      alt={`${property.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

              </div>
            )}

            <div className="absolute top-4 right-4 flex space-x-2">
              {property.verified && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  Verified
                </span>
              )}
              <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold">
                ₹{property.rent}/month
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <p className="text-gray-600 mb-4">
                  {property.location?.address}, {property.location?.city}
                </p>

                <div className="flex items-center space-x-4 mb-6">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm capitalize">
                    {property.type}
                  </span>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-gray-600">
                      {property.rating?.average || 'New'} ({property.rating?.count || 0} reviews)
                    </span>
                  </div>
                </div>

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700">{property.description}</p>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities?.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Owner Info */}
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Property Owner</h3>
                  {!showOwnerDetails ? (
                    <p className="text-gray-600 italic">
                      Contact details are hidden. Click "Contact Owner" if you’re a subscriber.
                    </p>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {property.owner?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                     <div className="space-y-1">
  <p className="text-sm font-semibold text-gray-900">
    {property.owner?.name}
  </p>

  <p className="text-sm text-gray-500">
    {property.owner?.email}
  </p>

  {property.owner?.phone && (
    <p className="text-sm text-gray-500">
      {property.owner.phone}
    </p>
  )}

  {property.owner?.isBlueTick && (
    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
      Verified Owner
    </span>
  )}
</div>

                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar - Action Panel */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                  <div className="text-center mb-6">
                    <p className="text-2xl font-bold text-gray-900">₹{property.rent}</p>
                    <p className="text-gray-600">per month</p>
                  </div>

                  {/* Vacancy Info */}
                  <div className="mb-6 space-y-2">
                    {property.vacancies ? (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Single Vacancies:</span>
                          <span className={`font-bold ${property.vacancies.single > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {property.vacancies.single > 0 ? `${property.vacancies.single} left` : 'Sold Out'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Double Vacancies:</span>
                          <span className={`font-bold ${property.vacancies.double > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {property.vacancies.double > 0 ? `${property.vacancies.double} left` : 'Sold Out'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 text-center">Vacancy info unavailable</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {user ? (
                      <>
                        <button
                          onClick={handleContactOwner}
                          className="w-full bg-[#c17041] text-white py-3 rounded-lg font-semibold transition"
                        >
                          Contact Owner
                        </button>

                        {property.liveViewAvailable && (
                          <button
                            onClick={() => setLiveTourActive(true)}
                            className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:black transition"
                          >
                            Live Video Tour
                          </button>
                        )}
                        <button className={`w-full border py-3 rounded-lg font-semibold transition
       ${property.vacancies && (property.vacancies.single === 0 && property.vacancies.double === 0)
                            ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                            : 'border-[#c17041] text-[#c17041] hover:bg-white'}`}
                          onClick={handleBooking}
                          disabled={property.vacancies && property.vacancies.single === 0 && property.vacancies.double === 0}
                        >
                          {property.vacancies && property.vacancies.single === 0 && property.vacancies.double === 0
                            ? "Sold Out"
                            : "Book Now!"}
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        className="block w-full bg-[#d16729] text-white py-3 rounded-lg font-semibold hover:bg-black transition text-center"
                      >
                        Login to Contact
                      </Link>
                    )}


                  </div>

                  {/* Quick Info */}
                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Type:</span>
                      <span className="font-semibold capitalize">{property.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`font-semibold ${property.availability === 'available'
                          ? 'text-green-600'
                          : 'text-red-600'
                          }`}
                      >
                        {property.availability?.charAt(0).toUpperCase() +
                          property.availability?.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verified:</span>
                      <span className={property.verified ? 'text-green-600' : 'text-red-600'}>
                        {property.verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            {user && property?.owner?._id === user._id && (
              <div className="flex justify-start mt-4 gap-3">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-2 rounded-lg font-semibold transition"
                >
                  Delete Property
                </button>


                <Link to={`/edit-property/${property._id}`}>
                  <button className="bg-[#d16729] text-white px-4 py-2 rounded-md font-semibold">
                    Edit Property
                  </button>
                </Link>


              </div>
            )}
            {/* Review Section */}
            <ReviewSection propertyId={property._id} />


          </div>
        </div>
      </div>

      {/* Live Video Tour Modal */}
      {liveTourActive && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg relative w-[90%] max-w-3xl flex flex-col">

            {/* Close X button at top */}
            <button
              onClick={() => setLiveTourActive(false)}
              className="absolute top-2 right-2 text-red-500 font-bold text-xl"
            >
              ✕
            </button>

            {/* Live Video Tour Component */}
            <div className="flex-1">
              <LiveVideoTour propertyId={property._id} />
            </div>

            {/* End Video Button */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setLiveTourActive(false)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                End Video Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
