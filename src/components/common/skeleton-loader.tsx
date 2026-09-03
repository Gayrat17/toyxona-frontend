import React from 'react';

interface SkeletonProps {
  count?: number;
}

export const SkeletonCardLoader: React.FC<SkeletonProps> = ({ count = 2 }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-lux overflow-hidden">
          <div className="skeleton h-56 w-full !rounded-none" />
          <div className="space-y-3 p-5">
            <div className="skeleton h-5 w-2/3" />
            <div className="skeleton h-3.5 w-1/2" />
            <div className="flex items-center justify-between border-t border-dashed border-line pt-4">
              <div className="space-y-2">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-4 w-24" />
              </div>
              <div className="skeleton h-9 w-9 !rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonTableLoader: React.FC = () => {
  return (
    <div className="card-lux space-y-4 p-6">
      <div className="skeleton h-6 w-1/4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton h-12 w-full" />
      ))}
    </div>
  );
};
