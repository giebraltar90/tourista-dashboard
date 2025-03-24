
import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TodaysSummary } from '@/components/dashboard/TodaysSummary';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UpcomingTours } from '@/components/dashboard/UpcomingTours';

const HomePage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <StatsCard />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TodaysSummary />
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
