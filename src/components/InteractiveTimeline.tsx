import { useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Scale } from 'lucide-react';
import {
  ERA_FILTERS,
  EraId,
  RulerArchiveEntry,
} from '../data/historicalArchive';
import { ResilientImage } from './ResilientImage';

interface InteractiveTimelineProps {
  entries: RulerArchiveEntry[];
  onInspectRuler: (entry: RulerArchiveEntry) => void;
  onSelectForComparison: (rulerId: string) => void;
}

export function InteractiveTimeline({
  entries,
  onInspectRuler,
  onSelectForComparison,
}: InteractiveTimelineProps) {
  const [selectedEra, setSelectedEra] = useState<EraId>('all');
  const [activeId, setActiveId] = useState<string>(entries[0]?.id ?? 'hammurabi');

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => a.sortYear - b.sortYear),
    [entries]
  );

  const visibleEntries = useMemo(() => {
    if (selectedEra === 'all') return sortedEntries;
    return sortedEntries.filter((entry) => entry.era === selectedEra);
  }, [sortedEntries, selectedEra]);

  const activeEntry = useMemo(() => {
    const foundInVisible = visibleEntries.find((e) => e.id === activeId);
    return foundInVisible ?? visibleEntries[0] ?? sortedEntries[0];
  }, [visibleEntries, activeId, sortedEntries]);

  const activeVisibleIndex = visibleEntries.findIndex((e) => e.id === activeEntry?.id);

  const handleEraChange = (era: EraId) => {
    setSelectedEra(era);
    const matching = era === 'all' ? sortedEntries : sortedEntries.filter((e) => e.era === era);
    if (matching.length > 0 && !matching.some((e) => e.id === activeId)) {
      setActiveId(matching[0].id);
    }
  };

  const handleStep = (direction: -1 | 1) => {
    if (visibleEntries.length === 0) return;
    const nextIdx = (activeVisibleIndex + direction + visibleEntries.length) % visibleEntries.length;
    setActiveId(visibleEntries[nextIdx].id);
  };

  return (
    <section id="timeline" className="py-16 lg:py-24 border-b border-[#252830] bg-[#0A0B0D]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Section Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#252830]">
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-widest uppercase text-[#D4B483] mb-2">
              01 · Chronological Exhibition Rail
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#ECEAE4] tracking-tight text-balance">
              Interactive Historical Timeline of Sovereign Law
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#A3A7B0]">
              Select a historical era or click any year marker along the rail to examine how rulers justified legal authority, codified punishment, and reformed judicial torture.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              aria-label="Previous historical milestone"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#ECEAE4] bg-[#121418] border border-[#2A2E37] hover:border-[#525866] hover:bg-[#181B20] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
            >
              <ChevronLeft className="w-4 h-4" />
              Earlier
            </button>
            <button
              type="button"
              onClick={() => handleStep(1)}
              aria-label="Next historical milestone"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#ECEAE4] bg-[#121418] border border-[#2A2E37] hover:border-[#525866] hover:bg-[#181B20] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
            >
              Later
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Era Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter timeline by historical era"
          className="mt-6 flex flex-wrap items-center gap-1.5 p-1.5 bg-[#121418] border border-[#252830]"
        >
          {ERA_FILTERS.map((era) => {
            const isSelected = selectedEra === era.id;
            return (
              <button
                key={era.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleEraChange(era.id)}
                className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] ${
                  isSelected
                    ? 'bg-[#991B1B] text-[#FBF9F5]'
                    : 'text-[#A3A7B0] hover:text-[#ECEAE4] hover:bg-[#1A1D24]'
                }`}
              >
                {era.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Interactive Year Track */}
        <div className="mt-8 relative">
          <div className="hidden md:block absolute top-5 left-0 right-0 h-px bg-[#252830]" aria-hidden="true" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 relative">
            {visibleEntries.map((entry) => {
              const isActive = activeEntry?.id === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setActiveId(entry.id)}
                  className={`group text-left p-2.5 border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] ${
                    isActive
                      ? 'bg-[#17191F] border-[#DC2626]'
                      : 'bg-[#111317] border-[#252830] hover:border-[#4B5160] hover:bg-[#16191F]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`font-mono text-[11px] font-medium tabular-nums whitespace-nowrap ${
                        isActive ? 'text-[#F87171]' : 'text-[#D4B483]'
                      }`}
                    >
                      {entry.yearLabel}
                    </span>
                  </div>
                  <p className="font-serif text-sm font-semibold text-[#ECEAE4] leading-snug line-clamp-2">
                    {entry.ruler}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1 truncate">
                    {entry.region}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Year / Ruler Summary Stage */}
        {activeEntry && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch bg-[#121418] border border-[#262A32] p-6 sm:p-8">
            {/* Left Image Plate */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="relative flex-1 min-h-[260px] overflow-hidden border border-[#2A2E37] bg-[#0A0B0D]">
                <ResilientImage
                  src={activeEntry.imageSrc}
                  alt={activeEntry.imageAlt}
                  title={activeEntry.codeName}
                  aspectClass="aspect-[4/3] lg:h-full"
                />
              </div>
              <p className="mt-2.5 font-serif italic text-xs text-[#9CA3AF]">
                {activeEntry.figureCaption}
              </p>
            </div>

            {/* Right Archival Summary */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#9CA3AF] font-mono tabular-nums">
                  <span className="text-[#F87171] font-medium">{activeEntry.accessionNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeEntry.yearLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeEntry.eraLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeEntry.region}</span>
                </div>

                <h3 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-[#ECEAE4] leading-tight text-balance">
                  {activeEntry.ruler} — {activeEntry.codeName}
                </h3>
                <p className="mt-1 text-sm font-medium text-[#D4B483]">
                  {activeEntry.titleOrRole}
                </p>

                <p className="mt-4 text-[15px] leading-relaxed text-[#D1D5DB]">
                  {activeEntry.historicalContext}
                </p>

                {/* Primary Source Quotation */}
                <blockquote className="mt-6 py-4 border-y border-[#262A32]">
                  <p className="font-serif italic text-lg text-[#ECEAE4] leading-relaxed">
                    “{activeEntry.primaryExcerpt.quote}”
                  </p>
                  <footer className="mt-2 font-mono text-xs text-[#9CA3AF]">
                    — {activeEntry.primaryExcerpt.citation}
                  </footer>
                </blockquote>

                {/* Structured Legal Profile */}
                <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="pb-3 border-b border-[#252830]">
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                      Judicial Torture Rule
                    </dt>
                    <dd className="mt-1 font-medium text-[#F87171]">
                      {activeEntry.tortureStatus}
                    </dd>
                  </div>
                  <div className="pb-3 border-b border-[#252830]">
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                      Punishment Doctrine
                    </dt>
                    <dd className="mt-1 font-medium text-[#ECEAE4]">
                      {activeEntry.punishmentPhilosophy}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onInspectRuler(activeEntry)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                >
                  Open Full Monograph
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href="#law-consequence"
                  onClick={() => onSelectForComparison(activeEntry.id)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#ECEAE4] border border-[#2A2E37] bg-[#181B20] hover:border-[#6B7280] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                >
                  <Scale className="w-3.5 h-3.5 text-[#F87171]" />
                  Inspect Law &amp; Consequence Table
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
