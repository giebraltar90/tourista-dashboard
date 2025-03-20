
import React from 'react';

export interface ParticipantDropZoneProps {
  groupIndex: number;
  children: React.ReactNode;
}

export const ParticipantDropZone = ({ groupIndex, children }: ParticipantDropZoneProps) => {
  return (
    <div 
      className="border border-dashed border-gray-200 rounded-md p-4 w-full flex items-center justify-center"
      data-group-index={groupIndex}
    >
      {children}
    </div>
  );
};
