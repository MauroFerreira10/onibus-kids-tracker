
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const RoutesLoading = () => {
  return (
    <div className="space-y-4" role="status" aria-label="Carregando rotas">
      {/* Filter skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-40" />
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Routes skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center p-5 border border-gray-200 rounded-xl bg-white">
            <Skeleton className="h-12 w-12 rounded-lg mr-4" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-4 pt-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Carregando...</span>
    </div>
  );
};
