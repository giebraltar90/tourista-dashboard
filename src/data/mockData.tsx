import { TourCardProps } from "@/components/tours/TourCard";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";

// Mock data for tours
export const mockTours: TourCardProps[] = [
  {
    id: "tour-1",
    date: new Date("2023-05-07"),
    location: "Versailles",
    tourName: "Food & Palace Bike Tour",
    tourType: "food",
    startTime: "08:00",
    referenceCode: "313911645",
    guide1: "Noéma",
    guide2: "GC",
    tourGroups: [
      {
        name: "Noéma's Group",
        size: 6,
        entryTime: "9:10",
        participants: [
          { id: "p1", name: "Smith Family", count: 2, bookingRef: "BK001" },
          { id: "p2", name: "John Davis", count: 1, bookingRef: "BK002" },
          { id: "p3", name: "Rodriguez Family", count: 3, bookingRef: "BK003" }
        ]
      },
      {
        name: "Jordan's Group",
        size: 4,
        entryTime: "9:10",
        participants: [
          { id: "p4", name: "Wilson Couple", count: 2, bookingRef: "BK004" },
          { id: "p5", name: "Laura Chen", count: 1, bookingRef: "BK005" },
          { id: "p6", name: "Michael Brown", count: 1, bookingRef: "BK006" }
        ]
      }
    ],
    numTickets: 10
  },
  {
    id: "tour-2",
    date: new Date("2023-05-07"),
    location: "Versailles",
    tourName: "Private Versailles Tour",
    tourType: "private",
    startTime: "09:00",
    referenceCode: "313911867",
    guide1: "Naflesh",
    guide2: "GC",
    tourGroups: [
      {
        name: "Private Tour",
        size: 4,
        entryTime: "9:10",
        participants: [
          { id: "p7", name: "Johnson Family", count: 4, bookingRef: "BK007" }
        ]
      }
    ],
    numTickets: 4
  },
  {
    id: "tour-3",
    date: new Date("2023-05-07"),
    location: "Versailles",
    tourName: "Food & Palace Bike Tour",
    tourType: "food",
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
    tourType: "private",
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
    tourType: "default",
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
  },
  {
    id: "tour-6",
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    location: "Versailles",
    tourName: "Food & Palace Bike Tour",
    tourType: "food",
    startTime: "08:00",
    referenceCode: "324598820",
    guide1: "Emma",
    guide2: "Luc",
    tourGroups: [
      {
        name: "Emma's Group",
        size: 8,
        entryTime: "8:30"
      },
      {
        name: "Luc's Group",
        size: 8,
        entryTime: "8:45"
      },
      {
        name: "Third Group",
        size: 8, 
        entryTime: "9:00"
      }
    ],
    numTickets: 24
  },
  {
    id: "tour-7",
    date: new Date(new Date().setDate(new Date().getDate() + 4)),
    location: "Eiffel Tower",
    tourName: "Eiffel Tower & Seine River Cruise",
    tourType: "default",
    startTime: "16:00",
    referenceCode: "324598850",
    guide1: "Pierre",
    guide2: "Marie",
    tourGroups: [
      {
        name: "Group A",
        size: 3,
        entryTime: "16:15"
      }
    ],
    numTickets: 3
  }
];

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
