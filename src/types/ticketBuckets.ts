
export interface TourAllocation {
  tour_id: string;
  tickets_required: number;
  assigned_at: string;
}

export interface TicketBucket {
  id: string;
  reference_number: string;
  bucket_type: 'petit' | 'grande';
  tickets_range: string;
  max_tickets: number;
  allocated_tickets: number;
  available_tickets: number;
  date: Date;
  access_time: string | null;
  tour_id: string | null;
  assigned_tours: string[];
  tour_allocations: TourAllocation[];
  created_at: string;
  updated_at: string;
  guide_tickets?: number; // Added for UI display purposes
}

export interface TicketBucketFormValues {
  reference_number: string;
  bucket_type: 'petit' | 'grande';
  tickets_range: string;
  max_tickets: number;
  date: Date;
  access_time: string;
  tour_id?: string;
}

export interface CSVTicketBucket {
  reference_number: string;
  date: string;
  access_time: string;
}
