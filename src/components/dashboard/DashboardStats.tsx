import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { 
  BookOpen, 
  Calendar, 
  Trophy, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

export const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: 'Available Programs',
      value: '0',
      change: 'Ready to explore',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      changeColor: 'text-blue-600'
    },
    {
      title: 'My Registrations',
      value: '0',
      change: 'Get started today',
      icon: Calendar,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      changeColor: 'text-green-600'
    },
    {
      title: 'Completed Programs',
      value: '0',
      change: 'Begin your journey',
      icon: CheckCircle,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      changeColor: 'text-purple-600'
    },
    {
      title: 'Certificates Earned',
      value: '0',
      change: 'Achieve excellence',
      icon: Trophy,
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
      changeColor: 'text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</p>
                <p className={`text-sm ${stat.changeColor} font-medium`}>{stat.change}</p>
              </div>
              <div className={`p-4 rounded-xl ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};