import React from 'react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { FTP } from '../../types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  User,
  Building,
  Star,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

interface FTPCardProps {
  ftp: FTP & { id: string };
  onRegister?: (ftpId: string) => void;
  onViewDetails?: (ftpId: string) => void;
  showCertificate?: boolean;
  onDownloadCertificate?: (ftpId: string) => void;
  isRegistered?: boolean;
  registrationStatus?: 'registered' | 'attended' | 'completed';
}

export const FTPCard: React.FC<FTPCardProps> = ({
  ftp,
  onRegister,
  onViewDetails,
  showCertificate = false,
  onDownloadCertificate,
  isRegistered = false,
  registrationStatus = 'registered'
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRegistrationStatusColor = (status: string) => {
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
    <Card hover className="overflow-hidden">
      <div className="relative">
        {ftp.brochureURL ? (
          <img
            src={ftp.brochureURL}
            alt={ftp.programName}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Building className="h-16 w-16 text-white opacity-50" />
          </div>
        )}
        
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ftp.status)}`}>
            {ftp.status}
          </span>
        </div>

        {isRegistered && (
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRegistrationStatusColor(registrationStatus)}`}>
              {registrationStatus}
            </span>
          </div>
        )}

        {ftp.hasRegistrationFee && (
          <div className="absolute bottom-4 right-4 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
            Paid Event
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {ftp.programName}
          </h3>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <User className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">{ftp.speakerName}</span>
            <span className="mx-2">•</span>
            <span>{ftp.speakerDesignation}</span>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
            <span>
              {format(ftp.startDate, 'MMM dd, yyyy')} - {format(ftp.endDate, 'MMM dd, yyyy')}
            </span>
          </div>

          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
            <span>{ftp.duration} day{ftp.duration > 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center">
            <Building className="h-4 w-4 mr-3 text-purple-500 flex-shrink-0" />
            <span>{ftp.conductingDepartment}</span>
          </div>

          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-3 text-red-500 flex-shrink-0" />
            <span className="truncate">{ftp.venue}</span>
          </div>

          <div className="flex items-center">
            <Users className="h-4 w-4 mr-3 text-amber-500 flex-shrink-0" />
            <span>Max {ftp.maxParticipants} participants</span>
          </div>
        </div>

        <p className="text-gray-700 mt-4 text-sm line-clamp-3">
          {ftp.description}
        </p>
      </CardContent>

      <CardFooter className="px-6 py-4 space-y-3">
        {showCertificate && registrationStatus === 'completed' ? (
          <Button
            onClick={() => onDownloadCertificate?.(ftp.id)}
            variant="secondary"
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            <Download className="h-4 w-4" />
            <span>Download Certificate</span>
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={() => onViewDetails?.(ftp.id)}
              variant="outline"
              size="sm"
              className="flex-1 w-full"
            >
              View Details
            </Button>
            {!isRegistered && ftp.status === 'published' && onRegister && (
              <Button
                onClick={() => onRegister(ftp.id)}
                size="sm"
                className="flex-1 w-full"
              >
                Register
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};