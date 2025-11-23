import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyResetOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/verify-reset-otp", { email, otp });
      toast.success("OTP verified!");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto pt-32">
      <h2 className="text-xl font-bold mb-4">Verify OTP</h2>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          maxLength={6}
          className="border p-3 w-full rounded"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button
          type="submit"
          className="mt-4 w-full bg-[#d16729] text-white py-2 rounded"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyResetOtp;
