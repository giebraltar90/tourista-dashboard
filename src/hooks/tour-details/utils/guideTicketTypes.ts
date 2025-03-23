
import { GuideInfo } from "@/types/ventrata";

export interface GuideTicketRequirement {
  guideName: string;
  guideInfo: GuideInfo | null;
  needsTicket: boolean;
  ticketType: "adult" | "child" | null;
}

export interface GuideTicketCounts {
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  guides: GuideTicketRequirement[];
}
