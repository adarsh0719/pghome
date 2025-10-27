import React, { useState } from 'react';
import axios from 'axios';

export default function KycForm() {
  const [aadhaar, setAadhaar] = useState('');
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false); // ✅ loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(aadhaar)) return setMsg('Aadhaar must be 12 digits');
    if (!front || !back) return setMsg('Upload both images');

    const formData = new FormData();
    formData.append('aadhaar', aadhaar);
    formData.append('front', front);
    formData.append('back', back);

    try {
      setLoading(true); // start loading
      const token = localStorage.getItem('token');
      await axios.post('/api/kyc/submit', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg('✅ KYC submitted for review.');
    } catch (err) {
      setMsg(err.response?.data?.message || '❌ Error submitting KYC');
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">KYC Verification</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Aadhaar Number</label>
          <input
            type="text"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 12-digit Aadhaar"
            maxLength={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Front Side of Aadhaar</label>
          <input
            type="file"
            onChange={(e) => setFront(e.target.files[0])}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Back Side of Aadhaar</label>
          <input
            type="file"
            onChange={(e) => setBack(e.target.files[0])}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading} // disable button during loading
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            'Submit'
          )}
        </button>
      </form>

      {msg && (
        <p className={`mt-4 text-center ${msg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
