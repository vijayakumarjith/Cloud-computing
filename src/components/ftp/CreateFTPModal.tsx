import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { FTP } from '../../types';
import { 
  FileImage, 
  User, 
  Calendar, 
  MapPin, 
  Users,
  Building,
  Clock,
  DollarSign,
  Upload
} from 'lucide-react';

interface CreateFTPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateFTPModal: React.FC<CreateFTPModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    programName: '',
    speakerName: '',
    speakerDesignation: '',
    hasRegistrationFee: false,
    registrationFee: '',
    upiId: '9344022155',
    duration: '1',
    conductingDepartment: '',
    venue: '',
    description: '',
    maxParticipants: '50',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);

    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      const ftp: Omit<FTP, 'id'> = {
        programName: formData.programName,
        speakerName: formData.speakerName,
        speakerDesignation: formData.speakerDesignation,
        hasRegistrationFee: formData.hasRegistrationFee,
        registrationFee: formData.hasRegistrationFee ? parseFloat(formData.registrationFee) : undefined,
        upiId: formData.hasRegistrationFee ? formData.upiId : undefined,
        duration: parseInt(formData.duration),
        conductingDepartment: formData.conductingDepartment,
        venue: formData.venue,
        description: formData.description,
        maxParticipants: parseInt(formData.maxParticipants),
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        startDate,
        endDate,
        status: 'published'
      };

      await addDoc(collection(db, 'ftps'), {
        ...ftp,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating FTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      programName: '',
      speakerName: '',
      speakerDesignation: '',
      hasRegistrationFee: false,
      registrationFee: '',
      upiId: '9344022155',
      duration: '1',
      conductingDepartment: '',
      venue: '',
      description: '',
      maxParticipants: '50',
      startDate: '',
      endDate: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New FTP" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Program Name */}
          <div className="md:col-span-2">
            <Input
              name="programName"
              label="Program Name"
              placeholder="Enter the FTP program name"
              value={formData.programName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Speaker Details */}
          <div className="relative">
            <User className="absolute left-3 top-10 text-gray-400 h-5 w-5" />
            <Input
              name="speakerName"
              label="Speaker Name"
              placeholder="Speaker's full name"
              value={formData.speakerName}
              onChange={handleChange}
              required
              className="pl-10"
            />
          </div>

          <Input
            name="speakerDesignation"
            label="Speaker Designation"
            placeholder="e.g., Professor, Industry Expert"
            value={formData.speakerDesignation}
            onChange={handleChange}
            required
          />

          {/* Department and Venue */}
          <div className="relative">
            <Building className="absolute left-3 top-10 text-gray-400 h-5 w-5" />
            <Input
              name="conductingDepartment"
              label="Conducting Department"
              placeholder="Department organizing the FTP"
              value={formData.conductingDepartment}
              onChange={handleChange}
              required
              className="pl-10"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-10 text-gray-400 h-5 w-5" />
            <Input
              name="venue"
              label="Venue"
              placeholder="Location where FTP will be held"
              value={formData.venue}
              onChange={handleChange}
              required
              className="pl-10"
            />
          </div>

          {/* Duration and Participants */}
          <div className="relative">
            <Clock className="absolute left-3 top-10 text-gray-400 h-5 w-5" />
            <Input
              name="duration"
              type="number"
              label="Duration (Days)"
              placeholder="Number of days"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-10 text-gray-400 h-5 w-5" />
            <Input
              name="maxParticipants"
              type="number"
              label="Maximum Participants"
              placeholder="Maximum number of participants"
              value={formData.maxParticipants}
              onChange={handleChange}
              required
              min="1"
              className="pl-10"
            />
          </div>

          {/* Date Range */}
          <div className="relative">
            <Calendar className="absolute left-3 top-10 text-gray-400 h-5 w-5" />
            <Input
              name="startDate"
              type="date"
              label="Start Date"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-10 text-gray-400 h-5 w-5" />
            <Input
              name="endDate"
              type="date"
              label="End Date"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="pl-10"
            />
          </div>
        </div>

        {/* Registration Fee */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="hasRegistrationFee"
              checked={formData.hasRegistrationFee}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              This program has a registration fee
            </label>
          </div>

          {formData.hasRegistrationFee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  name="registrationFee"
                  type="number"
                  placeholder="Registration fee amount"
                  value={formData.registrationFee}
                  onChange={handleChange}
                  required={formData.hasRegistrationFee}
                  className="pl-10"
                  step="0.01"
                />
              </div>
              <Input
                name="upiId"
                placeholder="UPI ID for payments"
                value={formData.upiId}
                onChange={handleChange}
                required={formData.hasRegistrationFee}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <TextArea
          name="description"
          label="Detailed Description / Agenda"
          placeholder="Provide a detailed description of the FTP program, including agenda, topics covered, etc."
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
        />


        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="px-8"
          >
            Create FTP
          </Button>
        </div>
      </form>
    </Modal>
  );
};