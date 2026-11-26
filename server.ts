import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { GoogleGenAI, Modality, type Content, type LiveServerMessage } from '@google/genai';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, type WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(__dirname, '.histoverse-data');
const AUDIO_DIR = path.join(DATA_DIR, 'audio');
const ARCHIVE_FILE = path.join(DATA_DIR, 'archive.json');

interface SavedTrackRecord {
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

interface ArchiveStore {
  savedRulerIds: string[];
  notes: Record<string, string>;
  savedTracks: SavedTrackRecord[];
}

const DEFAULT_STORE: ArchiveStore = {
  savedRulerIds: [],
  notes: {},
  savedTracks: [],
};

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(AUDIO_DIR, { recursive: true });
}

async function readStore(): Promise<ArchiveStore> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(ARCHIVE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ArchiveStore>;
    return {
      savedRulerIds: Array.isArray(parsed.savedRulerIds) ? parsed.savedRulerIds : [],
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      savedTracks: Array.isArray(parsed.savedTracks) ? parsed.savedTracks : [],
    };
  } catch {
    return { savedRulerIds: [], notes: {}, savedTracks: [] };
  }
}

async function writeStore(store: ArchiveStore): Promise<void> {
  await ensureDataDir();
  const tmpFile = `${ARCHIVE_FILE}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(store, null, 2), 'utf8');
  await fs.rename(tmpFile, ARCHIVE_FILE);
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured in server environment.') as Error & {
      status?: number;
    };
    err.status = 500;
    throw err;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const PERSONA_PROMPTS: Record<string, string> = {
  'legal-historian':
    'You are the Chief Legal Historian at HistoVerse, an educational museum archive examining sovereign law codes, penal deterrence, and the history and abolition of judicial torture from 1750 BCE to the 19th century. Ground answers in primary legal monuments (Code of Hammurabi, Draco, Twelve Tables, Qin/Han Statutes, Justinian Corpus Juris Civilis, Magna Carta, Constitutio Criminalis Carolina, Tokugawa Kujikata Osadamegaki, and Cesare Beccaria / 1786 Leopoldina). Be objective, precise, sober, and scholarly—never sensationalize violence; focus on institutional mechanics, evidentiary standards, class disparities, and historical reforms.',
  'roman-jurist':
    'You are an academic specialist in Roman-Canon Inquisitorial Procedure and Justinianic jurisprudence at HistoVerse. Explain clearly how the abolition of trial by ordeal (1215) led European jurists to adopt strict statutory proof rules (two eyewitnesses or confession) that institutionalized regulated judicial torture (quaestio) under the Constitutio Criminalis Carolina and Ordonnance Criminelle, and how jurists later critiqued these evidentiary paradoxes.',
  'enlightenment-reformer':
    'You are a historian of 18th-century Enlightenment penal reform at HistoVerse, specializing in Cesare Beccaria (On Crimes and Punishments, 1764), Pietro Verri, and Grand Duke Pietro Leopoldo’s 1786 Leopoldina in Tuscany. Explain the philosophical and legal arguments that dismantled judicial torture and capital punishment in favor of proportionate, codified legality.',
  'comparative-archivist':
    'You are a comparative archival curator at HistoVerse specializing in cross-civilizational legal traditions across Mesopotamia, Imperial China, Tokugawa Japan, Mediterranean Antiquity, and Europe. Compare class-stratified penalties, state monopoly over punishment, and evidentiary doctrines with exact citations and dates.',
};

const ALLOWED_CHAT_MODELS = new Set([
  'gemini-4-hydrogen',
  'gemini-3.1-flash-lite',
  'gemini-4-neon',
  'gemini-4-carbon',
]);

const ALLOWED_MUSIC_MODELS = new Set([
  'lyria-3-clip-preview',
  'lyria-3-pro-preview',
]);

const ALLOWED_VOICES = new Set(['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr']);

function extractApiError(err: unknown): { status: number; message: string } {
  const anyErr = err as { status?: number; code?: number; message?: string } | undefined;
  const status =
    typeof anyErr?.status === 'number' && anyErr.status >= 400 && anyErr.status < 600
      ? anyErr.status
      : typeof anyErr?.code === 'number' && anyErr.code >= 400 && anyErr.code < 600
        ? anyErr.code
        : 500;
  const rawMessage = anyErr?.message || (err instanceof Error ? err.message : 'Upstream AI service error');
  return { status, message: rawMessage };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '16mb' }));

  // Persistent Archival Store Routes
  app.get('/api/archive', async (_req: Request, res: Response) => {
    try {
      const store = await readStore();
      res.json(store);
    } catch (err) {
      console.error('Failed to read archive store:', err);
      res.status(500).json({ error: 'Unable to load archival study store.' });
    }
  });

  app.put('/api/archive/dossier', async (req: Request, res: Response) => {
    try {
      const rawIds = req.body?.savedRulerIds;
      if (!Array.isArray(rawIds)) {
        return res.status(400).json({ error: 'savedRulerIds must be an array.' });
      }
      const cleanIds = rawIds
        .filter((id): id is string => typeof id === 'string' && /^[a-z0-9-]{1,64}$/.test(id))
        .slice(0, 50);

      const store = await readStore();
      store.savedRulerIds = Array.from(new Set(cleanIds));
      await writeStore(store);
      return res.json({ savedRulerIds: store.savedRulerIds });
    } catch (err) {
      console.error('Failed to update dossier:', err);
      return res.status(500).json({ error: 'Failed to persist dossier.' });
    }
  });

  app.put('/api/archive/notes', async (req: Request, res: Response) => {
    try {
      const rulerId = req.body?.rulerId;
      const note = req.body?.note;
      if (typeof rulerId !== 'string' || !/^[a-z0-9-]{1,64}$/.test(rulerId)) {
        return res.status(400).json({ error: 'Invalid rulerId.' });
      }
      if (typeof note !== 'string' || note.length > 4000) {
        return res.status(400).json({ error: 'Note must be a string up to 4000 characters.' });
      }

      const store = await readStore();
      const trimmed = note.trim();
      if (trimmed) {
        store.notes[rulerId] = trimmed;
      } else {
        delete store.notes[rulerId];
      }
      await writeStore(store);
      return res.json({ notes: store.notes });
    } catch (err) {
      console.error('Failed to save note:', err);
      return res.status(500).json({ error: 'Failed to persist note.' });
    }
  });

  app.post('/api/archive/tracks', async (req: Request, res: Response) => {
    try {
      const { title, eraLabel, prompt, model, lyrics, audioDataUrl, mimeType } = req.body ?? {};
      if (
        typeof title !== 'string' ||
        typeof prompt !== 'string' ||
        typeof audioDataUrl !== 'string' ||
        !audioDataUrl.startsWith('data:audio/')
      ) {
        return res.status(400).json({ error: 'Invalid track payload.' });
      }
      const base64Match = /^data:([^;]+);base64,(.+)$/.exec(audioDataUrl);
      if (!base64Match) {
        return res.status(400).json({ error: 'Malformed audio data URL.' });
      }
      const audioBuffer = Buffer.from(base64Match[2], 'base64');
      if (audioBuffer.length > 15 * 1024 * 1024) {
        return res.status(400).json({ error: 'Audio track exceeds 15MB limit.' });
      }

      await ensureDataDir();
      const id = `track-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const filename = `${id}.mp3`;
      await fs.writeFile(path.join(AUDIO_DIR, filename), audioBuffer);

      const record: SavedTrackRecord = {
        id,
        title: title.slice(0, 120),
        eraLabel: typeof eraLabel === 'string' ? eraLabel.slice(0, 80) : 'Historical Score',
        prompt: prompt.slice(0, 600),
        model: typeof model === 'string' ? model.slice(0, 64) : 'lyria-3-clip-preview',
        lyrics: typeof lyrics === 'string' ? lyrics.slice(0, 4000) : '',
        mimeType: typeof mimeType === 'string' ? mimeType : base64Match[1],
        audioUrl: `/api/archive/audio/${id}`,
        createdAt: new Date().toISOString(),
      };

      const store = await readStore();
      store.savedTracks = [record, ...store.savedTracks].slice(0, 24);
      await writeStore(store);
      return res.status(201).json({ track: record, savedTracks: store.savedTracks });
    } catch (err) {
      console.error('Failed to save track:', err);
      return res.status(500).json({ error: 'Failed to save generated track.' });
    }
  });

  app.get('/api/archive/audio/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (typeof id !== 'string' || !/^track-[0-9]+-[a-f0-9]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid track ID.' });
    }
    const filePath = path.join(AUDIO_DIR, `${id}.mp3`);
    try {
      await fs.access(filePath);
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.sendFile(filePath);
    } catch {
      return res.status(404).json({ error: 'Audio track not found.' });
    }
  });

  app.delete('/api/archive/tracks/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (typeof id !== 'string' || !/^track-[0-9]+-[a-f0-9]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid track ID.' });
    }
    try {
      const store = await readStore();
      store.savedTracks = store.savedTracks.filter((t) => t.id !== id);
      await writeStore(store);
      await fs.unlink(path.join(AUDIO_DIR, `${id}.mp3`)).catch(() => undefined);
      return res.json({ savedTracks: store.savedTracks });
    } catch (err) {
      console.error('Failed to delete track:', err);
      return res.status(500).json({ error: 'Failed to delete track.' });
    }
  });

  // Multi-Turn Gemini Chatbot Endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, history, personaId, model } = req.body ?? {};
      if (typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'A non-empty message is required.' });
      }
      if (message.length > 4000) {
        return res.status(400).json({ error: 'Message exceeds 4000 characters.' });
      }

      const selectedModel =
        typeof model === 'string' && ALLOWED_CHAT_MODELS.has(model)
          ? model
          : 'gemini-4-hydrogen';
      const systemInstruction =
        typeof personaId === 'string' && PERSONA_PROMPTS[personaId]
          ? PERSONA_PROMPTS[personaId]
          : PERSONA_PROMPTS['legal-historian'];

      const formattedHistory: Content[] = Array.isArray(history)
        ? history
            .filter(
              (turn): turn is { role: 'user' | 'model'; text: string } =>
                Boolean(turn) &&
                (turn.role === 'user' || turn.role === 'model') &&
                typeof turn.text === 'string' &&
                turn.text.trim().length > 0
            )
            .slice(-24)
            .map((turn) => ({
              role: turn.role,
              parts: [{ text: turn.text.slice(0, 6000) }],
            }))
        : [];

      const ai = getAiClient();
      const chat = ai.chats.create({
        model: selectedModel,
        config: {
          systemInstruction,
        },
        history: formattedHistory,
      });

      const response = await chat.sendMessage({ message: message.trim() });
      const reply = response.text?.trim();
      if (!reply) {
        return res.status(502).json({ error: 'Empty response received from Gemini model.' });
      }

      return res.json({
        reply,
        model: selectedModel,
      });
    } catch (err) {
      const { status, message } = extractApiError(err);
      console.error('Chat API error:', status, message);
      return res.status(status).json({ error: message });
    }
  });

  // Lyria Historical Score Generation Endpoint
  app.post('/api/music/generate', async (req: Request, res: Response) => {
    try {
      const { prompt, model } = req.body ?? {};
      if (typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'A musical composition prompt is required.' });
      }
      if (prompt.length > 1500) {
        return res.status(400).json({ error: 'Prompt exceeds 1500 characters.' });
      }

      const selectedModel =
        typeof model === 'string' && ALLOWED_MUSIC_MODELS.has(model)
          ? model
          : 'lyria-3-clip-preview';

      const ai = getAiClient();
      // Omit responseModalities so both MP3 inlineData and text notes/lyrics are returned
      const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: prompt.trim(),
      });

      const audioChunks: Buffer[] = [];
      let lyrics = '';
      let mimeType = 'audio/mpeg';

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (audioChunks.length === 0 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioChunks.push(Buffer.from(part.inlineData.data, 'base64'));
          }
          if (part.text) {
            lyrics += part.text;
          }
        }
      }

      if (audioChunks.length === 0) {
        return res.status(502).json({
          error: 'No audio data returned by Lyria for this composition prompt.',
        });
      }

      const audioBase64 = Buffer.concat(audioChunks).toString('base64');
      const audioDataUrl = `data:${mimeType};base64,${audioBase64}`;

      return res.json({
        audioDataUrl,
        lyrics: lyrics.trim(),
        mimeType,
        model: selectedModel,
      });
    } catch (err) {
      const { status, message } = extractApiError(err);
      console.error('Music generation error:', status, message);
      return res.status(status).json({ error: message });
    }
  });

  // Vite dev middleware or static dist fallback
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const server = http.createServer(app);

  // Real-Time Gemini Live Voice WebSocket Bridge
  const wss = new WebSocketServer({ server, path: '/api/live-voice' });

  wss.on('connection', async (clientWs: WebSocket, req) => {
    const url = new URL(req.url || '/api/live-voice', `http://localhost:${PORT}`);
    const personaParam = url.searchParams.get('persona') || 'legal-historian';
    const voiceParam = url.searchParams.get('voice') || 'Charon';

    const systemInstruction =
      PERSONA_PROMPTS[personaParam] || PERSONA_PROMPTS['legal-historian'];
    const voiceName = ALLOWED_VOICES.has(voiceParam) ? voiceParam : 'Charon';

    let session: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null;
    let closed = false;

    const sendJson = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    try {
      const ai = getAiClient();
      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `${systemInstruction} Keep spoken answers concise, clear, and conversational (2 to 4 sentences unless asked for deeper detail).`,
        },
        callbacks: {
          onopen: () => {
            sendJson({ ready: true, voice: voiceName, persona: personaParam });
          },
          onmessage: (message: LiveServerMessage) => {
            const content = message.serverContent;
            if (content?.inputTranscription?.text) {
              sendJson({ inputTranscript: content.inputTranscription.text });
            }
            if (content?.outputTranscription?.text) {
              sendJson({ outputTranscript: content.outputTranscription.text });
            }
            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                sendJson({ audio: part.inlineData.data });
              }
            }
            if (content?.turnComplete) {
              sendJson({ turnComplete: true });
            }
            if (content?.interrupted) {
              sendJson({ interrupted: true });
            }
          },
          onerror: (err: unknown) => {
            const { message } = extractApiError(err);
            sendJson({ error: message });
          },
          onclose: () => {
            if (!closed) {
              sendJson({ closed: true });
              if (clientWs.readyState === clientWs.OPEN) {
                clientWs.close();
              }
            }
          },
        },
      });
    } catch (err) {
      const { message } = extractApiError(err);
      console.error('Live session setup failed:', message);
      sendJson({ error: message });
      clientWs.close();
      return;
    }

    clientWs.on('message', (raw) => {
      if (!session || closed) return;
      try {
        const parsed = JSON.parse(raw.toString()) as { audio?: string; text?: string };
        if (typeof parsed.audio === 'string' && parsed.audio.length > 0) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (typeof parsed.text === 'string' && parsed.text.trim().length > 0) {
          session.sendRealtimeInput({
            text: parsed.text.trim().slice(0, 1000),
          });
        }
      } catch (err) {
        console.error('Invalid live message frame:', err);
      }
    });

    clientWs.on('close', () => {
      closed = true;
      try {
        session?.close();
      } catch {
        // Ignore close errors
      }
      session = null;
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`HistoVerse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
