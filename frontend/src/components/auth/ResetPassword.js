import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await axios.post("/api/auth/reset-password", {
        email,
        newPassword: password,
      });

      toast.success("Password reset success!");
      navigate("/login");
    } catch (err) {
      toast.error("Error resetting password");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto pt-32">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>

      <form onSubmit={handleReset}>
        <input
          type="password"
          className="border p-3 w-full rounded"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          className="border p-3 w-full rounded mt-3"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button
          type="submit"
          className="mt-4 w-full bg-[#d16729] text-white py-2 rounded"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
