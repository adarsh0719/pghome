import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            toast.error('Failed to fetch users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const makeAdmin = async (userId) => {
        if (!window.confirm('Are you sure you want to make this user an admin?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/users/${userId}/make-admin`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User promoted to admin successfully');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update user');
            console.error(err);
        }
    };

    if (loading) return <div className="text-center py-10">Loading users...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">User Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email / Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roommate Profile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            {user.isAdmin && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Admin</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                    <div className="text-sm text-gray-500">{user.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#d16729]/20 text-[#d16729]">
                                        {user.userType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.roommateProfile ? (
                                        <div>
                                            <p>Age: {user.roommateProfile.age}</p>
                                            <p>Gender: {user.roommateProfile.gender}</p>
                                            <p>Budget: ₹{user.roommateProfile.budget}</p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">No Profile</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {!user.isAdmin && (
                                        <button
                                            onClick={() => makeAdmin(user._id)}
                                            className="text-[#d16729] hover:text-[#d16729] bg-[#d16729]/10 px-3 py-1 rounded-md"
                                        >
                                            Make Admin
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
