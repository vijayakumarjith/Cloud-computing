import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { UserProfile } from '../../types';
import { User, Phone, Building, Hash, Upload, AlertCircle } from 'lucide-react';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    department: '',
    staffCode: '',
    phone: '',
    areasOfInterest: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setError('');

    try {
      let photoURL = '';
      
      if (photoFile) {
        console.log('Uploading photo...');
        const timestamp = Date.now();
        const fileName = `${timestamp}_${photoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const photoRef = ref(storage, `profiles/${currentUser.uid}/${fileName}`);
        const uploadResult = await uploadBytes(photoRef, photoFile);
        photoURL = await getDownloadURL(uploadResult.ref);
        console.log('Photo uploaded successfully:', photoURL);
      }

      const profile: UserProfile = {
        name: formData.name.trim(),
        department: formData.department.trim(),
        staffCode: formData.staffCode.trim(),
        phone: formData.phone.trim(),
        photoURL,
        areasOfInterest: formData.areasOfInterest
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Saving profile to Firestore:', profile);
      await setDoc(doc(db, 'profiles', currentUser.uid), {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Profile saved successfully');
      
      await refreshProfile();
      console.log('Profile refreshed');
      
      onClose();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      let errorMessage = 'Failed to create profile. Please try again.';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Permission denied. Please check your Firebase storage rules.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your Firestore security rules.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      if (error) setError('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Complete Your Profile" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <p className="text-slate-600 mb-6">Please complete your profile to get started with ULTRON FTP</p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <User className="absolute left-3 top-10 text-slate-400 h-5 w-5" />
            <Input
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Building className="absolute left-3 top-10 text-slate-400 h-5 w-5" />
            <Input
              name="department"
              label="Department"
              placeholder="e.g., Computer Science"
              value={formData.department}
              onChange={handleChange}
              required
              className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Hash className="absolute left-3 top-10 text-slate-400 h-5 w-5" />
            <Input
              name="staffCode"
              label="Staff Code"
              placeholder="Enter your staff code"
              value={formData.staffCode}
              onChange={handleChange}
              required
              className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-10 text-slate-400 h-5 w-5" />
            <Input
              name="phone"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Profile Photo (Optional)
            </label>
            <div className="flex items-center space-x-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-500 mt-1">Max size: 5MB. Supported: JPG, PNG, GIF</p>
              </div>
            </div>
          </div>

          <TextArea
            name="areasOfInterest"
            label="Areas of Interest / Specialization"
            placeholder="Enter your areas of interest separated by commas (e.g., Machine Learning, Web Development, Data Science)"
            value={formData.areasOfInterest}
            onChange={handleChange}
            hint="Separate multiple areas with commas"
            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="submit"
            loading={loading}
            className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Complete Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};