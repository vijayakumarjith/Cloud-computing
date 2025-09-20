import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FTP } from '../../types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  User,
  Building,
  DollarSign,
  FileText,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface FTPDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ftp: FTP & { id: string };
  isRegistered: boolean;
  onRegister: () => void;
}

export const FTPDetailsModal: React.FC<FTPDetailsModalProps> = ({
  isOpen,
  onClose,
  ftp,
  isRegistered,
  onRegister
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Program Details" maxWidth="lg">
      <div className="space-y-6">
        {/* Program Image */}
        {ftp.brochureURL && (
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <img
              src={ftp.brochureURL}
              alt={ftp.programName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Program Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{ftp.programName}</h2>
          <div className="flex items-center text-slate-600 mb-4">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            <span className="font-medium">{ftp.speakerName}</span>
            <span className="mx-2">•</span>
            <span>{ftp.speakerDesignation}</span>
          </div>
        </div>

        {/* Program Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center text-slate-700">
              <Calendar className="h-5 w-5 mr-3 text-blue-500" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-slate-600">
                  {format(ftp.startDate, 'MMM dd, yyyy')} - {format(ftp.endDate, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center text-slate-700">
              <Clock className="h-5 w-5 mr-3 text-green-500" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-slate-600">{ftp.duration} day{ftp.duration > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex items-center text-slate-700">
              <Building className="h-5 w-5 mr-3 text-purple-500" />
              <div>
                <p className="font-medium">Department</p>
                <p className="text-sm text-slate-600">{ftp.conductingDepartment}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-slate-700">
              <MapPin className="h-5 w-5 mr-3 text-red-500" />
              <div>
                <p className="font-medium">Venue</p>
                <p className="text-sm text-slate-600">{ftp.venue}</p>
              </div>
            </div>

            <div className="flex items-center text-slate-700">
              <Users className="h-5 w-5 mr-3 text-amber-500" />
              <div>
                <p className="font-medium">Participants</p>
                <p className="text-sm text-slate-600">Max {ftp.maxParticipants} participants</p>
              </div>
            </div>

            {ftp.hasRegistrationFee && (
              <div className="flex items-center text-slate-700">
                <DollarSign className="h-5 w-5 mr-3 text-green-600" />
                <div>
                  <p className="font-medium">Registration Fee</p>
                  <p className="text-sm text-slate-600">₹{ftp.registrationFee}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Program Description
          </h3>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{ftp.description}</p>
          </div>
        </div>

        {/* Registration Status */}
        {isRegistered && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">You are registered for this program</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!isRegistered && ftp.status === 'published' && (
            <Button onClick={onRegister}>
              Register Now
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};