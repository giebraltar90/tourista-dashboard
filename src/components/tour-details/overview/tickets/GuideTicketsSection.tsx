
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";

interface GuideWithTicket {
  guideName: string;
  guideType: string;
  ticketType: 'adult' | 'child' | null;
}

interface GuideTicketsSectionProps {
  locationNeedsGuideTickets: boolean;
  guideAdultTickets: number;
  guideChildTickets: number;
  guidesWithTickets: GuideWithTicket[];
}

export const GuideTicketsSection = ({
  locationNeedsGuideTickets,
  guideAdultTickets,
  guideChildTickets,
  guidesWithTickets
}: GuideTicketsSectionProps) => {
  // Only display section if there are assigned guides or in a location needing tickets
  const shouldDisplaySection = locationNeedsGuideTickets || guidesWithTickets.length > 0;
  
  if (!shouldDisplaySection) return null;

  const hasGuideTickets = guideAdultTickets > 0 || guideChildTickets > 0;
  
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">
        Guide Tickets
      </div>
      
      {guidesWithTickets.length > 0 ? (
        <>
          {guideAdultTickets > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Guide adult tickets:</span>
              <span className="font-medium">{guideAdultTickets}</span>
            </div>
          )}
          
          {guideChildTickets > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Guide child tickets:</span>
              <span className="font-medium">{guideChildTickets}</span>
            </div>
          )}
          
          <div className="mt-1 text-xs text-muted-foreground">
            {guidesWithTickets.map((guide, index) => (
              <div key={`${guide.guideName}-${index}`} className="flex justify-between">
                <span>{guide.guideName} ({guide.guideType}):</span>
                <span className={cn(
                  guide.ticketType === 'adult' ? "text-blue-600" :
                  guide.ticketType === 'child' ? "text-green-600" : "text-gray-400"
                )}>
                  {guide.ticketType ? guide.ticketType : "none"}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Guide tickets:</span>
          <span className="font-medium">0</span>
        </div>
      )}
    </div>
  );
};
