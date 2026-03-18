import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center bg-brand-bg z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-brand-primary animate-spin" />
        <p className="text-brand-primary font-bold animate-pulse">Loading Media Hub...</p>
      </div>
    </div>
  );
}
