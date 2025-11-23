import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/request-password-reset", { email });
      toast.success("OTP sent to your email");
      navigate("/verify-reset-otp", { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending OTP");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto pt-32">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>

      <form onSubmit={handleSendOtp}>
        <input
          type="email"
          className="border p-3 w-full rounded"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          className="mt-4 w-full bg-[#d16729] text-white py-2 rounded"
          type="submit"
        >
          Send OTP
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
