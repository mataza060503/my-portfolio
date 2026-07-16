export default function Footer() {
  return (
    <footer className="relative border-t border-bg-tertiary/50 bg-bg-secondary/30 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Vo Hoang Lam. Built with Next.js &amp; Tailwind CSS.
        </p>
        <p className="text-xs text-text-muted">
          Dong Nai, Vietnam &mdash; vohoanglam060503@gmail.com
        </p>
      </div>
    </footer>
  );
}
