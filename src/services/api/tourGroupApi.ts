
/**
 * This file re-exports all tour group related functions for backward compatibility
 */

export { updateTourGroups } from './tourGroupsService';
export { updateGuideInSupabase } from './guideAssignmentService';
export { isValidUuid, isSpecialGuideId } from './utils/guidesUtils';
