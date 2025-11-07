import React from "react";
import {
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaPinterest,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#E1A54B] text-black font-['Poppins'] py-16 px-8 md:px-20">
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo + QR */}
        <div className="flex flex-col items-center md:items-start space-y-6">
          {/* Logo */}
          <h1 className="text-3xl font-bold italic text-black tracking-wide">
            PG to <span className="text-white not-italic font-semibold">Home</span>
          </h1>

          {/* QR Scanner (No background box) */}
          <div className="flex flex-col items-center">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?data=https://pgt0home.in&size=150x150&color=000000&bgcolor=E1A54B"
              alt="QR Code"
              className="w-36 h-36"
            />
            <p className="text-sm mt-2">Scan the QR code to get the app</p>
          </div>
        </div>

        {/* About Us */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-lg font-semibold mb-4">About Us</h2>
          <ul className="space-y-2 text-sm">
            <li>Our apps</li>
            <li>Match Roommates</li>
            <li>Hostels</li>
            <li>Connect</li>
          </ul>
        </div>

        {/* Company */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-lg font-semibold mb-4">Company</h2>
          <ul className="space-y-2 text-sm">
            <li>Company</li>
            <li>About</li>
            <li>Contact us</li>
            <li>Careers</li>
            <li>Investors</li>
            <li>The Shop</li>
          </ul>
        </div>

        {/* Support */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-lg font-semibold mb-4">Support</h2>
          <ul className="space-y-2 text-sm">
            <li>Legal</li>
            <li>Guidelines</li>
            <li>Manage cookies</li>
            <li>Privacy policy</li>
            <li>Terms and conditions</li>
            <li>Accessibility at Bumble</li>
            <li>Notice at collection</li>
          </ul>
        </div>
      </div>

      {/* Social Icons */}
      <div className="flex justify-center md:justify-end space-x-6 mt-12">
        <FaInstagram className="w-6 h-6 hover:opacity-70 cursor-pointer" />
        <FaTiktok className="w-6 h-6 hover:opacity-70 cursor-pointer" />
        <FaFacebook className="w-6 h-6 hover:opacity-70 cursor-pointer" />
        <FaPinterest className="w-6 h-6 hover:opacity-70 cursor-pointer" />
        <FaYoutube className="w-6 h-6 hover:opacity-70 cursor-pointer" />
        <FaLinkedin className="w-6 h-6 hover:opacity-70 cursor-pointer" />
      </div>
    </footer>
  );
};

export default Footer;
