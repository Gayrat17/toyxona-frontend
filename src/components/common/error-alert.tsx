import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message = "Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, server ishlayotganini tekshiring.", 
  onRetry 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-600 dark:text-rose-400">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-6 w-6 shrink-0 text-rose-500" />
        <div>
          <h4 className="font-bold text-sm">Xatolik yuz berdi</h4>
          <p className="text-xs opacity-90 mt-0.5">{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-500 shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Qayta urinish</span>
        </button>
      )}
    </div>
  );
};
