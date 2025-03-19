
import { User, UserPlus } from "lucide-react";

interface GroupStatusIndicatorProps {
  isAssigned: boolean;
}

export const GroupStatusIndicator = ({ isAssigned }: GroupStatusIndicatorProps) => {
  return (
    <div className={`p-2 rounded-full ${isAssigned ? 'bg-green-100' : 'bg-gray-100'}`}>
      {isAssigned ? 
        <User className="h-5 w-5 text-green-600" /> : 
        <UserPlus className="h-5 w-5 text-gray-400" />
      }
    </div>
  );
};
