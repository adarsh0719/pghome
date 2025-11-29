// src/pages/Posts/PostsFeed.jsx
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import PostCard from './PostCard';

const PostsFeed = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();

  // 🔥 Added for profile avatar
  const [profileAvatar, setProfileAvatar] = useState('/default-avatar.png');

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const res = await axios.get('/api/roommate/profile');
        setProfileAvatar(res.data?.images?.[0] || '/default-avatar.png');
      } catch {
        setProfileAvatar('/default-avatar.png');
      }
    };
    loadProfileImage();
  }, []);

  const { data: posts = [], isLoading } = useQuery('posts', () =>
    axios.get('/api/posts').then(res => res.data)
  );

  useEffect(() => {
    if (!socket) return;
    socket.on('newPost', () => queryClient.invalidateQueries('posts'));
    socket.on('postUpdated', () => queryClient.invalidateQueries('posts'));
    socket.on('postDeleted', () => queryClient.invalidateQueries('posts'));
    return () => socket.off();
  }, [socket, queryClient]);

useEffect(() => {
  if (!socket) return;

  socket.on('postUpdated', (updatedPost) => {
    queryClient.setQueryData('posts', (old = []) =>
      old.map(p => p._id === updatedPost._id ? updatedPost : p)
    );
  });

  return () => socket.off('postUpdated');
}, [socket, queryClient]);



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4 pt-24">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Community Feed</h1>
          <p className="text-gray-600 mt-2">Connect with PG owners and tenants</p>
        </div>

        {/* Create Post Box */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="p-4 flex items-start gap-4">
            <img
              src={profileAvatar}   // 🔥 Fixed Avatar
              alt={user?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <Link
              to="/create-post"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full px-6 py-4 text-left transition"
            >
              Start a post — announce rooms, share updates...
            </Link>
          </div>
          <div className="border-t border-gray-200 px-4 py-3">
            <Link
              to="/create-post"
              className="inline-block bg-[#d16729] hover:bg-[#b8551f] text-white font-medium px-8 py-3 rounded-md transition"
            >
              Create Post
            </Link>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#d16729] border-t-transparent"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-xl text-gray-600">No posts yet</p>
              <p className="text-gray-500 mt-2">Be the first to share something!</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post._id} post={post} currentUserId={user?._id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostsFeed;
