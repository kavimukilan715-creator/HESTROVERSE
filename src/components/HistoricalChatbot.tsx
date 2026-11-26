import { useEffect, useRef, useState } from 'react';
import { Loader2, MessageSquare, RotateCcw, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
}

const PERSONAS = [
  {
    id: 'legal-historian',
    label: 'Chief Legal Historian',
    desc: 'Broad comparative mastery across 1750 BCE – 1786 CE',
  },
  {
    id: 'roman-jurist',
    label: 'Roman-Canon Jurist',
    desc: 'Inquisitorial proof rules & statutory quaestio',
  },
  {
    id: 'enlightenment-reformer',
    label: 'Enlightenment Reformer',
    desc: 'Beccaria, Tuscan Leopoldina & abolition philosophy',
  },
  {
    id: 'comparative-archivist',
    label: 'Comparative Archivist',
    desc: 'Cross-regional statutes from Babylon to Tokugawa Edo',
  },
];

const CHAT_MODELS = [
  { id: 'gemini-4-hydrogen', label: 'Gemini 4 Hydrogen (Standard)' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite (Fast)' },
  { id: 'gemini-4-neon', label: 'Gemini 4 Neon (Complex · Paid Key)' },
  { id: 'gemini-4-carbon', label: 'Gemini 4 Carbon (Deep Reasoning · Paid Key)' },
];

const STARTER_PROMPTS = [
  'Why did the 1215 ban on trial by ordeal lead medieval European courts to formalize judicial torture?',
  'Compare class-based penalties in Hammurabi’s Code with Tang and Tokugawa criminal statutes.',
  'What exact arguments did Cesare Beccaria and Grand Duke Pietro Leopoldo use to abolish torture in 1786?',
];

export function HistoricalChatbot() {
  const [personaId, setPersonaId] = useState(PERSONAS[0].id);
  const [model, setModel] = useState('gemini-4-hydrogen');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: 'Welcome to the HistoVerse Research Desk. Ask any question regarding sovereign law codes, evidentiary rules behind judicial torture, regional legal traditions, or 18th-century abolitionist reforms.',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const sendMessage = async (textToSend?: string) => {
    const content = (textToSend ?? input).trim();
    if (!content || sending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: content,
    };

    const historyPayload = messages
      .filter((m) => m.id !== 'welcome-1')
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setError(null);
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: historyPayload,
          personaId,
          model,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.reply,
          modelUsed: data.model,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to receive scholar response.');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-1',
        role: 'model',
        text: 'Conversation reset. Ask a new question about historical rulers, codified punishments, or legal reform.',
      },
    ]);
    setError(null);
  };

  return (
    <section
      id="archivist-chat"
      className="py-16 lg:py-24 border-b border-[#252830] bg-[#0A0B0D]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#252830]">
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-widest uppercase text-[#D4B483] mb-2">
              09 · Archival Scholar Desk
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#ECEAE4] tracking-tight text-balance">
              Consult the Legal History Chatbot
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#A3A7B0]">
              Conduct multi-turn historical inquiries across primary legal monuments, procedural torture doctrines, and cross-regional statutes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#ECEAE4] bg-[#14171C] border border-[#2A2E37] hover:border-[#6B7280] self-start lg:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Conversation
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Configuration Column */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-[#121418] border border-[#262A32] p-5 space-y-4">
              <div>
                <label
                  htmlFor="chat-persona"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#D4B483] mb-2"
                >
                  Scholarly Persona
                </label>
                <div className="space-y-2" id="chat-persona">
                  {PERSONAS.map((p) => {
                    const active = personaId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPersonaId(p.id)}
                        className={`w-full text-left p-3 border transition-colors ${
                          active
                            ? 'bg-[#1B1316] border-[#991B1B] text-[#ECEAE4]'
                            : 'bg-[#14171C] border-[#252830] text-[#A3A7B0] hover:border-[#6B7280]'
                        }`}
                      >
                        <p className="text-xs font-semibold text-[#ECEAE4]">{p.label}</p>
                        <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#252830]">
                <label
                  htmlFor="chat-model-select"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5"
                >
                  Reasoning Model
                </label>
                <select
                  id="chat-model-select"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] focus:outline-none focus:border-[#DC2626]"
                >
                  {CHAT_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-[#121418] border border-[#262A32] p-5 space-y-2.5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#D4B483]">
                Suggested Inquiries
              </p>
              {STARTER_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={sending}
                  className="w-full text-left p-3 text-xs leading-relaxed bg-[#14171C] border border-[#252830] text-[#D1D5DB] hover:border-[#DC2626] disabled:opacity-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Right Scrollable Conversation Thread */}
          <div className="lg:col-span-8 bg-[#121418] border border-[#262A32] flex flex-col h-[560px]">
            <div className="px-5 py-3.5 border-b border-[#252830] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono text-[#D4B483]">
                <MessageSquare className="w-4 h-4 text-[#F87171]" />
                <span>{PERSONAS.find((p) => p.id === personaId)?.label}</span>
              </div>
              <span className="font-mono text-[11px] text-[#9CA3AF]">{model}</span>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#991B1B] text-[#FBF9F5]'
                        : 'bg-[#171A20] border border-[#2A2E37] text-[#ECEAE4]'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-1 font-mono text-[10px] text-[#9CA3AF]">
                    {msg.role === 'user'
                      ? 'Researcher'
                      : `Archivist${msg.modelUsed ? ` · ${msg.modelUsed}` : ''}`}
                  </span>
                </div>
              ))}

              {sending && (
                <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#F87171]" />
                  <span>Consulting archival treatises...</span>
                </div>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="mx-5 mb-3 p-3 bg-[#1C1214] border border-[#7F1D1D] text-xs text-[#FCA5A5]"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="p-4 border-t border-[#252830] bg-[#0F1115] flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Hammurabi, Draco, Carolina 1532, Beccaria, or torture statutes..."
                aria-label="Ask the legal historian chatbot"
                className="flex-1 px-3.5 py-2.5 text-sm bg-[#14171C] border border-[#2A2E37] text-[#ECEAE4] placeholder:text-[#6B7280] focus:outline-none focus:border-[#DC2626]"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] disabled:opacity-50 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
