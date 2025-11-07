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
  const bottomRef = useRef();

  // Connect user to socket
  useEffect(() => {
    if (user?._id) {
      socket.emit("register", user._id);
    }
  }, [user]);

  // Fetch previous messages
  useEffect(() => {
    if (!chatId || !user) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/api/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(data.messages || []);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
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

  return (
    <div className="fixed bottom-6 right-6 bg-white shadow-2xl w-80 h-96 rounded-2xl flex flex-col border border-gray-200 z-50">
      {/* Header */}
      <div className="p-3 bg-amber-500 text-white font-semibold rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-white text-amber-600 flex items-center justify-center font-bold">
            {receiver?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>{receiver?.name || "Chat"}</div>
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
              className={`p-2 rounded-lg max-w-[70%] ${
                isMine
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
