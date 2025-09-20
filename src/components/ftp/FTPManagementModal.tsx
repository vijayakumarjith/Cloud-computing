import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { FTP, Registration } from '../../types';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  FileText,
  Upload,
  Download,
  Search,
  UserCheck,
  Camera
} from 'lucide-react';
import { format } from 'date-fns';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';

interface FTPManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  ftp: FTP & { id: string };
}

export const FTPManagementModal: React.FC<FTPManagementModalProps> = ({
  isOpen,
  onClose,
  ftp
}) => {
  const { currentUser } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'participants' | 'attendance' | 'reports' | 'media'>('participants');
  const [uploadingReport, setUploadingReport] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    if (isOpen && ftp) {
      fetchRegistrations();
    }
  }, [isOpen, ftp]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'registrations'), where('ftpId', '==', ftp.id));
      const querySnapshot = await getDocs(q);
      const registrationData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredAt: new Date(doc.data().registeredAt)
      })) as Registration[];
      
      setRegistrations(registrationData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (registrationId: string, status: 'attended' | 'completed') => {
    try {
      await updateDoc(doc(db, 'registrations', registrationId), {
        attendanceStatus: status
      });
      
      // If marking as completed, auto-generate certificate
      if (status === 'completed') {
        const registration = registrations.find(r => r.id === registrationId);
        if (registration) {
          // Import the certificate generator
          const { generateCertificate } = await import('../dashboard/CertificateGenerator');
          const certificateData = {
            participantName: registration.userName,
            programName: ftp.programName,
            speakerName: ftp.speakerName,
            speakerDesignation: ftp.speakerDesignation,
            duration: ftp.duration,
            completionDate: format(new Date(), 'MMMM dd, yyyy'),
            conductingDepartment: ftp.conductingDepartment
          };
          
          await generateCertificate(certificateData);
        }
      }
      
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReport(true);
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const reportRef = ref(storage, `ftps/reports/${ftp.id}/${fileName}`);
      await uploadBytes(reportRef, file);
      const reportURL = await getDownloadURL(reportRef);
      
      // Update FTP document with report URL
      await updateDoc(doc(db, 'ftps', ftp.id), {
        reportURL
      });
      
      alert('Report uploaded successfully!');
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Failed to upload report');
    } finally {
      setUploadingReport(false);
    }
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const uploadPromises = files.map(async (file, index) => {
        const timestamp = Date.now();
        const fileName = `${timestamp}_gallery_${index}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const photoRef = ref(storage, `ftps/gallery/${ftp.id}/${fileName}`);
        await uploadBytes(photoRef, file);
        return await getDownloadURL(photoRef);
      });
      
      const photoURLs = await Promise.all(uploadPromises);
      
      // Update FTP document with gallery photos
      await updateDoc(doc(db, 'ftps', ftp.id), {
        galleryPhotos: [...(ftp.galleryPhotos || []), ...photoURLs]
      });
      
      alert('Photos uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
    }
  };
  const filteredRegistrations = registrations.filter(reg =>
    reg.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.userDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.userStaffCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-100 text-blue-800';
      case 'attended':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage: ${ftp.programName}`} maxWidth="xl">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{registrations.length}</div>
              <div className="text-sm text-gray-600">Total Registered</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <UserCheck className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {registrations.filter(r => r.attendanceStatus === 'attended').length}
              </div>
              <div className="text-sm text-gray-600">Attended</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {registrations.filter(r => r.attendanceStatus === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 sm:space-x-4 border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'participants', label: 'Participants', icon: Users },
            { id: 'attendance', label: 'Attendance', icon: UserCheck },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'media', label: 'Media', icon: Camera }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content based on active tab */}
        {activeTab === 'participants' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Registered Participants</h3>
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No participants found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRegistrations.map((registration) => (
                  <Card key={registration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{registration.userName}</h4>
                          <p className="text-sm text-gray-600">
                            {registration.userDepartment} • {registration.userStaffCode}
                          </p>
                          <p className="text-sm text-gray-500">
                            Registered: {format(registration.registeredAt, 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.attendanceStatus)}`}>
                            {registration.attendanceStatus}
                          </span>
                          <div className="text-sm text-gray-600">
                            {registration.userPhone}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mark Attendance</h3>
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No participants found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRegistrations.map((registration) => (
                  <Card key={registration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{registration.userName}</h4>
                          <p className="text-sm text-gray-600">
                            {registration.userDepartment} • {registration.userStaffCode}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.attendanceStatus)}`}>
                            {registration.attendanceStatus}
                          </span>
                          <div className="flex space-x-2">
                            {registration.attendanceStatus === 'registered' && (
                              <Button
                                size="sm"
                                onClick={() => markAttendance(registration.id!, 'attended')}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Mark Attended
                              </Button>
                            )}
                            {registration.attendanceStatus === 'attended' && (
                              <Button
                                size="sm"
                                onClick={() => markAttendance(registration.id!, 'completed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Completed
                              </Button>
                            )}
                            {registration.attendanceStatus === 'completed' && (
                              <span className="text-green-600 text-sm font-medium">
                                ✓ Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Program Reports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <h4 className="font-medium">Attendance Report</h4>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Registered:</span>
                      <span className="font-medium">{registrations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attended:</span>
                      <span className="font-medium text-orange-600">
                        {registrations.filter(r => r.attendanceStatus === 'attended').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-medium text-green-600">
                        {registrations.filter(r => r.attendanceStatus === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completion Rate:</span>
                      <span className="font-medium">
                        {registrations.length > 0 
                          ? Math.round((registrations.filter(r => r.attendanceStatus === 'completed').length / registrations.length) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-4"
                    loading={uploadingReport}
                    onClick={() => {
                      // Generate CSV report
                      const csvContent = [
                        ['Name', 'Department', 'Staff Code', 'Phone', 'Status', 'Registered Date'].join(','),
                        ...registrations.map(r => [
                          r.userName,
                          r.userDepartment,
                          r.userStaffCode,
                          r.userPhone,
                          r.attendanceStatus,
                          format(r.registeredAt, 'yyyy-MM-dd')
                        ].join(','))
                      ].join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${ftp.programName.replace(/\s+/g, '_')}_attendance_report.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h4 className="font-medium">Upload Program Report</h4>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Final Program Report
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleReportUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <Button size="sm" className="w-full" loading={uploadingReport} disabled>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingReport ? 'Uploading...' : 'Select file to upload'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Program Media</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <h4 className="font-medium">Upload Program Photos</h4>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Program Gallery Photos
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotosUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <Button size="sm" className="w-full" loading={uploadingPhotos} disabled>
                      <Camera className="h-4 w-4 mr-2" />
                      {uploadingPhotos ? 'Uploading...' : 'Select photos to upload'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {ftp.galleryPhotos && ftp.galleryPhotos.length > 0 && (
                <Card>
                  <CardHeader>
                    <h4 className="font-medium">Current Gallery ({ftp.galleryPhotos.length} photos)</h4>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {ftp.galleryPhotos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
        {/* Close Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};