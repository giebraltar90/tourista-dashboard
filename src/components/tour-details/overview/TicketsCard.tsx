
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Users } from "lucide-react";
import { calculateGuideTicketsNeeded } from "@/hooks/group-management/utils";
import { GuideInfo } from "@/types/ventrata";

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
  
  // Total required tickets calculations
  const totalRequiredAdultTickets = validAdultTickets + guideAdultTickets;
  const totalRequiredChildTickets = validChildTickets + guideChildTickets;
  const totalRequiredTickets = totalRequiredAdultTickets + totalRequiredChildTickets;
  
  // Determine if we have enough tickets
  const hasEnoughTickets = !requiredTickets || totalRequiredTickets <= requiredTickets;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Adult (18+):</span>
            <span className="font-medium">
              {validAdultTickets} 
              {guideAdultTickets > 0 && 
                <span className="text-xs text-muted-foreground ml-1">
                  (+{guideAdultTickets} guide)
                </span>
              }
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Child (Under 18):</span>
            <span className="font-medium">
              {validChildTickets}
              {guideChildTickets > 0 && 
                <span className="text-xs text-muted-foreground ml-1">
                  (+{guideChildTickets} guide)
                </span>
              }
            </span>
          </div>
          
          {(guideAdultTickets > 0 || guideChildTickets > 0) && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Guide tickets:
              </span>
              <span>
                {guideAdultTickets > 0 && `${guideAdultTickets} adult`}
                {guideAdultTickets > 0 && guideChildTickets > 0 && ', '}
                {guideChildTickets > 0 && `${guideChildTickets} child`}
              </span>
            </div>
          )}
          
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">Total required:</span>
            <Badge 
              variant="outline" 
              className="font-medium bg-green-100 text-green-800 border-green-300"
            >
              {totalRequiredAdultTickets > 0 && totalRequiredChildTickets > 0 ? 
                `${totalRequiredAdultTickets} + ${totalRequiredChildTickets}` :
                totalRequiredTickets}
            </Badge>
          </div>
          
          {hasEnoughTickets && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="text-muted-foreground">Status:</span>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <Check className="h-3 w-3 mr-1" />
                Tickets sufficient
              </Badge>
            </div>
          )}
          
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
