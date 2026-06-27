import { TriangleAlert } from 'lucide-react'

const LINKS = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Contact', href: '#' },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm leading-relaxed text-foreground">
            <span className="font-semibold text-warning">Prototype Disclaimer:</span>{' '}
            NeuralNest is currently a prototype. Testimonials and metrics are
            illustrative placeholders.
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <a href="#" className="flex items-center gap-2.5" aria-label="NeuralNest home">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary font-mono text-sm font-bold text-white">
              N
            </span>
            <span className="text-sm font-semibold">NeuralNest</span>
          </a>

          <nav className="flex items-center gap-6">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} NeuralNest
          </p>
        </div>
      </div>
    </footer>
  )
}
