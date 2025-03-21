
import { Button } from "@/components/ui/button";
import { VentrataParticipant } from "@/types/ventrata";

interface MoveTargetBannerProps {
  selectedParticipant: { participant: VentrataParticipant; fromGroupIndex: number } | null;
  groupIndex: number;
  isMovePending: boolean;
  isTransferring: boolean;
  onMoveToThisGroup: () => void;
}

export const MoveTargetBanner = ({
  selectedParticipant,
  groupIndex,
  isMovePending,
  isTransferring,
  onMoveToThisGroup
}: MoveTargetBannerProps) => {
  // Only show if a participant is selected and it's from a different group
  if (!selectedParticipant || selectedParticipant.fromGroupIndex === groupIndex) {
    return null;
  }
  
  return (
    <div className="bg-primary/10 border border-primary/30 rounded-md p-2 mb-2">
      <div className="flex justify-between items-center">
        <span className="text-sm">
          Move <span className="font-medium">{selectedParticipant.participant.name}</span> to this group?
        </span>
        <Button 
          size="sm" 
          variant="default"
          onClick={onMoveToThisGroup}
          disabled={isMovePending || isTransferring}
        >
          {isMovePending || isTransferring ? "Moving..." : "Move Here"}
        </Button>
      </div>
    </div>
  );
};
