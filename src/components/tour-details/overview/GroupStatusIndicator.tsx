
import { Users, UserPlus } from "lucide-react";

interface GroupStatusIndicatorProps {
  isAssigned: boolean;
}

export const GroupStatusIndicator = ({ isAssigned }: GroupStatusIndicatorProps) => {
  return (
    <div className={`p-2 rounded-full ${isAssigned ? 'bg-green-100' : 'bg-gray-100'}`}>
      {isAssigned ? <Users className="h-4 w-4 text-green-600" /> : <UserPlus className="h-4 w-4 text-gray-400" />}
    </div>
  );
};
