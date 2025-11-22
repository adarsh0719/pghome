import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const ReviewSection = ({ propertyId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState({ rating: 5, comment: "" });
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Color theme
  const primaryColor = "#d16729";
  const primaryHover = "#b8561f";
  const primaryLight = "#fdf6f0";
  const primaryLighter = "#fefaf6";

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/reviews/${propertyId}`);
      setReviews(res.data);

      if (user) {
        const found = res.data.find((r) => r.user._id === user._id);
        if (found) {
          setAlreadyReviewed(true);
          setMyReview({ rating: found.rating, comment: found.comment });
          setEditingReviewId(found._id);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  // Create or update review
  const handleSubmit = async () => {
    if (!user) {
      toast.info("Please login to submit a review");
      return;
    }

    if (!myReview.comment.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    try {
      setLoading(true);
      if (editingReviewId) {
        await axios.put(
          `/api/reviews/edit/${editingReviewId}`,
          myReview,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        toast.success("Review updated successfully!");
      } else {
        await axios.post(
          `/api/reviews/${propertyId}`,
          myReview,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        toast.success("Review submitted successfully!");
      }

      setMyReview({ rating: 5, comment: "" });
      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      setLoading(true);
      await axios.delete(`/api/reviews/delete/${reviewId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      toast.success("Review deleted successfully!");
      setEditingReviewId(null);
      setMyReview({ rating: 5, comment: "" });
      setAlreadyReviewed(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange, editable = false, size = "medium" }) => {
    const starSize = size === "large" ? "w-6 h-6 sm:w-7 sm:h-7" : "w-4 h-4 sm:w-5 sm:h-5";
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!editable}
            onClick={() => editable && onRatingChange(star)}
            className={`${
              editable ? "cursor-pointer hover:scale-110 transition-transform duration-150" : "cursor-default"
            }`}
          >
            <svg
              className={`${starSize} ${
                star <= rating ? "text-[#d16729] fill-current" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  // Calculate average rating and rating distribution
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 : 0
  }));

  // Filter reviews based on active tab
  const filteredReviews = activeTab === "all" 
    ? reviews 
    : reviews.filter(review => review.rating === parseInt(activeTab));

  return (
    <div className="max-w-6xl mx-auto mt-8 sm:mt-12 px-4 sm:px-6">
      {/* Header Section with Stats */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
          {/* Rating Overview */}
          <div className="flex-1 w-full">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-2">Guest Reviews</h2>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl sm:text-5xl font-bold text-gray-900">{averageRating}</div>
                <div className="flex flex-col">
                  <StarRating rating={Math.round(averageRating)} size="large" />
                  <span className="text-gray-600 text-sm mt-1">
                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 w-full max-w-md">
            <div className="space-y-2 sm:space-y-3">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-12 sm:w-8">{stars} star</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#d16729] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8 sm:w-12 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === "all" 
                ? "bg-[#d16729] text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map(stars => {
            const count = reviews.filter(r => r.rating === stars).length;
            return count > 0 && (
              <button
                key={stars}
                onClick={() => setActiveTab(stars.toString())}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === stars.toString() 
                    ? "bg-[#d16729] text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {stars} Stars ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Review Form */}
        {user && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 sticky top-4 sm:top-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                {editingReviewId ? "Edit Your Review" : "Share Your Experience"}
              </h3>
              
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Rating
                </label>
                <StarRating
                  rating={myReview.rating}
                  onRatingChange={(rating) => setMyReview({ ...myReview, rating })}
                  editable={true}
                  size="large"
                />
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Review
                </label>
                <textarea
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#d16729] focus:border-transparent transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="Share your detailed experience with this property..."
                  value={myReview.comment}
                  onChange={(e) => setMyReview({ ...myReview, comment: e.target.value })}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-2">
                  {myReview.comment.length}/500 characters
                </div>
              </div>

              <div className="flex flex-col space-y-2 sm:space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !myReview.comment.trim()}
                  className="w-full bg-[#d16729] hover:bg-[#b8561f] disabled:bg-gray-400 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">Processing...</span>
                    </>
                  ) : (
                    <span className="text-sm sm:text-base">
                      {editingReviewId ? "Update Review" : "Submit Review"}
                    </span>
                  )}
                </button>

                {editingReviewId && (
                  <button
                    onClick={() => {
                      setEditingReviewId(null);
                      setMyReview({ rating: 5, comment: "" });
                    }}
                    disabled={loading}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className={user ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {activeTab === "all" ? "All Reviews" : `${activeTab} Star Reviews`}
                <span className="text-gray-500 text-base sm:text-lg font-normal ml-2">
                  ({filteredReviews.length})
                </span>
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-8 sm:py-12">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-[#d16729] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-300 mb-4">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-base sm:text-lg font-medium">No reviews found</p>
                <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
                  {activeTab === "all" 
                    ? "Be the first to share your experience!" 
                    : `No ${activeTab} star reviews yet`}
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {filteredReviews.map((review) => (
                  <div 
                    key={review._id} 
                    className="p-4 sm:p-6 border border-gray-200 rounded-lg sm:rounded-xl hover:shadow-sm transition-all duration-200 bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div 
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm"
                          style={{ 
                            background: `linear-gradient(135deg, ${primaryColor}, #e87c3d)`
                          }}
                        >
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">{review.user.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <StarRating rating={review.rating} size="large" />
                        <div className="text-xs text-gray-500 mt-1">
                          {review.rating}.0 out of 5
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3 sm:mb-4">{review.comment}</p>

                    {user && user._id === review.user._id && (
                      <div className="flex flex-wrap gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setEditingReviewId(review._id);
                            setMyReview({ rating: review.rating, comment: review.comment });
                          }}
                          className="text-[#d16729] hover:text-[#b8561f] font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 px-2 py-1 sm:px-3 sm:py-1 rounded-md sm:rounded-lg hover:bg-[#fdf6f0]"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => deleteReview(review._id)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 px-2 py-1 sm:px-3 sm:py-1 rounded-md sm:rounded-lg hover:bg-red-50"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;