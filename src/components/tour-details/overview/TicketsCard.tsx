
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateGuideTicketsNeeded } from "@/hooks/group-management/utils";
import { GuideInfo } from "@/types/ventrata";
import { useEffect } from "react";

interface TicketsCardProps {
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  requiredTickets?: number;
  location?: string;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
  tourGroups?: any[];
}

export const TicketsCard = ({ 
  adultTickets, 
  childTickets, 
  totalTickets,
  requiredTickets,
  location = '',
  guide1Info = null,
  guide2Info = null,
  guide3Info = null,
  tourGroups = []
}: TicketsCardProps) => {
  // Ensure counts are non-negative numbers
  const validAdultTickets = Math.max(0, adultTickets || 0);
  const validChildTickets = Math.max(0, childTickets || 0);
  
  // Calculate guide tickets
  const { 
    adultTickets: guideAdultTickets, 
    childTickets: guideChildTickets,
    guides: guidesWithTickets
  } = calculateGuideTicketsNeeded(
    guide1Info,
    guide2Info,
    guide3Info,
    location,
    tourGroups
  );
  
  // Log ticket calculation for debugging
  useEffect(() => {
    console.log("🎟️ [TicketsCard] Ticket calculation results:", {
      validAdultTickets,
      validChildTickets,
      guideAdultTickets,
      guideChildTickets,
      guidesWithTickets,
      location,
      guide1Type: guide1Info?.guideType,
      guide2Type: guide2Info?.guideType,
      guide3Type: guide3Info?.guideType
    });
  }, [validAdultTickets, validChildTickets, guideAdultTickets, guideChildTickets, 
      guide1Info, guide2Info, guide3Info, location, guidesWithTickets]);
  
  // Total required tickets calculations
  const totalRequiredAdultTickets = validAdultTickets + guideAdultTickets;
  const totalRequiredChildTickets = validChildTickets + guideChildTickets;
  const totalRequiredTickets = totalRequiredAdultTickets + totalRequiredChildTickets;
  
  // Determine if we have enough tickets
  const hasEnoughTickets = !requiredTickets || totalRequiredTickets <= requiredTickets;

  // Format the display strings
  const adultTicketsDisplay = guideAdultTickets > 0 
    ? `${validAdultTickets} + ${guideAdultTickets} guides` 
    : `${validAdultTickets}`;
    
  const childTicketsDisplay = guideChildTickets > 0 
    ? `${validChildTickets} + ${guideChildTickets} guides` 
    : `${validChildTickets}`;
    
  // Format the total tickets display
  const formattedTotalTickets = totalRequiredChildTickets > 0 && totalRequiredAdultTickets > 0
    ? `${totalRequiredAdultTickets} + ${totalRequiredChildTickets}`
    : `${totalRequiredTickets}`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Adult tickets:</span>
            <span className="font-medium">{adultTicketsDisplay}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Child tickets:</span>
            <span className="font-medium">{childTicketsDisplay}</span>
          </div>
          
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">Total tickets needed:</span>
            <Badge 
              variant="outline" 
              className={`font-medium ${hasEnoughTickets ? "bg-green-100 text-green-800 border-green-300" : ""}`}
            >
              {formattedTotalTickets}
            </Badge>
          </div>
          
          {/* Guide ticket breakdown section */}
          {guidesWithTickets.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <h4 className="text-xs font-medium mb-1">Guide ticket breakdown</h4>
              <div className="space-y-1 text-xs">
                {guidesWithTickets.map((guide, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">{guide.guideName}:</span>
                    <span>{guide.ticketType === 'adult' ? 'Adult ticket' : 'Child ticket'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
