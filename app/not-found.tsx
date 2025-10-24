import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-6xl font-bold mb-4 gradient-text">404</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Page not found
      </p>
      <p className="text-muted-foreground mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-primary text-black rounded-full hover:bg-primary/90 transition-colors font-semibold"
      >
        Go back home
      </Link>
    </div>
  );
}