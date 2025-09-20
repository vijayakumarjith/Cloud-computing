import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { 
  GraduationCap, 
  Users, 
  Award, 
  BookOpen, 
  TrendingUp, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Calendar,
  MapPin,
  Clock,
  User
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: GraduationCap,
      title: 'Professional Development',
      description: 'Comprehensive faculty training programs designed to enhance teaching and research capabilities.'
    },
    {
      icon: Users,
      title: 'Expert Faculty',
      description: 'Learn from industry experts and renowned academicians with years of experience.'
    },
    {
      icon: Award,
      title: 'Certified Programs',
      description: 'Earn recognized certificates upon successful completion of training programs.'
    },
    {
      icon: BookOpen,
      title: 'Diverse Curriculum',
      description: 'Wide range of topics covering latest technologies, pedagogical methods, and research techniques.'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Accelerate your academic career with skills that matter in today\'s educational landscape.'
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'All programs are carefully curated and quality-assured for maximum learning impact.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Faculty Trained' },
    { number: '50+', label: 'Programs Conducted' },
    { number: '25+', label: 'Partner Institutions' },
    { number: '95%', label: 'Satisfaction Rate' }
  ];

  const testimonials = [
    {
      name: 'Dr. malathy',
      role: 'Professor, Computer Science',
      content: 'ULTRON FTP has transformed my teaching methodology. The programs are well-structured and highly practical.',
      rating: 5
    },
    {
      name: 'dr Kumar P',
      role: 'Associate Professor, Engineering',
      content: 'Excellent platform for professional development. The quality of training and resources is outstanding.',
      rating: 5
    },
    {
      name: 'Dr. jananee v',
      role: 'Assistant Professor, Mathematics',
      content: 'The certification programs have significantly enhanced my research capabilities and career prospects.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ULTRON FTP
                </h1>
                <p className="text-xs text-slate-500">Faculty Professional Development</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="#about" className="text-slate-600 hover:text-slate-900 font-medium">About</a>
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium">Features</a>
              <a href="#testimonials" className="text-slate-600 hover:text-slate-900 font-medium">Testimonials</a>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hidden sm:block">
                Get Started
              </Button>
              <button
                onClick={() => navigate('/auth')}
                className="sm:hidden p-2 text-slate-600 hover:text-slate-900"
              >
                <User className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <div className="sm:hidden px-4 py-3 border-t border-slate-200">
            <div className="flex flex-col space-y-2">
              <a href="#about" className="text-slate-600 hover:text-slate-900 font-medium py-2">About</a>
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium py-2">Features</a>
              <a href="#testimonials" className="text-slate-600 hover:text-slate-900 font-medium py-2">Testimonials</a>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-2">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Empowering Faculty
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Development Excellence
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join ULTRON FTP - the premier platform for faculty professional development. 
              Access world-class training programs, earn certifications, and advance your academic career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/auth')} 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose ULTRON FTP?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We're committed to advancing faculty excellence through innovative training programs 
              that bridge the gap between traditional teaching and modern educational needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">
                Transforming Faculty Development
              </h3>
              <div className="space-y-4">
                {[
                  'Comprehensive training programs designed by experts',
                  'Flexible scheduling to accommodate academic calendars',
                  'Industry-relevant curriculum updated regularly',
                  'Networking opportunities with peers and experts',
                  'Recognized certifications for career advancement'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm opacity-90">Access</div>
                  </div>
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">Live</div>
                    <div className="text-sm opacity-90">Sessions</div>
                  </div>
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">Global</div>
                    <div className="text-sm opacity-90">Reach</div>
                  </div>
                  <div className="text-center">
                    <Award className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">Certified</div>
                    <div className="text-sm opacity-90">Programs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Comprehensive Features</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need for professional development in one integrated platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Faculty Say</h2>
            <p className="text-xl text-slate-600">
              Hear from educators who have transformed their careers with ULTRON FTP
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-slate-600 text-sm">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Advance Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of faculty members who have already transformed their teaching and research capabilities
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            size="lg"
            className="bg-white text-blue-600 hover:bg-slate-50 shadow-xl"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ULTRON FTP</span>
              </div>
              <p className="text-slate-400">
                Empowering faculty development through innovative training programs and professional growth opportunities.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 ULTRON FTP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};