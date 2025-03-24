
/**
 * Interface for guide ticket calculation results
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
