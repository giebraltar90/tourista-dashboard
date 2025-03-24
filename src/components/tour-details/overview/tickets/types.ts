
import { GuideInfo } from "@/types/ventrata";

export interface GuideWithTicket {
  guideName: string;
  guideType: string;
  ticketType: "adult" | "child" | null;
}

export interface GuideTicketsResult {
  adultTickets: number;
  childTickets: number;
  guides: GuideWithTicket[];
}
