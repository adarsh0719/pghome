// src/pages/Posts/PostCard.jsx
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

const PostCard = ({ post, currentUserId }) => {
  const queryClient = useQueryClient();
  const isOwner = post.author._id === currentUserId;
  const [isExpanded, setIsExpanded] = useState(false);

  const likeMutation = useMutation(
    () => axios.post(`/api/posts/${post._id}/like`),
    {
      onSuccess: (response) => {
        const updatedPost = response.data;
        queryClient.setQueryData('posts', (old = []) =>
          old.map(p => p._id === updatedPost._id ? updatedPost : p)
        );
      }
    }
  );

  const deleteMutation = useMutation(
    () => axios.delete(`/api/posts/${post._id}`),
    {
      onSuccess: () => {
        queryClient.setQueryData('posts', old =>
          old.filter(p => p._id !== post._id)
        );
      }
    }
  );

  const isLiked = post.likes.some(id => id.toString() === currentUserId);

  // LinkedIn-style content truncation (around 3 lines of text)
  const shouldTruncate = post.content.length > 250;
  const truncatedContent = shouldTruncate && !isExpanded 
    ? post.content.slice(0, 250) + '...'
    : post.content;

  // Helper function for media grid layout
  const getMediaGridClass = (count) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    return 'grid-cols-2';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mb-6">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-start">
            <Link to={`/profile/${post.author._id}`} className="flex-shrink-0">
              <img
                src={post.author.avatar || '/default-avatar.png'}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 hover:border-gray-300 transition-colors"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link 
                  to={`/profile/${post.author._id}`} 
                  className="font-semibold text-gray-900 hover:text-gray-700 hover:underline truncate"
                >
                  {post.author.name}
                </Link>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  post.author.userType === 'owner' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {post.author.userType === 'owner' ? 'PG Owner' : 'Student'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </p>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this post?")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isLoading}
              className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
              title="Delete post"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content with LinkedIn-style truncation */}
      <div className="px-5 pb-4">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-[15px]">
          {truncatedContent}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#d16729] hover:text-[#b8551f] font-medium text-sm mt-2 transition-colors"
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}
      </div>

      {/* Media - Improved image and video preview */}
      {post.media.length > 0 && (
        <div className="border-y border-gray-100">
          <div className={`grid ${getMediaGridClass(post.media.length)} gap-0.5 bg-gray-100`}>
            {post.media.map((m, i) => (
              <div 
                key={i} 
                className={`relative ${
                  post.media.length === 1 
                    ? 'max-h-[600px]' 
                    : 'aspect-square'
                } overflow-hidden bg-gray-200 flex items-center justify-center`}
              >
                {m.type === 'video' ? (
                  <div className="w-full h-full">
                    <video 
                      controls 
                      className="w-full h-full object-contain bg-black"
                      preload="metadata"
                    >
                      <source src={m.url} type="video/mp4" />
                      <source src={m.url} type="video/webm" />
                      <source src={m.url} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <img 
                    src={m.url} 
                    alt={`Post media ${i + 1}`}
                    className={`w-full h-full ${
                      post.media.length === 1 
                        ? 'object-contain' 
                        : 'object-cover'
                    }`}
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats - Removed comment count */}
      <div className="px-5 py-3 border-b border-gray-100">
        <div className="flex items-center text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#d16729] rounded-full"></span>
            {post.likes.length} like{post.likes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Actions - Only like button, centered */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-center">
          <button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isLoading}
            className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl transition-all font-medium text-sm min-w-[120px] ${
              isLiked 
                ? 'text-[#d16729] bg-orange-50 hover:bg-orange-100 border border-orange-200' 
                : 'text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {likeMutation.isLoading ? (
              <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className={`w-2 h-2 rounded-full ${
                  isLiked ? 'bg-[#d16729]' : 'bg-gray-400'
                }`}></span>
                {isLiked ? 'Liked' : 'Like'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;