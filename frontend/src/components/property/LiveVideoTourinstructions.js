
import React from 'react';
import { Link } from 'react-router-dom';

const LiveVideoTourinstructions = () => {
   return (
    <div className="min-h-screen bg-[#F0F7FA] py-12 pt-32">
      <div className="max-w-3xl mx-auto px-6 bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-[#2B3A67] mb-6">
          Live Video Tour Instructions
        </h1>

        <p className="text-gray-700 mb-4">
          Experience properties in real-time with our Live Video Tour feature. Follow the steps below:
        </p>

        <ol className="list-decimal list-inside space-y-3 text-gray-800">
          <li>
            <strong>Check Availability:</strong> Only properties with the <span className="font-semibold">Live Video Tour</span> option can be viewed.
          </li>
          <li>
            <strong>Join the Tour:</strong> Both the owner and you must be on the same property page. Click <span className="font-semibold">Live Video Tour</span> to connect.
          </li>
          <li>
            <strong>Setup:</strong> Ensure your camera and microphone are working, and you have a stable internet connection.
          </li>
          <li>
            <strong>During the Tour:</strong> Ask questions and view the property as the owner guides you through.
          </li>
          <li>
            <strong>Tips:</strong> Avoid background noise, move the camera slowly (if owner), and be respectful.
          </li>
        </ol>

        <div className="mt-8 text-center">
          <Link
            to="/properties"
            className="inline-block bg-[#2B3A67] text-white px-6 py-3 rounded-lg hover:bg-[#1C2A50] transition"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LiveVideoTourinstructions;
