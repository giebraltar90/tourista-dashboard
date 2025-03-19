import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Clock,
  Users,
  X
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";

// Define form validation schema
const createTicketSchema = z.object({
  tourType: z.enum(["versailles", "paris", "night", "private", "other"]),
  tourName: z.string().min(3, { message: "Tour name must be at least 3 characters" }),
  referenceCode: z.string().optional(),
  date: z.date({ required_error: "Tour date is required" }),
  startTime: z.string({ required_error: "Start time is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  adultTickets: z.coerce.number().min(0).optional(),
  childTickets: z.coerce.number().min(0).optional(),
  guide1: z.string().min(2, { message: "Primary guide name is required" }),
  guideType1: z.enum(["GA Ticket", "GA Free", "GC"]),
  guide2: z.string().optional(),
  guideType2: z.enum(["GA Ticket", "GA Free", "GC"]).optional(),
  checkInLead: z.string().optional(),
  notes: z.string().optional(),
});

type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

// Define starting times for different tour types
const startingTimes = {
  versailles: ["08:00 AM", "09:00 AM", "10:00 AM"],
  paris: ["09:30 AM", "14:00 PM"],
  night: ["04:00 PM", "05:00 PM", "06:00 PM"],
  private: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "13:00 PM", "14:00 PM", "15:00 PM"]
};

// Define entry times for Versailles tours
const versaillesEntryTimes = {
  "08:00 AM": "09:10 AM",
  "09:00 AM": "04:00 PM",
  "10:00 AM": "04:40 PM"
};

interface CreateTicketFormProps {
  onClose: () => void;
}

export function CreateTicketForm({ onClose }: CreateTicketFormProps) {
  const [isPrivateTour, setIsPrivateTour] = useState(false);
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      tourType: "versailles",
      tourName: "",
      referenceCode: "",
      adultTickets: 0,
      childTickets: 0,
      guide1: "",
      guideType1: "GA Ticket",
      notes: ""
    }
  });

  // Watch tour type to conditionally show fields
  const watchTourType = form.watch("tourType");
  const watchStartTime = form.watch("startTime");
  
  // Update UI based on tour type
  const handleTourTypeChange = (value: string) => {
    if (value === "private" || value === "other") {
      setIsPrivateTour(true);
    } else {
      setIsPrivateTour(false);
    }
    
    // Reset starting time when tour type changes
    form.setValue("startTime", "");
  };
  
  const onSubmit = (data: CreateTicketFormValues) => {
    console.log("Form submitted:", data);
    toast({
      title: "Ticket Created",
      description: `Successfully created tickets for ${data.tourName}`,
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Create New Ticket</h3>
        <Button variant="outline" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tour Type */}
            <FormField
              control={form.control}
              name="tourType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleTourTypeChange(value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tour type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="versailles">Versailles Tour</SelectItem>
                      <SelectItem value="paris">Paris Day Tour</SelectItem>
                      <SelectItem value="night">Paris Night Tour</SelectItem>
                      <SelectItem value="private">Private Tour</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Tour Name */}
            <FormField
              control={form.control}
              name="tourName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tour name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Reference Code (Only for Versailles) */}
            {watchTourType === "versailles" && (
              <FormField
                control={form.control}
                name="referenceCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference code" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used for Versailles Tours to gain entrance to the chateau
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Tour Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tour Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Starting Time */}
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {watchTourType === "versailles" && 
                        startingTimes.versailles.map(time => (
                          <SelectItem key={time} value={time}>
                            {time} 
                            {versaillesEntryTimes[time as keyof typeof versaillesEntryTimes] && 
                              ` → ${versaillesEntryTimes[time as keyof typeof versaillesEntryTimes]} chateau entry`}
                          </SelectItem>
                        ))
                      }
                      {watchTourType === "paris" && 
                        startingTimes.paris.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))
                      }
                      {watchTourType === "night" && 
                        startingTimes.night.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))
                      }
                      {(watchTourType === "private" || watchTourType === "other") && 
                        startingTimes.private.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  {watchTourType === "versailles" && watchStartTime && (
                    <FormDescription>
                      Chateau entry time: {versaillesEntryTimes[watchStartTime as keyof typeof versaillesEntryTimes] || "Not specified"}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Adult Tickets (if Versailles) */}
            {watchTourType === "versailles" && (
              <FormField
                control={form.control}
                name="adultTickets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adult Tickets (18+)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Required for guests aged 18 and above
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Child Tickets (if Versailles) */}
            {watchTourType === "versailles" && (
              <FormField
                control={form.control}
                name="childTickets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child Tickets (Under 18)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      For guests below 18 years and Paris Museum Pass holders
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Guide 1 */}
            <FormField
              control={form.control}
              name="guide1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Guide</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter guide name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Guide 1 Type */}
            <FormField
              control={form.control}
              name="guideType1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Guide Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select guide type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GA Ticket">GA Ticket (26+, needs adult ticket)</SelectItem>
                      <SelectItem value="GA Free">GA Free (Under 26, child ticket)</SelectItem>
                      <SelectItem value="GC">GC (Can guide inside, no ticket)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Guide 2 */}
            <FormField
              control={form.control}
              name="guide2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Guide (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter second guide name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Guide 2 Type */}
            <FormField
              control={form.control}
              name="guideType2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Guide Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select guide type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GA Ticket">GA Ticket (26+, needs adult ticket)</SelectItem>
                      <SelectItem value="GA Free">GA Free (Under 26, child ticket)</SelectItem>
                      <SelectItem value="GC">GC (Can guide inside, no ticket)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Check-in Lead */}
            <FormField
              control={form.control}
              name="checkInLead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Check-In Lead</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Who will check in the group" 
                      {...field} 
                      value={field.value || form.getValues("guide1")} 
                    />
                  </FormControl>
                  <FormDescription>
                    Defaults to primary guide if left empty
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Notes Field */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions / Payment Collection</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter any special instructions, payment collection details, or group divisions" 
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Use this for payment collection details, group divisions (families, couples + singles, adults + children), etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit">Create Ticket</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
