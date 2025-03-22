
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TicketsCardProps {
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  requiredTickets?: number; // Added to show missing tickets
  guideAdultTickets?: number; // For guides who need adult tickets
  guideChildTickets?: number; // For guides who need child tickets
  location?: string; // To check if it's a Versailles tour
}

export const TicketsCard = ({ 
  adultTickets, 
  childTickets, 
  totalTickets,
  requiredTickets,
  guideAdultTickets = 0,
  guideChildTickets = 0,
  location = ''
}: TicketsCardProps) => {
  console.log("GUIDE TICKET DEBUG: TicketsCard rendering with values:", {
    location,
    adultTickets,
    childTickets,
    totalTickets,
    requiredTickets,
    guideAdultTickets,
    guideChildTickets
  });
  
  // Extra validation to ensure counts are non-negative numbers
  const validAdultTickets = Math.max(0, adultTickets || 0);
  const validChildTickets = Math.max(0, childTickets || 0);
  const validTotalTickets = Math.max(0, totalTickets || 0);
  
  // Double-check that our total matches the sum of adult + child tickets
  const calculatedTotal = validAdultTickets + validChildTickets;
  
  // Always use the calculated total for consistency
  const displayTotal = calculatedTotal;

  // Calculate missing tickets if required tickets is provided
  const missingTickets = requiredTickets && requiredTickets > displayTotal 
    ? requiredTickets - displayTotal 
    : 0;
    
  // Total required tickets, including guides
  const totalRequiredAdultTickets = validAdultTickets + guideAdultTickets;
  const totalRequiredChildTickets = validChildTickets + guideChildTickets;
  const totalRequiredTickets = totalRequiredAdultTickets + totalRequiredChildTickets;
  
  // Check if it's a location requiring special guide tickets
  const isLocationRequiringTickets = 
    location?.toLowerCase().includes('versailles') || 
    location?.toLowerCase().includes('montmartre');
  
  // Determine if we have enough tickets
  const hasEnoughTickets = totalRequiredTickets <= validTotalTickets;
  
  console.log("GUIDE TICKET DEBUG: TicketsCard final calculations for location " + location + ":", {
    originalValues: { adultTickets, childTickets, totalTickets, requiredTickets },
    validatedValues: { validAdultTickets, validChildTickets, validTotalTickets },
    calculatedTotal,
    displayTotal,
    missingTickets,
    guideTickets: { guideAdultTickets, guideChildTickets },
    totalRequired: { totalRequiredAdultTickets, totalRequiredChildTickets, totalRequiredTickets },
    hasEnoughTickets,
    isLocationRequiringTickets
  });

  // Calculate missing adult and child tickets separately
  const missingAdultTickets = Math.max(0, totalRequiredAdultTickets - validAdultTickets);
  const missingChildTickets = Math.max(0, totalRequiredChildTickets - validChildTickets);

  // Consider guide tickets in the total display
  const displayAdultTickets = totalRequiredAdultTickets;
  const displayChildTickets = totalRequiredChildTickets;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Adult (18+):</span>
            <span className="font-medium">{validAdultTickets} tickets</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Child (Under 18):</span>
            <span className="font-medium">{validChildTickets} tickets</span>
          </div>
          
          {(guideAdultTickets > 0 || guideChildTickets > 0) && isLocationRequiringTickets && (
            <>
              <div className="pt-2 pb-1 border-t">
                <span className="text-xs font-medium text-muted-foreground">Guide Tickets:</span>
              </div>
              
              {guideAdultTickets > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GA Ticket (Adult):</span>
                  <span className="font-medium">{guideAdultTickets} tickets</span>
                </div>
              )}
              
              {guideChildTickets > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GA Free (Child):</span>
                  <span className="font-medium">{guideChildTickets} tickets</span>
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">Total:</span>
            <Badge 
              variant="outline" 
              className="font-medium bg-green-100 text-green-800 border-green-300"
            >
              {displayAdultTickets} + {displayChildTickets}
            </Badge>
          </div>
          
          {!hasEnoughTickets && (missingAdultTickets > 0 || missingChildTickets > 0) && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="text-muted-foreground">Missing:</span>
              <Badge variant="destructive" className="text-xs font-medium">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {missingAdultTickets > 0 && missingChildTickets > 0 
                  ? `${missingAdultTickets} + ${missingChildTickets}` 
                  : missingAdultTickets > 0 
                    ? missingAdultTickets 
                    : missingChildTickets}
              </Badge>
            </div>
          )}
          
          {hasEnoughTickets && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="text-muted-foreground">Status:</span>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <Check className="h-3 w-3 mr-1" />
                Tickets sufficient
              </Badge>
            </div>
          )}
          
          {isLocationRequiringTickets && (
            <div className="mt-3 pt-3 border-t text-xs">
              <div className="flex items-start mb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground mr-1.5 mt-0.5" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Guide requirements at {location?.includes('Versailles') ? 'Versailles' : 'Montmartre'}:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>GA Ticket: Over 26 years old, requires an adult ticket, cannot guide inside</li>
                        <li>GA Free: Under 26, requires a child ticket, cannot guide inside</li>
                        <li>GC: Can guide inside, no ticket needed</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-muted-foreground">
                  {location?.includes('Versailles') ? 'Versailles' : 'Montmartre'} guide tickets required based on guide type
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
