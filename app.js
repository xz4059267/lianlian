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

const SILENCE_CARE_MS = 120000;
const SILENCE_AFTER_CARE_MS = 60000;
const ERROR_SILENCE_MS = 60000;
const BOARD_RECOGNITION_DELAY_MS = 6500;
const THOUGHT_PAUSE_MS = 2600;
const THOUGHT_REVIEW_COOLDOWN_MS = 18000;
const ACTIVE_HELP_PATTERN = /为什么|不懂|怎么来|怎么来的|求助|不会|不会做|没思路|不知道|卡住|讲一下|提示一下/;

const state = {
  source: null,
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
  boardHistories: {},
  boardImageStates: {},
  handwritingResults: {},
  tool: "pen",
  brushColor: "#f8f2d8",
  brushSize: 5,
  drawing: false,
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
  isListening: false,
  isMuted: false,
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
  normalSpeechCount: 0,
  stuckCount: 0,
  wrongAttemptCount: 0,
  lastIssueAt: 0,
  silenceCareAskedAt: 0,
  awaitingSilenceFollowup: false,
  interactiveStepCount: 0,
  activeGuideRequestId: 0,
  silenceGuidePending: false,
  activeNotebookId: null,
  notebook: loadNotebook()
};

function showView(viewId) {
  Object.entries(views).forEach(([id, view]) => view.classList.toggle("active", id === viewId));
  dom.navBtns.forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
  if (viewId === "notebookView") renderNotebook();
  if (viewId === "teachView") requestAnimationFrame(resizeBoardCanvas);
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
  if (!state.lastIssueAt || state.guideState === GUIDE_STATES.INTERACTIVE) return;
  const delay = Math.max(0, ERROR_SILENCE_MS - (Date.now() - state.lastIssueAt));
  state.issueSilenceTimer = setTimeout(handleIssueSilenceTimeout, delay);
}

function handleIssueSilenceTimeout() {
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

  const reader = new FileReader();
  setStatus(dom.uploadState, "上传中");
  reader.onload = async () => {
    const dataUrl = reader.result;
    const image = await loadImage(dataUrl);
    state.source = {
      dataUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
      name: file.name
    };
    state.questions = [];
    state.selectedIds = [];
    renderQuestions();
    dom.sourcePreview.src = dataUrl;
    dom.previewPanel.classList.remove("hidden");
    dom.dropZone.classList.add("hidden");
    setStatus(dom.uploadState, "图片已上传");
    setStatus(dom.segmentState, "可以自动分割，也可以手动框选");
    setManualMode(false);
    await runAutoSegment();
  };
  reader.onerror = () => setStatus(dom.uploadState, "上传失败，请换一张图片");
  reader.readAsDataURL(file);
}

function resetUpload() {
  state.source = null;
  state.questions = [];
  state.selectedIds = [];
  setManualMode(false);
  dom.imageInput.value = "";
  dom.sourcePreview.removeAttribute("src");
  dom.previewPanel.classList.add("hidden");
  dom.dropZone.classList.remove("hidden");
  setStatus(dom.uploadState, "等待上传");
  setStatus(dom.segmentState, "上传后可生成题目");
  renderQuestions();
}

dom.autoSegmentBtn.addEventListener("click", runAutoSegment);

async function runAutoSegment() {
  if (!state.source) {
    setStatus(dom.segmentState, "先上传错题图片");
    return;
  }

  setManualMode(false);
  dom.processingBox.classList.remove("hidden");
  setStatus(dom.segmentState, "AI 分割中");

  let segments = [];
  let usedApi = false;
  try {
    const result = await requestAISegmentation("initial");
    segments = normalizeSegmentResult(result);
    if (!result?.fallbackToWholePage && needsStrictWholePageRetry(segments)) {
      setStatus(dom.segmentState, "正在重新分析整页题目结构");
      const strictResult = await requestAISegmentation("strict_structure");
      const strictSegments = normalizeSegmentResult(strictResult);
      if (strictResult?.fallbackToWholePage || strictSegments.length && !needsStrictWholePageRetry(strictSegments)) {
        segments = strictSegments;
      } else {
        segments = [];
      }
    }
    usedApi = segments.length > 0;
  } catch (error) {
    console.warn("AI segmentation fallback:", error);
  }

  if (!segments.length) {
    dom.processingBox.classList.add("hidden");
    state.questions = [];
    state.selectedIds = [];
    renderQuestions();
    setStatus(dom.segmentState, "AI 没有可靠拆出单题，请改用手动框选");
    return;
  }

  const questions = [];
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    questions.push(
      await createQuestionFromBox(segment.box, "AI 自动分割", {
        index: index + 1,
        aiMeta: segment.meta
      })
    );
  }

  state.questions = questions;
  state.selectedIds = questions.map((question) => question.id);
  dom.processingBox.classList.add("hidden");
  setStatus(dom.segmentState, usedApi ? `AI 已识别 ${questions.length} 道题目` : `已生成 ${questions.length} 道题目，可手动调整`);
  renderQuestions();
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

function normalizeSegmentResult(result, sourceSize = state.source) {
  if (!sourceSize) return [];
  const rawQuestions = Array.isArray(result?.questions) ? result.questions : [];
  const visibleQuestionCount = rawQuestions.length;
  const segments = rawQuestions
    .map((item) => {
      const box = clampSegmentBox(item, sourceSize.width, sourceSize.height);
      if (!box) return null;
      const title = String(item.problemText || item.title || "").trim();
      const type = item.problemType || item.type || "";
      const knowledge = normalizeMainKnowledgePoint(item.mainKnowledgePoint || item.knowledge || item.knowledgePoints, `${title} ${type}`);
      if (isSuspiciousWholePageSegment(box, item, knowledge, visibleQuestionCount, sourceSize)) return null;
      return {
        box,
        meta: {
          questionNumber: String(item.questionNumber || item.number || "").trim(),
          problemText: title,
          problemType: sanitizeMathLabel(type),
          knowledgePoints: knowledge.points,
          confidence: Number(item.confidence) || 0
        }
      };
    })
    .filter(Boolean);

  if (!segments.length && result?.fallbackToWholePage && canUseWholeImageAsSingleQuestion(sourceSize)) {
    segments.push({
      box: { x: 0, y: 0, w: sourceSize.width, h: sourceSize.height },
      meta: {
        problemText: "",
        problemType: "整页题目",
        knowledgePoints: [],
        confidence: 0.3
      }
    });
  }

  return segments.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x);
}

function canUseWholeImageAsSingleQuestion(sourceSize = state.source) {
  if (!sourceSize) return false;
  const ratio = sourceSize.height / Math.max(1, sourceSize.width);
  return ratio < 1.2;
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
  const tallPage = state.source.height > state.source.width * 1.1;
  const sorted = [...segments].sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x);
  const hasMergedSignal = sorted.some(segmentHasMergedQuestionSignals);
  const hasDuplicateBoxes = sorted.some((segment, index) =>
    sorted.slice(index + 1).some((other) => segmentOverlapRatio(segment.box, other.box) > 0.85)
  );
  const hasVeryLargeChunk = sorted.some((segment) => {
    const areaRatio = (segment.box.w * segment.box.h) / (state.source.width * state.source.height);
    const heightRatio = segment.box.h / state.source.height;
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

  const safeX = Math.max(0, Math.min(width - 1, x));
  const safeY = Math.max(0, Math.min(height - 1, y));
  const safeW = Math.max(1, Math.min(width - safeX, w));
  const safeH = Math.max(1, Math.min(height - safeY, h));
  if (safeW < width * 0.05 || safeH < height * 0.035) return null;
  return {
    x: Math.round(safeX),
    y: Math.round(safeY),
    w: Math.round(safeW),
    h: Math.round(safeH)
  };
}

async function createQuestionFromBox(box, sourceLabel, options = {}) {
  const imageData = await cropImage(state.source.dataUrl, box);
  const imageMeta = await readImageMeta(imageData);
  const aiMeta = options.aiMeta || {};
  const knowledge = normalizeMainKnowledgePoint(aiMeta.knowledgePoints, `${aiMeta.problemText || ""} ${aiMeta.problemType || ""}`);
  return {
    id: safeNowId("question"),
    title: aiMeta.questionNumber ? `第 ${aiMeta.questionNumber} 题` : `第 ${options.index || state.questions.length + 1} 题`,
    source: sourceLabel,
    captureMode: options.captureMode || "segment",
    image: imageData,
    imageWidth: imageMeta.width,
    imageHeight: imageMeta.height,
    questionNumber: aiMeta.questionNumber || "",
    problemText: aiMeta.problemText || "",
    problemType: sanitizeMathLabel(aiMeta.problemType || ""),
    knowledgePoints: knowledge.points,
    confidence: Number(aiMeta.confidence) || 0,
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
    $(".question-order", card).textContent = selectedIndex >= 0 ? selectedIndex + 1 : index + 1;
    $(".question-meta strong", card).textContent = question.questionNumber ? `题目 ${question.questionNumber}` : `题目 ${index + 1}`;
    const mainKnowledge = question.knowledgePoints?.[0] || "";
    $(".question-meta span", card).textContent = mainKnowledge
      ? `${question.source} · ${mainKnowledge}`
      : question.source;

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
  state.boardHistories = {};
  state.boardImageStates = {};
  state.handwritingResults = {};
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
  dom.lianBubble.textContent = "我们开始讲解错题吧。你慢慢说，我会陪你一起把思路理顺。";
  const now = Date.now();
  state.lastGuideAt = 0;
  state.lastSpeechAt = now;
  state.lastBoardWriteAt = now;
  state.lastUserInputAt = now;
  state.lastEncourageAt = now;
  state.normalSpeechCount = 0;
  state.stuckCount = 0;
  clearIssueTracking();
  clearSilenceFollowup();
  state.activeGuideRequestId += 1;
  requestAnimationFrame(() => {
    resizeBoardCanvas();
    loadCurrentPage();
    updatePageLabel();
    lianSpeak("我们开始讲解错题吧。你慢慢说，先从题目给了什么条件开始就好。");
  });
}

dom.backToUploadBtn.addEventListener("click", () => showView("uploadView"));

function resizeBoardCanvas() {
  const rect = dom.blackboard.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const oldImage = dom.canvas.width ? dom.canvas.toDataURL("image/png") : "";
  const ratio = window.devicePixelRatio || 1;
  dom.canvas.width = Math.round(rect.width * ratio);
  dom.canvas.height = Math.round(rect.height * ratio);
  dom.canvas.style.width = `${rect.width}px`;
  dom.canvas.style.height = `${rect.height}px`;
  ctx = dom.canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  clearCanvasOnly();
  if (oldImage) drawDataUrlToCanvas(oldImage);
  applyBoardImageState();
}

window.addEventListener("resize", () => {
  if (views.teachView.classList.contains("active")) {
    saveCurrentPage();
    resizeBoardCanvas();
    loadCurrentPage();
  }
});

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

function drawDataUrlToCanvas(dataUrl) {
  if (!dataUrl) return;
  const image = new Image();
  image.onload = () => {
    const rect = dom.canvas.getBoundingClientRect();
    clearCanvasOnly();
    ctx.drawImage(image, 0, 0, rect.width, rect.height);
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

function pushHistory() {
  const key = historyKey();
  if (!key) return;
  state.boardHistories[key] = state.boardHistories[key] || [];
  state.boardHistories[key].push(dom.canvas.toDataURL("image/png"));
  if (state.boardHistories[key].length > 18) state.boardHistories[key].shift();
}

function saveCurrentPage() {
  const question = currentPageQuestion();
  if (!question || !dom.canvas.width) return;
  const pages = pagesForQuestion(question.id);
  pages[0] = dom.canvas.toDataURL("image/png");
}

function loadCurrentPage() {
  const question = currentPageQuestion();
  clearCanvasOnly();
  if (!question) return;
  if (dom.boardQuestionImage.src !== question.image) dom.boardQuestionImage.src = question.image;
  const pages = pagesForQuestion(question.id);
  drawDataUrlToCanvas(pages[0] || "");
  applyBoardImageState();
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
  state.lastPoint = pointerToCanvas(event);
  ctx.beginPath();
  ctx.moveTo(state.lastPoint.x, state.lastPoint.y);
  dom.studentAvatar.classList.add("speaking");
  dom.studentState.textContent = "正在板书";
});

dom.canvas.addEventListener("pointermove", (event) => {
  if (state.imageDragging && state.lastPoint) {
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
  ctx.globalCompositeOperation = state.tool === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle = state.brushColor;
  ctx.lineWidth = state.tool === "eraser" ? state.brushSize * 4 : state.brushSize;
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
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
    state.drawing = false;
    state.lastPoint = null;
    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";
    dom.studentAvatar.classList.remove("speaking");
    dom.studentState.textContent = "继续讲题";
    saveCurrentPage();
    markUserInput("board");
    scheduleHandwritingRecognition("停笔 6 秒后");
  });
});

dom.penTool.addEventListener("click", () => setTool("pen"));
dom.eraserTool.addEventListener("click", () => setTool("eraser"));
dom.moveImageTool.addEventListener("click", () => setTool("moveImage"));

dom.blackboard.addEventListener(
  "wheel",
  (event) => {
    if (!currentPageQuestion()) return;
    if (state.tool !== "moveImage" && !event.ctrlKey) return;
    event.preventDefault();
    const point = pointerToCanvas(event);
    zoomBoardImage(event.deltaY > 0 ? 0.9 : 1.1, point);
  },
  { passive: false }
);

function setTool(tool) {
  state.tool = tool;
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
  pushHistory();
  clearCanvasOnly();
  saveCurrentPage();
  markUserInput("board");
  scheduleHandwritingRecognition("清空后重新整理");
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
  state.lastSpeechAt = now;
  state.lastBoardWriteAt = now;
  state.lastUserInputAt = now;
  state.lastEncourageAt = now;
  state.normalSpeechCount = 0;
  state.stuckCount = 0;
  clearIssueTracking();
  clearSilenceFollowup();
  state.activeGuideRequestId += 1;
  state.silenceGuidePending = false;
  state.latestHandwritingResult = null;
  state.lastHandwritingIssueKey = "";
  if (state.isListening) resetSilenceTimer();
}

function scheduleHandwritingRecognition(reason) {
  clearTimeout(state.recognitionTimer);
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
      log: "DeepSeek API 余额不足，板书识别已暂停。换成有额度的 API key 后再刷新页面即可继续。",
      pauseMs: 10 * 60 * 1000
    };
  }
  if (code === "invalid_api_key" || /api key|authentication|认证|鉴权/i.test(message)) {
    return {
      pill: "识别授权失败",
      log: "API key 无法通过认证，请检查 .env 里的 DEEPSEEK_API_KEY 或 deepseek_api_key。",
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
  if (!question || !dom.canvas.width) return;
  if (Date.now() < state.handwritingDisabledUntil) {
    showPausedHandwritingNotice();
    return;
  }

  const requestId = ++state.handwritingRequestId;
  saveCurrentPage();
  dom.recognitionPill.textContent = "板书识别中";
  dom.recognitionPill.classList.remove("hidden");

  try {
    const result = normalizeHandwritingResult(await requestHandwritingAnalysis(question, reason));
    if (requestId !== state.handwritingRequestId) return;
    state.latestHandwritingResult = result;
    state.handwritingResults[question.id] = result;

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
    (result.mathExpression ? `这一步能算通，${result.mathExpression} 先保留下来。` : "这一步关系能对上，先保留下来。");
  lianSpeak(feedback);
  return true;
}

function shouldAskForHandwritingConfirmation(result) {
  if (!result) return false;
  if (isIncompleteHandwritingIssue(result)) return false;
  if (isHandwritingCalculationWrong(result) || isHandwritingCalculationCorrect(result)) return false;

  const hasRecentBoardWriting = Date.now() - (state.lastBoardWriteAt || 0) < 90000;
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

  return Boolean(result.isRelevant || hasRecognizedContent || looksMathRelated || hasRecentBoardWriting);
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
    ? "我看到了你在写关系式，但最后一步我没完全看清。你把最后一行读给我听，我来帮你核一下。"
    : "我这次没完全看清板书。你把刚写的等式或最后结果读给我听，我接着帮你判断。";
  lianSpeak(speech);
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
  const guidance = result.guidance || "这里先停一下，检查一下刚写的数量关系。";
  lianSpeak(guidance);
  return true;
}

function addLog(title, text) {
  const item = document.createElement("div");
  item.className = "log-item";
  item.innerHTML = `<strong>${escapeHTML(title)}</strong>${escapeHTML(text)}`;
  dom.eventLog.prepend(item);
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
    lianSpeak("先说一句你的思路也可以，比如题目给了什么条件。");
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
    const wasListening = state.isListening;
    state.isListening = true;
    dom.micBtn.innerHTML = `${iconMap.mic}停止收听`;
    dom.studentAvatar.classList.remove("speaking");
    dom.studentState.textContent = "正在收听";
    startSpeechNoResultTimer();
    if (!wasListening || !state.lastSpeechAt) state.lastSpeechAt = Date.now();
    resetSilenceTimer(false);
  };

  recognition.onaudiostart = () => {
    dom.studentState.textContent = "正在收听";
    startSpeechNoResultTimer();
  };

  recognition.onsoundstart = () => {
    dom.studentState.textContent = "听到声音";
  };

  recognition.onspeechstart = () => {
    dom.studentAvatar.classList.add("speaking");
    dom.studentState.textContent = "正在讲题";
  };

  recognition.onresult = (event) => {
    let finalText = "";
    let interimText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0].transcript.trim();
      if (event.results[index].isFinal) finalText += text;
      else interimText += text;
    }
    if (interimText || finalText) {
      stopSpeechNoResultTimer();
    }
    if (interimText) {
      dom.studentAvatar.classList.add("speaking");
      dom.studentState.textContent = "正在讲题";
      showSpeechDraft(interimText);
    }
    if (finalText) {
      commitSpeechText(finalText);
      handleStudentSpeech(finalText);
      resetSilenceTimer();
    }
  };

  recognition.onerror = (event) => {
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
      lianSpeak("第一次使用麦克风时，请在浏览器弹窗里点允许。允许后，这个页面会直接开始收听。");
      return;
    }

    if (event.error === "audio-capture") {
      state.isListening = false;
      clearTimeout(state.silenceTimer);
      dom.micBtn.innerHTML = `${iconMap.mic}开始收听`;
      lianSpeak("我没有找到可用的麦克风。检查一下设备后，再点开始收听。");
      return;
    }

    lianSilentNotice("语音识别暂时不稳定。我还在听，你也可以继续讲。");
  };

  recognition.onend = () => {
    stopSpeechNoResultTimer();
    const draft = clearSpeechDraft();
    if (draft) {
      appendTranscript(draft);
      handleStudentSpeech(draft);
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
    lianSpeak("第一次使用麦克风时，请在浏览器弹窗里点允许。允许后，这个页面会直接开始收听。");
    return false;
  } finally {
    state.micPermissionPending = false;
    dom.micBtn.disabled = false;
  }
}

async function toggleListening() {
  const recognition = getSpeechRecognition();
  if (!recognition) {
    lianSpeak("这个浏览器暂时不能直接识别语音，可以用下面的文本框模拟讲解。");
    return;
  }

  if (state.isListening) {
    stopSpeechNoResultTimer();
    const draft = clearSpeechDraft();
    if (draft) {
      appendTranscript(draft);
      handleStudentSpeech(draft);
    }
    state.isListening = false;
    state.silenceGuidePending = false;
    clearSilenceFollowup();
    clearTimeout(state.silenceTimer);
    recognition.stop();
  } else {
    const allowed = await ensureMicrophonePermission();
    if (!allowed) return;
    try {
      recognition.start();
    } catch {
      lianSpeak("麦克风还没准备好，可以稍等一下再点。");
    }
  }
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

function commitSpeechText(text) {
  clearSpeechDraft();
  const finalText = cleanSpeechText(text);
  if (!finalText) return;
  appendTranscript(finalText);
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
  const now = Date.now();
  if (updateSpeechAt || !state.lastSpeechAt) state.lastSpeechAt = now;
  if (!state.lastUserInputAt) state.lastUserInputAt = getLastUserInputAt() || now;

  const anchor = state.awaitingSilenceFollowup ? state.silenceCareAskedAt || now : getLastUserInputAt() || now;
  const waitMs = state.awaitingSilenceFollowup ? SILENCE_AFTER_CARE_MS : SILENCE_CARE_MS;
  const delay = Math.max(0, waitMs - (now - anchor));
  state.silenceTimer = setTimeout(handleSilenceTimeout, delay);
}

function handleSilenceTimeout() {
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
  lianSpeak("我看到你停了一会儿，是不是思路上卡住了？要不要先说说你卡在哪一步？");
  resetSilenceTimer(false);
}

function handleStudentSpeech(text) {
  const normalized = text.replace(/\s/g, "");
  markUserInput("speech");
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

  if (/听懂了|懂了|明白了|会了/.test(normalized) && state.guideState === GUIDE_STATES.INTERACTIVE && !ACTIVE_HELP_PATTERN.test(normalized)) {
    clearPendingThought();
    setGuideState(GUIDE_STATES.HEURISTIC);
    clearIssueTracking();
    lianSpeak("你已经接住这一步了。那你用自己的话把它接着讲下去。");
    return;
  }

  if (ACTIVE_HELP_PATTERN.test(normalized)) {
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

function scheduleThoughtPauseReview(text, flags = {}) {
  clearTimeout(state.pendingThoughtTimer);
  const clipped = String(text || "").trim();
  if (!clipped) return;

  state.pendingThoughtText = [state.pendingThoughtText, clipped].filter(Boolean).join("\n").slice(-900);
  state.pendingThoughtSegments += 1;
  state.pendingThoughtHasConclusion = Boolean(state.pendingThoughtHasConclusion || flags.hasConclusion);
  state.pendingThoughtHasMathStep = Boolean(state.pendingThoughtHasMathStep || flags.hasMathStep);
  dom.lianState.textContent = "安静听你讲";
  dom.lianAvatar.classList.add("listening");

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
  if (ACTIVE_HELP_PATTERN.test(normalized)) return false;
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
    return "你是在先把未知量表示出来。那接下来准备用哪个条件列等式？";
  }
  if (/方程|等式|列式/.test(normalized)) {
    return "你已经开始把条件转成等式了。下一步先检查等号两边表示的是不是同一个量。";
  }
  if (/比例|比值|成比例/.test(normalized)) {
    return "你是在找两个量之间的比例关系。下一步说说对应关系怎么配。";
  }
  if (/勾股|直角|斜边/.test(normalized)) {
    return "你抓到直角三角形这个结构了。下一步准备把哪两条边代进关系式？";
  }
  if (/面积|周长|体积/.test(normalized)) {
    return "你是在把图形里的量对应到公式里。下一步先说清楚每个量代表哪一段。";
  }
  if (meta.hasConclusion || /答案|结果|所以|得到|算出/.test(normalized)) {
    return "你已经走到结论了。回头补一句，这个结果是根据哪个关系得到的？";
  }
  return "我听到你是在整理题里的数量关系。你先接着说下一步打算怎么处理。";
}

async function requestSmartGuide(eventType, latestStudentSpeech = "", options = {}) {
  const now = Date.now();
  const cooldown = options.cooldown ?? 15000;
  if (!options.force && cooldown && now - state.lastGuideAt < cooldown) return false;
  const targetGuideState = options.guideState || state.guideState;
  const isSilenceGuide = /silence/.test(eventType);
  if (isSilenceGuide && state.silenceGuidePending) return false;

  const question = currentPageQuestion();
  const fallbackText = options.fallbackText || buildFallbackGuide(eventType, question);
  const requestId = ++state.activeGuideRequestId;
  setGuideState(targetGuideState);
  dom.lianState.textContent = targetGuideState === GUIDE_STATES.INTERACTIVE ? "准备分步讲解" : "在想提示";
  if (isSilenceGuide) state.silenceGuidePending = true;

  try {
    const result = await requestAIGuide(eventType, latestStudentSpeech, options);
    if (requestId !== state.activeGuideRequestId) return false;
    if (result.shouldSpeak === false && !options.force) {
      dom.lianState.textContent = guideIdleText();
      return false;
    }

    const speech = formatGuideSpeech(eventType, result, fallbackText);
    lianSpeak(speech);
    if (isSilenceGuide && state.isListening) resetSilenceTimer();
    return true;
  } catch (error) {
    console.warn("AI guide fallback:", error);
    if (requestId !== state.activeGuideRequestId) return false;
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
      eventType,
      transcript: dom.transcriptInput.value.trim(),
      latestStudentSpeech,
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
      hasMathStep: Boolean(options.hasMathStep)
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "讲解引导失败");
  return result;
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
    speech += ` 可以先写：${formulaOrStep}。你照这个关系再讲一遍。`;
  }

  if (lectureUnlocked && result?.askStudentToRepeat && !/讲一遍|说一遍|写到黑板|复述/.test(speech)) {
    speech += " 听懂后，你用自己的话讲一遍，或者写到黑板上。";
  }

  return speech.replace(/\s+/g, " ").trim();
}

function buildFallbackGuide(eventType, question) {
  const point = question?.knowledgePoints?.[0] || question?.problemType || "题目里的等量关系";
  if (eventType === "jump") {
    return `结果先放这儿，补一句你是根据哪个${point}算出来的。`;
  }
  if (eventType === "check") {
    return `这里先检查${point}，尤其是等号两边、符号和单位。你挑一步重新说一下。`;
  }
  if (eventType === "silence") {
    return "我看到你停了一会儿，是不是思路上卡住了？要不要先说说你卡在哪一步？";
  }
  if (eventType === "active_help" || eventType === "repeat_wrong" || eventType === "error_silence" || eventType === "silence_followup" || eventType === "next_step") {
    return `没关系，这里我只讲一小步：先抓${point}，把题干里的关系找出来。你听完后照这个方向再讲一遍。`;
  }
  return `我们先别急着算答案，先看${point}。你说说这一步准备用哪个关系。`;
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

function getLianVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const chineseVoices = voices.filter((voice) => /^zh/i.test(voice.lang) || /Chinese|中文|普通话|Mandarin/i.test(voice.name));
  const softFemaleHints = [
    "xiaoxiao",
    "xiaoyi",
    "yaoyao",
    "huihui",
    "hanhan",
    "ting-ting",
    "meijia",
    "mei-jia",
    "zhiyu",
    "晓晓",
    "晓伊",
    "瑶瑶",
    "慧慧",
    "婷婷",
    "美佳"
  ];

  return (
    chineseVoices.find((voice) => softFemaleHints.some((hint) => voice.name.toLowerCase().includes(hint.toLowerCase()))) ||
    chineseVoices.find((voice) => /female|woman|girl|女/i.test(voice.name)) ||
    chineseVoices[0] ||
    voices[0]
  );
}

function lianSpeak(text) {
  state.lastGuideAt = Date.now();
  dom.lianBubble.textContent = text;
  dom.lianState.textContent = "正在回应";
  dom.lianAvatar.classList.remove("listening");
  dom.lianAvatar.classList.add("speaking");
  addLog("恋恋", text);

  const finishSpeaking = () => {
    dom.lianAvatar.classList.remove("speaking");
    dom.lianAvatar.classList.add("listening");
    dom.lianState.textContent = guideIdleText();
  };

  if (!state.isMuted && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    const voice = getLianVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 1.16;
    utterance.volume = 0.92;
    utterance.onend = finishSpeaking;
    window.speechSynthesis.speak(utterance);
  } else {
    setTimeout(finishSpeaking, Math.min(2200, 850 + text.length * 34));
  }
}

function lianSilentNotice(text) {
  dom.lianBubble.textContent = text;
  dom.lianState.textContent = guideIdleText();
  dom.lianAvatar.classList.remove("speaking");
  dom.lianAvatar.classList.add("listening");
  addLog("提示", text);
}

dom.finishQuestionBtn.addEventListener("click", async () => {
  if (!state.lecture.length) return;

  saveCurrentPage();
  if (!confirmNotebookSave()) {
    addLog("错题本", "本次内容未保存。");
    return;
  }

  setGuideState(GUIDE_STATES.ARCHIVE);
  dom.finishQuestionBtn.disabled = true;
  dom.recognitionPill.textContent = "整理错题本";
  dom.recognitionPill.classList.remove("hidden");
  addLog("板书", "正在做完整识别和保存");
  await runHandwritingRecognition("点击讲完");

  state.completedThisSession = [];
  for (const question of state.lecture) {
    const record = await buildNotebookRecord(question);
    state.notebook.unshift(record);
    state.completedThisSession.push(record);
  }
  saveNotebook();
  dom.recognitionPill.classList.add("hidden");
  renderCompletion();
  showView("completeView");
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
  dom.completeSummary.textContent = `本次保存 ${count} 道错题，只保留题图、笔迹和讲解文字。`;
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
