
import { Badge } from "@/components/ui/badge";
import { Ticket, IdCard, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { TicketCountCardProps } from "./types";

export const TicketCountCard = ({ 
  title, 
  description, 
  count, 
  guideTickets, 
  totalCount 
}: TicketCountCardProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">{title}</h3>
      <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-md">
        <div className="flex items-center">
          <Ticket className="h-5 w-5 mr-2 text-primary" />
          <span>{description}</span>
        </div>
        <Badge>{count}</Badge>
      </div>
      
      {guideTickets && guideTickets.length > 0 && (
        <div className="space-y-2 mt-3">
          <h4 className="text-sm font-medium">Guide {title}</h4>
          {guideTickets.map((guide, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between ${guide.guideType.includes('Adult') ? 'bg-blue-100' : 'bg-green-100'} p-3 rounded-md`}
            >
              <div className="flex items-center">
                <IdCard className={`h-4 w-4 mr-2 ${guide.guideType.includes('Adult') ? 'text-blue-600' : 'text-green-600'}`} />
                <div>
                  <span className="text-sm">{guide.guideName} ({guide.guideType})</span>
                  {guide.birthday && (
                    <div className="text-xs flex items-center mt-0.5">
                      <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{format(guide.birthday, 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="outline" className={`${guide.guideType.includes('Adult') ? 'bg-blue-50 text-blue-800' : 'bg-green-50 text-green-800'}`}>+1</Badge>
            </div>
          ))}
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <span className="font-medium">Total {title}:</span>
            <Badge>{totalCount}</Badge>
          </div>
        </div>
      )}
    </div>
  );
};
