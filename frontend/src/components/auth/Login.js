// src/components/auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import image1 from '../../images/image1.jpg';

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
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-24">
      {/* Background image div with blur */}
      <div
        className="absolute inset-0 bg-cover bg-center filter "
        style={{ backgroundImage: `url(${image1})` }}
      ></div>

      {/* Optional semi-transparent overlay for better contrast */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Login form container */}
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-200">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-[#d16729] hover:text-white transition-colors"
          >
            create a new account
          </Link>
        </p>

        {/* Transparent form box */}
        <div className="mt-8 bg-white/50 py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 backdrop-blur-md">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-[#d16729] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5A5F] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <Link to="/forgot-password" className="text-sm text-gray-200 hover:text-white">
  Forgot password?
</Link>

          {/* Demo Credentials */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/70 text-gray-500 font-medium">Demo Credentials</span>
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
