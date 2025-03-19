
import { Check, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { TicketSufficiencyAlertProps } from "./types";

export const TicketSufficiencyAlert = ({ 
  hasEnoughTickets,
  availableTickets,
  requiredTickets,
  requiredAdultTickets,
  requiredChildTickets
}: TicketSufficiencyAlertProps) => {
  return (
    <Alert 
      variant={hasEnoughTickets ? "default" : "destructive"} 
      className={hasEnoughTickets ? "bg-green-50 text-green-800 border-green-200" : ""}
    >
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
  );
};
