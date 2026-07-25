import React from 'react';

interface SkeletonProps {
  count?: number;
}

export const SkeletonCardLoader: React.FC<SkeletonProps> = ({ count = 2 }) => {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800 mb-3" />
          <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-800 mb-6" />
          <div className="flex gap-4">
            <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonTableLoader: React.FC = () => {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="h-6 w-1/4 rounded bg-slate-200 dark:bg-slate-800 mb-4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 w-full rounded bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
  );
};
