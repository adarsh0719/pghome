// src/components/auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const userInfo = result.user;
      if (userInfo.isAdmin) navigate('/kyc-admin');
      else navigate('/dashboard');
    } else {
      alert(result.message || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Logo & Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-[#FF5A5F] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">PG</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#484848]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-[#FF5A5F] hover:text-[#E0484F] transition-colors"
          >
            create a new account
          </Link>
        </p>
      </div>

      {/* Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#484848]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#FF5A5F] focus:border-[#FF5A5F] sm:text-sm shadow-sm hover:shadow-md transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#484848]">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#FF5A5F] focus:border-[#FF5A5F] sm:text-sm shadow-sm hover:shadow-md transition-shadow"
                />
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-[#FF5A5F] hover:bg-[#E0484F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5A5F] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">Demo Credentials</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700">
              <p><strong>Student:</strong> student@example.com / password</p>
              <p><strong>Owner:</strong> owner@example.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
