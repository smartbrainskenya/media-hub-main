'use client';

import { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function URLCopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else throw new Error('Clipboard API not available');
    } catch {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 bg-brand-bg border border-brand-border rounded-lg p-1 group">
        <code className="flex-grow font-mono text-sm text-brand-primary px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">{url}</code>
        <button onClick={handleCopy} className={cn("flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all", copied ? "bg-brand-success text-white" : "bg-brand-secondary text-brand-primary hover:bg-opacity-90")}>
          {copied ? <><Check className="h-4 w-4" />Copied!</> : <><Copy className="h-4 w-4" />Copy URL</>}
        </button>
      </div>
      {error && <p className="text-xs text-brand-danger flex items-center gap-1"><AlertCircle className="h-3 w-3" />Failed to copy. Please manually copy the URL.</p>}
    </div>
  );
}
