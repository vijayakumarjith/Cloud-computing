import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { FTPManagementModal } from '../ftp/FTPManagementModal';
import { ProfileSetupModal } from '../profile/ProfileSetupModal';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FTP } from '../../types';
import { 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  Plus, 
  Menu,
  X,
  GraduationCap,
  BookOpen,
  Shield
} from 'lucide-react';

interface HeaderProps {
  onCreateFTP: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateFTP }) => {
  const { currentUser, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMyFTPs, setShowMyFTPs] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [myFTPs, setMyFTPs] = useState<(FTP & { id: string })[]>([]);
  const [selectedFTP, setSelectedFTP] = useState<(FTP & { id: string }) | null>(null);
  const [showManagementModal, setShowManagementModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchMyFTPs();
    }
  }, [currentUser]);

  const fetchMyFTPs = async () => {
    if (!currentUser) return;
    
    try {
      const q = query(collection(db, 'ftps'), where('createdBy', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const ftpData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: new Date(doc.data().startDate),
        endDate: new Date(doc.data().endDate),
        createdAt: new Date(doc.data().createdAt)
      })) as (FTP & { id: string })[];
      
      setMyFTPs(ftpData);
    } catch (error) {
      console.error('Error fetching my FTPs:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ULTRON FTP
                </h1>
                <p className="text-xs text-slate-500">Faculty Professional Development</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button
                onClick={onCreateFTP}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Create Program</span>
              </Button>

              {myFTPs.length > 0 && (
                <Button
                  onClick={() => setShowMyFTPs(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>My Programs</span>
                </Button>
              )}

              {userProfile?.role === 'admin' && (
                <Button
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  className="flex items-center space-x-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              )}

              <button className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </button>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.name}
                      className="h-8 w-8 rounded-full object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-slate-900">
                      {userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-slate-500">{userProfile?.department}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-200 sm:hidden">
                      <p className="text-sm font-medium text-slate-900">
                        {userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500">{userProfile?.department}</p>
                    </div>
                    <button 
                      onClick={() => setShowProfileSetup(true)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Button
                onClick={() => {
                  onCreateFTP();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4" />
                <span>Create Program</span>
              </Button>
              
              {myFTPs.length > 0 && (
                <Button
                  onClick={() => {
                    setShowMyFTPs(true);
                    setShowMobileMenu(false);
                  }}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>My Programs</span>
                </Button>
              )}

              {userProfile?.role === 'admin' && (
                <Button
                  onClick={() => {
                    navigate('/admin');
                    setShowMobileMenu(false);
                  }}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Button>
              )}
              
              <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.name}
                    className="h-10 w-10 rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-900">
                    {userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0]}
                  </p>
                  <p className="text-sm text-slate-500">{userProfile?.department}</p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowProfileSetup(true);
                  setShowMobileMenu(false);
                }}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Profile Settings</span>
              </Button>

              <button
                onClick={() => {
                  handleSignOut();
                  setShowMobileMenu(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-slate-100 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop for mobile menu */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Backdrop for user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* My FTPs Modal */}
      <Modal 
        isOpen={showMyFTPs} 
        onClose={() => setShowMyFTPs(false)} 
        title="My Programs" 
        maxWidth="lg"
      >
        <div className="space-y-4">
          {myFTPs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You haven't created any programs yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myFTPs.map((ftp) => (
                <Card key={ftp.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{ftp.programName}</h4>
                        <p className="text-sm text-gray-600">
                          {ftp.speakerName} • {ftp.duration} day{ftp.duration > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(ftp.startDate, 'MMM dd, yyyy')} - {format(ftp.endDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ftp.status === 'published' ? 'bg-green-100 text-green-800' :
                          ftp.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          ftp.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {ftp.status}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedFTP(ftp);
                            setShowMyFTPs(false);
                            setShowManagementModal(true);
                          }}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* FTP Management Modal */}
      {selectedFTP && (
        <FTPManagementModal
          isOpen={showManagementModal}
          onClose={() => {
            setShowManagementModal(false);
            setSelectedFTP(null);
          }}
          ftp={selectedFTP}
        />
      )}

      {/* Profile Setup Modal */}
      <ProfileSetupModal 
        isOpen={showProfileSetup} 
        onClose={() => setShowProfileSetup(false)} 
      />
    </>
  );
};