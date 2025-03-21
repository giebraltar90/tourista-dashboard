
/**
 * Creates a deep copy of participants to preserve them during guide assignment
 */
export const preserveParticipants = (targetGroup: any) => {
  // Check if the group has participants
  if (!targetGroup.participants) {
    console.log("No participants to preserve in the group");
    return [];
  }
  
  // Make a deep copy to avoid reference issues
  try {
    const preservedParticipants = JSON.parse(JSON.stringify(targetGroup.participants));
    return preservedParticipants;
  } catch (error) {
    console.error("Error preserving participants:", error);
    // Return empty array as fallback
    return [];
  }
};

/**
 * Creates an updated group with guide assignment while preserving participants
 */
export const createUpdatedGroupWithPreservedParticipants = (
  group: any,
  actualGuideId: string | null,
  groupName: string,
  existingParticipants: any[]
) => {
  return {
    ...group,
    guideId: actualGuideId,
    name: groupName,
    // Preserve the existing participants
    participants: existingParticipants,
    // Maintain the original size and childCount
    size: group.size,
    childCount: group.childCount
  };
};
