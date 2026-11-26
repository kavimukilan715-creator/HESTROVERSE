import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bookmark, BookmarkCheck, Search } from 'lucide-react';
import { ArtifactStage3D } from './components/ArtifactStage3D';
import { Header } from './components/Header';
import { HistoricEventSearch } from './components/HistoricEventSearch';
import { HistoricalChatbot } from './components/HistoricalChatbot';
import { HistoricalErasDensityChart } from './components/HistoricalErasDensityChart';
import { HistoricalMusicStudio, SavedMusicTrack } from './components/HistoricalMusicStudio';
import { InteractiveRegionalMap } from './components/InteractiveRegionalMap';
import { InteractiveTimeline } from './components/InteractiveTimeline';
import { KnowledgeCheckModal } from './components/KnowledgeCheckModal';
import { LawConsequenceModule } from './components/LawConsequenceModule';
import { ResilientImage } from './components/ResilientImage';
import { RulerDetailModal } from './components/RulerDetailModal';
import { VoiceConversationPanel } from './components/VoiceConversationPanel';
import {
  ERA_FILTERS,
  EraId,
  GEO_REGIONS,
  GeoRegionId,
  HERO_IMAGE,
  JUDICIAL_DOCTRINES,
  RULER_ARCHIVE,
  RulerArchiveEntry,
} from './data/historicalArchive';

const SAVED_STORAGE_KEY = 'codex_crown_saved_dossier_v1';
const NOTES_STORAGE_KEY = 'histoverse_research_notes_v1';

export default function App() {
  const [selectedRulerForTable, setSelectedRulerForTable] = useState<string>(RULER_ARCHIVE[0].id);
  const [activeMonograph, setActiveMonograph] = useState<RulerArchiveEntry | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  // Catalog search & filter state
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogEra, setCatalogEra] = useState<EraId>('all');
  const [selectedGeoRegion, setSelectedGeoRegion] = useState<GeoRegionId>('all');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Saved Study Dossier, Notes & Generated Scores synced with server persistence + localStorage
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [researchNotes, setResearchNotes] = useState<Record<string, string>>(() => {
    try {
      const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });

  const [savedTracks, setSavedTracks] = useState<SavedMusicTrack[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/archive')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.savedRulerIds) && data.savedRulerIds.length > 0) {
          setSavedIds(data.savedRulerIds);
        }
        if (data.notes && typeof data.notes === 'object' && Object.keys(data.notes).length > 0) {
          setResearchNotes(data.notes);
        }
        if (Array.isArray(data.savedTracks)) {
          setSavedTracks(data.savedTracks);
        }
      })
      .catch(() => {
        // Offline/local fallback remains active
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(researchNotes));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [researchNotes]);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      fetch('/api/archive/dossier', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savedRulerIds: next }),
      }).catch(() => undefined);
      return next;
    });
  };

  const handleSaveNote = async (rulerId: string, note: string) => {
    setResearchNotes((prev) => {
      const next = { ...prev };
      if (note.trim()) {
        next[rulerId] = note.trim();
      } else {
        delete next[rulerId];
      }
      return next;
    });
    const res = await fetch('/api/archive/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rulerId, note }),
    });
    if (!res.ok) {
      throw new Error('Failed to sync note');
    }
  };

  const handleSaveTrack = async (payload: {
    title: string;
    eraLabel: string;
    prompt: string;
    model: string;
    lyrics: string;
    mimeType: string;
    audioDataUrl: string;
  }) => {
    const res = await fetch('/api/archive/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save generated track');
    }
    if (Array.isArray(data.savedTracks)) {
      setSavedTracks(data.savedTracks);
    }
  };

  const handleDeleteTrack = async (id: string) => {
    const res = await fetch(`/api/archive/tracks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.savedTracks)) {
        setSavedTracks(data.savedTracks);
      }
    }
  };

  const filteredCatalog = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    return RULER_ARCHIVE.filter((entry) => {
      if (catalogEra !== 'all' && entry.era !== catalogEra) return false;
      if (selectedGeoRegion !== 'all' && entry.geoRegion !== selectedGeoRegion) return false;
      if (showSavedOnly && !savedIds.includes(entry.id)) return false;
      if (!query) return true;
      return (
        entry.ruler.toLowerCase().includes(query) ||
        entry.codeName.toLowerCase().includes(query) ||
        entry.region.toLowerCase().includes(query) ||
        entry.tortureStatus.toLowerCase().includes(query) ||
        entry.summary.toLowerCase().includes(query)
      );
    });
  }, [catalogSearch, catalogEra, selectedGeoRegion, showSavedOnly, savedIds]);

  const totalStatutesDocumented = useMemo(
    () => RULER_ARCHIVE.reduce((acc, item) => acc + item.lawConsequences.length, 0),
    []
  );

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#0A0B0D] text-[#ECEAE4]">
      <Header onOpenQuiz={() => setQuizOpen(true)} />

      <main className="flex-1">
        {/* Hero Exhibition Marquee */}
        <section className="border-b border-[#252830] bg-[#0A0B0D]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Left Editorial Narrative */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <p className="font-mono text-xs tracking-widest uppercase text-[#D4B483]">
                    Comparative Legal History Archive · 1750 BCE – 1786 CE
                  </p>
                  <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-[#ECEAE4] leading-[1.08] tracking-tight text-balance">
                    Sovereign Law, Order, and the History of Judicial Torture
                  </h1>
                  <p className="mt-5 text-base leading-relaxed text-[#A3A7B0] max-w-xl">
                    Across four millennia, rulers engraved legal codes to consolidate authority, enforce social hierarchy, and extract confessions through institutionalized interrogation—until Enlightenment jurists dismantled judicial torture and redefined proportionate justice.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#252830] flex flex-wrap items-center gap-4">
                  <a
                    href="#timeline"
                    className="inline-flex items-center gap-2 px-5 py-3 text-xs font-medium tracking-wide text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                  >
                    Explore the Timeline
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#chamber-3d"
                    className="inline-flex items-center gap-2 px-5 py-3 text-xs font-medium tracking-wide text-[#ECEAE4] bg-[#14171C] border border-[#2A2E37] hover:border-[#6B7280] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                  >
                    Enter 3D Relic Vault
                  </a>
                  <a
                    href="#archivist-chat"
                    className="text-xs font-mono text-[#D4B483] hover:text-[#ECEAE4] underline underline-offset-4"
                  >
                    Ask Scholar
                  </a>
                  <a
                    href="#voice-chamber"
                    className="text-xs font-mono text-[#D4B483] hover:text-[#ECEAE4] underline underline-offset-4"
                  >
                    Voice Seminar
                  </a>
                </div>
              </div>

              {/* Right Focal Artwork */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="relative flex-1 min-h-[280px] sm:min-h-[360px] overflow-hidden border border-[#2A2E37] bg-[#121418]">
                  <ResilientImage
                    src={HERO_IMAGE.src}
                    alt={HERO_IMAGE.alt}
                    title="HistoVerse Exhibition"
                    aspectClass="aspect-[16/9] lg:h-full"
                  />
                </div>
                <p className="mt-2.5 font-serif italic text-xs text-[#9CA3AF]">
                  {HERO_IMAGE.caption}
                </p>
              </div>
            </div>

            {/* Full-Width 4-Column Archival Index Strip */}
            <dl className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-[#252830]">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                  Chronological Span
                </dt>
                <dd className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#ECEAE4] tabular-nums">
                  3,536 Years
                </dd>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  Babylonian steles to Tuscan abolition
                </p>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                  Sovereign Law Codes
                </dt>
                <dd className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#ECEAE4] tabular-nums">
                  {RULER_ARCHIVE.length} Codices
                </dd>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  Mesopotamia, Asia, &amp; Europe
                </p>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                  Statutes Examined
                </dt>
                <dd className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#ECEAE4] tabular-nums">
                  {totalStatutesDocumented} Provisions
                </dd>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  Paired with documented penalties
                </p>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                  Abolition Milestone
                </dt>
                <dd className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#F87171] tabular-nums">
                  1786 CE
                </dd>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  First state ban on torture &amp; execution
                </p>
              </div>
            </dl>
          </div>
        </section>

        {/* Historic Event & Legal Archive Search */}
        <HistoricEventSearch
          onInspectRuler={(entry) => setActiveMonograph(entry)}
          onSelectForComparison={(rulerId) => setSelectedRulerForTable(rulerId)}
        />

        {/* 01. Interactive Historical Timeline */}
        <InteractiveTimeline
          entries={RULER_ARCHIVE}
          onInspectRuler={(entry) => setActiveMonograph(entry)}
          onSelectForComparison={(rulerId) => setSelectedRulerForTable(rulerId)}
        />

        {/* 02. Law & Consequence Comparison Module */}
        <LawConsequenceModule
          entries={RULER_ARCHIVE}
          selectedRulerId={selectedRulerForTable}
          onSelectRulerId={(id) => setSelectedRulerForTable(id)}
          onInspectRuler={(entry) => setActiveMonograph(entry)}
        />

        {/* 03. Interactive Regional Map */}
        <InteractiveRegionalMap
          entries={RULER_ARCHIVE}
          selectedRegion={selectedGeoRegion}
          onSelectRegion={(region) => setSelectedGeoRegion(region)}
          onInspectRuler={(entry) => setActiveMonograph(entry)}
          onSelectForComparison={(rulerId) => setSelectedRulerForTable(rulerId)}
        />

        {/* 04. Historical Eras D3 Law Density & Torture Frequency Chart */}
        <HistoricalErasDensityChart
          onInspectRuler={(entry) => setActiveMonograph(entry)}
          onSelectForComparison={(rulerId) => setSelectedRulerForTable(rulerId)}
        />

        {/* 05. Judicial Torture Doctrines & Institutional Mechanics */}
        <section id="doctrines" className="py-16 lg:py-24 border-b border-[#252830] bg-[#0A0B0D]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="max-w-2xl pb-8 border-b border-[#252830]">
              <p className="font-mono text-xs tracking-widest uppercase text-[#D4B483] mb-2">
                05 · Institutional Mechanics
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#ECEAE4] tracking-tight text-balance">
                Why Rulers Institutionalized Judicial Torture
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#A3A7B0]">
                Historians distinguish between <em>penal cruelty</em> (public punishment after conviction) and <em>judicial torture</em> (physical coercion used by courts to extract evidence or confessions before judgment). Four legal doctrines explain how these systems functioned and collapsed.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              {JUDICIAL_DOCTRINES.map((doctrine) => (
                <article
                  key={doctrine.id}
                  className="bg-[#121418] border border-[#262A32] p-6 sm:p-8 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#252830]">
                      <span className="font-mono text-xs text-[#F87171] font-medium">
                        Doctrine {doctrine.index} · {doctrine.legalPurpose}
                      </span>
                      <span className="font-mono text-xs text-[#9CA3AF] tabular-nums">
                        {doctrine.period}
                      </span>
                    </div>

                    <h3 className="mt-4 font-serif text-2xl font-semibold text-[#ECEAE4]">
                      {doctrine.title}
                    </h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-[#D1D5DB]">
                      {doctrine.summary}
                    </p>

                    <ul className="mt-5 space-y-2 text-sm text-[#A3A7B0]">
                      {doctrine.mechanics.map((mech) => (
                        <li key={mech} className="flex items-start gap-2.5">
                          <span className="font-mono text-xs text-[#D4B483] mt-0.5" aria-hidden="true">
                            —
                          </span>
                          <span>{mech}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#252830] text-xs text-[#A3A7B0] leading-relaxed">
                    <strong className="font-semibold text-[#ECEAE4]">Historical Turning Point:</strong>{' '}
                    {doctrine.turningPoint}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 06. Complete Ruler & Law Catalog */}
        <section id="archive-catalog" className="py-16 lg:py-24 bg-[#0F1115]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#252830]">
              <div className="max-w-2xl">
                <p className="font-mono text-xs tracking-widest uppercase text-[#D4B483] mb-2">
                  06 · Complete Archival Index
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#ECEAE4] tracking-tight text-balance">
                  Ruler &amp; Legal Code Catalog
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#A3A7B0]">
                  Search primary codes, filter by historical era or geographic region, or bookmark dossiers into your personal study list.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search ruler, law, or region..."
                    aria-label="Search archival catalog"
                    className="pl-9 pr-3 py-2 text-xs bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] placeholder:text-[#9CA3AF] w-60 focus:outline-none focus:border-[#DC2626]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowSavedOnly((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    showSavedOnly
                      ? 'bg-[#991B1B] text-[#FBF9F5] border-[#991B1B]'
                      : 'bg-[#14171C] text-[#ECEAE4] border-[#2A2E37] hover:border-[#6B7280]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Saved Dossier ({savedIds.length})
                </button>
              </div>
            </div>

            {/* Era & Region Filter Rows */}
            <div className="mt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {ERA_FILTERS.map((era) => {
                  const active = catalogEra === era.id;
                  return (
                    <button
                      key={era.id}
                      type="button"
                      onClick={() => setCatalogEra(era.id)}
                      className={`px-3 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#991B1B] text-[#FBF9F5] border-[#991B1B]'
                          : 'bg-[#121418] text-[#A3A7B0] border-[#252830] hover:text-[#ECEAE4]'
                      }`}
                    >
                      {era.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="catalog-region-select" className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] whitespace-nowrap">
                  Region:
                </label>
                <select
                  id="catalog-region-select"
                  value={selectedGeoRegion}
                  onChange={(e) => setSelectedGeoRegion(e.target.value as GeoRegionId)}
                  className="px-3 py-1.5 text-xs bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] focus:outline-none focus:border-[#DC2626]"
                >
                  <option value="all">All Geographical Regions</option>
                  {GEO_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catalog Grid */}
            {filteredCatalog.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCatalog.map((entry) => {
                  const saved = savedIds.includes(entry.id);
                  return (
                    <article
                      key={entry.id}
                      className="bg-[#121418] border border-[#262A32] flex flex-col justify-between p-6 hover:border-[#DC2626] transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#9CA3AF] tabular-nums">
                          <span>
                            {entry.yearLabel} · {entry.region}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSaved(entry.id)}
                            aria-label={saved ? `Remove ${entry.ruler} from saved dossier` : `Save ${entry.ruler} to dossier`}
                            className="p-1 text-[#9CA3AF] hover:text-[#F87171] transition-colors"
                          >
                            {saved ? (
                              <BookmarkCheck className="w-4 h-4 text-[#F87171]" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <h3 className="mt-3 font-serif text-2xl font-semibold text-[#ECEAE4] leading-snug">
                          {entry.ruler}
                        </h3>
                        <p className="text-xs font-medium text-[#D4B483] mt-0.5">
                          {entry.codeName}
                        </p>

                        <p className="mt-3 text-sm leading-relaxed text-[#A3A7B0]">
                          {entry.summary}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#252830] flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveMonograph(entry)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F87171] hover:underline underline-offset-4"
                        >
                          Read Monograph
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href="#law-consequence"
                          onClick={() => setSelectedRulerForTable(entry.id)}
                          className="text-xs font-mono text-[#9CA3AF] hover:text-[#ECEAE4]"
                        >
                          {entry.lawConsequences.length} Statutes →
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 p-10 bg-[#121418] border border-[#262A32] text-center">
                <p className="font-serif text-xl font-medium text-[#ECEAE4]">
                  No archival records match your current filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCatalogSearch('');
                    setCatalogEra('all');
                    setSelectedGeoRegion('all');
                    setShowSavedOnly(false);
                  }}
                  className="mt-4 px-4 py-2 text-xs font-medium text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C]"
                >
                  Reset Catalog Filters
                </button>
              </div>
            )}
          </div>
        </section>
        {/* 07. Interactive Three.js 3D Artifact Chamber */}
        <ArtifactStage3D />

        {/* 08. Lyria Historical Score Studio */}
        <HistoricalMusicStudio
          savedTracks={savedTracks}
          onSaveTrack={handleSaveTrack}
          onDeleteTrack={handleDeleteTrack}
        />

        {/* 09. Multi-Turn Gemini Legal History Chatbot */}
        <HistoricalChatbot />

        {/* 10. Real-Time Gemini Live Voice Seminar */}
        <VoiceConversationPanel />
      </main>

      {/* Curatorial Footer */}
      <footer className="border-t border-[#252830] bg-[#0A0B0D] py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs text-[#9CA3AF]">
          <div>
            <p className="font-serif text-lg font-semibold text-[#ECEAE4]">
              HistoVerse
            </p>
            <p className="mt-1 max-w-xl leading-relaxed">
              Educational reference archive curated from translated primary statutes (Code of Hammurabi, Digest of Justinian, Magna Carta, Constitutio Criminalis Carolina, Kujikata Osadamegaki, and the 1786 Leopoldina).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 shrink-0">
            <a href="#timeline" className="hover:text-[#ECEAE4]">Timeline</a>
            <a href="#law-consequence" className="hover:text-[#ECEAE4]">Law &amp; Consequence</a>
            <a href="#regional-map" className="hover:text-[#ECEAE4]">Regional Map</a>
            <a href="#historical-eras" className="hover:text-[#ECEAE4]">Historical Eras</a>
            <a href="#chamber-3d" className="hover:text-[#ECEAE4]">3D Vault</a>
            <a href="#music-studio" className="hover:text-[#ECEAE4]">Music Studio</a>
            <a href="#archivist-chat" className="hover:text-[#ECEAE4]">Scholar Chat</a>
            <a href="#voice-chamber" className="hover:text-[#ECEAE4]">Voice Seminar</a>
            <button
              type="button"
              onClick={() => setQuizOpen(true)}
              className="font-medium text-[#F87171] hover:underline underline-offset-4"
            >
              Knowledge Check
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RulerDetailModal
        entry={activeMonograph}
        isSaved={activeMonograph ? savedIds.includes(activeMonograph.id) : false}
        noteText={activeMonograph ? researchNotes[activeMonograph.id] ?? '' : ''}
        onSaveNote={handleSaveNote}
        onToggleSave={toggleSaved}
        onClose={() => setActiveMonograph(null)}
        onJumpToComparator={(id) => setSelectedRulerForTable(id)}
      />

      <KnowledgeCheckModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
      />
    </div>
  );
}
