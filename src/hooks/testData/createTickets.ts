
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates test tickets in the database
 */
export const createTestTickets = async (tourData: Array<{id: string}>) => {
  console.log("Creating test tickets...");
  
  // Create tickets for the tours
  const tickets = [];
  
  // First tour with standard tickets
  const firstTourTickets = [
    {
      tour_id: tourData[0].id,
      ticket_type: 'adult',
      quantity: 6,
      status: 'purchased',
      reference: 'TKT-001'
    },
    {
      tour_id: tourData[0].id,
      ticket_type: 'child',
      quantity: 2,
      status: 'purchased',
      reference: 'TKT-002'
    },
    {
      tour_id: tourData[0].id,
      ticket_type: 'guide',
      quantity: 1,
      status: 'purchased',
      reference: 'TKT-G01'
    }
  ];
  
  tickets.push(...firstTourTickets);
  
  // Second tour with a mix of purchased and pending tickets
  const secondTourTickets = [
    {
      tour_id: tourData[1].id,
      ticket_type: 'adult',
      quantity: 8,
      status: 'purchased',
      reference: 'TKT-003'
    },
    {
      tour_id: tourData[1].id,
      ticket_type: 'child',
      quantity: 3,
      status: 'pending',
      reference: 'TKT-004'
    },
    {
      tour_id: tourData[1].id,
      ticket_type: 'guide',
      quantity: 2,
      status: 'purchased',
      reference: 'TKT-G02'
    }
  ];
  
  tickets.push(...secondTourTickets);
  
  // Create tickets for the third tour if it exists
  if (tourData.length > 2) {
    const thirdTourTickets = [
      {
        tour_id: tourData[2].id,
        ticket_type: 'adult',
        quantity: 10,
        status: 'purchased',
        reference: 'TKT-005'
      },
      {
        tour_id: tourData[2].id,
        ticket_type: 'child',
        quantity: 5,
        status: 'purchased',
        reference: 'TKT-006'
      }
    ];
    
    tickets.push(...thirdTourTickets);
  }
  
  // Insert tickets into the tickets table
  const { data: ticketData, error: ticketError } = await supabase
    .from('tickets')
    .insert(tickets)
    .select();
    
  if (ticketError) {
    console.error("Error creating tickets:", ticketError);
    console.log("Continuing without tickets");
    return [];
  }
  
  console.log("Created test tickets:", ticketData);
  return ticketData || [];
};
