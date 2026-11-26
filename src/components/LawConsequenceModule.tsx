import { useMemo, useState } from 'react';
import { ArrowLeftRight, BookOpen, CheckCircle2 } from 'lucide-react';
import {
  RulerArchiveEntry,
  SanctionCategory,
} from '../data/historicalArchive';

interface LawConsequenceModuleProps {
  entries: RulerArchiveEntry[];
  selectedRulerId: string;
  onSelectRulerId: (id: string) => void;
  onInspectRuler: (entry: RulerArchiveEntry) => void;
}

type CategoryFilter = 'All' | SanctionCategory;

const CATEGORY_FILTERS: CategoryFilter[] = [
  'All',
  'Corporal & Torture',
  'Capital',
  'Restitution & Civil',
  'Procedure & Reform',
];

export function LawConsequenceModule({
  entries,
  selectedRulerId,
  onSelectRulerId,
  onInspectRuler,
}: LawConsequenceModuleProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [compareMode, setCompareMode] = useState(false);
  const [secondaryRulerId, setSecondaryRulerId] = useState<string>('leopold-beccaria');

  const primaryRuler = useMemo(
    () => entries.find((e) => e.id === selectedRulerId) ?? entries[0],
    [entries, selectedRulerId]
  );

  const secondaryRuler = useMemo(
    () => entries.find((e) => e.id === secondaryRulerId) ?? entries[entries.length - 1],
    [entries, secondaryRulerId]
  );

  const filteredStatutes = useMemo(() => {
    if (!primaryRuler) return [];
    if (categoryFilter === 'All') return primaryRuler.lawConsequences;
    return primaryRuler.lawConsequences.filter((row) => row.category === categoryFilter);
  }, [primaryRuler, categoryFilter]);

  return (
    <section id="law-consequence" className="py-16 lg:py-24 border-b border-[#252830] bg-[#0F1115]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#252830]">
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-widest uppercase text-[#F87171] mb-2">
              02 · Statutory Matrix &amp; Comparative Table
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#ECEAE4] tracking-tight text-balance">
              Law &amp; Consequence Comparison Module
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#A3A7B0]">
              Select any historical ruler or sovereign code below to examine their major statutes alongside the documented punishments, interrogation rules, and social-rank conditions attached to breaking them.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCompareMode((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] ${
              compareMode
                ? 'bg-[#991B1B] text-[#FBF9F5] border-[#991B1B]'
                : 'bg-[#14171C] text-[#ECEAE4] border-[#2A2E37] hover:border-[#6B7280]'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            {compareMode ? 'Viewing Side-by-Side Comparison' : 'Compare Two Rulers'}
          </button>
        </div>

        {/* Ruler Selector Strip */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={compareMode ? 'lg:col-span-6' : 'lg:col-span-12'}>
            <label
              htmlFor="primary-ruler-select"
              className="block font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-2"
            >
              {compareMode ? 'Primary Historical Figure' : 'Select Historical Figure'}
            </label>

            {/* Quick Select Buttons on Desktop + Select Dropdown */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                id="primary-ruler-select"
                value={primaryRuler.id}
                onChange={(e) => onSelectRulerId(e.target.value)}
                className="sm:max-w-md w-full px-3.5 py-2.5 text-sm font-medium text-[#ECEAE4] bg-[#14171C] border border-[#2A2E37] focus:outline-none focus:border-[#DC2626]"
              >
                {entries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.yearLabel} — {entry.ruler} ({entry.codeName})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => onInspectRuler(primaryRuler)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-[#ECEAE4] bg-[#14171C] border border-[#2A2E37] hover:border-[#6B7280] transition-colors whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F87171]" />
                Read Full Historical Dossier
              </button>
            </div>

            {!compareMode && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {entries.map((entry) => {
                  const active = entry.id === primaryRuler.id;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => onSelectRulerId(entry.id)}
                      className={`px-3 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0 border ${
                        active
                          ? 'bg-[#991B1B] text-[#FBF9F5] border-[#991B1B]'
                          : 'bg-[#121418] text-[#A3A7B0] border-[#252830] hover:text-[#ECEAE4] hover:border-[#4B5160]'
                      }`}
                    >
                      {entry.ruler} <span className="font-mono text-[10px] opacity-80">({entry.yearLabel})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {compareMode && (
            <div className="lg:col-span-6">
              <label
                htmlFor="secondary-ruler-select"
                className="block font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-2"
              >
                Comparison Figure
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  id="secondary-ruler-select"
                  value={secondaryRuler.id}
                  onChange={(e) => setSecondaryRulerId(e.target.value)}
                  className="sm:max-w-md w-full px-3.5 py-2.5 text-sm font-medium text-[#ECEAE4] bg-[#14171C] border border-[#2A2E37] focus:outline-none focus:border-[#DC2626]"
                >
                  {entries.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.yearLabel} — {entry.ruler} ({entry.codeName})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => onInspectRuler(secondaryRuler)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-[#ECEAE4] bg-[#14171C] border border-[#2A2E37] hover:border-[#6B7280] transition-colors whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#F87171]" />
                  Read Dossier
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side-by-Side Comparison Matrix (when Compare Mode active) */}
        {compareMode && (
          <div className="mt-8 bg-[#121418] border border-[#262A32] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-[#262A32] bg-[#181B20]">
                  <th className="py-3.5 px-5 font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] w-1/4">
                    Legal Dimension
                  </th>
                  <th className="py-3.5 px-5 font-serif text-lg font-semibold text-[#ECEAE4] w-[37.5%]">
                    {primaryRuler.ruler} <span className="font-mono text-xs font-normal text-[#D4B483]">({primaryRuler.yearLabel})</span>
                  </th>
                  <th className="py-3.5 px-5 font-serif text-lg font-semibold text-[#ECEAE4] w-[37.5%]">
                    {secondaryRuler.ruler} <span className="font-mono text-xs font-normal text-[#D4B483]">({secondaryRuler.yearLabel})</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22252C] text-sm">
                <tr>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#9CA3AF]">Codified Source</td>
                  <td className="py-3.5 px-5 font-medium text-[#ECEAE4]">{primaryRuler.codeName}</td>
                  <td className="py-3.5 px-5 font-medium text-[#ECEAE4]">{secondaryRuler.codeName}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#9CA3AF]">Source of Authority</td>
                  <td className="py-3.5 px-5 text-[#D1D5DB]">{primaryRuler.authoritySource}</td>
                  <td className="py-3.5 px-5 text-[#D1D5DB]">{secondaryRuler.authoritySource}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#9CA3AF]">Equality Before Law</td>
                  <td className="py-3.5 px-5 text-[#D1D5DB]">{primaryRuler.classEquality}</td>
                  <td className="py-3.5 px-5 text-[#D1D5DB]">{secondaryRuler.classEquality}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#9CA3AF]">Judicial Torture Doctrine</td>
                  <td className="py-3.5 px-5 font-medium text-[#F87171]">{primaryRuler.tortureStatus}</td>
                  <td className="py-3.5 px-5 font-medium text-[#F87171]">{secondaryRuler.tortureStatus}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#9CA3AF]">Punishment Philosophy</td>
                  <td className="py-3.5 px-5 text-[#D1D5DB]">{primaryRuler.punishmentPhilosophy}</td>
                  <td className="py-3.5 px-5 text-[#D1D5DB]">{secondaryRuler.punishmentPhilosophy}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#9CA3AF]">Procedural Safeguards</td>
                  <td className="py-3.5 px-5 text-[#A3A7B0] leading-relaxed">{primaryRuler.proceduralSafeguards}</td>
                  <td className="py-3.5 px-5 text-[#A3A7B0] leading-relaxed">{secondaryRuler.proceduralSafeguards}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Primary Figure Law & Consequence Table */}
        <div className="mt-8 bg-[#121418] border border-[#262A32]">
          <div className="p-5 sm:p-6 border-b border-[#252830] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#9CA3AF] tabular-nums">
                <span className="text-[#F87171] font-medium">{primaryRuler.codeName}</span>
                <span aria-hidden="true">·</span>
                <span>{primaryRuler.region}</span>
                <span aria-hidden="true">·</span>
                <span>{primaryRuler.yearLabel}</span>
              </div>
              <h3 className="mt-1 font-serif text-2xl font-semibold text-[#ECEAE4]">
                Major Laws &amp; Documented Punishments — {primaryRuler.ruler}
              </h3>
            </div>

            {/* Sanction Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0A0B0D] border border-[#252830]">
              {CATEGORY_FILTERS.map((cat) => {
                const isActive = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#991B1B] text-[#FBF9F5]'
                        : 'text-[#A3A7B0] hover:text-[#ECEAE4]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-[#262A32] bg-[#181B20]">
                  <th className="py-3 px-5 font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] w-36">
                    Statute Ref.
                  </th>
                  <th className="py-3 px-5 font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] w-[30%]">
                    Law / Offense
                  </th>
                  <th className="py-3 px-5 font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] w-[32%]">
                    Documented Punishment or Torture
                  </th>
                  <th className="py-3 px-5 font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                    Class &amp; Evidentiary Condition
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22252C] text-sm">
                {filteredStatutes.length > 0 ? (
                  filteredStatutes.map((row) => (
                    <tr
                      key={`${primaryRuler.id}-${row.statuteRef}`}
                      className="hover:bg-[#171A21] transition-colors align-top"
                    >
                      <td className="py-4 px-5 font-mono text-xs font-medium text-[#D4B483] tabular-nums whitespace-nowrap">
                        {row.statuteRef}
                        <span className="block mt-1 text-[11px] text-[#9CA3AF] font-sans font-normal">
                          {row.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-medium text-[#ECEAE4] leading-relaxed">
                        {row.offenseOrRule}
                      </td>
                      <td className="py-4 px-5 leading-relaxed">
                        <span
                          className={`font-medium ${
                            row.category === 'Procedure & Reform'
                              ? 'text-[#6EE7B7]'
                              : row.category === 'Restitution & Civil'
                                ? 'text-[#E5E7EB]'
                                : 'text-[#FCA5A5]'
                          }`}
                        >
                          {row.category === 'Procedure & Reform' && (
                            <CheckCircle2 className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5 text-[#34D399]" />
                          )}
                          {row.documentedPunishment}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs text-[#A3A7B0] leading-relaxed">
                        {row.classOrEvidentiaryNote}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 px-5 text-center text-sm text-[#9CA3AF]">
                      No statutes in {primaryRuler.codeName} match the “{categoryFilter}” filter. Select “All” to view all documented provisions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Comparative Summary Footnote */}
          <div className="p-5 sm:px-6 bg-[#16181D] border-t border-[#252830] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#A3A7B0]">
            <p className="leading-relaxed max-w-3xl">
              <strong className="font-semibold text-[#ECEAE4]">Procedural Context:</strong>{' '}
              {primaryRuler.proceduralSafeguards}
            </p>
            <span className="font-mono tabular-nums whitespace-nowrap shrink-0 text-[#D4B483]">
              {filteredStatutes.length} of {primaryRuler.lawConsequences.length} statutes shown
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
