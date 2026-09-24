(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const audioInput = $("audioFile");
  const dropZone = $("dropZone");
  const selectedBox = $("selectedFile");
  const transcribeBtn = $("transcribeBtn");
  const fileNameEl = $("fileName");
  const fileSizeEl = $("fileSize");
  const removeFileBtn = $("removeFile");

  // Mode tabs (Upload vs Record)
  const modeUploadTab = $("modeUploadTab");
  const modeRecordTab = $("modeRecordTab");
  const uploadModeContainer = $("uploadMode");
  const recordModeContainer = $("recordMode");

  // Live mic recorder
  const toggleRecordBtn = $("toggleRecordBtn");
  const pauseRecordBtn = $("pauseRecordBtn");
  const cancelRecordBtn = $("cancelRecordBtn");
  const recordTimerEl = $("recordTimer");
  const recordHintEl = $("recordHint");
  const recordVisualizer = $("recordVisualizer");

  // Navigation tabs & views
  const navItems = document.querySelectorAll(".nav-item");
  const viewPanels = {
    dashboard: $("viewDashboard"),
    studio: $("viewStudio"),
    tracker: $("viewTracker"),
    assistant: $("viewAssistant")
  };
  const navCommitmentCount = $("navCommitmentCount");

  // Global Audio Player
  const globalAudio = $("globalAudioPlayer");
  const playerBar = $("playerBar");
  const mainPlayBtn = $("mainPlayBtn");
  const playIcon = $("playIcon");
  const seekBackBtn = $("seekBackBtn");
  const seekFwdBtn = $("seekFwdBtn");
  const audioScrubber = $("audioScrubber");
  const currentTimeLabel = $("currentTimeLabel");
  const totalDurationLabel = $("totalDurationLabel");
  const playerTitle = $("playerTitle");
  const playerDuration = $("playerDuration");
  const speedButtons = document.querySelectorAll(".speed-btn");
  const muteBtn = $("muteBtn");
  const volumeSlider = $("volumeSlider");
  const audioPill = $("audioPill");
  const audioPillText = $("audioPillText");

  // Transcript view
  const transcriptBox = $("transcript");
  const transcriptSearch = $("transcriptSearch");
  const clearSearchBtn = $("clearSearchBtn");
  const searchCount = $("searchCount");
  const autoScrollToggle = $("autoScrollToggle");
  const copyTranscriptBtn = $("copyTranscript");
  const exportTxtBtn = $("exportTxtBtn");
  const exportSrtBtn = $("exportSrtBtn");
  const transcriptAskAiBtn = $("transcriptAskAiBtn");
  const tabDialogueView = $("tabDialogueView");
  const tabReadingView = $("tabReadingView");
  const tabRawView = $("tabRawView");
  const transcriptDialogueContainer = $("transcriptDialogueContainer");
  const transcriptReadingContainer = $("transcriptReadingContainer");
  const transcriptRawContainer = $("transcriptRawContainer");
  const fontDecBtn = $("fontDecBtn");
  const fontIncBtn = $("fontIncBtn");
  const fontSizeDisplay = $("fontSizeDisplay");
  const toggleExpandBtn = $("toggleExpandBtn");
  const expandIcon = $("expandIcon");
  const expandText = $("expandText");
  const workspaceContainer = $("workspaceContainer");
  const meetingTitleEl = $("meetingTitle");
  const meetingDurationEl = $("meetingDuration");
  const meetingWordsEl = $("meetingWords");
  const meetingSpeakersEl = $("meetingSpeakers");
  const meetingReadingTimeEl = $("meetingReadingTime");
  const topMeetingTitle = $("topMeetingTitle");
  const summaryBox = $("summaryText");
  const goToTrackerBtn = $("goToTrackerBtn");

  // Dashboard active meeting banner
  const dashboardMeetingBanner = $("dashboardMeetingBanner");
  const dashMeetingTitle = $("dashMeetingTitle");
  const dashMeetingStats = $("dashMeetingStats");
  const dashViewTranscriptBtn = $("dashViewTranscriptBtn");
  const dashViewTrackerBtn = $("dashViewTrackerBtn");
  const dashAskAiBtn = $("dashAskAiBtn");

  // Commitment Tracker
  const commitmentsList = $("commitmentsList");
  const totalCommitmentsCount = $("totalCommitmentsCount");
  const completedCommitmentsCount = $("completedCommitmentsCount");
  const pendingCommitmentsCount = $("pendingCommitmentsCount");
  const progressPercentage = $("progressPercentage");
  const progressBarFill = $("progressBarFill");
  const filterTabs = document.querySelectorAll(".filter-tab");
  const countAll = $("countAll");
  const countActive = $("countActive");
  const countCompleted = $("countCompleted");
  const countHigh = $("countHigh");
  const assigneeFilterSelect = $("assigneeFilterSelect");
  const trackerSearchInput = $("trackerSearchInput");
  const addCommitmentBtn = $("addCommitmentBtn");
  const copyChecklistBtn = $("copyChecklistBtn");
  const exportJsonBtn = $("exportJsonBtn");

  // Commitment Modal
  const commitmentModal = $("commitmentModal");
  const commitmentForm = $("commitmentForm");
  const modalTitle = $("modalTitle");
  const modalItemText = $("modalItemText");
  const modalItemType = $("modalItemType");
  const modalItemPriority = $("modalItemPriority");
  const modalItemAssignee = $("modalItemAssignee");
  const modalItemDeadline = $("modalItemDeadline");
  const modalItemTimestamp = $("modalItemTimestamp");
  const closeModalBtn = $("closeModalBtn");
  const cancelModalBtn = $("cancelModalBtn");

  // AI Assistant Chat
  const questionInput = $("questionInput");
  const askBtn = $("askBtn");
  const chatArea = $("chatArea");
  const clearChatBtn = $("clearChatBtn");
  const quickButtons = document.querySelectorAll(".quick-buttons button");
  const assistantModelName = $("assistantModelName");
  const welcomeModelName = $("welcomeModelName");
  const footerModelName = $("footerModelName");

  // System status & Sample data
  const statusDot = $("statusDot");
  const statusModel = $("statusModel");
  const statusSub = $("statusSub");
  const connectionText = $("connectionText");
  const loadDemoBtn = $("loadDemoBtn");
  const newMeetingBtn = $("newMeetingBtn");
  const meetingsHistory = $("meetingsHistory");


  // ==========================================
  // APPLICATION STATE
  // ==========================================
  let currentFile = null;
  let audioObjectURL = null;
  let currentMeeting = {
    id: "default",
    title: "Untitled Meeting",
    duration: "—",
    durationSeconds: 0,
    speakers: 1,
    wordCount: 0,
    transcript: "",
    fullText: "",
    lines: [],
    commitments: []
  };

  let activeFilter = "all";
  let activeAssigneeFilter = "all";
  let activeSearchTerm = "";
  let editingCommitmentId = null;

  // MediaRecorder state
  let mediaRecorder = null;
  let recordedAudioChunks = [];
  let recordTimerInterval = null;
  let recordSeconds = 0;
  let audioCtx = null;
  let analyser = null;
  let visualizerAnimFrame = null;


  // ==========================================
  // STORAGE HELPERS (localStorage)
  // ==========================================
  const STORAGE_KEY_MEETINGS = "meetmind_meetings_v2";
  const STORAGE_KEY_CURRENT = "meetmind_current_v2";

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentMeeting));

      let all = [];
      try {
        all = JSON.parse(localStorage.getItem(STORAGE_KEY_MEETINGS)) || [];
      } catch { all = []; }

      const idx = all.findIndex(m => m.id === currentMeeting.id);
      if (idx >= 0) {
        all[idx] = currentMeeting;
      } else if (currentMeeting.lines.length > 0 || currentMeeting.commitments.length > 0) {
        all.unshift(currentMeeting);
      }
      localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(all.slice(0, 10)));
      renderHistory();
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.lines && parsed.lines.length > 0) {
          currentMeeting = parsed;
          renderAll();
          return true;
        }
      }
    } catch (e) {
      console.warn("Storage load failed:", e);
    }
    return false;
  }

  function renderHistory() {
    if (!meetingsHistory) return;
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY_MEETINGS)) || [];
      if (all.length === 0) {
        meetingsHistory.innerHTML = `<span style="font-size:11px;color:var(--text-dim);">No saved meetings</span>`;
        return;
      }
      meetingsHistory.innerHTML = all.map(m => `
        <div class="history-item ${m.id === currentMeeting.id ? 'active' : ''}" data-id="${m.id}">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;">${esc(m.title)}</span>
          <span style="font-size:9px;opacity:0.6;">${esc(m.duration || '')}</span>
        </div>
      `).join("");

      meetingsHistory.querySelectorAll(".history-item").forEach(item => {
        item.addEventListener("click", () => {
          const mId = item.getAttribute("data-id");
          const found = all.find(x => x.id === mId);
          if (found) {
            currentMeeting = found;
            renderAll();
            switchTab("studio");
          }
        });
      });
    } catch { }
  }


  // ==========================================
  // ESCAPING & FORMATTING
  // ==========================================
  const esc = (val) =>
    String(val ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[c]);

  const escapeRegex = (string) =>
    String(string || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  function showToast(message, duration = 2400) {
    const existing = document.querySelector(".copy-feedback-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "copy-feedback-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  const formatSeconds = (sec) => {
    if (isNaN(sec) || sec === null) return "00:00";
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const secs = s % 60;
    const h = Math.floor(m / 60);
    const mins = m % 60;
    if (h > 0) return `${h}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const parseTimestamp = (str) => {
    if (!str) return 0;
    const parts = str.split(":").map(Number);
    if (parts.length === 2) return (parts[0] * 60) + parts[1];
    if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    return 0;
  };

  const formatAiResponse = (text) => {
    let out = esc(text)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^#{1,3}\s+(.+)$/gm, "<strong>$1</strong>")
      .replace(/^[-•]\s+(.+)$/gm, "• $1")
      .replace(/\n/g, "<br>");

    // Convert any [MM:SS] timestamps in the text into clickable audio jump badges!
    out = out.replace(/\[(\d{1,2}:\d{2})\]/g, (match, ts) => {
      const sec = parseTimestamp(ts);
      return `<button type="button" class="timestamp-jump-btn" data-time="${sec}" style="padding:1px 6px;margin:0 2px;">⏱ ${ts}</button>`;
    });

    return out;
  };


  // ==========================================
  // TAB NAVIGATION
  // ==========================================
  function switchTab(tabId) {
    navItems.forEach(item => {
      const match = item.getAttribute("data-tab") === tabId;
      item.classList.toggle("active", match);
      item.setAttribute("aria-selected", match ? "true" : "false");
    });

    Object.keys(viewPanels).forEach(key => {
      if (viewPanels[key]) {
        viewPanels[key].classList.toggle("active", key === tabId);
      }
    });
  }

  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      if (tabId) switchTab(tabId);
    });
  });

  if (goToTrackerBtn) {
    goToTrackerBtn.addEventListener("click", () => switchTab("tracker"));
  }


  // ==========================================
  // AUDIO PLAYER ENGINE
  // ==========================================
  function loadAudioSource(source) {
    if (audioObjectURL) {
      URL.revokeObjectURL(audioObjectURL);
      audioObjectURL = null;
    }

    if (source instanceof Blob || source instanceof File) {
      audioObjectURL = URL.createObjectURL(source);
      globalAudio.src = audioObjectURL;
    } else if (typeof source === "string") {
      globalAudio.src = source;
    }

    globalAudio.load();
    playerBar.hidden = false;
    audioPill.hidden = false;
    audioPillText.textContent = "Audio Ready";
    playerTitle.textContent = currentMeeting.title || "Meeting Audio";
  }

  function seekTo(seconds, autoPlay = true) {
    if (!globalAudio.src) return;
    const targetSec = Math.max(0, Math.min(seconds, globalAudio.duration || 99999));
    globalAudio.currentTime = targetSec;
    if (autoPlay) {
      globalAudio.play().catch(() => { });
    }
  }

  // Play / Pause Toggle
  function togglePlay() {
    if (!globalAudio.src) return;
    if (globalAudio.paused) {
      globalAudio.play().catch(e => console.warn(e));
    } else {
      globalAudio.pause();
    }
  }

  mainPlayBtn.addEventListener("click", togglePlay);

  // Keyboard spacebar shortcut
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      togglePlay();
    }
  });

  globalAudio.addEventListener("play", () => {
    playIcon.textContent = "❚❚";
    mainPlayBtn.classList.add("playing");
  });

  globalAudio.addEventListener("pause", () => {
    playIcon.textContent = "▶";
    mainPlayBtn.classList.remove("playing");
  });

  // Timeupdate: Scrub bar & Transcript syncing
  globalAudio.addEventListener("timeupdate", () => {
    const cur = globalAudio.currentTime || 0;
    const dur = globalAudio.duration || currentMeeting.durationSeconds || 0;

    currentTimeLabel.textContent = formatSeconds(cur);
    if (dur > 0) {
      totalDurationLabel.textContent = formatSeconds(dur);
      playerDuration.textContent = `${formatSeconds(cur)} / ${formatSeconds(dur)}`;
      audioScrubber.value = (cur / dur) * 100;
    }

    // Highlight active transcript line
    syncActiveTranscriptLine(cur);
  });

  audioScrubber.addEventListener("input", () => {
    const dur = globalAudio.duration || currentMeeting.durationSeconds || 0;
    if (dur > 0) {
      const target = (audioScrubber.value / 100) * dur;
      globalAudio.currentTime = target;
      currentTimeLabel.textContent = formatSeconds(target);
    }
  });

  // Rewind & Forward 5s
  seekBackBtn.addEventListener("click", () => {
    globalAudio.currentTime = Math.max(0, globalAudio.currentTime - 5);
  });
  seekFwdBtn.addEventListener("click", () => {
    globalAudio.currentTime = Math.min(globalAudio.duration || 99999, globalAudio.currentTime + 5);
  });

  // Speed selector
  speedButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      speedButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const spd = parseFloat(btn.getAttribute("data-speed") || "1");
      globalAudio.playbackRate = spd;
    });
  });

  // Volume
  muteBtn.addEventListener("click", () => {
    globalAudio.muted = !globalAudio.muted;
    muteBtn.textContent = globalAudio.muted ? "🔇" : "🔊";
  });

  volumeSlider.addEventListener("input", () => {
    globalAudio.volume = parseFloat(volumeSlider.value);
    globalAudio.muted = false;
    muteBtn.textContent = globalAudio.volume === 0 ? "🔇" : "🔊";
  });

  function syncActiveTranscriptLine(currentTime) {
    if (!currentMeeting.lines || currentMeeting.lines.length === 0) return;

    const lineElements = transcriptBox.querySelectorAll(".transcript-line");
    const paraElements = transcriptBox.querySelectorAll(".reading-paragraph");
    let activeFound = false;

    currentMeeting.lines.forEach((line, idx) => {
      const lineEl = lineElements[idx];
      const paraEl = paraElements[idx];
      const isCurrent = currentTime >= line.start && currentTime < (line.end || (line.start + 5));

      if (lineEl) lineEl.classList.toggle("active", isCurrent);
      if (paraEl) paraEl.classList.toggle("active", isCurrent);

      if (isCurrent && !activeFound) {
        activeFound = true;
        if (autoScrollToggle && autoScrollToggle.checked) {
          const target = currentTranscriptMode === "reading" ? paraEl : lineEl;
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      }
    });

    if (!activeFound && currentTime === 0) {
      lineElements.forEach(l => l.classList.remove("active"));
      paraElements.forEach(p => p.classList.remove("active"));
    }
  }


  // ==========================================
  // IN-BROWSER LIVE RECORDING (MIC)
  // ==========================================
  modeUploadTab.addEventListener("click", () => {
    modeUploadTab.classList.add("active");
    modeRecordTab.classList.remove("active");
    uploadModeContainer.hidden = false;
    recordModeContainer.hidden = true;
  });

  modeRecordTab.addEventListener("click", () => {
    modeRecordTab.classList.add("active");
    modeUploadTab.classList.remove("active");
    uploadModeContainer.hidden = true;
    recordModeContainer.hidden = false;
  });

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      recordedAudioChunks = [];

      // Audio visualizer setup
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const srcNode = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        srcNode.connect(analyser);
        drawVisualizer();
      } catch (e) {
        console.warn("Visualizer unavailable:", e);
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedAudioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        clearInterval(recordTimerInterval);
        if (visualizerAnimFrame) cancelAnimationFrame(visualizerAnimFrame);
        stream.getTracks().forEach(t => t.stop());

        if (recordedAudioChunks.length > 0) {
          const blob = new Blob(recordedAudioChunks, { type: "audio/webm" });
          const file = new File([blob], `mic-recording-${Date.now()}.webm`, { type: "audio/webm" });
          handleSelectedFile(file);
          recordHintEl.textContent = "Recording ready! Click 'Transcribe & Extract Commitments'.";
        }
      };

      mediaRecorder.start(250);
      recordSeconds = 0;
      recordTimerEl.textContent = "00:00:00";
      recordTimerInterval = setInterval(() => {
        recordSeconds++;
        const h = Math.floor(recordSeconds / 3600);
        const m = Math.floor((recordSeconds % 3600) / 60);
        const s = recordSeconds % 60;
        recordTimerEl.textContent = `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      }, 1000);

      toggleRecordBtn.classList.add("recording");
      toggleRecordBtn.title = "Stop Recording";
      recordHintEl.textContent = "Recording live audio... Click button to finish.";
      pauseRecordBtn.hidden = false;
      cancelRecordBtn.hidden = false;

    } catch (err) {
      alert("Microphone access was denied or not available: " + err.message);
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      toggleRecordBtn.classList.remove("recording");
      toggleRecordBtn.title = "Start Recording";
      pauseRecordBtn.hidden = true;
      cancelRecordBtn.hidden = true;
    }
  }

  toggleRecordBtn.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  });

  pauseRecordBtn.addEventListener("click", () => {
    if (!mediaRecorder) return;
    if (mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      pauseRecordBtn.textContent = "Resume";
      recordHintEl.textContent = "Recording paused.";
    } else if (mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      pauseRecordBtn.textContent = "Pause";
      recordHintEl.textContent = "Recording live audio...";
    }
  });

  cancelRecordBtn.addEventListener("click", () => {
    if (mediaRecorder) {
      recordedAudioChunks = [];
      mediaRecorder.stop();
      clearInterval(recordTimerInterval);
      if (visualizerAnimFrame) cancelAnimationFrame(visualizerAnimFrame);
      recordTimerEl.textContent = "00:00:00";
      toggleRecordBtn.classList.remove("recording");
      pauseRecordBtn.hidden = true;
      cancelRecordBtn.hidden = true;
      recordHintEl.textContent = "Recording discarded.";
    }
  });

  function drawVisualizer() {
    if (!analyser || !recordVisualizer) return;
    const ctx = recordVisualizer.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      visualizerAnimFrame = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, recordVisualizer.width, recordVisualizer.height);
      const barWidth = (recordVisualizer.width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * recordVisualizer.height * 0.9;
        const grad = ctx.createLinearGradient(0, recordVisualizer.height, 0, 0);
        grad.addColorStop(0, "#38bdf8");
        grad.addColorStop(1, "#818cf8");

        ctx.fillStyle = grad;
        ctx.fillRect(x, recordVisualizer.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
    };
    render();
  }


  // ==========================================
  // FILE SELECTION & DRAG-AND-DROP
  // ==========================================
  function formatBytes(bytes) {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function handleSelectedFile(file) {
    if (!file) return;
    currentFile = file;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatBytes(file.size);

    selectedBox.hidden = false;
    dropZone.style.display = "none";
    transcribeBtn.disabled = false;

    // Immediately wire audio element
    loadAudioSource(file);

    // Update pipeline status
    $("pipelineAudioNote").textContent = file.name;
    $("pipelineStatus").textContent = "Audio Loaded";
  }

  function clearSelectedFile() {
    currentFile = null;
    audioInput.value = "";
    selectedBox.hidden = true;
    dropZone.style.display = "flex";
    transcribeBtn.disabled = true;
    $("pipelineAudioNote").textContent = "Awaiting audio source";
    $("pipelineStatus").textContent = "Ready";
  }

  dropZone.addEventListener("click", (e) => {
    if (e.target.closest("label") || e.target.closest("input")) return;
    audioInput.click();
  });

  audioInput.addEventListener("change", () => {
    if (audioInput.files[0]) handleSelectedFile(audioInput.files[0]);
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  });

  removeFileBtn.addEventListener("click", clearSelectedFile);


  // ==========================================
  // TRANSCRIBE & EXTRACT PIPELINE
  // ==========================================
  transcribeBtn.addEventListener("click", async () => {
    if (!currentFile) {
      alert("Please select or record a meeting audio file first.");
      return;
    }

    setPipelineStatus("Transcribing with Whisper", "processing");
    setButtonLoading(transcribeBtn, "Transcribing Audio & Generating Timestamps...");

    const formData = new FormData();
    formData.append("file", currentFile);

    try {
      // Step 2: Whisper Transcription
      $("stepTranscript").classList.add("processing");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.details || err.error || "Transcription failed.");
      }

      const data = await response.json();

      $("stepTranscript").classList.replace("processing", "completed");
      $("stepCommitments").classList.add("processing");

      // Update state
      currentMeeting = {
        id: `meeting-${Date.now()}`,
        title: currentFile.name.replace(/\.[^/.]+$/, ""),
        duration: data.duration || "00:00",
        durationSeconds: data.duration_seconds || 0,
        speakers: data.speakers || 1,
        wordCount: data.word_count || (data.transcript ? data.transcript.split(/\s+/).length : 0),
        transcript: data.transcript || "",
        fullText: data.full_text || "",
        lines: data.lines || [],
        commitments: data.commitments || []
      };

      $("stepCommitments").classList.replace("processing", "completed");
      $("stepReady").classList.add("completed");

      // Save and render all views
      saveToStorage();
      renderAll();

      setPipelineStatus("Meeting Ready", "completed");
      setButtonNormal(transcribeBtn, "Transcribe & Extract Commitments");

      // Automatically switch directly to Full Transcript view so the user can immediately inspect the whole transcribed meeting!
      switchTab("studio");
      showToast("✦ Transcription complete! Displaying full meeting transcript.");

    } catch (error) {
      $("stepTranscript").classList.remove("processing");
      $("stepCommitments").classList.remove("processing");
      setPipelineStatus("Error", "error");
      setButtonNormal(transcribeBtn, "Transcribe & Extract Commitments");
      alert("Error: " + error.message);
    }
  });

  function setPipelineStatus(text) {
    $("pipelineStatus").textContent = text;
  }

  function setButtonLoading(btn, text) {
    btn.disabled = true;
    btn.innerHTML = `<span class="button-spinner"></span> ${esc(text)}`;
  }

  function setButtonNormal(btn, text) {
    btn.disabled = false;
    btn.innerHTML = `<span>✦</span> ${esc(text)}`;
  }


  // ==========================================
  // TRANSCRIPT VIEW MODES & FONT SIZING
  // ==========================================
  let currentTranscriptMode = "dialogue"; // "dialogue" | "reading" | "raw"
  const FONT_CLASSES = ["font-size-sm", "font-size-md", "font-size-lg", "font-size-xl"];
  const FONT_LABELS = ["85%", "100%", "115%", "130%"];
  let currentFontIndex = 1; // default: font-size-md

  function updateFontSize() {
    if (!transcriptBox) return;
    FONT_CLASSES.forEach(cls => transcriptBox.classList.remove(cls));
    transcriptBox.classList.add(FONT_CLASSES[currentFontIndex]);
    if (fontSizeDisplay) fontSizeDisplay.textContent = FONT_LABELS[currentFontIndex];
    try { localStorage.setItem("meetmind_font_idx", currentFontIndex); } catch { }
  }

  if (fontDecBtn) {
    fontDecBtn.addEventListener("click", () => {
      if (currentFontIndex > 0) {
        currentFontIndex--;
        updateFontSize();
      }
    });
  }

  if (fontIncBtn) {
    fontIncBtn.addEventListener("click", () => {
      if (currentFontIndex < FONT_CLASSES.length - 1) {
        currentFontIndex++;
        updateFontSize();
      }
    });
  }

  function setTranscriptMode(mode) {
    currentTranscriptMode = mode;
    if (tabDialogueView) tabDialogueView.classList.toggle("active", mode === "dialogue");
    if (tabReadingView) tabReadingView.classList.toggle("active", mode === "reading");
    if (tabRawView) tabRawView.classList.toggle("active", mode === "raw");

    if (transcriptDialogueContainer) transcriptDialogueContainer.hidden = (mode !== "dialogue");
    if (transcriptReadingContainer) transcriptReadingContainer.hidden = (mode !== "reading");
    if (transcriptRawContainer) transcriptRawContainer.hidden = (mode !== "raw");

    renderTranscript();
  }

  if (tabDialogueView) tabDialogueView.addEventListener("click", () => setTranscriptMode("dialogue"));
  if (tabReadingView) tabReadingView.addEventListener("click", () => setTranscriptMode("reading"));
  if (tabRawView) tabRawView.addEventListener("click", () => setTranscriptMode("raw"));

  // Toggle Full Width Transcript
  if (toggleExpandBtn) {
    toggleExpandBtn.addEventListener("click", () => {
      if (!workspaceContainer) return;
      const isExpanded = workspaceContainer.classList.toggle("expanded");
      if (expandIcon) expandIcon.textContent = isExpanded ? "⤡" : "⤢";
      if (expandText) expandText.textContent = isExpanded ? "Split View" : "Expand";
    });
  }

  // Dashboard Banner Actions
  if (dashViewTranscriptBtn) {
    dashViewTranscriptBtn.addEventListener("click", () => switchTab("studio"));
  }
  if (dashViewTrackerBtn) {
    dashViewTrackerBtn.addEventListener("click", () => switchTab("tracker"));
  }
  if (dashAskAiBtn) {
    dashAskAiBtn.addEventListener("click", () => switchTab("assistant"));
  }

  // Ask AI shortcut from transcript view
  if (transcriptAskAiBtn) {
    transcriptAskAiBtn.addEventListener("click", () => {
      switchTab("assistant");
      if (questionInput) questionInput.focus();
    });
  }

  // Export TXT
  if (exportTxtBtn) {
    exportTxtBtn.addEventListener("click", () => {
      const text = currentMeeting.transcript || (currentMeeting.lines || []).map(l => `[${l.timestamp}] ${l.speaker}: ${l.text}`).join("\n");
      if (!text) {
        alert("No transcript available to export.");
        return;
      }
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(currentMeeting.title || "meeting").toLowerCase().replace(/\s+/g, "_")}_transcript.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast("Downloaded TXT transcript!");
    });
  }

  // Export SRT Subtitles
  function formatSrtTimestamp(seconds) {
    const s = Math.max(0, seconds || 0);
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const secs = Math.floor(s % 60);
    const millis = Math.floor((s % 1) * 1000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
  }

  if (exportSrtBtn) {
    exportSrtBtn.addEventListener("click", () => {
      const lines = currentMeeting.lines || [];
      if (lines.length === 0) {
        alert("No transcript lines to export as SRT.");
        return;
      }
      let srt = "";
      lines.forEach((l, idx) => {
        const start = formatSrtTimestamp(l.start);
        const end = formatSrtTimestamp(l.end || (l.start + 4));
        srt += `${idx + 1}\n${start} --> ${end}\n${l.speaker}: ${l.text}\n\n`;
      });
      const blob = new Blob([srt], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(currentMeeting.title || "meeting").toLowerCase().replace(/\s+/g, "_")}.srt`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast("Downloaded SRT subtitles!");
    });
  }


  // ==========================================
  // RENDER INTERACTIVE TRANSCRIPT (ALL 3 MODES)
  // ==========================================
  function renderTranscript() {
    if (!transcriptBox) return;

    const lines = currentMeeting.lines || [];
    if (lines.length === 0) {
      if (transcriptDialogueContainer) {
        transcriptDialogueContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">◫</div>
            <h4>No Transcript Loaded</h4>
            <p>Upload a meeting recording or load a sample meeting to view the complete transcript with timestamps.</p>
          </div>`;
      }
      if (transcriptReadingContainer) transcriptReadingContainer.innerHTML = "";
      if (transcriptRawContainer) transcriptRawContainer.innerHTML = "";
      return;
    }

    const q = (transcriptSearch ? transcriptSearch.value : "").trim().toLowerCase();

    // MODE 1: DIALOGUE VIEW
    if (currentTranscriptMode === "dialogue" && transcriptDialogueContainer) {
      transcriptDialogueContainer.innerHTML = `
        <div class="transcript-lines">
          ${lines.map((line, idx) => {
        let highlighted = esc(line.text);
        if (q) {
          const regex = new RegExp(`(${escapeRegex(q)})`, "gi");
          highlighted = highlighted.replace(regex, `<mark class="search-highlight">$1</mark>`);
        }
        return `
              <div class="transcript-line" id="line-${line.id || idx + 1}" data-start="${line.start}">
                <div class="transcript-meta-row">
                  <span class="speaker-badge">${esc(line.speaker || 'Speaker')}</span>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <button type="button" class="timestamp-badge timestamp-jump-btn" data-time="${line.start}" title="Jump audio to ${line.timestamp}">
                      ⏱ ${line.timestamp}
                    </button>
                    <button type="button" class="card-action-btn copy-line-btn" data-text="${esc(line.text)}" title="Copy speech line">⎘</button>
                  </div>
                </div>
                <div class="speaker-text">${highlighted}</div>
              </div>
            `;
      }).join("")}
        </div>
      `;

      transcriptDialogueContainer.querySelectorAll(".copy-line-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const text = btn.getAttribute("data-text");
          if (text) {
            await navigator.clipboard.writeText(text);
            showToast("Line copied to clipboard!");
          }
        });
      });

      transcriptDialogueContainer.querySelectorAll(".timestamp-jump-btn").forEach(badge => {
        badge.addEventListener("click", () => {
          const timeSec = parseFloat(badge.getAttribute("data-time") || "0");
          seekTo(timeSec, true);
        });
      });
    }

    // MODE 2: READING MODE (CONTINUOUS PROSE)
    else if (currentTranscriptMode === "reading" && transcriptReadingContainer) {
      const totalWords = currentMeeting.wordCount || lines.reduce((acc, l) => acc + (l.text ? l.text.split(/\s+/).length : 0), 0);
      const readingMin = Math.max(1, Math.ceil(totalWords / 180));

      transcriptReadingContainer.innerHTML = `
        <div class="transcript-reading-prose">
          <div class="reading-lead">
            <span>📖 Continuous Prose Transcript · ${lines.length} speech segments</span>
            <span>${totalWords.toLocaleString()} words · ~${readingMin} min read</span>
          </div>
          ${lines.map((line) => {
        let highlighted = esc(line.text);
        if (q) {
          const regex = new RegExp(`(${escapeRegex(q)})`, "gi");
          highlighted = highlighted.replace(regex, `<mark class="search-highlight">$1</mark>`);
        }
        return `
              <p class="reading-paragraph" data-start="${line.start}">
                <button type="button" class="inline-timestamp-btn timestamp-jump-btn" data-time="${line.start}" title="Click to listen at ${line.timestamp}">
                  ⏱ ${line.timestamp}
                </button>
                <strong class="reading-speaker-tag">${esc(line.speaker || 'Speaker')}:</strong>
                ${highlighted}
              </p>
            `;
      }).join("")}
        </div>
      `;

      transcriptReadingContainer.querySelectorAll(".timestamp-jump-btn").forEach(badge => {
        badge.addEventListener("click", () => {
          const timeSec = parseFloat(badge.getAttribute("data-time") || "0");
          seekTo(timeSec, true);
        });
      });
    }

    // MODE 3: RAW TEXT
    else if (currentTranscriptMode === "raw" && transcriptRawContainer) {
      const rawText = currentMeeting.transcript || lines.map(l => `[${l.timestamp}] ${l.speaker}: ${l.text}`).join("\n");
      transcriptRawContainer.innerHTML = `
        <div class="raw-text-container">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:11px;color:var(--text-dim);">Plain verbatim transcript text without formatting</span>
            <button type="button" class="secondary-btn" id="copyRawBtn">📋 Copy Plain Text</button>
          </div>
          <textarea class="transcript-raw-textarea" readonly spellcheck="false">${esc(rawText)}</textarea>
        </div>
      `;

      const copyRawBtn = transcriptRawContainer.querySelector("#copyRawBtn");
      if (copyRawBtn) {
        copyRawBtn.addEventListener("click", async () => {
          await navigator.clipboard.writeText(rawText);
          showToast("Plain transcript copied!");
        });
      }
    }
  }

  // Transcript live search
  if (transcriptSearch) {
    transcriptSearch.addEventListener("input", () => {
      const q = transcriptSearch.value.trim().toLowerCase();
      if (clearSearchBtn) clearSearchBtn.hidden = !q;

      const lines = currentMeeting.lines || [];
      let matches = 0;
      if (q) {
        lines.forEach(l => {
          if ((l.text || "").toLowerCase().includes(q)) matches++;
        });
      }

      if (searchCount) {
        searchCount.textContent = q ? `${matches} match${matches === 1 ? '' : 'es'}` : '';
      }

      renderTranscript();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      transcriptSearch.value = "";
      clearSearchBtn.hidden = true;
      if (searchCount) searchCount.textContent = "";
      renderTranscript();
      transcriptSearch.focus();
    });
  }

  // Copy transcript
  if (copyTranscriptBtn) {
    copyTranscriptBtn.addEventListener("click", async () => {
      const text = currentMeeting.transcript || (currentMeeting.lines || []).map(l => `[${l.timestamp}] ${l.speaker}: ${l.text}`).join("\n");
      if (!text) {
        alert("No transcript available to copy.");
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        showToast("✓ Full transcript copied to clipboard!");
      } catch {
        alert("Clipboard copy failed.");
      }
    });
  }


  // ==========================================
  // COMMITMENT TRACKER (STAR FEATURE)
  // ==========================================
  function renderCommitments() {
    if (!commitmentsList) return;

    const items = currentMeeting.commitments || [];

    // Compute metrics
    const total = items.length;
    const completed = items.filter(c => c.completed).length;
    const pending = total - completed;
    const high = items.filter(c => c.priority === "high").length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update UI Counters & Progress Bar
    totalCommitmentsCount.textContent = total;
    completedCommitmentsCount.textContent = completed;
    pendingCommitmentsCount.textContent = pending;
    progressPercentage.textContent = `${pct}%`;
    progressBarFill.style.width = `${pct}%`;

    countAll.textContent = total;
    countActive.textContent = pending;
    countCompleted.textContent = completed;
    countHigh.textContent = high;

    if (navCommitmentCount) {
      navCommitmentCount.textContent = pending;
    }

    // Populate Assignees Filter dropdown
    updateAssigneesDropdown(items);

    // Filter items according to activeFilter, activeAssigneeFilter, and activeSearchTerm
    let filtered = items.filter(item => {
      if (activeFilter === "active" && item.completed) return false;
      if (activeFilter === "completed" && !item.completed) return false;
      if (activeFilter === "high" && item.priority !== "high") return false;

      if (activeAssigneeFilter !== "all") {
        if ((item.assignee || "Unassigned").toLowerCase() !== activeAssigneeFilter.toLowerCase()) {
          return false;
        }
      }

      if (activeSearchTerm) {
        const q = activeSearchTerm.toLowerCase();
        const text = (item.text || "").toLowerCase();
        const assignee = (item.assignee || "").toLowerCase();
        const deadline = (item.deadline || "").toLowerCase();
        if (!text.includes(q) && !assignee.includes(q) && !deadline.includes(q)) {
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      commitmentsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">☑</div>
          <h4>${total === 0 ? "No Commitments Extracted" : "No Items Match Filter"}</h4>
          <p>${total === 0 ? "Upload audio or click '+ Add Custom Item' above to start tracking commitments." : "Try adjusting your filter or search query."}</p>
        </div>`;
      return;
    }

    // Render cards
    commitmentsList.innerHTML = filtered.map(item => {
      const typeLabel = item.type === "decision" ? "Key Decision" : (item.type === "deadline" ? "Deadline" : "Action Item");
      const isClaimed = item.assignee && item.assignee !== "Unassigned";

      return `
        <div class="commitment-card ${item.completed ? 'completed' : ''}" id="card-${item.id}" data-id="${item.id}">
          <!-- Checkbox -->
          <div class="custom-checkbox ${item.completed ? 'checked' : ''}" data-action="toggle-check" title="Toggle status">
            <span class="check-icon">✓</span>
          </div>

          <!-- Main Info -->
          <div class="commitment-main">
            <div class="commitment-top">
              <!-- Clickable Audio Timestamp Jump Button -->
              <button type="button" class="timestamp-jump-btn" data-time="${item.start || parseTimestamp(item.timestamp)}" title="Click to hear audio at ${item.timestamp}">
                <span>▶</span> ⏱ ${item.timestamp || '00:00'}
              </button>

              <span class="type-badge ${item.type || 'action_item'}">${typeLabel}</span>
              <span class="priority-badge ${item.priority || 'medium'}">${(item.priority || 'medium').toUpperCase()}</span>
            </div>

            <div class="commitment-text" data-action="edit-text">${esc(item.text)}</div>

            <!-- Details Row -->
            <div class="commitment-details-row">
              <!-- Assignee chip & claim button -->
              <div class="assignee-chip ${isClaimed ? 'claimed' : ''}">
                <span>👤</span>
                <span>${esc(item.assignee || 'Unassigned')}</span>
                ${!isClaimed ? `<button type="button" class="claim-btn" data-action="claim" title="Claim this commitment for yourself">Claim</button>` : ''}
              </div>

              ${item.deadline && item.deadline !== 'Not specified' ? `
                <div class="deadline-chip">
                  <span>📅</span>
                  <span>Due: ${esc(item.deadline)}</span>
                </div>` : ''}

              ${item.context ? `
                <button type="button" class="context-toggle" data-action="toggle-context">View speech context</button>
              ` : ''}
            </div>

            ${item.context ? `
              <div class="context-quote-box" style="display:none;">
                "${esc(item.context)}"
              </div>
            ` : ''}
          </div>

          <!-- Actions -->
          <div class="commitment-actions">
            <button type="button" class="card-action-btn" data-action="edit" title="Edit Commitment">✎</button>
            <button type="button" class="card-action-btn" data-action="delete" title="Delete Commitment">×</button>
          </div>
        </div>
      `;
    }).join("");

    // Wire checklist interactions
    bindCommitmentEvents();
  }

  function updateAssigneesDropdown(items) {
    if (!assigneeFilterSelect) return;
    const currentVal = assigneeFilterSelect.value;
    const unique = Array.from(new Set(items.map(i => i.assignee || "Unassigned"))).filter(Boolean);

    let html = `<option value="all">All Assignees</option>`;
    unique.forEach(name => {
      html += `<option value="${esc(name)}" ${currentVal === name ? 'selected' : ''}>${esc(name)}</option>`;
    });
    assigneeFilterSelect.innerHTML = html;
  }

  function bindCommitmentEvents() {
    commitmentsList.querySelectorAll(".commitment-card").forEach(card => {
      const id = card.getAttribute("data-id");
      const item = currentMeeting.commitments.find(c => c.id === id);
      if (!item) return;

      // Checkbox Toggle
      const checkBtn = card.querySelector('[data-action="toggle-check"]');
      if (checkBtn) {
        checkBtn.addEventListener("click", () => {
          item.completed = !item.completed;
          saveToStorage();
          renderCommitments();
        });
      }

      // Audio Timestamp Jump
      const jumpBtn = card.querySelector(".timestamp-jump-btn");
      if (jumpBtn) {
        jumpBtn.addEventListener("click", () => {
          const sec = parseFloat(jumpBtn.getAttribute("data-time") || "0");
          seekTo(sec, true);
        });
      }

      // Claim commitment
      const claimBtn = card.querySelector('[data-action="claim"]');
      if (claimBtn) {
        claimBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const name = prompt("Enter your name to claim this commitment:", "Prathamesh");
          if (name && name.trim()) {
            item.assignee = name.trim();
            saveToStorage();
            renderCommitments();
          }
        });
      }

      // Context toggle
      const contextToggle = card.querySelector('[data-action="toggle-context"]');
      const quoteBox = card.querySelector(".context-quote-box");
      if (contextToggle && quoteBox) {
        contextToggle.addEventListener("click", () => {
          const isHidden = quoteBox.style.display === "none";
          quoteBox.style.display = isHidden ? "block" : "none";
          contextToggle.textContent = isHidden ? "Hide speech context" : "View speech context";
        });
      }

      // Edit action
      const editBtn = card.querySelector('[data-action="edit"]');
      const textBtn = card.querySelector('[data-action="edit-text"]');
      const openEdit = () => openCommitmentModal(item);
      if (editBtn) editBtn.addEventListener("click", openEdit);
      if (textBtn) textBtn.addEventListener("dblclick", openEdit);

      // Delete action
      const deleteBtn = card.querySelector('[data-action="delete"]');
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          if (confirm(`Delete this commitment: "${item.text}"?`)) {
            currentMeeting.commitments = currentMeeting.commitments.filter(c => c.id !== id);
            saveToStorage();
            renderCommitments();
          }
        });
      }
    });
  }

  // Filter Tabs
  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = tab.getAttribute("data-filter") || "all";
      renderCommitments();
    });
  });

  // Assignee Dropdown Filter
  if (assigneeFilterSelect) {
    assigneeFilterSelect.addEventListener("change", () => {
      activeAssigneeFilter = assigneeFilterSelect.value;
      renderCommitments();
    });
  }

  // Search input
  if (trackerSearchInput) {
    trackerSearchInput.addEventListener("input", () => {
      activeSearchTerm = trackerSearchInput.value.trim();
      renderCommitments();
    });
  }

  // Copy Markdown Checklist
  if (copyChecklistBtn) {
    copyChecklistBtn.addEventListener("click", async () => {
      const items = currentMeeting.commitments || [];
      if (items.length === 0) {
        alert("No commitments to copy.");
        return;
      }

      let md = `# Meeting Commitments & Action Items\n**Meeting:** ${currentMeeting.title} | **Date:** ${new Date().toLocaleDateString()}\n\n`;
      items.forEach(c => {
        const check = c.completed ? "[x]" : "[ ]";
        const typeTag = `[${(c.type || 'action').toUpperCase()}]`;
        const timeTag = c.timestamp ? `(${c.timestamp})` : '';
        const assignee = c.assignee ? ` | Assignee: ${c.assignee}` : '';
        const deadline = (c.deadline && c.deadline !== 'Not specified') ? ` | Due: ${c.deadline}` : '';
        md += `- ${check} ${timeTag} ${typeTag} ${c.text}${assignee}${deadline}\n`;
      });

      try {
        await navigator.clipboard.writeText(md);
        const prev = copyChecklistBtn.innerHTML;
        copyChecklistBtn.innerHTML = `<span>✓</span> Copied Markdown!`;
        setTimeout(() => copyChecklistBtn.innerHTML = prev, 1800);
      } catch {
        alert("Clipboard write failed.");
      }
    });
  }

  // Export JSON
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", () => {
      const jsonStr = JSON.stringify(currentMeeting.commitments, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentMeeting.title.toLowerCase().replace(/\s+/g, '-')}-commitments.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }


  // ==========================================
  // COMMITMENT MODAL (ADD / EDIT)
  // ==========================================
  function openCommitmentModal(item = null) {
    editingCommitmentId = item ? item.id : null;
    modalTitle.textContent = item ? "Edit Commitment" : "Add New Commitment";

    modalItemText.value = item ? item.text : "";
    modalItemType.value = item ? (item.type || "action_item") : "action_item";
    modalItemPriority.value = item ? (item.priority || "medium") : "medium";
    modalItemAssignee.value = item ? (item.assignee || "") : "";
    modalItemDeadline.value = item ? (item.deadline !== "Not specified" ? item.deadline : "") : "";

    if (item && item.timestamp) {
      modalItemTimestamp.value = item.timestamp;
    } else {
      // Default to current audio player time!
      const curSec = globalAudio.currentTime || 0;
      modalItemTimestamp.value = formatSeconds(curSec);
    }

    commitmentModal.showModal();
  }

  if (addCommitmentBtn) {
    addCommitmentBtn.addEventListener("click", () => openCommitmentModal(null));
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => commitmentModal.close());
  }
  if (cancelModalBtn) {
    cancelModalBtn.addEventListener("click", () => commitmentModal.close());
  }

  commitmentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = modalItemText.value.trim();
    if (!text) return;

    const ts = modalItemTimestamp.value.trim() || "00:00";
    const startSec = parseTimestamp(ts);

    if (editingCommitmentId) {
      const idx = currentMeeting.commitments.findIndex(c => c.id === editingCommitmentId);
      if (idx >= 0) {
        currentMeeting.commitments[idx] = {
          ...currentMeeting.commitments[idx],
          text,
          type: modalItemType.value,
          priority: modalItemPriority.value,
          assignee: modalItemAssignee.value.trim() || "Unassigned",
          deadline: modalItemDeadline.value.trim() || "Not specified",
          timestamp: ts,
          start: startSec
        };
      }
    } else {
      const newItem = {
        id: `com-${Date.now().toString(16)}`,
        text,
        type: modalItemType.value,
        priority: modalItemPriority.value,
        assignee: modalItemAssignee.value.trim() || "Unassigned",
        deadline: modalItemDeadline.value.trim() || "Not specified",
        timestamp: ts,
        start: startSec,
        completed: false,
        context: ""
      };
      currentMeeting.commitments.unshift(newItem);
    }

    saveToStorage();
    renderCommitments();
    commitmentModal.close();
  });


  // ==========================================
  // AI ASSISTANT CHAT
  // ==========================================
  function appendChatMessage(kind, content) {
    const msgEl = document.createElement("div");
    msgEl.className = `chat-message ${kind}-message`;

    if (kind === "ai") {
      msgEl.innerHTML = `
        <div class="ai-avatar">✦</div>
        <div class="message-bubble">${formatAiResponse(content)}</div>`;
    } else {
      msgEl.innerHTML = `
        <div class="message-bubble">${esc(content)}</div>`;
    }

    chatArea.appendChild(msgEl);
    chatArea.scrollTop = chatArea.scrollHeight;

    // Bind any timestamp buttons in AI answer
    msgEl.querySelectorAll(".timestamp-jump-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const sec = parseFloat(btn.getAttribute("data-time") || "0");
        seekTo(sec, true);
      });
    });

    return msgEl;
  }

  async function askQuestion(questionText) {
    const q = (questionText || questionInput.value).trim();
    if (!q) return;

    if (!currentMeeting.transcript && currentMeeting.lines.length === 0) {
      appendChatMessage("ai", "Please upload or load a meeting recording first so I can analyze it.");
      return;
    }

    appendChatMessage("user", q);
    questionInput.value = "";
    askBtn.disabled = true;

    const loadingMsg = appendChatMessage("ai", "Analyzing meeting transcript and timestamps…");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          transcript: currentMeeting.transcript,
          lines: currentMeeting.lines
        })
      });

      const data = await response.json();
      const bubble = loadingMsg.querySelector(".message-bubble");
      bubble.innerHTML = formatAiResponse(data.answer || "No response received.");

      // Re-bind timestamps in newly formatted text
      bubble.querySelectorAll(".timestamp-jump-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const sec = parseFloat(btn.getAttribute("data-time") || "0");
          seekTo(sec, true);
        });
      });

    } catch (err) {
      loadingMsg.querySelector(".message-bubble").innerHTML = `<strong>Error:</strong> ${esc(err.message)}`;
    } finally {
      askBtn.disabled = false;
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }

  askBtn.addEventListener("click", () => askQuestion());
  questionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      askQuestion();
    }
  });

  quickButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      askQuestion(btn.textContent.trim());
    });
  });

  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", () => {
      chatArea.innerHTML = `
        <div class="welcome-message">
          <div class="ai-avatar">✦</div>
          <div>
            <strong>Ask me anything about your meeting.</strong>
            <p>I reference exact timestamps [MM:SS] so you can verify the conversation in the audio recording.</p>
          </div>
        </div>`;
    });
  }


  // ==========================================
  // RENDER ALL VIEWS
  // ==========================================
  function renderAll() {
    meetingTitleEl.textContent = currentMeeting.title || "Meeting Recording";
    topMeetingTitle.textContent = currentMeeting.title || "Meeting Intelligence Hub";
    meetingDurationEl.textContent = currentMeeting.duration || "—";
    meetingSpeakersEl.textContent = `${currentMeeting.speakers || 1} speaker`;

    playerTitle.textContent = currentMeeting.title || "Meeting Audio";
    playerDuration.textContent = `00:00 / ${currentMeeting.duration || '00:00'}`;
    totalDurationLabel.textContent = currentMeeting.duration || "00:00";

    // Summary Digest
    if (summaryBox) {
      if (currentMeeting.commitments && currentMeeting.commitments.length > 0) {
        const decisions = currentMeeting.commitments.filter(c => c.type === "decision");
        const actions = currentMeeting.commitments.filter(c => c.type === "action_item");
        summaryBox.innerHTML = `
          <p><strong>${decisions.length} Key Decision${decisions.length === 1 ? '' : 's'}</strong> and <strong>${actions.length} Action Item${actions.length === 1 ? '' : 's'}</strong> identified from this meeting.</p>
          <ul style="margin:8px 0 0 16px;padding:0;">
            ${currentMeeting.commitments.slice(0, 3).map(c => `<li><span style="color:var(--cyan-accent);font-family:var(--font-mono);">[${c.timestamp}]</span> ${esc(c.text)}</li>`).join("")}
          </ul>`;
      } else {
        summaryBox.innerHTML = `<p>${esc(currentMeeting.transcript.slice(0, 240))}...</p>`;
      }
    }

    renderTranscript();
    renderCommitments();
    renderHistory();
  }


  // ==========================================
  // SAMPLE / DEMO MEETING GENERATOR
  // (Instant testing of timestamps & commitments)
  // ==========================================
  const SAMPLE_MEETING = {
    id: "sample-kickoff",
    title: "Q3 Engineering & Product Roadmap Sync",
    duration: "02:45",
    durationSeconds: 165,
    speakers: 3,
    transcript: `[00:05] Speaker: Welcome team to our Q3 engineering kickoff. Let's align on core priorities.
[00:18] Speaker: First, we decided to adopt PostgreSQL with pgvector for our semantic memory store.
[00:36] Speaker: Alex will create the migration schema and docker compose setup by Thursday.
[00:54] Speaker: Prathamesh will finalize the API authentication endpoints and commitment tracker by Friday 5 PM.
[01:15] Speaker: Sarah agreed to conduct the end-to-end security audit and report findings next Monday.
[01:38] Speaker: The team agreed that Whisper Base will be our default speech engine for local privacy.
[02:02] Speaker: We have a critical deadline for beta launch on October 1st.
[02:25] Speaker: Great session everyone, let's execute on these commitments.`,
    lines: [
      { id: 1, speaker: "Speaker", text: "Welcome team to our Q3 engineering kickoff. Let's align on core priorities.", start: 5.0, end: 16.0, timestamp: "00:05", time_range: "00:05 - 00:16" },
      { id: 2, speaker: "Speaker", text: "First, we decided to adopt PostgreSQL with pgvector for our semantic memory store.", start: 18.0, end: 32.0, timestamp: "00:18", time_range: "00:18 - 00:32" },
      { id: 3, speaker: "Speaker", text: "Alex will create the migration schema and docker compose setup by Thursday.", start: 36.0, end: 50.0, timestamp: "00:36", time_range: "00:36 - 00:50" },
      { id: 4, speaker: "Speaker", text: "Prathamesh will finalize the API authentication endpoints and commitment tracker by Friday 5 PM.", start: 54.0, end: 72.0, timestamp: "00:54", time_range: "00:54 - 01:12" },
      { id: 5, speaker: "Speaker", text: "Sarah agreed to conduct the end-to-end security audit and report findings next Monday.", start: 75.0, end: 92.0, timestamp: "01:15", time_range: "01:15 - 01:32" },
      { id: 6, speaker: "Speaker", text: "The team agreed that Whisper Base will be our default speech engine for local privacy.", start: 98.0, end: 118.0, timestamp: "01:38", time_range: "01:38 - 01:58" },
      { id: 7, speaker: "Speaker", text: "We have a critical deadline for beta launch on October 1st.", start: 122.0, end: 140.0, timestamp: "02:02", time_range: "02:02 - 02:20" },
      { id: 8, speaker: "Speaker", text: "Great session everyone, let's execute on these commitments.", start: 145.0, end: 165.0, timestamp: "02:25", time_range: "02:25 - 02:45" }
    ],
    commitments: [
      {
        id: "com-sample-1",
        text: "Adopt PostgreSQL with pgvector for semantic memory store",
        type: "decision",
        timestamp: "00:18",
        start: 18.0,
        assignee: "Team",
        priority: "high",
        deadline: "Not specified",
        context: "First, we decided to adopt PostgreSQL with pgvector for our semantic memory store.",
        completed: true,
        notes: ""
      },
      {
        id: "com-sample-2",
        text: "Create migration schema and docker compose setup",
        type: "action_item",
        timestamp: "00:36",
        start: 36.0,
        assignee: "Alex",
        priority: "medium",
        deadline: "Thursday",
        context: "Alex will create the migration schema and docker compose setup by Thursday.",
        completed: false,
        notes: ""
      },
      {
        id: "com-sample-3",
        text: "Finalize API authentication endpoints and commitment tracker",
        type: "action_item",
        timestamp: "00:54",
        start: 54.0,
        assignee: "Prathamesh",
        priority: "high",
        deadline: "Friday 5 PM",
        context: "Prathamesh will finalize the API authentication endpoints and commitment tracker by Friday 5 PM.",
        completed: false,
        notes: ""
      },
      {
        id: "com-sample-4",
        text: "Conduct end-to-end security audit and report findings",
        type: "action_item",
        timestamp: "01:15",
        start: 75.0,
        assignee: "Sarah",
        priority: "medium",
        deadline: "Next Monday",
        context: "Sarah agreed to conduct the end-to-end security audit and report findings next Monday.",
        completed: false,
        notes: ""
      },
      {
        id: "com-sample-5",
        text: "Beta launch release milestone",
        type: "deadline",
        timestamp: "02:02",
        start: 122.0,
        assignee: "Team",
        priority: "high",
        deadline: "October 1st",
        context: "We have a critical deadline for beta launch on October 1st.",
        completed: false,
        notes: ""
      }
    ]
  };

  function generateSyntheticAudio(durationSec = 165) {
    // Generate a pleasant ambient beep/chime tone buffer so audio playback works immediately!
    const sampleRate = 44100;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = ctx.createBuffer(1, sampleRate * Math.min(durationSec, 30), sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Soft melodic ambient chord
      data[i] = Math.sin(2 * Math.PI * 220 * t) * 0.1 * Math.exp(-(t % 4))
        + Math.sin(2 * Math.PI * 330 * t) * 0.05 * Math.exp(-(t % 4));
    }

    // Convert AudioBuffer to WAV blob
    const wavBlob = bufferToWaveBlob(buffer, buffer.length);
    return wavBlob;
  }

  function bufferToWaveBlob(abuffer, len) {
    let numOfChan = abuffer.numberOfChannels,
      length = len * numOfChan * 2 + 44,
      out = new DataView(new ArrayBuffer(length)),
      channels = [], i, sample,
      offset = 0,
      pos = 0;

    function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16);
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4);

    for (i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while (offset < len) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }
    return new Blob([out.buffer], { type: "audio/wav" });
  }

  if (loadDemoBtn) {
    loadDemoBtn.addEventListener("click", () => {
      currentMeeting = JSON.parse(JSON.stringify(SAMPLE_MEETING));
      try {
        const demoBlob = generateSyntheticAudio(165);
        loadAudioSource(demoBlob);
      } catch (e) {
        console.warn("Synthetic audio generation skipped:", e);
      }

      saveToStorage();
      renderAll();
      switchTab("tracker");
    });
  }

  if (newMeetingBtn) {
    newMeetingBtn.addEventListener("click", () => {
      clearSelectedFile();
      switchTab("dashboard");
    });
  }


  // ==========================================
  // SYSTEM HEALTH CHECK INITIALIZATION
  // ==========================================
  async function checkSystemHealth() {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const health = await res.json();
        if (health.whisper_ready) {
          statusModel.textContent = `Whisper ${health.whisper_model.toUpperCase()} · Online`;
          connectionText.textContent = `Whisper Ready`;
        }
        if (health.ollama_online && health.available_models.length > 0) {
          statusSub.textContent = `Local AI: ${health.active_model}`;
        } else {
          statusSub.textContent = `Dual Heuristic/Offline AI Ready`;
        }
      }
    } catch {
      statusSub.textContent = `Offline Heuristics Ready`;
    }
  }


  // ==========================================
  // INITIALIZATION ON PAGE LOAD
  // ==========================================
  checkSystemHealth();
  const loaded = loadFromStorage();
  if (!loaded) {
    renderHistory();
  }

})();
