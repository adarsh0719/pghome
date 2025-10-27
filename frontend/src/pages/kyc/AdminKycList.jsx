import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminKycList() {
  const [kycs, setKycs] = useState([]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/kyc/pending', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setKycs(res.data);
  };

  useEffect(() => { fetchData(); }, []);

  const review = async (id, action) => {
    const reason = action === 'reject' ? prompt('Reason for rejection:') : '';
    const token = localStorage.getItem('token');
    await axios.post(`/api/kyc/${id}/review`, { action, reason }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Pending KYC Requests</h2>

      {kycs.length === 0 && (
        <p className="text-center text-gray-500">No pending KYC requests.</p>
      )}

      <div className="space-y-6">
        {kycs.map((k) => (
          <div key={k._id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <div>
                <p className="text-lg font-semibold text-gray-800">{k.user.name}</p>
                <p className="text-gray-500">{k.user.email}</p>
                <p className="text-gray-700 mt-1">{k.aadhaarMasked}</p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                <button
                  onClick={() => review(k._id, 'approve')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => review(k._id, 'reject')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <img
                src={k.frontImageUrl}
                alt="front"
                className="w-full md:w-48 h-32 object-cover rounded-lg border border-gray-300"
              />
              <img
                src={k.backImageUrl}
                alt="back"
                className="w-full md:w-48 h-32 object-cover rounded-lg border border-gray-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
