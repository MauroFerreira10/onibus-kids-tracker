
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const RoutesLoading = () => {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-full h-16" />
      ))}
    </div>
  );
};
