
import React from 'react';
import { useDebug } from '@/contexts/DebugContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bug } from 'lucide-react';

export const DebugToggle: React.FC = () => {
  const { debugMode, toggleDebugMode } = useDebug();

  return (
    <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/40">
      <Bug className={`h-4 w-4 ${debugMode ? 'text-red-500' : 'text-muted-foreground'}`} />
      <Switch 
        id="debug-mode" 
        checked={debugMode} 
        onCheckedChange={toggleDebugMode} 
      />
      <Label htmlFor="debug-mode" className="text-xs">
        {debugMode ? 'Debug: ON' : 'Debug: OFF'}
      </Label>
    </div>
  );
};
