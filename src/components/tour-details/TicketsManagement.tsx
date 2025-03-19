
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PenSquare, Ticket, Calendar as CalendarIcon, IdCard, Check, X } from "lucide-react";
import { TourCardProps } from "@/components/tours/TourCard";
import { GuideInfo } from "@/types/ventrata";
import { doesGuideNeedTicket, getGuideTicketType } from "@/hooks/useGuideData";
import { format } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface TicketsManagementProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
}

export const TicketsManagement = ({ tour, guide1Info, guide2Info }: TicketsManagementProps) => {
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  const adultTickets = Math.round(tour.numTickets * 0.7) || Math.round(totalParticipants * 0.7);
  const childTickets = (tour.numTickets || totalParticipants) - adultTickets;
  
  // Determine if this is a Versailles tour
  const isVersaillesTour = tour.location.toLowerCase().includes('versailles');
  
  // Calculate guide ticket requirements
  const guide1NeedsTicket = guide1Info ? doesGuideNeedTicket(guide1Info, tour.location) : false;
  const guide2NeedsTicket = guide2Info ? doesGuideNeedTicket(guide2Info, tour.location) : false;
  
  // Get ticket types required for guides
  const guide1TicketType = guide1Info ? getGuideTicketType(guide1Info) : null;
  const guide2TicketType = guide2Info ? getGuideTicketType(guide2Info) : null;
  
  // Calculate total required tickets
  const requiredAdultTickets = adultTickets + 
    (guide1TicketType === 'adult' ? 1 : 0) + 
    (guide2TicketType === 'adult' ? 1 : 0);
    
  const requiredChildTickets = childTickets + 
    (guide1TicketType === 'child' ? 1 : 0) + 
    (guide2TicketType === 'child' ? 1 : 0);
  
  // Determine if we have enough tickets
  const availableTickets = tour.numTickets || totalParticipants;
  const requiredTickets = requiredAdultTickets + requiredChildTickets;
  const hasEnoughTickets = availableTickets >= requiredTickets;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Management</CardTitle>
        <CardDescription>Manage tickets for this tour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Adult Tickets (18+)</h3>
              <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-md">
                <div className="flex items-center">
                  <Ticket className="h-5 w-5 mr-2 text-primary" />
                  <span>Required for guests aged 18 and above</span>
                </div>
                <Badge>{adultTickets}</Badge>
              </div>
              
              {isVersaillesTour && (
                <div className="space-y-2 mt-3">
                  <h4 className="text-sm font-medium">Guide Adult Tickets</h4>
                  {(guide1Info && guide1TicketType === 'adult') && (
                    <div className="flex items-center justify-between bg-blue-100 p-3 rounded-md">
                      <div className="flex items-center">
                        <IdCard className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-sm">{guide1Info.name} (GA Ticket)</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-800">+1</Badge>
                    </div>
                  )}
                  
                  {(guide2Info && guide2TicketType === 'adult') && (
                    <div className="flex items-center justify-between bg-blue-100 p-3 rounded-md">
                      <div className="flex items-center">
                        <IdCard className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-sm">{guide2Info.name} (GA Ticket)</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-800">+1</Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <span className="font-medium">Total Adult Tickets:</span>
                    <Badge>{requiredAdultTickets}</Badge>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Child Tickets (Under 18)</h3>
              <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-md">
                <div className="flex items-center">
                  <Ticket className="h-5 w-5 mr-2 text-primary" />
                  <span>For guests below 18 years</span>
                </div>
                <Badge>{childTickets}</Badge>
              </div>
              
              {isVersaillesTour && (
                <div className="space-y-2 mt-3">
                  <h4 className="text-sm font-medium">Guide Child Tickets</h4>
                  {(guide1Info && guide1TicketType === 'child') && (
                    <div className="flex items-center justify-between bg-green-100 p-3 rounded-md">
                      <div className="flex items-center">
                        <IdCard className="h-4 w-4 mr-2 text-green-600" />
                        <div>
                          <span className="text-sm">{guide1Info.name} (GA Free)</span>
                          <div className="text-xs flex items-center mt-0.5">
                            <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{format(guide1Info.birthday, 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-800">+1</Badge>
                    </div>
                  )}
                  
                  {(guide2Info && guide2TicketType === 'child') && (
                    <div className="flex items-center justify-between bg-green-100 p-3 rounded-md">
                      <div className="flex items-center">
                        <IdCard className="h-4 w-4 mr-2 text-green-600" />
                        <div>
                          <span className="text-sm">{guide2Info.name} (GA Free)</span>
                          <div className="text-xs flex items-center mt-0.5">
                            <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{format(guide2Info.birthday, 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-800">+1</Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <span className="font-medium">Total Child Tickets:</span>
                    <Badge>{requiredChildTickets}</Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {isVersaillesTour && (
            <>
              <div className="space-y-4">
                <h3 className="font-medium">Guide Ticket Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-md ${guide1NeedsTicket ? 'bg-blue-50' : 'bg-green-50'}`}>
                    <div className="flex items-center">
                      <IdCard className={`h-5 w-5 mr-2 ${guide1NeedsTicket ? 'text-blue-600' : 'text-green-600'}`} />
                      <div>
                        <h4 className="font-medium">{tour.guide1}</h4>
                        <p className="text-sm text-muted-foreground">
                          {guide1Info?.guideType || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      {guide1NeedsTicket ? (
                        <div className="flex items-center text-blue-800">
                          <Ticket className="h-4 w-4 mr-1.5" />
                          <span>Needs a {guide1TicketType} ticket</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-800">
                          <Check className="h-4 w-4 mr-1.5" />
                          <span>No ticket required</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {tour.guide2 && (
                    <div className={`p-4 rounded-md ${guide2NeedsTicket ? 'bg-blue-50' : 'bg-green-50'}`}>
                      <div className="flex items-center">
                        <IdCard className={`h-5 w-5 mr-2 ${guide2NeedsTicket ? 'text-blue-600' : 'text-green-600'}`} />
                        <div>
                          <h4 className="font-medium">{tour.guide2}</h4>
                          <p className="text-sm text-muted-foreground">
                            {guide2Info?.guideType || 'Unknown type'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        {guide2NeedsTicket ? (
                          <div className="flex items-center text-blue-800">
                            <Ticket className="h-4 w-4 mr-1.5" />
                            <span>Needs a {guide2TicketType} ticket</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-green-800">
                            <Check className="h-4 w-4 mr-1.5" />
                            <span>No ticket required</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <Alert variant={hasEnoughTickets ? "default" : "destructive"} className={hasEnoughTickets ? "bg-green-50 text-green-800 border-green-200" : ""}>
                <div className="flex items-center">
                  {hasEnoughTickets ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  <AlertTitle>{hasEnoughTickets ? "Sufficient Tickets" : "Insufficient Tickets"}</AlertTitle>
                </div>
                <AlertDescription className="mt-1">
                  {hasEnoughTickets 
                    ? `You have ${availableTickets} tickets, which is enough for all guests and guides (${requiredTickets} required).` 
                    : `You need ${requiredTickets} tickets (${requiredAdultTickets} adult, ${requiredChildTickets} child) but only have ${availableTickets} available.`
                  }
                </AlertDescription>
              </Alert>
              
              <Separator />
            </>
          )}
          
          <div className="space-y-4">
            <h3 className="font-medium">Ticket Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between bg-green-100 p-4 rounded-md">
                <span className="text-green-800">Purchased</span>
                <Badge variant="outline" className="bg-green-200 text-green-800 border-green-300">
                  {tour.numTickets || totalParticipants}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between bg-yellow-100 p-4 rounded-md">
                <span className="text-yellow-800">Pending</span>
                <Badge variant="outline" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                  0
                </Badge>
              </div>
              
              <div className="flex items-center justify-between bg-blue-100 p-4 rounded-md">
                <span className="text-blue-800">Distributed</span>
                <Badge variant="outline" className="bg-blue-200 text-blue-800 border-blue-300">
                  {tour.numTickets || totalParticipants}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button className="ml-auto">
          <PenSquare className="mr-2 h-4 w-4" />
          Manage Tickets
        </Button>
      </CardFooter>
    </Card>
  );
};
