import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Layout/Navbar';
import OfflineStatus from './components/common/OfflineStatus';
import LoadingSpinner from './components/common/LoadingSpinner';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Lazy Load Pages
const Footer = React.lazy(() => import('./pages/homepage/Footer'));
const Login = React.lazy(() => import('./components/auth/Login'));
const Register = React.lazy(() => import('./components/auth/Register'));
const Properties = React.lazy(() => import('./pages/Properties/Properties'));
const PropertyDetail = React.lazy(() => import('./pages/Properties/PropertyDetail'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AddProperty = React.lazy(() => import('./pages/Properties/AddProperty'));
const Subscription = React.lazy(() => import('./pages/Payment/Subscription'));
const Kycverification = React.lazy(() => import('./pages/kyc/KycForm'));
const Adminkyc = React.lazy(() => import('./pages/kyc/AdminKycList'));
const RoommateMatches = React.lazy(() => import('./pages/Roommate/RoommateMatches'));
const LiveVideoTourinstructions = React.lazy(() => import('./components/property/LiveVideoTourinstructions'));
const DownloadApp = React.lazy(() => import('./pages/homepage/DownloadApp'));
const Features = React.lazy(() => import('./pages/homepage/Features'));
const KycWaiting = React.lazy(() => import('./pages/kyc/KycWaiting'));
const LandingPage = React.lazy(() => import('./pages/Roommate/LandingPage'));
const ProfileInDetail = React.lazy(() => import('./pages/profileview/ProfileInDetail'));
const BookingCheckOut = React.lazy(() => import('./pages/Payment/BookingCheckOut'));
const PaymentSuccess = React.lazy(() => import('./pages/Payment/PaymentSuccess'));
const OwnerBookings = React.lazy(() => import('./pages/Payment/OwnerBookings'));
const NotificationsPage = React.lazy(() => import('./pages/notifypage/NotificationsPage'));
const ForgetPassword = React.lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./components/auth/ResetPassword'));
const VerifyResetOtp = React.lazy(() => import('./components/auth/VerifyResetOtp'));
const EditProperty = React.lazy(() => import('./pages/Properties/EditProperty'));
const PostsFeed = React.lazy(() => import('./pages/posts/PostsFeed'));
const CreatePost = React.lazy(() => import('./pages/posts/CreatePost'));
const AdminDashboard = React.lazy(() => import('./pages/Admin/AdminDashboard'));

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
            <OfflineStatus />

            {!hideNavbar && <Navbar />}
            <div className="main-content ">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={

                    <>
                      <LandingPage />
                      <Features />
                      <DownloadApp />
                      <Footer />
                    </>
                  } />
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
                      <ForgetPassword />
                    </PublicRoute>
                  } />

                  <Route path="/verify-reset-otp" element={
                    <PublicRoute>
                      <VerifyResetOtp />
                    </PublicRoute>
                  } />

                  <Route path="/reset-password" element={
                    <PublicRoute>
                      <ResetPassword />
                    </PublicRoute>
                  } />


                  {/* Protected routes (only accessible when logged in) */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard className='pt-44' />
                    </ProtectedRoute>
                  } />
                  <Route path="/add-property" element={
                    <OwnerRoute>
                      <AddProperty />
                    </OwnerRoute>
                  } />
                  <Route path="/edit-property/:id" element={
                    <OwnerRoute>
                      <EditProperty />
                    </OwnerRoute>
                  } />
                  <Route path="/kyc-verify" element={
                    <ProtectedRoute>
                      <Kycverification />
                    </ProtectedRoute>
                  } />
                  <Route path="/kyc-admin" element={
                    <ProtectedRoute>
                      <Adminkyc />
                    </ProtectedRoute>

                  } />
                  <Route path="/kyc-waiting" element={
                    <ProtectedRoute>
                      <KycWaiting />
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
                    <ProtectedRoute>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  } />
                  <Route path="/owner-bookings" element={
                    <ProtectedRoute>
                      <OwnerBookings />
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

                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />

                </Routes>
              </Suspense>
            </div>
            <ToastContainer position="bottom-right" />
          </div>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;