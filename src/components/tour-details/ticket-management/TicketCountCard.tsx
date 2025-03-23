
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketCountCardProps } from "./types";

export const TicketCountCard = ({ 
  title, 
  description, 
  count, 
  guideTickets,
  totalCount 
}: TicketCountCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {count} / {totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          {description}
        </div>
        
        {guideTickets && guideTickets.length > 0 && (
          <div className="mt-2">
            <h3 className="text-sm font-medium mb-2">Guide Ticket Details</h3>
            <div className="space-y-1">
              {guideTickets.map((guide, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span>{guide.guideName}</span>
                  <Badge variant={guide.guideType === 'GC' ? 'outline' : 'secondary'} className="text-xs">
                    {guide.guideType === 'GC' 
                      ? 'No Ticket' 
                      : guide.guideType === 'GA Free' 
                        ? 'Child Ticket' 
                        : 'Adult Ticket'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
