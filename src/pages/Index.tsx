
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TodaysSummary } from "@/components/dashboard/TodaysSummary";
import { UpcomingTours } from "@/components/dashboard/UpcomingTours";
import { QuickActions } from "@/components/tours/QuickActions";
import { mockTours, mockActivities, mockMessages } from "@/data/mockData";
import { Bike, Ticket, Users, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Operations Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of today's tours, activities and operational metrics
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Tours Today"
            value="3"
            description="May 7, 2023"
            icon={Bike}
            trend={{ value: 20, isPositive: true }}
          />
          <StatsCard 
            title="Participants"
            value="23"
            description="Across all tours"
            icon={Users}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard 
            title="Tickets Issued"
            value="23"
            description="For attractions & museums"
            icon={Ticket}
          />
          <StatsCard 
            title="Weekly Revenue"
            value="€9,580"
            description="15 tours completed"
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodaysSummary 
              date={new Date("2023-05-07")}
              activities={mockActivities}
              messages={mockMessages}
            />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
        
        <div>
          <UpcomingTours tours={mockTours} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
