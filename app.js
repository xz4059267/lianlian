const iconMap = {
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M20 16.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5"/></svg>',
  board: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>',
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
  notebookView: $("#notebookView"),
  reviewView: $("#reviewView")
};

const dom = {
  navBtns: $$(".nav-btn"),
  enterUploadBtn: $("#enterUploadBtn"),
  welcomeNotebookBtn: $("#welcomeNotebookBtn"),
  notebookCount: $("#notebookCount"),
  reviewCount: $("#reviewCount"),
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
  clearSelectionBtn: $("#clearSelectionBtn"),
  startLectureBtn: $("#startLectureBtn"),
  previewPrevImageBtn: $("#previewPrevImageBtn"),
  previewNextImageBtn: $("#previewNextImageBtn"),
  questionsPrevImageBtn: $("#questionsPrevImageBtn"),
  questionsNextImageBtn: $("#questionsNextImageBtn"),
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
  reviewReminder: $("#reviewReminder"),
  reviewPageState: $("#reviewPageState"),
  reminderCenter: $("#reminderCenter"),
  dueReviewList: $("#dueReviewList"),
  reviewPlan: $("#reviewPlan")
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
// Keep the browser budget just above the server's dedicated guide budget.
// A guide turn must fail fast enough that the student can continue writing.
const GUIDE_REQUEST_TIMEOUT_MS = 30000;
// The server allows Qwen up to 45s. Keep the browser alive slightly longer so
// a valid response is not turned into a duplicate retry by the client.
// The server owns the handwriting race budget. Keep the browser timeout a
// little longer so it receives the real server error instead of aborting first.
const HANDWRITING_REQUEST_TIMEOUT_MS = 35000;
const LIAN_TTS_REQUEST_TIMEOUT_MS = 9000;
const LIAN_TEXT_PUBLISH_WATCHDOG_MS = 10000;
// Each additional full idle interval moves the guide closer to a concrete
// equation and the verified answer. Student input resets the level.
const MAX_SILENCE_GUIDE_STAGE = 4;
const ERROR_SILENCE_MS = 60000;
const BOARD_RECOGNITION_DELAY_MS = 6500;
const THOUGHT_PAUSE_MS = 8000;
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
const LIAN_VOICE_RATE = 0.92;
const LIAN_VOICE_PITCH = 1.01;
const LIAN_VOICE_VOLUME = 0.82;
const GUIDE_IMAGE_MAX_SIDE = 1400;
const GUIDE_BOARD_MAX_SIDE = 1100;
const GUIDE_IMAGE_JPEG_QUALITY = 0.76;
// Handwriting recognition receives the visual blackboard itself. Keep enough
// pixels for handwritten symbols; only downsize when the board is larger than
// the multimodal request budget.
const HANDWRITING_IMAGE_MAX_SIDE = 1400;
const HANDWRITING_IMAGE_JPEG_QUALITY = 0.9;
const GUIDE_IMAGE_CACHE_LIMIT = 6;
const guideImageCache = new Map();
const ACTIVE_HELP_PATTERN = /为什么|不懂|求助|不会|不会做|没思路|不知道|卡住|讲一下|提示一下|怎么(?:来|来的|求|算|做|解|得到|列|消元|化简)|如何(?:求|算|做|解|得到|列|消元|化简)|该(?:怎么|如何)|能不能(?:提示|讲|告诉)|可以怎么/;
const EXPLICIT_STUCK_PATTERN = /不会(?:了|做|算|求|解|列|写|弄|往下|继续|下一步)|不太会|不懂|没(?:有)?思路|不知道(?:了|该|要|怎么|咋|从哪|下一步|往下)|卡住|卡在|看不懂|没看懂|做不下去|不会$/;

function isDirectHelpRequest(text) {
  const normalized = String(text || "").replace(/\s/g, "");
  if (!normalized) return false;
  if (EXPLICIT_STUCK_PATTERN.test(normalized) || ACTIVE_HELP_PATTERN.test(normalized)) return true;
  return /(?:吗|呢|怎么办|是什么|是多少|对不对|行不行)[？?]?$/.test(normalized);
}

function isImmediateStuckRequest(text) {
  const normalized = String(text || "").replace(/\s/g, "");
  if (!normalized) return false;
  if (/不会(?:是|等于|为|成|得到)/.test(normalized)) return false;
  return EXPLICIT_STUCK_PATTERN.test(normalized);
}

const state = {
  source: null,
  sources: [],
  activeSourceIndex: 0,
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
  completedLectureQuestionIds: new Set(),
  boardPageIndex: 0,
  boardPages: {},
  boardInkByQuestion: {},
  boardVersionByQuestion: {},
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
  handwritingRetryTimer: null,
  handwritingRetryPending: false,
  handwritingRetryCountByKey: {},
  handwritingRequestId: 0,
  handwritingRequestInFlight: false,
  handwritingActiveRequest: null,
  handwritingRequestStatusById: {},
  handwritingQueuedReason: "",
  handwritingQueuedMeta: null,
  latestHandwritingResult: null,
  lastHandwritingRecognizedAt: 0,
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
  cloudSpeechConfig: null,
  cloudAsrActive: false,
  cloudAsrStream: null,
  cloudAsrAudioContext: null,
  cloudAsrSource: null,
  cloudAsrProcessor: null,
  cloudAsrBuffers: [],
  cloudAsrSampleRate: 16000,
  cloudAsrFlushTimer: null,
  cloudAsrRequestInFlight: false,
  cloudAsrPendingFlush: false,
  cloudAsrRequestId: 0,
  cloudAsrPreviewActive: false,
  cloudAsrPreviewFinalText: "",
  cloudAsrFinalizing: false,
  speechInterpretationPromise: Promise.resolve(),
  lastCloudAsrText: "",
  lastCloudAsrTextAt: 0,
  speechDraftText: "",
  speechDraftBase: "",
  speechNoResultTimer: null,
  lastImmediateHelpAt: 0,
  lastImmediateHelpText: "",
  transcriptCorrectionRequestId: 0,
  awaitingFinalAnswer: false,
  pendingFinalAnswerText: "",
  waitingForBoardBeforeFinalAnswer: false,
  finalAnswerVerified: false,
  verifiedFinalAnswerText: "",
  boardVerificationUnavailableQuestionId: "",
  boardVerificationUnavailableAt: 0,
  boardCompletionVerified: false,
  completionCheckInProgress: false,
  autoSavePromptedQuestionId: "",
  questionMemoryStatusByQuestion: {},
  questionMemoriesByQuestion: {},
  questionMemoryFetchPromises: {},
  questionMemoryIdsByQuestion: {},
  currentQuestionCompleted: false,
  hasExplicitFinalAnswer: false,
  pendingLianQuestion: null,
  pendingLianOpeningText: "",
  askedConceptsByQuestion: {},
  resolvedConceptsByQuestion: {},
  logItemsByKey: new Map(),
  lastSilentNoticeAtByKey: new Map(),
  promptVariantLastByKey: new Map(),
  spokenGuidanceByKey: new Map(),
  isListening: false,
  isMuted: false,
  lianVoice: null,
  currentLianUtterance: null,
  lianAudioElement: null,
  lianAudioUnlocked: false,
  lianAudioUnlockPromise: null,
  lianTtsPrefetch: null,
  lianTtsPrefetchPromise: null,
  lianVoiceIdentity: "",
  lianVoiceSelectionLocked: false,
  lianSpeechRequestId: 0,
  guideGeneration: 0,
  guideRequestInFlight: null,
  guideAbortController: null,
  guideUnavailableAt: 0,
  guideUnavailableQuestionId: "",
  guideUnavailableUntil: 0,
  openingSpeechInProgress: false,
  lectureSessionId: 0,
  answerSessionId: 0,
  inputSequenceId: 0,
  lastInputEvent: null,
  lianTtsAbortController: null,
  lianSpeechPausedRecognition: false,
  lianSpeechKeepAliveTimer: null,
  openingSpeechWatchdogTimer: null,
  micPermissionGranted: false,
  micPermissionPending: false,
  silenceTimer: null,
  issueSilenceTimer: null,
  guideState: GUIDE_STATES.HEURISTIC,
  lastGuideAt: 0,
  lastSpeechAt: 0,
  lastRecognizedSpeechAt: 0,
  latestStudentSpeechText: "",
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
  boardDrawRequestId: 0,
  normalSpeechCount: 0,
  stuckCount: 0,
  wrongAttemptCount: 0,
  lastIssueAt: 0,
  silenceCareAskedAt: 0,
  awaitingSilenceFollowup: false,
  silenceGuideStage: 0,
  silenceGuidanceExhausted: false,
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
  clearTimeout(state.openingSpeechWatchdogTimer);
  state.openingSpeechWatchdogTimer = null;
  clearTimeout(state.silenceTimer);
  state.silenceTimer = null;
  clearTimeout(state.pendingThoughtTimer);
  state.pendingThoughtTimer = null;
  clearTimeout(state.recognitionTimer);
  state.recognitionTimer = null;
  clearHandwritingRetryTimer();
  clearIssueSilenceTimer();
  clearTimeout(state.recognitionResumeTimer);
  state.recognitionResumeTimer = null;
  state.silenceGuidePending = false;
  state.guideGeneration += 1;
  state.guideRequestInFlight = null;
  state.guideUnavailableAt = 0;
  state.guideUnavailableQuestionId = "";
  state.guideUnavailableUntil = 0;
  state.activeGuideRequestId += 1;
  state.handwritingRequestId += 1;
  if (state.handwritingActiveRequest) {
    rememberHandwritingRequestStatus(state.handwritingActiveRequest.requestId, "stale");
  }
  state.handwritingActiveRequest = null;
  state.handwritingRequestInFlight = false;
  state.handwritingQueuedReason = "";
  state.handwritingQueuedMeta = null;
  state.boardVerificationUnavailableQuestionId = "";
  state.boardVerificationUnavailableAt = 0;

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
    "lastImmediateHelpAt",
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
  if (!state.currentQuestionCompleted) resetSilenceTimer(false);

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
  if (viewId === "reviewView") renderReviewPage();
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

const NOTEBOOK_STORAGE_KEY = "lian-notebook";
const NOTEBOOK_CLIENT_ID_KEY = "lian-notebook-client-id";
let notebookCloudSyncTimer = null;
let notebookCloudSyncInFlight = false;
let notebookCloudSyncPending = false;

function getNotebookClientId() {
  let id = localStorage.getItem(NOTEBOOK_CLIENT_ID_KEY);
  if (!id) {
    const random =
      window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    id = `client-${random}`;
    localStorage.setItem(NOTEBOOK_CLIENT_ID_KEY, id);
  }
  return id;
}

function notebookCloudHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Lian-Client-Id": getNotebookClientId()
  };
}

function loadNotebook() {
  try {
    return JSON.parse(localStorage.getItem(NOTEBOOK_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveNotebook(options = {}) {
  localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(state.notebook));
  updateNotebookCount();
  if (views.reviewView?.classList.contains("active")) renderReviewPage();
  if (!options.localOnly) scheduleNotebookCloudSync();
}

function getRecordUpdatedAt(record) {
  return new Date(record?.updatedAt || record?.createdAt || 0).getTime() || 0;
}

function mergeNotebookRecords(localRecords, cloudRecords) {
  const byId = new Map();
  [...cloudRecords, ...localRecords].forEach((record) => {
    if (!record?.id) return;
    const existing = byId.get(record.id);
    if (!existing || getRecordUpdatedAt(record) >= getRecordUpdatedAt(existing)) {
      byId.set(record.id, record);
    }
  });
  return [...byId.values()].sort((a, b) => getRecordUpdatedAt(b) - getRecordUpdatedAt(a));
}

async function hydrateNotebookFromCloud() {
  try {
    const response = await fetch("/api/notebook", {
      method: "GET",
      cache: "no-store",
      headers: notebookCloudHeaders()
    });
    if (!response.ok) throw new Error(`notebook cloud load failed: ${response.status}`);
    const payload = await response.json();
    if (!payload.configured) return;
    const cloudRecords = Array.isArray(payload.records) ? payload.records : [];
    const merged = mergeNotebookRecords(state.notebook, cloudRecords);
    const changed = JSON.stringify(merged.map((record) => record.id)) !== JSON.stringify(state.notebook.map((record) => record.id));
    state.notebook = merged;
    saveNotebook({ localOnly: true });
    renderNotebook();
    if (state.notebook.length && (changed || cloudRecords.length < state.notebook.length)) {
      scheduleNotebookCloudSync(0);
    }
  } catch (error) {
    console.warn("[notebook-cloud] load skipped:", error);
  }
}

function scheduleNotebookCloudSync(delay = 700) {
  clearTimeout(notebookCloudSyncTimer);
  notebookCloudSyncTimer = setTimeout(syncNotebookToCloud, delay);
}

async function syncNotebookToCloud() {
  if (notebookCloudSyncInFlight) {
    notebookCloudSyncPending = true;
    return;
  }
  notebookCloudSyncInFlight = true;
  try {
    const response = await fetch("/api/notebook", {
      method: "PUT",
      headers: notebookCloudHeaders(),
      body: JSON.stringify({ records: state.notebook })
    });
    if (!response.ok) throw new Error(`notebook cloud sync failed: ${response.status}`);
    const payload = await response.json();
    if (payload.configured) console.log(`[notebook-cloud] synced ${payload.synced || 0} records`);
  } catch (error) {
    console.warn("[notebook-cloud] sync skipped:", error);
  } finally {
    notebookCloudSyncInFlight = false;
    if (notebookCloudSyncPending) {
      notebookCloudSyncPending = false;
      scheduleNotebookCloudSync(1200);
    }
  }
}

async function deleteNotebookRecordFromCloud(id) {
  try {
    const response = await fetch(`/api/notebook/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: notebookCloudHeaders()
    });
    if (!response.ok) throw new Error(`notebook cloud delete failed: ${response.status}`);
  } catch (error) {
    console.warn("[notebook-cloud] delete skipped:", error);
  }
}

function updateNotebookCount() {
  dom.notebookCount.textContent = String(state.notebook.length);
  const dueCount = getReviewBuckets(state.notebook).due.length;
  if (dom.reviewCount) dom.reviewCount.textContent = String(dueCount);
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

function getStudentInputSnapshot() {
  return {
    boardWriteAt: state.lastBoardWriteAt || 0,
    speechAt: state.lastRecognizedSpeechAt || 0
  };
}

function hasStudentInputSince(snapshot) {
  if (!snapshot) return false;
  return Boolean(
    (state.lastBoardWriteAt || 0) > (snapshot.boardWriteAt || 0) ||
    (state.lastRecognizedSpeechAt || 0) > (snapshot.speechAt || 0)
  );
}

function hasStudentInputSinceHandwritingRecognition() {
  const recognizedAt = state.lastHandwritingRecognizedAt || 0;
  if (!recognizedAt) return false;
  return Boolean(
    (state.lastBoardWriteAt || 0) > recognizedAt ||
      (state.lastRecognizedSpeechAt || 0) > recognizedAt
  );
}

function skipStaleHandwritingFeedback(stage, snapshot, options = {}) {
  // A spoken final answer may arrive while the board request is still in flight.
  // Let that request finish so it can satisfy the board-step gate, but still
  // discard the result when the student has written anything newer.
  if (
    state.waitingForBoardBeforeFinalAnswer &&
    (state.lastBoardWriteAt || 0) <= (snapshot?.boardWriteAt || 0)
  ) {
    return false;
  }
  const hasNewBoard = (state.lastBoardWriteAt || 0) > (snapshot?.boardWriteAt || 0);
  const hasNewSpeech = (state.lastRecognizedSpeechAt || 0) > (snapshot?.speechAt || 0);
  const hasNewInput = options.boardOnly ? hasNewBoard : hasNewBoard || hasNewSpeech;
  if (!hasNewInput) return false;
  console.log("[handwriting] feedback skipped", {
    stage,
    reason: options.boardOnly ? "newer student board input" : "new student board or speech input",
    hasNewBoard,
    hasNewSpeech,
    startedAt: snapshot,
    current: getStudentInputSnapshot()
  });
  dom.lianState.textContent = guideIdleText();
  return true;
}

function startSilenceTimerAfterOpening(questionId, openingStartedAt, source = "opening-finished") {
  if (
    currentPageQuestion()?.id !== questionId ||
    state.currentQuestionCompleted ||
    state.teachSessionPaused
  ) return;

  clearTimeout(state.openingSpeechWatchdogTimer);
  state.openingSpeechWatchdogTimer = null;
  state.openingSpeechInProgress = false;

  // A student input already resets the timer. Do not move the anchor forward
  // when the opening TTS finishes late.
  if (state.lastUserInputAt <= openingStartedAt) {
    state.lastUserInputAt = Date.now();
    resetSilenceTimer(false);
  } else if (!state.silenceTimer) {
    resetSilenceTimer(false);
  }
  console.info("[silence-timer] armed", {
    source,
    questionId,
    delayMs: state.silenceTimer ? SILENCE_CARE_MS : 0,
    lastUserInputAt: state.lastUserInputAt
  });
}

function clearSilenceFollowup() {
  state.awaitingSilenceFollowup = false;
  state.silenceCareAskedAt = 0;
  state.silenceGuideStage = 0;
  state.silenceGuidanceExhausted = false;
}

function markUserInput(type) {
  const now = Date.now();
  state.inputSequenceId += 1;
  state.lastInputEvent = {
    sessionId: state.lectureSessionId,
    sequenceId: state.inputSequenceId,
    type,
    questionId: currentPageQuestion()?.id || "",
    at: now
  };
  // A new student input invalidates any response that was based on the
  // previous board or transcript. This prevents late network/TTS callbacks
  // from writing an answer after the student has already continued.
  state.activeGuideRequestId += 1;
  state.guideGeneration += 1;
  state.guideAbortController?.abort(`new-student-${type}`);
  state.guideAbortController = null;
  state.guideRequestInFlight = null;
  // A failed guide request must not keep retriggering from silence timers.
  // New speech/board input below clears this circuit and permits a fresh try.
  state.guideUnavailableAt = 0;
  state.guideUnavailableQuestionId = "";
  state.guideUnavailableUntil = 0;
  state.lianSpeechRequestId += 1;
  state.openingSpeechInProgress = false;
  stopLianSpeechOutput();
  if (type === "speech") {
    state.lastSpeechAt = now;
    state.lastRecognizedSpeechAt = now;
  }
  if (type === "board") {
    clearHandwritingRetryTimer();
    state.lastBoardWriteAt = now;
    const question = currentPageQuestion();
    if (question?.id) {
      state.boardVersionByQuestion[question.id] =
        Number(state.boardVersionByQuestion[question.id] || 0) + 1;
    }
    state.currentQuestionCompleted = false;
  }
  state.lastUserInputAt = now;

  if (state.awaitingSilenceFollowup || state.silenceGuideStage > 0 || state.silenceGuidanceExhausted) {
    clearSilenceFollowup();
    if (state.guideState === GUIDE_STATES.MICRO_HINT) setGuideState(GUIDE_STATES.HEURISTIC);
  }

  // Silence care is based on student input, not microphone permission.
  // Board and transcript input both reset the same idle timer even when
  // speech recognition has not been started.
  resetSilenceTimer(false);
}

function getBoardVersion(question = currentPageQuestion()) {
  return question?.id ? Number(state.boardVersionByQuestion[question.id] || 0) : 0;
}

function rememberHandwritingRequestStatus(requestId, status) {
  const id = Number(requestId || 0);
  if (!id) return;
  state.handwritingRequestStatusById[id] = status;
  const ids = Object.keys(state.handwritingRequestStatusById)
    .map(Number)
    .sort((left, right) => left - right);
  ids.slice(0, Math.max(0, ids.length - 40)).forEach((oldId) => {
    delete state.handwritingRequestStatusById[oldId];
  });
}

function createHandwritingRequestMeta(question, kind = "recognition") {
  const memory = getQuestionMemory(question);
  return {
    requestId: ++state.handwritingRequestId,
    sessionId: state.answerSessionId,
    interactionSessionId: state.lectureSessionId,
    questionId: question?.id || "",
    boardVersion: getBoardVersion(question),
    memoryId: memory?.memoryId || state.questionMemoryIdsByQuestion[question?.id] || "",
    kind
  };
}

function beginHandwritingRequest(meta) {
  state.handwritingActiveRequest = { ...meta };
  state.handwritingRequestInFlight = true;
  rememberHandwritingRequestStatus(meta.requestId, "running");
}

function isCurrentHandwritingRequest(meta) {
  const active = state.handwritingActiveRequest;
  if (!meta || !active || active.requestId !== meta.requestId) return false;
  if (active.sessionId !== state.answerSessionId || meta.sessionId !== state.answerSessionId) return false;
  if (meta.interactionSessionId !== state.lectureSessionId) return false;
  if (currentPageQuestion()?.id !== meta.questionId) return false;
  if (getBoardVersion(currentPageQuestion()) !== Number(meta.boardVersion)) return false;
  if (meta.memoryId && active.memoryId && meta.memoryId !== active.memoryId) return false;
  return true;
}

function finishHandwritingRequest(meta, status = "completed") {
  rememberHandwritingRequestStatus(meta?.requestId, status);
  if (state.handwritingActiveRequest?.requestId !== meta?.requestId) return;
  state.handwritingActiveRequest = null;
  state.handwritingRequestInFlight = false;
}

function clearHandwritingRetryTimer() {
  clearTimeout(state.handwritingRetryTimer);
  state.handwritingRetryTimer = null;
  state.handwritingRetryPending = false;
}

function scheduleTransientHandwritingRetry(meta, reason) {
  const question = currentPageQuestion();
  if (
    !meta ||
    !question ||
    question.id !== meta.questionId ||
    getBoardVersion(question) !== Number(meta.boardVersion) ||
    state.currentQuestionCompleted ||
    state.teachSessionPaused ||
    !hasCurrentBoardInk(question)
  ) {
    state.handwritingRetryPending = false;
    return;
  }

  const key = `${meta.sessionId}:${meta.questionId}:${meta.boardVersion}`;
  const attempt = Number(state.handwritingRetryCountByKey[key] || 0);
  // One automatic retry is enough. Further retries for the same board
  // version create a visible failure loop and block the save flow.
  if (attempt >= 1) {
    state.handwritingRetryPending = false;
    return;
  }
  state.handwritingRetryCountByKey[key] = attempt + 1;
  const delay = 1200;
  clearHandwritingRetryTimer();
  state.handwritingRetryPending = true;
  console.log("[handwriting] schedule transient retry", {
    key,
    attempt: attempt + 1,
    delay,
    reason
  });
  state.handwritingRetryTimer = setTimeout(() => {
    state.handwritingRetryTimer = null;
    const current = currentPageQuestion();
    if (
      !current ||
      current.id !== meta.questionId ||
      getBoardVersion(current) !== Number(meta.boardVersion) ||
      state.currentQuestionCompleted ||
      !hasCurrentBoardInk(current)
    ) {
      state.handwritingRetryPending = false;
      return;
    }
    state.handwritingRetryPending = false;
    scheduleHandwritingRecognition(`${reason}：临时故障自动重试`);
  }, delay);
}

function getInteractionToken() {
  return {
    sessionId: state.lectureSessionId,
    sequenceId: state.inputSequenceId,
    questionId: currentPageQuestion()?.id || ""
  };
}

function isCurrentInteraction(token) {
  if (!token) return true;
  return (
    token.sessionId === state.lectureSessionId &&
    token.sequenceId === state.inputSequenceId &&
    token.questionId === (currentPageQuestion()?.id || "") &&
    !state.teachSessionPaused
  );
}

function interruptGuideForStudentSpeech() {
  if (state.currentQuestionCompleted) return;
  clearTimeout(state.pendingThoughtTimer);
  state.pendingThoughtTimer = null;
  state.activeGuideRequestId += 1;
  state.guideAbortController?.abort("new-student-speech");
  state.guideAbortController = null;
  state.guideRequestInFlight = null;
  state.lianSpeechRequestId += 1;
  state.lianSpeechPausedRecognition = false;
  stopLianSpeechOutput();
  dom.lianAvatar.classList.remove("speaking");
  dom.lianAvatar.classList.add("listening");
  dom.lianState.textContent = "安静听你讲";
}

function stopLianSpeechOutput() {
  if (state.lianTtsAbortController) {
    try {
      state.lianTtsAbortController.abort();
    } catch {
      // The request may already have completed.
    }
    state.lianTtsAbortController = null;
  }
  clearInterval(state.lianSpeechKeepAliveTimer);
  state.lianSpeechKeepAliveTimer = null;
  const utterance = state.currentLianUtterance;
  if (utterance && typeof utterance.pause === "function") {
    try {
      utterance.pause();
      utterance.removeAttribute?.("src");
      utterance.load?.();
    } catch {
      // Audio may already be released.
    }
  }
  state.currentLianUtterance = null;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function createBoundedAbortController(parentSignal, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromParent = () => controller.abort(parentSignal?.reason);
  if (parentSignal) {
    if (parentSignal.aborted) abortFromParent();
    else parentSignal.addEventListener("abort", abortFromParent, { once: true });
  }
  return {
    signal: controller.signal,
    abort(reason = "cancelled") {
      if (!controller.signal.aborted) controller.abort(reason);
    },
    cleanup() {
      clearTimeout(timeout);
      parentSignal?.removeEventListener("abort", abortFromParent);
    }
  };
}

function getLianAudioElement() {
  if (state.lianAudioElement) return state.lianAudioElement;
  const audio = new Audio();
  audio.preload = "auto";
  audio.volume = LIAN_VOICE_VOLUME;
  state.lianAudioElement = audio;
  return audio;
}

function unlockLianAudio() {
  if (state.lianAudioUnlocked || state.lianAudioUnlockPromise) return state.lianAudioUnlockPromise;
  const audio = getLianAudioElement();
  const silentWav =
    "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAA";
  audio.muted = true;
  audio.src = silentWav;
  state.lianAudioUnlockPromise = audio.play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      state.lianAudioUnlocked = true;
      return true;
    })
    .catch((error) => {
      console.warn("[tts] audio unlock failed:", error?.name || error);
      state.lianAudioUnlockPromise = null;
      return false;
    });
  return state.lianAudioUnlockPromise;
}

function primeLianCloudSpeech(text) {
  const speechText = prepareLianSpeechText(text);
  if (state.isMuted || !speechText) return Promise.resolve(null);
  if (state.lianTtsPrefetch?.text === speechText) return Promise.resolve(state.lianTtsPrefetch.blob);
  if (state.lianTtsPrefetchPromise?.text === speechText) return state.lianTtsPrefetchPromise.promise;

  const promise = (async () => {
    const requestControl = createBoundedAbortController(null, LIAN_TTS_REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speechText, responseId: "lian-prefetch" }),
        signal: requestControl.signal
      });
      if (!response.ok) return null;
      const blob = await response.blob();
      if (!blob.size) return null;
      state.lianTtsPrefetch = { text: speechText, blob, createdAt: Date.now() };
      return blob;
    } catch (error) {
      console.warn("[tts] cloud prefetch failed:", error?.message || error);
      return null;
    } finally {
      requestControl.cleanup();
      if (state.lianTtsPrefetchPromise?.text === speechText) state.lianTtsPrefetchPromise = null;
    }
  })();
  state.lianTtsPrefetchPromise = { text: speechText, promise };
  return promise;
}

if (typeof document !== "undefined") {
  const unlockFromUserGesture = () => {
    void unlockLianAudio();
  };
  document.addEventListener("pointerdown", unlockFromUserGesture, { capture: true, passive: true });
  document.addEventListener("keydown", unlockFromUserGesture, { capture: true, passive: true });
}

function pauseRecognitionForLianSpeech() {
  if (!state.isListening || !state.speechRecognition || state.teachSessionPaused) return false;
  state.lianSpeechPausedRecognition = true;
  stopSpeechNoResultTimer();
  clearSpeechDraft();
  try {
    state.speechRecognition.stop();
  } catch {
    // The browser may already be between recognition sessions.
  }
  dom.studentAvatar.classList.remove("speaking");
  dom.studentState.textContent = "听恋恋说";
  return true;
}

function resumeRecognitionAfterLianSpeech() {
  if (!state.lianSpeechPausedRecognition) return;
  state.lianSpeechPausedRecognition = false;
  if (!state.isListening || state.teachSessionPaused || !state.speechRecognition) return;
  clearTimeout(state.recognitionResumeTimer);
  state.recognitionResumeTimer = setTimeout(() => {
    if (!state.isListening || state.teachSessionPaused || state.lianSpeechPausedRecognition) return;
    try {
      state.speechRecognition.start();
      dom.studentState.textContent = "正在收听";
      startSpeechNoResultTimer();
    } catch {
      dom.studentState.textContent = "正在收听";
    }
  }, 180);
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
  const issueKey = `${result.issueType}:${result.errorLocation || ""}:${result.errorEvidence || result.issueSummary || ""}`;
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

async function prepareGuideImage(dataUrl, { maxSide = GUIDE_IMAGE_MAX_SIDE, quality = GUIDE_IMAGE_JPEG_QUALITY } = {}) {
  if (!dataUrl || typeof dataUrl !== "string") return "";
  if (!dataUrl.startsWith("data:image/")) return dataUrl;

  const cacheKey = `${maxSide}:${quality}:${dataUrl.length}:${dataUrl.slice(0, 24)}:${dataUrl.slice(-24)}`;
  const cached = guideImageCache.get(cacheKey);
  if (cached) return cached;

  const image = await loadImage(dataUrl);
  const sourceWidth = image.naturalWidth || image.width || 0;
  const sourceHeight = image.naturalHeight || image.height || 0;
  if (!sourceWidth || !sourceHeight) return dataUrl;

  const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  const prepared = canvas.toDataURL("image/jpeg", quality);

  guideImageCache.set(cacheKey, prepared);
  while (guideImageCache.size > GUIDE_IMAGE_CACHE_LIMIT) {
    guideImageCache.delete(guideImageCache.keys().next().value);
  }
  console.info("[guide] image-prepared", {
    sourceWidth,
    sourceHeight,
    width,
    height,
    sourceChars: dataUrl.length,
    preparedChars: prepared.length
  });
  return prepared;
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
  const files = [...(event.dataTransfer.files || [])];
  if (files.length) handleImageFiles(files);
});

dom.imageInput.addEventListener("change", (event) => {
  const files = [...(event.target.files || [])];
  if (files.length) handleImageFiles(files);
});

dom.replaceImageBtn.addEventListener("click", () => dom.imageInput.click());
dom.clearImageBtn.addEventListener("click", resetUpload);

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("请选择图片文件"));
      return;
    }
    const uploadStartedAt = performance.now();
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileReadFinishedAt = performance.now();
        const dataUrl = reader.result;
        const imageDecodeStartedAt = performance.now();
        const image = await loadImage(dataUrl);
        const imageDecodedAt = performance.now();
        resolve({
          dataUrl,
          width: image.naturalWidth,
          height: image.naturalHeight,
          name: file.name,
          timing: {
            uploadStartedAt,
            fileReadMs: Math.round(fileReadFinishedAt - uploadStartedAt),
            imageDecodeMs: Math.round(imageDecodedAt - imageDecodeStartedAt)
          }
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("上传失败，请换一张图片"));
    reader.readAsDataURL(file);
  });
}

async function handleImageFiles(files) {
  const imageFiles = [...files].filter((file) => file?.type?.startsWith("image/"));
  if (!imageFiles.length) {
    setStatus(dom.uploadState, "请选择图片文件");
    return;
  }

  setManualMode(false);
  state.sources = [];
  state.source = null;
  state.questions = [];
  state.selectedIds = [];
  state.segmentDebug = null;
  state.segmentTiming = null;
  renderSegmentDebug();
  renderQuestions();
  dom.previewPanel.classList.remove("hidden");
  dom.dropZone.classList.add("hidden");
  dom.processingBox.classList.remove("hidden");
  setStatus(dom.uploadState, imageFiles.length > 1 ? `正在上传 ${imageFiles.length} 张图片` : "上传中");
  setStatus(dom.segmentState, imageFiles.length > 1 ? `准备依次分割 ${imageFiles.length} 张图片` : "AI 分割中");

  const batchStartedAt = performance.now();
  let totalCreated = 0;
  for (let index = 0; index < imageFiles.length; index += 1) {
    const file = imageFiles[index];
    try {
      setStatus(dom.uploadState, `正在处理第 ${index + 1}/${imageFiles.length} 张`);
      const source = await readImageFile(file);
      source.id = safeNowId("source");
      source.batchIndex = index + 1;
      source.batchTotal = imageFiles.length;
      state.sources.push(source);
      state.source = source;
      state.activeSourceIndex = index;
      state.segmentTiming = source.timing;
      dom.sourcePreview.src = source.dataUrl;
      const beforeCount = state.questions.length;
      await runAutoSegment({
        fromUpload: true,
        append: true,
        batchIndex: index + 1,
        batchTotal: imageFiles.length
      });
      totalCreated += Math.max(0, state.questions.length - beforeCount);
    } catch (error) {
      console.warn("[upload-batch] image failed", file?.name, error);
      setStatus(dom.segmentState, `第 ${index + 1} 张处理失败，继续处理下一张`);
    }
  }

  dom.processingBox.classList.add("hidden");
  if (state.sources.length) setActiveSourceIndex(0);
  const seconds = ((performance.now() - batchStartedAt) / 1000).toFixed(1);
  setStatus(dom.uploadState, imageFiles.length > 1 ? `已上传 ${imageFiles.length} 张图片` : "图片已上传");
  setStatus(dom.segmentState, totalCreated
    ? `已从 ${imageFiles.length} 张图片识别 ${state.questions.length} 道题目 · 总耗时 ${seconds} 秒`
    : `AI 没有可靠拆出单题，请改用手动框选 · 总耗时 ${seconds} 秒`);
}

function resetUpload() {
  state.source = null;
  state.sources = [];
  state.activeSourceIndex = 0;
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

function activeSource() {
  if (!state.sources.length) return state.source;
  return state.sources[state.activeSourceIndex] || state.sources[0] || null;
}

function setActiveSourceIndex(index) {
  if (!state.sources.length) return;
  const nextIndex = Math.max(0, Math.min(index, state.sources.length - 1));
  state.activeSourceIndex = nextIndex;
  state.source = state.sources[nextIndex];
  state.segmentDebug = state.source?.segmentDebug || null;
  dom.sourcePreview.src = state.source.dataUrl;
  clearManualSelection();
  renderManualSelection();
  renderSegmentDebug();
  renderQuestions();
}

function changeActiveSource(direction) {
  if (state.sources.length <= 1) return;
  setActiveSourceIndex(state.activeSourceIndex + direction);
}

function updateSourcePagerUI() {
  const buttons = [
    dom.previewPrevImageBtn,
    dom.previewNextImageBtn,
    dom.questionsPrevImageBtn,
    dom.questionsNextImageBtn
  ].filter(Boolean);
  const hasPages = state.sources.length > 1;
  buttons.forEach((button) => button.classList.toggle("hidden", !hasPages));
  if (!hasPages) return;
  [dom.previewPrevImageBtn, dom.questionsPrevImageBtn].forEach((button) => {
    if (button) button.disabled = state.activeSourceIndex <= 0;
  });
  [dom.previewNextImageBtn, dom.questionsNextImageBtn].forEach((button) => {
    if (button) button.disabled = state.activeSourceIndex >= state.sources.length - 1;
  });
}

[
  dom.previewPrevImageBtn,
  dom.questionsPrevImageBtn
].forEach((button) => button?.addEventListener("click", () => changeActiveSource(-1)));

[
  dom.previewNextImageBtn,
  dom.questionsNextImageBtn
].forEach((button) => button?.addEventListener("click", () => changeActiveSource(1)));

dom.autoSegmentBtn.addEventListener("click", () => runAutoSegmentForLoadedSources());

async function runAutoSegmentForLoadedSources() {
  if (!state.sources.length || state.sources.length === 1) {
    await runAutoSegment();
    return;
  }

  setManualMode(false);
  state.questions = [];
  state.selectedIds = [];
  state.segmentDebug = null;
  renderSegmentDebug();
  renderQuestions();
  dom.processingBox.classList.remove("hidden");
  const batchStartedAt = performance.now();
  for (let index = 0; index < state.sources.length; index += 1) {
    const source = state.sources[index];
    if (!source.id) source.id = safeNowId("source");
    state.source = source;
    state.activeSourceIndex = index;
    state.segmentTiming = source.timing || { uploadStartedAt: performance.now(), fileReadMs: 0, imageDecodeMs: 0 };
    dom.sourcePreview.src = source.dataUrl;
    await runAutoSegment({
      fromUpload: true,
      append: true,
      batchIndex: index + 1,
      batchTotal: state.sources.length
    });
  }
  dom.processingBox.classList.add("hidden");
  setActiveSourceIndex(0);
  setStatus(
    dom.segmentState,
    `已从 ${state.sources.length} 张图片识别 ${state.questions.length} 道题目 · 总耗时 ${((performance.now() - batchStartedAt) / 1000).toFixed(1)} 秒`
  );
}

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
  const batchLabel = options.batchTotal > 1
    ? `第 ${options.batchIndex}/${options.batchTotal} 张`
    : "";
  setStatus(dom.segmentState, batchLabel ? `${batchLabel} AI 分割中` : "AI 分割中");

  let segments = [];
  let usedApi = false;
  let segmentFailureNote = "";
  try {
    const initialApiStartedAt = performance.now();
    const result = await requestAISegmentation("initial");
    segmentFailureNote = result?.note || "";
    clientTimings.initialApiRoundTripMs = Math.round(performance.now() - initialApiStartedAt);
    serverTimings.initial = result?.timings || null;
    state.segmentDebug = result?.debug || null;
    if (state.source) state.source.segmentDebug = state.segmentDebug;
    renderSegmentDebug();
    const initialNormalizationStartedAt = performance.now();
    segments = normalizeSegmentResult(result);
    clientTimings.resultNormalizationMs += Math.round(performance.now() - initialNormalizationStartedAt);
    const initialHadOnlyRejectedBoxes = !segments.length && Array.isArray(result?.questions) && result.questions.length > 0;
    const canStrictRetry = result?.allowStrictRetry === true && result?.cacheHit !== true;
    if (canStrictRetry && !result?.fallbackToWholePage && (needsStrictWholePageRetry(segments) || initialHadOnlyRejectedBoxes)) {
      setStatus(dom.segmentState, batchLabel ? `${batchLabel} 正在重新分析整页题目结构` : "正在重新分析整页题目结构");
      const strictApiStartedAt = performance.now();
      const strictResult = await requestAISegmentation("strict_structure");
      segmentFailureNote = strictResult?.note || segmentFailureNote;
      clientTimings.strictRetryRoundTripMs = Math.round(performance.now() - strictApiStartedAt);
      serverTimings.strict = strictResult?.timings || null;
      if (strictResult?.debug && state.source) {
        state.segmentDebug = strictResult.debug;
        state.source.segmentDebug = strictResult.debug;
      }
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
    segmentFailureNote = error?.message || "AI 分割接口请求失败";
    state.segmentDebug = null;
    renderSegmentDebug();
  }

  if (!segments.length) {
    if (!options.append) {
      dom.processingBox.classList.add("hidden");
      state.questions = [];
      state.selectedIds = [];
    }
    const renderStartedAt = performance.now();
    renderQuestions();
    clientTimings.renderMs = Math.round(performance.now() - renderStartedAt);
    const completedTimings = completeSegmentationTiming(
      clientTimings,
      serverTimings,
      segmentationStartedAt,
      uploadStartedAt
    );
    const reason = segmentFailureNote
      ? `${segmentFailureNote} · `
      : "AI 没有可靠拆出单题，请改用手动框选 · ";
    setStatus(dom.segmentState, `${batchLabel ? `${batchLabel} ` : ""}${reason}总耗时 ${(completedTimings.uploadToPresentedMs / 1000).toFixed(1)} 秒`);
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
        index: state.questions.length + questions.length + 1,
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

  if (options.append) {
    state.questions.push(...questions);
    questions.forEach((question) => {
      if (!state.selectedIds.includes(question.id)) state.selectedIds.push(question.id);
    });
  } else {
    state.questions = questions;
    state.selectedIds = questions.map((question) => question.id);
  }
  if (!options.append) dom.processingBox.classList.add("hidden");
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
  setStatus(dom.segmentState, `${batchLabel ? `${batchLabel} ` : ""}${statusMessage} · 总耗时 ${(completedTimings.uploadToPresentedMs / 1000).toFixed(1)} 秒`);
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
        const sourceNumber = String(item.sourceQuestionNumber || item.questionNumber || item.number || "").trim();
        const receivedBox = item.finalBox && typeof item.finalBox === "object" ? item.finalBox : item;
        const finalBox = clampSegmentBox(receivedBox, sourceSize.width, sourceSize.height, {
          hasVerifiedQuestionNumber: Boolean(sourceNumber)
        });
        if (!finalBox) {
          console.warn("[segment-normalize] invalid finalBox; question skipped", item);
          return null;
        }
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
        const sourceNumber = String(item?.sourceQuestionNumber || item?.questionNumber || item?.number || "").trim();
        const fallbackBox = clampSegmentBox(item?.finalBox || item || {}, sourceSize.width, sourceSize.height, {
          hasVerifiedQuestionNumber: Boolean(sourceNumber)
        });
        if (!fallbackBox) return null;
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

function clampSegmentBox(item, width, height, options = {}) {
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
  const minimumHeight = options.hasVerifiedQuestionNumber
    ? Math.max(8, height * 0.008)
    : height * 0.035;
  if (safeW < width * 0.05 || safeH < minimumHeight) return null;
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
    sourceId: state.source?.id || "",
    sourceIndex: state.source?.batchIndex || state.activeSourceIndex + 1 || 1,
    sourceName: state.source?.name || "",
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

  const source = activeSource();
  const hasSourcePages = state.sources.length > 1;
  const visibleQuestions = hasSourcePages && source?.id
    ? state.questions.filter((question) => question.sourceId === source.id)
    : state.questions;

  visibleQuestions.forEach((question, visibleIndex) => {
    const index = state.questions.findIndex((item) => item.id === question.id);
    const template = $("#questionCardTemplate");
    const card = template.content.firstElementChild.cloneNode(true);
    const selectedIndex = state.selectedIds.indexOf(question.id);
    card.classList.toggle("selected", selectedIndex >= 0);
    card.dataset.id = question.id;
    $("img", card).src = question.image;
    const sourceNumber = question.sourceQuestionNumber || question.questionNumber || "";
    const displayIndex = question.displayIndex || visibleIndex + 1;
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
  const currentSelectedCount = visibleQuestions.filter((question) => state.selectedIds.includes(question.id)).length;
  dom.selectedSummary.textContent = count ? `已选择 ${count} 道题` : "未选择题目";
  dom.selectedHint.textContent = hasSourcePages
    ? `当前第 ${state.activeSourceIndex + 1}/${state.sources.length} 张，当前页 ${currentSelectedCount}/${visibleQuestions.length} 道已选`
    : count
      ? "将按卡片上的数字依次讲解"
      : "可多选，按选择顺序讲解";
  dom.clearSelectionBtn.disabled = count === 0;
  dom.startLectureBtn.disabled = count === 0;
  updateSourcePagerUI();
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

dom.clearSelectionBtn.addEventListener("click", () => {
  if (!state.selectedIds.length) return;
  state.selectedIds = [];
  renderQuestions();
  setStatus(dom.segmentState, "已取消全部选择，可重新选择要讲解的题目");
});

dom.startLectureBtn.addEventListener("click", () => {
  const queue = state.selectedIds
    .map((id) => state.questions.find((question) => question.id === id))
    .filter(Boolean);
  if (!queue.length) return;
  void unlockLianAudio();
  startLecture(queue);
});

function startLecture(queue) {
  state.answerSessionId += 1;
  state.handwritingRequestId += 1;
  state.handwritingActiveRequest = null;
  state.handwritingRequestInFlight = false;
  state.handwritingQueuedReason = "";
  state.handwritingQueuedMeta = null;
  queue.forEach((question) => {
    delete state.questionMemoryStatusByQuestion[question.id];
    delete state.questionMemoriesByQuestion[question.id];
    delete state.questionMemoryFetchPromises[question.id];
    state.questionMemoryIdsByQuestion[question.id] = `qm:${state.answerSessionId}:${question.id}`;
  });
  state.lecture = queue.map((question, index) => ({
    ...question,
    title: question.title || `第 ${index + 1} 题`
  }));
  state.currentLectureIndex = 0;
  state.completedThisSession = [];
  state.completedLectureQuestionIds = new Set();
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
  state.waitingForBoardBeforeFinalAnswer = false;
  state.finalAnswerVerified = false;
  state.verifiedFinalAnswerText = "";
  state.boardCompletionVerified = false;
  state.completionCheckInProgress = false;
  state.boardVerificationUnavailableQuestionId = "";
  state.boardVerificationUnavailableAt = 0;
  state.currentQuestionCompleted = false;
  state.hasExplicitFinalAnswer = false;
  state.pendingLianQuestion = null;
  state.pendingLianOpeningText = pickPrompt("lecture-opening", [
    "我们开始讲解这道错题吧。你慢慢说，先从题目给了什么条件开始。",
    "现在开始看这道题，你先说说题目给了哪些条件。",
    "不用着急，我们从已知条件讲起，你按自己的思路慢慢说。",
    "来，先把题目里的条件说一遍，我跟着你一起理顺。"
  ]);
  void primeLianCloudSpeech(state.pendingLianOpeningText);
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
  // 开场提示由 lianSpeak 统一发布，避免文字先出现但对应语音尚未播放。
  dom.lianBubble.textContent = "";
  const now = Date.now();
  state.lastGuideAt = 0;
  state.lastSpeechAt = now;
  state.lastRecognizedSpeechAt = 0;
  state.latestStudentSpeechText = "";
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
  state.guideGeneration += 1;
  state.guideRequestInFlight = null;
  state.guideUnavailableAt = 0;
  state.guideUnavailableQuestionId = "";
  state.guideUnavailableUntil = 0;
  state.openingSpeechInProgress = true;
  const openingQuestionId = question.id;
  const openingStartedAt = state.lastUserInputAt;
  requestAnimationFrame(() => {
    resizeBoardCanvas();
    loadCurrentPage();
    updatePageLabel();
    const openingText = state.pendingLianOpeningText || pickPrompt("lecture-opening", [
      "我们开始讲解这道错题吧。你慢慢说，先从题目给了什么条件开始。",
      "现在开始看这道题，你先说说题目给了哪些条件。",
      "不用着急，我们从已知条件讲起，你按自己的思路慢慢说。",
      "来，先把题目里的条件说一遍，我跟着你一起理顺。"
    ]);
    state.pendingLianOpeningText = "";
    void lianSpeak(openingText, { isOpeningSpeech: true }).finally(() => {
      startSilenceTimerAfterOpening(openingQuestionId, openingStartedAt, "opening-finished");
    });
    // Do not let a stalled cloud TTS request prevent the student-observation
    // timer from ever starting. The opening text may remain visible, but the
    // tutoring state must still progress after this safety window.
    clearTimeout(state.openingSpeechWatchdogTimer);
    state.openingSpeechWatchdogTimer = setTimeout(() => {
      if (state.openingSpeechInProgress) {
        startSilenceTimerAfterOpening(openingQuestionId, openingStartedAt, "opening-watchdog");
      }
    }, 15000);
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
  const boardRect = dom.blackboard.getBoundingClientRect();
  const rect = previousRect.width && previousRect.height
    ? previousRect
    : {
        width: dom.blackboard.clientWidth || boardRect.width,
        height: dom.blackboard.clientHeight || boardRect.height
      };
  if (!rect.width || !rect.height) return;
  const ratio = window.devicePixelRatio || 1;
  const nextPixelWidth = Math.round(rect.width * ratio);
  const nextPixelHeight = Math.round(rect.height * ratio);
  const sameCanvasSize = dom.canvas.width === nextPixelWidth && dom.canvas.height === nextPixelHeight;
  if (sameCanvasSize && options.existingImage === undefined && !options.force) {
    applyBoardImageState();
    return;
  }
  const oldPixelWidth = dom.canvas.width;
  const oldPixelHeight = dom.canvas.height;
  const oldImage = options.existingImage ?? (oldPixelWidth ? dom.canvas.toDataURL("image/png") : "");
  const oldRatio = previousRect.width ? oldPixelWidth / previousRect.width : ratio;
  const oldCssSize = {
    width: oldPixelWidth && oldRatio ? oldPixelWidth / oldRatio : previousRect.width || rect.width,
    height: oldPixelHeight && oldRatio ? oldPixelHeight / oldRatio : previousRect.height || rect.height
  };
  state.boardDrawRequestId += 1;
  dom.canvas.width = nextPixelWidth;
  dom.canvas.height = nextPixelHeight;
  dom.canvas.style.width = "100%";
  dom.canvas.style.height = "100%";
  ctx = dom.canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  clearCanvasOnly();
  if (oldImage) {
    const question = currentPageQuestion();
    drawDataUrlToCanvas(oldImage, {
      ...(options.preserveExistingSize ? oldCssSize : {}),
      questionId: question?.id || "",
      pageIndex: state.boardPageIndex,
      onDraw: options.onRestored
    });
  } else if (typeof options.onRestored === "function") {
    options.onRestored();
  }
  applyBoardImageState();
}

function scheduleBoardCanvasResize() {
  if (!views.teachView.classList.contains("active")) return;
  if (state.drawing || state.imageDragging || state.tool === "moveImage") return;
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
  const drawRequestId = ++state.boardDrawRequestId;
  const image = new Image();
  image.onload = () => {
    if (drawRequestId !== state.boardDrawRequestId) return;
    if (options.questionId && currentPageQuestion()?.id !== options.questionId) return;
    if (Number.isFinite(options.pageIndex) && state.boardPageIndex !== options.pageIndex) return;
    const rect = dom.canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const width = options.width || Math.min(rect.width, image.naturalWidth / ratio || rect.width);
    const height = options.height || Math.min(rect.height, image.naturalHeight / ratio || rect.height);
    clearCanvasOnly();
    ctx.drawImage(image, 0, 0, width, height);
    if (typeof options.onDraw === "function") options.onDraw();
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

function canvasHasVisibleInk() {
  if (!dom.canvas?.width || !dom.canvas?.height) return false;
  try {
    const { data } = ctx.getImageData(0, 0, dom.canvas.width, dom.canvas.height);
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] > 8) return true;
    }
  } catch (error) {
    console.warn("[handwriting] canvas ink check failed:", error);
  }
  return false;
}

function hasCurrentBoardInk(question = currentPageQuestion()) {
  if (!question) return false;
  return Boolean(state.boardInkByQuestion[question.id]) || canvasHasVisibleInk();
}

function markCurrentBoardInk(question = currentPageQuestion()) {
  if (question) {
    // A new stroke supersedes any retry scheduled for an older snapshot.
    clearHandwritingRetryTimer();
    state.boardInkByQuestion[question.id] = true;
    state.boardCompletionVerified = false;
    state.currentQuestionCompleted = false;
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
  state.boardInkByQuestion[question.id] = canvasHasVisibleInk();
}

function loadCurrentPage() {
  const question = currentPageQuestion();
  applyBoardHeight(question);
  clearCanvasOnly();
  if (!question) return;
  dom.transcriptInput.value = state.transcriptsByQuestion[question.id] || "";
  dom.transcriptInput.scrollTop = dom.transcriptInput.scrollHeight;
  // Entering a question is the only place that may create its Question Memory.
  // Returning to the same question reuses the frozen terminal result, including
  // an unavailable result, so board recognition can never trigger a retry.
  void initializeQuestionMemory(question);
  if (dom.boardQuestionImage.src !== question.image) dom.boardQuestionImage.src = question.image;
  const pages = pagesForQuestion(question.id);
  drawDataUrlToCanvas(pages[0] || "", {
    questionId: question.id,
    pageIndex: state.boardPageIndex,
    onDraw: () => {
      state.boardInkByQuestion[question.id] = canvasHasVisibleInk();
    }
  });
  applyBoardImageState();
}

function freezeQuestionMemory(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach((item) => freezeQuestionMemory(item));
  return Object.freeze(value);
}

function normalizeQuestionMemory(question, payload = {}) {
  const source = payload?.questionMemory && typeof payload.questionMemory === "object"
    ? payload.questionMemory
    : payload;
  return freezeQuestionMemory({
    version: Number(source.version) || 1,
    memoryId: String(source.memoryId || state.questionMemoryIdsByQuestion[question.id] || ""),
    sessionId: Number(source.sessionId || state.answerSessionId || 0),
    questionId: String(source.questionId || question.id || ""),
    ready: Boolean(source.ready),
    status: String(source.status || "unverified"),
    confidence: Number(source.confidence) || 0,
    canonicalAnswer: String(source.canonicalAnswer || "").trim(),
    acceptedAnswers: Array.isArray(source.acceptedAnswers) ? source.acceptedAnswers : [],
    choiceAnalysis: source.choiceAnalysis || {
      options: [],
      statementVerdicts: [],
      selectedOption: "",
      selectedOptionText: ""
    },
    problemText: String(source.problemText || "").trim(),
    questionType: String(source.questionType || "").trim(),
    knowledge: String(source.knowledge || "").trim(),
    givenConditions: Array.isArray(source.givenConditions) ? source.givenConditions : [],
    solutionOutline: Array.isArray(source.solutionOutline) ? source.solutionOutline : [],
    verificationChecks: Array.isArray(source.verificationChecks) ? source.verificationChecks : [],
    studentTrace: source.studentTrace || null,
    reason: String(source.reason || "").trim(),
    provider: String(source.provider || ""),
    elapsedMs: Number(source.elapsedMs) || 0,
    createdAt: String(source.createdAt || new Date().toISOString())
  });
}

function getQuestionMemory(question) {
  const memory = question?.id ? state.questionMemoriesByQuestion[question.id] || null : null;
  if (!memory || Number(memory.sessionId || 0) !== Number(state.answerSessionId || 0)) return null;
  return memory;
}

async function initializeQuestionMemory(question) {
  if (!question?.id || !question.image) return null;
  const requestSessionId = state.answerSessionId;
  const memoryId = state.questionMemoryIdsByQuestion[question.id] ||
    `qm:${requestSessionId}:${question.id}`;
  state.questionMemoryIdsByQuestion[question.id] = memoryId;
  const currentStatus = state.questionMemoryStatusByQuestion[question.id];
  if (currentStatus === "loading") {
    return state.questionMemoryFetchPromises[question.id]
      ? await state.questionMemoryFetchPromises[question.id]
      : null;
  }
  if (currentStatus) return getQuestionMemory(question);

  state.questionMemoryStatusByQuestion[question.id] = "loading";
  let request;
  request = (async () => {
    try {
      const response = await fetch("/api/question-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          questionImage: question.image,
          problemText: question.problemText || "",
          sessionId: requestSessionId,
          memoryId
        })
      });
      const result = await response.json().catch(() => ({}));
      const memory = normalizeQuestionMemory(question, response.ok ? result : {
        status: result.status || result.code || "request-error",
        reason: result.error || "standard answer service unavailable"
      });
      if (
        state.answerSessionId !== requestSessionId ||
        state.questionMemoryIdsByQuestion[question.id] !== memoryId ||
        state.questionMemoryFetchPromises[question.id] !== request
      ) return null;
      state.questionMemoriesByQuestion[question.id] = memory;
      state.questionMemoryStatusByQuestion[question.id] = memory.ready ? "ready" : "unavailable";
      return memory;
    } catch (error) {
      const memory = normalizeQuestionMemory(question, {
        status: "network-error",
        reason: error?.message || "standard answer service unavailable"
      });
      if (
        state.answerSessionId !== requestSessionId ||
        state.questionMemoryIdsByQuestion[question.id] !== memoryId ||
        state.questionMemoryFetchPromises[question.id] !== request
      ) return null;
      state.questionMemoriesByQuestion[question.id] = memory;
      state.questionMemoryStatusByQuestion[question.id] = "unavailable";
      return memory;
    } finally {
      if (state.questionMemoryFetchPromises[question.id] === request) {
        delete state.questionMemoryFetchPromises[question.id];
      }
    }
  })();
  state.questionMemoryFetchPromises[question.id] = request;
  return await request;
}

async function waitForEnteredQuestionMemory(question) {
  const memory = getQuestionMemory(question);
  if (memory) return memory;
  const pending = question?.id ? state.questionMemoryFetchPromises[question.id] : null;
  return pending ? await pending : null;
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
    preserveExistingSize: true,
    onRestored: saveCurrentPage
  });
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
  const hasMeasuredBoard = Boolean(dom.blackboard.clientWidth || rect.width);
  const boardWidth = dom.blackboard.clientWidth || rect.width || 900;
  const boardHeight = dom.blackboard.clientHeight || rect.height || 560;
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
  const boardWidth = dom.blackboard.clientWidth || rect.width || 900;
  const boardHeight = dom.blackboard.clientHeight || rect.height || 560;
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
  const boardRect = dom.canvas.getBoundingClientRect();
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
  // Invalidate an earlier guide as soon as the student starts a new stroke.
  // Waiting for pointerup lets stale speech continue while the student is writing.
  markUserInput("board");
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
    const strokeHadInk = state.strokeHasInk;
    state.drawing = false;
    state.strokeHasInk = false;
    state.lastPoint = null;
    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";
    dom.studentAvatar.classList.remove("speaking");
    dom.studentState.textContent = "继续讲题";
    saveCurrentPage();
    const shouldRecognize = hasCurrentBoardInk() && (strokeHadInk || state.tool === "eraser" || canvasHasVisibleInk());
    if (shouldRecognize) {
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
  const question = currentPageQuestion();
  drawDataUrlToCanvas(previous, {
    questionId: question?.id || "",
    pageIndex: state.boardPageIndex
  });
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

function resetQuestionGuideState(options = {}) {
  const now = Date.now();
  clearTimeout(state.openingSpeechWatchdogTimer);
  state.openingSpeechWatchdogTimer = null;
  state.lectureSessionId += 1;
  state.inputSequenceId = 0;
  state.lastInputEvent = null;
  setGuideState(GUIDE_STATES.HEURISTIC);
  clearPendingThought();
  clearTimeout(state.recognitionTimer);
  clearHandwritingRetryTimer();
  state.lastSpeechAt = now;
  state.lastRecognizedSpeechAt = 0;
  state.latestStudentSpeechText = "";
  state.lastBoardWriteAt = 0;
  state.lastHandwritingRecognizedAt = 0;
  state.lastUserInputAt = now;
  state.lastEncourageAt = now;
  state.normalSpeechCount = 0;
  state.stuckCount = 0;
  state.currentQuestionCompleted = false;
  state.hasExplicitFinalAnswer = false;
  state.pendingFinalAnswerText = "";
  state.waitingForBoardBeforeFinalAnswer = false;
  state.pendingLianQuestion = null;
  clearIssueTracking();
  clearSilenceFollowup();
  state.activeGuideRequestId += 1;
  state.lianSpeechRequestId += 1;
  state.transcriptCorrectionRequestId += 1;
  state.handwritingRequestId += 1;
  state.handwritingRetryCountByKey = {};
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  stopLianSpeechOutput();
  dom.lianAvatar.classList.remove("speaking");
  dom.lianAvatar.classList.add("listening");
  state.awaitingFinalAnswer = false;
  state.waitingForBoardBeforeFinalAnswer = false;
  state.finalAnswerVerified = false;
  state.verifiedFinalAnswerText = "";
  state.boardCompletionVerified = false;
  state.completionCheckInProgress = false;
  state.autoSavePromptedQuestionId = "";
  state.silenceGuidePending = false;
  state.openingSpeechInProgress = options.speak !== false;
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
  if (options.speak !== false) {
    const questionId = currentPageQuestion()?.id || "";
    const speechStartedAt = state.lastUserInputAt;
    void lianSpeak(dom.lianBubble.textContent, {
      dedupeKey: `question-change:${questionId || state.boardPageIndex}`,
      cooldownMs: 0,
      allowRepeat: true,
      log: false,
      trackQuestion: false
    }).finally(() => {
      startSilenceTimerAfterOpening(questionId, speechStartedAt, "question-change-finished");
    });
    clearTimeout(state.openingSpeechWatchdogTimer);
    state.openingSpeechWatchdogTimer = setTimeout(() => {
      if (state.openingSpeechInProgress !== false) {
        startSilenceTimerAfterOpening(questionId, speechStartedAt, "question-change-watchdog");
      }
    }, 15000);
  } else {
    state.openingSpeechInProgress = false;
    dom.lianBubble.textContent = "";
    if (!options.deferSilenceTimer) resetSilenceTimer(false);
  }
}

function scheduleHandwritingRecognition(reason) {
  clearTimeout(state.recognitionTimer);
  const question = currentPageQuestion();
  const hasInk = hasCurrentBoardInk(question);
  console.log("[handwriting] schedule", {
    reason,
    questionId: question?.id || "",
    hasInk,
    completed: state.currentQuestionCompleted,
    paused: state.teachSessionPaused
  });
  if (!hasInk) return;
  if (state.handwritingRetryPending && !String(reason || "").includes("临时故障自动重试")) {
    console.info("[handwriting] schedule skipped while retry is pending", { reason });
    return;
  }
  if (state.handwritingRequestInFlight) {
    state.handwritingQueuedReason = reason;
    state.handwritingQueuedMeta = {
      sessionId: state.answerSessionId,
      interactionSessionId: state.lectureSessionId,
      questionId: question?.id || "",
      boardVersion: getBoardVersion(question)
    };
    console.log("[handwriting] queued while another request is in flight", {
      reason,
      questionId: question?.id || ""
    });
    return;
  }
  if (state.teachSessionPaused) {
    state.resumeHandwritingAfterNavigation = true;
    return;
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
  const stage = String(error?.stage || "");
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
  if (code === "empty_board_snapshot") {
    return {
      pill: "板书截图为空",
      log: "这次没有拿到有效的板书截图，板书内容已保留；请继续写完后再停笔。",
      pauseMs: 0
    };
  }
  if (code === "invalid_board_snapshot") {
    return {
      pill: "板书截图无效",
      log: "这次生成的板书截图尺寸或数据无效，板书内容已保留；请继续写完后再停笔。",
      pauseMs: 0
    };
  }
  if (code === "question_memory_missing" || code === "question_memory_mismatch") {
    return {
      pill: "题目记忆未就绪",
      log: "当前题目的 Question Memory 未建立或不匹配；板书识别已停止，且没有重新请求标准答案。请重新进入这道题。",
      pauseMs: 0
    };
  }
  if (code === "qwen_timeout") {
    return {
      pill: "识别请求超时",
      log: `Qwen 在${stage ? `${stage}阶段` : "板书识别"}超过规定时间没有返回。板书已保留，稍后会用同一份最新板书重试。`,
      pauseMs: 0
    };
  }
  if (code === "qwen_total_timeout") {
    return {
      pill: "识别请求超时",
      log: `Qwen 在${stage ? `${stage}阶段` : "板书识别"}的总等待时间已用尽。板书已保留，本次不会继续循环重试；请继续写新内容或稍后手动再试。`,
      pauseMs: 0
    };
  }
  if (code === "network_error") {
    return {
      pill: "识别网络暂时不通",
      log: "Qwen 多模态服务暂时连接失败。板书已保留，请稍后停笔重试；这不是板书内容错误。",
      pauseMs: 0
    };
  }
  if (code === "rate_limited") {
    return {
      pill: "识别请求繁忙",
      log: "Qwen 多模态服务当前请求较多，系统已保留板书并会稍后重试。",
      pauseMs: 2500
    };
  }
  if (code === "upstream_5xx") {
    return {
      pill: "识别服务暂时异常",
      log: `Qwen 服务暂时返回异常${error?.status ? `（HTTP ${error.status}）` : ""}。系统已自动重试一次，板书内容已保留。`,
      pauseMs: 0
    };
  }
  if (code === "upstream_invalid_response") {
    return {
      pill: "模型响应异常",
      log: "Qwen 返回了无法解析的响应，板书内容已保留，系统会自动重试一次。",
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
  if (code === "invalid_model_output") {
    return {
      pill: "模型返回格式异常",
      log: `板书图片已送达 Qwen，但${stage ? `${stage}阶段` : "模型"}没有返回可解析的结构化结果；已保留本次板书，下一版板书会重新识别。`,
      pauseMs: 0
    };
  }
  if (code === "qwen_error" || code === "model_not_found" || code === "server_error") {
    return {
      pill: "板书服务返回异常",
      log: `板书识别接口返回异常${error?.status ? `（HTTP ${error.status}）` : ""}：${message || "未知错误"}。这不是板书内容判错。`,
      pauseMs: 0
    };
  }
  return {
    pill: "识别暂时失败",
    log: message ? `接口返回：${message}` : "这次识别没有成功返回，板书内容已先保存。",
    pauseMs: 0
  };
}

async function runHandwritingRecognition(reason) {
  state.recognitionTimer = null;
  const question = currentPageQuestion();
  const hasInk = hasCurrentBoardInk(question);
  console.log("[handwriting] run", {
    reason,
    questionId: question?.id || "",
    hasInk,
    completed: state.currentQuestionCompleted,
    paused: state.teachSessionPaused
  });
  if (state.teachSessionPaused) {
    state.resumeHandwritingAfterNavigation = Boolean(question && hasInk);
    return;
  }
  if (state.currentQuestionCompleted || !question || !dom.canvas.width || !hasInk) return;
  if (Date.now() < state.handwritingDisabledUntil) {
    showPausedHandwritingNotice();
    return;
  }

  const requestMeta = createHandwritingRequestMeta(question, "recognition");
  const requestId = requestMeta.requestId;
  const questionId = requestMeta.questionId;
  const boardVersion = requestMeta.boardVersion;
  beginHandwritingRequest(requestMeta);
  const recognitionInputSnapshot = getStudentInputSnapshot();
  const responseToken = getInteractionToken();
  let shouldRetryTransiently = false;
  saveCurrentPage();
  dom.recognitionPill.textContent = "板书识别中";
  dom.recognitionPill.classList.remove("hidden");

  try {
    const result = normalizeHandwritingResult(
      await requestHandwritingAnalysis(question, reason, requestMeta)
    );
    if (
      !isCurrentHandwritingRequest(requestMeta) ||
      !isCurrentInteraction(responseToken)
    ) {
      rememberHandwritingRequestStatus(requestId, "stale");
      return;
    }
    state.handwritingRetryPending = false;
    // Speech arriving while the board request is in flight does not invalidate
    // the board observation. Only a newer board stroke can make this result
    // stale; otherwise a spoken answer could erase a valid board response.
    if (skipStaleHandwritingFeedback("recognition-result", recognitionInputSnapshot, { boardOnly: true })) return;
    state.latestHandwritingResult = result;
    state.lastHandwritingRecognizedAt = Date.now();
    state.handwritingResults[question.id] = result;
    state.boardCompletionVerified = isBoardCompletionVerified(result);

    // A speech segment may finish while this board request is in flight.
    // Keep the board observation as evidence, but never let the older board
    // response speak over the student's newer explanation. The speech path
    // already invalidates the old guide request and will submit the latest
    // transcript with the current board evidence.
    const speechArrivedAfterRecognitionStart =
      (state.lastRecognizedSpeechAt || 0) > (recognitionInputSnapshot.speechAt || 0);
    const boardArrivedAfterRecognitionStart =
      (state.lastBoardWriteAt || 0) > (recognitionInputSnapshot.boardWriteAt || 0);
    if (speechArrivedAfterRecognitionStart && !boardArrivedAfterRecognitionStart && !state.waitingForBoardBeforeFinalAnswer) {
      console.info("[handwriting] board evidence kept; latest speech owns the response", {
        questionId: question.id,
        requestId,
        boardVersion,
        speechAt: state.lastRecognizedSpeechAt,
        recognitionStartedWith: recognitionInputSnapshot
      });
      dom.recognitionPill.textContent = "板书已记录，按最新语音继续";
      return;
    }

    if (state.waitingForBoardBeforeFinalAnswer) {
      if (await handleHandwritingAnswerVerification(result)) {
        dom.recognitionPill.textContent = result.answerVerificationStatus === "correct"
          ? "答案已核对正确"
          : "答案需要检查";
        return;
      }
      const pendingAnswer = state.pendingFinalAnswerText;
      const modelAction = String(result?.nextAction || "").trim();
      if (pendingAnswer && isModelBoardReadyForFinalCheck(result)) {
        state.waitingForBoardBeforeFinalAnswer = false;
        state.pendingFinalAnswerText = "";
        dom.recognitionPill.textContent = "正在核对最后答案";
        void handleFinalAnswerSubmission(pendingAnswer, {
          source: "speech-after-board",
          boardAlreadyVerified: true,
          silentLog: true
        });
        return;
      }
      if (isHandwritingCalculationWrong(result)) {
        dom.recognitionPill.textContent = "板书需要先检查";
        maybeSpeakHandwritingGuidance(result);
        return;
      }
      if (["continue_guidance", "ask_for_board"].includes(modelAction)) {
        dom.recognitionPill.textContent = modelAction === "ask_for_board" ? "还需要关键步骤" : "继续写解题步骤";
        if (result.guidance) {
          void lianSpeak(result.guidance, {
            dedupeKey: `handwriting-model-guidance:${question.id}:${boardVersion}`,
            cooldownMs: 0,
            allowRepeat: false
          });
        }
        return;
      }
      dom.recognitionPill.textContent = "还需要关键步骤";
      void lianSpeak("我还没看到可核验的关键步骤。请再写出一个关系式或计算步骤，写好后我就核对你刚才的答案。", {
        dedupeKey: `final-answer-board-step-missing:${question.id}`,
        cooldownMs: 0,
        allowRepeat: true
      });
      return;
    }

    const finalAnswerCandidate = extractHandwritingFinalAnswerCandidate(result);
    console.log("[handwriting] decision", {
      questionId: question.id,
      requestId,
      boardVersion,
      writingState: result?.writingState || "",
      calculationStatus: result?.calculationStatus || "",
      isRelevant: result?.isRelevant ?? null,
      boardComplete: result?.boardComplete ?? null,
      completedSteps: result?.completedSteps || [],
      finalAnswer: result?.finalAnswer || "",
      answerVerificationStatus: result?.answerVerificationStatus || "",
      answerFeedback: result?.answerFeedback || "",
      answerHint: result?.answerHint || "",
      nextAction: result?.nextAction || "",
      guidance: result?.guidance || "",
      finalAnswerCandidate
    });

    // The handwriting model now compares the visible final answer and steps
    // with the trusted standard answer in the same multimodal request.
    if (await handleHandwritingAnswerVerification(result)) {
      dom.recognitionPill.textContent = result.answerVerificationStatus === "correct"
        ? "答案已核对正确"
        : "答案需要检查";
      return;
    }

    if (["continue_guidance", "ask_for_board"].includes(result?.nextAction)) {
      dom.recognitionPill.textContent = result.nextAction === "ask_for_board" ? "还需要关键步骤" : "继续写解题步骤";
      if (result.guidance) {
        void lianSpeak(result.guidance, {
          dedupeKey: `handwriting-model-guidance:${question.id}:${boardVersion}`,
          cooldownMs: 0,
          allowRepeat: false
        });
      }
      return;
    }

    if (isHandwritingCalculationWrong(result)) {
      dom.recognitionPill.textContent = "发现需要检查";
      maybeSpeakHandwritingGuidance(result);
      return;
    }

    if (isIncompleteHandwritingIssue(result)) {
      dom.recognitionPill.textContent = "等你写完";
      if (result.writingState === "stalled" && String(result.guidance || "").trim()) {
        maybeSpeakHandwritingGuidance(result);
      }
      return;
    }

    if (isHandwritingCalculationCorrect(result)) {
      dom.recognitionPill.textContent = "板书已记录";
      clearIssueTracking();
      if (state.guideState === GUIDE_STATES.MICRO_HINT) setGuideState(GUIDE_STATES.HEURISTIC);
      const positiveFeedback = String(result.positiveFeedback || "").trim();
      if (positiveFeedback && !hasStudentInputSinceHandwritingRecognition()) {
        void lianSpeak(positiveFeedback, {
          dedupeKey: `handwriting-positive:${question.id}:${boardVersion}`,
          cooldownMs: 0,
          allowRepeat: false
        });
      }
    } else {
      dom.recognitionPill.textContent = result.isRelevant ? "板书已记录" : "板书较少";
      if (result.isRelevant) {
        clearIssueTracking();
        if (state.guideState === GUIDE_STATES.MICRO_HINT) setGuideState(GUIDE_STATES.HEURISTIC);
      }
    }
  } catch (error) {
    if (
      !isCurrentHandwritingRequest(requestMeta) ||
      !isCurrentInteraction(responseToken)
    ) {
      rememberHandwritingRequestStatus(requestId, "stale");
      return;
    }
    console.warn("Handwriting recognition fallback:", error);
    const info = explainHandwritingError(error);
    dom.recognitionPill.textContent = info.pill;
    addLog("提示", info.log, {
      key: `handwriting-failure:${questionId}:${boardVersion}:${info.pill}`
    });
    state.lastHandwritingServiceError = info.pill;
    if (info.pauseMs) state.handwritingDisabledUntil = Date.now() + info.pauseMs;
    shouldRetryTransiently = [
      // A timeout means the server already cancelled and released the model
      // race. Retrying the same board version only recreates the waiting loop.
      "network_error",
      "rate_limited",
      "upstream_5xx",
      "upstream_invalid_response"
    ].includes(String(error?.code || ""));
  } finally {
    const requestWasCurrent = isCurrentHandwritingRequest(requestMeta);
    finishHandwritingRequest(requestMeta, requestWasCurrent ? "completed" : "stale");
    if (shouldRetryTransiently && requestWasCurrent) {
      scheduleTransientHandwritingRetry(requestMeta, reason);
    }
    setTimeout(() => dom.recognitionPill.classList.add("hidden"), 1200);
    const queuedReason = state.handwritingQueuedReason;
    const queuedMeta = state.handwritingQueuedMeta;
    state.handwritingQueuedReason = "";
    state.handwritingQueuedMeta = null;
    if (
      queuedReason &&
      queuedMeta?.sessionId === state.answerSessionId &&
      queuedMeta?.interactionSessionId === state.lectureSessionId &&
      queuedMeta?.questionId === currentPageQuestion()?.id &&
      queuedMeta?.boardVersion === getBoardVersion(currentPageQuestion()) &&
      currentPageQuestion() &&
      hasCurrentBoardInk(currentPageQuestion())
    ) {
      state.recognitionTimer = setTimeout(
        () => runHandwritingRecognition(queuedReason),
        BOARD_RECOGNITION_DELAY_MS
      );
    }
  }
}

async function requestHandwritingAnalysis(question, reason, requestMeta = {}) {
  const requestStartedAt = Date.now();
  const boardVersion = Number(requestMeta.boardVersion ?? getBoardVersion(question));
  const requestId = Number(requestMeta.requestId || 0);
  const sessionId = Number(requestMeta.sessionId ?? state.answerSessionId);
  const questionMemory = await waitForEnteredQuestionMemory(question);
  if (!questionMemory) {
    const error = new Error("Question Memory 尚未在进入题目时建立，已停止本次板书识别");
    error.code = "question_memory_missing";
    error.stage = "question-memory";
    throw error;
  }
  requestMeta.memoryId = questionMemory.memoryId || requestMeta.memoryId || "";
  if (
    sessionId !== state.answerSessionId ||
    currentPageQuestion()?.id !== question.id ||
    (requestId && !isCurrentHandwritingRequest(requestMeta))
  ) {
    const error = new Error("stale handwriting request");
    error.code = "stale_request";
    error.stage = "request-identity";
    throw error;
  }
  // Freeze the visible blackboard as one image. It contains the question image
  // and the student's original strokes; no client OCR or thresholding is used.
  const boardImage = await createCurrentBoardSnapshot({
    maxSide: HANDWRITING_IMAGE_MAX_SIDE,
    quality: HANDWRITING_IMAGE_JPEG_QUALITY
  });
  const boardIdleSeconds = Math.max(0, Math.round((Date.now() - (state.lastBoardWriteAt || Date.now())) / 1000));
  const diagnostics = {
    requestId,
    sessionId,
    memoryId: requestMeta.memoryId,
    questionId: question.id,
    boardVersion,
    reason: String(reason || ""),
    canvasWidth: Number(dom.canvas.width || 0),
    canvasHeight: Number(dom.canvas.height || 0),
    boardImageBytes: String(boardImage || "").length,
    capturedAt: new Date().toISOString()
  };
  console.log("[handwriting] request snapshot", diagnostics);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HANDWRITING_REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch("/api/handwriting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: question.id,
        sessionId,
        requestId,
        memoryId: requestMeta.memoryId,
        questionMemory,
        boardImage,
        reason,
        boardIdleSeconds,
        latestStudentSpeech: state.latestStudentSpeechText || "",
        studentSpeechTranscript: dom.transcriptInput.value.trim(),
        hasBoardInk: Boolean(hasCurrentBoardInk(question)),
        handwritingDiagnostics: diagnostics
      }),
      signal: controller.signal
    });
  } catch (cause) {
    const error = new Error(
      cause?.name === "AbortError" ? "板书识别请求超时" : "板书识别网络连接失败"
    );
    error.code = cause?.name === "AbortError" ? "qwen_timeout" : "network_error";
    error.stage = "handwriting-request";
    error.causeCode = cause?.cause?.code || cause?.code || "";
    error.requestId = requestId;
    error.sessionId = sessionId;
    error.questionId = question.id;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
  let result;
  try {
    result = await response.json();
  } catch (cause) {
    const error = new Error("板书识别服务返回了无法解析的结果");
    error.code = "upstream_invalid_response";
    error.stage = "handwriting-response";
    error.status = response.status;
    error.statusCode = response.status;
    error.requestId = requestId;
    error.sessionId = sessionId;
    error.questionId = question.id;
    error.causeCode = cause?.name || "invalid_json";
    throw error;
  }
  if (!response.ok) {
    const error = new Error(result.error || "板书识别失败");
    error.code = result.code || "server_error";
    error.status = response.status;
    error.statusCode = response.status;
    error.stage = result.stage || "";
    error.requestId = result.requestId || requestId;
    error.sessionId = result.sessionId || sessionId;
    error.questionId = result.questionId || question.id;
    error.model = result.model || "";
    throw error;
  }
  if (
    (result.requestId != null && Number(result.requestId) !== requestId) ||
    (result.sessionId != null && Number(result.sessionId) !== sessionId) ||
    (result.questionId && String(result.questionId) !== String(question.id)) ||
    (result.memoryId && String(result.memoryId) !== String(requestMeta.memoryId))
  ) {
    const error = new Error("handwriting response identity mismatch");
    error.code = "stale_request";
    error.stage = "response-identity";
    throw error;
  }
  console.log("[handwriting] response", {
    ...diagnostics,
    elapsedMs: Date.now() - requestStartedAt,
    calculationStatus: result.calculationStatus || "",
    confidence: result.confidence ?? null
  });
  state.handwritingDisabledUntil = 0;
  state.lastHandwritingServiceError = "";
  return result;
}

async function createCurrentBoardSnapshot(options = {}) {
  const question = currentPageQuestion();
  if (!question) return getBoardImageForGuide();
  saveCurrentPage();
  const pages = pagesForQuestion(question.id);
  const snapshot = await composeBoardSnapshot(
    pages[0] || getBoardImageForGuide(),
    question.image,
    getSnapshotImageState(question.id)
  );
  return prepareGuideImage(snapshot, {
    maxSide: options.maxSide || HANDWRITING_IMAGE_MAX_SIDE,
    quality: options.quality || HANDWRITING_IMAGE_JPEG_QUALITY
  });
}

function isIncompleteHandwritingIssue(result) {
  const text = [
    result.writingState,
    result.calculationStatus,
    result.issueType,
    result.issueSummary,
    result.expectedNextStep,
    result.guidance,
    result.detectedWriting
  ]
    .filter(Boolean)
    .join(" ");
  return /in_progress|stalled|incomplete|不完整|没写完|未写完|还没|未完成|缺少|缺项|没有看到|只写出|继续写|补全|补上|放进/.test(text);
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
    writingState: String(result.writingState || "").trim(),
    finalAnswer: String(result.finalAnswer || "").normalize("NFKC").trim(),
    nextAction: ["continue_guidance", "verify_answer", "ask_for_board", "finished"].includes(result.nextAction)
      ? result.nextAction
      : "",
    guidance: String(result.guidance || "").normalize("NFKC").trim(),
    completedSteps: Array.isArray(result.completedSteps)
      ? result.completedSteps.map((step) => String(step || "").trim()).filter(Boolean).slice(0, 8)
      : [],
    errorLocation: String(result.errorLocation || "").trim(),
    errorEvidence: String(result.errorEvidence || "").trim(),
    boardComplete: result.boardComplete === true,
    missingBoardContent: String(result.missingBoardContent || "").trim(),
    confidence: Number.isFinite(confidence) ? confidence : 0
  };

  if (normalized.calculationStatus === "wrong") {
    const explicitError = Boolean(
      normalized.errorLocation &&
      (normalized.errorEvidence || normalized.issueSummary) &&
      normalized.confidence >= 0.72
    );
    if (!explicitError) {
      return {
        ...normalized,
        calculationStatus: "unclear",
        hasPossibleIssue: false,
        issueType: "unclear",
        issueSummary: "",
        errorLocation: "",
        errorEvidence: "",
        expectedNextStep: "",
        guidance: "",
        positiveFeedback: "",
        boardComplete: false,
        confidence: Math.min(normalized.confidence || 0.5, 0.55)
      };
    }
    return {
      ...normalized,
      hasPossibleIssue: true,
      issueType: normalized.issueType && normalized.issueType !== "none" ? normalized.issueType : "wrong_number",
      issueSummary: normalized.issueSummary || normalized.errorEvidence,
      expectedNextStep: normalized.expectedNextStep || "",
      guidance: normalized.guidance || `先检查${normalized.errorLocation}：${normalized.errorEvidence || normalized.issueSummary}`,
      positiveFeedback: "",
      boardComplete: false,
      missingBoardContent: normalized.missingBoardContent || `需要修正${normalized.errorLocation}。`
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
    issueType: normalized.issueType && normalized.issueType !== "none" ? normalized.issueType : "wrong_operation",
    issueSummary: normalized.issueSummary || "同一未知量在板书中出现了不一致的结果。",
    errorLocation: normalized.errorLocation || "同一未知量的两处赋值",
    errorEvidence: normalized.errorEvidence || "板书中同一未知量出现了不同数值。",
    expectedNextStep: "",
    guidance: normalized.guidance || "先检查同一未知量的两处赋值：它们目前写成了不同数值。",
    positiveFeedback: "",
    boardComplete: false,
    missingBoardContent: normalized.missingBoardContent || "需要先统一同一未知量的计算结果。",
    confidence: Math.max(normalized.confidence, 0.72)
  };
}

function isHandwritingCalculationWrong(result) {
  return Boolean(
    result?.calculationStatus === "wrong" &&
    result?.hasPossibleIssue === true &&
    Number(result?.confidence) >= 0.72 &&
    String(result?.errorLocation || "").trim() &&
    String(result?.errorEvidence || result?.issueSummary || "").trim()
  );
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
  return isModelBoardReadyForFinalCheck(result);
}

// The multimodal handwriting response owns progress detection. The client
// must not reconstruct readiness from visible strings or legacy confidence
// heuristics, otherwise a completed board can be sent back into guidance.
function isModelBoardReadyForFinalCheck(result) {
  return Boolean(
    result?.isRelevant !== false &&
    result?.boardComplete === true &&
    Array.isArray(result?.completedSteps) &&
    result.completedSteps.length > 0 &&
    !isIncompleteHandwritingIssue(result) &&
    !isHandwritingCalculationWrong(result)
  );
}

function extractAnswerTextFromHandwriting(result) {
  const visibleEvidence = getHandwritingAnswerEvidence(result);
  return String(
    result?.mathExpression ||
    result?.detectedWriting ||
    result?.finalAnswer ||
    result?.answer ||
    result?.studentAnswer ||
    result?.recognizedText ||
    result?.boardText ||
    result?.completedSteps?.at?.(-1) ||
    visibleEvidence ||
    ""
  ).trim();
}

function getVisibleHandwritingEvidence(result) {
  const completedSteps = Array.isArray(result?.completedSteps)
    ? result.completedSteps.join("\n")
    : "";
  return [
    result?.mathExpression,
    result?.detectedWriting,
    result?.recognizedText,
    result?.boardText,
    completedSteps
  ]
    .filter((value) => value != null && String(value).trim())
    .map((value) => String(value).trim())
    .join("\n");
}

function getHandwritingAnswerEvidence(result) {
  const completedSteps = Array.isArray(result?.completedSteps)
    ? result.completedSteps.join("\n")
    : "";
  return [
    result?.mathExpression,
    result?.detectedWriting,
    result?.finalAnswer,
    result?.answer,
    result?.studentAnswer,
    result?.recognizedText,
    result?.boardText,
    completedSteps
  ]
    .filter((value) => value != null && String(value).trim())
    .map((value) => String(value).trim())
    .join("\n")
    .normalize("NFKC");
}

function extractHandwritingFinalAnswerCandidate(result) {
  const modelAction = String(result?.nextAction || "").trim();
  const modelFinalAnswer = String(result?.finalAnswer || "").normalize("NFKC").trim();
  if (
    modelFinalAnswer &&
    (
      modelAction === "verify_answer" ||
      modelAction === "finished" ||
      result?.boardComplete === true ||
      (Array.isArray(result?.completedSteps) && result.completedSteps.length > 0)
    )
  ) {
    return modelFinalAnswer;
  }
  if (modelAction === "continue_guidance" || modelAction === "ask_for_board") {
    return "";
  }

  // A structured handwriting response is authoritative about whether the
  // board is ready. Do not reconstruct an answer from visible strings when
  // the model did not select a verification action.
  if (modelAction) return "";

  // Do not infer an answer from legacy visible-text heuristics. The
  // multimodal model must explicitly choose verify_answer/finished and
  // provide finalAnswer, otherwise the UI stays in the current state.
  return "";
}

async function handleHandwritingAnswerVerification(result) {
  const question = currentPageQuestion();
  const status = String(result?.answerVerificationStatus || "").trim();
  const answer = extractHandwritingFinalAnswerCandidate(result);
  const hasCompletedKeyStep = Array.isArray(result?.completedSteps) && result.completedSteps.length > 0;
  const hasVisibleAnswerAndKeyStep = Boolean(
    answer &&
    (hasCompletedKeyStep || result?.boardComplete === true) &&
    result?.isRelevant !== false
  );
  if (!question || !answer) return false;

  if (hasVisibleAnswerAndKeyStep && !["correct", "wrong"].includes(status)) {
    state.finalAnswerVerified = false;
    state.verifiedFinalAnswerText = "";
    state.awaitingFinalAnswer = true;
    state.pendingFinalAnswerText = answer;
    state.boardCompletionVerified = true;
    state.currentQuestionCompleted = false;
    dom.finishQuestionBtn.disabled = false;
    setGuideState(GUIDE_STATES.INTERACTIVE);
    await lianSpeak(
      result.answerHint || "板书中的答案和关键步骤已经识别，但大模型暂时无法可靠完成核验，请稍后重试。",
      {
        dedupeKey: `handwriting-answer-unclear:${question.id}:${answer}`,
        cooldownMs: 0,
        allowRepeat: true
      }
    );
    return true;
  }

  if (!hasVisibleAnswerAndKeyStep) return false;
  if (!["correct", "wrong"].includes(status)) return false;

  if (status === "correct") {
    if (!isHandwritingCalculationCorrect(result) || !isModelBoardReadyForFinalCheck(result)) return false;
    state.finalAnswerVerified = true;
    state.verifiedFinalAnswerText = answer;
    state.awaitingFinalAnswer = false;
    state.pendingFinalAnswerText = "";
    state.boardCompletionVerified = true;
    state.currentQuestionCompleted = false;
    dom.finishQuestionBtn.disabled = false;
    setGuideState(GUIDE_STATES.INTERACTIVE);
    if (markCurrentQuestionComplete()) {
      const feedback = result.answerFeedback || "答案和板书步骤都核对正确了。";
      // Open the save confirmation immediately after the model verdict. Do not
      // wait for TTS playback, which can otherwise leave an old guide bubble
      // visible and make the save step appear stuck.
      const savePromise = saveCurrentQuestionAndContinue({ feedback });
      void lianSpeak(feedback, {
        dedupeKey: `handwriting-answer-correct:${question.id}:${answer}`,
        cooldownMs: 0,
        allowRepeat: true
      });
      await savePromise;
    }
    return true;
  }

  state.finalAnswerVerified = false;
  state.verifiedFinalAnswerText = "";
  state.awaitingFinalAnswer = true;
  state.pendingFinalAnswerText = answer;
  state.boardCompletionVerified = false;
  state.currentQuestionCompleted = false;
  dom.finishQuestionBtn.disabled = false;
  setGuideState(GUIDE_STATES.INTERACTIVE);
  await lianSpeak(result.answerHint || result.guidance || "最终答案与标准答案不一致，请检查最后一步的计算。", {
    dedupeKey: `handwriting-answer-wrong:${question.id}:${answer}`,
    cooldownMs: 0,
    allowRepeat: true
  });
  return true;
}

function normalizeBoardMathText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[，,。；;！!？?、]/g, "");
}

function hasReviewableBoardStep(result) {
  if (result?.boardComplete === true && !isIncompleteHandwritingIssue(result)) return true;
  const boardText = normalizeBoardMathText(getHandwritingAnswerEvidence(result));
  if (!boardText) return false;

  const withoutAnswerLead = boardText.replace(/^(?:最后|最终)?(?:答案|结果)(?:是|为|等于|=|＝)?/g, "");
  const bareAnswerPattern = /^(?:[A-D](?:选项|项)?|[-+]?\d+(?:\.\d+)?(?:度|°|厘米|cm|米|m|千米|km|平方厘米|平方米|立方厘米|cm3|cm³|元|克|千克|分钟|分|%)?|[a-zA-Z]\s*(?:=|＝|等于)\s*[-+]?\d+(?:\.\d+)?)$/i;
  if (bareAnswerPattern.test(withoutAnswerLead)) return false;

  const numberCount = (boardText.match(/[-+]?\d+(?:\.\d+)?|[零〇一二两三四五六七八九十百千万]+/g) || []).length;
  const variableCount = (boardText.match(/[a-zA-Z]/g) || []).length;
  const hasRelation = /(?:=|＝|等于|:|：|成比例|比例|方程|关系式)/.test(boardText);
  const hasOperation = /(?:\+|-|−|×|x|X|\*|÷|\/|乘|除|加|减|分之|平方|开方)/.test(boardText);

  return Boolean(
    hasRelation && hasOperation && numberCount >= 2 ||
      hasRelation && variableCount >= 1 && numberCount >= 1 ||
      /(?:360|180).*(?:分之|\/|乘|×|x|X|\*).*(?:度|°|圆心角)/.test(boardText)
  );
}

function hasCurrentRecognizedBoardStep(question = currentPageQuestion()) {
  if (!question || !hasCurrentBoardInk(question)) return false;
  if (state.handwritingRequestInFlight) return false;
  if (
    state.lastBoardWriteAt &&
    state.lastHandwritingRecognizedAt < state.lastBoardWriteAt
  ) {
    return false;
  }
  const result = state.latestHandwritingResult;
  return isModelBoardReadyForFinalCheck(result);
}

function queueModelDecisionBeforeFinalCheck(answerText, source = "") {
  const answer = String(answerText || "").trim();
  const question = currentPageQuestion();
  if (!answer || !question) return false;

  state.waitingForBoardBeforeFinalAnswer = true;
  state.pendingFinalAnswerText = answer;
  state.finalAnswerVerified = false;
  state.verifiedFinalAnswerText = "";
  state.boardCompletionVerified = false;

  if (!hasCurrentBoardInk(question)) {
    dom.recognitionPill.textContent = "请先补充板书步骤";
    dom.recognitionPill.classList.remove("hidden");
    void lianSpeak("我先记下你的最后答案。请在黑板上写出一个关键关系式或计算步骤，写好后我再帮你核对答案。", {
      dedupeKey: `final-answer-needs-board:${question.id}`,
      cooldownMs: 0,
      allowRepeat: true
    });
    return true;
  }

  if (state.handwritingRequestInFlight) {
    dom.recognitionPill.textContent = "正在检查板书步骤";
    dom.recognitionPill.classList.remove("hidden");
    return true;
  }

  // Run the model decision immediately. Delaying this path can leave a
  // spoken final answer waiting behind a stale debounce timer.
  void runHandwritingRecognition(`最终核验前由模型判断板书进度${source ? `:${source}` : ""}`);
  dom.recognitionPill.textContent = "正在检查板书步骤";
  dom.recognitionPill.classList.remove("hidden");
  return true;
}

function handleSpokenFinalAnswer(answerText) {
  const answer = String(answerText || "").trim();
  const question = currentPageQuestion();
  if (!answer || !question) return;

  if (hasCurrentRecognizedBoardStep(question)) {
    state.waitingForBoardBeforeFinalAnswer = false;
    // Keep the answer until the service confirms it. A transport failure must
    // never force the student to repeat an answer that was already captured.
    state.pendingFinalAnswerText = answer;
    void handleFinalAnswerSubmission(answer, { boardAlreadyVerified: true });
    return;
  }

  addLog("我", answer);
  queueModelDecisionBeforeFinalCheck(answer, "语音答案");
}

function getBoardCompletionGuidance(result) {
  if (!result) return "我还没能确认板书步骤。请在黑板上写下一个关键关系式、公式或计算步骤，再点击保存至错题本。";
  if (isHandwritingCalculationWrong(result)) {
    return result.guidance || result.issueSummary || "你的口头答案已经核对过了，但板书里还有一步需要检查。先把板书中的计算和最终结论改一致。";
  }
  if (result.calculationStatus === "unclear") {
    return "答案已经核对过了，不过板书里的关键步骤我还没看清。请把其中一个关系式或计算步骤写清楚，再点击保存至错题本。";
  }
  const missing = String(result.missingBoardContent || result.expectedNextStep || "").trim();
  return missing
    ? `答案已经核对正确，板书还需要一个可核验的步骤：${missing}。补上后再点击保存至错题本。`
    : "答案已经核对正确，黑板上再留下一个可核验的正确步骤，就可以结束这道题。";
}

function maybeSpeakHandwritingSuccess(result) {
  if (!isHandwritingCalculationCorrect(result)) return false;
  if (isIncompleteHandwritingIssue(result)) return false;
  if (hasStudentInputSinceHandwritingRecognition()) return false;

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
  if (hasStudentInputSinceHandwritingRecognition()) return false;

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

function hasHandwritingProgressForGuidance(result) {
  const boardText = [
    result?.detectedWriting,
    result?.mathExpression,
    result?.calculationCheck,
    result?.expectedNextStep,
    result?.missingBoardContent
  ]
    .filter(Boolean)
    .join(" ")
    .normalize("NFKC");
  if (!boardText.trim()) return false;
  if (String(result?.guidance || "").trim()) return true;
  if (String(result?.expectedNextStep || result?.missingBoardContent || "").trim()) return true;
  return /[a-zA-Z]|=|:|\/|\+|-|\*|×|÷|\d|方程|比例|分之|角|面积|周长|半径|直径/.test(boardText);
}

function buildIncompleteHandwritingGuidance(result) {
  const nextStep = String(result?.expectedNextStep || result?.missingBoardContent || "").trim();
  const expression = String(result?.mathExpression || result?.detectedWriting || "").trim();
  if (String(result?.guidance || "").trim()) return String(result.guidance).trim();
  if (nextStep && expression) {
    return `我看到你已经写到 ${expression} 这一步了。接下来先补一小步：${nextStep}`;
  }
  if (nextStep) {
    return `你现在像是停在中间一步了。下一步先做这个：${nextStep}`;
  }
  if (expression) {
    return `我看到你写到 ${expression} 这里了。先沿着这个式子往下算一小步，把等号后面的结果写出来。`;
  }
  return "我看到你停在中间步骤了。先把下一行关系式或计算结果补出来，再继续往下算。";
}

function maybeSpeakHandwritingGuidance(result) {
  if (hasStudentInputSinceHandwritingRecognition()) return false;
  const now = Date.now();
  if (isIncompleteHandwritingIssue(result) && hasHandwritingProgressForGuidance(result)) {
    if (result.writingState !== "stalled") return false;
    const issueKey = `incomplete:${result.expectedNextStep || result.missingBoardContent || result.mathExpression || result.detectedWriting || ""}`
      .replace(/\s+/g, "")
      .slice(0, 140);
    if (issueKey === state.lastHandwritingIssueKey && now - state.lastHandwritingGuideAt < 18000) return false;
    state.lastHandwritingIssueKey = issueKey;
    state.lastHandwritingGuideAt = now;
    dom.recognitionPill.textContent = "等你写完";
    lianSpeak(buildIncompleteHandwritingGuidance(result), {
      dedupeKey: `handwriting-incomplete:${issueKey}`,
      cooldownMs: 0,
      allowRepeat: false
    });
    return true;
  }
  if (isIncompleteHandwritingIssue(result)) {
    state.lastHandwritingIssueKey = `incomplete:${result.issueSummary || result.detectedWriting || ""}`;
    state.lastHandwritingGuideAt = now;
    dom.recognitionPill.textContent = "等你写完";
    return false;
  }

  if (!isHandwritingCalculationWrong(result)) return false;
  const issue = registerPossibleIssue(result);
  if (issue.escalated) return true;
  if (issue.duplicate) return false;

  state.lastHandwritingIssueKey = issue.issueKey;
  state.lastHandwritingGuideAt = now;
  const guidance = String(result.guidance || "").trim();
  if (!guidance) return false;
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
    if (state.lianSpeechPausedRecognition || state.currentLianUtterance) return;
    dom.studentState.textContent = "听到声音";
  };

  recognition.onspeechstart = () => {
    if (state.teachSessionPaused) return;
    if (state.lianSpeechPausedRecognition || state.currentLianUtterance) return;
    clearTimeout(state.recognitionTimer);
    interruptGuideForStudentSpeech();
    dom.studentAvatar.classList.add("speaking");
    dom.studentState.textContent = "正在讲题";
  };

  recognition.onresult = (event) => {
    if (state.teachSessionPaused) return;
    if (state.lianSpeechPausedRecognition || state.currentLianUtterance) return;
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
    if (state.cloudAsrActive && state.cloudAsrPreviewActive) {
      if (finalText) rememberCloudAsrPreviewFinal(finalText);
      const previewText = [state.cloudAsrPreviewFinalText, interimText].filter(Boolean).join(" ");
      if (previewText) {
        interruptGuideForStudentSpeech();
        dom.studentAvatar.classList.add("speaking");
        dom.studentState.textContent = "正在实时转写";
        showSpeechDraft(previewText);
      }
      return;
    }
    if (interimText) {
      interruptGuideForStudentSpeech();
      dom.studentAvatar.classList.add("speaking");
      dom.studentState.textContent = "正在讲题";
      showSpeechDraft(interimText);
      tryHandleImmediateStuckSpeech(interimText);
    }
    if (finalText) {
      void enqueueRecognizedSpeech(finalText);
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
    if (state.lianSpeechPausedRecognition) {
      dom.studentAvatar.classList.remove("speaking");
      dom.studentState.textContent = "听恋恋说";
      return;
    }
    if (state.cloudAsrActive && state.cloudAsrPreviewActive) {
      dom.studentState.textContent = "正在实时转写";
      if (state.isListening) {
        try {
          recognition.start();
        } catch {
          state.cloudAsrPreviewActive = false;
        }
      }
      return;
    }
    if (state.cloudAsrFinalizing) {
      // 停止云端识别后，等待最后一批阿里云结果或本地预览回退，不能在这里清掉草稿。
      dom.studentState.textContent = "正在整理语音";
      return;
    }
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
      void enqueueRecognizedSpeech(draft);
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

async function getCloudSpeechConfig() {
  if (state.cloudSpeechConfig) return state.cloudSpeechConfig;
  try {
    const response = await fetch("/api/health", { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    state.cloudSpeechConfig = {
      aliyunSpeechConfigured: Boolean(result.aliyunSpeechConfigured),
      aliyunSpeechVoice: result.aliyunSpeechVoice || "",
      sampleRate: 16000
    };
  } catch {
    state.cloudSpeechConfig = { aliyunSpeechConfigured: false, sampleRate: 16000 };
  }
  return state.cloudSpeechConfig;
}

function downsampleAudioBuffer(samples, inputSampleRate, outputSampleRate = 16000) {
  if (outputSampleRate === inputSampleRate) return samples;
  const ratio = inputSampleRate / outputSampleRate;
  const newLength = Math.max(1, Math.round(samples.length / ratio));
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i += 1) {
    const start = Math.floor(i * ratio);
    const end = Math.min(samples.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j += 1) {
      sum += samples[j];
      count += 1;
    }
    result[i] = count ? sum / count : samples[start] || 0;
  }
  return result;
}

function encodeWavDataUrl(samples, sampleRate = 16000) {
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i += 1) view.setUint8(offset + i, string.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i += 1, offset += 2) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

async function flushCloudAsrBuffer({ final = false } = {}) {
  if (!state.cloudAsrBuffers.length || state.cloudAsrRequestInFlight) {
    if (state.cloudAsrBuffers.length && state.cloudAsrRequestInFlight) {
      state.cloudAsrPendingFlush = true;
    } else if (final) {
      commitCloudAsrPreviewFallback();
    }
    return;
  }
  const buffers = state.cloudAsrBuffers.splice(0);
  const length = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
  if (length < state.cloudAsrSampleRate * (final ? 0.2 : 0.45)) {
    if (final) commitCloudAsrPreviewFallback();
    return;
  }
  const merged = new Float32Array(length);
  let offset = 0;
  buffers.forEach((buffer) => {
    merged.set(buffer, offset);
    offset += buffer.length;
  });
  const wavDataUrl = encodeWavDataUrl(merged, state.cloudAsrSampleRate);
  state.cloudAsrRequestInFlight = true;
  state.cloudAsrPendingFlush = false;
  const requestId = ++state.cloudAsrRequestId;
  try {
    const response = await fetch("/api/asr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: wavDataUrl })
    });
    const result = await response.json().catch(() => ({}));
    const text = String(result.text || "").trim();
    let committed = false;
    if (response.ok && text && requestId === state.cloudAsrRequestId) {
      const committedText = commitCloudAsrText(text);
      if (committedText) {
        committed = true;
        state.cloudAsrPreviewFinalText = "";
        // Commit cloud recognition before optional correction or guide requests.
        void enqueueRecognizedSpeech(committedText, {
          alreadyCommitted: true,
          rawAsrText: text
        });
      }
      resetSilenceTimer();
    }
    if (final) {
      if (!committed) commitCloudAsrPreviewFallback();
      else state.cloudAsrFinalizing = false;
    }
  } catch (error) {
    console.warn("Aliyun ASR failed:", error);
    if (final) commitCloudAsrPreviewFallback();
  } finally {
    state.cloudAsrRequestInFlight = false;
    if (state.cloudAsrPendingFlush) {
      void flushCloudAsrBuffer({ final: final || !state.cloudAsrActive });
    }
  }
}

async function startCloudAsrListening() {
  const allowed = await ensureMicrophonePermission();
  if (!allowed) return false;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass || !navigator.mediaDevices?.getUserMedia) return false;
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });
  const audioContext = new AudioContextClass();
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  state.cloudAsrSampleRate = 16000;
  state.cloudAsrBuffers = [];
  state.cloudAsrPendingFlush = false;
  state.cloudAsrRequestId += 1;
  state.lastCloudAsrText = "";
  state.lastCloudAsrTextAt = 0;
  state.cloudAsrPreviewFinalText = "";
  state.cloudAsrFinalizing = false;
  state.cloudAsrStream = stream;
  state.cloudAsrAudioContext = audioContext;
  state.cloudAsrSource = source;
  state.cloudAsrProcessor = processor;
  processor.onaudioprocess = (event) => {
    if (!state.cloudAsrActive || state.lianSpeechPausedRecognition || state.currentLianUtterance) return;
    const input = event.inputBuffer.getChannelData(0);
    const downsampled = downsampleAudioBuffer(input, audioContext.sampleRate, state.cloudAsrSampleRate);
    state.cloudAsrBuffers.push(downsampled);
    state.lastSpeechAt = Date.now();
    stopSpeechNoResultTimer();
  };
  source.connect(processor);
  processor.connect(audioContext.destination);
  state.cloudAsrActive = true;
  state.cloudAsrPreviewActive = Boolean(getSpeechRecognition());
  state.isListening = true;
  state.resumeListeningAfterNavigation = false;
  dom.micBtn.innerHTML = `${iconMap.mic}停止收听`;
  dom.studentAvatar.classList.remove("speaking");
  dom.studentState.textContent = "正在收听";
  startSpeechNoResultTimer();
  resetSilenceTimer(false);
  state.cloudAsrFlushTimer = setInterval(() => {
    void flushCloudAsrBuffer();
  }, 1600);
  if (state.cloudAsrPreviewActive) {
    try {
      state.speechRecognition.start();
    } catch {
      state.cloudAsrPreviewActive = false;
    }
  }
  return true;
}

function stopCloudAsrListening() {
  stopSpeechNoResultTimer();
  clearInterval(state.cloudAsrFlushTimer);
  state.cloudAsrFlushTimer = null;
  const hadPreview = state.cloudAsrPreviewActive;
  state.cloudAsrFinalizing = hadPreview;
  state.cloudAsrActive = false;
  state.cloudAsrPreviewActive = false;
  state.isListening = false;
  try {
    state.speechRecognition?.stop();
  } catch {
    // Browser preview recognition may already be stopped.
  }
  try {
    state.cloudAsrProcessor?.disconnect();
    state.cloudAsrSource?.disconnect();
  } catch {
    // Already disconnected.
  }
  state.cloudAsrStream?.getTracks?.().forEach((track) => track.stop());
  const closingAudioContext = state.cloudAsrAudioContext?.close?.();
  if (closingAudioContext && typeof closingAudioContext.catch === "function") {
    closingAudioContext.catch(() => {});
  }
  state.cloudAsrStream = null;
  state.cloudAsrAudioContext = null;
  state.cloudAsrSource = null;
  state.cloudAsrProcessor = null;
  void flushCloudAsrBuffer({ final: true });
  dom.micBtn.innerHTML = `${iconMap.mic}开始收听`;
  dom.studentAvatar.classList.remove("speaking");
  dom.studentState.textContent = "准备讲题";
}

async function toggleListening() {
  if (state.cloudAsrActive) {
    stopCloudAsrListening();
    return;
  }

  if (state.isListening) {
    const recognition = getSpeechRecognition();
    stopSpeechNoResultTimer();
    const draft = clearSpeechDraft();
    if (draft) {
      void enqueueRecognizedSpeech(draft);
    }
    state.isListening = false;
    state.silenceGuidePending = false;
    clearSilenceFollowup();
    clearTimeout(state.silenceTimer);
    recognition?.stop();
    return;
  }

  const cloudConfig = await getCloudSpeechConfig();
  if (cloudConfig.aliyunSpeechConfigured) {
    dom.micBtn.disabled = true;
    dom.studentState.textContent = "准备收听";
    await lianSpeak(pickPrompt("listening-start", LISTENING_START_PROMPTS), {
      logKey: "listening-start-prompt",
      allowRepeat: true
    });
    try {
      await startCloudAsrListening();
    } catch (error) {
      console.warn("Aliyun ASR start failed, using browser ASR:", error);
      state.cloudSpeechConfig = { ...cloudConfig, aliyunSpeechConfigured: false };
    } finally {
      dom.micBtn.disabled = false;
    }
    if (state.cloudAsrActive) return;
  }

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

function stopListeningAfterSessionCompletion() {
  if (state.cloudAsrActive) {
    stopCloudAsrListening();
  }
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
  syncTranscriptState();
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
  syncTranscriptState();
}

function clearSpeechDraft() {
  if (!state.speechDraftText) return "";
  const draft = state.speechDraftText;
  dom.transcriptInput.value = state.speechDraftBase || "";
  state.speechDraftText = "";
  state.speechDraftBase = "";
  syncTranscriptState();
  return draft;
}

function syncTranscriptState() {
  const question = currentPageQuestion();
  if (question) state.transcriptsByQuestion[question.id] = dom.transcriptInput.value;
}

function rememberCloudAsrPreviewFinal(text) {
  const normalized = cleanSpeechText(text);
  if (!normalized) return;
  const next = compactSpeechForCompare(normalized);
  const previous = compactSpeechForCompare(state.cloudAsrPreviewFinalText);
  if (previous && (next === previous || previous.includes(next))) return;
  state.cloudAsrPreviewFinalText = [state.cloudAsrPreviewFinalText, normalized]
    .filter(Boolean)
    .join(" ");
}

function commitCloudAsrPreviewFallback() {
  const fallback = normalizeMathSpeechText(
    cleanSpeechText(state.cloudAsrPreviewFinalText || state.speechDraftText)
  );
  state.cloudAsrPreviewFinalText = "";
  state.cloudAsrFinalizing = false;
  if (!fallback) {
    clearSpeechDraft();
    return "";
  }
  const previous = compactSpeechForCompare(state.lastCloudAsrText);
  const current = compactSpeechForCompare(fallback);
  clearSpeechDraft();
  if (previous && Date.now() - state.lastCloudAsrTextAt < 6000 && (current === previous || current.includes(previous))) {
    return "";
  }
  void enqueueRecognizedSpeech(fallback);
  return fallback;
}

function normalizeMathSpeechText(text) {
  let normalized = normalizeQuestionAwareSpeechText(cleanSpeechText(text));
  normalized = normalizeSpokenMathSymbols(normalized);
  if (!/等于|方程|等式|比例|比值|未知数|关系式|列式|结果|答案|x|y|m|n|[+\-*/=＝×÷]/i.test(normalized)) return normalized;

  normalized = normalized
    .replace(/爱克斯|埃克斯|艾克斯/g, "x")
    .replace(/歪(?=等于|加|减|乘|除|的值|是|为|得|关系)/g, "y")
    .replace(/嗯(?=等于|加|减|乘|除|的值|是|为|得)/g, "m")
    .replace(/恩(?=等于|加|减|乘|除|的值|是|为|得)/g, "n");
  return normalizeSpokenMathSymbols(normalizeQuestionAwareSpeechText(normalized)).replace(/\s+/g, " ").trim();
}

function spokenChineseNumberToArabic(value) {
  const text = String(value || "");
  const digits = {
    零: 0,
    〇: 0,
    一: 1,
    幺: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9
  };
  if (Object.hasOwn(digits, text)) return String(digits[text]);
  if (text === "十") return "10";
  const teen = /^十([一二两三四五六七八九])$/.exec(text);
  if (teen) return String(10 + digits[teen[1]]);
  const tens = /^([一二两三四五六七八九])十([一二两三四五六七八九])?$/.exec(text);
  if (tens) return String(digits[tens[1]] * 10 + (tens[2] ? digits[tens[2]] : 0));
  return text;
}

function normalizeSpokenMathSymbols(text) {
  let value = String(text || "").normalize("NFKC");
  if (!value) return "";

  value = value
    .replace(/[−﹣－]/g, "-")
    .replace(/[×✕]/g, "×")
    .replace(/爱克斯|埃克斯|艾克斯/gi, "x")
    .replace(/\bX\b/g, "x")
    .replace(/\bY\b/g, "y")
    .replace(/\bM\b/g, "m")
    .replace(/\bN\b/g, "n")
    .replace(/([0-9一二两三四五六七八九十零〇幺])\s*[xX]/g, (_, number) => `${spokenChineseNumberToArabic(number)}x`)
    .replace(/([0-9一二两三四五六七八九十零〇幺])\s*[yY]/g, (_, number) => `${spokenChineseNumberToArabic(number)}y`)
    .replace(/([0-9一二两三四五六七八九十零〇幺])\s*[mM]/g, (_, number) => `${spokenChineseNumberToArabic(number)}m`)
    .replace(/([0-9一二两三四五六七八九十零〇幺])\s*[nN]/g, (_, number) => `${spokenChineseNumberToArabic(number)}n`);

  value = value
    .replace(/负\s*([一二两三四五六七八九十零〇幺]|\d+(?:\.\d+)?)/g, (_, number) => `-${spokenChineseNumberToArabic(number)}`)
    .replace(/([xymnXYMN]|\d+(?:\.\d+)?)\s*(?:加上|加)\s*([xymnXYMN]|\d+(?:\.\d+)?)/g, "$1 + $2")
    .replace(/([xymnXYMN]|\d+(?:\.\d+)?)\s*(?:减去|减)\s*([xymnXYMN]|\d+(?:\.\d+)?)/g, "$1 - $2")
    .replace(/([xymnXYMN]|\d+(?:\.\d+)?)\s*(?:乘以|乘)\s*([xymnXYMN]|\d+(?:\.\d+)?)/g, "$1×$2")
    .replace(/([xymnXYMN]|\d+(?:\.\d+)?)\s*(?:除以|除)\s*([xymnXYMN]|\d+(?:\.\d+)?)/g, "$1÷$2")
    .replace(/([xymnXYMN]|\d+(?:\.\d+)?|\))\s*(?:等于|是|为)\s*(-?[xymnXYMN]|-?\d+(?:\.\d+)?)/g, "$1 = $2")
    .replace(/([xymnXYMN])\s*(?:的值)?\s*(?:等于|是|为)\s*(-?\d+(?:\.\d+)?)/g, "$1 = $2")
    .replace(/等于\s*(-?\d+(?:\.\d+)?|[xymnXYMN])/g, "= $1")
    .replace(/\s*([+\-=＝])\s*/g, " $1 ")
    .replace(/＝/g, "=")
    .replace(/\s+/g, " ")
    .trim();

  return value;
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
  const lines = current.split("\n");
  const original = String(originalText || "").trim();
  let lineIndex = -1;
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index].trim() === original) {
      lineIndex = index;
      break;
    }
  }
  if (lineIndex < 0) return false;
  lines[lineIndex] = correctedText;
  dom.transcriptInput.value = lines.join("\n");
  dom.transcriptInput.scrollTop = dom.transcriptInput.scrollHeight;
  return true;
}

async function correctLatestTranscript(text, options = {}) {
  const question = currentPageQuestion();
  if (!question || text.length < 4) return text;
  const requestId = ++state.transcriptCorrectionRequestId;
  const boardRecognitionPending = Boolean(
    state.recognitionTimer ||
    state.handwritingRequestInFlight ||
    state.handwritingRetryPending ||
    state.handwritingRetryTimer
  );
  const boardImage = options.boardImage ?? (
    !boardRecognitionPending && hasCurrentBoardInk(question)
      ? getBoardImageForGuide()
      : ""
  );

  try {
    const response = await fetch("/api/transcript-correct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionImage: question.image,
        text,
        rawAsrText: options.rawAsrText || text,
        localNormalizedText: options.localNormalizedText || text,
        problemText: question.problemText || question.title || "",
        knowledgePoints: question.knowledgePoints || [],
        latestHandwritingResult: state.latestHandwritingResult || null,
        boardImage,
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

function commitCloudAsrText(text) {
  const normalized = normalizeMathSpeechText(cleanSpeechText(text));
  if (!normalized) return "";
  const compact = compactSpeechForCompare(normalized);
  const now = Date.now();
  const previous = compactSpeechForCompare(state.lastCloudAsrText);
  if (previous && now - state.lastCloudAsrTextAt < 6000 && compact === previous) {
    return "";
  }
  clearSpeechDraft();
  appendTranscript(normalized);
  state.lastCloudAsrText = normalized;
  state.lastCloudAsrTextAt = now;
  dom.studentAvatar.classList.add("speaking");
  dom.studentState.textContent = "姝ｅ湪瀹炴椂杞啓";
  return normalized;
}

function enqueueRecognizedSpeech(text, options = {}) {
  const queuedOptions = { ...options };
  if (!queuedOptions.inputAlreadyRegistered) {
    markUserInput("speech");
    queuedOptions.inputAlreadyRegistered = true;
  }
  state.speechInterpretationPromise = state.speechInterpretationPromise
    .catch(() => {})
    .then(() => handleRecognizedSpeech(text, queuedOptions));
  return state.speechInterpretationPromise;
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

async function handleRecognizedSpeech(text, options = {}) {
  clearSpeechDraft();
  const rawText = cleanSpeechText(text);
  const immediateText = normalizeMathSpeechText(rawText);
  if (!immediateText) return;
  if (wasImmediateHelpAlreadyHandled(immediateText)) {
    if (compactSpeechForCompare(immediateText).length > compactSpeechForCompare(state.lastImmediateHelpText).length + 4) {
      replaceLastTranscriptSegment(state.lastImmediateHelpText, immediateText);
      state.lastImmediateHelpText = immediateText;
    }
    void correctLatestTranscript(immediateText, { rawAsrText: rawText, localNormalizedText: immediateText });
    return;
  }
  if (!options.alreadyCommitted) appendTranscript(immediateText);

  // Direct questions and explicit final answers must not wait for the optional
  // transcript-correction request.
  if (
    isDirectHelpRequest(rawText) ||
    isDirectHelpRequest(immediateText) ||
    state.awaitingFinalAnswer ||
    isExplicitFinalAnswerStatement(immediateText) ||
    extractDirectFinalAnswerCandidate(immediateText)
  ) {
    handleStudentSpeech(immediateText, options);
    void correctLatestTranscript(immediateText, { rawAsrText: rawText, localNormalizedText: immediateText });
    return;
  }

  const spokenText = await correctLatestTranscript(immediateText, { rawAsrText: rawText, localNormalizedText: immediateText });
  if (spokenText) handleStudentSpeech(spokenText, options);
}

function compactSpeechForCompare(text) {
  return String(text || "")
    .replace(/\s/g, "")
    .replace(/[，。！？,.!?、；;：:]/g, "")
    .toLowerCase();
}

function wasImmediateHelpAlreadyHandled(text) {
  const now = Date.now();
  if (!state.lastImmediateHelpAt || now - state.lastImmediateHelpAt > 7000) return false;
  const latest = compactSpeechForCompare(text);
  const handled = compactSpeechForCompare(state.lastImmediateHelpText);
  if (!latest || !handled) return false;
  return latest.includes(handled) || handled.includes(latest);
}

function tryHandleImmediateStuckSpeech(text) {
  if (state.teachSessionPaused || state.currentQuestionCompleted) return false;
  const rawText = cleanSpeechText(text);
  const immediateText = normalizeMathSpeechText(rawText);
  if (!immediateText || (!isImmediateStuckRequest(rawText) && !isImmediateStuckRequest(immediateText))) return false;
  if (wasImmediateHelpAlreadyHandled(immediateText)) return true;

  clearSpeechDraft();
  appendTranscript(immediateText);
  state.lastImmediateHelpAt = Date.now();
  state.lastImmediateHelpText = immediateText;
  handleStudentSpeech(immediateText);
  void correctLatestTranscript(immediateText, { rawAsrText: rawText, localNormalizedText: immediateText });
  return true;
}

function cleanSpeechText(text) {
  return String(text || "")
    .replace(/嗯(?=\s*(?:等于|加|减|乘|除|的值|是|为|得|等号|关系|方程))/g, "m")
    .replace(/恩(?=\s*(?:等于|加|减|乘|除|的值|是|为|得|等号|关系|方程))/g, "n")
    .replace(/歪(?=\s*(?:等于|加|减|乘|除|的值|是|为|得|等号|关系|方程))/g, "y")
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
  if (state.teachSessionPaused || state.silenceGuidanceExhausted) {
    console.info("[silence-timer] not armed", {
      paused: state.teachSessionPaused,
      exhausted: state.silenceGuidanceExhausted
    });
    return;
  }
  const now = Date.now();
  if (updateSpeechAt || !state.lastSpeechAt) state.lastSpeechAt = now;
  if (!state.lastUserInputAt) state.lastUserInputAt = getLastUserInputAt() || now;

  const anchor = state.awaitingSilenceFollowup ? state.silenceCareAskedAt || now : getLastUserInputAt() || now;
  const waitMs = state.awaitingSilenceFollowup ? SILENCE_AFTER_CARE_MS : SILENCE_CARE_MS;
  const delay = Math.max(0, waitMs - (now - anchor));
  state.silenceTimer = setTimeout(handleSilenceTimeout, delay);
  console.info("[silence-timer] scheduled", {
    followup: state.awaitingSilenceFollowup,
    delayMs: delay,
    silenceStage: state.silenceGuideStage,
    questionId: currentPageQuestion()?.id || ""
  });
}

function isGuideRequestRetryable(error) {
  if (!error || error.name === "AbortError") return false;
  if (["qwen_timeout", "request_aborted", "stale_request"].includes(error.code)) return false;
  // A network failure has already failed before a usable response exists.
  // Retrying here duplicated the same expensive guide request and produced
  // repeated notices while leaving the save action blocked.
  if (error.code === "network_error" || error.causeCode === "EACCES") return false;
  if (error.retryable === true) return true;
  if (error.code === "http_408" || error.code === "http_429") {
    return true;
  }
  return Number(error.status) >= 500 || error instanceof TypeError;
}

function handleSilenceTimeout() {
  console.info("[silence-timer] fired", {
    questionId: currentPageQuestion()?.id || "",
    idleSeconds: Math.round((Date.now() - getLastUserInputAt()) / 1000),
    awaitingFollowup: state.awaitingSilenceFollowup,
    stage: state.silenceGuideStage
  });
  if (state.teachSessionPaused) return;
  if (!currentPageQuestion() || state.currentQuestionCompleted) return;

  const now = Date.now();
  if (state.awaitingSilenceFollowup) {
    const careIdleMs = now - (state.silenceCareAskedAt || now);
    if (careIdleMs < SILENCE_AFTER_CARE_MS - 250) {
      resetSilenceTimer(false);
      return;
    }

    const nextStage = Math.min(
      MAX_SILENCE_GUIDE_STAGE,
      Math.max(1, Number(state.silenceGuideStage || 1) + 1)
    );
    state.silenceGuideStage = nextStage;
    state.silenceCareAskedAt = now;
    state.awaitingSilenceFollowup = nextStage < MAX_SILENCE_GUIDE_STAGE;
    state.silenceGuidanceExhausted = nextStage >= MAX_SILENCE_GUIDE_STAGE;
    const guideState = nextStage >= 2 ? GUIDE_STATES.INTERACTIVE : GUIDE_STATES.MICRO_HINT;
    console.info("[silence-guide] escalate", {
      stage: nextStage,
      silenceSeconds: Math.round((now - getLastUserInputAt()) / 1000),
      allowConcreteStep: nextStage >= 1,
      allowFormula: nextStage >= 1,
      allowFinalAnswer: nextStage >= MAX_SILENCE_GUIDE_STAGE
    });
    setGuideState(guideState);
    requestSmartGuide(nextStage >= 3 ? "silence_escalation" : "silence_followup", "", {
      force: true,
      guideState,
      silenceStage: nextStage,
      allowConcreteStep: nextStage >= 1,
      allowFormula: nextStage >= 1,
      allowFinalAnswer: nextStage >= MAX_SILENCE_GUIDE_STAGE,
      allowUnverifiedFinalAnswer: nextStage >= MAX_SILENCE_GUIDE_STAGE,
      silenceSeconds: Math.round((now - getLastUserInputAt()) / 1000),
      fallbackText: buildSilenceEscalationFallback(nextStage)
    });
    return;
  }

  const idleMs = now - getLastUserInputAt();
  if (idleMs < SILENCE_CARE_MS - 250) {
    resetSilenceTimer(false);
    return;
  }

  // Skip the vague first-stage care prompt. The first silence escalation
  // should use the concrete guidance that previously appeared at 120s.
  setGuideState(GUIDE_STATES.INTERACTIVE);
  state.silenceGuideStage = 2;
  state.silenceGuidanceExhausted = false;
  state.awaitingSilenceFollowup = true;
  state.silenceCareAskedAt = now;
  console.info("[silence-guide] start", {
    stage: 2,
    silenceSeconds: Math.round(idleMs / 1000),
    allowConcreteStep: true,
    allowFormula: true,
    allowFinalAnswer: false
  });
  requestSmartGuide("silence_followup", "", {
    force: true,
    guideState: GUIDE_STATES.INTERACTIVE,
    silenceStage: 2,
    allowConcreteStep: true,
    allowFormula: true,
    allowFinalAnswer: false,
    allowUnverifiedFinalAnswer: false,
    silenceSeconds: Math.round(idleMs / 1000),
    fallbackText: buildSilenceEscalationFallback(2)
  });
}

function getSilenceContextDetail() {
  const result = state.latestHandwritingResult || {};
  const question = currentPageQuestion();
  const memory = getQuestionMemory(question);
  const completedSteps = Array.isArray(result.completedSteps)
    ? result.completedSteps.map((step) => String(step || "").trim()).filter(Boolean)
    : [];
  const outline = Array.isArray(memory?.solutionOutline)
    ? memory.solutionOutline.map((step) => String(step || "").trim()).filter(Boolean)
    : [];
  const checks = Array.isArray(memory?.verificationChecks)
    ? memory.verificationChecks.map((step) => String(step || "").trim()).filter(Boolean)
    : [];
  const questionOutline = Array.isArray(question?.solutionOutline)
    ? question.solutionOutline.map((step) => String(step || "").trim()).filter(Boolean)
    : [];
  const questionChecks = Array.isArray(question?.verificationChecks)
    ? question.verificationChecks.map((step) => String(step || "").trim()).filter(Boolean)
    : [];
  // A raw board transcript is evidence, not the source of truth for a
  // problem relation. Prefer the answer-key outline that was produced when
  // the question page was opened. This prevents OCR fragments such as
  // “m-n=k” from becoming a new, incorrect guidance equation.
  const trustedStep = outline[Math.min(completedSteps.length, Math.max(0, outline.length - 1))]
    || outline[0]
    || questionOutline[Math.min(completedSteps.length, Math.max(0, questionOutline.length - 1))]
    || questionOutline[0];
  const candidates = [
    trustedStep,
    ...checks,
    ...questionChecks,
    result.expectedNextStep,
    result.missingBoardContent,
    result.currentStep,
    result.calculationCheck,
    result.mathExpression,
    result.detectedWriting,
    result.boardText,
    result.recognizedText
  ]
    .map((step) => String(step || "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    const equation = extractConcreteMathRelation(candidate);
    if (equation) return { formula: equation, explanation: candidate };
  }
  const explanation = candidates.find((step) => {
    if (/question memory|继续|下一步|关系式|列出|找出|想一想|再算|补写/i.test(step) && !/[=:+\-*/]/.test(step)) {
      return false;
    }
    return /[=:+\-*/]|\d|x|y|m|n|比例|面积|周长|体积|角度|方程|函数/i.test(step);
  }) || "";
  return explanation ? { formula: "", explanation } : { formula: "", explanation: "" };
}

function getSilenceContextStep() {
  return getSilenceContextDetail().formula;
}

function extractConcreteMathRelation(value) {
  const text = String(value || "")
    .normalize("NFKC")
    .replace(/[−﹣－]/g, "-")
    .replace(/[＝]/g, "=")
    .replace(/[×]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";

  const atom = "[-+A-Za-z0-9]+";
  const candidates = [
    ...text.matchAll(new RegExp(`${atom}(?:\\s*[+\\-*/]\\s*${atom}){0,5}\\s*(?:=|:|：)\\s*${atom}(?:\\s*[+\\-*/]\\s*${atom}){0,5}`, "g")),
    ...text.matchAll(/\d+(?:\.\d+)?\s*[:：]\s*\d+(?:\.\d+)?\s*=\s*[-+A-Za-z0-9.]+\s*[:：]\s*[-+A-Za-z0-9.]+/g)
  ];
  for (const match of candidates) {
    const relation = String(match[0] || "").replace(/\s+/g, " ").trim();
    if (relation.length < 3 || relation.length > 80) continue;
    if (!/[A-Za-z]/.test(relation) && !/\d\s*[:：=]/.test(relation)) continue;
    return relation;
  }
  return "";
}

function buildConcreteSilenceFallback(stage, formulaOverride = "") {
  const detail = getSilenceContextDetail();
  const normalizedStage = Math.max(1, Math.min(MAX_SILENCE_GUIDE_STAGE, Number(stage) || 1));
  const formula = String(formulaOverride || detail.formula || "").trim();
  if (formula) {
    const source = detail.explanation && detail.explanation !== detail.formula
      ? `这是根据题目条件“${detail.explanation.slice(0, 80)}”列出的`
      : "先把题目条件写成的";
    if (normalizedStage >= MAX_SILENCE_GUIDE_STAGE) {
      return `${source}关键式 ${formula}。现在沿着这个式子继续计算，并把最后答案写出来。`;
    }
    if (normalizedStage >= 3) {
      return `关键式是 ${formula}。请把它写在黑板上，再说明这一步是由哪些已知条件得到的。`;
    }
    if (normalizedStage === 2) {
      return `${source}关系式：${formula}。先完成这一式，再继续下一步计算。`;
    }
    return `先写出这个具体关系式：${formula}。它来自题目给出的已知条件。`;
  }
  if (detail.explanation) {
    return `根据题目中的“${detail.explanation.slice(0, 100)}”，先说明这一步的对应关系，再把得到的式子写在黑板上。`;
  }
  return "当前题目的具体步骤还没有加载完成，我暂时不猜式子以免误导。步骤加载后，我会直接给出对应关系式。";
}

function buildSilenceEscalationFallback(stage) {
  return buildConcreteSilenceFallback(stage);
}

function handleStudentSpeech(text, options = {}) {
  text = normalizeMathSpeechText(text);
  if (!text) return;
  state.latestStudentSpeechText = text;
  const normalized = text.replace(/\s/g, "");
  if (!options.inputAlreadyRegistered) markUserInput("speech");
  const directFinalAnswer = extractDirectFinalAnswerCandidate(text);
  const isExplicitFinalAnswer = isExplicitFinalAnswerStatement(text) || Boolean(directFinalAnswer);

  if (isExplicitFinalAnswer && hasConcreteFinalAnswer(directFinalAnswer || text)) {
    const answerText = directFinalAnswer || text;
    recordFinalAnswerEvidence(answerText);
    state.activeGuideRequestId += 1;
    state.lianSpeechRequestId += 1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    clearPendingThought();
    clearSilenceFollowup();
    state.pendingLianQuestion = null;
    state.awaitingFinalAnswer = false;
    state.pendingFinalAnswerText = "";
    dom.lianState.textContent = "正在核对最后答案";
    handleSpokenFinalAnswer(answerText);
    return;
  }

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
    handleSpokenFinalAnswer(combinedAnswer);
    return;
  }
  recordFinalAnswerEvidence(text);
  if (state.currentQuestionCompleted) return;
  if (state.finalAnswerVerified) {
    // Final-answer verification is terminal for the current answer. A later
    // board recognition result must not start a second completion workflow.
    return;
  }
  if (!hasCurrentBoardInk()) {
    clearTimeout(state.recognitionTimer);
    state.recognitionTimer = null;
  }
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

function isExplicitFinalAnswerStatement(text) {
  const normalized = String(text || "")
    .replace(/\s/g, "")
    .toUpperCase();
  if (!normalized) return false;
  return Boolean(
    /(?:最后|最终)(?:的)?(?:答案|结果)(?:是|为|等于|选)?/.test(normalized) ||
      /(?:正确)?答案(?:是|为|等于)/.test(normalized) ||
      /(?:结果)(?:是|为|等于)/.test(normalized) ||
      /(?:所以|因此|故)(?:最后|最终)?(?:答案|结果)(?:是|为|等于)/.test(normalized) ||
      /^(?:我)?(?:选|选择)[A-D](?:选项|项)?$/.test(normalized)
  );
}

function extractDirectFinalAnswerCandidate(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  const segments = value
    .split(/[\n。！？!?；;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const latest = segments.at(-1) || value;
  if (isStandaloneFinalAnswerCandidate(latest)) return latest;

  const trailing = value.match(/(?:^|[\s，,。；;：:])([A-D](?:选项|项)?|[a-zA-Z]\s*(?:=|＝|等于|为)\s*[负-]?(?:\d+(?:\.\d+)?|[零〇一二两三四五六七八九十百千万]+)(?:\s*(?:度|°|厘米|cm|米|m|千米|km|平方厘米|平方分米|平方米|立方厘米|cm³|cm3|元|克|千克|分钟|分|%|π))?|[负-]?(?:\d+(?:\.\d+)?|[零〇一二两三四五六七八九十百千万]+)\s*(?:度|°|厘米|cm|米|m|千米|km|平方厘米|平方分米|平方米|立方厘米|cm³|cm3|元|克|千克|分钟|分|%|π))\s*$/i);
  const candidate = trailing?.[1]?.trim() || "";
  return isStandaloneFinalAnswerCandidate(candidate) ? candidate : "";
}

function isStandaloneFinalAnswerCandidate(text) {
  const normalized = String(text || "")
    .normalize("NFKC")
    .replace(/\s/g, "")
    .replace(/[。！？!?；;，,、]+$/g, "")
    .toUpperCase();
  if (!normalized || normalized.length > 24) return false;
  const number = "[负-]?(?:\\d+(?:\\.\\d+)?|[零〇一二两三四五六七八九十百千万]+)";
  const unit = "(?:度|°|厘米|CM|米|M|千米|KM|平方厘米|平方分米|平方米|立方厘米|CM³|CM3|元|克|千克|分钟|分|%|π)";
  return Boolean(
    /^[A-D](?:选项|项)?$/i.test(normalized) ||
      new RegExp(`^[A-Z](?:=|＝|等于|为)${number}(?:${unit})?$`, "i").test(normalized) ||
      new RegExp(`^${number}${unit}$`, "i").test(normalized) ||
      /^(?:无解|无数解|不存在|无法确定)$/.test(normalized)
  );
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
    if (isStandaloneFinalAnswerCandidate(segments[index])) return segments[index].slice(-80);
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
  if (state.teachSessionPaused) {
    console.info("[guide] skipped", { eventType, reason: "session-paused" });
    return false;
  }
  if (state.currentQuestionCompleted) {
    console.info("[guide] skipped", { eventType, reason: "question-completed" });
    return false;
  }
  if (state.finalAnswerVerified) {
    console.info("[guide] skipped after final answer verification", {
      eventType,
      questionId: currentPageQuestion()?.id || "",
      boardCompletionVerified: state.boardCompletionVerified
    });
    return false;
  }
  if (state.openingSpeechInProgress && options.allowDuringOpening !== true) {
    console.info("[guide] skipped while opening speech is active", { eventType });
    return false;
  }
  const now = Date.now();
  const cooldown = options.cooldown ?? 15000;
  if (!options.force && cooldown && now - state.lastGuideAt < cooldown) {
    console.info("[guide] skipped", {
      eventType,
      reason: "cooldown",
      remainingMs: cooldown - (now - state.lastGuideAt)
    });
    return false;
  }
  const targetGuideState = options.guideState || state.guideState;
  const isSilenceGuide = /silence/.test(eventType);
  if (isSilenceGuide && state.silenceGuidePending) {
    console.info("[guide] skipped", { eventType, reason: "silence-request-pending" });
    return false;
  }

  const question = currentPageQuestion();
  if (!question) {
    console.warn("[guide] skipped", { eventType, reason: "no-current-question" });
    return false;
  }
  const questionContext = `${question.problemType || question.questionType || question.type || ""} ${question.title || ""} ${question.problemText || ""}`;
  const isChoiceQuestion = /选择题|判断题|单选|多选|下列.*(?:正确|错误)|正确的是|不正确的是|选项|结论\s*[一二三四IVX]/.test(questionContext);
  if (isChoiceQuestion) {
    const memory = getQuestionMemory(question) || await waitForEnteredQuestionMemory(question);
    if (!memory?.ready || !memory.canonicalAnswer || !memory.choiceAnalysis?.selectedOption) {
      console.info("[guide] skipped before fixed choice answer is ready", {
        eventType,
        questionId: question.id,
        memoryStatus: memory?.status || "missing"
      });
      dom.lianState.textContent = "正在准备这道选择题的标准答案";
      return false;
    }
  }
  const hasNewStudentSpeech = Boolean(String(latestStudentSpeech || "").trim());
  const guideFailureStillCooling =
    !options.retryAfterFailure &&
    !hasNewStudentSpeech &&
    state.guideUnavailableQuestionId === question.id &&
    Number(state.guideUnavailableUntil || 0) > now;
  if (guideFailureStillCooling) {
    console.info("[guide] skipped", {
      eventType,
      questionId: question.id,
      reason: "failure-circuit",
      remainingMs: Number(state.guideUnavailableUntil) - now
    });
    return false;
  }
  const handwritingPending = Boolean(
    state.recognitionTimer ||
    state.handwritingRequestInFlight ||
    state.handwritingRetryPending ||
    state.handwritingRetryTimer
  );
  // Never let a guide or transcript request capture the board while a fresh
  // stroke is waiting for handwriting recognition. The recognition pill is
  // the boundary: only that request may send the current blackboard image.
  if (handwritingPending) {
    console.info("[guide] skipped while handwriting is pending", {
      eventType,
      inFlight: state.handwritingRequestInFlight,
      recognitionTimer: Boolean(state.recognitionTimer),
      retryPending: state.handwritingRetryPending,
      hasRetryTimer: Boolean(state.handwritingRetryTimer),
      hasNewStudentSpeech,
      evidence: "wait-for-handwriting-recognition"
    });
    return false;
  }
  const activeRequest = state.guideRequestInFlight;
  const activeRequestIsCurrent = Boolean(
    activeRequest && activeRequest.requestId === state.activeGuideRequestId
  );
  if (activeRequestIsCurrent && (options.replacePending === true || hasNewStudentSpeech)) {
    state.guideAbortController?.abort(
      hasNewStudentSpeech ? "new-student-speech" : "replace-pending"
    );
    state.guideAbortController = null;
    state.guideRequestInFlight = null;
  } else if (activeRequestIsCurrent) {
    console.info("[guide] skipped duplicate in-flight request", {
      eventType,
      requestId: activeRequest.requestId,
      activeEventType: activeRequest.eventType
    });
    return false;
  }
  const requestId = ++state.activeGuideRequestId;
  const guideGeneration = state.guideGeneration;
  const questionId = question?.id || "";
  const guideInputSnapshot = getStudentInputSnapshot();
  const responseToken = getInteractionToken();
  const responseId = `guide:${responseToken.sessionId}:${responseToken.sequenceId}:${requestId}`;
  const guideOptions = {
    ...options,
    inputSnapshot: guideInputSnapshot,
    responseToken,
    responseId,
    requestId,
    sessionId: responseToken.sessionId
  };
  state.guideRequestInFlight = {
    requestId,
    guideGeneration,
    questionId,
    eventType,
    silenceStage: Number(options.silenceStage || state.silenceGuideStage || 0)
  };
  // Reserve the cooldown when the request starts, not only after TTS. This
  // prevents a second trigger from starting while the first Qwen request is
  // still waiting for the network.
  state.lastGuideAt = now;
  setGuideState(targetGuideState);
  dom.lianState.textContent = targetGuideState === GUIDE_STATES.INTERACTIVE ? "准备分步讲解" : "在想提示";
  if (isSilenceGuide) state.silenceGuidePending = true;

  try {
    const result = await requestAIGuide(eventType, latestStudentSpeech, guideOptions);
    if (
      state.teachSessionPaused ||
      requestId !== state.activeGuideRequestId ||
      guideGeneration !== state.guideGeneration ||
      currentPageQuestion()?.id !== questionId ||
      !isCurrentInteraction(responseToken)
    ) {
      console.info("[guide] result-discarded", {
        eventType,
        requestId,
        reason: "stale-interaction-or-question"
      });
      return false;
    }
    if (skipStaleHandwritingFeedback("guide-result", guideInputSnapshot)) {
      console.info("[guide] result-discarded", { eventType, requestId, reason: "new-student-input" });
      return false;
    }
    const lectureComplete = shouldCompleteCurrentLecture(result, latestStudentSpeech);
    // Only Qwen may provide guide speech. Local formula/generic fallbacks are disabled.
    const speech = formatGuideSpeech(result);
    if (result.shouldSpeak === false && !options.force) {
      dom.lianState.textContent = guideIdleText();
      if (lectureComplete && !state.hasExplicitFinalAnswer) askForFinalAnswer();
      return false;
    }
    if (!speech) {
      console.warn("[guide] Qwen returned no speech; local fallback is disabled", {
        eventType,
        requestId,
        questionId,
        provider: result?.provider || "qwen-structured-answer-guidance"
      });
      dom.lianState.textContent = "大模型没有返回引导";
      lianSilentNotice("这次引导没有拿到可用回复，请继续说或写下当前步骤。", {
        key: `guide-empty:${questionId}`,
        cooldownMs: 60000
      });
      state.guideUnavailableAt = Date.now();
      state.guideUnavailableQuestionId = questionId;
      state.guideUnavailableUntil = Date.now() + 60000;
      return false;
    }

    if (hasStudentInputSince(guideInputSnapshot)) return false;
    const silenceStage = Number(options.silenceStage || state.silenceGuideStage || 0);
    const guideFormula = /silence/.test(eventType)
      ? extractConcreteMathRelation(String(result?.formulaOrStep || ""))
      : "";
    const speechDedupeKey = guideFormula
      ? `step:${guideFormula}`
      : normalizeGuidanceFingerprint(speech);
    await lianSpeak(speech, {
      responseToken,
      responseId,
      guideRequestId: requestId,
      guideGeneration,
      questionId,
      dedupeKey: `guide:${questionId}:${/silence/.test(eventType) ? `silence-stage:${silenceStage}` : eventType}:${speechDedupeKey}`,
      cooldownMs: 90000
    });
    if (
      state.teachSessionPaused ||
      requestId !== state.activeGuideRequestId ||
      guideGeneration !== state.guideGeneration ||
      currentPageQuestion()?.id !== questionId ||
      !isCurrentInteraction(responseToken) ||
      hasStudentInputSince(guideInputSnapshot)
    ) {
      return false;
    }
    if (lectureComplete && !state.hasExplicitFinalAnswer) askForFinalAnswer();
    if (isSilenceGuide && !state.silenceGuidanceExhausted) resetSilenceTimer(false);
    return true;
  } catch (error) {
    console.warn("[guide] Qwen request failed; local fallback is disabled", {
      eventType,
      requestId,
      questionId,
      error: error?.message || String(error)
    });
    if (
      state.teachSessionPaused ||
      requestId !== state.activeGuideRequestId ||
      guideGeneration !== state.guideGeneration ||
      currentPageQuestion()?.id !== questionId ||
      !isCurrentInteraction(responseToken) ||
      hasStudentInputSince(guideInputSnapshot)
    ) {
      return false;
    }
    dom.lianState.textContent = "自动引导暂时不可用，但仍可继续核对和保存";
    state.guideUnavailableAt = Date.now();
    state.guideUnavailableQuestionId = questionId;
    state.guideUnavailableUntil = Date.now() + 60000;
    lianSilentNotice("自动引导暂时没有返回，但不影响继续核对。若已经说出答案，请点击保存至错题本继续。", {
      key: `guide-failed:${questionId}`,
      cooldownMs: 60000
    });
    return false;
  } finally {
    if (isSilenceGuide) state.silenceGuidePending = false;
    if (state.guideRequestInFlight?.requestId === requestId) {
      state.guideRequestInFlight = null;
    }
  }
}

async function requestAIGuide(eventType, latestStudentSpeech, options = {}) {
  const question = currentPageQuestion();
  if (!question) throw new Error("没有当前题目");

  saveCurrentPage();
  const memory = getQuestionMemory(question);
  const givenConditions = memory?.ready && Array.isArray(memory.givenConditions)
    ? memory.givenConditions.map((condition) => String(condition || "").replace(/\s+/g, "").trim()).filter(Boolean)
    : [];
  const trustedSteps = memory?.ready && Array.isArray(memory.solutionOutline)
    ? memory.solutionOutline
      .map((step) => String(step || "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .filter((step) => {
        const normalizedStep = step.replace(/\s+/g, "");
        return !givenConditions.some((condition) => normalizedStep === condition || normalizedStep.includes(condition) || condition.includes(normalizedStep));
      })
    : [];
  const trustedProblemText = memory?.ready && memory.problemText
    ? memory.problemText
    : question.problemText || "";
  const requestControl = createBoundedAbortController(null, GUIDE_REQUEST_TIMEOUT_MS);
  const guideRequestId = Number(options.requestId || 0);
  const guideSessionId = Number(options.sessionId ?? options.responseToken?.sessionId ?? state.lectureSessionId ?? 0);
  const markGuideRequestActive = () => {
    if (!guideRequestId || guideRequestId === state.activeGuideRequestId) {
      state.guideAbortController = requestControl;
      return true;
    }
    requestControl.abort("stale-guide-request");
    return false;
  };
  if (!markGuideRequestActive()) {
    const staleError = new Error("stale guide request");
    staleError.name = "AbortError";
    staleError.code = "stale_request";
    throw staleError;
  }
  const requestStartedAt = Date.now();
  let requestAttempt = 0;
  console.info("[guide] request-start", {
    eventType,
    questionId: question.id || "",
    silenceStage: Number(options.silenceStage || state.silenceGuideStage || 0),
    hasQuestionMemory: Boolean(memory?.ready),
    timeoutMs: GUIDE_REQUEST_TIMEOUT_MS
  });
  let response;
  try {
    // Give the guide the same frozen visual state as handwriting recognition:
    // one current blackboard image containing the question and raw strokes.
    const boardImage = await createCurrentBoardSnapshot({
      maxSide: GUIDE_IMAGE_MAX_SIDE,
      quality: GUIDE_IMAGE_JPEG_QUALITY
    });
    if (!markGuideRequestActive()) {
      const staleError = new Error("stale guide request");
      staleError.name = "AbortError";
      staleError.code = "stale_request";
      throw staleError;
    }
    console.info("[guide] request-payload", {
      questionId: question.id || "",
      requestId: guideRequestId,
      sessionId: guideSessionId,
      questionImageChars: 0,
      boardImageChars: boardImage.length,
      totalImageChars: boardImage.length
    });
    while (true) {
      requestAttempt += 1;
      try {
        response = await fetch("/api/guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
      questionId: question.id,
      requestId: guideRequestId,
      sessionId: guideSessionId,
      questionTitle: question.title || "",
      eventType,
      transcript: dom.transcriptInput.value.trim(),
      latestStudentSpeech,
      lianQuestion: options.lianQuestion || "",
      problemText: trustedProblemText,
      questionType: question.problemType || question.questionType || question.type || "",
      knowledgePoints: question.knowledgePoints || [],
      boardImage,
      hasBoardInk: Boolean(hasCurrentBoardInk(question)),
      askedConcepts: state.askedConceptsByQuestion[question.id] || [],
      resolvedConcepts: state.resolvedConceptsByQuestion[question.id] || [],
      previousGuideQuestion: state.pendingLianQuestion?.text || "",
      // The server/model reads progress from the current blackboard image;
      // never send a step reconstructed from an older handwriting result.
      silenceContextStep: "",
      verifiedGuideSteps: trustedSteps,
      // Reuse the frozen Question Memory created when this question was
      // entered. The guide endpoint must not solve the same image again just
      // to recover the answer key that is already available in the browser.
      questionMemory: memory ? {
        version: memory.version,
        memoryId: memory.memoryId,
        sessionId: memory.sessionId,
        questionId: memory.questionId,
        ready: memory.ready,
        status: memory.status,
        confidence: memory.confidence,
        canonicalAnswer: memory.canonicalAnswer,
        acceptedAnswers: memory.acceptedAnswers || [],
        choiceAnalysis: memory.choiceAnalysis || null,
        problemText: memory.problemText,
        questionType: memory.questionType,
        knowledge: memory.knowledge,
        givenConditions,
        solutionOutline: trustedSteps,
        verificationChecks: memory.verificationChecks || [],
        studentTrace: memory.studentTrace || null,
        reason: memory.reason || "",
        provider: memory.provider || "",
        elapsedMs: memory.elapsedMs || 0
      } : null,
      boardPendingRecognition: Boolean(
        state.lastBoardWriteAt &&
        state.lastBoardWriteAt > (state.lastHandwritingRecognizedAt || 0)
      ),
      guideState: options.guideState || state.guideState,
      lectureUnlocked: (options.guideState || state.guideState) === GUIDE_STATES.INTERACTIVE,
      silenceStage: Number(options.silenceStage || state.silenceGuideStage || 0),
      allowConcreteStep: options.allowConcreteStep === true,
      allowFormula: options.allowFormula === true,
      allowFinalAnswer: options.allowFinalAnswer === true,
      allowUnverifiedFinalAnswer: options.allowUnverifiedFinalAnswer === true,
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
      boardCompletionVerified: state.boardCompletionVerified,
      inputSnapshot: options.inputSnapshot || getStudentInputSnapshot(),
            responseId: options.responseId || ""
          }),
          signal: requestControl.signal
        });
        if (response.ok || requestAttempt >= 2) break;
        const retryBody = await response.clone().json().catch(() => ({}));
        const retryError = new Error(
          retryBody.error || `讲解引导失败（HTTP ${response.status}）`
        );
        retryError.code = retryBody.code || `http_${response.status}`;
        retryError.status = response.status;
        retryError.retryable = retryBody.retryable === true;
        if (!isGuideRequestRetryable(retryError)) break;
        console.warn("[guide] retrying transient response", {
          eventType,
          questionId: question.id || "",
          attempt: requestAttempt,
          status: response.status,
          code: retryError.code
        });
        await new Promise((resolve) => setTimeout(resolve, 250));
      } catch (error) {
        if (requestAttempt >= 2 || !isGuideRequestRetryable(error)) throw error;
        console.warn("[guide] retrying transient network failure", {
          eventType,
          questionId: question.id || "",
          attempt: requestAttempt,
          code: error?.code || "network_error",
          message: error?.message || String(error)
        });
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
  } catch (error) {
    console.error("[guide] request-failed", {
      eventType,
      questionId: question.id || "",
      elapsedMs: Date.now() - requestStartedAt,
      reason: error?.name === "AbortError" ? "timeout-or-cancel" : "network",
      message: error?.message || String(error)
    });
    throw error;
  } finally {
    if (state.guideAbortController === requestControl) {
      state.guideAbortController = null;
    }
    requestControl.cleanup();
  }
  console.info("[guide] response-received", {
    eventType,
    questionId: question.id || "",
    status: response.status,
    attempts: requestAttempt,
    elapsedMs: Date.now() - requestStartedAt
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || `讲解引导失败（HTTP ${response.status}）`);
    error.code = result.code || `http_${response.status}`;
    error.status = response.status;
    error.retryable = result.retryable === true;
    console.error("[guide] response-failed", {
      eventType,
      questionId: question.id || "",
      status: response.status,
      code: error.code,
      retryable: error.retryable,
      message: error.message
    });
    throw error;
  }
  const responseRequestId = Number(result?.requestId || 0);
  const responseSessionId = Number(result?.sessionId || 0);
  if (
    guideRequestId &&
    responseRequestId &&
    responseRequestId !== guideRequestId
  ) {
    const error = new Error("stale guide response");
    error.code = "stale_request";
    error.status = 409;
    throw error;
  }
  if (
    guideSessionId &&
    responseSessionId &&
    responseSessionId !== guideSessionId
  ) {
    const error = new Error("guide response belongs to another session");
    error.code = "stale_request";
    error.status = 409;
    throw error;
  }
  if (result?.progress?.resolvedConcepts && question.id) {
    state.resolvedConceptsByQuestion[question.id] = Array.from(new Set(
      result.progress.resolvedConcepts.map((item) => String(item || "")).filter(Boolean)
    ));
  }
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
  clearHandwritingRetryTimer();
  clearIssueTracking();
  clearSilenceFollowup();
  state.silenceGuidePending = false;
  state.guideAbortController?.abort("question-completed");
  state.guideAbortController = null;
  state.guideRequestInFlight = null;
  state.lianSpeechRequestId += 1;
  stopLianSpeechOutput();
  state.activeGuideRequestId += 1;
  state.handwritingRequestId += 1;
  state.handwritingRetryCountByKey = {};
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

function trimGuideSpeech(text, eventType) {
  let value = String(text || "").replace(/\s+/g, " ").trim();
  if (!value) return "";

  const silenceStage = Number(state.silenceGuideStage || 0);
  const isDetailedSilence = /silence/.test(eventType) && silenceStage >= MAX_SILENCE_GUIDE_STAGE;
  const maxLength = isDetailedSilence
    ? 240
    : /silence|active_help|repeat_wrong|error_silence|silence_followup|silence_escalation|next_step/.test(eventType)
    ? 120
    : 46;
  const maxSentences = isDetailedSilence
    ? 4
    : /silence|active_help|repeat_wrong|error_silence|silence_followup|silence_escalation|next_step/.test(eventType)
    ? 2
    : 1;

  const sentences = value.match(/[^。！？!?]+[。！？!?]?/g) || [value];
  value = sentences.slice(0, maxSentences).join("").trim();
  if (value.length <= maxLength) return value;

  const clipped = value.slice(0, maxLength);
  const softBreak = Math.max(
    clipped.lastIndexOf("，"),
    clipped.lastIndexOf("；"),
    clipped.lastIndexOf("、"),
    clipped.lastIndexOf(" ")
  );
  return `${(softBreak > 18 ? clipped.slice(0, softBreak) : clipped).trim()}。`;
}

function formatGuideSpeech(result) {
  // Speak exactly the structured text returned by Qwen. Do not append,
  // replace, or repair it with local formulas or generic prompts.
  return String(result?.speech || "").trim();
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
  if (eventType === "active_help" || eventType === "repeat_wrong" || eventType === "error_silence" || eventType === "silence_followup" || eventType === "silence_escalation" || eventType === "next_step") {
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

function isLianXiaoxiaoVoice(voice) {
  const identity = [
    voice?.voiceURI || "",
    voice?.name || "",
    voice?.lang || ""
  ].join(" ").toLowerCase();
  return /xiaoxiao|\u6653\u6653/.test(identity);
}

function chooseLianVoice(voices = []) {
  const xiaoxiaoVoice = voices.find(isLianXiaoxiaoVoice);
  if (xiaoxiaoVoice) return xiaoxiaoVoice;

  const gentleFemalePriorities = [
    ["xiaoxiao", "晓晓"],
    ["xiaoyi", "晓伊"],
    ["yaoyao", "瑶瑶"],
    ["xiaohan", "晓涵"],
    ["huihui", "慧慧"],
    ["tingting", "ting-ting", "婷婷"],
    ["meijia", "mei-jia", "美佳"],
    ["hanhan"],
    ["female", "woman", "girl", "女"]
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
      gentleFemalePriorities.forEach((hints, index) => {
        if (hints.some((hint) => name.includes(hint.toLowerCase()))) {
          score += Math.max(120, 320 - index * 24);
        }
      });
      if (/natural/.test(name)) score += 70;
      if (/online|neural/.test(name)) score += 35;
      if (/xiaoxiao|晓晓/.test(name) && /natural|online|neural/.test(name)) score += 120;
      if (/desktop|standard/.test(name)) score -= 12;
      if (maleHints.some((hint) => name.includes(hint))) score -= 240;
      return { voice, score };
    })
    .sort((a, b) =>
      b.score - a.score ||
      String(a.voice.name || "").localeCompare(String(b.voice.name || ""), "zh-CN")
    )[0]?.voice || null;
}

function getVoiceIdentity(voice) {
  if (!voice) return "";
  return [
    String(voice.voiceURI || ""),
    String(voice.name || ""),
    String(voice.lang || "")
  ].join("|");
}

function refreshLianVoice({ force = false } = {}) {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return state.lianVoice;
  if (state.lianVoiceSelectionLocked && !force) {
    const xiaoxiaoVoice = voices.find(isLianXiaoxiaoVoice);
    if (xiaoxiaoVoice && !isLianXiaoxiaoVoice(state.lianVoice)) {
      state.lianVoice = xiaoxiaoVoice;
      state.lianVoiceIdentity = getVoiceIdentity(xiaoxiaoVoice);
      return xiaoxiaoVoice;
    }
    return state.lianVoice;
  }

  if (!force && state.lianVoiceIdentity) {
    const lockedVoice = voices.find((voice) => getVoiceIdentity(voice) === state.lianVoiceIdentity);
    if (lockedVoice) {
      const xiaoxiaoVoice = voices.find(isLianXiaoxiaoVoice);
      if (xiaoxiaoVoice && !isLianXiaoxiaoVoice(lockedVoice)) {
        state.lianVoice = xiaoxiaoVoice;
        state.lianVoiceIdentity = getVoiceIdentity(xiaoxiaoVoice);
        return xiaoxiaoVoice;
      }
      state.lianVoice = lockedVoice;
      return lockedVoice;
    }
  }

  state.lianVoice = chooseLianVoice(voices);
  state.lianVoiceIdentity = getVoiceIdentity(state.lianVoice);
  return state.lianVoice;
}

function getLianVoice() {
  if (!("speechSynthesis" in window)) return null;
  return state.lianVoice || refreshLianVoice();
}

function waitForLianVoice(timeoutMs = 1200) {
  const existing = getLianVoice();
  if (existing || !("speechSynthesis" in window)) {
    state.lianVoiceSelectionLocked = true;
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    let settled = false;
    const deadline = Date.now() + timeoutMs;
    let checkTimer = null;
    let timeoutTimer = null;
    const finish = () => {
      if (settled) return;
      const voice = refreshLianVoice();
      if (!voice && Date.now() < deadline) return;
      settled = true;
      clearInterval(checkTimer);
      clearTimeout(timeoutTimer);
      window.speechSynthesis.removeEventListener?.("voiceschanged", handleVoicesChanged);
      state.lianVoiceSelectionLocked = true;
      resolve(voice || null);
    };
    const handleVoicesChanged = () => finish();
    checkTimer = setInterval(finish, 80);
    timeoutTimer = setTimeout(finish, timeoutMs);
    window.speechSynthesis.addEventListener?.("voiceschanged", handleVoicesChanged);
    finish();
  });
}

if ("speechSynthesis" in window) {
  refreshLianVoice();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => refreshLianVoice());
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

function splitLianSpeechText(text) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (!value) return [];
  const sentenceParts = value.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [value];
  const chunks = [];
  for (const part of sentenceParts) {
    let current = part.trim();
    while (current.length > 42) {
      const cutAt = Math.max(
        current.lastIndexOf("，", 42),
        current.lastIndexOf(",", 42),
        current.lastIndexOf("、", 42),
        current.lastIndexOf(" ", 42)
      );
      const index = cutAt > 14 ? cutAt + 1 : 42;
      chunks.push(current.slice(0, index).trim());
      current = current.slice(index).trim();
    }
    if (current) chunks.push(current);
  }
  return chunks.filter(Boolean);
}

async function playCloudLianSpeech(
  speechText,
  speechRequestId,
  publishText,
  responseToken,
  abortController,
  responseId
) {
  if (state.isMuted || !speechText) return false;
  let audioBlob = null;
  if (state.lianTtsPrefetch?.text === speechText) {
    audioBlob = state.lianTtsPrefetch.blob;
    state.lianTtsPrefetch = null;
  } else if (state.lianTtsPrefetchPromise?.text === speechText) {
    audioBlob = await Promise.race([
      state.lianTtsPrefetchPromise.promise,
      new Promise((resolve) => setTimeout(() => resolve(null), LIAN_TTS_REQUEST_TIMEOUT_MS))
    ]);
    if (state.lianTtsPrefetch?.text === speechText) {
      audioBlob = state.lianTtsPrefetch.blob;
      state.lianTtsPrefetch = null;
    }
  }

  // 首句可能遇到云端令牌刚建立、网络瞬时抖动等情况，云端请求最多重试一次。
  for (let attempt = 0; !audioBlob && attempt < 2; attempt += 1) {
    const requestControl = createBoundedAbortController(
      abortController?.signal,
      LIAN_TTS_REQUEST_TIMEOUT_MS
    );
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speechText, responseId }),
        signal: requestControl.signal
      });
      if (response.ok) {
        audioBlob = await response.blob();
      } else {
        const errorText = await response.text().catch(() => "");
        console.warn(`[tts] cloud request status=${response.status}:`, errorText.slice(0, 160));
      }
    } catch (error) {
      console.warn(`[tts] cloud request attempt=${attempt + 1} failed:`, error?.message || error);
    } finally {
      requestControl.cleanup();
    }
    if (!audioBlob?.size && attempt === 0) await new Promise((resolve) => setTimeout(resolve, 180));
  }
  if (!audioBlob?.size || speechRequestId !== state.lianSpeechRequestId || !isCurrentInteraction(responseToken)) return false;

  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = getLianAudioElement();
  audio.pause();
  audio.src = audioUrl;
  audio.preload = "auto";
  audio.muted = false;
  audio.volume = LIAN_VOICE_VOLUME;
  audio.load();
  state.currentLianUtterance = audio;

  return await new Promise((resolve) => {
    let settled = false;
    let playbackAttempts = 0;
    const cleanup = (played) => {
      if (settled) return;
      settled = true;
      audio.onplaying = null;
      audio.onended = null;
      audio.onerror = null;
      audio.onabort = null;
      if (audio.src === audioUrl) {
        audio.removeAttribute("src");
        audio.load();
      }
      URL.revokeObjectURL(audioUrl);
      resolve(Boolean(played));
    };
    audio.onplaying = () => {
      if (speechRequestId !== state.lianSpeechRequestId || !isCurrentInteraction(responseToken)) {
        audio.pause();
        cleanup(false);
        return;
      }
      publishText();
    };
    audio.onended = () => cleanup(true);
    audio.onerror = () => cleanup(false);
    audio.onabort = () => cleanup(false);
    audio.onpause = () => {
      if (speechRequestId !== state.lianSpeechRequestId || !isCurrentInteraction(responseToken)) cleanup(false);
    };
    const startPlayback = () => {
      audio.play().catch((error) => {
        console.warn("[tts] cloud audio playback failed:", error?.name || error);
        if (
          playbackAttempts === 0 &&
          speechRequestId === state.lianSpeechRequestId &&
          isCurrentInteraction(responseToken)
        ) {
          playbackAttempts += 1;
          setTimeout(() => {
            if (
              speechRequestId !== state.lianSpeechRequestId ||
              !isCurrentInteraction(responseToken)
            ) {
              cleanup(false);
              return;
            }
            audio.load();
            startPlayback();
          }, 180);
          return;
        }
        cleanup(false);
      });
    };
    startPlayback();
  });
}

function lianSpeak(text, options = {}) {
  if (state.teachSessionPaused && options.allowWhilePaused !== true) return Promise.resolve(false);
  const responseToken = options.responseToken || getInteractionToken();
  if (!isCurrentInteraction(responseToken)) return Promise.resolve(false);
  const isCurrentGuide = () => (
    options.guideRequestId == null || (
      Number(options.guideRequestId) === Number(state.activeGuideRequestId) &&
      Number(options.guideGeneration) === Number(state.guideGeneration)
    )
  );
  if (!isCurrentGuide()) return Promise.resolve(false);
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
  dom.lianState.textContent = "正在回应";
  dom.lianAvatar.classList.remove("listening");
  dom.lianAvatar.classList.add("speaking");
  let textPublished = false;
  const publishText = () => {
    if (textPublished || !isCurrentInteraction(responseToken) || !isCurrentGuide()) return false;
    textPublished = true;
    dom.lianBubble.textContent = text;
    if (options.log !== false) addLog("恋恋", text, { key: options.logKey || (dedupeKey ? `lian:${dedupeKey}` : "") });
    if (options.trackQuestion !== false) rememberLianQuestion(text);
    return true;
  };
  const speechRequestId = ++state.lianSpeechRequestId;
  const responseId = options.responseId || `lian:${responseToken.sessionId}:${responseToken.sequenceId}:${speechRequestId}`;
  stopLianSpeechOutput();
  const abortController = new AbortController();
  state.lianTtsAbortController = abortController;
  const pausedRecognition = pauseRecognitionForLianSpeech();

  return new Promise((resolve) => {
    let finished = false;
    let fallbackTimer = null;
    const textWatchdog = setTimeout(() => {
      if (
        finished ||
        textPublished ||
        speechRequestId !== state.lianSpeechRequestId ||
        !isCurrentInteraction(responseToken) ||
        !isCurrentGuide()
      ) return;
      console.warn("[tts] text publish watchdog fired", {
        responseId,
        speechRequestId,
        timeoutMs: LIAN_TEXT_PUBLISH_WATCHDOG_MS
      });
      publishText();
      dom.lianState.textContent = "语音准备中";
    }, LIAN_TEXT_PUBLISH_WATCHDOG_MS);
    const finishSpeaking = () => {
      if (finished) return;
      finished = true;
      clearTimeout(textWatchdog);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      const isCurrent = speechRequestId === state.lianSpeechRequestId && isCurrentInteraction(responseToken) && isCurrentGuide();
      if (isCurrent) publishText();
      if (speechRequestId === state.lianSpeechRequestId) {
        clearInterval(state.lianSpeechKeepAliveTimer);
        state.lianSpeechKeepAliveTimer = null;
        state.currentLianUtterance = null;
        if (state.lianTtsAbortController === abortController) state.lianTtsAbortController = null;
        if (pausedRecognition) resumeRecognitionAfterLianSpeech();
        dom.lianAvatar.classList.remove("speaking");
        dom.lianAvatar.classList.add("listening");
        dom.lianState.textContent = guideIdleText();
      }
      resolve(isCurrent);
    };

    const playBrowserSpeech = () => {
      if (state.isMuted || !("speechSynthesis" in window)) return false;
      window.speechSynthesis.cancel();
      if (speechRequestId !== state.lianSpeechRequestId || !isCurrentGuide()) {
        finishSpeaking();
        return true;
      }
      try {
        refreshLianVoice();
        const speechText = prepareLianSpeechText(text);
        const chunks = splitLianSpeechText(speechText);
        if (!chunks.length) {
          finishSpeaking();
          return true;
        }
        const startSpeech = (voice, chunkIndex = 0, retried = false) => {
          if (finished || speechRequestId !== state.lianSpeechRequestId || !isCurrentInteraction(responseToken) || !isCurrentGuide()) {
            finishSpeaking();
            return;
          }
          if (chunkIndex >= chunks.length) {
            finishSpeaking();
            return;
          }
          const chunk = chunks[chunkIndex];
          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.lang = "zh-CN";
          if (voice) utterance.voice = voice;
          utterance.rate = LIAN_VOICE_RATE;
          utterance.pitch = LIAN_VOICE_PITCH;
          utterance.volume = LIAN_VOICE_VOLUME;
          utterance.onstart = () => {
            publishText();
          };
          utterance.onend = () => {
            if (fallbackTimer) clearTimeout(fallbackTimer);
            fallbackTimer = null;
            startSpeech(voice, chunkIndex + 1, retried);
          };
          utterance.onerror = (event) => {
            console.warn("Lian speech failed:", event?.error || event);
            if (!retried && voice) {
              window.speechSynthesis.cancel();
              startSpeech(null, chunkIndex, true);
              return;
            }
            finishSpeaking();
          };
          state.currentLianUtterance = utterance;
          if (fallbackTimer) clearTimeout(fallbackTimer);
          fallbackTimer = setTimeout(() => {
            console.warn("Lian speech chunk timed out, continuing");
            startSpeech(voice, chunkIndex + 1, retried);
          }, Math.max(4200, 900 + chunk.length * 280));
          window.speechSynthesis.resume?.();
          window.speechSynthesis.speak(utterance);
          setTimeout(() => window.speechSynthesis.resume?.(), 80);
        };
        clearInterval(state.lianSpeechKeepAliveTimer);
        state.lianSpeechKeepAliveTimer = setInterval(() => {
          if (finished || speechRequestId !== state.lianSpeechRequestId || !isCurrentGuide()) return;
          window.speechSynthesis.resume?.();
        }, 1200);
        startSpeech(getLianVoice());
      } catch (error) {
        console.warn("Lian speech fallback:", error);
        finishSpeaking();
      }
      return true;
    };

    void (async () => {
      if (!state.isMuted) {
        try {
          if (!state.lianAudioUnlocked) {
            const unlocked = await unlockLianAudio();
            // The opening sentence is started from a requestAnimationFrame,
            // so retry the one-shot browser audio unlock if the first attempt
            // was rejected before the cloud audio request completed.
            if (!unlocked && options.isOpeningSpeech === true) {
              await unlockLianAudio();
            }
          }
          const speechText = prepareLianSpeechText(text);
          let playedCloud = await playCloudLianSpeech(
            speechText,
            speechRequestId,
            publishText,
            responseToken,
            abortController,
            responseId
          );
          // The first opening sentence can race the browser audio unlock or
          // the cloud TTS prefetch. Retry the cloud playback once before
          // falling back to text-only output.
          if (
            !playedCloud &&
            options.isOpeningSpeech === true &&
            speechRequestId === state.lianSpeechRequestId &&
            isCurrentInteraction(responseToken) &&
            isCurrentGuide()
          ) {
            await new Promise((resolve) => setTimeout(resolve, 180));
            if (
              speechRequestId === state.lianSpeechRequestId &&
              isCurrentInteraction(responseToken) &&
              isCurrentGuide()
            ) {
              playedCloud = await playCloudLianSpeech(
                speechText,
                speechRequestId,
                publishText,
                responseToken,
                abortController,
                responseId
              );
            }
          }
          if (playedCloud) {
            finishSpeaking();
            return;
          }
        } catch (error) {
          console.warn("Cloud Lian speech fallback:", error);
        }
      }
      if (finished || !isCurrentInteraction(responseToken) || !isCurrentGuide()) {
        finishSpeaking();
        return;
      }
      // 恋恋的声音必须保持云端同一音色。云端失败时保留文字并记录状态，
      // 不再静默切换到浏览器自带语音，避免第一句和后续声音不一致。
      if (options.allowBrowserFallback === true && playBrowserSpeech()) return;
      dom.lianState.textContent = "云端语音暂时不可用";
      publishText();
      fallbackTimer = setTimeout(finishSpeaking, 260);
    })();
  });
}

function lianSilentNotice(text, options = {}) {
  const shouldUpdateBubble = options.bubble !== false;
  const shouldLog = options.log !== false;
  const key = options.key || `silent:${text}`;
  const cooldownMs = Number.isFinite(options.cooldownMs) ? options.cooldownMs : 45000;
  const now = Date.now();

  // Deduplicate before touching the visible bubble. Previously the event log
  // was deduplicated but the bubble was updated on every retry, making one
  // upstream failure look like a loop of fresh assistant responses.
  const lastNoticeAt = state.lastSilentNoticeAtByKey.get(key) || 0;
  if (shouldLog && now - lastNoticeAt < cooldownMs) return;
  if (shouldLog) state.lastSilentNoticeAtByKey.set(key, now);

  if (shouldUpdateBubble) dom.lianBubble.textContent = text;
  dom.lianState.textContent = guideIdleText();
  dom.lianAvatar.classList.remove("speaking");
  dom.lianAvatar.classList.add("listening");

  if (!shouldLog) return;
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

async function handleFinalAnswerSubmission(answer, options = {}) {
  const question = currentPageQuestion();
  const normalizedAnswer = String(answer || "").trim();
  if (!question || !normalizedAnswer) return;

  // The current blackboard recognition request is the only verification route.
  // It receives the full board snapshot and trusted answer reference, then
  // decides whether to guide the student or allow saving.
  if (
    state.latestHandwritingResult &&
    hasCurrentRecognizedBoardStep(question) &&
    await handleHandwritingAnswerVerification(state.latestHandwritingResult)
  ) {
    return;
  }

  queueModelDecisionBeforeFinalCheck(normalizedAnswer, options.source || "答案核验");
}

function getAnswerCandidateForSave(question) {
  const directAnswer = String(
    state.pendingFinalAnswerText || extractFinalAnswerCandidate(dom.transcriptInput.value)
  ).trim();
  if (directAnswer) return directAnswer;
  if (state.finalAnswerVerified && state.verifiedFinalAnswerText) {
    return String(state.verifiedFinalAnswerText).trim();
  }
  return "";
}

async function saveCurrentQuestionAndContinue(options = {}) {
  const question = currentPageQuestion();
  if (!question) return;
  const pendingAnswer = getAnswerCandidateForSave(question);
  if (
    state.finalAnswerVerified &&
    !state.boardCompletionVerified &&
    !state.completionCheckInProgress
  ) {
    queueModelDecisionBeforeFinalCheck(pendingAnswer, "保存前板书进度");
    return;
  }

  if (!state.finalAnswerVerified) {
    if (pendingAnswer) {
      dom.finishQuestionBtn.disabled = true;
      await handleFinalAnswerSubmission(pendingAnswer, {
        silentLog: true,
        source: "save-button-recovery",
        continueAfterAnswer: true
      });
      return;
    }
  }
  if (!state.finalAnswerVerified || !state.boardCompletionVerified) {
    state.currentQuestionCompleted = false;
    dom.finishQuestionBtn.disabled = false;
    setGuideState(GUIDE_STATES.INTERACTIVE);
    lianSpeak(
      !state.finalAnswerVerified
        ? "这道题还不能保存，先把最终答案说清楚并核对正确。"
        : "答案已经正确，但还需要板书模型确认关键步骤。"
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

  let record = null;
  try {
    const enrichmentInput = {
      pages: pagesForQuestion(question.id),
      boardImage: getBoardImageForGuide(),
      lectureText: getNotebookLectureText(),
      latestHandwritingResult: state.latestHandwritingResult
    };
    record = buildNotebookRecord(question);
    state.notebook.unshift(record);
    state.completedThisSession.push(record);
    state.completedLectureQuestionIds.add(question.id);
    saveNotebook();
    // Do not block moving to the next question on remote enrichment.
    void enrichNotebookRecord(record.id, question, enrichmentInput);
  } catch (error) {
    console.warn("Notebook save failed:", error);
    if (record) state.completedThisSession = state.completedThisSession.filter((item) => item.id !== record.id);
    if (record) state.notebook = state.notebook.filter((item) => item.id !== record.id);
    dom.finishQuestionBtn.disabled = false;
    await lianSpeak("保存错题时遇到问题，页面没有继续跳转。你可以先返回错题本清理一下空间，再点击保存至错题本重试。");
    return;
  }

  const nextIndex = findNextUncompletedLectureIndex(state.boardPageIndex);
  if (nextIndex !== -1) {
    goToLectureQuestion(
      nextIndex,
      pickPrompt("next-question-after-save", [
        "答案核对正确，这道题完成了。我们看下一题，你先说说题目给了什么条件。",
        "这道题已经讲完并保存好了。接下来进入下一题，你按自己的思路慢慢讲。",
        "这题整理完成了，我们看下一题。你准备从哪里开始？"
      ])
    );
    return;
  }

  state.finalAnswerVerified = false;
  state.verifiedFinalAnswerText = "";
  state.boardCompletionVerified = false;
  state.currentQuestionCompleted = false;
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

function findNextUncompletedLectureIndex(fromIndex = state.boardPageIndex) {
  const total = state.lecture.length;
  if (!total) return -1;
  for (let offset = 1; offset <= total; offset += 1) {
    const index = (fromIndex + offset) % total;
    const question = state.lecture[index];
    if (question && !state.completedLectureQuestionIds.has(question.id)) return index;
  }
  return -1;
}

function goToLectureQuestion(index, openingText = "") {
  if (index < 0 || index >= state.lecture.length) return false;
  state.boardPageIndex = index;
  state.currentLectureIndex = index;
  const hasOpeningText = Boolean(openingText);
  resetQuestionGuideState({
    speak: !hasOpeningText,
    deferSilenceTimer: hasOpeningText
  });
  loadCurrentPage();
  updatePageLabel();
  dom.finishQuestionBtn.disabled = false;
  dom.studentState.textContent = state.isListening ? "正在收听" : "准备讲题";
  dom.lianAvatar.classList.remove("speaking");
  dom.lianAvatar.classList.add("listening");
  if (openingText) {
    const questionId = currentPageQuestion()?.id || "";
    const speechStartedAt = state.lastUserInputAt;
    state.openingSpeechInProgress = true;
    void lianSpeak(openingText, {
      isOpeningSpeech: true,
      allowRepeat: true,
      cooldownMs: 0
    }).finally(() => {
      startSilenceTimerAfterOpening(questionId, speechStartedAt, "question-change-finished");
    });
    clearTimeout(state.openingSpeechWatchdogTimer);
    state.openingSpeechWatchdogTimer = setTimeout(() => {
      if (state.openingSpeechInProgress) {
        startSilenceTimerAfterOpening(questionId, speechStartedAt, "question-change-watchdog");
      }
    }, 15000);
  } else {
    state.openingSpeechInProgress = false;
  }
  return true;
}

dom.finishQuestionBtn.addEventListener("click", () => {
  if (!state.lecture.length) return;
  if (state.completionCheckInProgress) return;
  if (state.currentQuestionCompleted && state.finalAnswerVerified && state.boardCompletionVerified) {
    void saveCurrentQuestionAndContinue();
    return;
  }
  if (state.finalAnswerVerified) {
    void saveCurrentQuestionAndContinue();
    return;
  }
  const pendingAnswer = getAnswerCandidateForSave(currentPageQuestion());
  // A pending answer must pass through the current board recognition decision.
  // The button never creates an unverified record.
  if (pendingAnswer) {
    void handleFinalAnswerSubmission(pendingAnswer, {
      silentLog: true,
      source: "save-button-recovery",
      continueAfterAnswer: true
    });
    return;
  }
  const answerCandidate = extractFinalAnswerCandidate(dom.transcriptInput.value);
  if (answerCandidate) {
    handleSpokenFinalAnswer(answerCandidate);
    return;
  }
  if (state.awaitingFinalAnswer) {
    const pendingAnswer = String(state.pendingFinalAnswerText || "").trim();
    if (pendingAnswer) {
      void handleFinalAnswerSubmission(pendingAnswer, { silentLog: true });
    } else {
      askForFinalAnswer();
    }
    return;
  }
  askForFinalAnswer();
});

function confirmNotebookSave() {
  return window.confirm("是否保存到错题本？");
}

function getNotebookLectureText() {
  return dom.transcriptInput.value.trim();
}

function buildLianArchiveSummary(question, lectureText) {
  const title = String(question?.title || "这道题").trim();
  const knowledge = String(question?.knowledge || question?.type || "").trim();
  const hasLecture = Boolean(String(lectureText || "").trim());
  if (knowledge) {
    return `${title}的关键是围绕“${knowledge}”把题目条件、关键关系式和最后结论讲清楚。${hasLecture ? "本次已经保存了你的讲解文字，复习时可以先遮住提示再复讲一遍。" : "复习时重点重新说出条件和关键步骤。"}`;
  }
  return `${title}已经完成整理。复习时先回忆题目给出的条件，再把关键式子和最后答案用自己的话讲一遍。`;
}

function buildMistakePoints(question, lectureText) {
  const text = `${question?.problemText || ""} ${lectureText || ""}`;
  const points = [];
  if (/[-−]|负|正负|移项/.test(text)) points.push("注意符号变化，尤其是移项、相减和代入后的正负号。");
  if (/[：:]|比例|分之|\/|比/.test(text)) points.push("注意比例关系的顺序，要按题目给出的对应关系列式。");
  if (/度|°|圆|面积|体积|单位|cm|米|千米|m\b/i.test(text)) points.push("注意单位和公式含义，最后结果要带上合适单位。");
  if (/方程|x|y|m|n|代入|消元/i.test(text)) points.push("注意把未知数、方程关系和代入验证过程说完整。");
  if (!points.length) points.push("容易只记住最后答案，复习时要重新讲出题目条件和关键步骤。");
  return points.slice(0, 3);
}

function normalizeArchiveDedupeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/题图中的原错痕迹[:：]?/g, "")
    .replace(/原错痕迹[:：]?/g, "")
    .replace(/[“”"'‘’\s，。；;：:、（）()【】\[\]{}<>《》.!?？]/g, "")
    .toLowerCase();
}

function cleanLianSummaryText(summary, fallbackSummary = "") {
  const value = String(summary || "").trim();
  if (!value) return fallbackSummary;
  const withoutMistakeTail = value
    .replace(/[；;。]?\s*易错点(?:是|在于|为)?[^。；;]*[。；;]?/g, "")
    .replace(/[；;。]?\s*(?:原错痕迹|之前错在|容易错在|误以为|错选|被叉掉|被红笔划去|多选了)[^。；;]*[。；;]?/g, "")
    .trim();
  const parts = withoutMistakeTail
    .split(/(?<=[。！？!?；;])/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/(?:易错点|原错痕迹|之前错在|容易错在|误以为|错选|被叉掉|被红笔划去|多选了)/.test(part));
  const cleaned = (parts.join("") || withoutMistakeTail).trim();
  return cleaned || fallbackSummary || value;
}

function dedupeMistakePoints(points = [], lianSummary = "") {
  const summaryKey = normalizeArchiveDedupeText(lianSummary);
  const unique = [];
  const seen = new Set();
  (Array.isArray(points) ? points : []).forEach((point) => {
    const text = String(point || "").trim();
    if (!text) return;
    const key = normalizeArchiveDedupeText(text).slice(0, 48);
    if (!key || seen.has(key)) return;
    if (summaryKey && key.length >= 12 && summaryKey.includes(key)) return;
    const overlapsExisting = unique.some((existing) => {
      const existingKey = normalizeArchiveDedupeText(existing);
      return key.length >= 16 && (existingKey.includes(key) || key.includes(existingKey.slice(0, 48)));
    });
    if (overlapsExisting) return;
    seen.add(key);
    unique.push(text);
  });
  return unique.slice(0, 4);
}

async function requestArchiveSummary(question, lectureText, boardImage, latestHandwritingResult = state.latestHandwritingResult) {
  const response = await fetch("/api/archive-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionImage: question.image,
      boardImage,
      questionTitle: question.title || "",
      problemText: question.problemText || "",
      knowledgePoints: question.knowledgePoints || [],
      lectureText,
      verifiedFinalAnswer: state.verifiedFinalAnswerText || "",
      latestHandwritingResult: latestHandwritingResult || null
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "错题总结生成失败");

  const observedWrongTrace = String(result.observedWrongTrace || "").trim();
  const mistakePoints = Array.isArray(result.mistakePoints)
    ? result.mistakePoints.map((point) => String(point || "").trim()).filter(Boolean)
    : [];
  if (observedWrongTrace && !mistakePoints.some((point) => point.includes(observedWrongTrace.slice(0, 8)))) {
    mistakePoints.unshift(`题图中的原错痕迹：${observedWrongTrace}`);
  }
  const fallbackSummary = buildLianArchiveSummary(question, lectureText);
  const lianSummary = cleanLianSummaryText(result.lianSummary, fallbackSummary);

  return {
    lianSummary,
    mistakePoints: dedupeMistakePoints(mistakePoints, lianSummary),
    observedWrongTrace,
    reviewFocus: String(result.reviewFocus || "").trim(),
    archiveProvider: result.provider || "",
    archiveModel: result.model || "",
    archiveConfidence: Number(result.confidence) || 0
  };
}

function buildReviewPlan(fromDate = new Date()) {
  const offsets = [
    { label: "今天", hours: 4 },
    { label: "1天后", days: 1 },
    { label: "3天后", days: 3 },
    { label: "7天后", days: 7 }
  ];
  return offsets.map((item) => {
    const date = new Date(fromDate);
    if (item.hours) date.setHours(date.getHours() + item.hours);
    if (item.days) date.setDate(date.getDate() + item.days);
    return {
      label: item.label,
      at: date.toISOString(),
      done: false
    };
  });
}

function buildNotebookRecord(question) {
  const lectureText = getNotebookLectureText();
  const now = new Date();
  const reviewAt = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const verifiedAnswerKey =
    state.questionMemoriesByQuestion[question.id] ||
    {
      ready: false,
      status: "not-fetched",
      confidence: 0,
      canonicalAnswer: "",
      acceptedAnswers: [],
      solutionOutline: [],
      verificationChecks: []
    };
  const archiveSummary = {
    lianSummary: buildLianArchiveSummary(question, lectureText),
    mistakePoints: buildMistakePoints(question, lectureText),
    observedWrongTrace: "",
    reviewFocus: "",
    archiveProvider: "local-fallback",
    archiveModel: "",
    archiveConfidence: 0
  };
  const reviewPlan = buildReviewPlan(now);

  return {
    id: safeNowId("note"),
    sourceQuestionId: question.id,
    title: `错题 ${state.notebook.length + 1}`,
    questionImage: question.image,
    strokeImages: [],
    lectureText,
    transcript: lectureText,
    answerKey: verifiedAnswerKey,
    verifiedAnswer: verifiedAnswerKey.ready ? verifiedAnswerKey.canonicalAnswer : state.verifiedFinalAnswerText,
    answerKeyStatus: verifiedAnswerKey.status,
    answerKeyConfidence: verifiedAnswerKey.confidence,
    lianSummary: archiveSummary.lianSummary,
    mistakePoints: archiveSummary.mistakePoints,
    observedWrongTrace: archiveSummary.observedWrongTrace,
    reviewFocus: archiveSummary.reviewFocus,
    archiveProvider: archiveSummary.archiveProvider,
    archiveModel: archiveSummary.archiveModel,
    archiveConfidence: archiveSummary.archiveConfidence,
    reviewPlan,
    reviewAt: reviewAt.toISOString(),
    status: "还要复习",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

async function enrichNotebookRecord(recordId, question, input = {}) {
  try {
    const lectureText = String(input.lectureText || "").trim();
    const answerKeyPromise = waitForEnteredQuestionMemory(question).catch((error) => {
      console.warn("Notebook Question Memory enrichment skipped:", error);
      return null;
    });
    const archivePromise = requestArchiveSummary(
      question,
      lectureText,
      input.boardImage,
      input.latestHandwritingResult
    ).catch((error) => {
      console.warn("Archive summary enrichment skipped:", error);
      return null;
    });
    const strokePromise = compactStrokePages(Array.isArray(input.pages) ? input.pages : []).catch((error) => {
      console.warn("Notebook stroke enrichment skipped:", error);
      return [];
    });
    const [verifiedAnswerKey, archiveSummary, strokeImages] = await Promise.all([
      answerKeyPromise,
      archivePromise,
      strokePromise
    ]);
    const record = state.notebook.find((item) => item.id === recordId);
    if (!record) return;
    if (verifiedAnswerKey) {
      record.answerKey = verifiedAnswerKey;
      record.verifiedAnswer = verifiedAnswerKey.ready
        ? verifiedAnswerKey.canonicalAnswer
        : state.verifiedFinalAnswerText;
      record.answerKeyStatus = verifiedAnswerKey.status;
      record.answerKeyConfidence = verifiedAnswerKey.confidence;
    }
    if (archiveSummary?.lianSummary && archiveSummary.mistakePoints?.length) {
      Object.assign(record, archiveSummary);
    }
    if (strokeImages.length) record.strokeImages = strokeImages;
    record.updatedAt = new Date().toISOString();
    saveNotebook();
    if (views.notebookView?.classList.contains("active")) renderNotebook();
  } catch (error) {
    console.warn("Notebook background enrichment failed:", error);
  }
}

async function compactStrokePages(pages) {
  const nonEmptyPages = pages.filter(Boolean);
  const results = await Promise.all(nonEmptyPages.map((page) => compactStrokeImage(page)));
  return results.filter(Boolean);
}

async function compactStrokeImage(dataUrl) {
  const image = await loadImage(dataUrl);
  const maxWidth = 960;
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const compactCtx = canvas.getContext("2d", { willReadFrequently: true });
  compactCtx.clearRect(0, 0, canvas.width, canvas.height);
  compactCtx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const inkBounds = getStrokeInkBounds(compactCtx, canvas.width, canvas.height);
  if (!inkBounds) return "";

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = inkBounds.w;
  croppedCanvas.height = inkBounds.h;
  const croppedCtx = croppedCanvas.getContext("2d");
  croppedCtx.clearRect(0, 0, croppedCanvas.width, croppedCanvas.height);
  croppedCtx.drawImage(
    canvas,
    inkBounds.x,
    inkBounds.y,
    inkBounds.w,
    inkBounds.h,
    0,
    0,
    croppedCanvas.width,
    croppedCanvas.height
  );

  const webp = croppedCanvas.toDataURL("image/webp", 0.72);
  return webp.startsWith("data:image/webp") ? webp : croppedCanvas.toDataURL("image/png");
}

function getStrokeInkBounds(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];
      if (alpha <= 18) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;
  const padding = Math.max(18, Math.min(42, Math.round(Math.min(width, height) * 0.035)));
  const safeLeft = Math.max(0, left - padding);
  const safeTop = Math.max(0, top - padding);
  const safeRight = Math.min(width, right + padding + 1);
  const safeBottom = Math.min(height, bottom + padding + 1);
  return {
    x: safeLeft,
    y: safeTop,
    w: Math.max(1, safeRight - safeLeft),
    h: Math.max(1, safeBottom - safeTop)
  };
}

function getSnapshotImageState(questionId) {
  const imageState = state.boardImageStates[questionId];
  const rect = dom.blackboard.getBoundingClientRect();
  const boardWidth = dom.blackboard.clientWidth || rect.width;
  const boardHeight = dom.blackboard.clientHeight || rect.height;
  if (!imageState || !boardWidth || !boardHeight) return null;
  return {
    ...imageState,
    boardWidth,
    boardHeight
  };
}

async function composeBoardSnapshot(strokesDataUrl, questionImageUrl, imageState = null) {
  const strokes = strokesDataUrl ? await loadImage(strokesDataUrl) : null;
  const boardRect = dom.blackboard.getBoundingClientRect();
  const boardCssWidth = imageState?.boardWidth || dom.blackboard.clientWidth || boardRect.width || 1280;
  const boardCssHeight = imageState?.boardHeight || dom.blackboard.clientHeight || boardRect.height || 720;
  const width = Math.max(1, strokes?.naturalWidth || Math.round(boardCssWidth * (window.devicePixelRatio || 1)) || 1280);
  const height = Math.max(1, strokes?.naturalHeight || Math.round(boardCssHeight * (window.devicePixelRatio || 1)) || 720);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const snapshot = canvas.getContext("2d");
  snapshot.fillStyle = "#183d35";
  snapshot.fillRect(0, 0, width, height);
  snapshot.strokeStyle = "rgba(248,242,216,0.08)";
  snapshot.lineWidth = 1;
  const scaleX = width / boardCssWidth;
  const scaleY = height / boardCssHeight;
  for (let x = 0; x < width; x += Math.max(1, Math.round(54 * scaleX))) {
    snapshot.beginPath();
    snapshot.moveTo(x, 0);
    snapshot.lineTo(x, height);
    snapshot.stroke();
  }
  for (let y = 0; y < height; y += Math.max(1, Math.round(54 * scaleY))) {
    snapshot.beginPath();
    snapshot.moveTo(0, y);
    snapshot.lineTo(width, y);
    snapshot.stroke();
  }

  if (questionImageUrl) {
    const questionImage = await loadImage(questionImageUrl);
    const drawX = imageState ? imageState.x * scaleX : 43 * scaleX;
    const drawY = imageState ? imageState.y * scaleY : 43 * scaleY;
    const drawW = imageState ? imageState.baseWidth * imageState.scale * scaleX : 420 * scaleX;
    const drawH = imageState ? imageState.baseHeight * imageState.scale * scaleY : 240 * scaleY;
    snapshot.fillStyle = "#fff";
    snapshot.fillRect(drawX - 9, drawY - 9, drawW + 18, drawH + 18);
    snapshot.drawImage(questionImage, drawX, drawY, drawW, drawH);
  }

  if (strokes) snapshot.drawImage(strokes, 0, 0, width, height);

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

function isRecordMastered(record) {
  return /已掌握/.test(String(record?.status || ""));
}

function getReviewDate(record) {
  const date = new Date(record?.reviewAt || record?.createdAt || Date.now());
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function getReviewBuckets(records = []) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const upcomingEnd = new Date(now);
  upcomingEnd.setDate(upcomingEnd.getDate() + 3);

  const active = records.filter((record) => !isRecordMastered(record));
  const overdue = active.filter((record) => getReviewDate(record) < todayStart);
  const today = active.filter((record) => {
    const reviewDate = getReviewDate(record);
    return reviewDate >= todayStart && reviewDate < todayEnd;
  });
  const upcoming = active.filter((record) => {
    const reviewDate = getReviewDate(record);
    return reviewDate >= todayEnd && reviewDate <= upcomingEnd;
  });
  const due = active.filter((record) => getReviewDate(record) <= todayEnd);
  return { active, overdue, today, upcoming, due };
}

function renderReviewPage() {
  updateNotebookCount();
  if (!dom.reminderCenter || !dom.dueReviewList || !dom.reviewPlan) return;

  if (!state.notebook.length) {
    const empty = '<div class="empty-review">讲解并保存错题后，这里会生成复习提醒。</div>';
    dom.reviewPageState.textContent = "暂无需要复习的错题";
    dom.reminderCenter.innerHTML = empty;
    dom.dueReviewList.innerHTML = empty;
    dom.reviewPlan.innerHTML = empty;
    return;
  }

  const buckets = getReviewBuckets(state.notebook);
  dom.reviewPageState.textContent = `当前 ${buckets.due.length} 道到期，${buckets.upcoming.length} 道即将复习`;

  dom.reminderCenter.innerHTML = `
    <div class="reminder-stats">
      <article><strong>${buckets.today.length}</strong><span>今日到期</span></article>
      <article><strong>${buckets.upcoming.length}</strong><span>即将到期</span></article>
      <article><strong>${buckets.overdue.length}</strong><span>已逾期</span></article>
    </div>
    ${renderReviewMiniList([...buckets.overdue, ...buckets.today].slice(0, 4), "今天可以先复习这些")}
  `;

  const waiting = [...state.notebook]
    .filter((record) => !isRecordMastered(record))
    .sort((a, b) => getReviewDate(a) - getReviewDate(b));
  dom.dueReviewList.innerHTML = waiting.length
    ? waiting.map(renderReviewListItem).join("")
    : '<div class="empty-review">暂时没有待复习错题。</div>';

  dom.reviewPlan.innerHTML = state.notebook
    .slice(0, 8)
    .map(renderReviewPlanItem)
    .join("");

  $$(".review-open-note", dom.reviewPageState.closest(".review-page")).forEach((button) => {
    button.addEventListener("click", () => {
      state.activeNotebookId = button.dataset.noteId;
      showView("notebookView");
    });
  });
}

function renderReviewMiniList(records, emptyText) {
  if (!records.length) return `<div class="empty-review">${escapeHTML(emptyText)}</div>`;
  return records
    .map(
      (record) => `
        <button class="review-mini review-open-note" data-note-id="${record.id}" type="button">
          <span>${escapeHTML(record.title)}</span>
          <strong>${formatDate(record.reviewAt)}</strong>
        </button>
      `
    )
    .join("");
}

function renderReviewListItem(record) {
  return `
    <article class="review-list-item">
      <img src="${record.questionImage}" alt="${escapeHTML(record.title)}" />
      <div>
        <strong>${escapeHTML(record.title)}</strong>
        <span>${escapeHTML(record.status || "还要复习")} · ${formatDate(record.reviewAt)}</span>
        <p>${escapeHTML(getRecordLianSummary(record))}</p>
      </div>
      <button class="text-btn review-open-note" data-note-id="${record.id}" type="button">查看</button>
    </article>
  `;
}

function renderReviewPlanItem(record) {
  const plan = getRecordReviewPlan(record);
  return `
    <article class="review-plan-item">
      <strong>${escapeHTML(record.title)}</strong>
      <div class="plan-steps">
        ${plan
          .map(
            (step) => `
              <span class="${step.done ? "done" : ""}">
                ${escapeHTML(step.label || "复习")} · ${formatDate(step.at)}
              </span>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

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
  const lianSummary = getRecordLianSummary(record);
  const mistakePoints = getRecordMistakePoints(record);
  const lectureTextBlock = lectureText
    ? `<p>讲解文字：${escapeHTML(lectureText)}</p>`
    : "<p>讲解文字：这次没有保存文字讲解。</p>";
  const mistakePointBlock = mistakePoints.length
    ? `<ul class="mistake-points">${mistakePoints.map((point) => `<li>${escapeHTML(point)}</li>`).join("")}</ul>`
    : '<p class="muted-line">暂未整理易错点。</p>';
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
        <section class="detail-note-block">
          <h4>恋恋总结</h4>
          <p>${escapeHTML(lianSummary)}</p>
        </section>
        <section class="detail-note-block">
          <h4>易错点</h4>
          ${mistakePointBlock}
        </section>
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

function getRecordLianSummary(record) {
  const saved = String(record?.lianSummary || record?.aiSummary || "").trim();
  const fallback = buildLianArchiveSummary(
    {
      title: record?.title || "这道错题",
      knowledge: record?.knowledge || ""
    },
    getRecordLectureText(record)
  );
  if (saved) return cleanLianSummaryText(saved, fallback);
  return fallback;
}

function getRecordMistakePoints(record) {
  const points = record?.mistakePoints || record?.easyMistakes || [];
  const observedWrongTrace = String(record?.observedWrongTrace || "").trim();
  if (Array.isArray(points) && points.length) {
    const normalized = points.map((point) => String(point).trim()).filter(Boolean);
    if (observedWrongTrace && !normalized.some((point) => point.includes(observedWrongTrace.slice(0, 8)))) {
      normalized.unshift(`题图中的原错痕迹：${observedWrongTrace}`);
    }
    return dedupeMistakePoints(normalized, getRecordLianSummary(record));
  }
  const text = getRecordLectureText(record);
  const fallback = buildMistakePoints({ title: record?.title || "", problemText: "" }, text);
  if (observedWrongTrace) fallback.unshift(`题图中的原错痕迹：${observedWrongTrace}`);
  return dedupeMistakePoints(fallback, getRecordLianSummary(record));
}

function getRecordReviewPlan(record) {
  if (Array.isArray(record?.reviewPlan) && record.reviewPlan.length) return record.reviewPlan;
  const createdAt = Number.isNaN(new Date(record?.createdAt).getTime()) ? new Date() : new Date(record.createdAt);
  return buildReviewPlan(createdAt);
}

function updateRecordStatus(id, status) {
  state.notebook = state.notebook.map((record) =>
    record.id === id ? { ...record, status, updatedAt: new Date().toISOString() } : record
  );
  saveNotebook();
  renderNotebook();
}

function deleteRecord(id) {
  state.notebook = state.notebook.filter((record) => record.id !== id);
  if (state.activeNotebookId === id) state.activeNotebookId = state.notebook[0]?.id || null;
  saveNotebook();
  deleteNotebookRecordFromCloud(id);
  renderNotebook();
}

renderQuestions();
renderNotebook();
hydrateNotebookFromCloud();
