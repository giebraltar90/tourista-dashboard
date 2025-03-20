
import { useState, useCallback } from "react";

/**
 * Hook for managing drop target highlighting and interactions
 */
export const useDropTarget = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  }, [isDragOver]);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set isDragOver to false if we're leaving the target (not entering a child)
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragOver(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    setIsDragOver(false);
  }, []);
  
  return {
    isDragOver,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setIsDragOver
  };
};
