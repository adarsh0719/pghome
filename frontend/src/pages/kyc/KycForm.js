import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function KycForm() {
  const [aadhaar, setAadhaar] = useState("");
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Small square preview UI
  const PreviewBox = ({ file }) => {
    if (!file) return null;
    return (
      <img
        src={URL.createObjectURL(file)}
        alt="preview"
        className="w-14 h-14 rounded-md object-cover border border-gray-300 mt-1"
      />
    );
  };

  const handleFile = (fileSetter) => (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2*1024* 1024) {
      setMsg("Each file must be under 2MB");
      return;
    }
    fileSetter(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!/^\d{12}$/.test(aadhaar)) return setMsg("Aadhaar must be 12 digits");
    if (!front || !back) return setMsg("Upload both images");

    const formData = new FormData();
    formData.append("aadhaar", aadhaar);
    formData.append("front", front);
    formData.append("back", back);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post("/api/kyc/submit", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("KYC submitted! Await approval.");
      navigate("/kyc-waiting");
      setFront(null);
      setBack(null);
      setAadhaar("");
    } catch (err) {
      setMsg(err.response?.data?.message || "Error uploading");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0ee] flex flex-col px-5 py-8 items-center pt-32">

      {/* Back + Logo */}
      <div className="w-full max-w-sm flex justify-center items-center mb-6 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-1 flex items-center text-gray-700 hover:text-black"
        >
          <ArrowLeft size={22} className="mr-1" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center space-x-1">
          <span className="text-3xl font-bold text-black">KYC Verification</span>
        </div>
      </div>

     
      <p className="text-sm text-gray-500 mb-6 text-center">
        Upload your Aadhaar for verification (Max 500KB each)
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">

        {/* Aadhaar Input */}
        <div>
          <label className="text-sm font-medium text-gray-600">Aadhaar Number</label>
          <input
            type="text"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
            maxLength={12}
            placeholder="Enter 12 digit Aadhaar"
            className="border rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
          />
        </div>

        {/* Front Upload */}
        <div>
          <label className="text-sm font-medium text-gray-600">Front Side</label>
          <input type="file" onChange={handleFile(setFront)} className="w-full text-sm mt-1" />
          <PreviewBox file={front} />
        </div>

        {/* Back Upload */}
        <div>
          <label className="text-sm font-medium text-gray-600">Back Side</label>
          <input type="file" onChange={handleFile(setBack)} className="w-full text-sm mt-1" />
          <PreviewBox file={back} />
        </div>

        {/* Submit */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`w-1/2 py-2 rounded-2xl font-medium text-white transition
            ${loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} /> Uploading...
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>

      {msg && (
        <p
          className={`mt-4 text-sm text-center ${
            msg.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {msg}
        </p>
      )}
    </div>
    
  );
}
