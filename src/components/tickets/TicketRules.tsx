
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, AlertCircle, Ticket, Users, Building } from "lucide-react";

export function TicketRules() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Management Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="versailles">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Versailles Tours Guidelines
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium">Reference Code & Entry Times</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Reference Code: Only for Versailles Tours to gain entrance to the chateau</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Entry Field: Available in the back office and usable in multiple fields</span>
                    </li>
                  </ul>

                  <h3 className="font-medium mt-4">Tour Starting Times</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>08:00 AM tour → 09:10 AM chateau entry</span>
                    </li>
                    <li className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>09:00 AM tour → 04:00 PM chateau entry</span>
                    </li>
                    <li className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>10:00 AM tour → 04:40 PM chateau entry</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Ticket Requirements</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Adult tickets: Required for guests aged 18 and above</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Children tickets: For guests below 18 years</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Paris Museum Pass: Gives free access to the Chateau, still need a child ticket (discount)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="paris">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Paris Tours Guidelines
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium">Paris Day Tour</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Starts 09:30 AM or 14:00 PM</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Max guests: 24 and split into two even groups (manual work)</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Night Tour</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>March to end of April: start 5 PM</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>May 1st to end of second week of September: start 6 PM</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>September to end of October: start 5 PM</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Last week of October and winter months: sometimes 4 PM</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Max guests: 24 and split into two even groups (manual work)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="private">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Private Tours Guidelines
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="space-y-3">
                <h3 className="font-medium">Private Tours</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Starting times (Versailles): 08:00 AM tour → 09:10 AM chateau entry</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>All fields should be modifiable for private tours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Manual private tours can be created in the "Other" category with a custom title</span>
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="guides">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Guide Information
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="space-y-3">
                <h3 className="font-medium">Guide Type Abbreviations</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>GA Ticket:</strong> Over 26 years old, requires an adult ticket (for Versailles), cannot guide inside</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>GA Free:</strong> Under 26, requires a child's ticket (for Versailles), cannot guide inside</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>GC:</strong> Can guide inside (for Versailles), no ticket needed</span>
                  </li>
                </ul>

                <h3 className="font-medium mt-4">Guide Assignment</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Up to two guides per tour (high season sometimes 3 guides)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Check-in lead defaults to guide 1 but can be manually changed</span>
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="capacity">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <Ticket className="mr-2 h-5 w-5" />
                Booking Capacity & Group Management
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium">Booking Capacity</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Standard: 24 bookings per tour time (split into two even groups)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Exceptions: Max. would be 29 (split into two groups)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>High Season: Adjust to 36 bookings (split into three groups)</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Group Division</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Split into families or couples + singles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Further divided into adults + children (e.g., 6 + 3 means 6 adults and 3 children)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>This division is manual work and will be displayed in the Notes field</span>
                    </li>
                  </ul>

                  <Alert variant="warning" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Minimum Participants</AlertTitle>
                    <AlertDescription>
                      4 people minimum per tour. Tours with 3 or fewer people will be moved to another tour or starting time.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payment">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center">
                <Ticket className="mr-2 h-5 w-5" />
                Payment Collection
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="space-y-3">
                <h3 className="font-medium">Payment Collection Field</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>AirBnB Bookings:</strong> Specify the person from whom the money needs to be collected</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Guide Assignment:</strong> Indicate the guide's group where the payment needs to be collected + the name of the person(s) we need to collect the money from</span>
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
