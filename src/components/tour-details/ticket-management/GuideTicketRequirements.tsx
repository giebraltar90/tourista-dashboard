
import { GuideTicketInfo } from "./GuideTicketInfo";
import { Separator } from "@/components/ui/separator";
import { TicketSufficiencyAlert } from "./TicketSufficiencyAlert";
import { GuideInfo } from "@/types/ventrata";

interface GuideTicketRequirementsProps {
  tour: {
    guide1: string;
    guide2?: string;
    guide3?: string;
    location: string;
  };
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  guide1NeedsTicket: boolean;
  guide2NeedsTicket: boolean;
  guide3NeedsTicket: boolean;
  guide1TicketType: string | null;
  guide2TicketType: string | null;
  guide3TicketType: string | null;
  hasEnoughTickets: boolean;
  availableTickets: number;
  requiredTickets: number;
  requiredAdultTickets: number;
  requiredChildTickets: number;
}

export const GuideTicketRequirements = ({
  tour,
  guide1Info,
  guide2Info,
  guide3Info,
  guide1NeedsTicket,
  guide2NeedsTicket,
  guide3NeedsTicket,
  guide1TicketType,
  guide2TicketType,
  guide3TicketType,
  hasEnoughTickets,
  availableTickets,
  requiredTickets,
  requiredAdultTickets,
  requiredChildTickets
}: GuideTicketRequirementsProps) => {
  return (
    <>
      <div className="space-y-4">
        <h3 className="font-medium">Guide Ticket Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GuideTicketInfo
            guideName={tour.guide1}
            guideInfo={guide1Info}
            needsTicket={guide1NeedsTicket}
            ticketType={guide1TicketType}
          />
          
          {tour.guide2 && (
            <GuideTicketInfo
              guideName={tour.guide2}
              guideInfo={guide2Info}
              needsTicket={guide2NeedsTicket}
              ticketType={guide2TicketType}
            />
          )}

          {tour.guide3 && (
            <GuideTicketInfo
              guideName={tour.guide3}
              guideInfo={guide3Info}
              needsTicket={guide3NeedsTicket}
              ticketType={guide3TicketType}
            />
          )}
        </div>
      </div>
      
      <TicketSufficiencyAlert
        hasEnoughTickets={hasEnoughTickets}
        availableTickets={availableTickets}
        requiredTickets={requiredTickets}
        requiredAdultTickets={requiredAdultTickets}
        requiredChildTickets={requiredChildTickets}
      />
      
      <Separator />
    </>
  );
};
