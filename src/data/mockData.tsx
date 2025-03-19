
import { TourCardProps } from "@/components/tours/tour-card/types";

// All mock data has been removed - we're now using Supabase for data storage
export const mockTours: TourCardProps[] = [];

// Mock data for activities
export const mockActivities = [
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
export const mockMessages = [
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
