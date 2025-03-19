import { useState } from "react";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Calendar as CalendarIcon,
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Ticket,
  Clock,
  Users,
  CalendarDays,
  Building,
  Edit
} from "lucide-react";
import { mockTours } from "@/data/mockData";
import { CreateTicketForm } from "./CreateTicketForm";

// Create mock ticket data based on tours
const mockTickets = mockTours.map(tour => {
  // Calculate adult and child tickets based on tourGroups size
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  const adultTickets = Math.round(totalParticipants * 0.7);
  const childTickets = totalParticipants - adultTickets;
  
  // Determine tour type and reference code formatting
  let tourType = "paris";
  let entryTime = null;
  
  if (tour.location.toLowerCase().includes("versailles")) {
    tourType = "versailles";
    
    // Assign entry times based on starting times for Versailles
    if (tour.startTime === "08:00 AM") {
      entryTime = "09:10 AM";
    } else if (tour.startTime === "09:00 AM") {
      entryTime = "04:00 PM";
    } else if (tour.startTime === "10:00 AM") {
      entryTime = "04:40 PM";
    }
  } else if (tour.tourType === "private") {
    tourType = "private";
  }
  
  return {
    id: tour.id,
    tourName: tour.tourName,
    referenceCode: tour.referenceCode,
    date: tour.date,
    startTime: tour.startTime,
    entryTime: entryTime,
    location: tour.location,
    tourType: tourType,
    adultTickets: adultTickets,
    childTickets: childTickets,
    totalTickets: totalParticipants,
    guide1: tour.guide1,
    guide2: tour.guide2,
    guideType1: ["GA Ticket", "GA Free", "GC"][Math.floor(Math.random() * 3)],
    guideType2: tour.guide2 ? ["GA Ticket", "GA Free", "GC"][Math.floor(Math.random() * 3)] : null,
    checkInLead: tour.guide1, // Default to guide1
    paymentCollection: Math.random() > 0.7 ? {
      type: "AirBnB",
      name: "John Doe",
      amount: Math.floor(Math.random() * 200) + 50
    } : null
  };
});

interface TicketManagementProps {
  filterType: "all" | "versailles" | "paris" | "private";
}

export function TicketManagement({ filterType }: TicketManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Filter tickets based on search, date, and filter type
  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = 
      ticket.tourName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.guide1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.guide2 && ticket.guide2.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDate = !date || 
      (ticket.date.getDate() === date.getDate() &&
       ticket.date.getMonth() === date.getMonth() &&
       ticket.date.getFullYear() === date.getFullYear());
    
    const matchesType = filterType === "all" || ticket.tourType === filterType;
    
    return matchesSearch && matchesDate && matchesType;
  });
  
  // Sort tickets by date (most recent first)
  const sortedTickets = [...filteredTickets].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {date && (
            <Button variant="outline" size="sm" onClick={() => setDate(undefined)}>
              Clear Date
            </Button>
          )}
        </div>
        
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>
      
      {showCreateForm && (
        <Card className="mb-6 border-primary/30 shadow-sm">
          <CardContent className="pt-6">
            <CreateTicketForm onClose={() => setShowCreateForm(false)} />
          </CardContent>
        </Card>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tour & Reference</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Tickets</TableHead>
              <TableHead>Guides</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTickets.length > 0 ? (
              sortedTickets.map((ticket) => (
                <TableRow key={ticket.id} className="group">
                  <TableCell>
                    <div className="font-medium">{ticket.tourName}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      #{ticket.referenceCode}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{format(ticket.date, "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{ticket.startTime}</span>
                        {ticket.entryTime && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            Entry: {ticket.entryTime}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      {ticket.location}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <Badge variant="outline" className="w-fit bg-primary/5 text-primary">
                        <Ticket className="h-3 w-3 mr-1" />
                        {ticket.totalTickets} Total
                      </Badge>
                      
                      <div className="text-xs flex gap-2">
                        <span className="text-muted-foreground">Adult: {ticket.adultTickets}</span>
                        <span className="text-muted-foreground">Child: {ticket.childTickets}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center">
                        <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span className="text-sm">{ticket.guide1}</span>
                        <Badge variant="outline" className="ml-1.5 text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {ticket.guideType1}
                        </Badge>
                      </div>
                      
                      {ticket.guide2 && (
                        <div className="flex items-center">
                          <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-sm">{ticket.guide2}</span>
                          <Badge variant="outline" className="ml-1.5 text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">
                            {ticket.guideType2}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {ticket.tourType === "versailles" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Tickets Purchased
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        No Tickets Required
                      </Badge>
                    )}
                    
                    {ticket.paymentCollection && (
                      <Badge variant="outline" className="mt-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        Payment Collection
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No tickets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
