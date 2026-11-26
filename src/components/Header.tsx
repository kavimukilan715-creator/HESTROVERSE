import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onOpenQuiz: () => void;
}

export function Header({ onOpenQuiz }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0A0B0D]/95 backdrop-blur-sm border-b border-[#252830]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-serif text-2xl font-semibold tracking-tight text-[#ECEAE4] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
        >
          HistoVerse
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A3A7B0]"
        >
          <a
            href="#event-search"
            className="hover:text-[#ECEAE4] hover:underline underline-offset-4 decoration-[#DC2626] transition-colors whitespace-nowrap shrink-0"
          >
            Event Search
          </a>
          <a
            href="#timeline"
            className="hover:text-[#ECEAE4] hover:underline underline-offset-4 decoration-[#DC2626] transition-colors whitespace-nowrap shrink-0"
          >
            Timeline
          </a>
          <a
            href="#law-consequence"
            className="hover:text-[#ECEAE4] hover:underline underline-offset-4 decoration-[#DC2626] transition-colors whitespace-nowrap shrink-0"
          >
            Law &amp; Consequence
          </a>
          <a
            href="#regional-map"
            className="hover:text-[#ECEAE4] hover:underline underline-offset-4 decoration-[#DC2626] transition-colors whitespace-nowrap shrink-0"
          >
            Regional Map
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenQuiz}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-medium tracking-wide text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0D] focus-visible:ring-[#DC2626]"
          >
            Knowledge Check
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-[#ECEAE4] border border-[#2A2E37] bg-[#13151A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#252830] bg-[#0F1115] px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-[#ECEAE4]">
            <a
              href="#event-search"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#252830]"
            >
              Event Search
            </a>
            <a
              href="#timeline"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#252830]"
            >
              Timeline
            </a>
            <a
              href="#law-consequence"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#252830]"
            >
              Law &amp; Consequence
            </a>
            <a
              href="#regional-map"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#252830]"
            >
              Regional Map
            </a>
            <a
              href="#archive-catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#252830]"
            >
              Ruler Catalog
            </a>
          </nav>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenQuiz();
            }}
            className="w-full py-2.5 px-4 text-xs font-medium text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] transition-colors"
          >
            Knowledge Check
          </button>
        </div>
      )}
    </header>
  );
}
