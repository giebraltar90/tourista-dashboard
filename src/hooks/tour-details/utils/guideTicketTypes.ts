
/**
 * Guide ticket requirement calculations return object
 */
export interface GuideTicketCounts {
  locationNeedsGuideTickets: boolean;
  guideTickets: {
    adultTickets: number;
    childTickets: number;
    guides: Array<{
      guideName: string;
      guideType: string;
      ticketType: "adult" | "child" | null;
    }>;
  };
  hasAssignedGuides: boolean;
}

/**
 * Participant counts used throughout the application
 */
export interface ParticipantCounts {
  totalParticipants: number;
  totalChildCount: number;
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
}
