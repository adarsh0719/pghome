import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

export default function KycWaiting() {
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const checkKycStatus = async () => {
      try {
        const res = await axios.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Correct path
       const kycStatus = res.data?.user?.kycStatus;
        

console.log("res.data?.user?.kycStatus >>>", res.data?.user?.kycStatus);

        console.log("FULL API RESPONSE:", res.data);

        if (kycStatus === "approved") {
          navigate("/roommateMatches");
        } else if (kycStatus === "rejected") {
          alert(" Your KYC was rejected. Please resubmit.");
          navigate("/kyc");
        }

      } catch (err) {
        console.log("KYC Check Error:", err.response?.data || err);
      }
    };

    if (token) {
      checkKycStatus();
      const interval = setInterval(checkKycStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [navigate, token]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">
        KYC Submitted 
      </h2>
      <p className="text-gray-500 mb-6 text-center">
        Please wait while our team verifies your details.
      </p>

      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>

      <p className="text-sm text-gray-500 mt-3">
        This may take a moment...
      </p>
    </div>
  );
}
