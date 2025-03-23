
import { GuideInfo } from "@/types/ventrata";

export interface GuideTicketRequirement {
  guideName: string;
  guideInfo: GuideInfo | null;
  needsTicket: boolean;
  ticketType: string | null;
}

export interface GuideTicketCounts {
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  guides: GuideTicketRequirement[];
}
