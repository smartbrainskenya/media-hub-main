import UploadForm from '@/components/admin/UploadForm';

export default function AdminUploadPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1 border-b border-brand-border pb-6">
        <h1 className="text-3xl font-bold text-brand-primary">Upload Media</h1>
        <p className="text-brand-muted">Select an image or video file to add to the library.</p>
      </div>
      <UploadForm />
    </div>
  );
}
