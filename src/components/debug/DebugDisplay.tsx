
import React from 'react';
import { useRole } from '@/contexts/RoleContext';

export const DebugDisplay = () => {
  const { role, guideView, adminView, guideName } = useRole();
  
  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-4 rounded-lg opacity-70 hover:opacity-100 transition-opacity z-50 text-xs">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <ul className="space-y-1">
        <li><strong>Role:</strong> {role}</li>
        <li><strong>Guide View:</strong> {guideView ? 'Yes' : 'No'}</li>
        <li><strong>Admin View:</strong> {adminView ? 'Yes' : 'No'}</li>
        <li><strong>Guide Name:</strong> {guideName || 'None'}</li>
        <li><strong>Route:</strong> {window.location.pathname}</li>
      </ul>
    </div>
  );
};
