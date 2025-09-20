export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  name: string;
  department: string;
  staffCode: string;
  phone: string;
  photoURL?: string;
  areasOfInterest: string[];
  role?: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface FTP {
  id?: string;
  programName: string;
  brochureURL?: string;
  galleryPhotos?: string[];
  speakerName: string;
  speakerDesignation: string;
  hasRegistrationFee: boolean;
  registrationFee?: number;
  upiId?: string;
  duration: number;
  conductingDepartment: string;
  venue: string;
  description: string;
  maxParticipants: number;
  certificateTemplateURL?: string;
  reportURL?: string;
  createdBy: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
}

export interface Registration {
  id?: string;
  ftpId: string;
  userId: string;
  userName: string;
  userDepartment: string;
  userStaffCode: string;
  userPhone: string;
  transactionId?: string;
  willingnessConfirmed: boolean;
  registeredAt: Date;
  attendanceStatus: 'registered' | 'attended' | 'completed';
  certificateGenerated: boolean;
}

export interface Attendance {
  id?: string;
  ftpId: string;
  userId: string;
  day: number;
  markedAt: Date;
  markedBy: string;
  qrCodeUsed?: boolean;
}