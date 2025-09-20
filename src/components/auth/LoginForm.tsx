import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Mail, Lock, Chrome, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check for demo admin credentials
    if (formData.email === 'admin@ultron.edu' && formData.password === 'admin123') {
      // Create a mock admin user for demo purposes
      try {
        // For demo, we'll create a temporary admin session
        // In production, this should be handled by proper authentication
        const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = await import('firebase/auth');
        
        try {
          // Try to sign in first
          await signInWithEmailAndPassword(auth, formData.email, formData.password);
        } catch (signInError: any) {
          if (signInError.code === 'auth/user-not-found') {
            // Create the admin user if it doesn't exist
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            
            // Create admin profile
            const { doc, setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, 'profiles', userCredential.user.uid), {
              name: 'System Administrator',
              department: 'Administration',
              staffCode: 'ADMIN001',
              phone: '+91-9876543210',
              areasOfInterest: ['System Administration', 'Faculty Development'],
              role: 'admin',
              createdAt: new Date(),
              updatedAt: new Date()
            });
          } else {
            throw signInError;
          }
        }
        setLoading(false);
        return;
      } catch (error: any) {
        console.error('Admin login error:', error);
        setError('Failed to authenticate admin user');
        setLoading(false);
        return;
      }
    }
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during sign in';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'Failed to sign in';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      provider.addScope('email');
      provider.addScope('profile');
      
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in was cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups and try again';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign in was cancelled';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain is not authorized for Google sign-in';
          break;
        default:
          errorMessage = error.message || 'Failed to sign in with Google';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-600 mt-2">Sign in to your ULTRON FTP account</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            Sign In
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            loading={loading}
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Chrome className="h-4 w-4 mr-2" />
            Google
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};