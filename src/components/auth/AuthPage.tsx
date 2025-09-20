import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { Button } from '../ui/Button';
import { ArrowLeft, GraduationCap } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => setIsSignUp(!isSignUp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
      
      {/* Back to Home Button */}
      <Button
        onClick={() => navigate('/')}
        variant="ghost"
        className="absolute top-6 left-6 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ULTRON FTP
          </h1>
          <p className="text-slate-600 mt-1">Faculty Professional Development</p>
        </div>

        {isSignUp ? (
          <SignUpForm onToggleMode={toggleMode} />
        ) : (
          <LoginForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
};