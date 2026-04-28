'use client';

import { useEffect, useState } from 'react';
import PublicToast from './PublicToast';
import { AssetRequestContext, MediaType } from '@/types';

interface RequestAssetModalProps {
  initialQuery?: string;
  initialType?: MediaType;
  onClose: () => void;
}

type RequestStatus = 'idle' | 'submitting' | 'success';

export default function RequestAssetModal({
  initialQuery = '',
  initialType = 'image',
  onClose,
}: RequestAssetModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<MediaType>(initialType);
  const [context, setContext] = useState<AssetRequestContext>('project');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) {
      setToast({
        message: "Please describe what you're looking for (at least 3 characters).",
        type: 'error',
      });
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmedQuery,
          type,
          context,
          note: note.trim(),
        }),
      });

      const result = (await response.json()) as { error?: string | null };
      if (!response.ok) {
        throw new Error(result.error || 'Request failed');
      }

      setStatus('success');
    } catch (error) {
      setStatus('idle');
      setToast({
        message:
          error instanceof Error ? error.message : 'Failed to send request. Please try again.',
        type: 'error',
      });
    }
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="legacy-modal-backdrop" onClick={handleBackdropClick}>
      <div className="legacy-modal-content legacy-request-modal-content" role="dialog" aria-modal="true">
        <div className="legacy-request-header">
          <h2>Request Missing Asset</h2>
          <button
            type="button"
            className="legacy-modal-close"
            style={{ position: 'static' }}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="legacy-request-body">
          {status === 'success' ? (
            <div className="legacy-success-state">
              <div className="legacy-success-icon">✓</div>
              <h3 className="legacy-success-title">Request sent successfully!</h3>
              <p className="legacy-success-copy">
                We&apos;ll add <strong>&quot;{query.trim()}&quot;</strong> to our collection soon.
              </p>
              <p className="legacy-success-subtext">Check back to see your request in action!</p>
              <button type="button" className="legacy-btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="legacy-form-group">
                <label className="legacy-form-label" htmlFor="request-query">
                  What are you looking for?
                </label>
                <p className="legacy-form-hint">Be specific to help us find it faster</p>
                <input
                  id="request-query"
                  type="text"
                  className="legacy-form-input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. Red apple, Mountain landscape, Soccer goals"
                  minLength={3}
                  required
                  autoFocus
                  disabled={status === 'submitting'}
                />
                <small className="legacy-character-count">{query.trim().length} characters</small>
              </div>

              <div className="legacy-form-group">
                <span className="legacy-form-label">Media Type</span>
                <div className="legacy-radio-group">
                  {[
                    { value: 'image' as const, label: 'Image', icon: '🖼' },
                    { value: 'video' as const, label: 'Video', icon: '▶' },
                  ].map((option) => (
                    <label key={option.value} className="legacy-radio-card">
                      <input
                        type="radio"
                        name="type"
                        value={option.value}
                        checked={type === option.value}
                        onChange={() => setType(option.value)}
                        disabled={status === 'submitting'}
                      />
                      <span className="legacy-radio-card-content">
                        <span>{option.icon}</span>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="legacy-form-group">
                <span className="legacy-form-label">Purpose</span>
                <div className="legacy-radio-group">
                  {[
                    { value: 'project' as const, label: 'School Project', icon: '🎓' },
                    { value: 'class' as const, label: 'Class Work', icon: '📚' },
                  ].map((option) => (
                    <label key={option.value} className="legacy-radio-card">
                      <input
                        type="radio"
                        name="context"
                        value={option.value}
                        checked={context === option.value}
                        onChange={() => setContext(option.value)}
                        disabled={status === 'submitting'}
                      />
                      <span className="legacy-radio-card-content">
                        <span>{option.icon}</span>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="legacy-form-group">
                <label className="legacy-form-label" htmlFor="request-note">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="request-note"
                  className="legacy-form-textarea"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="e.g. Needed for a portfolio website or school presentation"
                  disabled={status === 'submitting'}
                />
              </div>

              <div className="legacy-form-actions">
                <button
                  type="button"
                  className="legacy-btn-secondary"
                  onClick={onClose}
                  disabled={status === 'submitting'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="legacy-btn-primary"
                  disabled={status === 'submitting' || query.trim().length < 3}
                >
                  {status === 'submitting' ? (
                    <>
                      <span style={{ opacity: 0.7 }}>Sending...</span>
                      <span className="legacy-loading-dot">•</span>
                    </>
                  ) : (
                    'Send Request'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {toast ? (
        <PublicToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
