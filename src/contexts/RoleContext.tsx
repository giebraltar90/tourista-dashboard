
import React, { createContext, useContext, useState, ReactNode } from "react";

interface RoleContextType {
  guideView: boolean;
  adminView: boolean;
  setGuideView: (value: boolean) => void;
  setAdminView: (value: boolean) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [guideView, setGuideView] = useState<boolean>(false);
  const [adminView, setAdminView] = useState<boolean>(false);

  return (
    <RoleContext.Provider
      value={{
        guideView,
        adminView,
        setGuideView,
        setAdminView,
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
