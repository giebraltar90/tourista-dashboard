
import { IdCard, Ticket, Check } from "lucide-react";
import { GuideTicketInfoProps } from "./types";

export const GuideTicketInfo = ({ 
  guideName, 
  guideInfo, 
  needsTicket, 
  ticketType 
}: GuideTicketInfoProps) => {
  return (
    <div className={`p-4 rounded-md ${needsTicket ? 'bg-blue-50' : 'bg-green-50'}`}>
      <div className="flex items-center">
        <IdCard className={`h-5 w-5 mr-2 ${needsTicket ? 'text-blue-600' : 'text-green-600'}`} />
        <div>
          <h4 className="font-medium">{guideName}</h4>
          <p className="text-sm text-muted-foreground">
            {guideInfo?.guideType || 'Unknown type'}
          </p>
        </div>
      </div>
      <div className="mt-2 text-sm">
        {needsTicket ? (
          <div className="flex items-center text-blue-800">
            <Ticket className="h-4 w-4 mr-1.5" />
            <span>Needs a {ticketType} ticket</span>
          </div>
        ) : (
          <div className="flex items-center text-green-800">
            <Check className="h-4 w-4 mr-1.5" />
            <span>No ticket required</span>
          </div>
        )}
      </div>
    </div>
  );
};
