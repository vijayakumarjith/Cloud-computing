import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { FTP, Registration } from '../../types';
import { DashboardStats } from './DashboardStats';
import { FTPCard } from './FTPCard';
import { FTPDetailsModal } from './FTPDetailsModal';
import { RegistrationModal } from './RegistrationModal';
import { generateCertificate } from './CertificateGenerator';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ProfileSetupModal } from '../profile/ProfileSetupModal';
import { 
  Search, 
  Filter, 
  Calendar,
  Building,
  Users,
  Trophy,
  BookOpen,
  Plus
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [ftps, setFtps] = useState<(FTP & { id: string })[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'registered' | 'completed'>('upcoming');
  const [selectedFTP, setSelectedFTP] = useState<(FTP & { id: string }) | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    fetchFTPs();
    if (currentUser) {
      fetchRegistrations();
      checkForCompletedPrograms();
    }
  }, [currentUser]);

  useEffect(() => {
    // Show profile setup if user doesn't have a complete profile
    if (currentUser && !userProfile) {
      setShowProfileSetup(true);
    }
  }, [currentUser, userProfile]);
  const checkForCompletedPrograms = async () => {
    if (!currentUser || !userProfile) return;
    
    try {
      const q = query(
        collection(db, 'registrations'), 
        where('userId', '==', currentUser.uid),
        where('attendanceStatus', '==', 'attended')
      );
      const querySnapshot = await getDocs(q);
      
      for (const regDoc of querySnapshot.docs) {
        const registration = regDoc.data() as Registration;
        const ftp = ftps.find(f => f.id === registration.ftpId);
        
        if (ftp && new Date() > ftp.endDate) {
          // Program has ended, mark as completed and generate certificate
          await updateDoc(doc(db, 'registrations', regDoc.id), {
            attendanceStatus: 'completed',
            certificateGenerated: true,
            updatedAt: serverTimestamp()
          });
          
          // Auto-generate certificate
          const certificateData = {
            participantName: userProfile.name,
            programName: ftp.programName,
            speakerName: ftp.speakerName,
            speakerDesignation: ftp.speakerDesignation,
            duration: ftp.duration,
            completionDate: format(ftp.endDate, 'MMMM dd, yyyy'),
            conductingDepartment: ftp.conductingDepartment
          };
          
          await generateCertificate(certificateData);
        }
      }
      
      // Refresh registrations after updates
      fetchRegistrations();
    } catch (error) {
      console.error('Error checking completed programs:', error);
    }
  };

  const fetchFTPs = async () => {
    try {
      const q = query(collection(db, 'ftps'), where('status', '==', 'published'));
      const querySnapshot = await getDocs(q);
      const ftpData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: new Date(doc.data().startDate),
        endDate: new Date(doc.data().endDate),
        createdAt: new Date(doc.data().createdAt)
      })) as (FTP & { id: string })[];
      
      // Sort by start date (newest first)
      const sortedFtps = ftpData.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
      setFtps(sortedFtps);
    } catch (error) {
      console.error('Error fetching FTPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    if (!currentUser) return;
    
    try {
      const q = query(collection(db, 'registrations'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const registrationData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredAt: new Date(doc.data().registeredAt)
      })) as Registration[];
      
      setRegistrations(registrationData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const filteredFTPs = ftps.filter(ftp => {
    const matchesSearch = ftp.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ftp.speakerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ftp.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filterDepartment || ftp.conductingDepartment === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(new Set(ftps.map(ftp => ftp.conductingDepartment)));

  const handleRegister = (ftpId: string) => {
    const ftp = ftps.find(f => f.id === ftpId);
    if (ftp) {
      setSelectedFTP(ftp);
      setShowRegistrationModal(true);
    }
  };

  const handleViewDetails = (ftpId: string) => {
    const ftp = ftps.find(f => f.id === ftpId);
    if (ftp) {
      setSelectedFTP(ftp);
      setShowDetailsModal(true);
    }
  };

  const handleRegistrationComplete = () => {
    fetchRegistrations();
    fetchFTPs(); // Refresh FTPs to update any changes
    setShowRegistrationModal(false);
    setSelectedFTP(null);
  };

  const handleDownloadCertificate = async (ftpId: string) => {
    const ftp = ftps.find(f => f.id === ftpId);
    const registration = registrations.find(r => r.ftpId === ftpId);
    
    if (ftp && registration && userProfile) {
      const certificateData = {
        participantName: userProfile.name,
        programName: ftp.programName,
        speakerName: ftp.speakerName,
        speakerDesignation: ftp.speakerDesignation,
        duration: ftp.duration,
        completionDate: format(ftp.endDate, 'MMMM dd, yyyy'),
        conductingDepartment: ftp.conductingDepartment
      };
      
      await generateCertificate(certificateData);
    }
  };

  const isRegistered = (ftpId: string) => {
    return registrations.some(reg => reg.ftpId === ftpId);
  };

  const getRegistrationStatus = (ftpId: string) => {
    const registration = registrations.find(reg => reg.ftpId === ftpId);
    return registration?.attendanceStatus || 'registered';
  };

  // Don't render dashboard if user doesn't have profile
  if (currentUser && !userProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Complete Your Profile</h3>
          <p className="text-slate-500 mb-6">Please complete your profile to access ULTRON FTP features.</p>
          <Button onClick={() => setShowProfileSetup(true)}>
            Complete Profile
          </Button>
        </div>
        <ProfileSetupModal 
          isOpen={showProfileSetup} 
          onClose={() => setShowProfileSetup(false)} 
        />
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Welcome back, {userProfile?.name || 'Faculty Member'}!
        </h1>
        <p className="text-slate-600 text-lg">
          Continue your professional development journey with ULTRON FTP
        </p>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Navigation Tabs */}
      <div className="flex space-x-2 sm:space-x-6 mb-8 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'upcoming', label: 'Explore Programs', icon: BookOpen },
          { id: 'registered', label: 'My Registrations', icon: Users },
          { id: 'completed', label: 'Certificates', icon: Trophy }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-3 sm:px-6 py-4 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'upcoming' && (
        <div>
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search programs by name, speaker, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="w-full sm:w-64 relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Available Training Programs
            </h2>
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {filteredFTPs.length} program{filteredFTPs.length !== 1 ? 's' : ''} available
            </span>
          </div>

          {filteredFTPs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Programs Found</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                {searchTerm || filterDepartment 
                  ? "No programs match your current search criteria. Try adjusting your filters."
                  : "No training programs are currently available. Check back soon for new opportunities!"
                }
              </p>
              {(searchTerm || filterDepartment) && (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDepartment('');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFTPs.map((ftp) => (
                <FTPCard
                  key={ftp.id}
                  ftp={ftp}
                  onRegister={handleRegister}
                  onViewDetails={handleViewDetails}
                  isRegistered={isRegistered(ftp.id)}
                  registrationStatus={getRegistrationStatus(ftp.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'registered' && (
        <div>
          {registrations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Registrations Yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                You haven't registered for any programs yet. Explore our available training programs to get started on your professional development journey!
              </p>
              <Button 
                onClick={() => setActiveTab('upcoming')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Explore Programs
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">My Registrations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {registrations.map((registration) => {
                  const ftp = ftps.find(f => f.id === registration.ftpId);
                  if (!ftp) return null;
                  
                  return (
                    <FTPCard
                      key={registration.id}
                      ftp={ftp}
                      onViewDetails={handleViewDetails}
                      isRegistered={true}
                      registrationStatus={registration.attendanceStatus}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div>
          {registrations.filter(r => r.attendanceStatus === 'completed').length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-12 w-12 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Certificates Yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Complete training programs to earn certificates that showcase your professional development achievements.
              </p>
              <Button 
                onClick={() => setActiveTab('upcoming')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">My Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {registrations
                  .filter(r => r.attendanceStatus === 'completed')
                  .map((registration) => {
                    const ftp = ftps.find(f => f.id === registration.ftpId);
                    if (!ftp) return null;
                    
                    return (
                      <FTPCard
                        key={registration.id}
                        ftp={ftp}
                        onViewDetails={handleViewDetails}
                        showCertificate={true}
                        onDownloadCertificate={handleDownloadCertificate}
                        isRegistered={true}
                        registrationStatus={registration.attendanceStatus}
                      />
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedFTP && (
        <>
          <FTPDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedFTP(null);
            }}
            ftp={selectedFTP}
            isRegistered={isRegistered(selectedFTP.id)}
            onRegister={() => {
              setShowDetailsModal(false);
              setShowRegistrationModal(true);
            }}
          />
          
          <RegistrationModal
            isOpen={showRegistrationModal}
            onClose={() => {
              setShowRegistrationModal(false);
              setSelectedFTP(null);
            }}
            ftp={selectedFTP}
            onComplete={handleRegistrationComplete}
          />
        </>
      )}
    </div>
  );
};