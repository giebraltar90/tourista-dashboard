
import { TourCardProps } from "@/components/tours/TourCard";
import { GuideInfo } from "@/types/ventrata";

export interface TicketsManagementProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export interface TicketCountCardProps {
  title: string;
  description: string;
  count: number;
  guideTickets?: {
    guideName: string;
    guideType: string;
    birthday?: Date;
  }[];
  totalCount: number;
}

export interface GuideTicketInfoProps {
  guideName: string;
  guideInfo: GuideInfo | null;
  needsTicket: boolean;
  ticketType: string | null;
}

export interface TicketStatusProps {
  purchasedCount: number;
  pendingCount: number;
  distributedCount: number;
}

export interface TicketSufficiencyAlertProps {
  hasEnoughTickets: boolean;
  availableTickets: number;
  requiredTickets: number;
  requiredAdultTickets: number;
  requiredChildTickets: number;
}
