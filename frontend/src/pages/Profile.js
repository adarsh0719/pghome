// src/pages/Profile.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    institution: user?.institution || '',
    idProofUrl: user?.idProofUrl || '',
    kycDocuments: user?.kycDocuments || []
  });

  const [message, setMessage] = useState('');

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await axios.put('/api/users/profile', formData);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage('Error updating profile');
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      {message && <p>{message}</p>}
      <form onSubmit={onSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={onChange}
          />
        </div>
        <div>
          <label>Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={onChange}
          />
        </div>
        <div>
          <label>Institution</label>
          <input
            type="text"
            name="institution"
            value={formData.institution}
            onChange={onChange}
          />
        </div>
        <div>
          <label>ID Proof URL</label>
          <input
            type="text"
            name="idProofUrl"
            value={formData.idProofUrl}
            onChange={onChange}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;