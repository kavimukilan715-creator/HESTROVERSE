import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Radio, Send } from 'lucide-react';

interface TranscriptTurn {
  id: string;
  speaker: 'You' | 'Scholar';
  text: string;
}

const VOICES = [
  { id: 'Charon', label: 'Charon · Deep Archival' },
  { id: 'Fenrir', label: 'Fenrir · Authoritative' },
  { id: 'Kore', label: 'Kore · Measured Scholar' },
  { id: 'Zephyr', label: 'Zephyr · Clear Narrator' },
  { id: 'Puck', label: 'Puck · Conversational' },
];

const PERSONAS = [
  { id: 'legal-historian', label: 'Chief Legal Historian' },
  { id: 'roman-jurist', label: 'Roman-Canon Jurist' },
  { id: 'enlightenment-reformer', label: 'Enlightenment Reformer' },
  { id: 'comparative-archivist', label: 'Comparative Archivist' },
];

function float32ToBase64Pcm(input: Float32Array): string {
  const int16 = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const clamped = Math.max(-1, Math.min(1, input[i]));
    int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64PcmToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 0x8000;
  }
  return float32;
}

export function VoiceConversationPanel() {
  const [voice, setVoice] = useState('Charon');
  const [persona, setPersona] = useState('legal-historian');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live'>('idle');
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textCue, setTextCue] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const mutedRef = useRef<boolean>(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const stopPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // Ignore already stopped sources
      }
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
  }, []);

  const cleanupSession = useCallback(() => {
    stopPlayback();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => undefined);
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => undefined);
      outputCtxRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignore
      }
      wsRef.current = null;
    }
    setStatus('idle');
  }, [stopPlayback]);

  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, [cleanupSession]);

  const appendTranscript = (speaker: 'You' | 'Scholar', chunk: string) => {
    const clean = chunk.trim();
    if (!clean) return;
    setTranscripts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker) {
        return [
          ...prev.slice(0, -1),
          { ...last, text: `${last.text} ${clean}`.replace(/\s+/g, ' ').trim() },
        ];
      }
      return [...prev, { id: `${speaker}-${Date.now()}`, speaker, text: clean }];
    });
  };

  const playAudioChunk = (base64Pcm: string) => {
    const ctx = outputCtxRef.current;
    if (!ctx) return;

    const samples = base64PcmToFloat32(base64Pcm);
    const buffer = ctx.createBuffer(1, samples.length, 24000);
    buffer.getChannelData(0).set(samples);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startAt = Math.max(ctx.currentTime + 0.01, nextStartTimeRef.current);
    source.start(startAt);
    nextStartTimeRef.current = startAt + buffer.duration;
    activeSourcesRef.current.push(source);

    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
    };
  };

  const startLiveSession = async () => {
    if (status !== 'idle') return;
    setError(null);
    setStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;

      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/api/live-voice?persona=${encodeURIComponent(
        persona
      )}&voice=${encodeURIComponent(voice)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (event) => {
          if (mutedRef.current || ws.readyState !== WebSocket.OPEN) return;
          const pcm = float32ToBase64Pcm(event.inputBuffer.getChannelData(0));
          ws.send(JSON.stringify({ audio: pcm }));
        };
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data) as {
          ready?: boolean;
          audio?: string;
          inputTranscript?: string;
          outputTranscript?: string;
          interrupted?: boolean;
          error?: string;
          closed?: boolean;
        };

        if (msg.ready) {
          setStatus('live');
        }
        if (msg.error) {
          setError(msg.error);
        }
        if (msg.audio) {
          playAudioChunk(msg.audio);
        }
        if (msg.inputTranscript) {
          appendTranscript('You', msg.inputTranscript);
        }
        if (msg.outputTranscript) {
          appendTranscript('Scholar', msg.outputTranscript);
        }
        if (msg.interrupted) {
          stopPlayback();
        }
        if (msg.closed) {
          cleanupSession();
        }
      };

      ws.onerror = () => {
        setError('Voice connection encountered a transport error.');
        cleanupSession();
      };

      ws.onclose = () => {
        cleanupSession();
      };
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Microphone access is required for real-time voice conversation.'
      );
      cleanupSession();
    }
  };

  const sendTextCue = (e: React.FormEvent) => {
    e.preventDefault();
    const text = textCue.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ text }));
    appendTranscript('You', text);
    setTextCue('');
  };

  return (
    <section
      id="voice-chamber"
      className="py-16 lg:py-24 border-b border-[#252830] bg-[#0F1115]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="max-w-2xl pb-8 border-b border-[#252830]">
          <p className="font-mono text-xs tracking-widest uppercase text-[#D4B483] mb-2">
            10 · Live Spoken Seminar
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#ECEAE4] tracking-tight text-balance">
            Real-Time Voice Dialogue with an Archival Historian
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#A3A7B0]">
            Speak directly with a Gemini Live legal scholar about sovereign codes, judicial interrogation doctrines, and penal reform movements with live audio responses and transcript capture.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-5 bg-[#121418] border border-[#262A32] p-6 space-y-5">
            <div>
              <label
                htmlFor="live-persona"
                className="block font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5"
              >
                Historian Specialization
              </label>
              <select
                id="live-persona"
                value={persona}
                disabled={status !== 'idle'}
                onChange={(e) => setPersona(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] disabled:opacity-60 focus:outline-none focus:border-[#DC2626]"
              >
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="live-voice"
                className="block font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5"
              >
                Voice Timbre
              </label>
              <select
                id="live-voice"
                value={voice}
                disabled={status !== 'idle'}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] disabled:opacity-60 focus:outline-none focus:border-[#DC2626]"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3.5 bg-[#1C1214] border border-[#7F1D1D] text-xs text-[#FCA5A5] leading-relaxed"
              >
                {error}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {status === 'idle' ? (
                <button
                  type="button"
                  onClick={startLiveSession}
                  className="inline-flex items-center gap-2 px-5 py-3 text-xs font-medium text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] transition-colors"
                >
                  <Radio className="w-4 h-4" />
                  Start Voice Conversation
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setMuted((prev) => !prev)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium border transition-colors ${
                      muted
                        ? 'bg-[#1C1214] border-[#991B1B] text-[#FCA5A5]'
                        : 'bg-[#14171C] border-[#2A2E37] text-[#ECEAE4]'
                    }`}
                  >
                    {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#F87171]" />}
                    {muted ? 'Unmute Mic' : 'Mute Mic'}
                  </button>
                  <button
                    type="button"
                    onClick={cleanupSession}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#FBF9F5] bg-[#7F1D1D] hover:bg-[#991B1B] transition-colors"
                  >
                    <PhoneOff className="w-4 h-4" />
                    End Session
                  </button>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-[#252830] text-xs font-mono text-[#9CA3AF]">
              Session state:{' '}
              <span className="text-[#ECEAE4]">
                {status === 'idle'
                  ? 'Standby'
                  : status === 'connecting'
                    ? 'Connecting audio bridge...'
                    : muted
                      ? 'Live · Microphone muted'
                      : 'Live · Listening at 16 kHz'}
              </span>
            </div>
          </div>

          {/* Live Transcript & Optional Text Cue */}
          <div className="lg:col-span-7 bg-[#121418] border border-[#262A32] flex flex-col h-[420px]">
            <div className="px-5 py-3.5 border-b border-[#252830] flex items-center justify-between text-xs">
              <span className="font-mono uppercase tracking-wider text-[#D4B483]">
                Live Seminar Transcript
              </span>
              {transcripts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTranscripts([])}
                  className="font-mono text-[11px] text-[#9CA3AF] hover:text-[#ECEAE4]"
                >
                  Clear Transcript
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {transcripts.length === 0 ? (
                <p className="text-sm text-[#9CA3AF] leading-relaxed">
                  Start a live voice session and ask aloud about Hammurabi’s talion rules, Roman-Canon statutory torture, or Enlightenment abolitionists. Real-time spoken responses and transcriptions appear here.
                </p>
              ) : (
                transcripts.map((turn) => (
                  <div
                    key={turn.id}
                    className={`p-3.5 text-sm leading-relaxed ${
                      turn.speaker === 'You'
                        ? 'bg-[#1A1315] border border-[#4C1D24] text-[#ECEAE4]'
                        : 'bg-[#14171C] border border-[#252830] text-[#D1D5DB]'
                    }`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#D4B483] mb-1">
                      {turn.speaker}
                    </p>
                    <p>{turn.text}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={sendTextCue}
              className="p-3.5 border-t border-[#252830] bg-[#0F1115] flex items-center gap-2.5"
            >
              <input
                type="text"
                value={textCue}
                onChange={(e) => setTextCue(e.target.value)}
                disabled={status !== 'live'}
                placeholder={
                  status === 'live'
                    ? 'Optional: send a written prompt into the live voice session...'
                    : 'Start voice session to speak or send live cues...'
                }
                className="flex-1 px-3 py-2 text-xs bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] placeholder:text-[#6B7280] disabled:opacity-60 focus:outline-none focus:border-[#DC2626]"
              />
              <button
                type="submit"
                disabled={status !== 'live' || !textCue.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Cue
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
