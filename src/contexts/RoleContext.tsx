
import React, { createContext, useContext, useState, ReactNode } from "react";

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
  const [guideView, setGuideView] = useState<boolean>(false);
  const [adminView, setAdminView] = useState<boolean>(false);
  const [role, setRoleInternal] = useState<string>("user");
  const [guideName, setGuideName] = useState<string | null>(null);
  
  // Function to set both role and related details
  const setRole = (value: string, details?: any) => {
    setRoleInternal(value);
    
    // When setting to guide role, also update guideView
    if (value === "guide") {
      setGuideView(true);
      // Set guide name if provided
      if (details && details.guideName) {
        setGuideName(details.guideName);
      }
    } else {
      // Reset guide view when changing to other roles
      setGuideView(false);
      setGuideName(null);
    }
    
    // Set admin view if role is admin
    if (value === "admin") {
      setAdminView(true);
    } else {
      setAdminView(false);
    }
  };
  
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
