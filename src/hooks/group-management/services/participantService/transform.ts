
import { VentrataParticipant } from '@/types/ventrata';

/**
 * Transform a database participant to a Ventrata participant
 */
export const transformToVentrataParticipant = (participant: any): VentrataParticipant => {
  return {
    id: participant.id,
    name: participant.name,
    count: participant.count || 1,
    bookingRef: participant.booking_ref,
    childCount: participant.child_count || 0,
    groupId: participant.group_id,
    group_id: participant.group_id,
    booking_ref: participant.booking_ref
  };
};
