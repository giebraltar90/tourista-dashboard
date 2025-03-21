
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TicketManagement } from "@/components/tickets/TicketManagement";
import { TicketRules } from "@/components/tickets/TicketRules";
import { TicketBucketsManagement } from "@/components/tickets/TicketBucketsManagement";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Ticket, 
  FileText,
  Users,
  Building
} from "lucide-react";

const TicketsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [activeSection, setActiveSection] = useState("tickets");
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage tickets for all tours, entry times, and special requirements
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tickets
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="tickets" value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tickets">Ticket Management</TabsTrigger>
            <TabsTrigger value="buckets">Versailles Ticket Buckets</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Ticket Overview</CardTitle>
                <CardDescription>
                  Manage all tickets and entry times for Versailles and other tours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All Tickets</TabsTrigger>
                    <TabsTrigger value="versailles">Versailles</TabsTrigger>
                    <TabsTrigger value="paris">Paris Tours</TabsTrigger>
                    <TabsTrigger value="private">Private Tours</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-6">
                    <TicketManagement filterType="all" />
                  </TabsContent>
                  
                  <TabsContent value="versailles" className="mt-6">
                    <TicketManagement filterType="versailles" />
                  </TabsContent>
                  
                  <TabsContent value="paris" className="mt-6">
                    <TicketManagement filterType="paris" />
                  </TabsContent>
                  
                  <TabsContent value="private" className="mt-6">
                    <TicketManagement filterType="private" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <TicketRules />
          </TabsContent>
          
          <TabsContent value="buckets" className="mt-6">
            <TicketBucketsManagement />
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Versailles Ticket Buckets Guide</CardTitle>
                <CardDescription>
                  Understanding the ticket bucket system for Versailles tours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">What are ticket buckets?</h4>
                  <p className="text-muted-foreground text-sm">
                    Ticket buckets are pre-ordered ticket packages from Versailles that reserve a specific number of tickets
                    for a given date and entry time. They come in two sizes:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li><strong>Petit:</strong> For groups of 3-10 visitors</li>
                    <li><strong>Grande:</strong> For groups of 11-30 visitors</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">CSV Upload Format</h4>
                  <p className="text-muted-foreground text-sm">
                    When uploading buckets via CSV, ensure your file has the following columns:
                  </p>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <code>reference_number,date,access_time</code>
                  </div>
                  <p className="text-muted-foreground text-sm">For example:</p>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <code>
                      reference_number,date,access_time<br/>
                      VER15223P,2023-11-15,09:00 AM<br/>
                      VER15224G,2023-11-15,10:30 AM<br/>
                      VER16112P,2023-11-16,14:00 PM
                    </code>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Allocating Tickets</h4>
                  <p className="text-muted-foreground text-sm">
                    As tours are created and visitors are added, the system automatically allocates tickets from the appropriate buckets.
                    The day before a tour, you should inform Versailles of the exact number of tickets needed from each bucket.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TicketsPage;
