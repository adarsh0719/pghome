import React from 'react';
import { Routes,Route, Navigate,useLocation  } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Properties from './pages/Properties/Properties';
import PropertyDetail from './pages/Properties/PropertyDetail';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/Properties/AddProperty';
import Subscription from './pages/Payment/Subscription';
import Kycverification from './pages/kyc/KycForm';
import Adminkyc from './pages/kyc/AdminKycList';
import RoommateMatches from './pages/Roommate/RoommateMatches';
import LiveVideoTourinstructions from './components/property/LiveVideoTourinstructions';
import DownloadApp from './pages/homepage/DownloadApp';
import Features from './pages/homepage/Features';
import Footer from './pages/homepage/Footer';
import KycWaiting from './pages/kyc/KycWaiting';
import LandingPage from './pages/Roommate/LandingPage';
import ProfileInDetail from './pages/profileview/ProfileInDetail';
import BookingCheckOut from './pages/Payment/BookingCheckOut';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import OwnerBookings from './pages/Payment/OwnerBookings';
import { SocketProvider } from './context/SocketContext'; 
import NotificationsPage from './pages/notifypage/NotificationsPage';
import ForgetPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

import VerifyResetOtp from './components/auth/VerifyResetOtp';
import EditProperty from './pages/Properties/EditProperty';
import PostsFeed from './pages/posts/PostsFeed';
import CreatePost from './pages/posts/CreatePost';
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loader while checking token/user
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // After loading, if no user → redirect
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};
// Owner Only Route
const OwnerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        
      </div>
    );
  }
  
  return user && user.userType === 'owner' ? children : <Navigate to="/dashboard" />;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
};
  

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
           <SocketProvider>
          <div className="App">
             
            {!hideNavbar && <Navbar/>}
            <div className="main-content ">
            <Routes>
              <Route path="/" element={
            
                  <>
                   <LandingPage  />
                  <Features />
                 <DownloadApp />
                  <Footer />
                  </>
                  }/>
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              
              {/* Public routes (only accessible when not logged in) */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgetPassword/>
                </PublicRoute>
              } />

              <Route path="/verify-reset-otp" element={
                <PublicRoute>
                  <VerifyResetOtp/>
                </PublicRoute>
              } />

              <Route path="/reset-password" element={
                <PublicRoute>
                  <ResetPassword/>
                </PublicRoute>
              } />
              
              
              {/* Protected routes (only accessible when logged in) */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard className='pt-44'/>
                </ProtectedRoute>
              } />
              <Route path="/add-property" element={
                <OwnerRoute>
                  <AddProperty />
                </OwnerRoute>
              } />
              <Route path="/edit-property/:id" element={
                <OwnerRoute>
                  <EditProperty/>
                </OwnerRoute>
              } />
              <Route path="/kyc-verify" element={
                <ProtectedRoute>
                 <Kycverification/>
          </ProtectedRoute>
              } />
              <Route path="/kyc-admin" element={
               <ProtectedRoute>
                 <Adminkyc/>
                 </ProtectedRoute>
        
              } />
              <Route path="/kyc-waiting" element={
               <ProtectedRoute>
                 <KycWaiting/>
                 </ProtectedRoute>
        
              } />
              <Route path="/subscription" element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              } />
               <Route path="/videotour-guide" element={
                  <>
                  <LiveVideoTourinstructions />
                </>
              } />
              <Route path="/roommateMatches" element={
                <ProtectedRoute>
                  <RoommateMatches />
                </ProtectedRoute>
              } />
               <Route path="/profile/:id" element={
                <ProtectedRoute>
                  <ProfileInDetail />
                </ProtectedRoute>
              } />

              <Route path="/booking-checkout" element={
                <ProtectedRoute>
                  <BookingCheckOut />
                </ProtectedRoute>
              } />
              <Route path="/payment-success" element={
                  <PublicRoute>
                  <PaymentSuccess />
                 </PublicRoute>
              } />
              <Route path="/owner-bookings" element={
                 <ProtectedRoute>
                  <OwnerBookings/>
                 </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } />
              <Route path="/posts" element={
                <ProtectedRoute>
                <PostsFeed />
               </ProtectedRoute>
              } />

             <Route path="/create-post" element={
               <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
              } />
              
              
            </Routes>
            </div>
            <ToastContainer position="bottom-right" />
          </div>
           </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;