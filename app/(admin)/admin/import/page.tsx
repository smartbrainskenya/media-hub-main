import ImportForm from '@/components/admin/ImportForm';

export default function AdminImportPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1 border-b border-brand-border pb-6">
        <h1 className="text-3xl font-bold text-brand-primary">Import by URL</h1>
        <p className="text-brand-muted">Import media directly from an external web address.</p>
      </div>
      <ImportForm />
    </div>
  );
}
