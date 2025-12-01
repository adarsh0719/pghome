import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import ChatWindow from "../../components/chat/ChatWindow";
const ConnectionItem = ({ conn, startChatFromConnection, navigate, user }) => {
  const person = conn.otherUser;
  const [image, setImage] = useState(person.profileImage || null);

  useEffect(() => {
    if (image) return; // Already has image (if backend provided it)

    const fetchImage = async () => {
      try {
        const { data } = await axios.get(`/api/roommate/profile/${person._id}/images`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (data && data.length > 0) {
          setImage(data[0]);
        }
      } catch (err) {
        // Silent fail or default image
      }
    };

    fetchImage();
  }, [person._id, user.token, image]);

  const optimizeImage = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    const parts = url.split("/upload/");
    return `${parts[0]}/upload/w_100,f_auto,q_auto/${parts[1]}`;
  };

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 sm:gap-4 p-3 rounded-2xl shadow-md bg-white hover:shadow-lg transition cursor-pointer w-full"
      onClick={() => navigate(`/profile/${person._id}`)}
    >
      <img
        src={optimizeImage(image) || "/default.jpg"}
        alt="profile"
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-200"
      />

      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
          {person.name}
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm truncate max-w-full">
          {person.bio || "Hey there! I am using PGHome 🤝"}
        </p>
      </div>

      <button
        className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          startChatFromConnection(person);
        }}
      >
        <MessageCircle size={18} />
      </button>
    </motion.div>
  );
};

const MyConnections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [activeReceiver, setActiveReceiver] = useState(null);

  const fetchConnections = async () => {
    try {
      const { data } = await axios.get("/api/connections", {
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

  const startChatFromConnection = async (otherUser) => {
    try {
      const { data } = await axios.post(
        "/api/chat/create",
        { otherUserId: otherUser._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setChatId(data._id);
      setActiveReceiver(otherUser);
    } catch (err) {
      console.error("Chat create error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="px-4 py-6 max-w-xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-amber-700 text-center sm:text-left">
        My Connections
      </h2>

      <div className="max-h-[70vh] overflow-y-auto pr-2 flex flex-col gap-3 sm:gap-4">
        {connections.map((conn) => (
          <ConnectionItem
            key={conn._id}
            conn={conn}
            startChatFromConnection={startChatFromConnection}
            navigate={navigate}
            user={user}
          />
        ))}
      </div>

      {/* ✅ ChatWindow should be OUTSIDE map, rendered only once */}
      {chatId && activeReceiver && (
        <div className="
    fixed bottom-3 right-3 
    w-[90%] max-w-[380px]       /* mobile size */
    sm:w-[420px] sm:bottom-6 sm:right-6   /* larger size on tablets+ */
    z-[9999]
  ">
          <ChatWindow
            chatId={chatId}
            receiver={activeReceiver}
            onClose={() => {
              setChatId(null);
              setActiveReceiver(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MyConnections;
