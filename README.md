# 🎙️ MeetMind — AI Meeting Intelligence Hub

> **100% local, privacy-first AI meeting assistant.** Upload or record a meeting, get a full timestamped transcript, auto-extracted action items, and ask your local AI questions about the conversation.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-black?logo=flask)
![Whisper](https://img.shields.io/badge/OpenAI-Whisper-412991?logo=openai&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎤 **Speech-to-Text** | Powered by OpenAI Whisper — accurate transcription with per-segment timestamps |
| 📄 **Full Transcript Viewer** | Dialogue, Reading Mode, and Raw Text views with audio sync and search |
| ☑️ **Commitment Tracker** | Auto-extracted decisions, action items, deadlines and assignees — all clickable |
| 🤖 **AI Assistant** | Ask questions about your meeting in natural language via local Ollama LLM |
| ⏱️ **Audio Timestamp Sync** | Click any timestamp to jump audio playback to that exact moment |
| 🎙️ **Live Mic Recording** | Record meetings directly in-browser with real-time visualizer |
| 📤 **Export Options** | Copy as Markdown, download as `.txt`, `.srt` subtitles, or `.json` |
| 🔒 **100% On-Device** | No cloud APIs. Audio, transcripts, and AI all run locally on your machine |

---

## 🖥️ Screenshots

> Upload a meeting → Get a full timestamped transcript, commitment checklist, and AI assistant — all in one workspace.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3, Flask |
| **Speech-to-Text** | [OpenAI Whisper](https://github.com/openai/whisper) (`base` model by default) |
| **Local AI** | [Ollama](https://ollama.com/) — tested with `qwen3-vl:4b` |
| **Frontend** | Vanilla HTML, CSS, JavaScript (no frameworks) |
| **Fonts** | Inter + JetBrains Mono via Google Fonts |

---

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.10+
- [ffmpeg](https://ffmpeg.org/download.html) installed and on `PATH`
- [Ollama](https://ollama.com/) installed and running

### 2. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/MeetMind.git
cd MeetMind
```

### 3. Install Python dependencies

```bash
pip install flask whisper requests
```

> **Note:** If `whisper` fails, install it as:
> ```bash
> pip install openai-whisper
> ```

### 4. Pull your local AI model via Ollama

```bash
ollama pull qwen3-vl:4b
```

> Any Ollama-compatible chat model works. MeetMind auto-detects installed models and prefers `qwen3-vl` variants.

### 5. Run the server

```bash
python app.py
```

Open your browser at **http://127.0.0.1:5000**

---

## 📁 Project Structure

```
MeetMind/
├── app.py          # Flask backend — Whisper transcription, Ollama AI, REST API
├── index.html      # Single-page app shell
├── app.js          # All frontend logic (transcript, tracker, AI chat, audio player)
├── style.css       # Full design system (dark mode, glassmorphism, animations)
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serve the web app |
| `POST` | `/api/transcribe` | Upload audio/video → returns timestamped transcript + commitment extraction |
| `POST` | `/api/ask` | Ask the local LLM a question about the transcript |
| `POST` | `/api/ask/stream` | Streaming SSE version of the AI chat |
| `POST` | `/api/commitments` | Re-extract commitments from transcript lines |
| `GET` | `/api/health` | System health check (Whisper + Ollama status) |

---

## 🧠 How It Works

```
Audio File / Live Mic
        ↓
   Whisper ASR  →  Timestamped Segments
        ↓
  Commitment Extractor  →  Decisions · Actions · Deadlines · Assignees
        ↓
  Interactive UI  →  Click timestamps → jump audio
        ↓
  Ollama LLM  →  Answer any question about the meeting
```

1. **Upload** an audio/video file (MP3, WAV, M4A, OGG, WEBM, MP4) or record live with your mic.
2. **Transcribe** — Whisper converts speech to timestamped text segments.
3. **Extract** — A heuristic + LLM pipeline identifies decisions, action items, assignees and deadlines.
4. **Interact** — Browse the full transcript in Dialogue / Reading / Raw mode, search, copy, or export.
5. **Ask** — The AI Assistant (running via Ollama locally) answers questions referencing exact timestamps.

---

## ⚙️ Configuration

### Whisper Model Size

Edit `app.py` line:

```python
WHISPER_MODEL = "base"   # tiny | base | small | medium | large
```

Larger models are more accurate but slower. `base` is the recommended default for real-time use.

### Ollama Model

MeetMind auto-resolves the best available local model. To force a specific one, edit:

```python
DEFAULT_MODEL = "qwen3-vl:4b"
```

Any model that supports chat (`/api/chat`) works — `llama3`, `mistral`, `phi3`, etc.

---

## 📦 Supported Audio / Video Formats

`MP3` · `WAV` · `M4A` · `OGG` · `WEBM` · `MP4` · `FLAC` · `AAC`

> ffmpeg handles format conversion automatically before Whisper processes the audio.

---

## 🔒 Privacy

- **No data leaves your machine.** Whisper runs locally, Ollama runs locally.
- Transcripts and commitments are stored in your browser's `localStorage` only.
- No telemetry, no accounts, no cloud.

---

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2024 — Free to use, modify and distribute.

---

## 🙏 Acknowledgements

- [OpenAI Whisper](https://github.com/openai/whisper) — open-source speech recognition
- [Ollama](https://ollama.com/) — run LLMs locally with ease
- [Qwen3-VL](https://huggingface.co/Qwen) — local vision-language model used for AI chat
