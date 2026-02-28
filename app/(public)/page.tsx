import Link from 'next/link';
import { Image as ImageIcon, Film, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="max-w-3xl px-4 space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-primary tracking-tight">
          Smart Brains <span className="text-brand-secondary">Media Hub</span>
        </h1>
        <p className="text-lg md:text-xl text-brand-muted max-w-2xl mx-auto">
          A curated media library for Smart Brains students. 
          Easily find and use branded images and videos for your coding projects.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-16 w-full max-w-4xl px-4">
        <Link 
          href="/images" 
          className="group relative overflow-hidden bg-brand-surface border border-brand-border rounded-2xl p-8 transition-all hover:shadow-xl hover:border-brand-primary"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-brand-primary/10 rounded-full group-hover:scale-110 transition-transform">
              <ImageIcon className="h-10 w-10 text-brand-primary" />
            </div>
            <h2 className="text-2xl font-bold text-brand-primary">Browse Images</h2>
            <p className="text-brand-muted">
              Access high-quality icons, illustrations, and photos for your HTML projects.
            </p>
            <div className="flex items-center gap-2 font-semibold text-brand-primary mt-4">
              View Gallery <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>

        <Link 
          href="/videos" 
          className="group relative overflow-hidden bg-brand-surface border border-brand-border rounded-2xl p-8 transition-all hover:shadow-xl hover:border-brand-secondary"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-brand-secondary/10 rounded-full group-hover:scale-110 transition-transform">
              <Film className="h-10 w-10 text-brand-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-brand-primary">Browse Videos</h2>
            <p className="text-brand-muted">
              Embed stable, branded videos using direct MP4 links in your native video tags.
            </p>
            <div className="flex items-center gap-2 font-semibold text-brand-secondary mt-4">
              View Library <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-20 p-8 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 max-w-4xl w-full text-left">
        <h3 className="text-lg font-bold text-brand-primary mb-4 flex items-center gap-2">
          How to use:
        </h3>
        <ol className="space-y-4 text-brand-muted list-decimal list-inside">
          <li>Choose an asset from the gallery.</li>
          <li>Click <strong className="text-brand-primary">Copy URL</strong> on the detail page.</li>
          <li>Paste the link into your code:
            <pre className="mt-2 p-3 bg-brand-primary text-white text-xs rounded-lg overflow-x-auto whitespace-pre">
              {`<img src="COPIED_URL_HERE">
<video src="COPIED_URL_HERE" controls></video>`}
            </pre>
          </li>
        </ol>
      </div>
    </div>
  );
}
