import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-6">
    <div className="text-center">
      <p className="text-secondary text-xs uppercase tracking-wider mb-2">404</p>
      <h1 className="font-display text-primary text-2xl font-semibold mb-3">Page not found</h1>
      <p className="text-secondary text-sm mb-6 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 rounded-lg bg-accent-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Back to dashboard
      </Link>
    </div>
  </div>
);
