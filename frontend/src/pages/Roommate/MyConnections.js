import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react"; 

const MyConnections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const { data } = await axios.get("/api/connections/connections", {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log("📌 FRONTEND: Connections API Response:", data);
      setConnections(data);
    } catch (err) {
      console.error("Failed to fetch connections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchConnections();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-3 text-gray-600">Loading connections...</p>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        You have no connections yet 🤝
      </div>
    );
  }

  return (
  <div className="px-4 py-6 max-w-xl mx-auto">
    <h2 className="text-3xl font-bold mb-6 text-amber-700">My Connections</h2>

    <div className="flex flex-col gap-4">
      {connections.map((conn) => {
        const person = conn.otherUser;

        return (
          <motion.div
            key={conn._id}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-4 p-3 rounded-2xl shadow-md bg-white hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate(`/profile/${person._id}`)} // click → profile
          >
            {/* Profile Image */}
            <img
              src={person?.profileImage || "/default.jpg"}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-800">
                {person.name}
              </h3>
              <p className="text-gray-500 text-xs truncate max-w-[180px]">
                {person.bio || "Hey there! I am using PGHome 🤝"}
              </p>
            </div>

            {/* Message Button */}
            <button
             
              className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700"
            >
              <MessageCircle size={18} />
            </button>
          </motion.div>
        );
      })}
    </div>
  </div>
);

};

export default MyConnections;
