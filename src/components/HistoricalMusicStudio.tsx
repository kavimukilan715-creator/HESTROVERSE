import { useState } from 'react';
import { BookmarkPlus, Loader2, Music, Trash2, Volume2 } from 'lucide-react';

export interface SavedMusicTrack {
  id: string;
  title: string;
  eraLabel: string;
  prompt: string;
  model: string;
  lyrics: string;
  mimeType: string;
  audioUrl: string;
  createdAt: string;
}

interface HistoricalMusicStudioProps {
  savedTracks: SavedMusicTrack[];
  onSaveTrack: (payload: {
    title: string;
    eraLabel: string;
    prompt: string;
    model: string;
    lyrics: string;
    mimeType: string;
    audioDataUrl: string;
  }) => Promise<void>;
  onDeleteTrack: (id: string) => Promise<void>;
}

const SCORE_PRESETS = [
  {
    id: 'babylon-stele',
    title: 'Babylonian Stele Proclamation',
    eraLabel: '1750 BCE · Mesopotamia',
    prompt:
      'Solemn ancient Mesopotamian ceremonial score with deep bronze frame drums, resonant bass lyre, and slow ritual wind drone echoing inside a stone temple hall.',
  },
  {
    id: 'byzantine-court',
    title: 'Justinianic Basilica Resonance',
    eraLabel: '534 CE · Constantinople',
    prompt:
      'Grave Byzantine liturgical brass and unison low male choir over sustained organum fifths, slow processional tempo evoking imperial legal codification.',
  },
  {
    id: 'inquisitorial-bell',
    title: 'Constitutio Criminalis Nocturne',
    eraLabel: '1532 CE · Holy Roman Empire',
    prompt:
      'Dark medieval chamber Requiem with low cathedral pipe organ pedal, bowed viols, and distant iron bell strikes in Dorian mode, cold and austere.',
  },
  {
    id: 'tuscan-abolition',
    title: '1786 Enlightenment Elegy',
    eraLabel: '1786 CE · Tuscany',
    prompt:
      'Classical late-18th-century chamber strings and fortepiano moving from tense minor chords into a solemn, dignified resolution honoring legal reform and human dignity.',
  },
];

export function HistoricalMusicStudio({
  savedTracks,
  onSaveTrack,
  onDeleteTrack,
}: HistoricalMusicStudioProps) {
  const [selectedPresetId, setSelectedPresetId] = useState(SCORE_PRESETS[0].id);
  const [prompt, setPrompt] = useState(SCORE_PRESETS[0].prompt);
  const [title, setTitle] = useState(SCORE_PRESETS[0].title);
  const [eraLabel, setEraLabel] = useState(SCORE_PRESETS[0].eraLabel);
  const [model, setModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>(
    'lyria-3-clip-preview'
  );
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<{
    audioDataUrl: string;
    lyrics: string;
    mimeType: string;
    model: string;
    title: string;
    eraLabel: string;
    prompt: string;
  } | null>(null);

  const handleSelectPreset = (presetId: string) => {
    const preset = SCORE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setTitle(preset.title);
    setEraLabel(preset.eraLabel);
    setPrompt(preset.prompt);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), model }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Music generation failed (${res.status})`);
      }
      setGenerated({
        audioDataUrl: data.audioDataUrl,
        lyrics: data.lyrics || '',
        mimeType: data.mimeType || 'audio/mpeg',
        model: data.model || model,
        title: title.trim() || 'Untitled Historical Score',
        eraLabel: eraLabel.trim() || 'Archival Composition',
        prompt: prompt.trim(),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate historical score.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveCurrent = async () => {
    if (!generated || saving) return;
    setSaving(true);
    try {
      await onSaveTrack(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save track to archive.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      id="music-studio"
      className="py-16 lg:py-24 border-b border-[#252830] bg-[#0F1115]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="max-w-2xl pb-8 border-b border-[#252830]">
          <p className="font-mono text-xs tracking-widest uppercase text-[#D4B483] mb-2">
            08 · Archival Soundscape Studio
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#ECEAE4] tracking-tight text-balance">
            Compose Era-Specific Historical Scores
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#A3A7B0]">
            Generate original period soundscapes with Lyria to accompany archival reading across Mesopotamian steles, Byzantine courts, medieval trials, and Enlightenment legal reforms.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Composer Controls */}
          <div className="lg:col-span-7 bg-[#121418] border border-[#262A32] p-6 sm:p-8 space-y-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-3">
                Curated Era Presets
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SCORE_PRESETS.map((preset) => {
                  const active = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`text-left p-3.5 border transition-colors ${
                        active
                          ? 'bg-[#1B1316] border-[#991B1B] text-[#ECEAE4]'
                          : 'bg-[#14171C] border-[#252830] text-[#A3A7B0] hover:border-[#6B7280] hover:text-[#ECEAE4]'
                      }`}
                    >
                      <p className="font-mono text-[11px] text-[#D4B483]">{preset.eraLabel}</p>
                      <p className="mt-1 font-serif text-base font-semibold text-[#ECEAE4]">
                        {preset.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="music-title"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5"
                >
                  Score Title
                </label>
                <input
                  id="music-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] focus:outline-none focus:border-[#DC2626]"
                />
              </div>

              <div>
                <label
                  htmlFor="music-model"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5"
                >
                  Lyria Format
                </label>
                <select
                  id="music-model"
                  value={model}
                  onChange={(e) =>
                    setModel(e.target.value as 'lyria-3-clip-preview' | 'lyria-3-pro-preview')
                  }
                  className="w-full px-3 py-2 text-sm bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] focus:outline-none focus:border-[#DC2626]"
                >
                  <option value="lyria-3-clip-preview">Lyria 3 Clip (30s Preview)</option>
                  <option value="lyria-3-pro-preview">Lyria 3 Pro (Full Track)</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="music-prompt"
                className="block font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5"
              >
                Instrumentation &amp; Atmosphere Prompt
              </label>
              <textarea
                id="music-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe historical instruments, mode, tempo, and room acoustics..."
                className="w-full px-3 py-2.5 text-sm bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="p-4 bg-[#1C1214] border border-[#7F1D1D] text-xs text-[#FCA5A5] leading-relaxed"
              >
                <strong className="font-semibold text-[#F87171]">Composition Notice:</strong>{' '}
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] disabled:opacity-50 transition-colors"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Composing Score...
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    Generate Historical Score
                  </>
                )}
              </button>

              {generated && (
                <button
                  type="button"
                  onClick={handleSaveCurrent}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#ECEAE4] bg-[#14171C] border border-[#2A2E37] hover:border-[#D4B483] disabled:opacity-50 transition-colors"
                >
                  <BookmarkPlus className="w-4 h-4 text-[#D4B483]" />
                  {saving ? 'Saving...' : 'Save to Archive'}
                </button>
              )}
            </div>

            {generated && (
              <div className="pt-5 border-t border-[#252830] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#D4B483]">
                      {generated.eraLabel}
                    </p>
                    <h3 className="font-serif text-xl font-semibold text-[#ECEAE4]">
                      {generated.title}
                    </h3>
                  </div>
                  <Volume2 className="w-4 h-4 text-[#F87171]" />
                </div>
                <audio
                  controls
                  src={generated.audioDataUrl}
                  className="w-full"
                />
                {generated.lyrics && (
                  <div className="p-3.5 bg-[#14171C] border border-[#252830] text-xs text-[#A3A7B0] whitespace-pre-wrap leading-relaxed">
                    {generated.lyrics}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Saved Score Library */}
          <div className="lg:col-span-5 bg-[#121418] border border-[#262A32] p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#252830]">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#D4B483]">
                  Persistent Audio Archive
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#ECEAE4] mt-1">
                  Saved Scores ({savedTracks.length})
                </h3>
              </div>
            </div>

            {savedTracks.length === 0 ? (
              <p className="mt-6 text-sm text-[#9CA3AF] leading-relaxed">
                No scores saved yet. Generate a period score and store it here for persistent study playback across sessions.
              </p>
            ) : (
              <ul className="mt-5 space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {savedTracks.map((track) => (
                  <li
                    key={track.id}
                    className="p-4 bg-[#14171C] border border-[#252830] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[11px] text-[#D4B483]">{track.eraLabel}</p>
                        <h4 className="font-serif text-lg font-semibold text-[#ECEAE4]">
                          {track.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteTrack(track.id)}
                        aria-label={`Delete ${track.title}`}
                        className="p-1.5 text-[#9CA3AF] hover:text-[#F87171] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <audio controls src={track.audioUrl} className="w-full" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
