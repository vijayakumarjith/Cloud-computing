import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { CreateFTPModal } from './components/ftp/CreateFTPModal';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ProfileSetupModal } from './components/profile/ProfileSetupModal';

const AppContent: React.FC = () => {
  const { currentUser, userProfile, loading } = useAuth();
  const [showCreateFTP, setShowCreateFTP] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <span className="text-3xl font-bold text-white">U</span>
          </div>
          <LoadingSpinner size="large" />
          <p className="text-slate-600 mt-6 text-lg">Loading ULTRON FTP...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header onCreateFTP={() => setShowCreateFTP(true)} />
        
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>

        {/* Profile Setup Modal */}
        <ProfileSetupModal 
          isOpen={showProfileSetup} 
          onClose={() => setShowProfileSetup(false)} 
        />

        {/* Create FTP Modal */}
        <CreateFTPModal 
          isOpen={showCreateFTP} 
          onClose={() => setShowCreateFTP(false)} 
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;