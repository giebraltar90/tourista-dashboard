
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TodaysSummary } from "@/components/dashboard/TodaysSummary";
import { UpcomingTours } from "@/components/dashboard/UpcomingTours";
import { QuickActions } from "@/components/tours/QuickActions";
import { Bike, Ticket, Users, TrendingUp } from "lucide-react";

// Mock data for tours
const mockTours = [
  {
    id: "tour-1",
    date: new Date("2023-05-07"),
    location: "Versailles",
    tourName: "Food & Palace Bike Tour",
    tourType: "food" as const,
    startTime: "08:00",
    referenceCode: "313911645",
    guide1: "Noéma",
    guide2: "GC",
    tourGroups: [
      {
        name: "Noéma's Group",
        size: 6,
        entryTime: "9:10"
      },
      {
        name: "Sabrina & Jordan's Group",
        size: 4,
        entryTime: "9:10"
      }
    ],
    numTickets: 10
  },
  {
    id: "tour-2",
    date: new Date("2023-05-07"),
    location: "Versailles",
    tourName: "Private Versailles Tour",
    tourType: "private" as const,
    startTime: "09:00",
    referenceCode: "313911867",
    guide1: "Naflesh",
    guide2: "GC",
    tourGroups: [
      {
        name: "Private Tour",
        size: 4,
        entryTime: "9:10"
      }
    ],
    numTickets: 4
  },
  {
    id: "tour-3",
    date: new Date("2023-05-07"),
    location: "Versailles",
    tourName: "Food & Palace Bike Tour",
    tourType: "food" as const,
    startTime: "09:00",
    referenceCode: "313911867",
    guide1: "Agathe",
    guide2: "Andrea",
    tourGroups: [
      {
        name: "Agathe's Group",
        size: 9,
        entryTime: "16:00"
      }
    ],
    numTickets: 9
  },
  {
    id: "tour-4",
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    location: "Louvre Museum",
    tourName: "Private Louvre Tour",
    tourType: "private" as const,
    startTime: "10:00",
    referenceCode: "324598761",
    guide1: "Sophie",
    guide2: "Marc",
    tourGroups: [
      {
        name: "VIP Group",
        size: 4,
        entryTime: "10:15"
      }
    ],
    numTickets: 4
  },
  {
    id: "tour-5",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    location: "Montmartre",
    tourName: "Montmartre Walking Tour",
    tourType: "default" as const, 
    startTime: "14:00",
    referenceCode: "324598799",
    guide1: "Jean",
    tourGroups: [
      {
        name: "Group A",
        size: 12,
        entryTime: "14:00"
      },
      {
        name: "Group B",
        size: 10,
        entryTime: "14:15"
      }
    ],
    numTickets: 22
  }
];

// Mock data for activities
const mockActivities = [
  {
    id: "act-1",
    time: "08:00",
    title: "Food & Palace Bike Tour",
    description: "Versailles - Noéma & GC - 10 participants",
    type: "tour" as const,
    status: "active" as const
  },
  {
    id: "act-2",
    time: "09:00",
    title: "Private Versailles Tour",
    description: "Naflesh - 4 participants",
    type: "tour" as const,
    status: "pending" as const
  },
  {
    id: "act-3",
    time: "09:00",
    title: "Food & Palace Bike Tour (Second Group)",
    description: "Agathe & Andrea - 9 participants",
    type: "tour" as const,
    status: "pending" as const
  },
  {
    id: "act-4",
    time: "12:30",
    title: "Guide Schedule Update",
    description: "Updated availability for next week",
    type: "guide" as const
  },
  {
    id: "act-5",
    time: "15:00",
    title: "Operations Meeting",
    description: "Weekly team sync on upcoming tours",
    type: "message" as const
  }
];

// Mock data for messages
const mockMessages = [
  {
    id: "msg-1",
    sender: "Operations Team",
    message: "Good morning team! Hope you're doing well :) Latest: Eleanor Ops: Amy, Eleonore Close: Emma",
    time: "07:30",
    read: false
  },
  {
    id: "msg-2",
    sender: "Naflesh (Guide)",
    message: "I'll be at the meeting point 15 minutes early to prepare for the private tour today.",
    time: "08:15",
    read: true
  },
  {
    id: "msg-3",
    sender: "Ticket Office",
    message: "Please note that there are ticket modifications for the afternoon tours. Check the system for details.",
    time: "09:45",
    read: false
  },
  {
    id: "msg-4",
    sender: "Amy (Operations)",
    message: "PICNIC NEEDED for the Versailles Food & Palace tour today!",
    time: "07:55",
    read: true
  }
];

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8 py-4">
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
