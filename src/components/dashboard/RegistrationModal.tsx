import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FTP, Registration } from '../../types';
import { 
  User, 
  Phone, 
  Building, 
  Hash, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  QrCode
} from 'lucide-react';
import QRCode from 'qrcode';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ftp: FTP & { id: string };
  onComplete: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  ftp,
  onComplete
}) => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [paymentQR, setPaymentQR] = useState<string>('');
  const [formData, setFormData] = useState({
    transactionId: '',
    willingnessConfirmed: false
  });

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ftp.hasRegistrationFee) {
      // Generate UPI payment QR code
      const upiString = `upi://pay?pa=${ftp.upiId}&pn=ULTRON FTP&am=${ftp.registrationFee}&cu=INR&tn=Registration for ${ftp.programName}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(upiString);
        setPaymentQR(qrDataUrl);
        setStep('payment');
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    } else {
      await completeRegistration();
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeRegistration();
  };

  const completeRegistration = async () => {
    if (!currentUser || !userProfile) return;

    setLoading(true);
    try {
      const registration: Omit<Registration, 'id'> = {
        ftpId: ftp.id,
        userId: currentUser.uid,
        userName: userProfile.name,
        userDepartment: userProfile.department,
        userStaffCode: userProfile.staffCode,
        userPhone: userProfile.phone,
        transactionId: ftp.hasRegistrationFee ? formData.transactionId : undefined,
        willingnessConfirmed: formData.willingnessConfirmed,
        registeredAt: new Date(),
        attendanceStatus: 'registered',
        certificateGenerated: false
      };

      await addDoc(collection(db, 'registrations'), {
        ...registration,
        registeredAt: new Date().toISOString()
      });

      setStep('success');
    } catch (error) {
      console.error('Error completing registration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSuccess = () => {
    onComplete();
    onClose();
    setStep('details');
    setFormData({ transactionId: '', willingnessConfirmed: false });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={step === 'success' ? handleSuccess : onClose} 
      title="Register for Program" 
      maxWidth="md"
    >
      {step === 'details' && (
        <form onSubmit={handleDetailsSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">{ftp.programName}</h3>
            <p className="text-blue-700 text-sm">
              Speaker: {ftp.speakerName} • Duration: {ftp.duration} day{ftp.duration > 1 ? 's' : ''}
            </p>
            {ftp.hasRegistrationFee && (
              <p className="text-blue-700 text-sm mt-2 font-medium">
                Registration Fee: ₹{ftp.registrationFee}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Your Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  value={userProfile?.name || ''}
                  disabled
                  className="pl-10 bg-slate-50"
                />
              </div>

              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  value={userProfile?.department || ''}
                  disabled
                  className="pl-10 bg-slate-50"
                />
              </div>

              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  value={userProfile?.staffCode || ''}
                  disabled
                  className="pl-10 bg-slate-50"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  value={userProfile?.phone || ''}
                  disabled
                  className="pl-10 bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="willingnessConfirmed"
                checked={formData.willingnessConfirmed}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label className="text-sm text-slate-700">
                I confirm my willingness to participate in this Faculty Training Program and understand the commitment required for successful completion.
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.willingnessConfirmed}>
              {ftp.hasRegistrationFee ? 'Proceed to Payment' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      )}

      {step === 'payment' && (
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Complete Payment</h3>
            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <p className="text-slate-700 mb-4">
                Scan the QR code below to pay ₹{ftp.registrationFee} using any UPI app
              </p>
              {paymentQR && (
                <div className="flex justify-center mb-4">
                  <img src={paymentQR} alt="Payment QR Code" className="w-48 h-48" />
                </div>
              )}
              <p className="text-sm text-slate-600">UPI ID: {ftp.upiId}</p>
            </div>
          </div>

          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              name="transactionId"
              placeholder="Enter transaction ID after payment"
              value={formData.transactionId}
              onChange={handleChange}
              required
              className="pl-10"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-amber-800 text-sm">
                <p className="font-medium mb-1">Important:</p>
                <p>Please complete the payment and enter the transaction ID to confirm your registration. Your registration will be verified once payment is confirmed.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setStep('details')}>
              Back
            </Button>
            <Button type="submit" loading={loading} disabled={!formData.transactionId}>
              Complete Registration
            </Button>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Registration Successful!</h3>
          <p className="text-slate-600 mb-6">
            You have successfully registered for <strong>{ftp.programName}</strong>. 
            {ftp.hasRegistrationFee && ' Your payment will be verified shortly.'}
          </p>
          <Button onClick={handleSuccess}>
            Continue
          </Button>
        </div>
      )}
    </Modal>
  );
};