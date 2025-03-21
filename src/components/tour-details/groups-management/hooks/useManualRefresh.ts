
import { useState } from "react";

export const useManualRefresh = (refreshParticipants: () => void) => {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  
  const handleManualRefresh = () => {
    setIsManualRefreshing(true);
    refreshParticipants(); // This will handle showing a toast itself
    setTimeout(() => setIsManualRefreshing(false), 1500);
  };
  
  return {
    isManualRefreshing,
    handleManualRefresh
  };
};
