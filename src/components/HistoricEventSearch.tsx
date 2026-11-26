import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, ExternalLink, Loader2, Scale, Search, X } from 'lucide-react';
import {
  HISTORIC_EVENTS,
  HistoricEventEntry,
  RULER_ARCHIVE,
  RulerArchiveEntry,
} from '../data/historicalArchive';

interface HistoricEventSearchProps {
  onInspectRuler: (entry: RulerArchiveEntry) => void;
  onSelectForComparison: (rulerId: string) => void;
}

interface WikiSearchResult {
  pageid: number;
  title: string;
  snippetText: string;
}

const SUGGESTED_QUERIES = [
  'Spanish Inquisition',
  'Salem Witch Trials',
  'Joan of Arc',
  'Magna Carta',
  'Reign of Terror',
  'Nuremberg Trials',
];

function stripHtmlTags(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .trim();
}

export function HistoricEventSearch({
  onInspectRuler,
  onSelectForComparison,
}: HistoricEventSearchProps) {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [wikiResults, setWikiResults] = useState<WikiSearchResult[]>([]);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState<string | null>(null);
  const [expandedExtract, setExpandedExtract] = useState<{
    pageid: number;
    title: string;
    extract: string;
  } | null>(null);
  const [extractLoadingId, setExtractLoadingId] = useState<number | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const matchingEvents = useMemo<HistoricEventEntry[]>(() => {
    if (!normalizedQuery) return [];
    return HISTORIC_EVENTS.filter(
      (ev) =>
        ev.title.toLowerCase().includes(normalizedQuery) ||
        ev.yearLabel.toLowerCase().includes(normalizedQuery) ||
        ev.region.toLowerCase().includes(normalizedQuery) ||
        ev.summary.toLowerCase().includes(normalizedQuery) ||
        ev.legalSignificance.toLowerCase().includes(normalizedQuery) ||
        ev.punishmentContext.toLowerCase().includes(normalizedQuery) ||
        ev.tags.some((t) => t.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery]);

  const matchingRulers = useMemo<RulerArchiveEntry[]>(() => {
    if (!normalizedQuery) return [];
    return RULER_ARCHIVE.filter(
      (r) =>
        r.ruler.toLowerCase().includes(normalizedQuery) ||
        r.codeName.toLowerCase().includes(normalizedQuery) ||
        r.yearLabel.toLowerCase().includes(normalizedQuery) ||
        r.region.toLowerCase().includes(normalizedQuery) ||
        r.tortureStatus.toLowerCase().includes(normalizedQuery) ||
        r.summary.toLowerCase().includes(normalizedQuery) ||
        r.lawConsequences.some(
          (law) =>
            law.offenseOrRule.toLowerCase().includes(normalizedQuery) ||
            law.documentedPunishment.toLowerCase().includes(normalizedQuery)
        )
    );
  }, [normalizedQuery]);

  const runEncyclopediaLookup = async (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) return;
    setSubmittedQuery(clean);
    setWikiLoading(true);
    setWikiError(null);
    setExpandedExtract(null);

    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        clean
      )}&srlimit=4&format=json&origin=*`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Encyclopedia service unavailable');
      }
      const data = await res.json();
      const rawList = Array.isArray(data?.query?.search) ? data.query.search : [];
      const parsed: WikiSearchResult[] = rawList.map(
        (item: { pageid: number; title: string; snippet?: string }) => ({
          pageid: item.pageid,
          title: item.title,
          snippetText: stripHtmlTags(item.snippet || ''),
        })
      );
      setWikiResults(parsed);
    } catch {
      setWikiResults([]);
      setWikiError(
        'Broader encyclopedia lookup is currently unreachable; showing curated archive records above.'
      );
    } finally {
      setWikiLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    void runEncyclopediaLookup(query);
  };

  const handleQuickTopic = (topic: string) => {
    setQuery(topic);
    void runEncyclopediaLookup(topic);
  };

  const handleReadExtract = async (item: WikiSearchResult) => {
    if (expandedExtract?.pageid === item.pageid) {
      setExpandedExtract(null);
      return;
    }
    setExtractLoadingId(item.pageid);
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&pageids=${item.pageid}&format=json&origin=*`;
      const res = await fetch(url);
      const data = await res.json();
      const page = data?.query?.pages?.[String(item.pageid)];
      const extract = page?.extract
        ? String(page.extract).slice(0, 950)
        : item.snippetText;
      setExpandedExtract({
        pageid: item.pageid,
        title: item.title,
        extract,
      });
    } catch {
      setExpandedExtract({
        pageid: item.pageid,
        title: item.title,
        extract: item.snippetText,
      });
    } finally {
      setExtractLoadingId(null);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSubmittedQuery('');
    setWikiResults([]);
    setWikiError(null);
    setExpandedExtract(null);
  };

  const hasActiveSearch = normalizedQuery.length > 0;

  return (
    <section
      id="event-search"
      className="py-12 lg:py-16 border-b border-[#252830] bg-[#0F1115]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-widest uppercase text-[#F87171] mb-2">
              Archive &amp; Historical Event Search
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#ECEAE4] tracking-tight">
              Search Any Historic Event, Trial, Ruler, or Punishment
            </h2>
            <p className="mt-2 text-sm text-[#A3A7B0] leading-relaxed">
              Enter any historic event, legal decree, or punishment method to search our curated archive instantly and query wider historical encyclopedia records.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search e.g. Spanish Inquisition, Salem Witch Trials, Joan of Arc, Code of Ur-Nammu, Reign of Terror..."
              aria-label="Search any historic event"
              className="w-full pl-11 pr-10 py-3.5 text-sm bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2626]"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#ECEAE4]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!query.trim() || wikiLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-medium tracking-wide text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            {wikiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search Event'
            )}
          </button>
        </form>

        {/* Suggested Historical Events */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-[#9CA3AF] mr-1">
            Suggested searches:
          </span>
          {SUGGESTED_QUERIES.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => handleQuickTopic(topic)}
              className="px-2.5 py-1 text-xs text-[#D1D5DB] bg-[#14171C] border border-[#252830] hover:border-[#DC2626] hover:text-[#ECEAE4] transition-colors whitespace-nowrap shrink-0"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Search Results Stage */}
        {hasActiveSearch && (
          <div className="mt-8 pt-8 border-t border-[#252830] space-y-8">
            {/* 1. Curated Local Archive Results */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="font-serif text-xl font-semibold text-[#ECEAE4]">
                  Curated Archive Matches ({matchingEvents.length + matchingRulers.length})
                </h3>
                <span className="font-mono text-xs text-[#9CA3AF] tabular-nums">
                  Instant archive index
                </span>
              </div>

              {matchingEvents.length > 0 || matchingRulers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchingEvents.map((ev) => {
                    const linkedRuler = ev.relatedRulerId
                      ? RULER_ARCHIVE.find((r) => r.id === ev.relatedRulerId)
                      : undefined;
                    return (
                      <article
                        key={ev.id}
                        className="p-5 bg-[#121418] border border-[#262A32] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono text-[#D4B483] tabular-nums">
                            <span>{ev.yearLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#9CA3AF]">{ev.region}</span>
                          </div>
                          <h4 className="mt-2 font-serif text-xl font-semibold text-[#ECEAE4]">
                            {ev.title}
                          </h4>
                          <p className="mt-2 text-sm text-[#D1D5DB] leading-relaxed">
                            {ev.summary}
                          </p>
                          <p className="mt-3 text-xs text-[#FCA5A5] leading-relaxed">
                            <strong className="font-semibold text-[#F87171]">Punishment &amp; Torture Context:</strong>{' '}
                            {ev.punishmentContext}
                          </p>
                          <p className="mt-1.5 text-xs text-[#A3A7B0] leading-relaxed">
                            <strong className="font-semibold text-[#ECEAE4]">Legal Significance:</strong>{' '}
                            {ev.legalSignificance}
                          </p>
                        </div>

                        {linkedRuler && (
                          <div className="mt-4 pt-3 border-t border-[#252830] flex flex-wrap items-center gap-4 text-xs">
                            <button
                              type="button"
                              onClick={() => onInspectRuler(linkedRuler)}
                              className="inline-flex items-center gap-1.5 font-medium text-[#F87171] hover:underline underline-offset-4"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Related Code: {linkedRuler.codeName}
                            </button>
                            <a
                              href="#law-consequence"
                              onClick={() => onSelectForComparison(linkedRuler.id)}
                              className="inline-flex items-center gap-1 font-mono text-[#9CA3AF] hover:text-[#ECEAE4]"
                            >
                              <Scale className="w-3.5 h-3.5" />
                              View Statutes
                            </a>
                          </div>
                        )}
                      </article>
                    );
                  })}

                  {matchingRulers.map((ruler) => (
                    <article
                      key={`search-ruler-${ruler.id}`}
                      className="p-5 bg-[#121418] border border-[#262A32] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#F87171] tabular-nums">
                          <span>{ruler.yearLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#9CA3AF]">{ruler.codeName}</span>
                        </div>
                        <h4 className="mt-2 font-serif text-xl font-semibold text-[#ECEAE4]">
                          {ruler.ruler} — {ruler.titleOrRole}
                        </h4>
                        <p className="mt-2 text-sm text-[#D1D5DB] leading-relaxed">
                          {ruler.summary}
                        </p>
                        <p className="mt-2.5 text-xs text-[#A3A7B0]">
                          <strong className="text-[#ECEAE4]">Torture Doctrine:</strong>{' '}
                          {ruler.tortureStatus}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#252830] flex flex-wrap items-center gap-4 text-xs">
                        <button
                          type="button"
                          onClick={() => onInspectRuler(ruler)}
                          className="inline-flex items-center gap-1.5 font-medium text-[#F87171] hover:underline underline-offset-4"
                        >
                          Open Full Monograph
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href="#law-consequence"
                          onClick={() => onSelectForComparison(ruler.id)}
                          className="inline-flex items-center gap-1 font-mono text-[#9CA3AF] hover:text-[#ECEAE4]"
                        >
                          Inspect Law Table
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="p-5 bg-[#121418] border border-[#252830] text-sm text-[#A3A7B0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span>
                    No direct match in our 22 curated archive records for “{query}”.
                  </span>
                  {submittedQuery !== query.trim() && (
                    <button
                      type="button"
                      onClick={() => void runEncyclopediaLookup(query)}
                      className="px-3.5 py-2 text-xs font-medium text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] whitespace-nowrap shrink-0"
                    >
                      Search Historical Encyclopedia
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. Live Encyclopedia Lookup Results (when submitted) */}
            {(submittedQuery || wikiLoading) && (
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="font-serif text-xl font-semibold text-[#ECEAE4]">
                    Historical Encyclopedia Records for “{submittedQuery}”
                  </h3>
                  <span className="font-mono text-xs text-[#9CA3AF]">
                    External Reference Lookup
                  </span>
                </div>

                {wikiLoading ? (
                  <div className="p-6 bg-[#121418] border border-[#262A32] flex items-center gap-3 text-sm text-[#A3A7B0]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#F87171]" />
                    Searching historical encyclopedia entries...
                  </div>
                ) : wikiError ? (
                  <div className="p-5 bg-[#121418] border border-[#262A32] text-xs text-[#9CA3AF]">
                    {wikiError}
                  </div>
                ) : wikiResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wikiResults.map((item) => {
                      const isExpanded = expandedExtract?.pageid === item.pageid;
                      const isLoadingThis = extractLoadingId === item.pageid;
                      return (
                        <article
                          key={item.pageid}
                          className="p-5 bg-[#121418] border border-[#262A32] flex flex-col justify-between"
                        >
                          <div>
                            <h4 className="font-serif text-xl font-semibold text-[#ECEAE4]">
                              {item.title}
                            </h4>
                            <p className="mt-2 text-sm text-[#A3A7B0] leading-relaxed">
                              {isExpanded && expandedExtract
                                ? expandedExtract.extract
                                : `${item.snippetText}...`}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#252830] flex items-center justify-between gap-3 text-xs">
                            <button
                              type="button"
                              onClick={() => void handleReadExtract(item)}
                              className="inline-flex items-center gap-1.5 font-medium text-[#D4B483] hover:text-[#ECEAE4]"
                            >
                              {isLoadingThis ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Loading summary...
                                </>
                              ) : isExpanded ? (
                                'Collapse Summary'
                              ) : (
                                'Read Full Historical Summary'
                              )}
                            </button>

                            <a
                              href={`https://en.wikipedia.org/?curid=${item.pageid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[#9CA3AF] hover:text-[#ECEAE4]"
                            >
                              Source
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5 bg-[#121418] border border-[#262A32] text-sm text-[#9CA3AF]">
                    No encyclopedia articles found for “{submittedQuery}”. Try broader historical keywords (e.g., “Inquisition”, “Code of Justinian”, or “Trial by Ordeal”).
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
