'use client';

import { useEffect } from 'react';

interface PublicToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function PublicToast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
}: PublicToastProps) {
  useEffect(() => {
    const timeout = setTimeout(onClose, duration);
    return () => clearTimeout(timeout);
  }, [duration, onClose]);

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return (
    <div className={`legacy-toast legacy-toast-${type}`} role="status" aria-live="polite">
      <div className="legacy-toast-content">
        <span className="legacy-toast-icon">{icon}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
