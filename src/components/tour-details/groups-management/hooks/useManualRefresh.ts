
import { useState } from "react";
import { toast } from "sonner";

export const useManualRefresh = (refreshCallback: () => void) => {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refreshCallback();
      toast.success("Participants refreshed");
    } catch (error) {
      console.error("Error refreshing participants:", error);
      toast.error("Failed to refresh participants");
    } finally {
      setTimeout(() => {
        setIsManualRefreshing(false);
      }, 500);
    }
  };
  
  return {
    isManualRefreshing,
    handleManualRefresh
  };
};
