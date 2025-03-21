
import React from 'react';
import { DebugToggle } from '@/components/debug/DebugToggle';

export const SidebarDebug = () => {
  return (
    <div className="mt-auto pb-4 px-4">
      <div className="p-2 rounded-md bg-muted/30">
        <h3 className="text-xs font-medium text-muted-foreground mb-2">Developer Options</h3>
        <DebugToggle />
      </div>
    </div>
  );
};
