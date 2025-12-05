// src/components/chat/ChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
const socket = io(SOCKET_URL, { autoConnect: true, reconnection: true });

const ChatWindow = ({ chatId, receiver, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  // Local state for receiver to support updates (online status, etc.) from API
  const [activeReceiver, setActiveReceiver] = useState(receiver);
  const bottomRef = useRef();

  // Connect user to socket
  useEffect(() => {
    if (user?._id) {
      socket.emit("register_user", user._id);
    }
  }, [user]);

  // Update activeReceiver when prop changes initially
  useEffect(() => {
    if (receiver) {
      setActiveReceiver(receiver);
    }
  }, [receiver]);

  // Fetch previous messages & Ensure receiver info is up to date
  useEffect(() => {
    if (!chatId || !user) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/api/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(data.messages || []);

        // Update receiver with fresh data from backend
        if (data.participants && data.participants.length > 0) {
          const other = data.participants.find(p => p._id !== user._id);
          if (other) {
            setActiveReceiver(prev => ({
              ...prev,
              ...other,
              // Ensure we keep the profile picture if backend didn't return it in this specific call (though it should)
              profilePicture: other.profilePicture || prev?.profilePicture
            }));
          }
        }
      } catch (err) {
        console.error(" Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [chatId, user]);

  // Join chat and listen for new messages
  useEffect(() => {
    if (!chatId) return;

    socket.emit("join_chat", chatId);

    const handleIncoming = (payload) => {
      if (payload.chatId === chatId) {
        setMessages((prev) => [...prev, payload.message]);
      }
    };

    socket.on("receive_message", handleIncoming);

    return () => {
      socket.off("receive_message", handleIncoming);
    };
  }, [chatId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !chatId || !user) return;

    const payload = {
      chatId,
      senderId: user._id,
      text: text.trim(),
    };

    socket.emit("send_message", payload);
    setText("");
  };

  const getStatusText = () => {
    if (activeReceiver?.isOnline) return "Online";
    if (activeReceiver?.lastSeen) {
      const date = new Date(activeReceiver.lastSeen);
      return `Last seen ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return "";
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white shadow-2xl w-80 h-96 rounded-2xl flex flex-col border border-gray-200 z-50">
      {/* Header */}
      <div className="p-3 bg-amber-500 text-white font-semibold rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* Profile Picture */}
          <div className="relative">
            {activeReceiver?.profilePicture ? (
              <img
                src={activeReceiver.profilePicture}
                alt={activeReceiver.name}
                className="w-10 h-10 rounded-full object-cover bg-white border border-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white text-amber-600 flex items-center justify-center font-bold">
                {activeReceiver?.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            {/* Online Indicator Dot */}
            {activeReceiver?.isOnline && (
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-400"></span>
            )}
          </div>

          <div className="leading-tight">
            <div className="text-sm font-bold">{activeReceiver?.name || "Chat"}</div>
            <div className="text-xs text-amber-100 font-normal">
              {getStatusText()}
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white opacity-90 hover:opacity-100"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, i) => {
          if (!msg) return null;
          const senderId =
            typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
          const isMine = senderId === user?._id;

          return (
            <div
              key={i}
              className={`p-2 rounded-lg max-w-[70%] ${isMine
                ? "bg-amber-100 self-end ml-auto text-right"
                : "bg-gray-100 self-start text-left"
                }`}
            >
              {msg?.text || ""}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 flex items-center border-t">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-amber-500 text-white rounded-lg px-3 py-2 text-sm font-semibold hover:bg-amber-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
