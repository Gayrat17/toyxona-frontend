import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message = "Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, server ishlayotganini tekshiring.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-danger/30 bg-danger/5 p-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-danger/40 bg-danger/10">
          <AlertCircle className="h-5 w-5 text-danger" />
        </span>
        <div>
          <h4 className="text-sm font-extrabold text-ink">Xatolik yuz berdi</h4>
          <p className="mt-0.5 text-xs text-ink-soft">{message}</p>
        </div>
      </div>

      {onRetry && (
        <button onClick={onRetry} className="btn-outline !py-2 !text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Qayta urinish</span>
        </button>
      )}
    </div>
  );
};
