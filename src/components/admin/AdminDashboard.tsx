import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { FTP, Registration, UserProfile } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Download,
  Search,
  Eye,
  Calendar,
  Building,
  User,
  FileText,
  Image,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'programs' | 'reports' | 'admin'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [ftps, setFtps] = useState<(FTP & { id: string })[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedFTP, setSelectedFTP] = useState<(FTP & { id: string }) | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      fetchAllData();
    }
  }, [userProfile]);

  const createAdminUser = async () => {
    setCreatingAdmin(true);
    try {
      // Create admin profile directly in Firestore
      const adminProfile = {
        name: 'System Administrator',
        department: 'Administration',
        staffCode: 'ADMIN001',
        phone: '+91-9876543210',
        areasOfInterest: ['System Administration', 'Faculty Development'],
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Use a fixed admin user ID
      const adminUserId = 'admin-user-001';
      await setDoc(doc(db, 'profiles', adminUserId), adminProfile);
      
      alert('Admin credentials created!\nEmail: admin@ultron.edu\nPassword: admin123\n\nNote: This is for demo purposes. In production, use proper authentication.');
      
      fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error creating admin user:', error);
      alert('Failed to create admin user');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const usersQuery = query(collection(db, 'profiles'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as UserProfile[];
      setUsers(usersData);

      // Fetch all FTPs
      const ftpsQuery = query(collection(db, 'ftps'), orderBy('createdAt', 'desc'));
      const ftpsSnapshot = await getDocs(ftpsQuery);
      const ftpsData = ftpsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: new Date(doc.data().startDate),
        endDate: new Date(doc.data().endDate),
        createdAt: new Date(doc.data().createdAt)
      })) as (FTP & { id: string })[];
      setFtps(ftpsData);

      // Fetch all registrations
      const registrationsQuery = query(collection(db, 'registrations'), orderBy('registeredAt', 'desc'));
      const registrationsSnapshot = await getDocs(registrationsQuery);
      const registrationsData = registrationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredAt: new Date(doc.data().registeredAt)
      })) as Registration[];
      setRegistrations(registrationsData);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadAllReports = () => {
    // Generate comprehensive CSV report
    const csvContent = [
      ['Program Name', 'Speaker', 'Department', 'Start Date', 'End Date', 'Participants', 'Completed', 'Status'].join(','),
      ...ftps.map(ftp => {
        const ftpRegistrations = registrations.filter(r => r.ftpId === ftp.id);
        const completed = ftpRegistrations.filter(r => r.attendanceStatus === 'completed').length;
        return [
          ftp.programName,
          ftp.speakerName,
          ftp.conductingDepartment,
          format(ftp.startDate, 'yyyy-MM-dd'),
          format(ftp.endDate, 'yyyy-MM-dd'),
          ftpRegistrations.length,
          completed,
          ftp.status
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ULTRON_FTP_Complete_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.staffCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFTPs = ftps.filter(ftp =>
    ftp.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ftp.speakerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ftp.conductingDepartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (userProfile?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h3>
          <p className="text-slate-500">You don't have admin privileges to access this page.</p>
        </div>
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600 text-lg">Manage all ULTRON FTP activities</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{ftps.length}</div>
            <div className="text-sm text-gray-600">Total Programs</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{registrations.length}</div>
            <div className="text-sm text-gray-600">Total Registrations</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {registrations.filter(r => r.attendanceStatus === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Certificates Issued</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 sm:space-x-6 mb-8 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'programs', label: 'Programs', icon: BookOpen },
          { id: 'reports', label: 'Reports', icon: Download },
          { id: 'admin', label: 'Admin', icon: UserPlus }
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

      {/* Search */}
      {(activeTab === 'users' || activeTab === 'programs') && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ftps.slice(0, 5).map(ftp => (
                  <div key={ftp.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{ftp.programName}</h4>
                      <p className="text-sm text-slate-600">
                        {ftp.speakerName} • {format(ftp.startDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ftp.status === 'published' ? 'bg-green-100 text-green-800' :
                      ftp.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ftp.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          {filteredUsers.map((user, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-slate-900">{user.name}</h4>
                      <p className="text-sm text-slate-600">{user.department}</p>
                      <p className="text-sm text-slate-500">Staff Code: {user.staffCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">{user.phone}</p>
                    <p className="text-xs text-slate-500">
                      Joined: {format(user.createdAt, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="space-y-4">
          {filteredFTPs.map((ftp) => (
            <Card key={ftp.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 mb-2">{ftp.programName}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {ftp.speakerName}
                      </div>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        {ftp.conductingDepartment}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(ftp.startDate, 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {registrations.filter(r => r.ftpId === ftp.id).length} registered
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {ftp.galleryPhotos && ftp.galleryPhotos.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedFTP(ftp);
                          setShowGallery(true);
                        }}
                      >
                        <Image className="h-4 w-4 mr-1" />
                        Gallery ({ftp.galleryPhotos.length})
                      </Button>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ftp.status === 'published' ? 'bg-green-100 text-green-800' :
                      ftp.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ftp.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Generate Reports</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={downloadAllReports}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Complete Report</span>
                </Button>
                <p className="text-sm text-slate-600">
                  Download a comprehensive CSV report containing all programs, participants, and completion statistics.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Admin Management</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Create Admin Credentials</h4>
                  <p className="text-blue-700 text-sm mb-4">
                    Create admin login credentials for system administration.
                  </p>
                  <Button
                    onClick={createAdminUser}
                    loading={creatingAdmin}
                    className="flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Create Admin User</span>
                  </Button>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">Demo Admin Credentials</h4>
                  <div className="text-amber-800 text-sm space-y-1">
                    <p><strong>Email:</strong> admin@ultron.edu</p>
                    <p><strong>Password:</strong> admin123</p>
                    <p className="text-xs mt-2 opacity-75">
                      Note: These are demo credentials. In production, implement proper authentication.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && selectedFTP && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowGallery(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedFTP.programName} - Gallery</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowGallery(false)}
                  className="text-2xl"
                >
                  ×
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedFTP.galleryPhotos?.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};