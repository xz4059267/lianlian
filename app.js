const iconMap = {
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M20 16.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5"/></svg>',
  board: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="2"/><path d="m21 15-4.5-4.5L7 20"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 11a8.1 8.1 0 0 0-15.5-2"/><path d="M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2"/><path d="M20 19v-4h-4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 2 9.5 9.5 2 13l7.5 3.5L13 24l3.5-7.5L24 13l-7.5-3.5L13 2Z" transform="scale(.86) translate(2 1)"/></svg>',
  crop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 13V6a2 2 0 1 1 4 0v5"/><path d="M12 11V5a2 2 0 1 1 4 0v7"/><path d="M16 12V8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-1a7 7 0 0 1-5.3-2.4L3 16.5a2 2 0 0 1 2.8-2.8L8 16"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/></svg>',
  'arrow-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m20 6-11 11-5-5"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m16 3 5 5L8 21H3v-5L16 3z"/><path d="m14 5 5 5"/></svg>',
  eraser: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m7 21-4-4L14 6a3 3 0 0 1 4 0l1 1a3 3 0 0 1 0 4L9 21H7z"/><path d="M14 14 9 9"/><path d="M12 21h8"/></svg>',
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/></svg>',
  'chevron-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m15 18-6-6 6-6"/></svg>',
  'chevron-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m9 18 6-6-6-6"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 14a8 8 0 1 1 16 0"/><path d="m12 14 4-4"/><path d="M4 18h16"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/><path d="M8 22h8"/></svg>',
  volume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M16 8a5 5 0 0 1 0 8"/><path d="M19 5a9 9 0 0 1 0 14"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg>'
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function injectIcons(root = document) {
  $$("[data-icon]", root).forEach((node) => {
    const name = node.dataset.icon;
    if (iconMap[name]) node.innerHTML = iconMap[name];
  });
}

injectIcons();

const views = {
  welcomeView: $("#welcomeView"),
  uploadView: $("#uploadView"),
  teachView: $("#teachView"),
  completeView: $("#completeView"),
  notebookView: $("#notebookView")
};

const dom = {
  navBtns: $$(".nav-btn"),
  enterUploadBtn: $("#enterUploadBtn"),
  welcomeNotebookBtn: $("#welcomeNotebookBtn"),
  notebookCount: $("#notebookCount"),
  dropZone: $("#dropZone"),
  imageInput: $("#imageInput"),
  previewPanel: $("#previewPanel"),
  sourcePreview: $("#sourcePreview"),
  segmentDebugCanvas: $("#segmentDebugCanvas"),
  manualStage: $("#manualStage"),
  selectionRect: $("#selectionRect"),
  confirmSelectionBtn: $("#confirmSelectionBtn"),
  cancelSelectionBtn: $("#cancelSelectionBtn"),
  uploadState: $("#uploadState"),
  segmentState: $("#segmentState"),
  autoSegmentBtn: $("#autoSegmentBtn"),
  manualModeBtn: $("#manualModeBtn"),
  manualActions: $("#manualActions"),
  cancelManualBtn: $("#cancelManualBtn"),
  processingBox: $("#processingBox"),
  questionList: $("#questionList"),
  selectedSummary: $("#selectedSummary"),
  selectedHint: $("#selectedHint"),
  startLectureBtn: $("#startLectureBtn"),
  replaceImageBtn: $("#replaceImageBtn"),
  clearImageBtn: $("#clearImageBtn"),
  lectureProgress: $("#lectureProgress"),
  backToUploadBtn: $("#backToUploadBtn"),
  finishQuestionBtn: $("#finishQuestionBtn"),
  boardImageLayer: $("#boardImageLayer"),
  boardQuestionImage: $("#boardQuestionImage"),
  blackboard: $("#blackboard"),
  canvas: $("#boardCanvas"),
  recognitionPill: $("#recognitionPill"),
  penTool: $("#penTool"),
  eraserTool: $("#eraserTool"),
  moveImageTool: $("#moveImageTool"),
  undoBtn: $("#undoBtn"),
  clearBoardBtn: $("#clearBoardBtn"),
  prevPageBtn: $("#prevPageBtn"),
  nextPageBtn: $("#nextPageBtn"),
  boardPageLabel: $("#boardPageLabel"),
  brushSize: $("#brushSize"),
  studentAvatar: $("#studentAvatar"),
  lianAvatar: $("#lianAvatar"),
  studentState: $("#studentState"),
  lianState: $("#lianState"),
  lianBubble: $("#lianBubble"),
  micBtn: $("#micBtn"),
  muteBtn: $("#muteBtn"),
  transcriptInput: $("#transcriptInput"),
  sendTranscriptBtn: $("#sendTranscriptBtn"),
  eventLog: $("#eventLog"),
  completeSummary: $("#completeSummary"),
  completionReview: $("#completionReview"),
  openNotebookBtn: $("#openNotebookBtn"),
  newUploadBtn: $("#newUploadBtn"),
  notebookList: $("#notebookList"),
  notebookDetail: $("#notebookDetail"),
  reviewReminder: $("#reviewReminder")
};

let ctx = dom.canvas.getContext("2d");

const GUIDE_STATES = {
  HEURISTIC: "heuristic_guidance",
  MICRO_HINT: "micro_hint",
  INTERACTIVE: "interactive_teaching",
  ARCHIVE: "archive_review"
};

const GUIDE_STATE_LABELS = {
  [GUIDE_STATES.HEURISTIC]: "启发引导",
  [GUIDE_STATES.MICRO_HINT]: "知识点微提示",
  [GUIDE_STATES.INTERACTIVE]: "分步讲解",
  [GUIDE_STATES.ARCHIVE]: "总结归档"
};

const SILENCE_CARE_MS = 60000;
const SILENCE_AFTER_CARE_MS = 60000;
const ERROR_SILENCE_MS = 60000;
const BOARD_RECOGNITION_DELAY_MS = 6500;
const THOUGHT_PAUSE_MS = 2600;
const SPEECH_QUIET_BEFORE_BOARD_MS = 2600;
const THOUGHT_REVIEW_COOLDOWN_MS = 18000;
const LISTENING_START_PROMPTS = [
  "你说，我在听。",
  "慢慢说，我听着呢。",
  "可以开始了，我在听。",
  "按你的思路讲就好，我听着。"
];
const BOARD_EXPAND_EDGE_PX = 96;
const BOARD_MAX_PAGES = 6;
const REPEATED_GUIDANCE_COOLDOWN_MS = 90000;
const ACTIVE_HELP_PATTERN = /为什么|不懂|求助|不会|不会做|没思路|不知道|卡住|讲一下|提示一下|怎么(?:来|来的|求|算|做|解|得到|列|消元|化简)|如何(?:求|算|做|解|得到|列|消元|化简)|该(?:怎么|如何)|能不能(?:提示|讲|告诉)|可以怎么/;

function isDirectHelpRequest(text) {
  const normalized = String(text || "").replace(/\s/g, "");
  if (!normalized) return false;
  if (ACTIVE_HELP_PATTERN.test(normalized)) return true;
  return /(?:吗|呢|怎么办|是什么|是多少|对不对|行不行)[？?]?$/.test(normalized);
}

const state = {
  source: null,
  segmentDebug: null,
  segmentTiming: null,
  questions: [],
  selectedIds: [],
  manualMode: false,
  selectionStart: null,
  selectionCurrent: null,
  manualSelection: null,
  manualAdjust: null,
  lecture: [],
  currentLectureIndex: 0,
  completedThisSession: [],
  boardPageIndex: 0,
  boardPages: {},
  boardInkByQuestion: {},
  boardHistories: {},
  boardImageStates: {},
  boardHeights: {},
  handwritingResults: {},
  transcriptsByQuestion: {},
  tool: "pen",
  brushColor: "#f8f2d8",
  brushSize: 5,
  drawing: false,
  strokeHasInk: false,
  imageDragging: false,
  lastPoint: null,
  recognitionTimer: null,
  handwritingRequestId: 0,
  latestHandwritingResult: null,
  handwritingDisabledUntil: 0,
  lastHandwritingServiceError: "",
  lastHandwritingPauseNoticeAt: 0,
  lastHandwritingGuideAt: 0,
  lastHandwritingIssueKey: "",
  lastHandwritingSuccessAt: 0,
  lastHandwritingSuccessKey: "",
  lastHandwritingUnclearAt: 0,
  lastHandwritingUnclearKey: "",
  speechRecognition: null,
  speechDraftText: "",
  speechDraftBase: "",
  speechNoResultTimer: null,
  transcriptCorrectionRequestId: 0,
  awaitingFinalAnswer: false,
  pendingFinalAnswerText: "",
  finalAnswerVerified: false,
  verifiedFinalAnswerText: "",
  boardCompletionVerified: false,
  completionCheckInProgress: false,
  finalAnswerRequestId: 0,
  answerKeyStatusByQuestion: {},
  currentQuestionCompleted: false,
  hasExplicitFinalAnswer: false,
  pendingLianQuestion: null,
  logItemsByKey: new Map(),
  lastSilentNoticeAtByKey: new Map(),
  promptVariantLastByKey: new Map(),
  spokenGuidanceByKey: new Map(),
  isListening: false,
  isMuted: false,
  lianVoice: null,
  micPermissionGranted: false,
  micPermissionPending: false,
  silenceTimer: null,
  issueSilenceTimer: null,
  guideState: GUIDE_STATES.HEURISTIC,
  lastGuideAt: 0,
  lastSpeechAt: 0,
  lastBoardWriteAt: 0,
  lastUserInputAt: 0,
  lastEncourageAt: 0,
  lastThoughtReviewAt: 0,
  pendingThoughtText: "",
  pendingThoughtSegments: 0,
  pendingThoughtHasConclusion: false,
  pendingThoughtHasMathStep: false,
  pendingThoughtTimer: null,
  boardResizeRaf: 0,
  normalSpeechCount: 0,
  stuckCount: 0,
  wrongAttemptCount: 0,
  lastIssueAt: 0,
  silenceCareAskedAt: 0,
  awaitingSilenceFollowup: false,
  interactiveStepCount: 0,
  activeGuideRequestId: 0,
  silenceGuidePending: false,
  teachSessionPaused: false,
  teachPausedAt: 0,
  resumeListeningAfterNavigation: false,
  resumeSpeechAfterNavigation: false,
  resumePendingThoughtAfterNavigation: false,
  resumeHandwritingAfterNavigation: false,
  resumeIssueTimerAfterNavigation: false,
  recognitionResumeTimer: null,
  ignoreNextRecognitionEnd: false,
  activeNotebookId: null,
  notebook: loadNotebook()
};

function pickPrompt(key, variants) {
  const options = Array.isArray(variants) ? variants.filter(Boolean) : [];
  if (!options.length) return "";
  const previous = state.promptVariantLastByKey.get(key);
  const available = options.length > 1 ? options.filter((option) => option !== previous) : options;
  const selected = available[Math.floor(Math.random() * available.length)] || options[0];
  state.promptVariantLastByKey.set(key, selected);
  return selected;
}

function pauseTeachSessionForNavigation() {
  if (state.teachSessionPaused || !state.lecture.length) return;

  state.teachSessionPaused = true;
  state.teachPausedAt = Date.now();
  state.resumeListeningAfterNavigation = state.isListening;
  state.resumePendingThoughtAfterNavigation = Boolean(state.pendingThoughtTimer || state.pendingThoughtText);
  state.resumeHandwritingAfterNavigation = Boolean(state.recognitionTimer);
  state.resumeIssueTimerAfterNavigation = Boolean(state.issueSilenceTimer);
  state.resumeSpeechAfterNavigation = Boolean(
    "speechSynthesis" in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused
  );

  stopSpeechNoResultTimer();
  clearTimeout(state.silenceTimer);
  state.silenceTimer = null;
  clearTimeout(state.pendingThoughtTimer);
  state.pendingThoughtTimer = null;
  clearTimeout(state.recognitionTimer);
  state.recognitionTimer = null;
  clearIssueSilenceTimer();
  clearTimeout(state.recognitionResumeTimer);
  state.recognitionResumeTimer = null;
  state.silenceGuidePending = false;
  state.activeGuideRequestId += 1;
  state.handwritingRequestId += 1;
  state.finalAnswerRequestId += 1;

  if (state.resumeSpeechAfterNavigation) window.speechSynthesis.pause();
  if (state.resumeListeningAfterNavigation && state.speechRecognition) {
    state.ignoreNextRecognitionEnd = true;
    state.isListening = false;
    try {
      state.speechRecognition.stop();
    } catch {
      state.ignoreNextRecognitionEnd = false;
    }
  }

  dom.recognitionPill.classList.add("hidden");
  dom.studentAvatar.classList.remove("speaking");
  dom.lianAvatar.classList.remove("speaking");
  dom.lianAvatar.classList.add("listening");
  dom.studentState.textContent = "讲解已暂停";
  dom.lianState.textContent = "讲解已暂停";
  dom.micBtn.innerHTML = `${iconMap.mic}已暂停`;
}

function shiftTeachSessionTimes(pausedFor) {
  if (!(pausedFor > 0)) return;
  [
    "lastGuideAt",
    "lastSpeechAt",
    "lastBoardWriteAt",
    "lastUserInputAt",
    "lastEncourageAt",
    "lastThoughtReviewAt",
    "lastIssueAt",
    "silenceCareAskedAt"
  ].forEach((key) => {
    if (state[key]) state[key] += pausedFor;
  });
}

function resumeRecognitionAfterNavigation(attempt = 0) {
  if (state.teachSessionPaused || !state.resumeListeningAfterNavigation || state.currentQuestionCompleted) return;
  const recognition = getSpeechRecognition();
  if (!recognition) {
    state.resumeListeningAfterNavigation = false;
    return;
  }

  clearTimeout(state.recognitionResumeTimer);
  state.recognitionResumeTimer = null;
  state.isListening = true;
  dom.studentState.textContent = "正在恢复收听";
  dom.micBtn.innerHTML = `${iconMap.mic}停止收听`;
  try {
    recognition.start();
  } catch {
    state.isListening = false;
    if (attempt < 3) {
      state.recognitionResumeTimer = setTimeout(() => resumeRecognitionAfterNavigation(attempt + 1), 220);
      return;
    }
    state.resumeListeningAfterNavigation = false;
    dom.studentState.textContent = "准备讲题";
    dom.micBtn.innerHTML = `${iconMap.mic}开始收听`;
  }
}

function resumeTeachSessionAfterNavigation() {
  if (!state.teachSessionPaused || !state.lecture.length) return;

  const pausedFor = Math.max(0, Date.now() - state.teachPausedAt);
  const shouldResumeListening = state.resumeListeningAfterNavigation && !state.currentQuestionCompleted;
  const shouldResumeSpeech = state.resumeSpeechAfterNavigation;
  const shouldResumeThought =
    !state.currentQuestionCompleted && state.resumePendingThoughtAfterNavigation && Boolean(state.pendingThoughtText);
  const shouldResumeHandwriting =
    !state.currentQuestionCompleted && state.resumeHandwritingAfterNavigation && hasCurrentBoardInk();
  const shouldResumeIssueTimer =
    !state.currentQuestionCompleted && state.resumeIssueTimerAfterNavigation && Boolean(state.lastIssueAt);

  state.teachSessionPaused = false;
  state.teachPausedAt = 0;
  state.resumeSpeechAfterNavigation = false;
  state.resumeListeningAfterNavigation = shouldResumeListening;
  state.resumePendingThoughtAfterNavigation = false;
  state.resumeHandwritingAfterNavigation = false;
  state.resumeIssueTimerAfterNavigation = false;
  shiftTeachSessionTimes(pausedFor);

  dom.studentState.textContent = shouldResumeListening ? "正在恢复收听" : "准备讲题";
  dom.lianState.textContent = guideIdleText();
  dom.micBtn.innerHTML = shouldResumeListening ? `${iconMap.mic}停止收听` : `${iconMap.mic}开始收听`;

  if (shouldResumeSpeech && "speechSynthesis" in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
  if (shouldResumeThought) {
    state.pendingThoughtTimer = setTimeout(handleThoughtPause, THOUGHT_PAUSE_MS);
  }
  if (shouldResumeHandwriting) scheduleHandwritingRecognition("返回讲解页后");
  if (shouldResumeIssueTimer) resetIssueSilenceTimer();
  if (shouldResumeListening) resumeRecognitionAfterNavigation();
}

function showView(viewId) {
  const activeViewId = Object.entries(views).find(([, view]) => view.classList.contains("active"))?.[0] || "";
  const leavingTeachView = activeViewId === "teachView" && viewId !== "teachView";
  const returningToTeachView = activeViewId !== "teachView" && viewId === "teachView";

  if (leavingTeachView && viewId !== "completeView") pauseTeachSessionForNavigation();
  Object.entries(views).forEach(([id, view]) => view.classList.toggle("active", id === viewId));
  dom.navBtns.forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
  if (viewId === "notebookView") renderNotebook();
  if (viewId === "teachView") {
    requestAnimationFrame(() => {
      resizeBoardCanvas();
      if (returningToTeachView) resumeTeachSessionAfterNavigation();
    });
  }
}

dom.navBtns.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

dom.enterUploadBtn.addEventListener("click", () => showView("uploadView"));
dom.welcomeNotebookBtn.addEventListener("click", () => showView("notebookView"));

function setStatus(target, text) {
  target.textContent = text;
}

function safeNowId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadNotebook() {
  try {
    return JSON.parse(localStorage.getItem("lian-notebook") || "[]");
  } catch {
    return [];
  }
}

function saveNotebook() {
  localStorage.setItem("lian-notebook", JSON.stringify(state.notebook));
  updateNotebookCount();
}

function updateNotebookCount() {
  dom.notebookCount.textContent = String(state.notebook.length);
}

function guideIdleText() {
  if (state.guideState === GUIDE_STATES.MICRO_HINT) return "微提示后听你讲";
  if (state.guideState === GUIDE_STATES.INTERACTIVE) return "等你复述这一步";
  if (state.guideState === GUIDE_STATES.ARCHIVE) return "总结归档";
  return "在听你讲";
}

function setGuideState(nextState) {
  if (!GUIDE_STATE_LABELS[nextState]) return;
  state.guideState = nextState;
  if (nextState !== GUIDE_STATES.INTERACTIVE) state.interactiveStepCount = 0;
  if (!dom.lianAvatar.classList.contains("speaking")) {
    dom.lianState.textContent = guideIdleText();
  }
}

function getLastUserInputAt() {
  return Math.max(state.lastUserInputAt || 0, state.lastSpeechAt || 0, state.lastBoardWriteAt || 0);
}

function clearSilenceFollowup() {
  state.awaitingSilenceFollowup = false;
  state.silenceCareAskedAt = 0;
}

function markUserInput(type) {
  const now = Date.now();
  if (type === "speech") state.lastSpeechAt = now;
  if (type === "board") state.lastBoardWriteAt = now;
  state.lastUserInputAt = now;

  if (state.awaitingSilenceFollowup) {
    clearSilenceFollowup();
    if (state.guideState === GUIDE_STATES.MICRO_HINT) setGuideState(GUIDE_STATES.HEURISTIC);
  }

  if (state.isListening) resetSilenceTimer(false);
}

function clearIssueSilenceTimer() {
  clearTimeout(state.issueSilenceTimer);
  state.issueSilenceTimer = null;
}

function resetIssueSilenceTimer() {
  clearIssueSilenceTimer();
  if (state.teachSessionPaused) {
    state.resumeIssueTimerAfterNavigation = Boolean(state.lastIssueAt);
    return;
  }
  if (!state.lastIssueAt || state.guideState === GUIDE_STATES.INTERACTIVE) return;
  const delay = Math.max(0, ERROR_SILENCE_MS - (Date.now() - state.lastIssueAt));
  state.issueSilenceTimer = setTimeout(handleIssueSilenceTimeout, delay);
}

function handleIssueSilenceTimeout() {
  if (state.teachSessionPaused) {
    state.resumeIssueTimerAfterNavigation = Boolean(state.lastIssueAt);
    return;
  }
  if (state.currentQuestionCompleted) return;
  if (!state.lastIssueAt || state.guideState === GUIDE_STATES.INTERACTIVE) return;
  if (getLastUserInputAt() > state.lastIssueAt + 500) return;

  setGuideState(GUIDE_STATES.INTERACTIVE);
  requestSmartGuide("error_silence", "", {
    force: true,
    guideState: GUIDE_STATES.INTERACTIVE,
    silenceSeconds: Math.round((Date.now() - state.lastIssueAt) / 1000)
  });
}

function clearIssueTracking() {
  state.wrongAttemptCount = 0;
  state.lastIssueAt = 0;
  state.lastHandwritingIssueKey = "";
  clearIssueSilenceTimer();
}

function registerPossibleIssue(result) {
  const now = Date.now();
  const issueKey = `${result.issueType}:${result.expectedNextStep || result.issueSummary}`;
  const isDuplicate = issueKey === state.lastHandwritingIssueKey && now - state.lastHandwritingGuideAt < 25000;
  if (isDuplicate) return { issueKey, duplicate: true, escalated: false };

  state.wrongAttemptCount += 1;
  state.lastIssueAt = now;
  clearSilenceFollowup();

  if (state.wrongAttemptCount >= 3) {
    setGuideState(GUIDE_STATES.INTERACTIVE);
    clearIssueSilenceTimer();
    state.lastHandwritingIssueKey = issueKey;
    state.lastHandwritingGuideAt = now;
    requestSmartGuide("repeat_wrong", result.guidance || result.issueSummary || "", {
      force: true,
      guideState: GUIDE_STATES.INTERACTIVE
    });
    return { issueKey, duplicate: false, escalated: true };
  }

  setGuideState(GUIDE_STATES.MICRO_HINT);
  resetIssueSilenceTimer();
  return { issueKey, duplicate: false, escalated: false };
}

updateNotebookCount();

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateLike) {
  return new Date(dateLike).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

dom.dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dom.dropZone.classList.add("dragging");
});

dom.dropZone.addEventListener("dragleave", () => {
  dom.dropZone.classList.remove("dragging");
});

dom.dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dom.dropZone.classList.remove("dragging");
  const file = event.dataTransfer.files?.[0];
  if (file) handleImageFile(file);
});

dom.imageInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) handleImageFile(file);
});

dom.replaceImageBtn.addEventListener("click", () => dom.imageInput.click());
dom.clearImageBtn.addEventListener("click", resetUpload);

function handleImageFile(file) {
  if (!file.type.startsWith("image/")) {
    setStatus(dom.uploadState, "请选择图片文件");
    return;
  }

  const uploadStartedAt = performance.now();
  const reader = new FileReader();
  setStatus(dom.uploadState, "上传中");
  reader.onload = async () => {
    const fileReadFinishedAt = performance.now();
    const dataUrl = reader.result;
    const imageDecodeStartedAt = performance.now();
    const image = await loadImage(dataUrl);
    const imageDecodedAt = performance.now();
    state.segmentTiming = {
      uploadStartedAt,
      fileReadMs: Math.round(fileReadFinishedAt - uploadStartedAt),
      imageDecodeMs: Math.round(imageDecodedAt - imageDecodeStartedAt)
    };
    state.source = {
      dataUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
      name: file.name
    };
    state.questions = [];
    state.selectedIds = [];
    state.segmentDebug = null;
    renderQuestions();
    dom.sourcePreview.src = dataUrl;
    dom.previewPanel.classList.remove("hidden");
    dom.dropZone.classList.add("hidden");
    setStatus(dom.uploadState, "图片已上传");
    setStatus(dom.segmentState, "可以自动分割，也可以手动框选");
    setManualMode(false);
    await runAutoSegment({ fromUpload: true });
  };
  reader.onerror = () => setStatus(dom.uploadState, "上传失败，请换一张图片");
  reader.readAsDataURL(file);
}

function resetUpload() {
  state.source = null;
  state.questions = [];
  state.selectedIds = [];
  state.segmentDebug = null;
  setManualMode(false);
  dom.imageInput.value = "";
  dom.sourcePreview.removeAttribute("src");
  renderSegmentDebug();
  dom.previewPanel.classList.add("hidden");
  dom.dropZone.classList.remove("hidden");
  setStatus(dom.uploadState, "等待上传");
  setStatus(dom.segmentState, "上传后可生成题目");
  renderQuestions();
}

dom.autoSegmentBtn.addEventListener("click", () => runAutoSegment());

function completeSegmentationTiming(clientTimings, serverTimings, segmentationStartedAt, uploadStartedAt) {
  clientTimings.frontendSegmentationMs = Math.round(performance.now() - segmentationStartedAt);
  clientTimings.uploadToPresentedMs = Math.round(performance.now() - uploadStartedAt);
  clientTimings.server = serverTimings;
  state.segmentTiming = clientTimings;

  const timingTable = { ...clientTimings };
  delete timingTable.server;
  Object.entries(serverTimings.initial || {}).forEach(([key, value]) => {
    timingTable[`server.initial.${key}`] = value;
  });
  Object.entries(serverTimings.strict || {}).forEach(([key, value]) => {
    timingTable[`server.strict.${key}`] = value;
  });
  console.log("[segment-timing-client]", clientTimings);
  console.table(timingTable);
  return clientTimings;
}

async function runAutoSegment(options = {}) {
  if (!state.source) {
    setStatus(dom.segmentState, "先上传错题图片");
    return;
  }

  const segmentationStartedAt = performance.now();
  const uploadStartedAt = options.fromUpload && Number.isFinite(Number(state.segmentTiming?.uploadStartedAt))
    ? Number(state.segmentTiming.uploadStartedAt)
    : segmentationStartedAt;
  const clientTimings = {
    fileReadMs: options.fromUpload ? Number(state.segmentTiming?.fileReadMs) || 0 : 0,
    imageDecodeMs: options.fromUpload ? Number(state.segmentTiming?.imageDecodeMs) || 0 : 0,
    initialApiRoundTripMs: 0,
    strictRetryRoundTripMs: 0,
    resultNormalizationMs: 0,
    canvasCropMs: 0,
    renderMs: 0
  };
  const serverTimings = { initial: null, strict: null };
  setManualMode(false);
  dom.processingBox.classList.remove("hidden");
  setStatus(dom.segmentState, "AI 分割中");

  let segments = [];
  let usedApi = false;
  try {
    const initialApiStartedAt = performance.now();
    const result = await requestAISegmentation("initial");
    clientTimings.initialApiRoundTripMs = Math.round(performance.now() - initialApiStartedAt);
    serverTimings.initial = result?.timings || null;
    state.segmentDebug = result?.debug || null;
    renderSegmentDebug();
    const initialNormalizationStartedAt = performance.now();
    segments = normalizeSegmentResult(result);
    clientTimings.resultNormalizationMs += Math.round(performance.now() - initialNormalizationStartedAt);
    const initialHadOnlyRejectedBoxes = !segments.length && Array.isArray(result?.questions) && result.questions.length > 0;
    const canStrictRetry = result?.allowStrictRetry === true && result?.cacheHit !== true;
    if (canStrictRetry && !result?.fallbackToWholePage && (needsStrictWholePageRetry(segments) || initialHadOnlyRejectedBoxes)) {
      setStatus(dom.segmentState, "正在重新分析整页题目结构");
      const strictApiStartedAt = performance.now();
      const strictResult = await requestAISegmentation("strict_structure");
      clientTimings.strictRetryRoundTripMs = Math.round(performance.now() - strictApiStartedAt);
      serverTimings.strict = strictResult?.timings || null;
      const strictNormalizationStartedAt = performance.now();
      const strictSegments = normalizeSegmentResult(strictResult);
      clientTimings.resultNormalizationMs += Math.round(performance.now() - strictNormalizationStartedAt);
      if (strictResult?.fallbackToWholePage || strictSegments.length && !needsStrictWholePageRetry(strictSegments)) {
        segments = strictSegments;
      } else {
        segments = [];
      }
    }
    usedApi = segments.length > 0;
  } catch (error) {
    if (!clientTimings.initialApiRoundTripMs) {
      clientTimings.initialApiRoundTripMs = Math.round(performance.now() - segmentationStartedAt);
    }
    console.warn("AI segmentation fallback:", error);
    state.segmentDebug = null;
    renderSegmentDebug();
  }

  if (!segments.length) {
    dom.processingBox.classList.add("hidden");
    state.questions = [];
    state.selectedIds = [];
    const renderStartedAt = performance.now();
    renderQuestions();
    clientTimings.renderMs = Math.round(performance.now() - renderStartedAt);
    const completedTimings = completeSegmentationTiming(
      clientTimings,
      serverTimings,
      segmentationStartedAt,
      uploadStartedAt
    );
    setStatus(dom.segmentState, `AI 没有可靠拆出单题，请改用手动框选 · 总耗时 ${(completedTimings.uploadToPresentedMs / 1000).toFixed(1)} 秒`);
    return;
  }

  const usedWholePageFallback = segments.some((segment) => segment.meta?.fallbackToWholePage);
  const usedFastNumberSplit =
    segments.length > 1 &&
    segments.every((segment) => String(segment.meta?.generatedBy || "").includes("question-number") || String(segment.meta?.generatedBy || "").includes("leading-page-region"));
  const questions = [];
  const cropStartedAt = performance.now();
  const perCropMs = [];
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const singleCropStartedAt = performance.now();
    questions.push(
      await createQuestionFromBox(segment.finalBox, segment.meta?.fallbackToWholePage ? "AI 整页兜底" : "AI 自动分割", {
        index: index + 1,
        aiMeta: segment.meta
      })
    );
    perCropMs.push(Math.round(performance.now() - singleCropStartedAt));
  }
  clientTimings.canvasCropMs = Math.round(performance.now() - cropStartedAt);
  clientTimings.averageCropMs = perCropMs.length
    ? Math.round(perCropMs.reduce((sum, value) => sum + value, 0) / perCropMs.length)
    : 0;
  clientTimings.cropCount = perCropMs.length;

  state.questions = questions;
  state.selectedIds = questions.map((question) => question.id);
  dom.processingBox.classList.add("hidden");
  const statusMessage = usedWholePageFallback
      ? "AI 没有可靠拆成单题，已先保留整页，可手动框选细分"
      : usedFastNumberSplit
        ? `已按题号快速识别 ${questions.length} 道题目`
      : usedApi
        ? `AI 已识别 ${questions.length} 道题目`
        : `已生成 ${questions.length} 道题目，可手动调整`;
  const renderStartedAt = performance.now();
  renderQuestions();
  clientTimings.renderMs = Math.round(performance.now() - renderStartedAt);
  const completedTimings = completeSegmentationTiming(
    clientTimings,
    serverTimings,
    segmentationStartedAt,
    uploadStartedAt
  );
  setStatus(dom.segmentState, `${statusMessage} · 总耗时 ${(completedTimings.uploadToPresentedMs / 1000).toFixed(1)} 秒`);
}

async function requestAISegmentation(mode = "initial") {
  return requestSegmentationForImage(state.source.dataUrl, state.source.width, state.source.height, mode);
}

async function requestSegmentationForImage(image, width, height, mode = "initial") {
  const response = await fetch("/api/segment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image,
      width,
      height,
      mode
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "题目分割失败");
  return result;
}

function renderSegmentDebug() {
  const canvas = dom.segmentDebugCanvas;
  const debug = state.segmentDebug;
  const source = state.source;
  const debugRequested = new URLSearchParams(window.location.search).get("segmentDebug") === "1";
  if (!canvas || !debug || !source || !debugRequested || !dom.sourcePreview.getAttribute("src")) {
    const context = canvas?.getContext("2d");
    context?.clearRect(0, 0, canvas.width, canvas.height);
    canvas?.classList.add("hidden");
    return;
  }

  const imageRect = dom.sourcePreview.getBoundingClientRect();
  const stageRect = dom.manualStage.getBoundingClientRect();
  if (!imageRect.width || !imageRect.height) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(imageRect.width * dpr));
  canvas.height = Math.max(1, Math.round(imageRect.height * dpr));
  Object.assign(canvas.style, {
    left: `${imageRect.left - stageRect.left}px`,
    top: `${imageRect.top - stageRect.top}px`,
    width: `${imageRect.width}px`,
    height: `${imageRect.height}px`
  });
  canvas.classList.remove("hidden");

  const context = canvas.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, imageRect.width, imageRect.height);
  const scale = Math.min(imageRect.width / source.width, imageRect.height / source.height);
  const renderedWidth = source.width * scale;
  const renderedHeight = source.height * scale;
  const offsetX = (imageRect.width - renderedWidth) / 2;
  const offsetY = (imageRect.height - renderedHeight) / 2;

  const drawBoxes = (boxes, color, dash = [], labelPrefix = "") => {
    context.save();
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 1.5;
    context.setLineDash(dash);
    boxes.forEach((box, index) => {
      if (![box.x, box.y, box.w, box.h].every(Number.isFinite)) return;
      const x = offsetX + box.x * scale;
      const y = offsetY + box.y * scale;
      const width = box.w * scale;
      const height = box.h * scale;
      context.strokeRect(x, y, width, height);
      if (labelPrefix) {
        context.font = "11px sans-serif";
        context.fillText(`${labelPrefix}${box.sourceQuestionNumber || index + 1}`, x + 3, y + 12);
      }
    });
    context.restore();
  };

  drawBoxes(debug.rawModelBoxes || [], "#f05d5e", [], "V");
  drawBoxes(debug.ocrLineBoxes || [], "#3c8dbc", [], "O");
  drawBoxes(debug.finalBoxes || [], "#1f8a5b", [], "Q");
  drawBoxes(debug.deduplicatedBoxes || [], "#9254a6", [6, 4], "D");
  (debug.boundaryLines || []).forEach((line) => {
    if (!Number.isFinite(line.y)) return;
    const y = offsetY + line.y * scale;
    const isHardBoundary = line.kind === "hard-boundary";
    context.save();
    context.strokeStyle = isHardBoundary ? "#d9363e" : "#f0a020";
    context.fillStyle = context.strokeStyle;
    context.lineWidth = isHardBoundary ? 2.5 : 1.5;
    context.setLineDash(isHardBoundary ? [8, 4] : []);
    context.beginPath();
    context.moveTo(offsetX, y);
    context.lineTo(offsetX + renderedWidth, y);
    context.stroke();
    context.font = "11px sans-serif";
    context.fillText(
      `${isHardBoundary ? "硬边界" : "起始"} Q${line.sourceQuestionNumber || "?"}`,
      offsetX + 4,
      Math.max(12, y - 3)
    );
    context.restore();
  });
}

dom.sourcePreview.addEventListener("load", () => requestAnimationFrame(renderSegmentDebug));
window.addEventListener("resize", () => requestAnimationFrame(renderSegmentDebug));

function normalizeSegmentResult(result, sourceSize = state.source) {
  if (!sourceSize) return [];
  const rawQuestions = Array.isArray(result?.questions) ? result.questions : [];
  const visibleQuestionCount = rawQuestions.length;
  let segments = rawQuestions
    .map((item) => {
      try {
        if (!item || typeof item !== "object") {
          console.warn("[segment-normalize] ignored empty question result", item);
          return null;
        }
        const nonStandaloneRoles = new Set(["subQuestion", "table", "figure", "formula", "supportingContent"]);
        if (nonStandaloneRoles.has(item.questionRole) || (!item.sourceQuestionNumber && item.parentQuestionNumber)) {
          const subNumber = Array.isArray(item.subQuestions) ? item.subQuestions.join("、") : "";
          console.debug(
            item.questionRole === "subQuestion"
              ? `[render] skip standalone card for subQuestion（${subNumber || "?"}）`
              : "[render] standalone supporting-content card skipped"
          );
          return null;
        }
        const receivedBox = item.finalBox && typeof item.finalBox === "object" ? item.finalBox : item;
        const finalBox = clampSegmentBox(receivedBox, sourceSize.width, sourceSize.height);
        if (!finalBox) {
          console.warn("[segment-normalize] invalid finalBox; question skipped", item);
          return null;
        }
        const sourceNumber = String(item.sourceQuestionNumber || item.questionNumber || item.number || "").trim();
        console.log(
          `[Q${sourceNumber || "?"}][frontend-received] top=${finalBox.y} bottom=${finalBox.y + finalBox.h} x=${finalBox.x} w=${finalBox.w}`
        );
        const title = String(item.problemText || item.title || "").trim();
        const type = item.problemType || item.type || "";
        const knowledge = normalizeMainKnowledgePoint(item.mainKnowledgePoint || item.knowledge || item.knowledgePoints, `${title} ${type}`);
        if (isSuspiciousWholePageSegment(finalBox, item, knowledge, visibleQuestionCount, sourceSize)) return null;
        return {
          finalBox,
          meta: {
            questionNumber: sourceNumber,
            sourceQuestionNumber: sourceNumber,
            displayIndex: Number(item.displayIndex) || 0,
            problemText: title,
            problemType: sanitizeMathLabel(type),
            knowledgePoints: knowledge.points,
            confidence: Number(item.confidence) || 0,
            generatedBy: String(item.generatedBy || result?.model || ""),
            needsReview: Boolean(item.needsReview),
            uncertain: Boolean(item.uncertain),
            validation: Array.isArray(item.validation) ? item.validation : [],
            mergeReasons: Array.isArray(item.mergeReasons) ? item.mergeReasons : [],
            questionRole: item.questionRole || "mainQuestion",
            parentQuestionNumber: String(item.parentQuestionNumber || "").trim(),
            subQuestions: Array.isArray(item.subQuestions) ? item.subQuestions.map(String) : [],
            isPrimary: item.isPrimary !== false
          }
        };
      } catch (error) {
        console.error("[segment-normalize] question metadata failed; preserving remaining questions", error, item);
        const fallbackBox = clampSegmentBox(item?.finalBox || item || {}, sourceSize.width, sourceSize.height);
        if (!fallbackBox) return null;
        const sourceNumber = String(item?.sourceQuestionNumber || item?.questionNumber || item?.number || "").trim();
        return {
          finalBox: fallbackBox,
          meta: {
            questionNumber: sourceNumber,
            sourceQuestionNumber: sourceNumber,
            displayIndex: Number(item?.displayIndex) || 0,
            problemText: String(item?.problemText || item?.title || "").trim(),
            problemType: "",
            knowledgePoints: [],
            confidence: Number(item?.confidence) || 0,
            generatedBy: String(item?.generatedBy || result?.model || ""),
            needsReview: Boolean(item?.needsReview),
            uncertain: Boolean(item?.uncertain),
            validation: [],
            mergeReasons: [],
            questionRole: "mainQuestion",
            parentQuestionNumber: "",
            subQuestions: [],
            isPrimary: true
          }
        };
      }
    })
    .filter(Boolean);

  segments = deduplicatePrimarySegments(segments);

  const shouldKeepWholePageFallback =
    canUseWholeImageAsSingleQuestion(sourceSize) &&
    (result?.fallbackToWholePage || rawQuestions.length > 0);
  if (!segments.length && shouldKeepWholePageFallback) {
    segments.push({
      finalBox: { x: 0, y: 0, w: sourceSize.width, h: sourceSize.height },
      meta: {
        problemText: result.note || "AI 暂时没有可靠拆出单题，已先保留整页",
        problemType: "整页题目",
        knowledgePoints: [],
        confidence: 0.15,
        fallbackToWholePage: true
      }
    });
  }

  return segments.sort((a, b) => a.finalBox.y - b.finalBox.y || a.finalBox.x - b.finalBox.x);
}

function normalizeQuestionTextForKey(text) {
  return String(text || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/题目\s*\d+/g, "")
    .replace(/ai\s*自动分割/gi, "")
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function deduplicatePrimarySegments(segments) {
  const seen = new Set();
  return (Array.isArray(segments) ? segments : []).filter((segment) => {
    if (segment.meta?.isPrimary === false) return false;
    const sourceNumber = segment.meta?.sourceQuestionNumber || segment.meta?.questionNumber || "";
    const prefix = normalizeQuestionTextForKey(segment.meta?.problemText || "").slice(0, 28);
    const key = [sourceNumber, Math.round(segment.finalBox.x), Math.round(segment.finalBox.y), prefix].join("-");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function canUseWholeImageAsSingleQuestion(sourceSize = state.source) {
  return Boolean(sourceSize?.width && sourceSize?.height);
}

function sanitizeMathLabel(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/题目|边界|分割|图像|图片|识别|OCR|检测|裁剪|数学题/.test(text)) return "";
  return text;
}

function guessKnowledgePoint(text) {
  const value = String(text || "");
  if (/比例|比值|比例式|成比例/.test(value)) return "比例与比例式";
  if (/圆|圆心角|圆周角|扇形|弧长|周长/.test(value)) return "圆的相关计算";
  if (/方程|未知数|解方程|等式/.test(value)) return "一元一次方程";
  if (/角|度|平行线|相交线/.test(value)) return "角度关系";
  if (/函数|坐标|图象|一次函数/.test(value)) return "函数图象";
  if (/不等式/.test(value)) return "不等式";
  if (/面积|体积|周长/.test(value)) return "几何计算";
  return "";
}

function normalizeMainKnowledgePoint(value, fallbackText = "") {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  const raw = list
    .map((point) => String(point || "").trim())
    .filter(Boolean)
    .join("、");
  const parts = raw
    .split(/[、,，;；/|]+/)
    .map((point) => sanitizeMathLabel(point))
    .filter(Boolean);
  const guessed = guessKnowledgePoint(`${raw} ${fallbackText}`);

  return {
    points: parts.length ? [parts[0]] : guessed ? [guessed] : [],
    hadMultiple: parts.length > 1 || list.length > 1
  };
}

function isSuspiciousWholePageSegment(box, item, knowledge, visibleQuestionCount, sourceSize = state.source) {
  if (visibleQuestionCount !== 1 || !sourceSize) return false;
  const areaRatio = (box.w * box.h) / (sourceSize.width * sourceSize.height);
  if (areaRatio < 0.82) return false;

  const text = `${item.problemText || ""} ${item.problemType || ""}`.trim();
  return knowledge.hadMultiple || /多道|多个|整页|全页|试卷|题组|小题/.test(text);
}

function needsStrictWholePageRetry(segments) {
  if (!state.source || !segments.length) return false;
  if (segments.some((segment) => String(segment.meta.generatedBy).includes("leading-page-region"))) return false;
  if (segments.every((segment) => segment.meta.generatedBy === "question-number-fallback")) return false;
  const tallPage = state.source.height > state.source.width * 1.1;
  const sorted = [...segments].sort((a, b) => a.finalBox.y - b.finalBox.y || a.finalBox.x - b.finalBox.x);
  const hasMergedSignal = sorted.some(segmentHasMergedQuestionSignals);
  const hasDuplicateBoxes = sorted.some((segment, index) =>
    sorted.slice(index + 1).some((other) => segmentOverlapRatio(segment.finalBox, other.finalBox) > 0.85)
  );
  const hasVeryLargeChunk = sorted.some((segment) => {
    const areaRatio = (segment.finalBox.w * segment.finalBox.h) / (state.source.width * state.source.height);
    const heightRatio = segment.finalBox.h / state.source.height;
    return areaRatio > 0.45 || (tallPage && heightRatio > 0.42);
  });
  const hasWeakKnowledge = sorted.some((segment) => !segment.meta.knowledgePoints?.length && segment.meta.confidence >= 0.5);
  return hasMergedSignal || hasDuplicateBoxes || hasVeryLargeChunk || hasWeakKnowledge;
}

function segmentHasMergedQuestionSignals(segment) {
  const label = String(segment.meta.questionNumber || "");
  if (/[、,，~～\-至]/.test(label)) return true;

  const text = `${segment.meta.questionNumber || ""} ${segment.meta.problemText || ""} ${segment.meta.problemType || ""}`;
  const matches = [...text.matchAll(/(?:^|[^\d])(\d{1,2})[.．、)]/g)].map((match) => match[1]);
  const uniqueNumbers = new Set(matches);
  return uniqueNumbers.size > 1 || /多道|多个|整页|全页|题组|第\s*\d+\s*题.*第\s*\d+\s*题/.test(text);
}

function segmentOverlapRatio(a, b) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.w, b.x + b.w);
  const bottom = Math.min(a.y + a.h, b.y + b.h);
  const overlap = Math.max(0, right - left) * Math.max(0, bottom - top);
  const smaller = Math.min(a.w * a.h, b.w * b.h);
  return smaller ? overlap / smaller : 0;
}

function clampSegmentBox(item, width, height) {
  const x = Number(item.x);
  const y = Number(item.y);
  const w = Number(item.w);
  const h = Number(item.h);
  if (![x, y, w, h].every(Number.isFinite)) return null;

  const safeX = Math.max(0, Math.min(width - 1, Math.floor(x)));
  const safeY = Math.max(0, Math.min(height - 1, Math.floor(y)));
  const safeRight = Math.max(safeX + 1, Math.min(width, Math.ceil(x + w)));
  const safeBottom = Math.max(safeY + 1, Math.min(height, Math.ceil(y + h)));
  const safeW = safeRight - safeX;
  const safeH = safeBottom - safeY;
  if (safeW < width * 0.05 || safeH < height * 0.035) return null;
  return {
    x: safeX,
    y: safeY,
    w: safeW,
    h: safeH
  };
}

async function createQuestionFromBox(box, sourceLabel, options = {}) {
  const cropNumber = String(options.aiMeta?.sourceQuestionNumber || options.aiMeta?.questionNumber || "?");
  console.log(
    `[Q${cropNumber}][canvas-crop] top=${box.y} bottom=${box.y + box.h} x=${box.x} w=${box.w}`
  );
  console.log(`[Q${cropNumber}] canvasSourceHeight=${box.h}`);
  const imageData = await cropImage(state.source.dataUrl, box);
  const imageMeta = await readImageMeta(imageData);
  const aiMeta = options.aiMeta || {};
  const sourceQuestionNumber = aiMeta.sourceQuestionNumber || aiMeta.questionNumber || "";
  const displayIndex = Number(aiMeta.displayIndex) || Number(options.index) || state.questions.length + 1;
  const knowledge = normalizeMainKnowledgePoint(aiMeta.knowledgePoints, `${aiMeta.problemText || ""} ${aiMeta.problemType || ""}`);
  const title = sourceQuestionNumber
    ? `第 ${sourceQuestionNumber} 题`
    : aiMeta.needsReview
      ? "待确认题目"
      : "未编号题目";
  return {
    id: safeNowId("question"),
    title,
    source: sourceLabel,
    captureMode: options.captureMode || "segment",
    image: imageData,
    imageWidth: imageMeta.width,
    imageHeight: imageMeta.height,
    questionNumber: sourceQuestionNumber,
    sourceQuestionNumber,
    displayIndex,
    problemText: aiMeta.problemText || "",
    problemType: sanitizeMathLabel(aiMeta.problemType || ""),
    knowledgePoints: knowledge.points,
    confidence: Number(aiMeta.confidence) || 0,
    needsReview: Boolean(aiMeta.needsReview),
    uncertain: Boolean(aiMeta.uncertain),
    validation: aiMeta.validation || [],
    mergeReasons: aiMeta.mergeReasons || [],
    questionRole: aiMeta.questionRole || "mainQuestion",
    parentQuestionNumber: aiMeta.parentQuestionNumber || "",
    subQuestions: Array.isArray(aiMeta.subQuestions) ? aiMeta.subQuestions : [],
    box
  };
}

async function readImageMeta(dataUrl) {
  const image = await loadImage(dataUrl);
  return {
    width: image.naturalWidth,
    height: image.naturalHeight
  };
}

async function cropImage(dataUrl, box) {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(box.w));
  canvas.height = Math.max(1, Math.round(box.h));
  const cropCtx = canvas.getContext("2d");
  cropCtx.fillStyle = "#ffffff";
  cropCtx.fillRect(0, 0, canvas.width, canvas.height);
  cropCtx.drawImage(image, box.x, box.y, box.w, box.h, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.92);
}

dom.manualModeBtn.addEventListener("click", () => {
  if (!state.source) {
    setStatus(dom.segmentState, "先上传错题图片");
    return;
  }
  setManualMode(true);
});

dom.cancelManualBtn.addEventListener("click", () => setManualMode(false));

function setManualMode(enabled) {
  state.manualMode = enabled;
  state.selectionStart = null;
  state.selectionCurrent = null;
  state.manualAdjust = null;
  clearManualSelection();
  dom.manualStage.classList.toggle("manual", enabled);
  dom.manualActions.classList.toggle("hidden", !enabled);
  dom.manualModeBtn.classList.toggle("active", enabled);
  dom.autoSegmentBtn.classList.toggle("active", !enabled);
  if (enabled) setStatus(dom.segmentState, "拖出题目区域，松开后可调整大小");
}

dom.manualStage.addEventListener("pointerdown", (event) => {
  if (!state.manualMode || !state.source) return;
  if (event.target.closest("#selectionRect")) return;
  const point = getImagePoint(event);
  if (!point) return;
  event.preventDefault();
  dom.manualStage.setPointerCapture(event.pointerId);
  clearManualSelection();
  state.selectionStart = point;
  state.selectionCurrent = point;
  dom.selectionRect.classList.add("drawing");
  renderSelectionRect();
});

dom.manualStage.addEventListener("pointermove", (event) => {
  if (!state.manualMode || !state.selectionStart) return;
  const point = getImagePoint(event);
  if (!point) return;
  state.selectionCurrent = point;
  renderSelectionRect();
});

dom.manualStage.addEventListener("pointerup", (event) => {
  if (!state.manualMode || !state.selectionStart || !state.selectionCurrent) return;
  event.preventDefault();
  const start = state.selectionStart;
  const end = state.selectionCurrent;
  state.selectionStart = null;
  state.selectionCurrent = null;
  dom.selectionRect.classList.remove("drawing");

  const box = {
    x: Math.min(start.naturalX, end.naturalX),
    y: Math.min(start.naturalY, end.naturalY),
    w: Math.abs(end.naturalX - start.naturalX),
    h: Math.abs(end.naturalY - start.naturalY)
  };

  if (box.w < state.source.width * 0.05 || box.h < state.source.height * 0.04) {
    setStatus(dom.segmentState, "框选区域太小，请重新框选");
    clearManualSelection();
    return;
  }

  state.manualSelection = clampNaturalBox(box);
  renderManualSelection();
  setStatus(dom.segmentState, "可拖动框或边角调整，点对号生成题卡");
});

dom.selectionRect.addEventListener("pointerdown", (event) => {
  if (!state.manualMode || !state.manualSelection) return;
  if (event.target.closest(".selection-action")) return;
  const point = getClampedImagePoint(event);
  if (!point) return;
  event.preventDefault();
  event.stopPropagation();
  dom.selectionRect.setPointerCapture(event.pointerId);
  const handle = event.target.dataset.handle || "";
  state.manualAdjust = {
    mode: handle ? "resize" : "move",
    handle,
    startPoint: point,
    startBox: { ...state.manualSelection }
  };
});

dom.selectionRect.addEventListener("pointermove", (event) => {
  if (!state.manualAdjust || !state.manualSelection) return;
  const point = getClampedImagePoint(event);
  if (!point) return;
  event.preventDefault();
  event.stopPropagation();
  state.manualSelection =
    state.manualAdjust.mode === "move"
      ? moveManualSelection(point)
      : resizeManualSelection(point);
  renderManualSelection();
});

["pointerup", "pointercancel"].forEach((eventName) => {
  dom.selectionRect.addEventListener(eventName, (event) => {
    if (!state.manualAdjust) return;
    event.preventDefault();
    event.stopPropagation();
    state.manualAdjust = null;
  });
});

dom.confirmSelectionBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  event.stopPropagation();
  await confirmManualSelection();
});

dom.cancelSelectionBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  clearManualSelection();
  setStatus(dom.segmentState, "已取消当前框选，可重新拖出题目区域");
});

async function confirmManualSelection() {
  if (!state.manualSelection) {
    setStatus(dom.segmentState, "先拖出题目区域");
    return;
  }
  const box = clampNaturalBox(state.manualSelection);
  if (box.w < state.source.width * 0.05 || box.h < state.source.height * 0.04) {
    setStatus(dom.segmentState, "框选区域太小，请调大后再确认");
    return;
  }

  dom.processingBox.classList.remove("hidden");
  const question = await createQuestionFromBox(box, "手动框选", { captureMode: "manual-capture" });
  question.title = `第 ${state.questions.length + 1} 题`;
  state.questions.push(question);
  if (!state.selectedIds.includes(question.id)) state.selectedIds.push(question.id);
  dom.processingBox.classList.add("hidden");
  clearManualSelection();
  setStatus(dom.segmentState, `已生成 ${state.questions.length} 道题目`);
  renderQuestions();
}

function getImagePoint(event) {
  const imageRect = getVisiblePreviewImageRect();
  if (!imageRect.width || !imageRect.height) return null;
  const x = event.clientX - imageRect.left;
  const y = event.clientY - imageRect.top;
  if (x < 0 || y < 0 || x > imageRect.width || y > imageRect.height) return null;
  return {
    viewX: x,
    viewY: y,
    naturalX: (x / imageRect.width) * state.source.width,
    naturalY: (y / imageRect.height) * state.source.height
  };
}

function getClampedImagePoint(event) {
  const imageRect = getVisiblePreviewImageRect();
  if (!state.source || !imageRect.width || !imageRect.height) return null;
  const x = Math.max(0, Math.min(event.clientX - imageRect.left, imageRect.width));
  const y = Math.max(0, Math.min(event.clientY - imageRect.top, imageRect.height));
  return {
    viewX: x,
    viewY: y,
    naturalX: (x / imageRect.width) * state.source.width,
    naturalY: (y / imageRect.height) * state.source.height
  };
}

function getVisiblePreviewImageRect() {
  const imageRect = dom.sourcePreview.getBoundingClientRect();
  if (!state.source || !imageRect.width || !imageRect.height) return imageRect;
  const naturalRatio = state.source.width / state.source.height;
  const elementRatio = imageRect.width / imageRect.height;

  if (Math.abs(naturalRatio - elementRatio) < 0.01) return imageRect;

  if (elementRatio > naturalRatio) {
    const visibleWidth = imageRect.height * naturalRatio;
    const offsetX = (imageRect.width - visibleWidth) / 2;
    return {
      left: imageRect.left + offsetX,
      top: imageRect.top,
      width: visibleWidth,
      height: imageRect.height
    };
  }

  const visibleHeight = imageRect.width / naturalRatio;
  const offsetY = (imageRect.height - visibleHeight) / 2;
  return {
    left: imageRect.left,
    top: imageRect.top + offsetY,
    width: imageRect.width,
    height: visibleHeight
  };
}

function clearManualSelection() {
  state.manualSelection = null;
  state.manualAdjust = null;
  state.selectionStart = null;
  state.selectionCurrent = null;
  dom.selectionRect.classList.add("hidden");
  dom.selectionRect.classList.remove("drawing");
}

function clampNaturalBox(box) {
  const minW = Math.max(8, state.source.width * 0.03);
  const minH = Math.max(8, state.source.height * 0.025);
  const x = Math.max(0, Math.min(box.x, state.source.width - minW));
  const y = Math.max(0, Math.min(box.y, state.source.height - minH));
  const w = Math.max(minW, Math.min(box.w, state.source.width - x));
  const h = Math.max(minH, Math.min(box.h, state.source.height - y));
  return {
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(w),
    h: Math.round(h)
  };
}

function renderManualSelection() {
  const box = state.manualSelection;
  if (!box || !state.source) {
    dom.selectionRect.classList.add("hidden");
    return;
  }

  const imageRect = getVisiblePreviewImageRect();
  const stageRect = dom.manualStage.getBoundingClientRect();
  const left = imageRect.left - stageRect.left + (box.x / state.source.width) * imageRect.width;
  const top = imageRect.top - stageRect.top + (box.y / state.source.height) * imageRect.height;
  const width = (box.w / state.source.width) * imageRect.width;
  const height = (box.h / state.source.height) * imageRect.height;
  Object.assign(dom.selectionRect.style, {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`
  });
  dom.selectionRect.classList.remove("hidden", "drawing");
}

function moveManualSelection(point) {
  const { startPoint, startBox } = state.manualAdjust;
  const nextX = startBox.x + point.naturalX - startPoint.naturalX;
  const nextY = startBox.y + point.naturalY - startPoint.naturalY;
  return clampNaturalBox({
    ...startBox,
    x: Math.max(0, Math.min(nextX, state.source.width - startBox.w)),
    y: Math.max(0, Math.min(nextY, state.source.height - startBox.h))
  });
}

function resizeManualSelection(point) {
  const { handle, startBox } = state.manualAdjust;
  const minW = Math.max(12, state.source.width * 0.03);
  const minH = Math.max(12, state.source.height * 0.025);
  let left = startBox.x;
  let top = startBox.y;
  let right = startBox.x + startBox.w;
  let bottom = startBox.y + startBox.h;

  if (handle.includes("w")) left = Math.max(0, Math.min(point.naturalX, right - minW));
  if (handle.includes("e")) right = Math.min(state.source.width, Math.max(point.naturalX, left + minW));
  if (handle.includes("n")) top = Math.max(0, Math.min(point.naturalY, bottom - minH));
  if (handle.includes("s")) bottom = Math.min(state.source.height, Math.max(point.naturalY, top + minH));

  return clampNaturalBox({
    x: left,
    y: top,
    w: right - left,
    h: bottom - top
  });
}

function renderSelectionRect() {
  const start = state.selectionStart;
  const current = state.selectionCurrent;
  if (!start || !current) return;
  const imageRect = getVisiblePreviewImageRect();
  const stageRect = dom.manualStage.getBoundingClientRect();
  const left = Math.min(start.viewX, current.viewX) + imageRect.left - stageRect.left;
  const top = Math.min(start.viewY, current.viewY) + imageRect.top - stageRect.top;
  const width = Math.abs(current.viewX - start.viewX);
  const height = Math.abs(current.viewY - start.viewY);
  Object.assign(dom.selectionRect.style, {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`
  });
  dom.selectionRect.classList.remove("hidden");
}

function renderQuestions() {
  dom.questionList.innerHTML = "";

  state.questions.forEach((question, index) => {
    const template = $("#questionCardTemplate");
    const card = template.content.firstElementChild.cloneNode(true);
    const selectedIndex = state.selectedIds.indexOf(question.id);
    card.classList.toggle("selected", selectedIndex >= 0);
    card.dataset.id = question.id;
    $("img", card).src = question.image;
    const sourceNumber = question.sourceQuestionNumber || question.questionNumber || "";
    const displayIndex = question.displayIndex || index + 1;
    $(".question-order", card).textContent = sourceNumber || displayIndex;
    $(".question-meta strong", card).textContent = sourceNumber ? `题目 ${sourceNumber}` : `题目 ${displayIndex}`;
    const selectArea = $(".select-area", card);
    if (question.imageWidth && question.imageHeight) {
      selectArea.style.aspectRatio = `${question.imageWidth} / ${question.imageHeight}`;
    }
    $(".select-area", card).addEventListener("click", () => toggleQuestionSelection(question.id));
    $(".remove-question", card).addEventListener("click", () => removeQuestion(question.id));
    $(".move-up", card).addEventListener("click", () => moveQuestion(index, -1));
    $(".move-down", card).addEventListener("click", () => moveQuestion(index, 1));
    injectIcons(card);
    dom.questionList.appendChild(card);
  });

  const count = state.selectedIds.length;
  dom.selectedSummary.textContent = count ? `已选择 ${count} 道题` : "未选择题目";
  dom.selectedHint.textContent = count ? "将按卡片上的数字依次讲解" : "可多选，按选择顺序讲解";
  dom.startLectureBtn.disabled = count === 0;
}

function toggleQuestionSelection(id) {
  const existingIndex = state.selectedIds.indexOf(id);
  if (existingIndex >= 0) {
    state.selectedIds.splice(existingIndex, 1);
  } else {
    state.selectedIds.push(id);
  }
  renderQuestions();
}

function removeQuestion(id) {
  state.questions = state.questions.filter((question) => question.id !== id);
  state.selectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
  renderQuestions();
  setStatus(dom.segmentState, state.questions.length ? `还剩 ${state.questions.length} 道题目` : "题目已清空");
}

function moveQuestion(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= state.questions.length) return;
  const [item] = state.questions.splice(index, 1);
  state.questions.splice(target, 0, item);
  renderQuestions();
}

dom.startLectureBtn.addEventListener("click", () => {
  const queue = state.selectedIds
    .map((id) => state.questions.find((question) => question.id === id))
    .filter(Boolean);
  if (!queue.length) return;
  startLecture(queue);
});

function startLecture(queue) {
  state.lecture = queue.map((question, index) => ({
    ...question,
    title: question.title || `第 ${index + 1} 题`
  }));
  state.currentLectureIndex = 0;
  state.completedThisSession = [];
  state.boardPageIndex = 0;
  state.boardPages = {};
  state.boardInkByQuestion = {};
  state.boardHistories = {};
  state.boardImageStates = {};
  state.boardHeights = {};
  state.handwritingResults = {};
  state.transcriptsByQuestion = {};
  state.awaitingFinalAnswer = false;
  state.pendingFinalAnswerText = "";
  state.finalAnswerVerified = false;
  state.verifiedFinalAnswerText = "";
  state.boardCompletionVerified = false;
  state.completionCheckInProgress = false;
  state.finalAnswerRequestId = 0;
  state.currentQuestionCompleted = false;
  state.hasExplicitFinalAnswer = false;
  state.pendingLianQuestion = null;
  dom.finishQuestionBtn.disabled = false;
  initCurrentQuestion();
  showView("teachView");
}

function currentQuestion() {
  return state.lecture[state.currentLectureIndex] || null;
}

function currentPageQuestion() {
  return state.lecture[state.boardPageIndex] || null;
}

function initCurrentQuestion() {
  if (!state.lecture.length) {
    dom.lectureProgress.textContent = "还没有选择题目";
    dom.boardImageLayer.classList.add("hidden");
    dom.finishQuestionBtn.disabled = true;
    return;
  }

  state.boardPageIndex = 0;
  state.lecture.forEach((question) => {
    state.boardPages[question.id] = state.boardPages[question.id] || [""];
    ensureBoardImageState(question);
  });
  const question = currentPageQuestion();
  applyBoardHeight(question);
  dom.lectureProgress.textContent = `第 1/${state.lecture.length} 张图`;
  dom.boardQuestionImage.src = question.image;
  applyBoardImageState();
  dom.transcriptInput.value = "";
  state.speechDraftText = "";
  state.speechDraftBase = "";
  stopSpeechNoResultTimer();
  dom.eventLog.innerHTML = "";
  dom.studentState.textContent = "准备讲题";
  setGuideState(GUIDE_STATES.HEURISTIC);
  dom.lianBubble.textContent = pickPrompt("lecture-opening", [
    "我们开始讲解这道错题吧。你慢慢说，我会陪你一起理清思路。",
    "现在来看看这道错题。你按自己的节奏讲，我会跟着你的思路听。",
    "我们先从这道题开始，不用着急，你想到哪一步就说到哪一步。",
    "来，我们一起把这道题理一遍。你先说说自己看到了什么。"
  ]);
  const now = Date.now();
  state.lastGuideAt = 0;
  state.lastSpeechAt = now;
  state.lastBoardWriteAt = now;
  state.lastUserInputAt = now;
  state.lastEncourageAt = now;
  state.normalSpeechCount = 0;
  state.stuckCount = 0;
  state.currentQuestionCompleted = false;
  state.hasExplicitFinalAnswer = false;
  state.pendingLianQuestion = null;
  clearIssueTracking();
  clearSilenceFollowup();
  state.activeGuideRequestId += 1;
  requestAnimationFrame(() => {
    resizeBoardCanvas();
    loadCurrentPage();
    updatePageLabel();
    lianSpeak(
      pickPrompt("lecture-opening", [
        "我们开始讲解这道错题吧。你慢慢说，先从题目给了什么条件开始。",
        "现在开始看这道题，你先说说题目给了哪些条件。",
        "不用着急，我们从已知条件讲起，你按自己的思路慢慢说。",
        "来，先把题目里的条件说一遍，我跟着你一起理顺。"
      ])
    );
  });
}

dom.backToUploadBtn.addEventListener("click", () => showView("uploadView"));

function getBoardBaseHeight() {
  const minHeight = Number.parseFloat(getComputedStyle(dom.blackboard).minHeight);
  return Number.isFinite(minHeight) && minHeight > 0 ? minHeight : 560;
}

function applyBoardHeight(question = currentPageQuestion()) {
  const baseHeight = getBoardBaseHeight();
  const savedHeight = question ? state.boardHeights[question.id] || baseHeight : baseHeight;
  dom.blackboard.style.minHeight = `${Math.max(baseHeight, savedHeight)}px`;
}

function resizeBoardCanvas(options = {}) {
  const previousRect = dom.canvas.getBoundingClientRect();
  const rect = dom.blackboard.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const oldImage = options.existingImage ?? (dom.canvas.width ? dom.canvas.toDataURL("image/png") : "");
  const ratio = window.devicePixelRatio || 1;
  dom.canvas.width = Math.round(rect.width * ratio);
  dom.canvas.height = Math.round(rect.height * ratio);
  dom.canvas.style.width = "100%";
  dom.canvas.style.height = "100%";
  ctx = dom.canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  clearCanvasOnly();
  if (oldImage) {
    drawDataUrlToCanvas(
      oldImage,
      options.preserveExistingSize
        ? {
            width: Math.min(rect.width, previousRect.width || rect.width),
            height: Math.min(rect.height, previousRect.height || rect.height)
          }
        : {}
    );
  }
  applyBoardImageState();
}

function scheduleBoardCanvasResize() {
  if (!views.teachView.classList.contains("active")) return;
  if (state.drawing || state.imageDragging) return;
  cancelAnimationFrame(state.boardResizeRaf);
  state.boardResizeRaf = requestAnimationFrame(() => {
    saveCurrentPage();
    resizeBoardCanvas({ preserveExistingSize: true });
  });
}

window.addEventListener("resize", () => {
  if (views.teachView.classList.contains("active")) {
    scheduleBoardCanvasResize();
  }
});

if ("ResizeObserver" in window) {
  const boardResizeObserver = new ResizeObserver(() => scheduleBoardCanvasResize());
  boardResizeObserver.observe(dom.blackboard);
}

dom.boardQuestionImage.addEventListener("load", () => {
  const question = currentPageQuestion();
  const imageState = question ? state.boardImageStates[question.id] : null;
  if (!imageState || !dom.boardQuestionImage.naturalWidth) return;
  imageState.baseHeight = imageState.baseWidth * (dom.boardQuestionImage.naturalHeight / dom.boardQuestionImage.naturalWidth);
  clampBoardImageState(imageState);
  applyBoardImageState();
});

function clearCanvasOnly() {
  const rect = dom.canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
}

function drawDataUrlToCanvas(dataUrl, options = {}) {
  if (!dataUrl) return;
  const image = new Image();
  image.onload = () => {
    const rect = dom.canvas.getBoundingClientRect();
    const width = options.width || rect.width;
    const height = options.height || rect.height;
    clearCanvasOnly();
    ctx.drawImage(image, 0, 0, width, height);
  };
  image.src = dataUrl;
}

function pagesForQuestion(questionId) {
  state.boardPages[questionId] = state.boardPages[questionId] || [""];
  return state.boardPages[questionId];
}

function historyKey() {
  const question = currentPageQuestion();
  return question ? question.id : "";
}

function hasCurrentBoardInk(question = currentPageQuestion()) {
  return Boolean(question && state.boardInkByQuestion[question.id]);
}

function markCurrentBoardInk(question = currentPageQuestion()) {
  if (question) {
    state.boardInkByQuestion[question.id] = true;
    state.boardCompletionVerified = false;
  }
}

function clearCurrentBoardInk(question = currentPageQuestion()) {
  if (question) {
    state.boardInkByQuestion[question.id] = false;
    state.boardCompletionVerified = false;
  }
}

function pushHistory() {
  const key = historyKey();
  if (!key) return;
  state.boardHistories[key] = state.boardHistories[key] || [];
  state.boardHistories[key].push(dom.canvas.toDataURL("image/png"));
  if (state.boardHistories[key].length > 18) state.boardHistories[key].shift();
}

function saveCurrentPage() {
  const question = currentPageQuestion();
  if (!question) return;
  state.transcriptsByQuestion[question.id] = dom.transcriptInput.value;
  if (!dom.canvas.width) return;
  const pages = pagesForQuestion(question.id);
  pages[0] = dom.canvas.toDataURL("image/png");
}

function loadCurrentPage() {
  const question = currentPageQuestion();
  applyBoardHeight(question);
  clearCanvasOnly();
  if (!question) return;
  dom.transcriptInput.value = state.transcriptsByQuestion[question.id] || "";
  dom.transcriptInput.scrollTop = dom.transcriptInput.scrollHeight;
  prefetchVerifiedAnswerKey(question);
  if (dom.boardQuestionImage.src !== question.image) dom.boardQuestionImage.src = question.image;
  const pages = pagesForQuestion(question.id);
  drawDataUrlToCanvas(pages[0] || "");
  applyBoardImageState();
}

async function prefetchVerifiedAnswerKey(question) {
  if (!question?.id || !question.image) return;
  const currentStatus = state.answerKeyStatusByQuestion[question.id];
  if (["loading", "ready"].includes(currentStatus)) return;
  state.answerKeyStatusByQuestion[question.id] = "loading";
  try {
    const response = await fetch("/api/answer-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionImage: question.image,
        problemText: question.problemText || ""
      })
    });
    const result = await response.json().catch(() => ({}));
    state.answerKeyStatusByQuestion[question.id] = response.ok && result.ready ? "ready" : "unverified";
  } catch {
    state.answerKeyStatusByQuestion[question.id] = "unverified";
  }
}

function showBoardStatusPill(text, duration = 1200) {
  dom.recognitionPill.textContent = text;
  dom.recognitionPill.classList.remove("hidden");
  setTimeout(() => dom.recognitionPill.classList.add("hidden"), duration);
}

function expandCurrentBoardPage() {
  const question = currentPageQuestion();
  if (!question || !dom.canvas.width) return false;

  const baseHeight = getBoardBaseHeight();
  const currentHeight = Math.max(dom.blackboard.getBoundingClientRect().height, state.boardHeights[question.id] || baseHeight);
  const nextHeight = Math.min(baseHeight * BOARD_MAX_PAGES, currentHeight + baseHeight);
  if (nextHeight <= currentHeight + 4) {
    showBoardStatusPill("黑板已到最大页数");
    return false;
  }

  const currentImage = dom.canvas.toDataURL("image/png");
  state.boardHeights[question.id] = nextHeight;
  applyBoardHeight(question);
  resizeBoardCanvas({
    existingImage: currentImage,
    preserveExistingSize: true
  });
  saveCurrentPage();
  showBoardStatusPill("已增加一页黑板");
  return true;
}

function resetCurrentBoardPage() {
  const question = currentPageQuestion();
  if (!question) return;
  const baseHeight = getBoardBaseHeight();
  state.boardHeights[question.id] = baseHeight;
  state.boardPages[question.id] = [""];
  clearCurrentBoardInk(question);
  clearTimeout(state.recognitionTimer);
  state.handwritingRequestId += 1;
  ensureBoardImageState(question, true);
  applyBoardHeight(question);
  resizeBoardCanvas({ existingImage: "" });
  clearCanvasOnly();
  applyBoardImageState();
  showBoardStatusPill("当前黑板已清空");
}

function updatePageLabel() {
  const question = currentPageQuestion();
  if (!question) {
    dom.boardPageLabel.textContent = "第 1 页";
    return;
  }
  dom.boardPageLabel.textContent = `第 ${state.boardPageIndex + 1}/${state.lecture.length} 页`;
  dom.lectureProgress.textContent = `第 ${state.boardPageIndex + 1}/${state.lecture.length} 张图`;
  updateImageZoomLabel();
}

function imageRatioForQuestion(question) {
  if (question?.imageWidth && question?.imageHeight) return question.imageHeight / question.imageWidth;
  if (question?.box?.w && question?.box?.h) return question.box.h / question.box.w;
  return 0.62;
}

function ensureBoardImageState(question, reset = false) {
  if (!question) return null;
  const rect = dom.blackboard.getBoundingClientRect();
  const hasMeasuredBoard = Boolean(rect.width);
  const boardWidth = rect.width || 900;
  const boardHeight = rect.height || 560;
  const imageRatio = imageRatioForQuestion(question);
  const preferredWidth = boardWidth * (question.captureMode === "manual-capture" ? 0.76 : 0.7);
  const maxWidthByHeight = (boardHeight - 48) / imageRatio;
  const maxFittingWidth = Math.max(80, Math.min(boardWidth - 48, maxWidthByHeight));
  const baseWidth = Math.min(Math.max(preferredWidth, 360), maxFittingWidth);
  const baseHeight = baseWidth * imageRatio;
  const previousState = state.boardImageStates[question.id];
  if (reset || !previousState || (previousState.createdFromDefault && hasMeasuredBoard)) {
    state.boardImageStates[question.id] = {
      x: 24,
      y: 24,
      baseWidth,
      baseHeight,
      scale: 1,
      createdFromDefault: !hasMeasuredBoard
    };
  } else {
    const imageState = state.boardImageStates[question.id];
    imageState.baseWidth = imageState.baseWidth || baseWidth;
    imageState.baseHeight = imageState.baseHeight || baseHeight;
  }
  clampBoardImageState(state.boardImageStates[question.id]);
  return state.boardImageStates[question.id];
}

function currentBoardImageState() {
  const question = currentPageQuestion();
  if (!question) return null;
  return ensureBoardImageState(question);
}

function currentBoardImageBox() {
  const imageState = currentBoardImageState();
  if (!imageState) return null;
  return {
    x: imageState.x,
    y: imageState.y,
    width: imageState.baseWidth * imageState.scale,
    height: imageState.baseHeight * imageState.scale
  };
}

function clampBoardImageState(imageState) {
  if (!imageState) return;
  const rect = dom.blackboard.getBoundingClientRect();
  const boardWidth = rect.width || 900;
  const boardHeight = rect.height || 560;
  const visible = 72;
  const renderedWidth = imageState.baseWidth * imageState.scale;
  const renderedHeight = imageState.baseHeight * imageState.scale;
  imageState.x = Math.min(boardWidth - visible, Math.max(imageState.x, -renderedWidth + visible));
  imageState.y = Math.min(boardHeight - visible, Math.max(imageState.y, -renderedHeight + visible));
}

function applyBoardImageState() {
  const question = currentPageQuestion();
  const imageState = question ? ensureBoardImageState(question) : null;
  const shouldShow = Boolean(question && imageState);
  dom.boardImageLayer.classList.toggle("hidden", !shouldShow);
  if (!shouldShow) {
    updateImageZoomLabel();
    return;
  }

  dom.boardImageLayer.style.width = `${imageState.baseWidth}px`;
  dom.boardImageLayer.style.transform = `translate(${imageState.x}px, ${imageState.y}px) scale(${imageState.scale})`;
  updateImageZoomLabel();
}

function updateImageZoomLabel() {
  const imageState = currentBoardImageState();
  const shouldShow = Boolean(imageState);
  if (!shouldShow && state.tool === "moveImage") setTool("pen");
  dom.moveImageTool.disabled = !shouldShow;
}

function zoomBoardImage(factor, anchor = null) {
  const imageState = currentBoardImageState();
  if (!imageState) return;
  const oldScale = imageState.scale;
  const nextScale = Math.min(3.5, Math.max(0.45, oldScale * factor));
  const boardRect = dom.blackboard.getBoundingClientRect();
  const zoomAnchor = anchor || {
    x: imageState.x + (imageState.baseWidth * oldScale) / 2,
    y: imageState.y + (imageState.baseHeight * oldScale) / 2
  };
  const anchorX = Math.max(0, Math.min(zoomAnchor.x, boardRect.width));
  const anchorY = Math.max(0, Math.min(zoomAnchor.y, boardRect.height));
  const imagePointX = (anchorX - imageState.x) / oldScale;
  const imagePointY = (anchorY - imageState.y) / oldScale;
  imageState.x = anchorX - imagePointX * nextScale;
  imageState.y = anchorY - imagePointY * nextScale;
  imageState.scale = nextScale;
  clampBoardImageState(imageState);
  applyBoardImageState();
}

function pointerToCanvas(event) {
  const rect = dom.canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

dom.canvas.addEventListener("pointerdown", (event) => {
  if (!currentPageQuestion()) return;
  event.preventDefault();
  dom.canvas.setPointerCapture(event.pointerId);
  if (state.tool === "moveImage") {
    state.imageDragging = true;
    state.lastPoint = pointerToCanvas(event);
    dom.canvas.classList.add("dragging");
    dom.blackboard.classList.add("image-moving");
    return;
  }
  pushHistory();
  state.drawing = true;
  state.strokeHasInk = false;
  state.lastPoint = pointerToCanvas(event);
  ctx.beginPath();
  ctx.moveTo(state.lastPoint.x, state.lastPoint.y);
  dom.studentAvatar.classList.add("speaking");
  dom.studentState.textContent = "正在板书";
});

dom.canvas.addEventListener("pointermove", (event) => {
  if (state.imageDragging && state.tool === "moveImage" && state.lastPoint) {
    const point = pointerToCanvas(event);
    const imageState = currentBoardImageState();
    if (imageState) {
      imageState.x += point.x - state.lastPoint.x;
      imageState.y += point.y - state.lastPoint.y;
      clampBoardImageState(imageState);
      applyBoardImageState();
    }
    state.lastPoint = point;
    return;
  }

  if (!state.drawing || !state.lastPoint) return;
  const point = pointerToCanvas(event);
  const distance = Math.hypot(point.x - state.lastPoint.x, point.y - state.lastPoint.y);
  ctx.globalCompositeOperation = state.tool === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle = state.brushColor;
  ctx.lineWidth = state.tool === "eraser" ? state.brushSize * 4 : state.brushSize;
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  if (state.tool !== "eraser" && distance > 1) {
    state.strokeHasInk = true;
    markCurrentBoardInk();
  }
  if (point.y > dom.canvas.getBoundingClientRect().height - BOARD_EXPAND_EDGE_PX && expandCurrentBoardPage()) {
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }
  state.lastPoint = point;
});

["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
  dom.canvas.addEventListener(eventName, () => {
    if (state.imageDragging) {
      state.imageDragging = false;
      state.lastPoint = null;
      dom.canvas.classList.remove("dragging");
      dom.blackboard.classList.remove("image-moving");
      return;
    }
    if (!state.drawing) return;
    const shouldRecognize = state.strokeHasInk && hasCurrentBoardInk();
    state.drawing = false;
    state.strokeHasInk = false;
    state.lastPoint = null;
    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";
    dom.studentAvatar.classList.remove("speaking");
    dom.studentState.textContent = "继续讲题";
    saveCurrentPage();
    if (shouldRecognize) {
      markUserInput("board");
      scheduleHandwritingRecognition("停笔 6 秒后");
    }
  });
});

dom.penTool.addEventListener("click", () => setTool("pen"));
dom.eraserTool.addEventListener("click", () => setTool("eraser"));
dom.moveImageTool.addEventListener("click", () => setTool("moveImage"));

dom.blackboard.addEventListener(
  "wheel",
  (event) => {
    if (!currentPageQuestion()) return;
    if (state.tool !== "moveImage") {
      const boardRect = dom.blackboard.getBoundingClientRect();
      const y = event.clientY - boardRect.top;
      if (event.deltaY > 0 && y > boardRect.height - BOARD_EXPAND_EDGE_PX * 1.6) {
        event.preventDefault();
        expandCurrentBoardPage();
      }
      return;
    }
    event.preventDefault();
    const point = pointerToCanvas(event);
    zoomBoardImage(event.deltaY > 0 ? 0.9 : 1.1, point);
  },
  { passive: false }
);

function setTool(tool) {
  state.tool = tool;
  if (tool !== "moveImage") {
    state.imageDragging = false;
    state.lastPoint = null;
    dom.canvas.classList.remove("dragging");
  }
  dom.penTool.classList.toggle("active", tool === "pen");
  dom.eraserTool.classList.toggle("active", tool === "eraser");
  dom.moveImageTool.classList.toggle("active", tool === "moveImage");
  dom.canvas.classList.toggle("image-move-cursor", tool === "moveImage");
  dom.blackboard.classList.toggle("image-moving", tool === "moveImage");
  dom.canvas.style.cursor = tool === "pen" ? "crosshair" : tool === "eraser" ? "cell" : "grab";
}

dom.brushSize.addEventListener("input", (event) => {
  state.brushSize = Number(event.target.value);
});

$$(".swatch").forEach((swatch) => {
  swatch.addEventListener("click", () => {
    state.brushColor = swatch.dataset.color;
    $$(".swatch").forEach((item) => item.classList.toggle("active", item === swatch));
    setTool("pen");
  });
});

dom.undoBtn.addEventListener("click", () => {
  const key = historyKey();
  const stack = state.boardHistories[key] || [];
  if (!stack.length) return;
  const previous = stack.pop();
  drawDataUrlToCanvas(previous);
  setTimeout(saveCurrentPage, 60);
  markUserInput("board");
});

dom.clearBoardBtn.addEventListener("click", () => {
  if (!currentPageQuestion()) return;
  pushHistory();
  resetCurrentBoardPage();
  markUserInput("board");
});

dom.prevPageBtn.addEventListener("click", () => {
  if (!state.lecture.length || state.boardPageIndex === 0) return;
  saveCurrentPage();
  state.boardPageIndex -= 1;
  resetQuestionGuideState();
  loadCurrentPage();
  updatePageLabel();
});

dom.nextPageBtn.addEventListener("click", () => {
  if (!state.lecture.length || state.boardPageIndex >= state.lecture.length - 1) return;
  saveCurrentPage();
  state.boardPageIndex += 1;
  resetQuestionGuideState();
  loadCurrentPage();
  updatePageLabel();
});

function resetQuestionGuideState() {
  const now = Date.now();
  setGuideState(GUIDE_STATES.HEURISTIC);
  clearPendingThought();
  clearTimeout(state.recognitionTimer);
  state.lastSpeechAt = now;
  state.lastBoardWriteAt = 0;
  state.lastUserInputAt = now;
  state.lastEncourageAt = now;
  state.normalSpeechCount = 0;
  state.stuckCount = 0;
  state.currentQuestionCompleted = false;
  state.hasExplicitFinalAnswer = false;
  state.pendingFinalAnswerText = "";
  state.pendingLianQuestion = null;
  clearIssueTracking();
  clearSilenceFollowup();
  state.activeGuideRequestId += 1;
  state.handwritingRequestId += 1;
  state.awaitingFinalAnswer = false;
  state.finalAnswerVerified = false;
  state.verifiedFinalAnswerText = "";
  state.boardCompletionVerified = false;
  state.completionCheckInProgress = false;
  state.finalAnswerRequestId += 1;
  state.silenceGuidePending = false;
  state.latestHandwritingResult = null;
  state.lastHandwritingIssueKey = "";
  state.lastHandwritingSuccessKey = "";
  state.lastHandwritingUnclearKey = "";
  dom.eventLog.innerHTML = "";
  state.logItemsByKey.clear();
  dom.recognitionPill.classList.add("hidden");
  dom.lianState.textContent = guideIdleText();
  dom.lianBubble.textContent = pickPrompt("question-change", [
    "换到这道题了。你先按自己的思路讲，我会先听。",
    "我们来看下一道。你先说说自己准备从哪里开始。",
    "题目换好了，你先讲你的想法，我先跟着听。",
    "现在讲这道题，你不用急着算，先把思路说出来。"
  ]);
  if (state.isListening) resetSilenceTimer();
}

function scheduleHandwritingRecognition(reason) {
  clearTimeout(state.recognitionTimer);
  if (!hasCurrentBoardInk()) return;
  if (state.teachSessionPaused) {
    state.resumeHandwritingAfterNavigation = true;
    return;
  }
  if (state.isListening) {
    const quietFor = Date.now() - (state.lastSpeechAt || 0);
    if (quietFor < SPEECH_QUIET_BEFORE_BOARD_MS) {
      state.recognitionTimer = setTimeout(
        () => scheduleHandwritingRecognition(reason),
        SPEECH_QUIET_BEFORE_BOARD_MS - quietFor + 80
      );
      return;
    }
  }
  if (Date.now() < state.handwritingDisabledUntil) {
    showPausedHandwritingNotice();
    return;
  }
  state.recognitionTimer = setTimeout(() => runHandwritingRecognition(reason), BOARD_RECOGNITION_DELAY_MS);
}

function showPausedHandwritingNotice() {
  const now = Date.now();
  dom.recognitionPill.textContent = state.lastHandwritingServiceError || "板书识别暂时暂停";
  dom.recognitionPill.classList.remove("hidden");
  setTimeout(() => dom.recognitionPill.classList.add("hidden"), 1400);
  if (now - state.lastHandwritingPauseNoticeAt > 30000) {
    addLog("提示", `${dom.recognitionPill.textContent}，暂时不再自动重试。`);
    state.lastHandwritingPauseNoticeAt = now;
  }
}

function explainHandwritingError(error) {
  const message = String(error?.message || "");
  const code = String(error?.code || "");
  if (code === "insufficient_quota" || /quota|billing|额度不足|配额/.test(message)) {
    return {
      pill: "识别额度不足",
      log: "Qwen API 额度不足，板书识别已暂停。换成有额度的 Qwen API key 后再刷新页面即可继续。",
      pauseMs: 10 * 60 * 1000
    };
  }
  if (code === "invalid_api_key" || code === "access_denied" || /api key|authentication|认证|鉴权|访问被拒绝/i.test(message)) {
    return {
      pill: "识别授权失败",
      log: "Qwen API key 无法通过认证，请检查 .env 里的 Qwen_api_key、QWEN_API_KEY 或 DASHSCOPE_API_KEY。",
      pauseMs: 10 * 60 * 1000
    };
  }
  if (/valid image|image data|图片/.test(message)) {
    return {
      pill: "图片格式需重试",
      log: "传给识别接口的图片没有被接受，我已保留板书内容，下一次停笔会重新生成截图再试。",
      pauseMs: 0
    };
  }
  if (/Failed to fetch|NetworkError|fetch/i.test(message)) {
    return {
      pill: "识别服务未连接",
      log: "本地识别服务没有连上，请从 http://127.0.0.1:4173/index.html 打开页面。",
      pauseMs: 60 * 1000
    };
  }
  return {
    pill: "识别暂时失败",
    log: message ? `接口返回：${message}` : "这次识别没有成功返回，板书内容已先保存。",
    pauseMs: 0
  };
}

async function runHandwritingRecognition(reason) {
  const question = currentPageQuestion();
  if (state.teachSessionPaused) {
    state.resumeHandwritingAfterNavigation = Boolean(question && hasCurrentBoardInk(question));
    return;
  }
  if (state.currentQuestionCompleted || !question || !dom.canvas.width || !hasCurrentBoardInk(question)) return;
  if (state.isListening && Date.now() - (state.lastSpeechAt || 0) < SPEECH_QUIET_BEFORE_BOARD_MS) {
    scheduleHandwritingRecognition(reason);
    return;
  }
  if (Date.now() < state.handwritingDisabledUntil) {
    showPausedHandwritingNotice();
    return;
  }

  const requestId = ++state.handwritingRequestId;
  const questionId = question.id;
  saveCurrentPage();
  dom.recognitionPill.textContent = "板书识别中";
  dom.recognitionPill.classList.remove("hidden");

  try {
    const result = normalizeHandwritingResult(await requestHandwritingAnalysis(question, reason));
    if (requestId !== state.handwritingRequestId || currentPageQuestion()?.id !== questionId) return;
    if (state.isListening && Date.now() - (state.lastSpeechAt || 0) < SPEECH_QUIET_BEFORE_BOARD_MS) {
      scheduleHandwritingRecognition(reason);
      return;
    }
    state.latestHandwritingResult = result;
    state.handwritingResults[question.id] = result;
    state.boardCompletionVerified = isBoardCompletionVerified(result);

    if (isIncompleteHandwritingIssue(result)) {
      dom.recognitionPill.textContent = "等你写完";
      maybeSpeakHandwritingGuidance(result);
    } else if (isHandwritingCalculationWrong(result)) {
      dom.recognitionPill.textContent = "发现需检查";
      maybeSpeakHandwritingGuidance(result);
    } else if (isHandwritingCalculationCorrect(result)) {
      dom.recognitionPill.textContent = "板书看过了";
      clearIssueTracking();
      if (state.guideState === GUIDE_STATES.MICRO_HINT) setGuideState(GUIDE_STATES.HEURISTIC);
      maybeSpeakHandwritingSuccess(result);
    } else if (shouldAskForHandwritingConfirmation(result)) {
      dom.recognitionPill.textContent = "需要确认";
      maybeSpeakHandwritingUnclear(result);
    } else {
      dom.recognitionPill.textContent = result.isRelevant ? "板书看过了" : "板书较少";
      if (result.isRelevant) {
        clearIssueTracking();
        if (state.guideState === GUIDE_STATES.MICRO_HINT) setGuideState(GUIDE_STATES.HEURISTIC);
      }
    }
  } catch (error) {
    if (requestId !== state.handwritingRequestId || currentPageQuestion()?.id !== questionId) return;
    console.warn("Handwriting recognition fallback:", error);
    const info = explainHandwritingError(error);
    dom.recognitionPill.textContent = info.pill;
    addLog("提示", info.log);
    state.lastHandwritingServiceError = info.pill;
    if (info.pauseMs) state.handwritingDisabledUntil = Date.now() + info.pauseMs;
  } finally {
    setTimeout(() => dom.recognitionPill.classList.add("hidden"), 1200);
  }
}

async function requestHandwritingAnalysis(question, reason) {
  const boardImage = await createCurrentBoardSnapshot();
  const boardOnlyImage = await createCurrentBoardOnlySnapshot();
  const response = await fetch("/api/handwriting", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionImage: question.image,
      boardOnlyImage,
      boardImage,
      reason,
      transcript: dom.transcriptInput.value.trim(),
      problemText: question.problemText || "",
      knowledgePoints: question.knowledgePoints || []
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || "板书识别失败");
    error.code = result.code || "";
    error.status = response.status;
    throw error;
  }
  state.handwritingDisabledUntil = 0;
  state.lastHandwritingServiceError = "";
  return result;
}

async function verifyCurrentBoardForCompletion(question) {
  if (!question || !hasCurrentBoardInk(question)) {
    state.boardCompletionVerified = false;
    return {
      verified: false,
      result: null,
      guidance: "黑板上还没有可核验的步骤。请写下一个关键关系式、公式或计算步骤，再点一次我讲完了。"
    };
  }

  const requestId = ++state.handwritingRequestId;
  const questionId = question.id;
  saveCurrentPage();
  dom.recognitionPill.textContent = "正在检查板书步骤";
  dom.recognitionPill.classList.remove("hidden");

  const result = normalizeHandwritingResult(
    await requestHandwritingAnalysis(question, "完成讲解前检查：判断板书是否至少包含一个与本题相关且正确的关键步骤")
  );
  if (requestId !== state.handwritingRequestId || currentPageQuestion()?.id !== questionId) {
    return { verified: false, stale: true, result: null, guidance: "题目已经切换，本次板书检查已取消。" };
  }

  state.latestHandwritingResult = result;
  state.handwritingResults[question.id] = result;
  const verified = isBoardCompletionVerified(result);
  state.boardCompletionVerified = verified;
  dom.recognitionPill.textContent = verified ? "板书步骤已确认" : "板书还需一个正确步骤";
  return {
    verified,
    result,
    guidance: verified ? "" : getBoardCompletionGuidance(result)
  };
}

async function createCurrentBoardSnapshot() {
  const question = currentPageQuestion();
  if (!question) return getBoardImageForGuide();
  saveCurrentPage();
  const pages = pagesForQuestion(question.id);
  return composeBoardSnapshot(pages[0] || getBoardImageForGuide(), question.image, getSnapshotImageState(question.id));
}

async function createCurrentBoardOnlySnapshot() {
  const question = currentPageQuestion();
  if (!question) return getBoardImageForGuide();
  saveCurrentPage();
  const pages = pagesForQuestion(question.id);
  return composeStrokeOcrSnapshot(pages[0] || getBoardImageForGuide());
}

async function composeStrokeOcrSnapshot(strokesDataUrl) {
  if (!strokesDataUrl) return "";
  const strokes = await loadImage(strokesDataUrl);
  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / strokes.naturalWidth);
  const width = Math.max(1, Math.round(strokes.naturalWidth * scale));
  const height = Math.max(1, Math.round(strokes.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ocrCtx = canvas.getContext("2d");
  ocrCtx.fillStyle = "#ffffff";
  ocrCtx.fillRect(0, 0, width, height);

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.clearRect(0, 0, width, height);
  tempCtx.drawImage(strokes, 0, 0, width, height);
  const imageData = tempCtx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha > 12) {
      data[index] = 18;
      data[index + 1] = 26;
      data[index + 2] = 24;
      data[index + 3] = 255;
    } else {
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = 255;
    }
  }
  ocrCtx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function isIncompleteHandwritingIssue(result) {
  const text = [
    result.calculationStatus,
    result.issueType,
    result.issueSummary,
    result.expectedNextStep,
    result.guidance,
    result.detectedWriting
  ]
    .filter(Boolean)
    .join(" ");
  return /incomplete|不完整|没写完|未写完|还没|未完成|缺少|缺项|没有看到|只写出|继续写|补全|补上|放进/.test(text);
}

function extractVariableAssignments(text) {
  const assignments = new Map();
  const source = String(text || "")
    .replace(/[＝]/g, "=")
    .replace(/[−－]/g, "-");
  const pattern = /([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?)/g;
  let match;
  while ((match = pattern.exec(source))) {
    const variable = match[1].toLowerCase();
    const value = match[2].replace(/\s+/g, "");
    if (!assignments.has(variable)) assignments.set(variable, new Set());
    assignments.get(variable).add(value);
  }
  return assignments;
}

function hasAssignmentConflict(result) {
  const studentAssignments = extractVariableAssignments([result.detectedWriting, result.mathExpression].filter(Boolean).join(" "));
  const checkAssignments = extractVariableAssignments(
    [
      result.calculationCheck,
      result.issueSummary,
      result.expectedNextStep,
      result.guidance,
      result.positiveFeedback
    ]
      .filter(Boolean)
      .join(" ")
  );

  for (const [variable, studentValues] of studentAssignments.entries()) {
    const checkedValues = checkAssignments.get(variable);
    if (!checkedValues?.size) continue;
    const hasSameValue = [...studentValues].some((value) => checkedValues.has(value));
    if (!hasSameValue) return true;
  }
  return false;
}

function hasContradictoryCorrectSignal(result) {
  const text = [
    result.detectedWriting,
    result.mathExpression,
    result.calculationCheck,
    result.issueSummary,
    result.expectedNextStep,
    result.guidance,
    result.positiveFeedback
  ]
    .filter(Boolean)
    .join(" ");
  return /不成立|算错|结论错|答案错|应为|应该是|应得到|应推出|不是|错误|检查/.test(text);
}

function normalizeHandwritingResult(result) {
  if (!result) return result;
  const confidence = Number(result.confidence);
  const normalized = {
    ...result,
    boardComplete: result.boardComplete === true,
    missingBoardContent: String(result.missingBoardContent || "").trim(),
    confidence: Number.isFinite(confidence) ? confidence : 0
  };

  if (normalized.calculationStatus === "wrong") {
    return {
      ...normalized,
      hasPossibleIssue: true,
      issueType: normalized.issueType && normalized.issueType !== "none" ? normalized.issueType : "wrong_number",
      issueSummary: normalized.issueSummary || "板书中的计算或结论需要检查。",
      expectedNextStep: normalized.expectedNextStep || "回到前面的关系式，重新核对等号后的结果。",
      guidance: normalized.guidance || "我们一起检查一下最后这个结果，按前面的关系式再算一遍。",
      positiveFeedback: "",
      boardComplete: false,
      missingBoardContent: normalized.missingBoardContent || "板书中的计算或最终结论还需要修正。",
      confidence: Math.max(normalized.confidence, 0.65)
    };
  }

  if (normalized.calculationStatus !== "correct") return normalized;
  if (!hasAssignmentConflict(normalized) && !hasContradictoryCorrectSignal(normalized)) {
    return {
      ...normalized,
      hasPossibleIssue: false,
      issueType: "none",
      issueSummary: "",
      expectedNextStep: normalized.expectedNextStep || "",
      guidance: "",
      confidence: Math.max(normalized.confidence, 0.55)
    };
  }

  return {
    ...normalized,
    calculationStatus: "wrong",
    hasPossibleIssue: true,
    issueType: normalized.issueType && normalized.issueType !== "none" ? normalized.issueType : "wrong_number",
    issueSummary: normalized.issueSummary || "板书中的结论和前面的比例式不一致。",
    expectedNextStep: normalized.expectedNextStep || "按比例式交叉相乘，重新算等号后的 x 值。",
    guidance: normalized.guidance || "我们一起检查一下最后这个 x 值，按前面的比例式交叉相乘再算一遍。",
    positiveFeedback: "",
    boardComplete: false,
    missingBoardContent: normalized.missingBoardContent || "板书中的计算与最终结论还没有一致。",
    confidence: Math.max(normalized.confidence, 0.72)
  };
}

function isHandwritingCalculationWrong(result) {
  return result?.calculationStatus === "wrong" || (result?.hasPossibleIssue && result.confidence >= 0.45);
}

function isHandwritingCalculationCorrect(result) {
  return (
    result?.calculationStatus === "correct" &&
    result.confidence >= 0.5 &&
    !hasAssignmentConflict(result) &&
    !hasContradictoryCorrectSignal(result)
  );
}

function isBoardCompletionVerified(result) {
  return Boolean(
    result?.answerVerification === "double-verified" &&
    result?.boardComplete === true &&
    result?.isRelevant === true &&
    result?.calculationStatus === "correct" &&
    Number(result?.confidence) >= 0.6 &&
    !isIncompleteHandwritingIssue(result) &&
    !hasAssignmentConflict(result) &&
    !hasContradictoryCorrectSignal(result)
  );
}

function getBoardCompletionGuidance(result) {
  if (!result) return "我还没能确认板书步骤。请在黑板上写下一个关键关系式、公式或计算步骤，再点一次我讲完了。";
  if (isHandwritingCalculationWrong(result)) {
    return result.guidance || result.issueSummary || "你的口头答案已经核对过了，但板书里还有一步需要检查。先把板书中的计算和最终结论改一致。";
  }
  if (result.calculationStatus === "unclear") {
    return "答案已经核对过了，不过板书里的关键步骤我还没看清。请把其中一个关系式或计算步骤写清楚，再点一次我讲完了。";
  }
  const missing = String(result.missingBoardContent || result.expectedNextStep || "").trim();
  return missing
    ? `答案已经核对正确，板书还需要一个可核验的步骤：${missing}。补上后再点一次我讲完了。`
    : "答案已经核对正确，黑板上再留下一个可核验的正确步骤，就可以结束这道题。";
}

function maybeSpeakHandwritingSuccess(result) {
  if (!isHandwritingCalculationCorrect(result)) return false;
  if (isIncompleteHandwritingIssue(result)) return false;

  const now = Date.now();
  const successKey = `${result.mathExpression || ""}:${result.calculationCheck || result.detectedWriting || ""}`
    .replace(/\s+/g, "")
    .slice(0, 120);
  if (successKey && successKey === state.lastHandwritingSuccessKey && now - state.lastHandwritingSuccessAt < 45000) return false;

  state.lastHandwritingSuccessKey = successKey;
  state.lastHandwritingSuccessAt = now;
  const feedback =
    result.positiveFeedback ||
    (result.mathExpression
      ? pickPrompt("handwriting-success-expression", [
          `这一步能算通，${result.mathExpression} 先保留下来。`,
          `这个关系式是顺的，${result.mathExpression} 可以先记在这里。`,
          `你这一步算得通，${result.mathExpression} 先保留着。`
        ])
      : pickPrompt("handwriting-success", [
          "这一步的关系对上了，先保留下来。",
          "这里的思路是通的，可以接着往下讲。",
          "这一步没有问题，你继续按这个方向说。"
        ]));
  lianSpeak(feedback);
  return true;
}

function shouldAskForHandwritingConfirmation(result) {
  if (!result) return false;
  if (!hasCurrentBoardInk()) return false;
  if (isIncompleteHandwritingIssue(result)) return false;
  if (isHandwritingCalculationWrong(result) || isHandwritingCalculationCorrect(result)) return false;

  const hasRecognizedContent = [
    result.detectedWriting,
    result.mathExpression,
    result.calculationCheck,
    result.issueSummary,
    result.expectedNextStep
  ].some((value) => String(value || "").trim());
  const looksMathRelated = /x|y|=|＝|\/|分之|比例|方程|角|度|面积|周长|半径|直径|\d/.test(
    [result.detectedWriting, result.mathExpression, result.calculationCheck].filter(Boolean).join(" ")
  );

  return Boolean(result.isRelevant || hasRecognizedContent || looksMathRelated);
}

function maybeSpeakHandwritingUnclear(result) {
  if (!shouldAskForHandwritingConfirmation(result)) return false;

  const now = Date.now();
  const unclearKey = [
    result.calculationStatus,
    result.detectedWriting,
    result.mathExpression,
    result.calculationCheck
  ]
    .filter(Boolean)
    .join(":")
    .replace(/\s+/g, "")
    .slice(0, 100) || "recent-board";

  if (unclearKey === state.lastHandwritingUnclearKey && now - state.lastHandwritingUnclearAt < 45000) return false;

  state.lastHandwritingUnclearKey = unclearKey;
  state.lastHandwritingUnclearAt = now;

  const hasFormulaHint = /x|y|=|＝|\/|分之|比例|方程|\d/.test(
    [result.detectedWriting, result.mathExpression].filter(Boolean).join(" ")
  );
  const speech = hasFormulaHint
    ? pickPrompt("handwriting-unclear-formula", [
        "我看到你在写关系式，但最后一步还没看清。把最后一行读给我听，我帮你核一下。",
        "前面的关系式我看到了，最后一行有点模糊。你把它读出来，我们一起确认。",
        "你的式子已经写到最后了，最后一步我没看全。说说那一行是怎么写的。"
      ])
    : pickPrompt("handwriting-unclear", [
        "这次板书有一部分没看清。你把刚写的等式或结果读给我听吧。",
        "我还没完全看清刚才的板书，你说一下最后写的内容，我接着帮你判断。",
        "板书里有一处看得不太完整，你把最后一步念给我听。"
      ]);
  lianSpeak(speech, { dedupeKey: `handwriting-unclear:${unclearKey}` });
  return true;
}

function maybeSpeakHandwritingGuidance(result) {
  const now = Date.now();
  if (isIncompleteHandwritingIssue(result)) {
    state.lastHandwritingIssueKey = `incomplete:${result.issueSummary || result.detectedWriting || ""}`;
    state.lastHandwritingGuideAt = now;
    dom.recognitionPill.textContent = "等你写完";
    return false;
  }

  const issue = registerPossibleIssue(result);
  if (issue.escalated) return true;
  if (issue.duplicate) return false;

  state.lastHandwritingIssueKey = issue.issueKey;
  state.lastHandwritingGuideAt = now;
  const guidance =
    result.guidance ||
    pickPrompt("handwriting-issue", [
      "这里先停一下，我们检查刚写的数量关系。",
      "先回头看一眼这一步，刚才的数量关系需要再核一下。",
      "我们先把这一行检查一遍，看看各个量是不是对应得上。"
    ]);
  lianSpeak(guidance, { dedupeKey: `handwriting-issue:${issue.issueKey}` });
  return true;
}

function addLog(title, text, options = {}) {
  const key = options.key || "";
  if (key) {
    const existing = state.logItemsByKey.get(key);
    if (existing?.isConnected) {
      existing.innerHTML = `<strong>${escapeHTML(title)}</strong>${escapeHTML(text)}`;
      dom.eventLog.prepend(existing);
      return existing;
    }
  }

  const item = document.createElement("div");
  item.className = "log-item";
  if (key) {
    item.dataset.logKey = key;
    state.logItemsByKey.set(key, item);
  }
  item.innerHTML = `<strong>${escapeHTML(title)}</strong>${escapeHTML(text)}`;
  dom.eventLog.prepend(item);
  return item;
}

dom.muteBtn.addEventListener("click", () => {
  state.isMuted = !state.isMuted;
  dom.muteBtn.classList.toggle("active", state.isMuted);
  dom.muteBtn.title = state.isMuted ? "已静音" : "静音模式";
  if (state.isMuted && window.speechSynthesis) window.speechSynthesis.cancel();
});

dom.micBtn.addEventListener("click", toggleListening);
dom.sendTranscriptBtn.addEventListener("click", () => {
  const text = dom.transcriptInput.value.trim();
  if (!text) {
    lianSpeak(
      pickPrompt("first-thought", [
        "先说说你的思路就好，比如题目给了哪些条件。",
        "你可以先从已知条件讲起，不用马上算答案。",
        "先告诉我你看到了什么条件，我们一步一步来。",
        "从题目给出的信息开始说吧，我会跟着你一起理。"
      ])
    );
    return;
  }
  handleStudentSpeech(text);
});

function getSpeechRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;
  if (state.speechRecognition) return state.speechRecognition;

  const recognition = new Recognition();
  recognition.lang = "zh-CN";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    if (state.teachSessionPaused) {
      state.isListening = false;
      state.ignoreNextRecognitionEnd = true;
      try {
        recognition.stop();
      } catch {
        state.ignoreNextRecognitionEnd = false;
      }
      return;
    }
    const wasListening = state.isListening;
    state.isListening = true;
    state.resumeListeningAfterNavigation = false;
    clearTimeout(state.recognitionResumeTimer);
    state.recognitionResumeTimer = null;
    dom.micBtn.innerHTML = `${iconMap.mic}停止收听`;
    dom.studentAvatar.classList.remove("speaking");
    dom.studentState.textContent = "正在收听";
    startSpeechNoResultTimer();
    if (!wasListening || !state.lastSpeechAt) state.lastSpeechAt = Date.now();
    resetSilenceTimer(false);
  };

  recognition.onaudiostart = () => {
    if (state.teachSessionPaused) return;
    dom.studentState.textContent = "正在收听";
    startSpeechNoResultTimer();
  };

  recognition.onsoundstart = () => {
    if (state.teachSessionPaused) return;
    dom.studentState.textContent = "听到声音";
  };

  recognition.onspeechstart = () => {
    if (state.teachSessionPaused) return;
    clearTimeout(state.recognitionTimer);
    dom.studentAvatar.classList.add("speaking");
    dom.studentState.textContent = "正在讲题";
  };

  recognition.onresult = (event) => {
    if (state.teachSessionPaused) return;
    let finalText = "";
    let interimText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0].transcript.trim();
      if (event.results[index].isFinal) finalText += text;
      else interimText += text;
    }
    if (interimText || finalText) {
      stopSpeechNoResultTimer();
      clearTimeout(state.recognitionTimer);
      state.lastSpeechAt = Date.now();
    }
    if (interimText) {
      dom.studentAvatar.classList.add("speaking");
      dom.studentState.textContent = "正在讲题";
      showSpeechDraft(interimText);
    }
    if (finalText) {
      void handleRecognizedSpeech(finalText);
      resetSilenceTimer();
    }
  };

  recognition.onerror = (event) => {
    if (state.teachSessionPaused) return;
    if (event.error === "no-speech") {
      dom.studentAvatar.classList.remove("speaking");
      dom.studentState.textContent = "安静中";
      dom.lianState.textContent = guideIdleText();
      resetSilenceTimer(false);
      return;
    }

    if (event.error === "aborted") return;

    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      state.isListening = false;
      state.micPermissionGranted = false;
      clearTimeout(state.silenceTimer);
      dom.micBtn.innerHTML = `${iconMap.mic}开始收听`;
      lianSpeak(
        pickPrompt("microphone-permission", [
          "请在浏览器弹窗里允许使用麦克风，允许后我就能继续听你讲。",
          "麦克风还没有获得许可，请点击浏览器里的允许，我会接着听。",
          "把麦克风权限打开就好，允许之后这个页面会继续收听。"
        ])
      );
      return;
    }

    if (event.error === "audio-capture") {
      state.isListening = false;
      clearTimeout(state.silenceTimer);
      dom.micBtn.innerHTML = `${iconMap.mic}开始收听`;
      lianSpeak(
        pickPrompt("microphone-missing", [
          "我还没有找到可用的麦克风，你检查一下设备后再试试。",
          "麦克风暂时没有连上，确认设备后，再点一次开始收听。",
          "我这边还没听到麦克风，你看看设备连接是否正常。"
        ])
      );
      return;
    }

    dom.studentState.textContent = "正在收听";
    lianSilentNotice("语音识别暂时不稳定。我还在听，你也可以继续讲。", {
      bubble: false,
      log: false,
      key: "speech-recognition-unstable"
    });
  };

  recognition.onend = () => {
    stopSpeechNoResultTimer();
    if (state.ignoreNextRecognitionEnd) {
      state.ignoreNextRecognitionEnd = false;
      state.isListening = false;
      dom.studentAvatar.classList.remove("speaking");
      if (state.teachSessionPaused) {
        dom.studentState.textContent = "讲解已暂停";
        dom.micBtn.innerHTML = `${iconMap.mic}已暂停`;
      } else if (state.resumeListeningAfterNavigation) {
        state.recognitionResumeTimer = setTimeout(() => resumeRecognitionAfterNavigation(), 120);
      }
      return;
    }
    const draft = clearSpeechDraft();
    if (draft) {
      void handleRecognizedSpeech(draft);
      resetSilenceTimer();
    }
    dom.studentAvatar.classList.remove("speaking");
    if (state.isListening) {
      dom.studentState.textContent = "正在收听";
      try {
        recognition.start();
      } catch {
        state.isListening = false;
        clearTimeout(state.silenceTimer);
        dom.studentState.textContent = "准备讲题";
        dom.micBtn.innerHTML = `${iconMap.mic}开始收听`;
      }
      return;
    }

    dom.studentState.textContent = "准备讲题";
    dom.micBtn.innerHTML = `${iconMap.mic}开始收听`;
  };

  state.speechRecognition = recognition;
  return recognition;
}

async function ensureMicrophonePermission() {
  if (state.micPermissionGranted || !navigator.mediaDevices?.getUserMedia) return true;
  if (state.micPermissionPending) return false;

  state.micPermissionPending = true;
  dom.micBtn.disabled = true;
  dom.studentState.textContent = "等待麦克风授权";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    state.micPermissionGranted = true;
    dom.studentState.textContent = "已允许麦克风";
    return true;
  } catch {
    state.micPermissionGranted = false;
    lianSpeak(
      pickPrompt("microphone-permission", [
        "请在浏览器弹窗里允许使用麦克风，允许后我就能继续听你讲。",
        "麦克风还没有获得许可，请点击浏览器里的允许，我会接着听。",
        "把麦克风权限打开就好，允许之后这个页面会继续收听。"
      ])
    );
    return false;
  } finally {
    state.micPermissionPending = false;
    dom.micBtn.disabled = false;
  }
}

async function toggleListening() {
  const recognition = getSpeechRecognition();
  if (!recognition) {
    lianSpeak(
      pickPrompt("speech-unsupported", [
        "这个浏览器暂时不能直接识别语音，你也可以先用下面的文本框讲解。",
        "语音识别暂时不可用，把思路输入下面的文本框也可以继续。",
        "如果浏览器还不支持语音，就先把你的讲解写在下面吧。"
      ])
    );
    return;
  }

  if (state.isListening) {
    stopSpeechNoResultTimer();
    const draft = clearSpeechDraft();
    if (draft) {
      void handleRecognizedSpeech(draft);
    }
    state.isListening = false;
    state.silenceGuidePending = false;
    clearSilenceFollowup();
    clearTimeout(state.silenceTimer);
    recognition.stop();
  } else {
    const allowed = await ensureMicrophonePermission();
    if (!allowed) return;
    dom.micBtn.disabled = true;
    dom.studentState.textContent = "准备收听";
    await lianSpeak(pickPrompt("listening-start", LISTENING_START_PROMPTS), {
      logKey: "listening-start-prompt",
      allowRepeat: true
    });
    dom.micBtn.disabled = false;
    try {
      recognition.start();
    } catch {
      lianSpeak(
        pickPrompt("microphone-starting", [
          "麦克风还在准备，你稍等一下再点也可以。",
          "我还没准备好开始收听，等一会儿再试试。",
          "麦克风马上就好，稍等片刻再开始吧。"
        ])
      );
    }
  }
}

function stopListeningAfterSessionCompletion() {
  stopSpeechNoResultTimer();
  clearTimeout(state.recognitionTimer);
  clearTimeout(state.silenceTimer);
  clearPendingThought();
  clearSilenceFollowup();
  state.silenceGuidePending = false;
  state.isListening = false;
  clearSpeechDraft();
  try {
    state.speechRecognition?.stop();
  } catch {
    // Recognition may already be stopped by the browser.
  }
  dom.micBtn.innerHTML = `${iconMap.mic}开始收听`;
  dom.studentAvatar.classList.remove("speaking");
  dom.studentState.textContent = "讲解完成";
}

function appendTranscript(text) {
  const cleaned = cleanSpeechText(text);
  if (!cleaned) return;
  const prefix = dom.transcriptInput.value.trim() ? "\n" : "";
  dom.transcriptInput.value += `${prefix}${cleaned}`;
  dom.transcriptInput.scrollTop = dom.transcriptInput.scrollHeight;
}

function showSpeechDraft(text) {
  const draft = cleanSpeechText(text);
  if (!draft) return;
  if (!state.speechDraftText) state.speechDraftBase = dom.transcriptInput.value;
  state.speechDraftText = draft;
  const base = state.speechDraftBase || "";
  const prefix = base.trim() ? "\n" : "";
  dom.transcriptInput.value = `${base}${prefix}${draft}`;
  dom.transcriptInput.scrollTop = dom.transcriptInput.scrollHeight;
}

function clearSpeechDraft() {
  if (!state.speechDraftText) return "";
  const draft = state.speechDraftText;
  dom.transcriptInput.value = state.speechDraftBase || "";
  state.speechDraftText = "";
  state.speechDraftBase = "";
  return draft;
}

function normalizeMathSpeechText(text) {
  let normalized = normalizeQuestionAwareSpeechText(cleanSpeechText(text));
  if (!/等于|方程|等式|比例|比值|未知数|关系式|列式|结果|答案|x|y|m|n/i.test(normalized)) return normalized;

  normalized = normalized
    .replace(/爱克斯|埃克斯|艾克斯/g, "x")
    .replace(/歪(?=等于|加|减|乘|除|的值|是|为|得|关系)/g, "y")
    .replace(/嗯(?=等于|加|减|乘|除|的值|是|为|得)/g, "m")
    .replace(/恩(?=等于|加|减|乘|除|的值|是|为|得)/g, "n");
  return normalizeQuestionAwareSpeechText(normalized).replace(/\s+/g, " ").trim();
}

function normalizeQuestionAwareSpeechText(text) {
  let value = String(text || "");
  const question = currentPageQuestion();
  const context = `${question?.title || ""} ${question?.problemText || ""} ${(question?.knowledgePoints || []).join(" ")}`;

  if (/上方相邻|下方|箭头|左数|右数/.test(`${value} ${context}`)) {
    value = value
      .replace(/左束/g, "左数")
      .replace(/右束支/g, "右数之差")
      .replace(/右束/g, "右数")
      .replace(/总数和右数/g, "左数和右数")
      .replace(/总数和右数之差/g, "左数和右数之差")
      .replace(/相邻的数和/g, "相邻的左数和")
      .replace(/相邻数和/g, "相邻的左数和")
      .replace(/下方的树/g, "下方的数")
      .replace(/下方的书/g, "下方的数")
      .replace(/共同只向/g, "共同指向")
      .replace(/共同纸上/g, "共同指向");
  }

  return value;
}

function replaceLastTranscriptSegment(originalText, correctedText) {
  const current = dom.transcriptInput.value;
  if (current === originalText) {
    dom.transcriptInput.value = correctedText;
  } else if (current.endsWith(`\n${originalText}`)) {
    dom.transcriptInput.value = `${current.slice(0, -originalText.length)}${correctedText}`;
  } else {
    return false;
  }
  dom.transcriptInput.scrollTop = dom.transcriptInput.scrollHeight;
  return true;
}

async function correctLatestTranscript(text, options = {}) {
  const question = currentPageQuestion();
  if (!question || text.length < 4) return text;
  const requestId = ++state.transcriptCorrectionRequestId;

  try {
    const response = await fetch("/api/transcript-correct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionImage: question.image,
        text,
        problemText: question.problemText || question.title || "",
        knowledgePoints: question.knowledgePoints || [],
        transcript: options.transcript || dom.transcriptInput.value.trim()
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || requestId !== state.transcriptCorrectionRequestId || currentPageQuestion()?.id !== question.id) return text;
    const correctedText = normalizeMathSpeechText(String(result.correctedText || text).trim());
    if (correctedText && correctedText !== text) {
      replaceLastTranscriptSegment(text, correctedText);
      return correctedText;
    }
    return text;
  } catch {
    // Browser ASR text remains usable when the optional correction service is unavailable.
    return text;
  }
}

function commitSpeechText(text) {
  clearSpeechDraft();
  const finalText = normalizeMathSpeechText(text);
  if (!finalText) return;
  appendTranscript(finalText);
  void correctLatestTranscript(finalText);
}

async function commitSpeechTextWithCorrection(text) {
  clearSpeechDraft();
  const finalText = normalizeMathSpeechText(text);
  if (!finalText) return "";
  appendTranscript(finalText);
  return await correctLatestTranscript(finalText);
}

async function handleRecognizedSpeech(text) {
  clearSpeechDraft();
  const immediateText = normalizeMathSpeechText(text);
  if (!immediateText) return;
  appendTranscript(immediateText);

  // A direct question must not wait for the optional transcript-correction request.
  if (isDirectHelpRequest(immediateText) || state.awaitingFinalAnswer) {
    handleStudentSpeech(immediateText);
    void correctLatestTranscript(immediateText);
    return;
  }

  const spokenText = await correctLatestTranscript(immediateText);
  if (spokenText) handleStudentSpeech(spokenText);
}

function cleanSpeechText(text) {
  return String(text || "")
    .replace(/[，,。！？!?；;：:]/g, " ")
    .replace(/^(呃+|额+|嗯+|啊+|哦+|唔+|呐+|那个|这个|就是|然后呢|对吧|是不是)+/g, "")
    .replace(/(^|\s)(呃+|额+|嗯+|啊+|哦+|唔+|呐+|那个|这个|就是|然后呢|对吧|是不是)(?=\s|$)/g, " ")
    .replace(/[呃额嗯唔]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function startSpeechNoResultTimer() {
  stopSpeechNoResultTimer();
  state.speechNoResultTimer = setTimeout(() => {
    if (!state.isListening || state.speechDraftText) return;
    dom.studentState.textContent = "还没有转成文字";
  }, 4500);
}

function stopSpeechNoResultTimer() {
  clearTimeout(state.speechNoResultTimer);
  state.speechNoResultTimer = null;
}

function resetSilenceTimer(updateSpeechAt = true) {
  clearTimeout(state.silenceTimer);
  state.silenceTimer = null;
  if (state.teachSessionPaused) return;
  const now = Date.now();
  if (updateSpeechAt || !state.lastSpeechAt) state.lastSpeechAt = now;
  if (!state.lastUserInputAt) state.lastUserInputAt = getLastUserInputAt() || now;

  const anchor = state.awaitingSilenceFollowup ? state.silenceCareAskedAt || now : getLastUserInputAt() || now;
  const waitMs = state.awaitingSilenceFollowup ? SILENCE_AFTER_CARE_MS : SILENCE_CARE_MS;
  const delay = Math.max(0, waitMs - (now - anchor));
  state.silenceTimer = setTimeout(handleSilenceTimeout, delay);
}

function handleSilenceTimeout() {
  if (state.teachSessionPaused) return;
  if (!state.isListening) return;

  const now = Date.now();
  if (state.awaitingSilenceFollowup) {
    const careIdleMs = now - (state.silenceCareAskedAt || now);
    if (careIdleMs < SILENCE_AFTER_CARE_MS - 250) {
      resetSilenceTimer(false);
      return;
    }

    clearSilenceFollowup();
    setGuideState(GUIDE_STATES.INTERACTIVE);
    requestSmartGuide("silence_followup", "", {
      force: true,
      guideState: GUIDE_STATES.INTERACTIVE,
      silenceSeconds: Math.round((now - getLastUserInputAt()) / 1000)
    });
    return;
  }

  const idleMs = now - getLastUserInputAt();
  if (idleMs < SILENCE_CARE_MS - 250) {
    resetSilenceTimer(false);
    return;
  }

  setGuideState(GUIDE_STATES.MICRO_HINT);
  state.awaitingSilenceFollowup = true;
  state.silenceCareAskedAt = now;
  requestSmartGuide("silence", "", {
    force: true,
    guideState: GUIDE_STATES.MICRO_HINT,
    silenceSeconds: Math.round(idleMs / 1000),
    fallbackText: pickPrompt("silence-care", [
      "你停了一会儿。我们先接着刚才那一步想：题目里哪个条件还没有用上？",
      "先不用急着往后算。回到刚才的思路，看看哪一个已知条件能接上这一步。",
      "我们从刚才停下的位置接着看。你先找找题目里还没用到的那个关系。"
    ])
  });
}

function handleStudentSpeech(text) {
  text = normalizeMathSpeechText(text);
  if (!text) return;
  const normalized = text.replace(/\s/g, "");
  markUserInput("speech");
  if (state.awaitingFinalAnswer) {
    if (isDirectHelpRequest(normalized)) {
      lianSpeak(
        pickPrompt("final-answer-repeat", [
          "先不用急着讲过程，你先告诉我这道题最后得到的答案。",
          "我们先把最后结果说清楚，答案是什么？",
          "你先报一下最后答案，我再帮你核对。"
        ])
      );
      return;
    }
    const combinedAnswer = [state.pendingFinalAnswerText, text].filter(Boolean).join(" ").trim();
    if (!hasConcreteFinalAnswer(combinedAnswer)) {
      state.pendingFinalAnswerText = combinedAnswer;
      state.activeGuideRequestId += 1;
      clearPendingThought();
      dom.lianState.textContent = "等你说完答案";
      return;
    }
    state.pendingFinalAnswerText = "";
    void handleFinalAnswerSubmission(combinedAnswer);
    return;
  }
  recordFinalAnswerEvidence(text);
  if (state.currentQuestionCompleted) return;
  clearTimeout(state.recognitionTimer);
  state.activeGuideRequestId += 1;
  dom.studentAvatar.classList.add("speaking");
  dom.studentState.textContent = "正在讲题";
  setTimeout(() => dom.studentAvatar.classList.remove("speaking"), 900);
  addLog("我", text);

  if (/下一步|继续讲|再讲一步|往下讲/.test(normalized) && state.guideState === GUIDE_STATES.INTERACTIVE) {
    clearPendingThought();
    state.interactiveStepCount += 1;
    requestSmartGuide("next_step", text, {
      force: true,
      guideState: GUIDE_STATES.INTERACTIVE
    });
    return;
  }

  if (/听懂了|懂了|明白了|会了/.test(normalized) && state.guideState === GUIDE_STATES.INTERACTIVE && !isDirectHelpRequest(normalized)) {
    clearPendingThought();
    setGuideState(GUIDE_STATES.HEURISTIC);
    clearIssueTracking();
    lianSpeak(
      pickPrompt("understanding-followup", [
        "你已经理解这一步了。接下来用自己的话继续讲吧。",
        "这一步你接住了，那就顺着自己的思路往下说。",
        "明白就好，你把刚才的思路再往后讲一讲。"
      ])
    );
    return;
  }

  if (isDirectHelpRequest(normalized)) {
    clearPendingThought();
    state.stuckCount += 1;
    clearSilenceFollowup();
    setGuideState(GUIDE_STATES.INTERACTIVE);
    requestSmartGuide("active_help", text, {
      force: true,
      guideState: GUIDE_STATES.INTERACTIVE
    });
    return;
  }

  const pendingLianQuestion = consumePendingLianQuestion();
  if (pendingLianQuestion) {
    clearPendingThought();
    clearSilenceFollowup();
    requestSmartGuide("answer_to_lian_question", text, {
      force: true,
      cooldown: 0,
      guideState: state.guideState,
      dialogueMode: "direct_answer",
      lianQuestion: pendingLianQuestion.text,
      fallbackText: "好，那我按你刚才说的来。你接着讲，我会跟着你的思路看。"
    });
    return;
  }

  state.stuckCount = 0;
  if (state.guideState === GUIDE_STATES.INTERACTIVE) {
    setGuideState(GUIDE_STATES.HEURISTIC);
    clearIssueTracking();
  }

  if (/答案|结果|所以|等于|算出/.test(normalized)) {
    scheduleHandwritingRecognition("关键讲解语音");
    if (/^(答案|结果|所以)?(是|为|等于)?[0-9a-zA-Z一二三四五六七八九十]+$/.test(normalized)) {
      setGuideState(GUIDE_STATES.MICRO_HINT);
      clearPendingThought();
      requestSmartGuide("jump", text, {
        cooldown: 28000,
        guideState: GUIDE_STATES.MICRO_HINT,
        fallbackText: "结果先放这儿，补一句你是根据哪个关系式算出来的。"
      });
      return;
    }
    scheduleThoughtPauseReview(text, { hasConclusion: true });
    return;
  }

  if (/这一步|然后|接着|化简|代入|方程/.test(normalized)) {
    scheduleHandwritingRecognition("关键讲解语音");
    scheduleThoughtPauseReview(text, { hasMathStep: true });
    return;
  }

  if (/错|不对|算错|符号|单位/.test(normalized)) {
    clearPendingThought();
    setGuideState(GUIDE_STATES.MICRO_HINT);
    requestSmartGuide("check", text, {
      cooldown: 18000,
      guideState: GUIDE_STATES.MICRO_HINT,
      fallbackText: "这里先检查等号两边、符号和单位，挑一个位置重新说一下。"
    });
    return;
  }

  dom.lianState.textContent = "安静听你讲";
  dom.lianAvatar.classList.add("listening");
  scheduleThoughtPauseReview(text);
}

function recordFinalAnswerEvidence(text) {
  const normalized = String(text || "").replace(/\s/g, "").toUpperCase();
  if (!normalized) return false;
  const mentionsOption =
    /(?:选|选择|选了|选的是|答案是|答案为|正确选项是)[A-D](?:选项|项)?/.test(normalized) ||
    /[A-D](?:选项|项)/.test(normalized) ||
    /(?:正确答案|最后答案|最终答案)[^。！？!?]{0,12}[A-D]/.test(normalized);
  const mentionsNumericOrExpression =
    /(?:最后|最终)?(?:答案|结果)(?:是|为|等于)?[^。！？!?]{1,24}/.test(normalized) ||
    /(?:所以|因此|故)[^。！？!?]{0,24}(?:=|等于|是|为)[^。！？!?]{1,18}/.test(normalized) ||
    /(?:最后|最终)[^。！？!?]{0,16}(?:=|等于|是|为)[^。！？!?]{1,18}/.test(normalized);
  const hasEvidence = mentionsOption || mentionsNumericOrExpression;
  if (hasEvidence) {
    if (state.finalAnswerVerified) {
      state.finalAnswerVerified = false;
      state.verifiedFinalAnswerText = "";
    }
    state.hasExplicitFinalAnswer = true;
  }
  return hasEvidence;
}

function extractFinalAnswerCandidate(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  const segments = value
    .split(/[\n。！？!?]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const explicitPattern = /(?:最后|最终)?(?:答案|结果)|(?:所以|因此|故).*(?:=|等于|是|为)|(?:最后|最终).*(?:=|等于|是|为)|[A-D](?:选项|项)/i;
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    if (explicitPattern.test(segments[index])) return segments[index].slice(-240);
  }
  return state.hasExplicitFinalAnswer ? value.slice(-240) : "";
}

function hasConcreteFinalAnswer(text) {
  const normalized = String(text || "")
    .replace(/\s/g, "")
    .replace(/^(?:最后|最终)?(?:答案|结果)?(?:是|为|等于)?/, "");
  if (!normalized || /^(?:是|为|等于)$/.test(normalized)) return false;
  return Boolean(
    /[A-D]/i.test(normalized) ||
      /(?:^|[=＝]|等于|为)[负-]?(?:\d|[零一二三四五六七八九十百千万])/.test(normalized) ||
      /^[负-]?(?:\d|[零一二三四五六七八九十百千万])/.test(normalized) ||
      /[a-zA-Z](?:=|＝|等于|为)[负-]?(?:\d|[零一二三四五六七八九十百千万])/.test(normalized) ||
      /无解|无数解|不存在|无法确定/.test(normalized)
  );
}

function scheduleThoughtPauseReview(text, flags = {}) {
  if (state.currentQuestionCompleted) return;
  clearTimeout(state.pendingThoughtTimer);
  const clipped = String(text || "").trim();
  if (!clipped) return;

  state.pendingThoughtText = [state.pendingThoughtText, clipped].filter(Boolean).join("\n").slice(-900);
  state.pendingThoughtSegments += 1;
  state.pendingThoughtHasConclusion = Boolean(state.pendingThoughtHasConclusion || flags.hasConclusion);
  state.pendingThoughtHasMathStep = Boolean(state.pendingThoughtHasMathStep || flags.hasMathStep);
  dom.lianState.textContent = "安静听你讲";
  dom.lianAvatar.classList.add("listening");

  if (state.teachSessionPaused) {
    state.resumePendingThoughtAfterNavigation = true;
    return;
  }
  state.pendingThoughtTimer = setTimeout(handleThoughtPause, THOUGHT_PAUSE_MS);
}

function clearPendingThought() {
  clearTimeout(state.pendingThoughtTimer);
  state.pendingThoughtTimer = null;
  state.pendingThoughtText = "";
  state.pendingThoughtSegments = 0;
  state.pendingThoughtHasConclusion = false;
  state.pendingThoughtHasMathStep = false;
}

function handleThoughtPause() {
  if (state.teachSessionPaused) {
    state.resumePendingThoughtAfterNavigation = Boolean(state.pendingThoughtText);
    return;
  }
  if (state.currentQuestionCompleted) return;
  const now = Date.now();
  if (now - state.lastSpeechAt < THOUGHT_PAUSE_MS - 200) {
    state.pendingThoughtTimer = setTimeout(handleThoughtPause, THOUGHT_PAUSE_MS);
    return;
  }

  const text = state.pendingThoughtText.trim();
  const segmentCount = state.pendingThoughtSegments;
  const hasConclusion = state.pendingThoughtHasConclusion;
  const hasMathStep = state.pendingThoughtHasMathStep;
  clearPendingThought();
  if (!text || !shouldReviewThoughtPause(text, { segmentCount, hasConclusion, hasMathStep })) {
    dom.lianState.textContent = guideIdleText();
    return;
  }

  state.lastThoughtReviewAt = now;
  requestSmartGuide("thought_complete", text, {
    cooldown: THOUGHT_REVIEW_COOLDOWN_MS,
    guideState: GUIDE_STATES.HEURISTIC,
    thoughtSegments: segmentCount,
    hasConclusion,
    hasMathStep,
    fallbackText: buildThoughtPauseFallback(text, { hasConclusion })
  });
}

function shouldReviewThoughtPause(text, meta = {}) {
  const normalized = text.replace(/\s/g, "");
  const now = Date.now();
  if (isDirectHelpRequest(normalized)) return false;
  if (now - state.lastGuideAt < THOUGHT_REVIEW_COOLDOWN_MS) return false;
  if (now - state.lastThoughtReviewAt < THOUGHT_REVIEW_COOLDOWN_MS) return false;
  if (normalized.length < 18 && meta.segmentCount < 2 && !meta.hasConclusion) return false;
  return Boolean(
    meta.hasConclusion ||
      meta.hasMathStep ||
      meta.segmentCount >= 2 ||
      /所以|因此|这样|这里|关系|方程|等式|比例|设|未知数|代入|化简|算出|得到/.test(normalized)
  );
}

function buildThoughtPauseFallback(text, meta = {}) {
  const normalized = text.replace(/\s/g, "");
  if (/设|未知数|x|y/.test(normalized)) {
    return pickPrompt("thought-unknown", [
      "你是在先把未知量表示出来。接下来准备用哪个条件列等式？",
      "你已经开始表示未知量了，下一步想用哪个条件写等式？",
      "先设未知量的方向很清楚，接下来准备根据哪个条件列式？"
    ]);
  }
  if (/方程|等式|列式/.test(normalized)) {
    return pickPrompt("thought-equation", [
      "你已经开始把条件转成等式了。下一步先检查等号两边是不是表示同一个量。",
      "等式已经列起来了，接下来看看等号两边对应的量是否一致。",
      "你在把条件写成方程，下一步先核对等号两边各自代表什么。"
    ]);
  }
  if (/比例|比值|成比例/.test(normalized)) {
    return pickPrompt("thought-proportion", [
      "你是在找两个量之间的比例关系。下一步说说对应关系怎么配。",
      "你已经找到比例这个方向了，接下来看看两边的量怎样对应。",
      "这里是在建立比例关系，你准备怎样配对这两个量？"
    ]);
  }
  if (/勾股|直角|斜边/.test(normalized)) {
    return pickPrompt("thought-pythagorean", [
      "你抓到直角三角形这个结构了。下一步准备把哪两条边代进关系式？",
      "直角三角形这个关键点找到了，接下来想用哪两条边来计算？",
      "你已经注意到直角关系了，下一步先确定要代入哪两条边。"
    ]);
  }
  if (/面积|周长|体积/.test(normalized)) {
    return pickPrompt("thought-geometry", [
      "你是在把图形里的量对应到公式里。下一步先说清楚每个量代表哪一段。",
      "你已经开始对应图形和公式了，先确认每个量分别表示什么。",
      "这里要把图形中的数量放进公式，下一步先讲清楚各个量的位置。"
    ]);
  }
  if (meta.hasConclusion || /答案|结果|所以|得到|算出/.test(normalized)) {
    return pickPrompt("thought-conclusion", [
      "你已经走到结论了。回头补一句，这个结果是根据哪个关系得到的？",
      "结果已经出来了，再说说你是依据哪个关系算到这里的。",
      "你讲到最后了，补充一下这个结论对应的条件或关系吧。"
    ]);
  }
  return pickPrompt("thought-general", [
    "我听到你在整理题里的数量关系。你接着说下一步准备怎么处理。",
    "你的思路正在展开，接下来打算先处理哪一部分？",
    "你先继续讲讲，下一步准备从哪个关系入手？"
  ]);
}

async function requestSmartGuide(eventType, latestStudentSpeech = "", options = {}) {
  if (state.teachSessionPaused) return false;
  if (state.currentQuestionCompleted) return false;
  const now = Date.now();
  const cooldown = options.cooldown ?? 15000;
  if (!options.force && cooldown && now - state.lastGuideAt < cooldown) return false;
  const targetGuideState = options.guideState || state.guideState;
  const isSilenceGuide = /silence/.test(eventType);
  if (isSilenceGuide && state.silenceGuidePending) return false;

  const question = currentPageQuestion();
  const fallbackText = options.fallbackText || buildFallbackGuide(eventType, question);
  const requestId = ++state.activeGuideRequestId;
  const questionId = question?.id || "";
  setGuideState(targetGuideState);
  dom.lianState.textContent = targetGuideState === GUIDE_STATES.INTERACTIVE ? "准备分步讲解" : "在想提示";
  if (isSilenceGuide) state.silenceGuidePending = true;

  try {
    const result = await requestAIGuide(eventType, latestStudentSpeech, options);
    if (state.teachSessionPaused || requestId !== state.activeGuideRequestId || currentPageQuestion()?.id !== questionId) {
      return false;
    }
    const lectureComplete = shouldCompleteCurrentLecture(result, latestStudentSpeech);
    const speech = formatGuideSpeech(eventType, result, fallbackText);
    if (result.shouldSpeak === false && !options.force) {
      dom.lianState.textContent = guideIdleText();
      if (lectureComplete && !state.hasExplicitFinalAnswer) askForFinalAnswer();
      return false;
    }

    await lianSpeak(speech);
    if (lectureComplete && !state.hasExplicitFinalAnswer) askForFinalAnswer();
    if (isSilenceGuide && state.isListening) resetSilenceTimer();
    return true;
  } catch (error) {
    console.warn("AI guide fallback:", error);
    if (state.teachSessionPaused || requestId !== state.activeGuideRequestId || currentPageQuestion()?.id !== questionId) {
      return false;
    }
    lianSpeak(fallbackText);
    if (isSilenceGuide && state.isListening) resetSilenceTimer();
    return true;
  } finally {
    if (isSilenceGuide) state.silenceGuidePending = false;
  }
}

async function requestAIGuide(eventType, latestStudentSpeech, options = {}) {
  const question = currentPageQuestion();
  if (!question) throw new Error("没有当前题目");

  saveCurrentPage();
  const response = await fetch("/api/guide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
      questionImage: question.image,
      questionId: question.id,
      questionTitle: question.title || "",
      eventType,
      transcript: dom.transcriptInput.value.trim(),
      latestStudentSpeech,
      lianQuestion: options.lianQuestion || "",
      problemText: question.problemText || "",
      knowledgePoints: question.knowledgePoints || [],
      boardImage: getBoardImageForGuide(),
      guideState: options.guideState || state.guideState,
      lectureUnlocked: (options.guideState || state.guideState) === GUIDE_STATES.INTERACTIVE,
      silenceSeconds: options.silenceSeconds || Math.round((Date.now() - getLastUserInputAt()) / 1000),
      boardIdleSeconds: Math.round((Date.now() - (state.lastBoardWriteAt || getLastUserInputAt())) / 1000),
      stuckCount: state.stuckCount,
      wrongAttemptCount: state.wrongAttemptCount,
      interactiveStepCount: state.interactiveStepCount,
      awaitingSilenceFollowup: state.awaitingSilenceFollowup,
      dialogueMode: options.dialogueMode || (eventType === "thought_complete" ? "companion_listening" : "standard"),
      thoughtSegments: options.thoughtSegments || 0,
      hasConclusion: Boolean(options.hasConclusion),
      hasMathStep: Boolean(options.hasMathStep),
      studentFinalAnswerEvidence: state.hasExplicitFinalAnswer,
      answerVerified: state.finalAnswerVerified,
      boardCompletionVerified: state.boardCompletionVerified
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "讲解引导失败");
  return result;
}

function shouldCompleteCurrentLecture(result, latestStudentSpeech = "") {
  void latestStudentSpeech;
  return Boolean(
    result?.lectureComplete === true &&
    state.finalAnswerVerified &&
    state.boardCompletionVerified
  );
}

function markCurrentQuestionComplete() {
  if (state.currentQuestionCompleted) return true;
  if (!state.finalAnswerVerified || !state.boardCompletionVerified) return false;
  state.currentQuestionCompleted = true;
  clearPendingThought();
  clearTimeout(state.recognitionTimer);
  clearIssueTracking();
  clearSilenceFollowup();
  state.silenceGuidePending = false;
  state.activeGuideRequestId += 1;
  state.handwritingRequestId += 1;
  setGuideState(GUIDE_STATES.ARCHIVE);
  dom.lianState.textContent = "本题讲解完成";
  return true;
}

function getBoardImageForGuide() {
  try {
    return dom.canvas.width ? dom.canvas.toDataURL("image/png") : "";
  } catch {
    return "";
  }
}

function formatGuideSpeech(eventType, result, fallbackText) {
  let speech = String(result?.speech || "").trim() || fallbackText;
  const formulaOrStep = String(result?.formulaOrStep || "").trim();
  const lectureUnlocked = state.guideState === GUIDE_STATES.INTERACTIVE;
  const tooExplicit = !lectureUnlocked && ["formula", "worked_step", "summary"].includes(result?.hintLevel);
  const needsConcreteStep = lectureUnlocked && /active_help|repeat_wrong|error_silence|silence_followup|next_step/.test(eventType);

  if (tooExplicit) speech = fallbackText;

  if (needsConcreteStep && formulaOrStep && !speech.includes(formulaOrStep.slice(0, 8))) {
    speech += pickPrompt("formula-step", [
      ` 可以先写：${formulaOrStep}。你照这个关系再讲一遍。`,
      ` 你可以先把${formulaOrStep}写下来，再用自己的话说一次。`,
      ` 先试着写出${formulaOrStep}，然后接着讲这一步就行了。`
    ]);
  }

  if (lectureUnlocked && result?.askStudentToRepeat && !/讲一遍|说一遍|写到黑板|复述|接着讲|继续讲|讲这一步/.test(speech)) {
    speech += pickPrompt("ask-repeat", [
      "听懂后，你用自己的话讲一遍，也可以写到黑板上。",
      "你理解后，把这一步再讲一次，或者在黑板上写出来。",
      "你用自己的话讲一遍就好。"
    ]);
  }

  return speech.replace(/\s+/g, " ").trim();
}

function buildFallbackGuide(eventType, question) {
  const point = question?.knowledgePoints?.[0] || question?.problemType || "题目里的等量关系";
  if (eventType === "jump") {
    return pickPrompt("fallback-jump", [
      `结果先放这儿，你补一句是根据哪个${point}算出来的。`,
      `答案可以先记着，再说说你用了哪个${point}得到它。`,
      `先不急着往下，讲一下这个结果对应的${point}。`
    ]);
  }
  if (eventType === "check") {
    return pickPrompt("fallback-check", [
      `这里先检查${point}，尤其看等号两边、符号和单位。你挑一步再说说。`,
      `我们先回头核一下${point}，等号两边和符号有没有对应上？`,
      `先检查${point}这一处，你把刚才那一步重新讲一遍。`
    ]);
  }
  if (eventType === "silence") {
    return pickPrompt("fallback-silence", [
      "你刚才停了一会儿，是不是卡在某一步了？说说你停在哪里。",
      "不用急，你是在哪一步不太确定？先把那一步说出来。",
      "我在听，如果刚好卡住了，你告诉我卡在什么地方。"
    ]);
  }
  if (eventType === "active_help" || eventType === "repeat_wrong" || eventType === "error_silence" || eventType === "silence_followup" || eventType === "next_step") {
    return pickPrompt("fallback-interactive", [
      `我们只看一小步：先抓住${point}，把题干里的关系找出来。然后你按这个方向再讲一遍。`,
      `先给你一个小提示，看看${point}，把对应关系找出来，再用自己的话说一次。`,
      `这里先不展开全部答案，先从${point}入手。你照这个方向继续讲。`
    ]);
  }
  return pickPrompt("fallback-general", [
    `先别急着算答案，我们先看${point}。你准备从哪个关系开始？`,
    `我们先把${point}理清楚，你说说这一步打算用什么关系。`,
    `先看清${point}再往下算，你准备怎样处理这一小步？`
  ]);
}

function maybeEncourage() {
  return false;
}

function maybeGuide(text, reason = "guide", cooldown = 15000) {
  const now = Date.now();
  if (cooldown && now - state.lastGuideAt < cooldown) {
    return false;
  }
  state.lastGuideAt = now;
  lianSpeak(text);
  return true;
}

function chooseLianVoice(voices = []) {
  const gentleFemaleHints = [
    "xiaoxiao",
    "xiaoyi",
    "yaoyao",
    "huihui",
    "xiaohan",
    "hanhan",
    "tingting",
    "ting-ting",
    "meijia",
    "mei-jia",
    "晓晓",
    "晓伊",
    "瑶瑶",
    "慧慧",
    "晓涵",
    "婷婷",
    "美佳",
    "female",
    "woman",
    "girl",
    "女"
  ];
  const maleHints = ["kangkang", "yunxi", "yunjian", "male", "man", "boy", "男"];

  const chineseVoices = voices.filter((voice) => {
    const name = String(voice.name || "").toLowerCase();
    const lang = String(voice.lang || "").toLowerCase();
    return /^(zh|cmn)/.test(lang) || /chinese|中文|普通话|mandarin/.test(name);
  });
  const candidates = chineseVoices.length ? chineseVoices : voices;

  return [...candidates]
    .map((voice) => {
      const name = String(voice.name || "").toLowerCase();
      const lang = String(voice.lang || "").toLowerCase();
      const isChinese = /^(zh|cmn)/.test(lang) || /chinese|中文|普通话|mandarin/.test(name);
      let score = isChinese ? 80 : 0;
      if (/zh-cn|cmn-hans-cn/.test(lang)) score += 30;
      if (gentleFemaleHints.some((hint) => name.includes(hint.toLowerCase()))) score += 160;
      if (/natural|online|neural/.test(name)) score += 18;
      if (maleHints.some((hint) => name.includes(hint))) score -= 240;
      return { voice, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.voice || null;
}

function refreshLianVoice() {
  if (!("speechSynthesis" in window)) return null;
  state.lianVoice = chooseLianVoice(window.speechSynthesis.getVoices());
  return state.lianVoice;
}

function getLianVoice() {
  if (!("speechSynthesis" in window)) return null;
  return refreshLianVoice() || state.lianVoice;
}

if ("speechSynthesis" in window) {
  refreshLianVoice();
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshLianVoice);
}

function normalizeGuidanceFingerprint(text) {
  return String(text || "")
    .replace(/\s+/g, "")
    .replace(/[，。！？、；：,.!?;:'"“”‘’（）()【】\[\]-]/g, "")
    .toLowerCase()
    .slice(0, 180);
}

function getGuidanceDedupeKey(text, options = {}) {
  const questionId = options.questionId || currentPageQuestion()?.id || "global";
  const contentKey = options.dedupeKey || normalizeGuidanceFingerprint(text);
  return contentKey ? `${questionId}:${contentKey}` : "";
}

function lianSpeechLooksLikeQuestion(text) {
  const value = String(text || "").replace(/\s+/g, "");
  if (!value) return false;
  return /[?？]|哪|什么|为什么|怎么|是不是|能不能|要不要|准备|先.*还是|读给我听|说给我听|告诉我/.test(value);
}

function rememberLianQuestion(text) {
  const question = currentPageQuestion();
  if (!question || !lianSpeechLooksLikeQuestion(text)) {
    state.pendingLianQuestion = null;
    return;
  }
  state.pendingLianQuestion = {
    text: String(text || "").trim(),
    at: Date.now(),
    questionId: question.id
  };
}

function consumePendingLianQuestion() {
  const pending = state.pendingLianQuestion;
  const question = currentPageQuestion();
  if (!pending || !question || pending.questionId !== question.id || Date.now() - pending.at > 120000) {
    state.pendingLianQuestion = null;
    return null;
  }
  state.pendingLianQuestion = null;
  return pending;
}

function prepareLianSpeechText(value) {
  let text = String(value || "")
    .replace(/[−﹣－]/g, "-")
    .replace(/[×✕]/g, "乘")
    .replace(/÷/g, "除以");

  // SpeechSynthesis often drops a bare minus. Resolve binary subtraction first,
  // then pronounce the remaining unary signs explicitly as "负".
  text = text
    .replace(/([A-Za-z\d①②③④⑤⑥⑦⑧⑨⑩）)\]])\s*-\s*(?=[A-Za-z\d①②③④⑤⑥⑦⑧⑨⑩（(\[])/g, "$1减")
    .replace(/(减去|加上|等于|等于了|为|是|得到|得出|结果为|写成|代入)\s*-\s*(?=[A-Za-z\d])/g, "$1负")
    .replace(/(^|[=＝（(【\[，,。；;：:、+*/])\s*-\s*(?=[A-Za-z\d])/gm, "$1负")
    .replace(/-\s*(?=[A-Za-z\d])/g, "负")
    .replace(/(?:左|右)(?:小|中|大|圆|方)?括号/g, "")
    .replace(/[（）()【】\[\]{}｛｝]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Force the row-related reading háng without changing the visible response.
  return text
    .replace(/(最后一|最后|这一|那一|上一|下一|每一|同一|另一)\s*行/g, "$1杭")
    .replace(/(第\s*[一二三四五六七八九十百\d]+)\s*行/g, "$1杭")
    .replace(/([一二三四五六七八九十两\d]+)\s*行(?=(?:字|数|式|内容|数据|文字|公式|分别|是|为|中|里|上|下|，|。|；|：|$))/g, "$1杭")
    .replace(/行列/g, "杭列")
    .replace(/行数/g, "杭数")
    .replace(/逐行/g, "逐杭")
    .replace(/换行/g, "换杭");
}

function lianSpeak(text, options = {}) {
  if (state.teachSessionPaused && options.allowWhilePaused !== true) return Promise.resolve(false);
  const now = Date.now();
  const dedupeKey = getGuidanceDedupeKey(text, options);
  const cooldownMs = Number.isFinite(options.cooldownMs) ? options.cooldownMs : REPEATED_GUIDANCE_COOLDOWN_MS;
  const previous = dedupeKey ? state.spokenGuidanceByKey.get(dedupeKey) : null;
  if (!options.allowRepeat && previous && now - previous < cooldownMs) {
    state.lastGuideAt = now;
    return Promise.resolve(false);
  }

  if (dedupeKey) state.spokenGuidanceByKey.set(dedupeKey, now);
  state.lastGuideAt = now;
  dom.lianBubble.textContent = text;
  dom.lianState.textContent = "正在回应";
  dom.lianAvatar.classList.remove("listening");
  dom.lianAvatar.classList.add("speaking");
  if (options.log !== false) addLog("恋恋", text, { key: options.logKey || (dedupeKey ? `lian:${dedupeKey}` : "") });

  if (options.trackQuestion !== false) rememberLianQuestion(text);

  return new Promise((resolve) => {
    let finished = false;
    const finishSpeaking = () => {
      if (finished) return;
      finished = true;
      clearTimeout(fallbackTimer);
      dom.lianAvatar.classList.remove("speaking");
      dom.lianAvatar.classList.add("listening");
      dom.lianState.textContent = guideIdleText();
      resolve();
    };

    const fallbackTimer = setTimeout(finishSpeaking, Math.min(2200, 850 + text.length * 34));

    if (!state.isMuted && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speechText = prepareLianSpeechText(text);
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = "zh-CN";
      const voice = getLianVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 0.89;
      utterance.pitch = 1.05;
      utterance.volume = 0.86;
      utterance.onend = finishSpeaking;
      utterance.onerror = finishSpeaking;
      window.speechSynthesis.speak(utterance);
      return;
    }

    setTimeout(finishSpeaking, 260);
  });
}

function lianSilentNotice(text, options = {}) {
  const shouldUpdateBubble = options.bubble !== false;
  const shouldLog = options.log !== false;
  const key = options.key || `silent:${text}`;
  const cooldownMs = Number.isFinite(options.cooldownMs) ? options.cooldownMs : 45000;
  const now = Date.now();

  if (shouldUpdateBubble) dom.lianBubble.textContent = text;
  dom.lianState.textContent = guideIdleText();
  dom.lianAvatar.classList.remove("speaking");
  dom.lianAvatar.classList.add("listening");

  if (!shouldLog) return;
  const lastNoticeAt = state.lastSilentNoticeAtByKey.get(key) || 0;
  if (now - lastNoticeAt < cooldownMs) return;
  state.lastSilentNoticeAtByKey.set(key, now);
  addLog("提示", text, { key });
}

function askForFinalAnswer() {
  if (!state.lecture.length || state.finalAnswerVerified) return;
  state.awaitingFinalAnswer = true;
  state.pendingFinalAnswerText = "";
  setGuideState(GUIDE_STATES.INTERACTIVE);
  lianSpeak(
    pickPrompt("ask-final-answer", [
      "讲解到这里了，你最后得到的答案是什么？请说出来或写在黑板上。",
      "我们先确认最后结果，你认为这道题的答案是多少？",
      "最后一步交给你：把答案和单位说清楚，我来帮你核对。"
    ])
  );
}

async function requestFinalAnswerCheck(answer) {
  const question = currentPageQuestion();
  if (!question) throw new Error("没有当前题目");
  saveCurrentPage();
  const response = await fetch("/api/final-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionImage: question.image,
      boardImage: getBoardImageForGuide(),
      answer,
      lectureText: dom.transcriptInput.value.trim(),
      latestHandwritingResult: state.latestHandwritingResult,
      problemText: question.problemText || ""
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "最后答案核对失败");
  return result;
}

async function verifyBoardAndCompleteQuestion(options = {}) {
  const question = currentPageQuestion();
  if (!question || !state.finalAnswerVerified || state.completionCheckInProgress) return false;

  state.completionCheckInProgress = true;
  dom.finishQuestionBtn.disabled = true;
  setGuideState(GUIDE_STATES.INTERACTIVE);

  try {
    const boardCheck = await verifyCurrentBoardForCompletion(question);
    if (boardCheck.stale || currentPageQuestion()?.id !== question.id) return false;
    if (!boardCheck.verified) {
      state.currentQuestionCompleted = false;
      dom.finishQuestionBtn.disabled = false;
      await lianSpeak(boardCheck.guidance);
      return false;
    }

    if (!markCurrentQuestionComplete()) {
      dom.finishQuestionBtn.disabled = false;
      return false;
    }

    const feedback = String(options.feedback || boardCheck.result?.positiveFeedback || "").trim();
    await lianSpeak(
      feedback
        ? `${feedback} 板书里也有正确的关键步骤，这道题可以结束。`
        : "最终答案和板书里的关键步骤都核对好了，这道题可以结束。"
    );
    await saveCurrentQuestionAndContinue();
    return true;
  } catch (error) {
    console.warn("Board completion check fallback:", error);
    state.boardCompletionVerified = false;
    state.currentQuestionCompleted = false;
    dom.finishQuestionBtn.disabled = false;
    await lianSpeak("答案已经核对过了，但这次还没能确认板书中的关键步骤。请保留板书，稍后再点一次我讲完了。");
    return false;
  } finally {
    state.completionCheckInProgress = false;
    setTimeout(() => dom.recognitionPill.classList.add("hidden"), 1200);
  }
}

async function handleFinalAnswerSubmission(answer) {
  const question = currentPageQuestion();
  if (!question || !answer.trim()) return;
  const requestId = ++state.finalAnswerRequestId;
  state.awaitingFinalAnswer = false;
  state.pendingFinalAnswerText = "";
  state.finalAnswerVerified = false;
  state.verifiedFinalAnswerText = "";
  state.boardCompletionVerified = false;
  state.currentQuestionCompleted = false;
  dom.finishQuestionBtn.disabled = true;
  dom.recognitionPill.textContent = "正在核对最后答案";
  dom.recognitionPill.classList.remove("hidden");
  addLog("我", answer);

  try {
    const result = await requestFinalAnswerCheck(answer);
    if (requestId !== state.finalAnswerRequestId || currentPageQuestion()?.id !== question.id) return;

    if (result.correct) {
      state.finalAnswerVerified = true;
      state.verifiedFinalAnswerText = answer.trim();
      state.awaitingFinalAnswer = false;
      setGuideState(GUIDE_STATES.INTERACTIVE);
      await verifyBoardAndCompleteQuestion({ feedback: result.feedback || "" });
      return;
    }

    state.finalAnswerVerified = false;
    state.verifiedFinalAnswerText = "";
    state.boardCompletionVerified = false;
    state.awaitingFinalAnswer = true;
    dom.finishQuestionBtn.disabled = false;
    setGuideState(GUIDE_STATES.INTERACTIVE);
    await lianSpeak(
      result.hint ||
        pickPrompt("final-answer-check", [
          "我们一起再核一下最后一步，你把答案和前面的关系式对照一下。",
          "最后结果还需要再确认一下，看看代回题目条件后是否成立。",
          "先别急着保存，把最后的数值和单位再检查一遍。"
        ])
    );
  } catch (error) {
    console.warn("Final answer check fallback:", error);
    if (requestId !== state.finalAnswerRequestId || currentPageQuestion()?.id !== question.id) return;
    state.awaitingFinalAnswer = true;
    state.finalAnswerVerified = false;
    state.verifiedFinalAnswerText = "";
    state.boardCompletionVerified = false;
    dom.finishQuestionBtn.disabled = false;
    dom.recognitionPill.classList.add("hidden");
    await lianSpeak(
      pickPrompt("final-answer-unavailable", [
        "我这次还没核准最后答案，你再把结果和单位说清楚一些。",
        "最后答案我暂时没看完整，再说一遍最终结果，我继续帮你核对。",
        "核对服务刚才没有返回，你先把最后答案再讲一次。"
      ])
    );
  } finally {
    setTimeout(() => dom.recognitionPill.classList.add("hidden"), 1200);
  }
}

async function saveCurrentQuestionAndContinue(options = {}) {
  const question = currentPageQuestion();
  if (!question) return;
  if (!state.finalAnswerVerified || !state.boardCompletionVerified) {
    state.currentQuestionCompleted = false;
    dom.finishQuestionBtn.disabled = false;
    setGuideState(GUIDE_STATES.INTERACTIVE);
    lianSpeak(
      !state.finalAnswerVerified
        ? "这道题还不能结束，先把最终答案说清楚并核对正确。"
        : "答案已经正确，但板书里还没有确认到正确的关键步骤。请写下一个关系式、公式或计算步骤。"
    );
    return;
  }
  if (!confirmNotebookSave()) {
    dom.finishQuestionBtn.disabled = false;
    lianSpeak(
      pickPrompt("save-reminder", [
        "答案已经核对好了，想保存时再点一次讲完，我会继续帮你处理。",
        "这道题还没有保存，你确认保存后我们再进入下一题。",
        "先把这道错题保存下来，保存完成后就可以继续下一题。"
      ])
    );
    return;
  }

  const record = await buildNotebookRecord(question);
  state.notebook.unshift(record);
  state.completedThisSession.push(record);
  saveNotebook();
  state.finalAnswerVerified = false;
  state.verifiedFinalAnswerText = "";
  state.boardCompletionVerified = false;
  state.currentQuestionCompleted = false;

  if (state.boardPageIndex < state.lecture.length - 1) {
    state.boardPageIndex += 1;
    state.currentLectureIndex = state.boardPageIndex;
    resetQuestionGuideState();
    loadCurrentPage();
    updatePageLabel();
    dom.finishQuestionBtn.disabled = false;
    lianSpeak(
      pickPrompt("next-question-after-save", [
        "答案核对正确，这道题完成了。我们看下一题，你先说说题目给了什么条件。",
        "这道题已经讲完并保存好了。接下来进入下一题，你按自己的思路慢慢讲。",
        "这题整理完成了，我们看下一题。你准备从哪里开始？"
      ])
    );
    return;
  }

  dom.finishQuestionBtn.disabled = true;
  stopListeningAfterSessionCompletion();
  renderCompletion();
  showView("completeView");
  lianSpeak(
    pickPrompt("session-complete", [
      "今天的错题讲解完成了。你把思路讲清楚了，记得及时复习今天整理的错题。",
      "今天的任务完成了。刚才的错题已经整理好，之后记得及时复习巩固。",
      "今天就讲到这里，错题都已经整理完成。记得按时复习，把这些思路真正变成自己的。"
    ]),
    { trackQuestion: false, dedupeKey: "session-complete" }
  );
}

dom.finishQuestionBtn.addEventListener("click", () => {
  if (!state.lecture.length) return;
  if (state.completionCheckInProgress) return;
  if (state.currentQuestionCompleted && state.finalAnswerVerified && state.boardCompletionVerified) {
    void saveCurrentQuestionAndContinue();
    return;
  }
  if (state.finalAnswerVerified) {
    void verifyBoardAndCompleteQuestion();
    return;
  }
  const answerCandidate = extractFinalAnswerCandidate(dom.transcriptInput.value);
  if (answerCandidate) {
    void handleFinalAnswerSubmission(answerCandidate);
    return;
  }
  if (state.awaitingFinalAnswer) return;
  askForFinalAnswer();
});

function confirmNotebookSave() {
  const lectureText = getNotebookLectureText();
  const textState = lectureText ? "包含最后的讲解文字" : "讲解文字为空，仅保存题图和笔迹";
  return window.confirm(
    `是否保存到错题本？\n\n将只保存：\n1. 黑板里的错题图片\n2. 黑板笔迹内容\n3. ${textState}\n\n不再保存额外合成大图和 AI 摘要，以减少本地存储占用。`
  );
}

function getNotebookLectureText() {
  return dom.transcriptInput.value.trim();
}

async function buildNotebookRecord(question) {
  const pages = pagesForQuestion(question.id);
  const strokeImages = await compactStrokePages(pages);
  const lectureText = getNotebookLectureText();
  const now = new Date();
  const reviewAt = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  return {
    id: safeNowId("note"),
    title: `错题 ${state.notebook.length + 1}`,
    questionImage: question.image,
    strokeImages,
    lectureText,
    transcript: lectureText,
    reviewAt: reviewAt.toISOString(),
    status: "还要复习",
    createdAt: now.toISOString()
  };
}

async function compactStrokePages(pages) {
  const nonEmptyPages = pages.filter(Boolean);
  const results = [];
  for (const page of nonEmptyPages) {
    results.push(await compactStrokeImage(page));
  }
  return results;
}

async function compactStrokeImage(dataUrl) {
  const image = await loadImage(dataUrl);
  const maxWidth = 960;
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const compactCtx = canvas.getContext("2d");
  compactCtx.clearRect(0, 0, canvas.width, canvas.height);
  compactCtx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const webp = canvas.toDataURL("image/webp", 0.72);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
}

function getSnapshotImageState(questionId) {
  const imageState = state.boardImageStates[questionId];
  const rect = dom.blackboard.getBoundingClientRect();
  if (!imageState || !rect.width || !rect.height) return null;
  return {
    ...imageState,
    boardWidth: rect.width,
    boardHeight: rect.height
  };
}

async function composeBoardSnapshot(strokesDataUrl, questionImageUrl, imageState = null) {
  const width = 1280;
  const height = 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const snapshot = canvas.getContext("2d");
  snapshot.fillStyle = "#183d35";
  snapshot.fillRect(0, 0, width, height);
  snapshot.strokeStyle = "rgba(248,242,216,0.08)";
  snapshot.lineWidth = 1;
  for (let x = 0; x < width; x += 54) {
    snapshot.beginPath();
    snapshot.moveTo(x, 0);
    snapshot.lineTo(x, height);
    snapshot.stroke();
  }
  for (let y = 0; y < height; y += 54) {
    snapshot.beginPath();
    snapshot.moveTo(0, y);
    snapshot.lineTo(width, y);
    snapshot.stroke();
  }

  if (questionImageUrl) {
    const questionImage = await loadImage(questionImageUrl);
    const boardWidth = imageState?.boardWidth || width;
    const boardHeight = imageState?.boardHeight || height;
    const scaleX = width / boardWidth;
    const scaleY = height / boardHeight;
    const drawX = imageState ? imageState.x * scaleX : 43;
    const drawY = imageState ? imageState.y * scaleY : 43;
    const drawW = imageState ? imageState.baseWidth * imageState.scale * scaleX : 420;
    const drawH = imageState ? imageState.baseHeight * imageState.scale * scaleY : 240;
    snapshot.fillStyle = "#fff";
    snapshot.fillRect(drawX - 9, drawY - 9, drawW + 18, drawH + 18);
    snapshot.drawImage(questionImage, drawX, drawY, drawW, drawH);
  }

  if (strokesDataUrl) {
    const strokes = await loadImage(strokesDataUrl);
    snapshot.drawImage(strokes, 0, 0, width, height);
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}

function renderCompletion() {
  const count = state.completedThisSession.length;
  dom.completeSummary.textContent = `今天的任务完成了，共整理 ${count} 道错题。记得及时复习，巩固今天讲过的思路。`;
  dom.completionReview.innerHTML = state.completedThisSession
    .map(
      (record) => `
        <article class="review-card">
          <img src="${record.questionImage}" alt="${escapeHTML(record.title)}" />
          <div>
            <strong>${escapeHTML(record.title)}</strong>
            <span>${getRecordLectureText(record) ? "已保存讲解文字" : "未填写讲解文字"} · ${formatDate(record.reviewAt)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

dom.openNotebookBtn.addEventListener("click", () => showView("notebookView"));
dom.newUploadBtn.addEventListener("click", () => showView("uploadView"));

function renderNotebook() {
  updateNotebookCount();
  if (!state.notebook.length) {
    dom.notebookList.innerHTML = '<div class="empty-detail">讲解完成后，错题会保存在这里。</div>';
    dom.reviewReminder.textContent = "暂无复习提醒";
    renderNotebookDetail(null);
    return;
  }

  const nearest = [...state.notebook].sort((a, b) => new Date(a.reviewAt) - new Date(b.reviewAt))[0];
  dom.reviewReminder.textContent = `最近复习：${formatDate(nearest.reviewAt)}`;
  dom.notebookList.innerHTML = state.notebook
    .map(
      (record) => `
        <button class="notebook-item ${record.id === state.activeNotebookId ? "active" : ""}" data-note-id="${record.id}">
          <img src="${record.questionImage}" alt="${escapeHTML(record.title)}" />
          <span>
            <strong>${escapeHTML(record.title)}</strong>
            <span>${escapeHTML(record.status)} · ${formatDate(record.reviewAt)}</span>
          </span>
        </button>
      `
    )
    .join("");

  $$(".notebook-item", dom.notebookList).forEach((button) => {
    button.addEventListener("click", () => {
      state.activeNotebookId = button.dataset.noteId;
      renderNotebook();
      renderNotebookDetail(state.notebook.find((record) => record.id === state.activeNotebookId));
    });
  });

  if (!state.activeNotebookId || !state.notebook.some((record) => record.id === state.activeNotebookId)) {
    state.activeNotebookId = state.notebook[0].id;
  }
  renderNotebookDetail(state.notebook.find((record) => record.id === state.activeNotebookId));
}

function renderNotebookDetail(record) {
  if (!record) {
    dom.notebookDetail.innerHTML = `
      <div class="empty-detail">
        <span data-icon="book"></span>
        <strong>选择一道错题查看记录</strong>
      </div>
    `;
    injectIcons(dom.notebookDetail);
    return;
  }

  const strokeImages = getRecordStrokeImages(record);
  const firstStroke = strokeImages[0] || "";
  const lectureText = getRecordLectureText(record);
  const lectureTextBlock = lectureText
    ? `<p>讲解文字：${escapeHTML(lectureText)}</p>`
    : "<p>讲解文字：这次没有保存文字讲解。</p>";
  const strokeBlock = firstStroke
    ? `<img src="${firstStroke}" alt="黑板笔迹内容" />`
    : '<div class="empty-detail">这次没有保存笔迹。</div>';
  dom.notebookDetail.innerHTML = `
    <div class="detail-grid">
      <div class="detail-main-image">
        <img src="${record.questionImage}" alt="${escapeHTML(record.title)}" />
      </div>
      <div class="detail-summary">
        <div>
          <h3>${escapeHTML(record.title)}</h3>
          <div class="detail-meta">轻量保存 · ${formatDate(record.createdAt)}</div>
        </div>
        ${lectureTextBlock}
        <p>复习提醒：${formatDate(record.reviewAt)} · ${escapeHTML(record.status)}</p>
      </div>
    </div>
    <div class="board-snapshot" style="margin-top:16px">
      ${strokeBlock}
    </div>
    <div class="detail-actions">
      <button class="primary-btn" data-action="retry">
        <span data-icon="board"></span>
        重新讲解
      </button>
      <button class="text-btn" data-action="mastered">
        <span data-icon="check"></span>
        标为已掌握
      </button>
      <button class="text-btn" data-action="review">
        <span data-icon="refresh"></span>
        还要复习
      </button>
      <button class="text-btn danger" data-action="delete">
        <span data-icon="trash"></span>
        删除
      </button>
    </div>
  `;
  injectIcons(dom.notebookDetail);

  $('[data-action="retry"]', dom.notebookDetail).addEventListener("click", () => {
    startLecture([
      {
        id: safeNowId("retry"),
        title: record.title,
        source: "错题本复讲",
        image: record.questionImage
      }
    ]);
  });

  $('[data-action="mastered"]', dom.notebookDetail).addEventListener("click", () => updateRecordStatus(record.id, "已掌握"));
  $('[data-action="review"]', dom.notebookDetail).addEventListener("click", () => updateRecordStatus(record.id, "还要复习"));
  $('[data-action="delete"]', dom.notebookDetail).addEventListener("click", () => deleteRecord(record.id));
}

function getRecordStrokeImages(record) {
  return record.strokeImages || record.boardStrokes || record.boardImages || [];
}

function getRecordLectureText(record) {
  return (record.lectureText || record.transcript || "").trim();
}

function updateRecordStatus(id, status) {
  state.notebook = state.notebook.map((record) => (record.id === id ? { ...record, status } : record));
  saveNotebook();
  renderNotebook();
}

function deleteRecord(id) {
  state.notebook = state.notebook.filter((record) => record.id !== id);
  if (state.activeNotebookId === id) state.activeNotebookId = state.notebook[0]?.id || null;
  saveNotebook();
  renderNotebook();
}

renderQuestions();
renderNotebook();
