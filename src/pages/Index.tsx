
import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TodaysSummary } from '@/components/dashboard/TodaysSummary';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UpcomingTours } from '@/components/dashboard/UpcomingTours';
import { Clock, Users, Calendar, Ticket } from 'lucide-react';
import { addDays } from 'date-fns';

const HomePage = () => {
  // Today's date for TodaysSummary
  const today = new Date();
  
  // Sample activities for TodaysSummary
  const activities = [
    {
      id: '1',
      time: '09:00 AM',
      title: 'Mountain Bike Tour',
      description: 'Prepare equipment for the mountain tour',
      type: 'tour' as const,
      status: 'active' as const
    },
    {
      id: '2',
      time: '11:30 AM',
      title: 'Guide Meeting',
      description: 'Brief guides on upcoming tours',
      type: 'guide' as const,
      status: 'pending' as const
    }
  ];
  
  // Sample messages for TodaysSummary
  const messages = [
    {
      id: '101',
      sender: 'Sarah Miller',
      message: 'Can you confirm the equipment list for tomorrow?',
      time: '08:45 AM',
      read: false
    },
    {
      id: '102',
      sender: 'John Davis',
      message: 'Tour group size increased by 2 participants',
      time: '10:15 AM',
      read: true
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Tours" 
            value="24" 
            description="This month" 
            icon={Calendar}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard 
            title="Participants" 
            value="548" 
            description="This week" 
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard 
            title="Upcoming Tours" 
            value="18" 
            description="Next 7 days" 
            icon={Clock}
          />
          <StatsCard 
            title="Available Tickets" 
            value="236" 
            description="Across all tours" 
            icon={Ticket}
            trend={{ value: 5, isPositive: false }}
          />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TodaysSummary 
              date={today}
              activities={activities}
              messages={messages}
            />
          </div>
          <div>
            <UpcomingTours />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HomePage;
