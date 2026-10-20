import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-accent">404</h1>
      <p className="text-text-secondary">Page not found</p>
      <Link
        href="/"
        className="rounded-lg bg-accent px-4 py-2 text-white hover:bg-accent-hover"
      >
        Go Home
      </Link>
    </div>
  );
}
