import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck, Save, X } from 'lucide-react';
import { RulerArchiveEntry } from '../data/historicalArchive';
import { ResilientImage } from './ResilientImage';

interface RulerDetailModalProps {
  entry: RulerArchiveEntry | null;
  isSaved: boolean;
  noteText: string;
  onSaveNote: (rulerId: string, note: string) => Promise<void>;
  onToggleSave: (id: string) => void;
  onClose: () => void;
  onJumpToComparator: (id: string) => void;
}

export function RulerDetailModal({
  entry,
  isSaved,
  noteText,
  onSaveNote,
  onToggleSave,
  onClose,
  onJumpToComparator,
}: RulerDetailModalProps) {
  const [draftNote, setDraftNote] = useState(noteText);
  const [savingNote, setSavingNote] = useState(false);
  const [noteStatus, setNoteStatus] = useState<string | null>(null);

  useEffect(() => {
    setDraftNote(noteText);
    setNoteStatus(null);
  }, [entry?.id, noteText]);

  useEffect(() => {
    if (!entry) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entry, onClose]);

  if (!entry) return null;

  const handleSave = async () => {
    setSavingNote(true);
    setNoteStatus(null);
    try {
      await onSaveNote(entry.id, draftNote);
      setNoteStatus('Research note saved to persistent archive.');
    } catch {
      setNoteStatus('Saved locally; server sync unavailable.');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="monograph-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#111317] border border-[#2A2E37] text-[#ECEAE4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Action Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 bg-[#111317]/95 backdrop-blur-xs border-b border-[#252830]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#9CA3AF] tabular-nums truncate">
            <span className="text-[#F87171] font-medium">{entry.accessionNumber}</span>
            <span aria-hidden="true">·</span>
            <span>{entry.yearLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{entry.region}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(entry.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                isSaved
                  ? 'bg-[#991B1B] text-[#FBF9F5] border-[#991B1B]'
                  : 'bg-[#181B20] text-[#ECEAE4] border-[#2A2E37] hover:border-[#6B7280]'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  Saved in Dossier
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  Save to Dossier
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close monograph"
              className="w-8 h-8 inline-flex items-center justify-center border border-[#2A2E37] bg-[#181B20] text-[#ECEAE4] hover:bg-[#22262E] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          {/* Title Header */}
          <p className="font-mono text-xs uppercase tracking-widest text-[#D4B483]">
            {entry.eraLabel} · {entry.titleOrRole}
          </p>
          <h2
            id="monograph-title"
            className="mt-2 font-serif text-3xl sm:text-5xl font-semibold text-[#ECEAE4] leading-tight text-balance"
          >
            {entry.ruler}: {entry.codeName}
          </h2>

          {/* Accession Metadata Definition Grid */}
          <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-y border-[#262A32] text-xs">
            <div>
              <dt className="font-mono uppercase tracking-wider text-[#9CA3AF]">Authority Basis</dt>
              <dd className="mt-1 font-medium text-[#ECEAE4]">{entry.authoritySource}</dd>
            </div>
            <div>
              <dt className="font-mono uppercase tracking-wider text-[#9CA3AF]">Social Standing</dt>
              <dd className="mt-1 font-medium text-[#ECEAE4]">{entry.classEquality}</dd>
            </div>
            <div>
              <dt className="font-mono uppercase tracking-wider text-[#9CA3AF]">Torture Doctrine</dt>
              <dd className="mt-1 font-medium text-[#F87171]">{entry.tortureStatus}</dd>
            </div>
            <div>
              <dt className="font-mono uppercase tracking-wider text-[#9CA3AF]">Penal Rationale</dt>
              <dd className="mt-1 font-medium text-[#ECEAE4]">{entry.punishmentPhilosophy}</dd>
            </div>
          </dl>

          {/* Artwork Plate + Opening Drop-Cap Narrative */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5">
              <div className="aspect-[4/3] overflow-hidden border border-[#2A2E37] bg-[#0A0B0D]">
                <ResilientImage
                  src={entry.imageSrc}
                  alt={entry.imageAlt}
                  title={entry.codeName}
                />
              </div>
              <p className="mt-2 font-serif italic text-xs text-[#9CA3AF]">
                {entry.figureCaption}
              </p>
            </div>

            <div className="md:col-span-7 space-y-4">
              <h3 className="font-serif text-xl font-semibold text-[#ECEAE4]">
                Historical Context &amp; Sovereign Mandate
              </h3>
              <p className="text-[15px] leading-relaxed text-[#D1D5DB] first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-[#F87171]">
                {entry.historicalContext}
              </p>
              <p className="text-[15px] leading-relaxed text-[#A3A7B0]">
                {entry.summary}
              </p>
            </div>
          </div>

          {/* Primary Source Excerpt */}
          <blockquote className="my-8 py-6 px-4 sm:px-8 bg-[#171A20] border-y border-[#2A2E37]">
            <p className="font-serif italic text-xl sm:text-2xl text-[#ECEAE4] leading-relaxed">
              “{entry.primaryExcerpt.quote}”
            </p>
            <footer className="mt-3 font-mono text-xs text-[#D4B483]">
              Primary Source · {entry.primaryExcerpt.citation}
            </footer>
          </blockquote>

          {/* Judicial Torture & Procedural Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-semibold text-[#ECEAE4]">
                Judicial Torture &amp; Penal Practices
              </h3>
              <p className="text-[15px] leading-relaxed text-[#D1D5DB]">
                {entry.tortureAndPunishmentDetail}
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#ECEAE4]">
                  Procedural Checks &amp; Limits
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#D1D5DB]">
                  {entry.proceduralSafeguards}
                </p>
              </div>
              <div className="pt-4 border-t border-[#252830]">
                <h3 className="font-serif text-xl font-semibold text-[#ECEAE4]">
                  Reform &amp; Long-Term Legacy
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#A3A7B0]">
                  {entry.reformLegacy}
                </p>
              </div>
            </div>
          </div>

          {/* Persistent Curatorial Research Notes */}
          <div className="mt-8 pt-6 border-t border-[#262A32] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="monograph-research-note"
                className="font-mono text-xs uppercase tracking-wider text-[#D4B483]"
              >
                Personal Research Annotation
              </label>
              {noteStatus && (
                <span className="font-mono text-[11px] text-[#9CA3AF]">{noteStatus}</span>
              )}
            </div>
            <textarea
              id="monograph-research-note"
              rows={3}
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              placeholder={`Record archival observations or statute comparisons for ${entry.ruler}...`}
              className="w-full px-3.5 py-2.5 text-sm bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2626]"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={savingNote}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#ECEAE4] bg-[#181B20] border border-[#2A2E37] hover:border-[#D4B483] disabled:opacity-50 transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-[#D4B483]" />
                {savingNote ? 'Saving Note...' : 'Save Research Note'}
              </button>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-8 pt-6 border-t border-[#262A32] flex flex-wrap items-center justify-between gap-4">
            <a
              href="#law-consequence"
              onClick={() => {
                onJumpToComparator(entry.id);
                onClose();
              }}
              className="inline-flex items-center px-4 py-2 text-xs font-medium text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] transition-colors"
            >
              View {entry.ruler} in Law &amp; Consequence Table
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#ECEAE4] border border-[#2A2E37] hover:border-[#6B7280] transition-colors"
            >
              Close Monograph
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
