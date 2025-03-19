
import { createContext, useContext, useState, ReactNode } from "react";

type Role = "operator" | "guide";
type GuideView = { type: "guide"; guideName: string } | null;

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  guideView: GuideView;
  setGuideView: (view: GuideView) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("operator");
  const [guideView, setGuideView] = useState<GuideView>(null);

  return (
    <RoleContext.Provider value={{ role, setRole, guideView, setGuideView }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
