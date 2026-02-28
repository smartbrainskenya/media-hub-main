'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { MediaAsset } from '@/types';

interface DeleteConfirmModalProps {
  asset: MediaAsset;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  asset,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = async () => {
    if (!isConfirmed) {
      setIsConfirmed(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setIsDeleting(false);
      setIsConfirmed(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-primary/40 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl border border-brand-border text-center space-y-6 animate-in zoom-in duration-200">
        <div className="mx-auto p-4 bg-brand-danger/10 rounded-full w-20 h-20 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-brand-danger" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-brand-primary">Permanently Delete?</h3>
          <p className="text-brand-muted">
            Are you sure you want to delete <strong className="text-brand-primary">"{asset.title}"</strong>? 
            This action cannot be undone and will remove the file from our servers.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              isConfirmed 
                ? "bg-brand-danger text-white hover:bg-opacity-90 shadow-lg shadow-brand-danger/20" 
                : "bg-brand-bg text-brand-danger border-2 border-brand-danger hover:bg-brand-danger/5"
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Deleting...
              </>
            ) : isConfirmed ? (
              "Yes, Delete Forever"
            ) : (
              "Confirm Deletion"
            )}
          </button>
          
          {!isDeleting && (
            <button
              onClick={onCancel}
              className="w-full py-3 text-brand-muted font-semibold hover:text-brand-primary transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
