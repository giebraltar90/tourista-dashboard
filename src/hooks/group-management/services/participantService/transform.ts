
import { VentrataParticipant } from '@/types/ventrata';

/**
 * Transforms a database participant record to a VentrataParticipant object
 */
export const transformToVentrataParticipant = (dbParticipant: any): VentrataParticipant => {
  return {
    id: dbParticipant.id,
    name: dbParticipant.name || 'Unknown Participant',
    count: dbParticipant.count || 1,
    bookingRef: dbParticipant.booking_ref || '',
    childCount: dbParticipant.child_count || 0,
    groupId: dbParticipant.group_id || null,
    // Include database-compatible fields
    booking_ref: dbParticipant.booking_ref || '',
    group_id: dbParticipant.group_id || null,
    child_count: dbParticipant.child_count || 0,
    created_at: dbParticipant.created_at,
    updated_at: dbParticipant.updated_at
  };
};

/**
 * Transforms a VentrataParticipant object to a database record
 */
export const transformToDbParticipant = (participant: VentrataParticipant): any => {
  return {
    id: participant.id,
    name: participant.name,
    count: participant.count || 1,
    booking_ref: participant.bookingRef || participant.booking_ref || '',
    child_count: participant.childCount || participant.child_count || 0,
    group_id: participant.groupId || participant.group_id || null,
  };
};
