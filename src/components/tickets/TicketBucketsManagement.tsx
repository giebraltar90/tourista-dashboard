import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, isAfter } from "date-fns";
import { Calendar as CalendarIcon, Plus, Search, Upload, Download, Trash2 } from "lucide-react";
import { CSVUploader } from "./CSVUploader";
import { CreateTicketBucketForm } from "./CreateTicketBucketForm";
import { TicketBucket } from "@/types/ticketBuckets";
import { fetchTicketBuckets, deleteTicketBucket } from "@/services/api/ticketBucketService";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function TicketBucketsManagement() {
  const [activeTab, setActiveTab] = useState("list");
  const [buckets, setBuckets] = useState<TicketBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [bucketToDelete, setBucketToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    loadTicketBuckets();
  }, []);
  
  const loadTicketBuckets = async () => {
    setLoading(true);
    try {
      const data = await fetchTicketBuckets();
      setBuckets(data);
    } catch (error) {
      console.error("Failed to load ticket buckets:", error);
      toast.error("Failed to load ticket buckets");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteBucket = async (id: string) => {
    try {
      await deleteTicketBucket(id);
      setBuckets(buckets.filter(bucket => bucket.id !== id));
      toast.success("Ticket bucket deleted successfully");
    } catch (error) {
      console.error("Failed to delete ticket bucket:", error);
      toast.error("Failed to delete ticket bucket");
    } finally {
      setBucketToDelete(null);
    }
  };
  
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    loadTicketBuckets();
    toast.success("Ticket bucket created successfully");
  };
  
  const filteredBuckets = buckets.filter(bucket => {
    const matchesSearch = 
      bucket.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bucket.access_time?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !selectedDate || 
      format(bucket.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    
    return matchesSearch && matchesDate;
  });
  
  const bucketsByDate = filteredBuckets.reduce((acc, bucket) => {
    const dateStr = format(bucket.date, 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(bucket);
    return acc;
  }, {} as Record<string, TicketBucket[]>);
  
  const sortedDates = Object.keys(bucketsByDate).sort();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Buckets Management</CardTitle>
          <CardDescription>
            Manage ticket buckets for Versailles tours based on reference numbers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                <TabsTrigger value="list">Ticket Buckets</TabsTrigger>
                <TabsTrigger value="upload">CSV Upload</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {activeTab === "list" && (
                  <>
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search buckets..."
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
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    {selectedDate && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedDate(undefined)}>
                        Clear
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <TabsContent value="list" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Ticket Buckets</h3>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bucket
                </Button>
              </div>
              
              {isCreateModalOpen && (
                <Card className="border-primary/30 shadow-sm mb-6">
                  <CardContent className="pt-6">
                    <CreateTicketBucketForm 
                      onSuccess={handleCreateSuccess}
                      onCancel={() => setIsCreateModalOpen(false)}
                    />
                  </CardContent>
                </Card>
              )}
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"></div>
                  <p className="mt-2 text-muted-foreground">Loading ticket buckets...</p>
                </div>
              ) : sortedDates.length === 0 ? (
                <div className="text-center py-12 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">No ticket buckets found</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Ticket Bucket
                  </Button>
                </div>
              ) : (
                sortedDates.map(dateStr => {
                  const bucketsForDate = bucketsByDate[dateStr];
                  const date = new Date(dateStr);
                  const isPast = isAfter(new Date(), date);
                  
                  return (
                    <div key={dateStr} className="border rounded-md overflow-hidden">
                      <div className={cn(
                        "px-4 py-2 font-medium text-sm",
                        isPast ? "bg-gray-100 text-gray-700" : "bg-blue-50 text-blue-800"
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
                          </div>
                          <Badge variant={isPast ? "outline" : "secondary"}>
                            {isPast ? "Past Date" : "Upcoming"}
                          </Badge>
                        </div>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Reference Number</TableHead>
                            <TableHead>Bucket Type</TableHead>
                            <TableHead>Access Time</TableHead>
                            <TableHead>Tickets</TableHead>
                            <TableHead>Allocated</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bucketsForDate.map(bucket => (
                            <TableRow key={bucket.id}>
                              <TableCell className="font-medium">{bucket.reference_number}</TableCell>
                              <TableCell>
                                <Badge variant={bucket.bucket_type === 'petit' ? 'outline' : 'secondary'}>
                                  {bucket.bucket_type === 'petit' ? 'Petit (3-10)' : 'Grande (11-30)'}
                                </Badge>
                              </TableCell>
                              <TableCell>{bucket.access_time || "Not specified"}</TableCell>
                              <TableCell>{bucket.max_tickets}</TableCell>
                              <TableCell>{bucket.allocated_tickets}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={bucket.available_tickets > 5 ? "secondary" : "outline"}
                                  className={bucket.available_tickets > 5 
                                    ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}
                                >
                                  {bucket.available_tickets}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <AlertDialog open={bucketToDelete === bucket.id} onOpenChange={(open) => {
                                  if (!open) setBucketToDelete(null);
                                }}>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                      onClick={() => setBucketToDelete(bucket.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the ticket bucket with reference number 
                                        <span className="font-medium"> {bucket.reference_number}</span>.
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteBucket(bucket.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })
              )}
            </TabsContent>
            
            <TabsContent value="upload">
              <CSVUploader />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
