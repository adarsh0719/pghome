// src/pages/auth/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import image1 from "../../images/image1.jpg";

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    otp: "",
    userType: "student",
    institution: "",
    company: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [valid, setValid] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    switch (step) {
      case 1:
        setValid(formData.name.trim().length >= 3);
        break;
      case 2:
        setValid(emailRegex.test(formData.email));
        break;
      case 3:
        setValid(String(formData.otp).trim().length === 6);
        break;
      case 4:
        setValid(["student", "employee", "owner"].includes(formData.userType));
        break;
      case 5:
        if (formData.userType === "student")
          setValid(
            formData.institution.trim().length >= 3 &&
            phoneRegex.test(formData.phone)
          );
        else if (formData.userType === "employee")
          setValid(
            formData.company.trim().length >= 2 && phoneRegex.test(formData.phone)
          );
        else if (formData.userType === "owner")
          setValid(phoneRegex.test(formData.phone));
        break;
      case 6:
        setValid(
          formData.password.length >= 6 &&
          formData.password === formData.confirmPassword
        );
        break;
      default:
        setValid(false);
    }
  }, [step, formData]);

  const nextStep = () => step < 6 && setStep((s) => s + 1);
  const prevStep = () => step > 1 && setStep((s) => s - 1);

  const sendOtp = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/auth/send-otp", {
        email: formData.email,
      });
      if (res.data && res.data.success) {
        setOtpSent(true);
        alert("OTP sent to your email.");
        setStep(3);
      } else {
        alert(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      if (res.data && res.data.success) {
        alert("OTP verified. Continue registration.");
        setStep(4);
      } else {
        alert(res.data.message || "OTP verification failed");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "OTP verification failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 2) {
      if (valid && !loading) await sendOtp();
      return;
    }

    if (step === 3) {
      if (valid && !loading) await verifyOtp();
      return;
    }

    if (step < 6) {
      if (valid) nextStep();
      return;
    }

    // Explicitly validate password step to avoid race condition with state
    if (
      step === 6 &&
      (formData.password.length < 6 ||
        formData.password !== formData.confirmPassword)
    ) {
      return;
    }

    const data = {
      name: formData.name,
      email: formData.email,
      userType: formData.userType,
      phone: formData.phone,
      password: formData.password,
      ...(formData.userType === "student" && {
        institution: { name: formData.institution },
      }),
      ...(formData.userType === "employee" && {
        company: { name: formData.company },
      }),
    };

    setLoading(true);
    const res = await register(data);
    if (res.success) navigate("/kyc-verify");
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${image1})`,
      }}
    >
      {/* Background Blur Layer */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30"></div>

      {/* Transparent Card */}
      <div className="relative bg-white/50 backdrop-blur-xl shadow-2xl rounded-3xl px-8 py-10 w-full max-w-md border border-white/30 z-10">
        {/* Logo + Back */}
        <div className="w-full flex justify-center items-center mb-6 relative">
          {step > 1 && (
            <button onClick={prevStep} className="absolute left-0 top-1">
              <ArrowLeft size={22} className="text-white" />
            </button>
          )}
          <div className="flex items-center space-x-1">
            <span className="text-3xl font-bold text-white">PG</span>
            <span className="text-3xl font-bold text-[#d16729]">to Home</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-8">
          <div className="h-1.5 bg-gray-300/50 rounded-full">
            <div
              className="h-1.5 bg-[#d16729] rounded-full transition-all"
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Header */}
        <h2 className="text-lg font-semibold mb-4 text-white text-center">
          {[
            "Nice one! So, what do you like to be called?",
            "Tell us your Email ID",
            "Enter the OTP sent to your Gmail",
            "You are a?",
            formData.userType === "student"
              ? "Your institution and phone number?"
              : formData.userType === "employee"
                ? "Your company and phone number?"
                : "Your phone number?",
            "Set your password",
          ][step - 1]}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <input
              name="name"
              placeholder="Full Name"
              className="border border-white/40 bg-white/100 text-black placeholder-gray-400 rounded-2xl px-4 py-2 w-full"
              value={formData.name}
              onChange={handleChange}
            />
          )}

          {step === 2 && (
            <>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                className="border border-white/40  bg-white/100 text-black placeholder-gray-400rounded-lg px-4 py-2 w-full"
                value={formData.email}
                onChange={handleChange}
              />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={!valid || loading}
                  className={`w-1/2 py-2 rounded-2xl font-medium text-white transition 
                ${valid ? "bg-black hover:bg-gray-800" : "bg-gray-400/50 cursor-not-allowed"}`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <input
                name="otp"
                placeholder="6-digit OTP"
                className="border border-white/40  bg-white/100 text-black placeholder-gray-400 rounded-lg px-4 py-2 w-full"
                value={formData.otp}
                onChange={handleChange}
              />
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={!valid || loading}
                  className={`py-2 px-4 rounded-2xl font-medium text-white transition 
                  ${valid ? "bg-black hover:bg-gray-800" : "bg-gray-400/50 cursor-not-allowed"}`}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="py-2 px-4 rounded-2xl border border-white/50 text-white"
                >
                  Resend
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="border border-white/40  bg-white/100 text-black rounded-lg px-4 py-2 w-full"
            >
              <option value="student">Student</option>
              <option value="employee">Working Professional</option>
              <option value="owner">Property Owner</option>
            </select>
          )}

          {step === 5 && (
            <>
              {formData.userType === "student" && (
                <input
                  name="institution"
                  placeholder="College/University"
                  className="border border-white/40  bg-white/100 text-black placeholder-gray-400 rounded-lg px-4 py-2 w-full"
                  value={formData.institution}
                  onChange={handleChange}
                />
              )}

              {formData.userType === "employee" && (
                <input
                  name="company"
                  placeholder="Company Name"
                  className="border border-white/40  bg-white/100 text-black placeholder-gray-400 rounded-lg px-4 py-2 w-full"
                  value={formData.company}
                  onChange={handleChange}
                />
              )}

              <input
                name="phone"
                placeholder="Phone Number"
                className="border border-white/40 bg-white/100  text-black placeholder-gray-400 rounded-lg px-4 py-2 w-full"
                value={formData.phone}
                onChange={handleChange}
              />
            </>
          )}

          {step === 6 && (
            <>
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 chars)"
                className="border border-white/40 bg-white/100 text-black placeholder-gray-400 rounded-lg px-4 py-2 w-full"
                value={formData.password}
                onChange={handleChange}
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="border border-white/40 bg-white/100 text-black placeholder-gray-400 rounded-lg px-4 py-2 w-full"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </>
          )}

          {/* Action Button */}
          <div className="w-full flex justify-center">
            {step !== 2 && step !== 3 && (
              <button
                type={step === 6 ? "submit" : "button"}
                onClick={step < 6 ? nextStep : undefined}
                disabled={!valid || loading}
                className={`w-1/2 py-2 rounded-2xl font-medium text-white transition 
                ${valid ? "bg-black hover:bg-gray-800" : "bg-gray-400/50 cursor-not-allowed"}`}
              >
                {step === 6
                  ? loading
                    ? "Creating..."
                    : "Create Account"
                  : "Continue"}
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <p className="text-sm text-white mt-4 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="bg-[#d16729] hover:bg-black text-black hover:text-white font-medium px-4 py-2 rounded-lg transition duration-200"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
