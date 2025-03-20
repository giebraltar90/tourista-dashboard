
/**
 * Apply optimistic update to the UI for guide assignment
 */
export const applyOptimisticUpdate = (
  queryClient: any,
  tourId: string,
  groupIndex: number,
  actualGuideId: string | null,
  groupName: string,
  guideName: string
): void => {
  queryClient.setQueryData(['tour', tourId], (oldData: any) => {
    if (!oldData) return null;
    
    // Create a deep copy to avoid reference issues
    const newData = JSON.parse(JSON.stringify(oldData));
    
    // Update the specific group
    if (newData.tourGroups && newData.tourGroups[groupIndex]) {
      newData.tourGroups[groupIndex].guideId = actualGuideId;
      newData.tourGroups[groupIndex].name = groupName;
      
      // Also update guideName if present
      if (actualGuideId) {
        newData.tourGroups[groupIndex].guideName = guideName;
      } else {
        newData.tourGroups[groupIndex].guideName = undefined;
      }
    }
    
    return newData;
  });
};

/**
 * Handle post-assignment cache invalidation and refetching
 */
export const refreshCacheAfterAssignment = (
  queryClient: any,
  tourId: string,
  refetch: () => Promise<any>
): void => {
  // Force a refetch after a delay to ensure server data is synced
  setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    queryClient.invalidateQueries({ queryKey: ['tours'] });
    refetch();
  }, 800);
};
