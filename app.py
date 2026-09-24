from flask import Flask, request, jsonify, send_from_directory, Response
import requests
import os
import re
import json
import uuid
import tempfile
import subprocess

import whisper


# ==========================================
# FLASK
# ==========================================

app = Flask(__name__, static_folder=".", static_url_path="")


# ==========================================
# OLLAMA CONFIGURATION & MODEL RESOLVER
# ==========================================

OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_TAGS_URL = "http://localhost:11434/api/tags"
DEFAULT_MODEL = "qwen3-vl:4b"


def get_installed_ollama_models():
    try:
        resp = requests.get(OLLAMA_TAGS_URL, timeout=4.0)
        if resp.status_code == 200:
            return [m.get("name") for m in resp.json().get("models", []) if m.get("name")]
    except Exception:
        pass
    return []


def resolve_ollama_model(preferred=None):
    """
    Intelligently resolves local Ollama models.
    Supports user typos such as 'qwen30vl:4b' -> 'qwen3-vl:4b'.
    """
    installed = get_installed_ollama_models()
    if not installed:
        return preferred or DEFAULT_MODEL

    if preferred:
        pref_norm = re.sub(r"[^a-zA-Z0-9]", "", preferred.lower())
        for m in installed:
            m_norm = re.sub(r"[^a-zA-Z0-9]", "", m.lower())
            if pref_norm == m_norm or pref_norm in m_norm or m_norm in pref_norm:
                return m

    for m in installed:
        m_lower = m.lower()
        if "qwen3-vl" in m_lower or "qwen3" in m_lower or "qwen" in m_lower:
            return m

    return installed[0]


# ==========================================
# WHISPER INITIALIZATION
# ==========================================

WHISPER_MODEL = "base"

print()
print("================================")
print("Loading Whisper model...")
print("Model:", WHISPER_MODEL)
print("================================")
print()

whisper_model = whisper.load_model(WHISPER_MODEL)

print()
print("Whisper model loaded successfully.")
print()


# ==========================================
# WEBSITE STATIC ROUTES
# ==========================================

@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/style.css")
def css():
    return send_from_directory(".", "style.css")


@app.route("/app.js")
def js():
    return send_from_directory(".", "app.js")


# ==========================================
# AUDIO DURATION & FORMATTING HELPERS
# ==========================================

def get_audio_duration(file_path):
    """
    Get audio duration in seconds using ffprobe.
    """
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                file_path
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        return float(result.stdout.strip())
    except Exception:
        return None


def format_duration(seconds):
    """
    Convert seconds into MM:SS or HH:MM:SS format.
    """
    if seconds is None:
        return None

    seconds = max(0, int(round(seconds)))
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60

    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"

    return f"{minutes:02d}:{secs:02d}"


# ==========================================
# BUILD DETAILED TRANSCRIPT LINES WITH TIMESTAMPS
# ==========================================

def build_transcript_lines(result):
    """
    Preserve Whisper segment start and end timestamps so every line
    can be scrubbed, jumped to, and referenced in the Commitment Tracker.
    """
    lines = []
    segments = result.get("segments", [])

    for idx, segment in enumerate(segments):
        text = (segment.get("text") or "").strip()
        if not text:
            continue

        start_sec = round(float(segment.get("start", 0.0)), 2)
        end_sec = round(float(segment.get("end", start_sec)), 2)

        start_formatted = format_duration(start_sec)
        end_formatted = format_duration(end_sec)

        lines.append({
            "id": idx + 1,
            "speaker": "Speaker",
            "text": text,
            "start": start_sec,
            "end": end_sec,
            "timestamp": start_formatted,
            "time_range": f"{start_formatted} - {end_formatted}"
        })

    # Build timestamped transcript string
    speaker_transcript = "\n".join(
        f"[{line['timestamp']}] {line['speaker']}: {line['text']}"
        for line in lines
    )

    return speaker_transcript, lines


# ==========================================
# HEURISTIC COMMITMENT & DECISION EXTRACTOR
# (Guaranteed offline / fallback extraction)
# ==========================================

DECISION_WORDS = re.compile(
    r"\b(decided|decision|agreed|agreement|consensus|settled on|resolved|approved|chose|chosen|finalize[d]?|we will go with)\b",
    re.IGNORECASE
)

ACTION_WORDS = re.compile(
    r"\b(will\s+(?:handle|deliver|complete|create|implement|prepare|review|fix|ship|take|send|update|organize|set up)|"
    r"i(?:'ll|\s+will)|we(?:'ll|\s+will)|responsible for|action item|to-do|todo|committed to|commits to|"
    r"assigned to|take ownership|follow up on|need to (?:make|do|finish))\b",
    re.IGNORECASE
)

DEADLINE_PATTERN = re.compile(
    r"\b(?:by|before|until|due on|due by|due)\s+([A-Za-z0-9\s:/-]+?)(?:[.,;]|$)",
    re.IGNORECASE
)

ASSIGNEE_PATTERN = re.compile(
    r"\b([A-Z][a-z]+)\s+(?:will|'ll|is going to|agreed to|committed to|is responsible for)\b"
)


def extract_commitments_fallback(lines, transcript_text):
    """
    Deterministically parses lines and sentences to extract:
    - Important Decisions
    - Action Items / Commitments
    - Deadlines & Targets
    - Assignee identification
    - Exact audio timestamp bindings
    """
    commitments = []
    seen_texts = set()

    for line in lines:
        line_text = line.get("text", "")
        start_time = line.get("start", 0.0)
        timestamp = line.get("timestamp", "00:00")

        # Split into distinct sentences or clauses
        sentences = re.split(r"(?<=[.!?])\s+", line_text)

        for sent in sentences:
            sent_clean = sent.strip()
            if len(sent_clean) < 10:
                continue

            is_decision = bool(DECISION_WORDS.search(sent_clean))
            is_action = bool(ACTION_WORDS.search(sent_clean))

            if not (is_decision or is_action):
                continue

            # Determine Type
            item_type = "decision" if is_decision else "action_item"

            # Check for deadline mention
            deadline_match = DEADLINE_PATTERN.search(sent_clean)
            deadline = deadline_match.group(1).strip() if deadline_match else "Not specified"

            # Check for specific person name assignee
            assignee = "Unassigned"
            name_match = ASSIGNEE_PATTERN.search(sent_clean)
            if name_match:
                candidate = name_match.group(1).strip()
                if candidate.lower() not in ["we", "it", "this", "that", "there", "then", "when"]:
                    assignee = candidate
            elif re.search(r"\bi\s+(?:will|'ll|can|am going to)\b", sent_clean, re.IGNORECASE):
                assignee = "Speaker"
            elif re.search(r"\bwe\s+(?:will|'ll|are going to)\b", sent_clean, re.IGNORECASE):
                assignee = "Team"

            # Priority classification
            priority = "medium"
            if re.search(r"\b(urgent|critical|immediately|asap|blocker|must|top priority|high priority)\b", sent_clean, re.IGNORECASE):
                priority = "high"
            elif re.search(r"\b(later|when possible|low priority|eventually|someday)\b", sent_clean, re.IGNORECASE):
                priority = "low"
            elif is_decision or deadline != "Not specified":
                priority = "high" if "friday" in deadline.lower() or "today" in deadline.lower() or "tomorrow" in deadline.lower() else "medium"

            # Formulate clear text summary
            text_summary = sent_clean
            if len(text_summary) > 140:
                text_summary = text_summary[:137] + "..."

            # Avoid duplicates
            clean_key = re.sub(r"[^a-zA-Z0-9]", "", text_summary.lower())[:40]
            if clean_key in seen_texts:
                continue
            seen_texts.add(clean_key)

            commitments.append({
                "id": f"com-{uuid.uuid4().hex[:8]}",
                "text": text_summary,
                "type": item_type,
                "timestamp": timestamp,
                "start": start_time,
                "assignee": assignee,
                "priority": priority,
                "deadline": deadline,
                "context": line_text,
                "completed": False,
                "notes": ""
            })

    # If transcript was short and few items matched, capture at least key points
    if not commitments and lines:
        for idx, line in enumerate(lines[:3]):
            commitments.append({
                "id": f"com-{uuid.uuid4().hex[:8]}",
                "text": line["text"],
                "type": "decision" if idx == 0 else "action_item",
                "timestamp": line.get("timestamp", "00:00"),
                "start": line.get("start", 0.0),
                "assignee": "Speaker",
                "priority": "medium",
                "deadline": "Not specified",
                "context": line["text"],
                "completed": False,
                "notes": ""
            })

    return commitments


# ==========================================
# LLM EXTRACTOR WITH FALLBACK
# ==========================================

def extract_commitments_with_llm(lines, timestamped_transcript):
    """
    Attempts extraction via local Ollama LLM if available;
    otherwise falls back smoothly to heuristic extraction.
    """
    if not lines and not timestamped_transcript:
        return []

    if not timestamped_transcript and lines:
        timestamped_transcript = "\n".join(
            f"[{l.get('timestamp', '00:00')}] {l.get('speaker', 'Speaker')}: {l.get('text', '')}"
            for l in lines
        )
    elif not lines and timestamped_transcript:
        lines = []
        for idx, tline in enumerate(timestamped_transcript.splitlines()):
            tline = tline.strip()
            if not tline:
                continue
            ts_match = re.search(r"\[(\d{1,2}:\d{2})\]", tline)
            ts = ts_match.group(1) if ts_match else "00:00"
            parts = ts.split(":")
            sec = int(parts[0]) * 60 + int(parts[1]) if len(parts) == 2 else 0.0
            clean_text = re.sub(r"\[\d{1,2}:\d{2}\]\s*(?:Speaker:\s*)?", "", tline).strip()
            lines.append({"id": idx + 1, "text": clean_text or tline, "timestamp": ts, "start": sec})

    active_model = resolve_ollama_model()

    # Check if Ollama is reachable
    ollama_ready = False
    try:
        tag_resp = requests.get(OLLAMA_TAGS_URL, timeout=4.0)
        if tag_resp.status_code == 200:
            models_list = tag_resp.json().get("models", [])
            if any(active_model in m.get("name", "") for m in models_list) or models_list:
                ollama_ready = True
    except Exception:
        ollama_ready = False

    if not ollama_ready:
        print("Notice: Ollama model not detected. Using high-precision heuristic commitment extractor.")
        return extract_commitments_fallback(lines, timestamped_transcript)

    system_prompt = """You are an AI meeting intelligence system. Extract all commitments, decisions, action items, and deadlines from this meeting transcript.

Output a valid JSON array of objects with EXACTLY these fields:
- "text": A concise statement describing the commitment or decision in English.
- "type": One of "decision", "action_item", "deadline".
- "timestamp": The exact timestamp [MM:SS] from the transcript where this decision or commitment took place.
- "start": The estimated start time in seconds (float or int).
- "assignee": The name or role of the person committed (e.g. "Speaker", "Alex", "Team") or "Unassigned".
- "priority": "high", "medium", or "low".
- "deadline": Mentioned due date/timeline (e.g. "By Friday", "Next week") or "Not specified".
- "context": Brief transcript quotation surrounding this commitment.

Respond with ONLY the JSON. No conversational preamble."""

    user_prompt = f"""MEETING TRANSCRIPT WITH TIMESTAMPS:
{timestamped_transcript[:6000]}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": active_model,
                "format": "json",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "num_predict": 1024
                }
            },
            timeout=75
        )

        if response.status_code == 200:
            content = response.json().get("message", {}).get("content", "")
            # Clean possible markdown or think blocks
            content = re.sub(r"<think>[\s\S]*?</think>", "", content, flags=re.IGNORECASE)
            content = re.sub(r"^```json\s*", "", content.strip(), flags=re.MULTILINE)
            content = re.sub(r"\s*```$", "", content.strip(), flags=re.MULTILINE).strip()

            items = json.loads(content)
            # In case the model returned a dict wrapping the list e.g. {"commitments": [...]}
            if isinstance(items, dict):
                for val in items.values():
                    if isinstance(val, list):
                        items = val
                        break

            if isinstance(items, list) and len(items) > 0:
                result = []
                for item in items:
                    ts = item.get("timestamp", "00:00")
                    start_sec = item.get("start")
                    if start_sec is None:
                        matching = next((l for l in lines if l.get("timestamp") == ts), None)
                        start_sec = matching["start"] if matching else 0.0

                    result.append({
                        "id": f"com-{uuid.uuid4().hex[:8]}",
                        "text": item.get("text", "Meeting Item"),
                        "type": item.get("type", "action_item"),
                        "timestamp": ts,
                        "start": float(start_sec),
                        "assignee": item.get("assignee", "Unassigned"),
                        "priority": item.get("priority", "medium"),
                        "deadline": item.get("deadline", "Not specified"),
                        "context": item.get("context", ""),
                        "completed": False,
                        "notes": ""
                    })
                return result
    except Exception as e:
        print(f"Ollama extraction fallback notice: {e}")

    # Fallback if Ollama failed or returned invalid JSON
    return extract_commitments_fallback(lines, timestamped_transcript)


# ==========================================
# SYSTEM HEALTH & STATUS CHECK
# ==========================================

@app.route("/api/health", methods=["GET"])
def health_check():
    """
    Provides status on Whisper, Ollama, and available models.
    """
    ollama_online = False
    available_models = []

    try:
        resp = requests.get(OLLAMA_TAGS_URL, timeout=4.0)
        if resp.status_code == 200:
            ollama_online = True
            available_models = [m.get("name") for m in resp.json().get("models", []) if m.get("name")]
    except Exception:
        ollama_online = False

    active_model = resolve_ollama_model()

    return jsonify({
        "status": "healthy",
        "whisper_model": WHISPER_MODEL,
        "whisper_ready": whisper_model is not None,
        "ollama_online": ollama_online,
        "active_model": active_model,
        "available_models": available_models
    })


@app.route("/api/models", methods=["GET"])
def list_models():
    models = get_installed_ollama_models()
    active = resolve_ollama_model()
    return jsonify({
        "active": active,
        "models": models,
        "ollama_online": len(models) > 0
    })


# ==========================================
# TRANSCRIBE AUDIO WITH WHISPER
# ==========================================

@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({
            "error": "No audio file was uploaded."
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "error": "No file selected."
        }), 400

    temp_path = None

    try:
        print()
        print("================================")
        print("Starting Whisper transcription...")
        print("File:", file.filename)
        print("================================")
        print()

        extension = os.path.splitext(file.filename)[1]
        if not extension:
            extension = ".wav"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name

        duration_seconds = get_audio_duration(temp_path)
        duration_str = format_duration(duration_seconds)

        # Transcribe audio with Whisper
        result = whisper_model.transcribe(
            temp_path,
            fp16=False,
            verbose=False
        )

        transcript_text = (result.get("text") or "").strip()

        # Build detailed timestamped lines
        speaker_transcript, lines = build_transcript_lines(result)

        if not speaker_transcript and transcript_text:
            speaker_transcript = f"[00:00] Speaker: {transcript_text}"
            lines = [{
                "id": 1,
                "speaker": "Speaker",
                "text": transcript_text,
                "start": 0.0,
                "end": duration_seconds or 0.0,
                "timestamp": "00:00",
                "time_range": f"00:00 - {duration_str or '00:00'}"
            }]

        speaker_count = 1 if transcript_text else 0
        language = result.get("language")
        word_count = len(transcript_text.split()) if transcript_text else 0

        # Automatically extract commitments and decisions
        print("Extracting commitments & key decisions with timestamps...")
        commitments = extract_commitments_with_llm(lines, speaker_transcript)
        print(f"Extracted {len(commitments)} commitments.")

        return jsonify({
            "success": True,
            "transcript": speaker_transcript,
            "full_text": transcript_text,
            "word_count": word_count,
            "lines": lines,
            "commitments": commitments,
            "speakers": speaker_count,
            "duration": duration_str,
            "duration_seconds": duration_seconds or 0,
            "language": language
        })

    except Exception as e:
        print("WHISPER TRANSCRIPTION ERROR:", str(e))
        return jsonify({
            "error": "Transcription failed.",
            "details": str(e)
        }), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


# ==========================================
# DEDICATED COMMITMENT EXTRACTION ENDPOINT
# ==========================================

@app.route("/api/commitments", methods=["POST"])
def get_commitments():
    data = request.get_json(silent=True) or {}
    lines = data.get("lines") or []
    transcript = (data.get("transcript") or "").strip()

    if not lines and not transcript:
        return jsonify({"error": "No transcript or lines provided."}), 400

    commitments = extract_commitments_with_llm(lines, transcript)
    return jsonify({
        "success": True,
        "commitments": commitments
    })


# ==========================================
# ASK LOCAL AI (WITH STREAMING & HEURISTIC FALLBACK)
# ==========================================

SYSTEM_AI_PROMPT = """You are MeetMind, an intelligent AI meeting assistant powered by local AI.

Your role:
1. Provide accurate, insightful, and concise answers based on the meeting transcript.
2. Always answer in clear, professional English.
3. Whenever citing a fact, key decision, task, commitment, or speaker comment, ALWAYS reference the exact timestamp in brackets like [MM:SS] (e.g. [01:23]). This allows the user to click and listen to that exact audio moment.
4. Structure your response cleanly using bullet points, bold headings, and clear formatting.
5. If the user asks a conversational or greeting question (e.g. "hi", "who are you?", "how does this work?"), introduce yourself warmly in English, explain that you analyze meeting transcripts, extract decisions and action items, and sync directly with audio playback.
6. If the question cannot be answered from the meeting transcript, state politely that it was not mentioned in the recording, and summarize what was discussed if helpful.
"""


def build_chat_messages(question, transcript, lines, history=None):
    messages = [{"role": "system", "content": SYSTEM_AI_PROMPT}]

    if transcript:
        context_msg = f"CURRENT MEETING TRANSCRIPT WITH TIMESTAMPS:\n{transcript}\n\nPlease answer user questions based on this transcript."
        messages.append({"role": "user", "content": context_msg})
        messages.append({"role": "assistant", "content": "Understood. I have reviewed the full meeting transcript and timestamps and am ready to answer any questions."})
    elif lines:
        t_str = "\n".join(f"[{l.get('timestamp', '00:00')}] {l.get('speaker', 'Speaker')}: {l.get('text', '')}" for l in lines)
        context_msg = f"CURRENT MEETING TRANSCRIPT WITH TIMESTAMPS:\n{t_str}\n\nPlease answer user questions based on this transcript."
        messages.append({"role": "user", "content": context_msg})
        messages.append({"role": "assistant", "content": "Understood. I have reviewed the full meeting transcript and timestamps and am ready to answer any questions."})

    if history and isinstance(history, list):
        for h in history[-6:]:
            role = "user" if h.get("role") == "user" else "assistant"
            cnt = (h.get("content") or "").strip()
            if cnt:
                messages.append({"role": role, "content": cnt})

    messages.append({"role": "user", "content": question})
    return messages


@app.route("/api/ask", methods=["POST"])
def ask_ai():
    data = request.get_json(silent=True) or {}

    question = (data.get("question") or "").strip()
    transcript = (data.get("transcript") or "").strip()
    lines = data.get("lines") or []
    history = data.get("history") or []

    if not question:
        return jsonify({"error": "Question is required."}), 400

    active_model = resolve_ollama_model()
    messages = build_chat_messages(question, transcript, lines, history)

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": active_model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "num_predict": 1024
                }
            },
            timeout=120
        )

        if response.status_code == 200:
            result = response.json()
            answer = result.get("message", {}).get("content", "")
            answer = re.sub(r"<think>[\s\S]*?</think>", "", answer, flags=re.IGNORECASE).strip()
            if answer:
                return jsonify({
                    "answer": answer,
                    "model": active_model,
                    "success": True
                })

    except Exception as e:
        print(f"Ollama chat error: {e}")

    # Fallback heuristic if Ollama is unreachable
    if lines or transcript:
        q_lower = question.lower()
        if "decision" in q_lower or "agreed" in q_lower:
            decisions = [l for l in lines if DECISION_WORDS.search(l.get("text", ""))]
            if decisions:
                items = "\n".join(f"- **[{d['timestamp']}]**: {d['text']}" for d in decisions)
                return jsonify({"answer": f"Here are the key decisions identified in the meeting:\n\n{items}", "model": "heuristic-fallback"})
            return jsonify({"answer": "No explicit decisions were identified in the meeting transcript.", "model": "heuristic-fallback"})

        if "action" in q_lower or "commitment" in q_lower or "checklist" in q_lower:
            actions = [l for l in lines if ACTION_WORDS.search(l.get("text", ""))]
            if actions:
                items = "\n".join(f"- **[{a['timestamp']}]**: {a['text']}" for a in actions)
                return jsonify({"answer": f"Here are the action items and commitments:\n\n{items}", "model": "heuristic-fallback"})
            return jsonify({"answer": "No specific action items were found in the transcript.", "model": "heuristic-fallback"})

        if "deadline" in q_lower or "date" in q_lower or "timeline" in q_lower:
            deadlines = [l for l in lines if DEADLINE_PATTERN.search(l.get("text", ""))]
            if deadlines:
                items = "\n".join(f"- **[{d['timestamp']}]**: {d['text']}" for d in deadlines)
                return jsonify({"answer": f"Here are the deadlines and timelines mentioned:\n\n{items}", "model": "heuristic-fallback"})
            return jsonify({"answer": "No explicit deadlines were mentioned in the meeting.", "model": "heuristic-fallback"})

        first_lines = lines[:4]
        last_lines = lines[-2:] if len(lines) > 4 else []
        summary_pts = "\n".join(f"- [{l['timestamp']}] {l['text']}" for l in (first_lines + last_lines))
        return jsonify({
            "answer": f"**Meeting Overview:**\n\n{summary_pts}",
            "model": "heuristic-fallback"
        })

    return jsonify({
        "answer": "Hello! I am MeetMind AI. You can upload an audio recording or load a sample meeting, and I will transcribe it, extract action items, and answer any questions about the meeting with exact audio timestamps.",
        "model": "offline-assistant"
    })


@app.route("/api/ask/stream", methods=["POST"])
def ask_ai_stream():
    """
    Streams tokens in real-time using Server-Sent Events (SSE).
    """
    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()
    transcript = (data.get("transcript") or "").strip()
    lines = data.get("lines") or []
    history = data.get("history") or []

    if not question:
        return jsonify({"error": "Question is required."}), 400

    active_model = resolve_ollama_model()
    messages = build_chat_messages(question, transcript, lines, history)

    def generate():
        try:
            resp = requests.post(
                OLLAMA_URL,
                json={
                    "model": active_model,
                    "messages": messages,
                    "stream": True,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "num_predict": 1024
                    }
                },
                stream=True,
                timeout=120
            )

            for line in resp.iter_lines():
                if line:
                    chunk = json.loads(line)
                    delta = chunk.get("message", {}).get("content", "")
                    done = chunk.get("done", False)
                    yield f"data: {json.dumps({'content': delta, 'done': done, 'model': active_model})}\n\n"
                    if done:
                        break
        except Exception as e:
            err_json = json.dumps({"error": str(e), "done": True})
            yield f"data: {err_json}\n\n"

    return Response(generate(), mimetype="text/event-stream")


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
