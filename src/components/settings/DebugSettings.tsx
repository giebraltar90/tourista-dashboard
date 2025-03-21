
import React from 'react';
import { useDebug } from '@/contexts/DebugContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bug } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DebugSettings() {
  const { debugMode, toggleDebugMode } = useDebug();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer Settings</CardTitle>
        <CardDescription>
          Configure development and debugging options.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 p-4 rounded-md bg-muted/30">
          <Bug className={`h-5 w-5 ${debugMode ? 'text-red-500' : 'text-muted-foreground'}`} />
          <div className="flex-1">
            <Label htmlFor="settings-debug-mode" className="text-base font-medium">
              Debug Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable detailed logging and debugging information.
            </p>
          </div>
          <Switch 
            id="settings-debug-mode" 
            checked={debugMode} 
            onCheckedChange={toggleDebugMode} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
