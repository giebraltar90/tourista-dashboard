
import { supabase } from "@/integrations/supabase/client";
import { CSVTicketBucket, TicketBucket, TicketBucketFormValues } from "@/types/ticketBuckets";
import { toast } from "sonner";

export const fetchTicketBuckets = async () => {
  const { data, error } = await supabase
    .from('ticket_buckets')
    .select('*')
    .order('date', { ascending: true });
  
  if (error) {
    console.error("Error fetching ticket buckets:", error);
    throw error;
  }
  
  // Convert date strings to Date objects
  return data.map(bucket => ({
    ...bucket,
    date: new Date(bucket.date)
  })) as TicketBucket[];
};

export const fetchTicketBucketsByDate = async (date: Date) => {
  // Format date to YYYY-MM-DD format to ensure proper comparison
  // Add timezone offset fix by setting the time to noon to avoid timezone issues
  const localDate = new Date(date);
  localDate.setHours(12, 0, 0, 0);
  const formattedDate = localDate.toISOString().split('T')[0];
  console.log("Fetching buckets for formatted date:", formattedDate, "Original date:", date);
  
  const { data, error } = await supabase
    .from('ticket_buckets')
    .select('*')
    .eq('date', formattedDate)
    .order('access_time', { ascending: true });
  
  if (error) {
    console.error("Error fetching ticket buckets by date:", error);
    throw error;
  }
  
  console.log("API response for buckets:", data);
  
  return data.map(bucket => ({
    ...bucket,
    date: new Date(bucket.date)
  })) as TicketBucket[];
};

export const createTicketBucket = async (bucket: TicketBucketFormValues) => {
  // Format date for database
  const formattedDate = bucket.date.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('ticket_buckets')
    .insert([
      {
        ...bucket,
        date: formattedDate,
      }
    ])
    .select();
  
  if (error) {
    console.error("Error creating ticket bucket:", error);
    throw error;
  }
  
  return {
    ...data[0],
    date: new Date(data[0].date)
  } as TicketBucket;
};

export const updateTicketBucket = async (id: string, updates: Partial<TicketBucketFormValues>) => {
  // Format date for database if it's present
  const formattedUpdates = {
    ...updates,
    date: updates.date ? updates.date.toISOString().split('T')[0] : undefined,
  };
  
  const { data, error } = await supabase
    .from('ticket_buckets')
    .update(formattedUpdates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error("Error updating ticket bucket:", error);
    throw error;
  }
  
  return {
    ...data[0],
    date: new Date(data[0].date)
  } as TicketBucket;
};

export const deleteTicketBucket = async (id: string) => {
  const { error } = await supabase
    .from('ticket_buckets')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting ticket bucket:", error);
    throw error;
  }
  
  return true;
};

export const uploadCSVBuckets = async (buckets: CSVTicketBucket[]) => {
  // Process each CSV bucket entry
  const formattedBuckets = buckets.map(bucket => {
    const maxTickets = determineBucketSize(bucket.reference_number);
    const bucketType = determineBucketType(maxTickets);
    const ticketsRange = bucketType === 'petit' ? '3-10' : '11-30';
    
    return {
      reference_number: bucket.reference_number,
      bucket_type: bucketType,
      tickets_range: ticketsRange,
      max_tickets: maxTickets,
      allocated_tickets: 0,
      date: bucket.date,
      access_time: bucket.access_time,
    };
  });
  
  // Insert the processed buckets
  const { data, error } = await supabase
    .from('ticket_buckets')
    .insert(formattedBuckets)
    .select();
  
  if (error) {
    console.error("Error uploading CSV buckets:", error);
    throw error;
  }
  
  return data.map(bucket => ({
    ...bucket,
    date: new Date(bucket.date)
  })) as TicketBucket[];
};

// Helper function to determine bucket type based on reference number
function determineBucketSize(referenceNumber: string): number {
  // This is a placeholder implementation
  // In a real scenario, we would parse the reference number to determine the bucket size
  // For now, we'll assume the reference number format indicates the bucket size
  
  // For example, if the reference number ends with "P", it's a petit bucket (max 10)
  // If it ends with "G", it's a grande bucket (max 30)
  if (referenceNumber.toUpperCase().endsWith('P')) {
    return 10;
  } else if (referenceNumber.toUpperCase().endsWith('G')) {
    return 30;
  } else {
    // Default behavior: analyze the reference number length or format
    // This is just a placeholder and should be replaced with actual logic
    return referenceNumber.length > 10 ? 30 : 10;
  }
}

function determineBucketType(maxTickets: number): 'petit' | 'grande' {
  return maxTickets <= 10 ? 'petit' : 'grande';
}
