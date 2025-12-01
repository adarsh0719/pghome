// src/pages/Posts/CreatePost.jsx
import React, { useState,useEffect} from 'react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
const CreatePost = () => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
 const [profileAvatar, setProfileAvatar] = useState(null);

const mutation = useMutation(
  async () => {
    const formData = new FormData();
    formData.append('content', content.trim());

    // Append each file correctly
    files.forEach((file) => {
      formData.append('media', file); // 'media' must match multer field name
    });

    return axios.post('/api/posts', formData, {
  timeout: 60000,
});
  },
  {
    onSuccess: (response) => {
      const newPost = response.data;

      // Optimistically update cache
      queryClient.setQueryData('posts', (old = []) => [newPost, ...old]);

      // Reset form
      setContent('');
      setFiles([]);
      setPreviews([]);

      // Navigate smoothly
      navigate('/posts');
    },
    onError: (error) => {
      console.error('Post creation failed:', error);
      alert(
        error.response?.data?.message ||
        'Failed to create post. Please try again.'
      );
    },
  }
);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, { 
          url: reader.result, 
          type: file.type.startsWith('video') ? 'video' : 'image',
          name: file.name 
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index) => {
    setFiles(f => f.filter((_, idx) => idx !== index));
    setPreviews(p => p.filter((_, idx) => idx !== index));
  };

  // Helper function for media grid layout
  const getMediaGridClass = (count) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    return 'grid-cols-2';
  };
  useEffect(() => {
  const loadProfileImage = async () => {
    try {
      const res = await axios.get('/api/roommate/profile'); 
      // or "/api/profile/me" — whichever exists in your app
      setProfileAvatar(res.data?.images?.[0] || "/default-avatar.png");
    } catch (err) {
      setProfileAvatar("/default-avatar.png");
    }
  };

  loadProfileImage();
}, []);
  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-32">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Post</h1>
          <p className="text-gray-600 mt-2">Share updates, photos, or videos with your community</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {/* Author Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-4 items-center">
              <img
                src={profileAvatar  || '/default-avatar.png'}
                alt={user?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
              />
              <div>
                <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.userType === 'owner' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.userType === 'owner' ? 'PG Owner' : 'Student'}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">Public</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share your thoughts, updates, or ask a question..."
              className="w-full p-0 border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-500 text-lg leading-relaxed min-h-[120px]"
              rows="4"
            />

            {/* Media Previews - Matching PostCard Style */}
            {previews.length > 0 && (
              <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
                <div className={`grid ${getMediaGridClass(previews.length)} gap-0.5 bg-gray-100`}>
                  {previews.map((p, i) => (
                    <div 
                      key={i} 
                      className={`relative ${
                        previews.length === 1 && p.type === 'image' 
                          ? 'max-h-[400px]' 
                          : 'aspect-square'
                      } overflow-hidden bg-gray-200 flex items-center justify-center group`}
                    >
                      {p.type === 'video' ? (
                        <div className="w-full h-full">
                          <video 
                            controls 
                            className="w-full h-full object-contain bg-black"
                            preload="metadata"
                          >
                            <source src={p.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : (
                        <img 
                          src={p.url} 
                          alt={`Preview ${i + 1}`}
                          className={`w-full h-full ${
                            previews.length === 1 
                              ? 'object-contain' 
                              : 'object-cover'
                          }`}
                        />
                      )}
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeMedia(i)}
                        className="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity shadow-lg"
                        title="Remove media"
                      >
                        <span className="text-lg font-bold leading-none">×</span>
                      </button>

                      {/* File Name Overlay for Videos */}
                      {p.type === 'video' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-white text-sm font-medium truncate">{p.name}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*" 
                  onChange={handleFiles} 
                  className="hidden" 
                  id="media" 
                />
                <label 
                  htmlFor="media" 
                  className="flex items-center gap-3 text-gray-600 hover:text-gray-800 font-medium cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Media</span>
                </label>

                {previews.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {previews.length} file{previews.length !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                 <button
                  onClick={() => navigate('/posts')}
                  className="px-6 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
  onClick={() => {
    if (!content.trim() && files.length === 0) return;
    mutation.mutate(); // ← THIS IS THE ONLY CORRECT WAY
  }}
  disabled={(!content.trim() && files.length === 0) || mutation.isLoading}
  className="bg-[#d16729] hover:bg-[#b8551f] text-white font-medium px-8 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
>
  {mutation.isLoading ? (
    <>
      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      Posting...
    </>
  ) : (
    'Post'
  )}
</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Posting Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Keep your posts respectful and relevant to the community</li>
            <li>• Upload clear photos and videos for better engagement</li>
            <li>• Share updates about PG facilities, events, or helpful information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;