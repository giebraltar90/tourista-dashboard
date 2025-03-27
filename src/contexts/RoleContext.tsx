
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface RoleContextType {
  guideView: boolean;
  adminView: boolean;
  role: string;
  guideName: string | null;
  setGuideView: (value: boolean) => void;
  setAdminView: (value: boolean) => void;
  setRole: (value: string, details?: any) => void;
  setDebugMode: (value: boolean) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with adminView as true and role as "admin"
  const [guideView, setGuideView] = useState<boolean>(false);
  const [adminView, setAdminView] = useState<boolean>(true);
  const [role, setRoleInternal] = useState<string>("admin");
  const [guideName, setGuideName] = useState<string | null>(null);
  
  // Function to set both role and related details
  const setRole = (value: string, details?: any) => {
    setRoleInternal(value);
    
    // When setting to guide role, also update guideView
    if (value === "guide") {
      setGuideView(true);
      setAdminView(false);
      // Set guide name if provided
      if (details && details.guideName) {
        setGuideName(details.guideName);
      }
    } else if (value === "admin") {
      // Set admin view if role is admin
      setAdminView(true);
      setGuideView(false);
      setGuideName(null);
    } else {
      // Reset guide view when changing to other roles
      setGuideView(false);
      setAdminView(false);
      setGuideName(null);
    }
  };
  
  // Apply admin role on initial mount
  useEffect(() => {
    setRole("admin");
  }, []);
  
  // Dummy setDebugMode function to satisfy interface
  const setDebugMode = (value: boolean) => {
    // This just forwards to the logger if available
    if (window && (window as any).logger && (window as any).logger.setLogLevel) {
      (window as any).logger.setLogLevel(value ? 'debug' : 'info');
    }
  };

  return (
    <RoleContext.Provider
      value={{
        guideView,
        adminView,
        role,
        guideName,
        setGuideView,
        setAdminView,
        setRole,
        setDebugMode
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
