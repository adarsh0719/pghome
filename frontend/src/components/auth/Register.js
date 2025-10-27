// src/components/auth/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    userType: 'student', phone: '', institution: '', company: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      userType: formData.userType,
      phone: formData.phone,
      ...(formData.userType === 'student' && { institution: { name: formData.institution } }),
      ...(formData.userType === 'employee' && { company: { name: formData.company } })
    };

    const result = await register(userData);
    if (result.success) navigate('/dashboard');

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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/login"
            className="font-medium text-[#FF5A5F] hover:text-[#E0484F] transition-colors"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      {/* Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#484848]">Full Name</label>
              <div className="mt-1">
                <input
                  id="name" name="name" type="text" required
                  value={formData.name} onChange={handleChange}
                  placeholder="Enter your full name"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#FF5A5F] focus:border-[#FF5A5F] sm:text-sm shadow-sm hover:shadow-md transition-shadow"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#484848]">Email address</label>
              <div className="mt-1">
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  value={formData.email} onChange={handleChange}
                  placeholder="Enter your email"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#FF5A5F] focus:border-[#FF5A5F] sm:text-sm shadow-sm hover:shadow-md transition-shadow"
                />
              </div>
            </div>

            {/* User Type */}
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-[#484848]">I am a</label>
              <div className="mt-1">
                <select
                  id="userType" name="userType" value={formData.userType} onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-[#FF5A5F] focus:border-[#FF5A5F] sm:text-sm shadow-sm hover:shadow-md transition-shadow"
                >
                  <option value="student">Student</option>
                  <option value="employee">Working Professional</option>
                  <option value="owner">Property Owner</option>
                </select>
              </div>
            </div>

            {/* Conditional Fields */}
            {formData.userType === 'student' && (
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-[#484848]">College/University</label>
                <div className="mt-1">
                  <input
                    id="institution" name="institution" type="text" required
                    value={formData.institution} onChange={handleChange}
                    placeholder="Enter your college name"
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#FF5A5F] focus:border-[#FF5A5F] sm:text-sm shadow-sm hover:shadow-md transition-shadow"
                  />
                </div>
              </div>
            )}
            {formData.userType === 'employee' && (
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-[#484848]">Company</label>
                <div className="mt-1">
                  <input
                    id="company" name="company" type="text" required
                    value={formData.company} onChange={handleChange}
                    placeholder="Enter your company name"
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#FF5A5F] focus:border-[#FF5A5F] sm:text-sm shadow-sm hover:shadow-md transition-shadow"
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#484848]">Phone Number</label>
              <div className="mt-1">
                <input
                  id="phone" name="phone" type="tel" required
                  value={formData.phone} onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#FF5A5F] focus:border-[#FF5A5F] sm:text-sm shadow-sm hover:shadow-md transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#484848]">Password</label>
              <div className="mt-1">
                <input
                  id="password" name="password" type="password" required
                  value={formData.password} onChange={handleChange}
                  placeholder="Enter your password"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#FF5A5F] focus:border-[#FF5A5F] sm:text-sm shadow-sm hover:shadow-md transition-shadow"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#484848]">Confirm Password</label>
              <div className="mt-1">
                <input
                  id="confirmPassword" name="confirmPassword" type="password" required
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Confirm your password"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#FF5A5F] focus:border-[#FF5A5F] sm:text-sm shadow-sm hover:shadow-md transition-shadow"
                />
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-[#FF5A5F] hover:bg-[#E0484F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5A5F] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
