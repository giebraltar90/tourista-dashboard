
import { AddGroupButton } from "./AddGroupButton";

interface GroupsListHeaderProps {
  groupCount: number;
  onAddGroupClick: () => void;
}

export const GroupsListHeader = ({ groupCount, onAddGroupClick }: GroupsListHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="font-medium">Groups ({groupCount})</h3>
      <AddGroupButton onClick={onAddGroupClick} />
    </div>
  );
};
