'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AssetRequest } from '@/types';

type FilterStatus = 'all' | 'pending' | 'fulfilled';

export default function RequestLogsClient() {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/admin/requests');
        const result = (await response.json()) as { data: AssetRequest[] | null; error: string | null };

        if (!response.ok || result.error) {
          throw new Error(result.error || 'Failed to fetch requests');
        }

        setRequests(result.data || []);
      } catch (fetchError) {
        console.error(fetchError);
        setError('Could not load requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const sortedRequests = useMemo(() => {
    const filtered = filterStatus === 'all'
      ? requests
      : requests.filter((request) => request.status === filterStatus);

    return [...filtered].sort(
      (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    );
  }, [filterStatus, requests]);

  const pendingCount = requests.filter((request) => request.status === 'pending').length;
  const fulfilledCount = requests.filter((request) => request.status === 'fulfilled').length;

  const formatDate = (value: string) =>
    new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleFulfill = async (id: string) => {
    setUpdatingId(id);

    try {
      const response = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'fulfilled' }),
      });

      const result = (await response.json()) as { data: AssetRequest | null; error: string | null };

      if (!response.ok || result.error || !result.data) {
        throw new Error(result.error || 'Failed to update request');
      }

      setRequests((current) =>
        current.map((request) => (request.id === id ? result.data! : request))
      );
      toast.success('Request marked as completed');
    } catch (updateError) {
      console.error(updateError);
      toast.error(updateError instanceof Error ? updateError.message : 'Failed to update request');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-bold text-brand-primary">Asset Request Logs</h1>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"></span>
              Persistent Storage Active
            </span>
          </div>
          <p className="text-brand-muted">Review and manage student requests for missing images and videos.</p>
        </div>
        <div className="rounded-xl border border-brand-border bg-white px-6 py-20 text-center shadow-sm">
          <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-brand-primary/20 border-t-brand-primary"></div>
          <p className="text-brand-muted">Fetching requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-brand-primary">Asset Request Logs</h1>
          <p className="text-brand-muted">Review and manage student requests for missing images and videos.</p>
        </div>
        <div className="rounded-xl border border-brand-border bg-white px-6 py-20 text-center shadow-sm">
          <div className="mb-4 text-5xl text-brand-danger">⚠️</div>
          <p className="text-brand-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-3xl font-bold text-brand-primary">Asset Request Logs</h1>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-bg px-3 py-1 text-xs font-semibold text-brand-muted">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"></span>
            Persistent Storage Active
          </span>
        </div>
        <p className="text-brand-muted">Review and manage student requests for missing images and videos.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Total', value: requests.length, className: 'bg-white border-brand-border text-brand-primary' },
          { label: 'Pending', value: pendingCount, className: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Fulfilled', value: fulfilledCount, className: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl border p-6 shadow-sm ${card.className}`}>
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="mt-1 text-sm font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {([
          ['all', 'Show All'],
          ['pending', 'Pending'],
          ['fulfilled', 'Fulfilled'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilterStatus(value)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              filterStatus === value
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-brand-border bg-white text-brand-muted hover:border-brand-primary/30 hover:text-brand-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sortedRequests.length === 0 ? (
        <div className="rounded-xl border border-brand-border bg-white px-6 py-20 text-center shadow-sm">
          <div className="mb-4 text-5xl">📁</div>
          <h3 className="text-xl font-bold text-brand-primary">No asset requests yet.</h3>
          <p className="mt-2 text-brand-muted">Student requests will appear here once submitted.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-white shadow-sm">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg text-left text-xs font-bold uppercase tracking-[0.08em] text-brand-muted">
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Type</th>
                <th className="px-4 py-4">Request Detail</th>
                <th className="px-4 py-4">Context</th>
                <th className="px-4 py-4">Note</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequests.map((request) => (
                <tr
                  key={request.id}
                  className={`border-b border-brand-border/60 align-top last:border-b-0 hover:bg-brand-bg/60 ${
                    request.status === 'fulfilled' ? 'opacity-60' : ''
                  }`}
                >
                  <td className="px-4 py-5 text-sm text-brand-text">{formatDate(request.created_at)}</td>
                  <td className="px-4 py-5 text-sm">
                    <span
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold ${
                        request.type === 'image'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-violet-100 text-violet-700'
                      }`}
                    >
                      {request.type === 'image' ? '🖼️' : '▶️'} {request.type}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-sm font-semibold text-brand-primary">{request.query}</td>
                  <td className="px-4 py-5 text-sm">
                    <span className="inline-flex items-center gap-2 rounded-md border border-brand-border bg-brand-bg px-3 py-1 text-xs font-semibold text-brand-muted">
                      {request.context === 'project' ? '🎓 Project' : '📚 Class'}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-sm text-brand-text">
                    {request.note ? request.note : <span className="text-brand-muted">—</span>}
                  </td>
                  <td className="px-4 py-5 text-sm">
                    <span
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold ${
                        request.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {request.status === 'pending' ? '⏳ Pending' : '✓ Fulfilled'}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-sm">
                    {request.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => handleFulfill(request.id)}
                        disabled={updatingId === request.id}
                        className="rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-primary/85 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingId === request.id ? 'Completing...' : 'Complete'}
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
