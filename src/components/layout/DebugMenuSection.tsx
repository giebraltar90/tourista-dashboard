
import React from 'react';
import { DebugToggle } from '../debug/DebugToggle';
import { Separator } from '@/components/ui/separator';

export const DebugMenuSection = () => {
  return (
    <div className="py-2">
      <Separator className="my-2" />
      <div className="px-2 py-1">
        <p className="text-xs font-medium text-muted-foreground mb-2">Developer Options</p>
        <DebugToggle />
      </div>
    </div>
  );
};
