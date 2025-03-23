
import { GuideTicketInfo } from "./GuideTicketInfo";
import { Separator } from "@/components/ui/separator";
import { TicketSufficiencyAlert } from "./TicketSufficiencyAlert";
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";

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
  guide1TicketType: "adult" | "child" | null;
  guide2TicketType: "adult" | "child" | null;
  guide3TicketType: "adult" | "child" | null;
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
  // Log the guides and their ticket info
  logger.debug(`🎟️ [GuideTicketRequirements] Rendering with:`, {
    location: tour.location,
    guide1: tour.guide1,
    guide2: tour.guide2,
    guide3: tour.guide3,
    guide1Type: guide1Info?.guideType,
    guide2Type: guide2Info?.guideType,
    guide3Type: guide3Info?.guideType,
    guide1TicketType,
    guide2TicketType,
    guide3TicketType,
    requiredAdultTickets,
    requiredChildTickets,
    totalRequiredTickets: requiredTickets
  });

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
