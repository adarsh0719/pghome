import React from 'react';
import { Routes,Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
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
// Context
import { AuthProvider, useAuth } from './context/AuthContext';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
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
              
              {/* Protected routes (only accessible when logged in) */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/add-property" element={
                <OwnerRoute>
                  <AddProperty />
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
              <Route path="/subscription" element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              } />
               <Route path="/videotour-guide" element={
                  <PublicRoute>
                  <LiveVideoTourinstructions />
              </PublicRoute>
              } />
              <Route path="/roommateMatches" element={
                <ProtectedRoute>
                  <RoommateMatches />
                </ProtectedRoute>
              } />
            </Routes>
            <ToastContainer position="bottom-right" />
          </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;