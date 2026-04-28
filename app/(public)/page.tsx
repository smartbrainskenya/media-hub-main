import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="legacy-home-container">
      <div className="legacy-home-hero">
        <span className="legacy-home-hero-icon" aria-hidden="true">
          🎨
        </span>
        <h1 className="legacy-home-heading">What would you like to find today?</h1>
        <p className="legacy-home-copy">
          Explore our amazing collection of images and videos to use in your awesome coding projects!
        </p>
      </div>
      <div className="legacy-card-grid">
        <Link href="/images" className="legacy-card legacy-nav-card">
          <div className="legacy-nav-card-icon">🖼️</div>
          <h2 className="legacy-nav-card-title">Image Gallery</h2>
          <p className="legacy-nav-card-copy">Find the perfect pictures for your websites.</p>
          <span className="legacy-nav-card-action">Let&apos;s Go! →</span>
        </Link>
        <Link href="/videos" className="legacy-card legacy-nav-card">
          <div className="legacy-nav-card-icon">▶️</div>
          <h2 className="legacy-nav-card-title">Video Library</h2>
          <p className="legacy-nav-card-copy">Watch and learn with cool videos.</p>
          <span className="legacy-nav-card-action">Watch Now! →</span>
        </Link>
      </div>
    </div>
  );
}
