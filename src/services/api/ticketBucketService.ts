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
  
  console.log("🔍 [fetchTicketBuckets] Raw buckets from DB:", data);
  
  // Convert date strings to Date objects
  const buckets = data.map(bucket => ({
    ...bucket,
    date: new Date(bucket.date)
  })) as TicketBucket[];
  
  console.log("🔍 [fetchTicketBuckets] Processed buckets with Date objects:", 
    buckets.map(b => ({
      ...b,
      date: b.date.toISOString(),
      dateObj: {
        year: b.date.getFullYear(),
        month: b.date.getMonth() + 1,
        day: b.date.getDate(),
        fullDate: b.date.toDateString()
      }
    }))
  );
  
  return buckets;
};

export const fetchTicketBucketsByDate = async (date: Date) => {
  // IMPORTANT FIX: Set time to noon to avoid timezone issues
  // Create a new date object to avoid modifying the original
  const localDate = new Date(date);
  localDate.setHours(12, 0, 0, 0);
  
  // Format date to YYYY-MM-DD format to ensure proper comparison
  const formattedDate = localDate.toISOString().split('T')[0];
  
  console.log("🔍 [fetchTicketBucketsByDate] Input date:", date);
  console.log("🔍 [fetchTicketBucketsByDate] Local date with noon time:", localDate);
  console.log("🔍 [fetchTicketBucketsByDate] Formatted date for query:", formattedDate);
  console.log("🔍 [fetchTicketBucketsByDate] Date components:", {
    year: localDate.getFullYear(),
    month: localDate.getMonth() + 1,
    day: localDate.getDate(),
    ISOString: localDate.toISOString(),
    toDateString: localDate.toDateString()
  });
  
  const { data, error } = await supabase
    .from('ticket_buckets')
    .select('*')
    .eq('date', formattedDate)
    .order('access_time', { ascending: true });
  
  if (error) {
    console.error("🔴 [fetchTicketBucketsByDate] Error:", error);
    throw error;
  }
  
  console.log("🔍 [fetchTicketBucketsByDate] Raw response from DB:", data);
  
  // IMPORTANT FIX: When creating Date objects, set the time to noon to avoid timezone issues
  const buckets = data.map(bucket => {
    const bucketDate = new Date(bucket.date);
    bucketDate.setHours(12, 0, 0, 0);
    
    return {
      ...bucket,
      date: bucketDate
    };
  }) as TicketBucket[];
  
  console.log("🔍 [fetchTicketBucketsByDate] Processed buckets:", 
    buckets.map(b => ({
      id: b.id,
      reference_number: b.reference_number,
      date: b.date.toISOString(),
      dateComponents: {
        year: b.date.getFullYear(),
        month: b.date.getMonth() + 1,
        day: b.date.getDate(),
        fullDate: b.date.toDateString()
      }
    }))
  );
  
  return buckets;
};

export const createTicketBucket = async (bucket: TicketBucketFormValues) => {
  // IMPORTANT FIX: Set time to noon to avoid timezone issues
  const localDate = new Date(bucket.date);
  localDate.setHours(12, 0, 0, 0);
  
  // Format date for database
  const formattedDate = localDate.toISOString().split('T')[0];
  
  console.log("🔍 [createTicketBucket] Input date:", bucket.date);
  console.log("🔍 [createTicketBucket] Formatted date for DB:", formattedDate);
  
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
    console.error("🔴 [createTicketBucket] Error:", error);
    throw error;
  }
  
  // Create returned Date with noon time
  const returnDate = new Date(data[0].date);
  returnDate.setHours(12, 0, 0, 0);
  
  console.log("🔍 [createTicketBucket] Created bucket:", {
    ...data[0],
    dateCheck: {
      originalDate: returnDate.toISOString(),
      components: {
        year: returnDate.getFullYear(),
        month: returnDate.getMonth() + 1,
        day: returnDate.getDate()
      }
    }
  });
  
  return {
    ...data[0],
    date: returnDate
  } as TicketBucket;
};

export const updateTicketBucket = async (id: string, updates: Partial<TicketBucketFormValues>) => {
  // IMPORTANT FIX: Set time to noon for the date to avoid timezone issues
  let formattedUpdates = { ...updates };
  
  if (updates.date) {
    const localDate = new Date(updates.date);
    localDate.setHours(12, 0, 0, 0);
    
    formattedUpdates = {
      ...updates,
      date: localDate.toISOString().split('T')[0],
    };
    
    console.log("🔍 [updateTicketBucket] Original date:", updates.date);
    console.log("🔍 [updateTicketBucket] Fixed date with noon time:", localDate);
    console.log("🔍 [updateTicketBucket] Formatted date for DB:", formattedUpdates.date);
  }
  
  console.log("🔍 [updateTicketBucket] Updates to be applied:", formattedUpdates);
  
  const { data, error } = await supabase
    .from('ticket_buckets')
    .update(formattedUpdates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error("🔴 [updateTicketBucket] Error:", error);
    throw error;
  }
  
  // Create returned Date with noon time
  const returnDate = new Date(data[0].date);
  returnDate.setHours(12, 0, 0, 0);
  
  console.log("🔍 [updateTicketBucket] Updated bucket:", {
    ...data[0],
    dateCheck: {
      originalDate: returnDate.toISOString(),
      components: {
        year: returnDate.getFullYear(),
        month: returnDate.getMonth() + 1,
        day: returnDate.getDate()
      }
    }
  });
  
  return {
    ...data[0],
    date: returnDate
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
