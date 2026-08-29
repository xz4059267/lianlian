const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { execFile, spawn } = require("child_process");

const ROOT = __dirname;
loadEnvFile(path.join(ROOT, ".env"));

const PORT = Number(process.env.PORT || 4173);
const IS_VERCEL = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_URL);
const LOCAL_OCR_ENABLED = !["0", "false", "off"].includes(
  String(process.env.LOCAL_OCR_ENABLED || (IS_VERCEL ? "0" : "1")).toLowerCase()
);
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.deepseek_api_key || "";
const DEEPSEEK_BASE_URL = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
const SEGMENT_MODEL = process.env.DEEPSEEK_SEGMENT_MODEL || "deepseek-v4-flash";
const GUIDE_MODEL = process.env.DEEPSEEK_GUIDE_MODEL || "deepseek-v4-pro";
const GUIDE_FALLBACK_MODEL = process.env.DEEPSEEK_GUIDE_FALLBACK_MODEL || "deepseek-v4-flash";
const HANDWRITING_MODEL = process.env.DEEPSEEK_HANDWRITING_MODEL || "deepseek-v4-flash";
const QWEN_API_KEY =
  process.env.QWEN_API_KEY ||
  process.env.Qwen_api_key ||
  process.env.qwen_api_key ||
  process.env.DASHSCOPE_API_KEY ||
  process.env.dashscope_api_key ||
  "";
const QWEN_BASE_URL = (
  process.env.QWEN_BASE_URL ||
  process.env.DASHSCOPE_BASE_URL ||
  "https://dashscope.aliyuncs.com/compatible-mode/v1"
).replace(/\/+$/, "");
const QWEN_VL_MODEL =
  process.env.QWEN_VL_MODEL ||
  process.env.Qwen_vl_model ||
  process.env.qwen_vl_model ||
  process.env.QWEN_MODEL ||
  process.env.Qwen_model ||
  process.env.qwen_model ||
  process.env.DASHSCOPE_MODEL ||
  "qwen3.7-plus";
const QWEN_GUIDE_MODEL = process.env.QWEN_GUIDE_MODEL || QWEN_VL_MODEL;
const QWEN_HANDWRITING_MODEL = process.env.QWEN_HANDWRITING_MODEL || QWEN_VL_MODEL;
function parseQwenModelList(value) {
  return [...new Set(String(value || "")
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean))];
}

const QWEN_FALLBACK_MODELS = parseQwenModelList(
  process.env.QWEN_FALLBACK_MODELS ||
    "qwen3.8-max,qwen3.5-omni-flash-2026-03-15,qwen3-omni-flash,qwen3-omni-flash-2025-12-01"
);
const QWEN_GUIDE_MODEL_CANDIDATES = [...new Set([
  QWEN_GUIDE_MODEL,
  ...parseQwenModelList(process.env.QWEN_GUIDE_FALLBACK_MODELS || ""),
  ...QWEN_FALLBACK_MODELS
])];
const QWEN_HANDWRITING_MODEL_CANDIDATES = [...new Set([
  QWEN_HANDWRITING_MODEL,
  ...parseQwenModelList(process.env.QWEN_HANDWRITING_FALLBACK_MODELS || ""),
  ...QWEN_FALLBACK_MODELS
])];
const QWEN_VL_MODEL_CANDIDATES = [...new Set([
  QWEN_VL_MODEL,
  ...parseQwenModelList(process.env.QWEN_VL_FALLBACK_MODELS || ""),
  ...QWEN_FALLBACK_MODELS
])];
const QWEN_MODEL_COOLDOWN_MS = Math.max(
  30_000,
  Math.min(10 * 60_000, Number(process.env.QWEN_MODEL_COOLDOWN_MS || 120_000))
);
const qwenModelCooldownUntil = new Map();
const QWEN_REQUEST_TIMEOUT_MS = Math.max(
  8000,
  Math.min(55000, Number(process.env.QWEN_REQUEST_TIMEOUT_MS || 45000))
);
// One logical Qwen request may try several configured models. Keep a single
// wall-clock budget for the whole chain so fallback routing cannot turn one
// request into several minutes of serial waiting.
const QWEN_TOTAL_TIMEOUT_MS = Math.max(
  12000,
  Math.min(55000, Number(process.env.QWEN_TOTAL_TIMEOUT_MS || 55000))
);
// Guidance is a short interactive turn. It should not consume the longer
// handwriting/answer budget while the student is waiting for a response.
const QWEN_GUIDE_TOTAL_TIMEOUT_MS = Math.max(
  10000,
  Math.min(35000, Number(process.env.QWEN_GUIDE_TIMEOUT_MS || 25000))
);
// Handwriting is an observation request, not a structured answer request.
// Keep its wall-clock budget separate from answer/guidance calls so one slow
// board observation cannot hold the lecture state indefinitely.
const QWEN_HANDWRITING_TOTAL_TIMEOUT_MS = Math.max(
  12000,
  Math.min(35000, Number(process.env.QWEN_HANDWRITING_TIMEOUT_MS || 30000))
);
// Keep failover bounded by limiting concurrent calls, not the candidate list.
// When a model is out of quota, the next candidate must be able to enter the
// race immediately without creating an unbounded burst of upstream requests.
const QWEN_MAX_MODEL_CANDIDATES = 2;
const QWEN_HANDWRITING_RETRY_COUNT = Math.max(
  0,
  // The browser owns the delayed retry. Retrying here as well makes one
  // handwriting pause wait through two serial model calls before the client
  // can show a result.
  Math.min(2, Number(process.env.QWEN_HANDWRITING_RETRY_COUNT || 0))
);
// A second multimodal audit doubles latency and creates a second failure point.
// Keep it opt-in; the primary structured result and local safety rules remain authoritative.
const HANDWRITING_AUDIT_ENABLED = !["0", "false", "off"].includes(
  String(process.env.HANDWRITING_AUDIT_ENABLED || "0").toLowerCase()
);
const GUIDE_MODEL_AUDIT_ENABLED = !["0", "false", "off"].includes(
  String(process.env.GUIDE_MODEL_AUDIT_ENABLED || "0").toLowerCase()
);
const HANDWRITING_FAST_CONFIDENCE = Number(process.env.HANDWRITING_FAST_CONFIDENCE || 0.94);
const AZURE_TTS_KEY =
  process.env.AZURE_TTS_KEY ||
  process.env.AZURE_SPEECH_KEY ||
  process.env.SPEECH_KEY ||
  "";
const AZURE_TTS_REGION =
  process.env.AZURE_TTS_REGION ||
  process.env.AZURE_SPEECH_REGION ||
  process.env.SPEECH_REGION ||
  "";
const AZURE_TTS_VOICE = process.env.AZURE_TTS_VOICE || "zh-CN-XiaoxiaoNeural";
const AZURE_TTS_OUTPUT_FORMAT = process.env.AZURE_TTS_OUTPUT_FORMAT || "audio-24khz-48kbitrate-mono-mp3";
const AZURE_TTS_RATE = process.env.AZURE_TTS_RATE || "+4%";
const AZURE_TTS_PITCH = process.env.AZURE_TTS_PITCH || "+0%";
const ALIYUN_NLS_APPKEY =
  process.env.ALIYUN_NLS_APPKEY ||
  process.env.ALIYUN_SPEECH_APPKEY ||
  process.env.NLS_APPKEY ||
  "qIzm0YKDhPM7ZpLP";
const ALIYUN_NLS_REGION_ID = process.env.ALIYUN_NLS_REGION_ID || "cn-shanghai";
const ALIYUN_NLS_TOKEN_ENDPOINT = (
  process.env.ALIYUN_NLS_TOKEN_ENDPOINT ||
  "https://nls-meta.cn-shanghai.aliyuncs.com"
).replace(/\/+$/, "");
const ALIYUN_NLS_GATEWAY = (
  process.env.ALIYUN_NLS_GATEWAY ||
  "https://nls-gateway-cn-shanghai.aliyuncs.com"
).replace(/\/+$/, "");
const ALIYUN_NLS_VOICE = process.env.ALIYUN_NLS_VOICE || "zhimi_emo";
const ALIYUN_NLS_TTS_FORMAT = process.env.ALIYUN_NLS_TTS_FORMAT || "mp3";
const ALIYUN_NLS_ASR_FORMAT = process.env.ALIYUN_NLS_ASR_FORMAT || "wav";
const ALIYUN_NLS_SAMPLE_RATE = Number(process.env.ALIYUN_NLS_SAMPLE_RATE || 16000);
const ALIYUN_SPEECH_ENABLED = !["0", "false", "off"].includes(
  String(
    process.env.ALIYUN_SPEECH_ENABLED ||
    (
      ALIYUN_NLS_APPKEY &&
      (process.env.ALIYUN_OCR_ACCESS_KEY_ID || process.env.ALIBABA_CLOUD_ACCESS_KEY_ID || process.env.AccessKeyId || process.env.AccessKeyID) &&
      (process.env.ALIYUN_OCR_ACCESS_KEY_SECRET || process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET || process.env.AccessKeySecret)
        ? "1"
        : "0"
    )
  ).toLowerCase()
);
const ALIYUN_OCR_APPCODE =
  process.env.ALIYUN_OCR_APPCODE ||
  process.env.ALIYUN_OCR_APP_CODE ||
  process.env.aliyun_ocr_appcode ||
  process.env.AppCode ||
  "";
const ALIYUN_OCR_ACCESS_KEY_ID =
  process.env.ALIYUN_OCR_ACCESS_KEY_ID ||
  process.env.ALIBABA_CLOUD_ACCESS_KEY_ID ||
  process.env.ALIBABA_ACCESS_KEY_ID ||
  process.env.AccessKeyId ||
  process.env.AccessKeyID ||
  process.env.ACCESS_KEY_ID ||
  "";
const ALIYUN_OCR_ACCESS_KEY_SECRET =
  process.env.ALIYUN_OCR_ACCESS_KEY_SECRET ||
  process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET ||
  process.env.ALIBABA_ACCESS_KEY_SECRET ||
  process.env.AccessKeySecret ||
  process.env.ACCESS_KEY_SECRET ||
  "";
const ALIYUN_OCR_SECURITY_TOKEN =
  process.env.ALIYUN_OCR_SECURITY_TOKEN ||
  process.env.ALIBABA_CLOUD_SECURITY_TOKEN ||
  "";
const ALIYUN_OCR_OFFICIAL_ENDPOINT = (
  process.env.ALIYUN_OCR_OFFICIAL_ENDPOINT ||
  "https://ocr-api.cn-hangzhou.aliyuncs.com"
).replace(/\/+$/, "");
const ALIYUN_OCR_REGION_ID = process.env.ALIYUN_OCR_REGION_ID || "cn-hangzhou";
const ALIYUN_OCR_URL = (
  process.env.ALIYUN_OCR_URL ||
  "https://subject2.market.alicloudapi.com/educationservice/papercut"
).replace(/\/+$/, "");
const ALIYUN_OCR_TEXT_FALLBACK_URL = (
  process.env.ALIYUN_OCR_TEXT_FALLBACK_URL ||
  "https://ocrapi-advanced.taobao.com/ocrservice/advanced"
).replace(/\/+$/, "");
const ALIYUN_OCR_ENABLED = !["0", "false", "off"].includes(
  String(
    process.env.ALIYUN_OCR_ENABLED ||
    (ALIYUN_OCR_APPCODE || (ALIYUN_OCR_ACCESS_KEY_ID && ALIYUN_OCR_ACCESS_KEY_SECRET) ? "1" : "0")
  ).toLowerCase()
);
const SEGMENT_ALIYUN_ONLY = !["0", "false", "off"].includes(
  String(process.env.SEGMENT_ALIYUN_ONLY || "0").toLowerCase()
);
// The education paper-cut service already returns question-level boxes. Keep the
// normal path short and reserve local/Qwen analysis for empty or unusable results.
const SEGMENT_ALIYUN_FAST_PATH = !["0", "false", "off"].includes(
  String(process.env.SEGMENT_ALIYUN_FAST_PATH || "1").toLowerCase()
);
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  "";
const SUPABASE_NOTEBOOK_TABLE = process.env.SUPABASE_NOTEBOOK_TABLE || "wrong_questions";
const ALIYUN_OCR_TIMEOUT_MS = Number(process.env.ALIYUN_OCR_TIMEOUT_MS || 18000);
const OCR_PYTHON = process.env.OCR_PYTHON || path.join(ROOT, ".venv", "Scripts", "python.exe");
const PADDLE_OCR_SCRIPT = path.join(ROOT, "tools", "paddle_ocr.py");
const PADDLE_LAYOUT_SCRIPT = path.join(ROOT, "tools", "paddle_layout.py");
const OCR_MAX_SIDE = Number(process.env.OCR_MAX_SIDE || 1800);
const OCR_FAST_MAX_SIDE = Number(process.env.OCR_FAST_MAX_SIDE || 1800);
const LAYOUT_MAX_SIDE = Number(process.env.LAYOUT_MAX_SIDE || 1600);
const LAYOUT_TIMEOUT_MS = Number(process.env.LAYOUT_TIMEOUT_MS || 45000);
const LAYOUT_ENABLED =
  LOCAL_OCR_ENABLED &&
  !["0", "false", "off"].includes(String(process.env.LAYOUT_ENABLED || "1").toLowerCase());
const OCR_CACHE_LIMIT = Number(process.env.OCR_CACHE_LIMIT || 32);
const SEGMENT_CACHE_LIMIT = Number(process.env.SEGMENT_CACHE_LIMIT || 32);
const ANSWER_KEY_CACHE_LIMIT = Number(process.env.ANSWER_KEY_CACHE_LIMIT || 64);
const ANSWER_KEY_MIN_CONFIDENCE = Number(process.env.ANSWER_KEY_MIN_CONFIDENCE || 0.86);
const SEGMENT_FAST_MODE = !["0", "false", "off"].includes(String(process.env.SEGMENT_FAST_MODE || "1").toLowerCase());
const SEGMENT_LLM_TIMEOUT_MS = Number(process.env.SEGMENT_LLM_TIMEOUT_MS || 15000);
const ocrCache = new Map();
const segmentCache = new Map();
const answerKeyCache = new Map();
const answerKeyInflight = new Map();
const questionMemoryIdentityRegistry = new Map();
const handwritingRequestRegistry = new Map();
const guideRequestRegistry = new Map();
const activeHandwritingTasks = new Map();
const activeHandwritingVersions = new Map();
const REQUEST_REGISTRY_LIMIT = 2048;

const QWEN_CONNECT_TIMEOUT_MS = Math.max(
  3000,
  Math.min(20000, Number(process.env.QWEN_CONNECT_TIMEOUT_MS || 20000))
);
const QWEN_RESPONSE_TIMEOUT_MS = Math.max(
  3000,
  Math.min(20000, Number(process.env.QWEN_RESPONSE_TIMEOUT_MS || 15000))
);
const QWEN_PARSE_TIMEOUT_MS = Math.max(
  500,
  Math.min(5000, Number(process.env.QWEN_PARSE_TIMEOUT_MS || 3000))
);
const QWEN_MAX_RESPONSE_BYTES = Math.max(
  64 * 1024,
  Math.min(8 * 1024 * 1024, Number(process.env.QWEN_MAX_RESPONSE_BYTES || 2 * 1024 * 1024))
);
const QWEN_DEBUG_LOGS = ["1", "true", "on"].includes(
  String(process.env.QWEN_DEBUG_LOGS || "").toLowerCase()
);
let paddleOcrService = null;
let paddleOcrRequestId = 0;
let paddleLayoutService = null;
let paddleLayoutRequestId = 0;

const OCR_GROUPING_PROMPT =
  [
    "你是一名试卷题目结构分析助手。你不会看原图，也不能直接输出像素裁剪框。",
    "输入是一组 OCR 文字块，每个 block 已有 index、text、x、y、w、h。你的任务只负责判断哪些 block 属于同一道题。",
    "必须返回每道题包含的 blockIndexes，而不是 x,y,w,h。裁剪框会由程序根据 block 坐标合并生成。",
    "主题号如 1.、2.、3.、第5题、第6题通常代表不同大题；（1）（2）（3）、①②③ 通常属于同一道大题，不要拆成独立题目。",
    "图形、表格、选项、手写解答、答题区域对应的 OCR block 应归入所属题目。",
    "如果边界不确定，允许把相邻内容合并进较大的题块，不要返回空。",
    "type 只能是：计算题、选择题、填空题、解答题、未知。",
    "knowledge 只写 1 个最主要数学知识点，禁止写 OCR、图像识别、题目分割等任务名。",
    "输出必须严格遵守 JSON schema。"
  ].join("\n");

const LIAN_GUIDE_PROMPT = [
  "你是恋恋，面向初中学生的费曼学习法多模态引导学伴。目标是让学生自己把错题讲明白，不是替学生直接做题。",
  "语气像温柔、耐心的女生学习伙伴：自然、短、轻一点，不要像 AI 播报，也不要像老师批改。",
  "必须遵守四个状态机：A heuristic_guidance=启发引导；B micro_hint=知识点微提示；C interactive_teaching=互动讲解；D archive_review=归档复习。",
  "A 启发引导：学生正在尝试讲题时，优先追问、提问或保持安静；不能主动给最终答案、中间完整算式或完整解题步骤。",
  "B 知识点微提示：局部错误、跳步、笔迹可疑或普通沉默 1 分钟时，只点出与学生最后思路相关的检查位置或下一切入点，不给修正后的完整算式。",
  "C 互动讲解：只有学生主动求助、连续 3 次答错/修正失败、错后 1 分钟无语音或无书写、或 1 分钟关怀询问后仍无法推进时才进入。",
  "C 状态下可以讲知识点和步骤，但每次只讲一个逻辑节点或一个小步骤；每步后必须让学生确认、复述或写回黑板。",
  "学生在互动讲解中插话提问时，先回答疑问，再用“我们回到刚才这一步”恢复主线。",
  "普通沉默达到 1 分钟时，第一次应结合学生最后讲到的内容给一个很小的切入提示；不要直接完整讲题。只有提示后继续沉默或学生确认不会，才分步讲解。",
  "学生讲得顺时，优先不说；需要回应时必须贴着学生内容做理解确认，不使用固定鼓励词。",
  "如果前端传入 lectureUnlocked=false，你只能输出 encourage 或 light 级别内容，不能输出 formula/worked_step/summary。",
  "如果前端传入 lectureUnlocked=true，默认只给一小步并把话交还给学生；但 silenceStage>=4 且学生持续沉默时，必须直接完成当前题的详细讲解，给出关键式和最终答案，并先自行检查计算。",
  "引导接口不得以任何形式向学生索取对错确认，也不得把核验责任交给学生；禁止‘对不对/正确吗/是不是/算对了吗/有没有错/你同意吗/你觉得呢/要不要检查/请你确认’及其同义表达，不得用反问、选择问或确认式追问让学生判断答案、步骤、算式、选项或结论。核验结果必须由板书多模态模型给出；如果模型返回了明确错误位置和证据，直接复述具体哪一行、哪个数字、符号、运算或选项不一致；如果还没有核验结果，只给下一步操作或补写要求，不做对错判断。",
  "必须以当前黑板区域截图（其中包含当前题目图片和学生原始笔迹）为准；不要沿用上一道题的变量、答案、比例式或知识点。",
  "如果 recognizedBoardProgress.completedSteps 中已经列出某个板书步骤，视为该步骤已写出并由最近一次板书识别确认；不得再次询问学生写出、说明或确认这一条，必须直接引导到 verifiedGuideSteps 中尚未完成的下一步。",
  "选择题进入后必须把 verifiedAnswerReference.canonicalAnswer 与 choiceAnalysis 视为已经固定的唯一标准答案；不得重新猜测选项字母或结论组合，也不得把学生板书与结论的差异改写成‘是不是算错了’式引导。核对某个结论时直接说明它支持或不支持该结论；未解锁最终答案时可以暂不说出选项，但不能要求学生确认对错。",
  "如果当前黑板区域截图里没有出现 x、y、比例式等内容，不要主动提这些符号或关系。",
  "每次需要引导时，必须给出一个学生立刻能执行的单一步骤：明确写出要使用的关系式、要代入的数、要移项/消元的对象，或要计算的等式两边，并在 studentAction 中说明写什么。禁止只说‘请把当前这一步写出来’、‘继续下一步’、‘再看看怎么来’等没有对象和操作的空泛话术。",
  "如果 Question Memory 暂不可用，仍须先从当前黑板截图和题目图片中读出可见的最后一行，给出不涉及最终答案的具体下一步操作；只有确实无法辨认任何关系式时，才明确说明缺少哪一行，并要求学生按‘左边=右边’补全该行，不能伪造公式。",
  "输出必须严格遵守 JSON schema；speech 用中文口语。普通讲解停顿只说一句且不超过 45 个汉字；主动求助或分步讲解最多两句且不超过 75 个汉字。"
].join("\n");

// The current blackboard screenshot is the freshest interpretation of the board.
// Keep these rules separate from the long legacy prompt so they are easy to audit.
const HANDWRITING_CONSISTENCY_RULES = [
  "Use the current blackboard screenshot as the freshest structured reading of the current board.",
  "Never praise, correct, or extend an equation, variable, answer, or method that is not supported by the current blackboard screenshot or the student's latest speech.",
  "Do not copy equations, variables, answers, or guidance from latestHandwritingResult or any older recognition result. If that legacy field is present, treat it as diagnostics only.",
  "If the current screenshot clearly shows a wrong step, guide from the visible error location and evidence. If it clearly shows a correct step, do not interrupt solely to praise it.",
  "If calculationStatus is unclear or incomplete, avoid definitive claims and do not interrupt unless the student explicitly asks for help or is already in a stalled/silence event.",
  "The current screenshot has higher priority than speech for mathematical judgment; use speech only to understand the student's intended explanation.",
  "If hasBoardInk is false, speech alone is not evidence that any question's step or final answer is correct, including choice questions. Ask the student to write the key relation, option, or calculation on the board before checking it.",
  "If boardPendingRecognition is true, the board may have changed after the last recognition. Do not make a definitive judgment about the new strokes; ask the student to continue while recognition updates.",
  "When the screenshot and generated guidance conflict, prefer a short uncertainty response over guessing."
].join("\n");

const ORDERED_PROPORTION_RULES = [
  "比例题必须遵守给定顺序：题目说‘a、b、c、d 成比例’时，标准含义是 a:b=c:d，也就是第一项比第二项等于第三项比第四项。",
  "除非题目明确要求重新排列，否则禁止交换四个比例项，禁止声称‘没有规定顺序’，也禁止为了得到另一个结果而改成 a:b=d:c。",
  "例如‘2、3、x、6 成比例’必须写成 2:3=x:6，交叉相乘得到 x=4；学生得到 4 时应判定正确，不能再引导其尝试 2:3=6:x。",
  "判断学生比例式或答案前必须先按上述顺序实际代入验算。"
].join("\n");

const STATEMENT_EVALUATION_RULES = [
  "General rule for statement / option / conclusion checking questions:",
  "A board value that contradicts a proposed statement is not automatically wrong; it may be a valid refutation.",
  "Distinguish the original problem conditions from statements/options that the student is testing.",
  "Only say the board conflicts with the problem when you can name the exact original condition it violates.",
  "For choice questions, judge both the student's calculations and the final option/truth-values against the verified answer reference.",
  "If a visible equation, substitution, elimination, counterexample, or option check is mathematically valid and relevant, treat it as a key step even if the final option is not written yet.",
  "Do not reuse variables, equations, proportions, answer choices, or conclusions from another problem."
].join("\n");

function deterministicArrowDifferenceAnswerKey(problemText = "") {
  // Disabled: answer keys must come from the generic multimodal solver/verifier,
  // not a local override for one specific problem pattern.
  return null;
  const compact = String(problemText || "").normalize("NFKC").replace(/\s+/g, "");
  const hasRelation =
    /上方相邻/.test(compact) &&
    /左数/.test(compact) &&
    /右数/.test(compact) &&
    /差/.test(compact) &&
    /下方箭头/.test(compact) &&
    /共同指向/.test(compact);
  const hasKnownDiagramLabels =
    /x/.test(compact) &&
    /2y/i.test(compact) &&
    /3x/i.test(compact) &&
    /m/.test(compact) &&
    /n/.test(compact) &&
    /8/.test(compact);
  const hasClaims =
    /m.{0,8}3/.test(compact) &&
    /y.{0,8}4/.test(compact) &&
    /x-y/.test(compact) &&
    /一定为?2/.test(compact);
  if (!hasRelation || !hasKnownDiagramLabels || !hasClaims) return null;
  return {
    trusted: true,
    status: "verified",
    canonicalAnswer: "C",
    acceptedAnswers: ["C", "选C", "C选项", "I不对，II对", "结论I不正确，结论II正确"],
    problemText: String(problemText || "").trim(),
    questionType: "选择题",
    solutionOutline: [
      "按题意列式：x-2y=m，2y-3x=n，m-n=8。",
      "若 m=3，则 x-2y=3，且 2y-3x=-5，解得 y=-1，所以结论 I 错。",
      "由 m=x-2y、n=2y-3x、m-n=8 可得 4x-4y=8，即 x-y=2，所以结论 II 对。",
      "因此应选 C。"
    ],
    verificationChecks: [
      "m=3 代入验算得到 y=-1，不是 4。",
      "消元验算得到 x-y=2 恒成立。",
      "选项对应为 I 不对、II 对。"
    ],
    confidence: 0.99,
    reason: "本地代数规则校验通过",
    elapsedMs: 0,
    deterministic: true
  };
}

function normalizeMathForLocalAudit(value = "") {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[＝]/g, "=")
    .replace(/[−－–—]/g, "-")
    .replace(/[×]/g, "*")
    .replace(/[，。；、]/g, "");
}

function deterministicArrowHandwritingAudit(result = {}, answerKey = null) {
  // Disabled: handwriting judgment must use the generic verified-answer audit,
  // not a local override for one specific problem pattern.
  return null;
  if (!answerKey?.deterministic && !deterministicArrowDifferenceAnswerKey(answerKey?.problemText || "")) return null;
  const text = normalizeMathForLocalAudit([
    result.detectedWriting,
    result.mathExpression,
    result.calculationCheck
  ].filter(Boolean).join(" "));
  if (!text) return null;

  const hasFirstRelation = /x-?2y=m/.test(text) || /m=x-?2y/.test(text);
  const hasSecondRelation = /2y-?3x=n/.test(text) || /n=2y-?3x/.test(text);
  const hasDifferenceRelation = /m-n=8/.test(text) || /m=8\+n/.test(text);
  const hasConclusion = /x-y=2/.test(text) || /4x-4y=8/.test(text);
  const hasRelevantStep = (hasFirstRelation && hasSecondRelation) || hasDifferenceRelation || hasConclusion;
  if (!hasRelevantStep) return null;

  return {
    ...result,
    isRelevant: true,
    calculationStatus: "correct",
    calculationCheck: "板书中的 x-2y=m、2y-3x=n、m-n=8 以及 x-y=2 与题图箭头差值关系一致。",
    hasPossibleIssue: false,
    issueType: "none",
    issueSummary: "",
    expectedNextStep: "",
    guidance: "",
    positiveFeedback: hasConclusion
      ? "这组关系写对了，已经能推出 x-y=2。"
      : "你列出的关键关系是对的，沿着它继续消元就可以。",
    boardComplete: true,
    missingBoardContent: "",
    confidence: Math.max(Number(result.confidence) || 0, 0.96)
  };
}

const LIAN_STYLE_RULES = [
  "你是引导者，不是代答者。",
  "正常讲解时默认不说；不要用固定鼓励词刷存在感。",
  "未解锁讲解时，不能主动输出最终答案、中间完整算式或完整解题步骤。",
  "主动求助、连续 3 次答错、错后 1 分钟无输入、或关怀询问后仍沉默，才允许分步讲解。",
  "互动讲解时，每次只讲一个小步骤，并要求学生复述或写回黑板。",
  "每次提示后都要把讲解权交还给学生。",
  "回应必须贴着学生刚才的内容，先做理解确认，再给一个小追问；但追问只能要求补写、复述或继续计算，禁止任何形式的对错确认式提问，不得让学生自己判断答案、步骤或结论。"
];

const COMPANION_DIALOGUE_POLICY = [
  "你不是一个不停回应的 AI。你更像坐在学生旁边陪伴学习的人。",
  "你的首要任务不是一直说话，而是判断现在是否应该说话。",
  "默认行为是 Listening：学生思考或连续表达时保持安静，shouldSpeak=false，speech 留空。",
  "不要因为识别到一句完整的话就立即回复；只有学生明显完成一段思路、停顿等待反馈、提出问题、明显卡住，或思路明显错误且继续推导会偏离时，才回应。",
  "如果 eventType=thought_complete，只表示学生停顿了 2 到 3 秒；你仍要先判断这是否真是一段完整思路。若只是半句话、过渡句、还在铺垫，shouldSpeak=false。",
  "回应时先用一句话证明你听懂了学生刚才的思路，再给一个很小的追问或检查点。",
  "若当前题与上一题不同，先重置理解，只讨论当前题目图片、当前板书和本轮学生讲解。",
  "不要频繁使用固定鼓励词：很好、不错、继续、真棒、非常好、很棒。不要为了回应而回应。",
  "不要泛泛评价学生本人；要针对内容反馈，例如“你是在把未知量表示出来”“你已经开始找数量关系了”。",
  "学生讲错时不要说“不对”或“你错了”，改成一起检查：例如“我们一起检查一下这里，面积通常和哪两个量有关？”",
  "每次回应尽量不超过两句话；eventType=thought_complete 时最多一句短话，不要输出成段讲解。"
].join("\n");

const LECTURE_COMPLETION_RULES = [
  "额外判断当前题是否已经讲解完成，并通过 lectureComplete 返回。默认必须为 false。",
  "lectureComplete 只是对讲解内容的建议判断，不能单独结束题目。只有 answerVerified=true 且 boardCompletionVerified=true 时才允许为 true。",
  "学生点击‘我讲完了’只表示请求检查，不表示题目已经结束。答案错误或板书不完整时必须继续引导。",
  "只有当学生已经说明当前题的关键条件/推理、明确说出经核验正确的最终结果，并且板书已包含完整关键过程与结论时，lectureComplete 才能为 true。",
  "如果学生只完成了一个小问、只报出中间结果、只说了一个式子，或还在等待你追问，lectureComplete 必须为 false。",
  "lectureComplete=true 时，speech 只能做一次简短收束，不要再提出下一步、让学生复述、要求继续推导或重复已经说过的选项。",
  "如果 studentFinalAnswerEvidence=true，说明学生已经说过最终选项/答案；不要再次询问同一个答案。"
].join("\n");

const HANDWRITING_PROMPT = [
  "你是初中数学黑板板书的异步观察与核验器。你要在一次请求里同时识别当前板书，并把可见的最终答案和步骤与服务端提供的可信标准答案进行对比。",
  "你会看到当前黑板区域的完整截图，截图同时包含当前题目图片和学生的原始笔迹。截图是所有视觉事实的唯一来源；服务端提供的 verifiedAnswerReference 是唯一的标准答案依据。不要依赖 OCR、前端整理文本或任何旧的板书识别结果。",
  "当前黑板上的学生原始笔迹优先级高于语音。studentSpeechTranscript 是本题从开始到现在的完整语音记录，latestStudentSpeech 只是最新片段；语音只能帮助理解学生正在说明哪一行或哪个意图，不能覆盖、改写或补充截图中没有出现的数学步骤和答案；当语音与笔迹冲突时，以笔迹为准并返回 unclear 或 ask_for_board。",
  "题目图片中的印刷文字、红笔/蓝笔批注、勾叉、圈画、旧答案和非本次书写痕迹都不是当前学生笔迹，不能当作学生本次答案或步骤；只判断黑板上本次原始笔迹。",
  "识别时先区分图层：题目图片通常位于黑板左上或被白框包住，里面印刷的 A/B/C/D、I/II、红笔标记一律忽略；黑板书写区里由浅色笔迹写出的内容才是学生输入。若黑板书写区单独出现大写 A/B/C/D 或 I/II 判定，它就是学生写出的选项/结论，即使题图里也有同样字母，也必须把黑板笔迹记录进 detectedWriting、completedSteps 或 finalAnswer。",
  "不要因为题图覆盖在左上角而漏读黑板其余区域；必须扫描整张当前截图的所有原始笔迹，尤其是黑板中央、右侧和底部的等式、赋值、选项字母。只要这些笔迹清晰可见，就必须在结构化结果中忠实转写，不能返回与当前截图无关的旧引导。",
  "你的职责是：忠实转写可见笔迹；判断当前书写状态；列出已经明确完成且可见的步骤；定位明确错误；当最终答案和关键步骤都可见时，直接返回与标准答案的核验结果。",
  "禁止根据学生零散板书补出未写出的步骤或最终答案。标准答案只用于核对已经写出的最终答案和可见步骤，不能替学生补写答案。",
  "detectedWriting 和 mathExpression 必须忠实对应当前截图；completedSteps 只能包含截图中已经出现并可辨认的步骤，不能补齐学生没写的内容。",
  "判断某个可见步骤是否正确时，先读取当前截图中的题目条件，再与学生当前笔迹比较；如果截图不清楚或无法可靠核算，返回 unclear，不能猜测。",
  "writingState=in_progress 表示学生显然还在写或只完成部分步骤；只有输入显示长时间无新增且停在未完成步骤时才可判 stalled；不能把未写完当成错误。",
  "只有能指出具体 errorLocation，并能在 errorEvidence 中说明截图中可见数字、符号、运算或结论的明确冲突时，才返回 calculationStatus=wrong。",
  "可见步骤与当前截图中的题意和 verifiedAnswerReference 一致时返回 correct，但这只说明已经写出的步骤成立；最终答案必须另行填写 answerVerificationStatus。",
  "writingState=complete 只有在当前截图明确出现最终结论、答案/结果/所以/解得等收束标记，或最后一行是独立且完整的最终答案时才允许；仅有 x-2y=m、m-n=8、代入式、过程式或一个正确关键步骤时，必须返回 in_progress 或 stalled。boardComplete=true 仅表示存在可核验关键步骤，绝不能作为最终答案信号。",
  "不要生成完整解题过程或替学生补写未出现的步骤。guidance 只在 nextAction=continue_guidance 或 ask_for_board 时给出一句贴着当前板书的具体引导；nextAction=verify_answer 或 finished 时 guidance 必须为空。",
  "额外判断板书是否留下了至少一个可核验的正确关键步骤。boardComplete=true 只需满足：板书与本题相关，存在一个数学上成立的关系式、公式、代入、计算步骤或推理依据，并且没有尚未修正的明显数学错误。",
  "不要求板书写完整推导，不要求写最终答案、单位或覆盖全部小问；只要一个可见关键关系或计算步骤与 Question Memory 一致，就可以作为可核验步骤。",
  "只有孤立的最终答案、与题目无关的字迹、无法辨认的涂写或明显错误步骤不算正确关键步骤；此时 boardComplete=false，并在 missingBoardContent 中简短说明需要补写或修正哪一个关键步骤。",
  "如果板书最后一行或最后一组等式已经出现明确的最终赋值结果，即使前面仍保留完整推导式，也必须把这些可见结果原样写入 finalAnswer；不要求学生额外写‘答案是’、‘所以’等文字。finalAnswer 只能来自当前截图中确实可见的最后结果，不能根据题目自行补算。",
  "当 finalAnswer 已经明确可见且板书至少有一个关键步骤时，必须依据 verifiedAnswerReference 返回 answerVerificationStatus=correct 或 wrong，并将 answerFeedback 或 answerHint 填好；当只看到了答案但没有关键步骤时返回 ask_for_board；仍在推导或没有最终结果时返回 continue_guidance；最终答案和关键步骤都明确且核验正确时返回 finished。",
  "当 finalAnswer 和关键步骤都可见时，禁止返回 continue_guidance 或 ask_for_board，禁止以任何形式询问学生是否正确或要求学生确认（包括‘对不对/正确吗/是不是/算对了吗/有没有错/你同意吗/你觉得呢/要不要检查’等同义表达，以及反问、选择问、确认式追问），必须直接完成核验；如果不正确，answerHint 必须具体指出错误的可见行、数字、符号、运算或选项，并同时填写 errorLocation 与 errorEvidence。",
  "选择题特别规则：如果当前截图已写出 A/B/C/D 选项或 I/II 等结论判定，并且至少有一条与题目相关的有效计算、代入、消元或反例步骤，必须将该步骤计入 completedSteps、boardComplete=true、nextAction=finished，并直接依据固定标准答案完成 answerVerificationStatus；不得因为没有写‘答案是’三个字而继续引导。",
  "当前截图没有 finalAnswer 时，只能继续引导当前关系式、代入、消元、计算或推理步骤；禁止出现‘请将最终答案或关键结论写在黑板上，以便核验’以及任何要求提前写最终答案/关键结论的同义话术。只有截图已明确出现 finalAnswer 后，才允许进入最终答案核验。",
  "如果 calculationStatus=correct，completedSteps 中已有的内容只能视为已完成，guidance 必须直接给 verifiedGuideSteps 中尚未完成的下一步，禁止再让学生重写、复述或确认已完成步骤；如果 calculationStatus=wrong，必须在 guidance 或 answerHint 中同时说清‘错在何处’和‘正确应为’的具体内容，不能只说‘再检查一下’。",
  "guidance 必须说明当前下一步的具体关系式、代入或计算方向，不能只说‘继续写式子’或‘再想一想’；如果 nextAction=verify_answer 或 finished，guidance 必须为空字符串。",
  "finalAnswer、answer 或 studentAnswer 不能凭空填写；只有当前截图的可见笔迹明确写出最终答案或收束结论时才填写，否则必须为空字符串。m-n=8、x-2y=m、代入式等过程式即使可以算出某个数，也不能作为 finalAnswer。多个可见最终赋值可以一起返回，例如 y=-1，x=1。",
  "如果看不清或无法核算，calculationStatus=\"unclear\"，answerVerificationStatus=\"unclear\"；如果没有可见最终答案，answerVerificationStatus=\"not_present\"；如果与题目无关，calculationStatus=\"not_relevant\"。",
  "如果只有语音而当前黑板没有学生关键笔迹或最终答案，禁止核验答案，返回 answerVerificationStatus=\"not_present\"、nextAction=ask_for_board，并提醒学生把关键关系式和最终答案写到黑板上。",
  "输出必须严格遵守 JSON schema。"
].join("\n");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

const segmentGroupingSchema = {
  name: "question_block_grouping",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      questions: {
        type: "array",
        description: "Question groups built from OCR text block indexes.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            number: {
              type: "string",
              description: "Visible main question number, such as 24, 第5题. Empty if unclear."
            },
            blockIndexes: {
              type: "array",
              description: "Indexes of OCR blocks belonging to this question.",
              items: { type: "number" }
            },
            title: { type: "string", description: "Brief summary of the problem stem." },
            type: {
              type: "string",
              enum: ["计算题", "选择题", "填空题", "解答题", "未知"],
              description: "Question type."
            },
            knowledge: { type: "string", description: "One main math knowledge point." }
          },
          required: ["number", "blockIndexes", "title", "type", "knowledge"]
        }
      },
      note: { type: "string", description: "Short diagnostic note for the UI or logs." }
    },
    required: ["questions", "note"]
  }
};

const visionQuestionStructureSchema = {
  name: "worksheet_question_structure",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            questionNumber: { type: "string" },
            stemBoxes: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  x: { type: "number" }, y: { type: "number" }, w: { type: "number" }, h: { type: "number" }
                },
                required: ["x", "y", "w", "h"]
              }
            },
            optionBoxes: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  x: { type: "number" }, y: { type: "number" }, w: { type: "number" }, h: { type: "number" }
                },
                required: ["x", "y", "w", "h"]
              }
            },
            otherBoxes: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  x: { type: "number" }, y: { type: "number" }, w: { type: "number" }, h: { type: "number" }
                },
                required: ["x", "y", "w", "h"]
              }
            },
            summary: { type: "string" },
            type: { type: "string", enum: ["选择题", "填空题", "计算题", "解答题", "未知"] }
          },
          required: ["questionNumber", "stemBoxes", "optionBoxes", "otherBoxes", "summary", "type"]
        }
      }
    },
    required: ["questions"]
  }
};

const VISION_QUESTION_STRUCTURE_PROMPT = [
  "你是试卷版面结构分析助手。你的任务不是寻找每一行文字，而是识别完整题目。",
  "一个题目可能包含题号、跨行题干、图片、公式、表格、答题区域以及分散排列的选项。",
  "题干和选项即使存在较大空白，也必须归为同一道题；不要将同一道题拆成多个结果。",
  "每道题必须尽量包含从题号开始，到下一题题号之前的全部内容。选择题必须包含所有可见选项。",
  "不要重复返回相同题目。questionNumber 看不清时返回空字符串，不能猜测。",
  "每道题分别返回 stemBoxes、optionBoxes、otherBoxes；一道题允许包含多个不连续子区域，程序会统一合并。",
  "图片、图形、表格、公式和答题区域放入 otherBoxes。A/B/C/D 选项放入 optionBoxes。",
  "所有 x、y、w、h 必须按原图宽高归一化到 0 到 1。",
  "只输出严格 JSON，不要输出解释文字。"
].join("\n");

const guideSchema = {
  name: "lian_guidance",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      shouldSpeak: {
        type: "boolean",
        description: "Whether Lian should speak now. Keep false when the student is doing fine and interruption is unnecessary."
      },
      speech: {
        type: "string",
        description: "Short spoken Chinese guidance. It should sound warm and natural, not robotic."
      },
      guideState: {
        type: "string",
        enum: ["heuristic_guidance", "micro_hint", "interactive_teaching", "archive_review"],
        description: "The state this response belongs to."
      },
      knowledgePoints: {
        type: "array",
        description: "Knowledge points used by this guidance.",
        items: { type: "string" }
      },
      hintLevel: {
        type: "string",
        enum: ["encourage", "light", "formula", "worked_step", "summary"],
        description: "How explicit this hint is."
      },
      formulaOrStep: {
        type: "string",
        description: "A concrete formula, relation, or next step when the student is stuck."
      },
      askStudentToRepeat: {
        type: "boolean",
        description: "True when Lian should hand the turn back and ask the student to explain again."
      },
      studentAction: {
        type: "string",
        description: "One short action for the student, such as say why, check a symbol, repeat this step, or write it on the board."
      },
      lectureComplete: {
        type: "boolean",
        description: "Whether the current question's explanation is complete and should be locked from further automatic guidance."
      }
    },
    required: ["shouldSpeak", "speech", "guideState", "knowledgePoints", "hintLevel", "formulaOrStep", "askStudentToRepeat", "studentAction", "lectureComplete"]
  }
};

const handwritingSchema = {
  name: "handwriting_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      detectedWriting: {
        type: "string",
        description: "Concise OCR-style transcription of visible student handwriting."
      },
      mathExpression: {
        type: "string",
        description: "Faithful normalized transcription of the main visible formula, relation, or conclusion."
      },
      finalAnswer: {
        type: "string",
        description: "Only the final answer or final assignments visibly written in the current board image. Empty when no visible final result exists."
      },
      answerVerificationStatus: {
        type: "string",
        enum: ["not_present", "correct", "wrong", "unclear"],
        description: "Comparison of the visible final answer with the trusted standard answer. Use not_present when no final answer is visible."
      },
      answerFeedback: {
        type: "string",
        description: "Short confirmation when the visible final answer matches the standard answer. Empty unless answerVerificationStatus is correct."
      },
      answerHint: {
        type: "string",
        description: "Short concrete correction when the visible final answer does not match or cannot be verified. Empty when correct."
      },
      nextAction: {
        type: "string",
        enum: ["continue_guidance", "verify_answer", "ask_for_board", "finished"],
        description: "The next application action based only on the current blackboard screenshot."
      },
      guidance: {
        type: "string",
        description: "Concrete next-step guidance only for continue_guidance or ask_for_board; empty for verify_answer or finished."
      },
      writingState: {
        type: "string",
        enum: ["in_progress", "stalled", "complete", "unclear", "not_relevant"],
        description: "The student's current visible writing state. Do not mark stalled from an ordinary short pause."
      },
      completedSteps: {
        type: "array",
        items: { type: "string" },
        description: "Only steps explicitly visible and already completed on the board. Never infer missing steps."
      },
      isRelevant: {
        type: "boolean",
        description: "Whether the handwriting appears related to the current problem."
      },
      calculationStatus: {
        type: "string",
        enum: ["not_relevant", "incomplete", "unclear", "correct", "wrong"],
        description: "Result of comparing the student's visible work with the question and current blackboard screenshot."
      },
      calculationCheck: {
        type: "string",
        description: "Short private note grounded in the current blackboard screenshot, without solving missing work."
      },
      hasPossibleIssue: {
        type: "boolean",
        description: "True only when a likely mathematical issue is visible."
      },
      issueType: {
        type: "string",
        enum: ["none", "wrong_number", "wrong_formula", "wrong_operation", "wrong_unit", "irrelevant", "unclear"],
        description: "Primary issue category."
      },
      issueSummary: {
        type: "string",
        description: "Short private summary of the issue."
      },
      errorLocation: {
        type: "string",
        description: "Exact visible line, expression, number, or symbol where a definite error occurs. Empty unless wrong."
      },
      errorEvidence: {
        type: "string",
        description: "Concise evidence for the error based only on the current screenshot. Empty unless wrong."
      },
      boardComplete: {
        type: "boolean",
        description: "Whether the visible board contains at least one relevant, mathematically correct, reviewable key step with no unresolved obvious error. A full derivation or final answer is not required."
      },
      missingBoardContent: {
        type: "string",
        description: "Concise Chinese description of what is still missing from the board. Empty only when boardComplete is true."
      },
      confidence: {
        type: "number",
        description: "0 to 1 confidence in this analysis."
      }
    },
    required: [
      "detectedWriting",
      "mathExpression",
      "finalAnswer",
      "answerVerificationStatus",
      "answerFeedback",
      "answerHint",
      "nextAction",
      "guidance",
      "writingState",
      "completedSteps",
      "isRelevant",
      "calculationStatus",
      "calculationCheck",
      "hasPossibleIssue",
      "issueType",
      "issueSummary",
      "errorLocation",
      "errorEvidence",
      "boardComplete",
      "missingBoardContent",
      "confidence"
    ]
  }
};

const handwritingAuditSchema = {
  name: "handwriting_feedback_audit",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      safeToSpeak: {
        type: "boolean",
        description: "Whether the initial board feedback is safe to speak to the student."
      },
      correctedStatus: {
        type: "string",
        enum: ["not_relevant", "incomplete", "unclear", "correct", "wrong"],
        description: "The audited calculation status."
      },
      completedSteps: {
        type: "array",
        items: { type: "string" },
        description: "Audited list of steps that are explicitly visible and completed."
      },
      correctedCheck: {
        type: "string",
        description: "Private verification note explaining the audit result."
      },
      issueType: {
        type: "string",
        enum: ["none", "wrong_number", "wrong_formula", "wrong_operation", "wrong_unit", "irrelevant", "unclear"],
        description: "Audited issue category."
      },
      issueSummary: {
        type: "string",
        description: "Short private summary of the concrete issue, if any."
      },
      errorLocation: {
        type: "string",
        description: "Audited exact visible error location. Empty unless correctedStatus is wrong."
      },
      errorEvidence: {
        type: "string",
        description: "Audited evidence from the current blackboard screenshot. Empty unless wrong."
      },
      boardComplete: {
        type: "boolean",
        description: "Whether the board contains a relevant, reviewable key step or conclusion with no unresolved obvious error."
      },
      missingBoardContent: {
        type: "string",
        description: "What key relation, formula, or correction is still needed. Empty if boardComplete is true."
      },
      confidence: {
        type: "number",
        description: "0 to 1 confidence in the audited result."
      },
      reason: {
        type: "string",
        description: "Concise reason for accepting or correcting the initial feedback."
      }
    },
    required: [
      "safeToSpeak",
      "correctedStatus",
      "completedSteps",
      "correctedCheck",
      "issueType",
      "issueSummary",
      "errorLocation",
      "errorEvidence",
      "boardComplete",
      "missingBoardContent",
      "confidence",
      "reason"
    ]
  }
};

const HANDWRITING_AUDIT_PROMPT = [
  "你是初中数学板书观察结果的安全审校员，不负责重新解题或生成教学反馈。",
  "你会看到当前黑板区域完整截图，其中同时包含题目图片和学生原始笔迹。当前截图是唯一视觉事实来源；不要采用 OCR、前端整理文本或任何旧识别结果。",
  "请独立检查截图中的题目与当前笔迹，不要补写学生没有写出的步骤，也不要根据截图外的历史内容推断。",
  "completedSteps 只能保留板书上明确可见且已经完成的步骤。",
  "如果当前截图不能同时支持题意和笔迹的判断，必须返回 unclear。",
  "如果判断为 wrong，必须同时给出具体 errorLocation 和来自当前截图的 errorEvidence，否则降级为 unclear 或 incomplete。",
  "如果板书已经包含本题相关且数学上成立的关键式子、推理、代入、计算步骤或正确结论，就可以 boardComplete=true；不要求完整抄出所有步骤。",
  "如果只有孤立答案或看不出关键关系式，boardComplete=false；只记录缺少什么，不生成提示话术。",
  "输出必须严格 JSON，不要输出 Markdown 或 JSON 外文字。"
].join("\n");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function sendJson(res, status, data) {
  if (res.writableEnded || res.destroyed) return false;
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
  return true;
}

function createAbortError(message = "Qwen 请求已取消", code = "qwen_aborted") {
  const error = new Error(message);
  error.name = "AbortError";
  error.code = code;
  error.statusCode = code === "qwen_client_disconnected" ? 499 : 504;
  return error;
}

function getAbortReasonCode(reason, fallback = "qwen_aborted") {
  return typeof reason?.code === "string" && reason.code.trim()
    ? reason.code
    : fallback;
}

async function awaitWithTimeout(promise, timeoutMs, onTimeout, createError) {
  const boundedTimeoutMs = Math.max(1, Number(timeoutMs) || 1);
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((resolve, reject) => {
        timer = setTimeout(() => {
          try {
            onTimeout?.();
          } catch (error) {
            reject(error);
            return;
          }
          reject(createError?.() || new Error("operation timeout"));
        }, boundedTimeoutMs);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function handwritingVersionKey(sessionId, questionId, boardVersion) {
  return [String(sessionId || ""), String(questionId || ""), String(boardVersion ?? "")].join(":");
}

function createHandwritingTask(taskId = "") {
  return {
    taskId: String(taskId || `hw_${Date.now()}_${crypto.randomUUID()}`),
    requestStartTime: new Date().toISOString(),
    clientConnected: true,
    qwenStartTime: "",
    qwenResponseTime: "",
    finishTime: "",
    finalStatus: "RUNNING",
    abortController: new AbortController(),
    disconnectHandled: false,
    versionKey: ""
  };
}

function finishHandwritingTask(task, status, extra = {}) {
  if (!task || task.finalStatus !== "RUNNING") return;
  task.finalStatus = String(status || "FINISHED");
  task.finishTime = new Date().toISOString();
  Object.assign(task, extra);
  activeHandwritingTasks.delete(task.taskId);
  if (task.versionKey && activeHandwritingVersions.get(task.versionKey) === task.taskId) {
    activeHandwritingVersions.delete(task.versionKey);
  }
  console.info("[handwriting-task] finish", {
    task_id: task.taskId,
    final_status: task.finalStatus,
    request_start_time: task.requestStartTime,
    qwen_start_time: task.qwenStartTime,
    qwen_response_time: task.qwenResponseTime,
    finish_time: task.finishTime,
    client_connected: task.clientConnected,
    abort_success: Boolean(task.abortSuccess),
    error: task.errorCode || ""
  });
}

function escapeSsmlText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function azureTtsEndpoint() {
  if (!AZURE_TTS_REGION) return "";
  return `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
}

async function handleTextToSpeech(req, res) {
  const startedAt = Date.now();
  const body = await readJsonBody(req, 256 * 1024);
  const text = String(body.text || "").replace(/\s+/g, " ").trim();
  if (!text) {
    sendJson(res, 400, { error: "缺少语音文本", code: "missing_tts_text" });
    return;
  }
  const clippedText = text.slice(0, 1600);
  try {
    const aliyunAudio = await synthesizeAliyunSpeech(clippedText);
    if (aliyunAudio) {
      res.writeHead(200, {
        "Content-Type": aliyunAudio.contentType,
        "Cache-Control": "no-store",
        "X-TTS-Provider": aliyunAudio.provider,
        "X-TTS-Voice": aliyunAudio.voice
      });
      res.end(aliyunAudio.buffer);
      console.info(`[tts] provider=aliyun voice=${aliyunAudio.voice} bytes=${aliyunAudio.buffer.length} elapsed=${Date.now() - startedAt}ms`);
      return;
    }
  } catch (error) {
    console.error("[tts] Aliyun TTS failed:", {
      code: error.code || "aliyun_tts_failed",
      message: describeAliyunNetworkError(error),
      elapsed: Date.now() - startedAt
    });
    if (!AZURE_TTS_KEY || !AZURE_TTS_REGION) {
      sendJson(res, error.statusCode || 502, {
        error: error.message || "Aliyun TTS 调用失败",
        code: error.code || "aliyun_tts_failed"
      });
      return;
    }
  }

  if (!AZURE_TTS_KEY || !AZURE_TTS_REGION) {
    sendJson(res, 503, {
      error: "云端 TTS 未配置",
      code: "cloud_tts_not_configured"
    });
    return;
  }

  const ssml = [
    `<speak version="1.0" xml:lang="zh-CN" xmlns:mstts="https://www.w3.org/2001/mstts">`,
    `<voice name="${escapeSsmlText(AZURE_TTS_VOICE)}">`,
    `<mstts:express-as style="chat">`,
    `<prosody rate="${escapeSsmlText(AZURE_TTS_RATE)}" pitch="${escapeSsmlText(AZURE_TTS_PITCH)}">`,
    escapeSsmlText(clippedText),
    `</prosody>`,
    `</mstts:express-as>`,
    `</voice>`,
    `</speak>`
  ].join("");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(azureTtsEndpoint(), {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_TTS_KEY,
        "Content-Type": "application/ssml+xml; charset=utf-8",
        "X-Microsoft-OutputFormat": AZURE_TTS_OUTPUT_FORMAT,
        "User-Agent": "lian-wrong-question-book"
      },
      body: ssml
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!response.ok) {
      sendJson(res, response.status, {
        error: buffer.toString("utf8") || "Azure TTS 调用失败",
        code: "azure_tts_failed"
      });
      return;
    }
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      "X-TTS-Provider": "azure",
      "X-TTS-Voice": AZURE_TTS_VOICE
    });
    res.end(buffer);
  } catch (error) {
    sendJson(res, 504, {
      error: error.name === "AbortError" ? "Azure TTS 请求超时" : "Azure TTS 网络连接失败",
      code: error.name === "AbortError" ? "azure_tts_timeout" : "azure_tts_network_error"
    });
  } finally {
    clearTimeout(timer);
  }
}

async function handleSpeechRecognition(req, res) {
  const body = await readJsonBody(req, 8 * 1024 * 1024);
  try {
    const result = await recognizeAliyunSpeech(body.audio || body.audioDataUrl || "");
    sendJson(res, 200, {
      text: result.text,
      provider: result.provider
    });
  } catch (error) {
    sendJson(res, error.statusCode || 502, {
      error: error.message || "Aliyun ASR 调用失败",
      code: error.code || "aliyun_asr_failed"
    });
  }
}

function readJsonBody(req, limit = 24 * 1024 * 1024, signal = null) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    let settled = false;
    const cleanup = () => {
      signal?.removeEventListener?.("abort", onAbort);
      req.removeListener("data", onData);
      req.removeListener("end", onEnd);
      req.removeListener("error", onError);
    };
    const finishReject = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const finishResolve = (value) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };
    const onAbort = () => finishReject(createAbortError("请求体读取已取消", getAbortReasonCode(signal?.reason, "request_aborted")));
    const onData = (chunk) => {
      if (settled) return;
      size += chunk.length;
      if (size > limit) {
        finishReject(new Error("请求体过大，请换更小或更清晰的图片"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    };
    const onEnd = () => {
      if (settled) return;
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        finishResolve(raw ? JSON.parse(raw) : {});
      } catch {
        finishReject(new Error("请求格式不是有效 JSON"));
      }
    };
    const onError = (error) => finishReject(error);
    req.on("data", onData);
    req.on("end", onEnd);
    req.on("error", onError);
    if (signal) {
      if (signal.aborted) onAbort();
      else signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

function decodeDataImage(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const extByMime = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp"
  };
  return {
    buffer: Buffer.from(match[2], "base64"),
    ext: extByMime[match[1].toLowerCase()] || ".png"
  };
}

function runCommand(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(file, args, { timeout: 30000, maxBuffer: 20 * 1024 * 1024, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

function normalizeOcrBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .map((block) => {
      const text = String(block?.text || "").replace(/\s+/g, " ").trim();
      const x = Number(block?.x);
      const y = Number(block?.y);
      const w = Number(block?.w);
      const h = Number(block?.h);
      if (!text || ![x, y, w, h].every(Number.isFinite) || w <= 2 || h <= 2) return null;
      return {
        text,
        x: Math.max(0, Math.round(x)),
        y: Math.max(0, Math.round(y)),
        w: Math.round(w),
        h: Math.round(h)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

function cloneOcrBlocks(blocks) {
  return blocks.map((block) => ({ ...block }));
}

function getOcrCacheKey(image, maxSide = OCR_MAX_SIDE) {
  return crypto
    .createHash("sha256")
    .update(image.buffer)
    .update(`|maxSide:${maxSide}|ocr:v15`)
    .digest("hex");
}

function getCachedOcrBlocks(key) {
  const cached = ocrCache.get(key);
  if (!cached) return null;
  ocrCache.delete(key);
  ocrCache.set(key, cached);
  return cloneOcrBlocks(cached);
}

function setCachedOcrBlocks(key, blocks) {
  ocrCache.set(key, cloneOcrBlocks(blocks));
  while (ocrCache.size > OCR_CACHE_LIMIT) {
    const oldestKey = ocrCache.keys().next().value;
    ocrCache.delete(oldestKey);
  }
}

function normalizeAliyunOcrBlocks(payload) {
  const wordsInfo =
    (Array.isArray(payload?.prism_wordsInfo) && payload.prism_wordsInfo) ||
    (Array.isArray(payload?.data?.prism_wordsInfo) && payload.data.prism_wordsInfo) ||
    collectAliyunPaperCutWords(payload) ||
    [];

  const blocks = wordsInfo
    .map((item) => {
      const text = String(item?.word || item?.text || "").replace(/\s+/g, " ").trim();
      if (!text) return null;
      const points = Array.isArray(item?.pos) ? item.pos : [];
      const xs = points.map((point) => Number(point?.x)).filter(Number.isFinite);
      const ys = points.map((point) => Number(point?.y)).filter(Number.isFinite);
      if (xs.length && ys.length) {
        const left = Math.min(...xs);
        const top = Math.min(...ys);
        const right = Math.max(...xs);
        const bottom = Math.max(...ys);
        return {
          text,
          x: left,
          y: top,
          w: right - left,
          h: bottom - top
        };
      }

      const x = Number(item?.x ?? item?.left);
      const y = Number(item?.y ?? item?.top);
      const w = Number(item?.w ?? item?.width);
      const h = Number(item?.h ?? item?.height);
      if ([x, y, w, h].every(Number.isFinite)) return { text, x, y, w, h };
      return null;
    })
    .filter(Boolean);

  return normalizeOcrBlocks(blocks);
}

function getAliyunPaperCutPages(payload) {
  const data = payload?.Data || payload?.data || payload?.result || payload;
  let parsedData = data;
  if (typeof parsedData === "string") {
    try {
      parsedData = JSON.parse(parsedData);
    } catch {
      parsedData = data;
    }
  }
  const pages =
    (Array.isArray(parsedData?.page_list) && parsedData.page_list) ||
    (Array.isArray(parsedData?.pageList) && parsedData.pageList) ||
    (Array.isArray(parsedData?.pages) && parsedData.pages) ||
    (Array.isArray(parsedData?.data?.page_list) && parsedData.data.page_list) ||
    [];
  return pages;
}

function collectAliyunPaperCutWords(payload) {
  const pages = getAliyunPaperCutPages(payload);
  const words = [];
  for (const page of pages) {
    const pageWords = page?.prism_wordsInfo || page?.prismWordsInfo || page?.wordsInfo || [];
    if (Array.isArray(pageWords)) words.push(...pageWords);
    const subjects = page?.subject_list || page?.subjectList || page?.subjects || [];
    for (const subject of Array.isArray(subjects) ? subjects : []) {
      const subjectWords = subject?.prism_wordsInfo || subject?.prismWordsInfo || subject?.wordsInfo || [];
      if (Array.isArray(subjectWords)) words.push(...subjectWords);
      const contentList = subject?.content_list_info || subject?.contentListInfo || subject?.content_list || [];
      for (const content of Array.isArray(contentList) ? contentList : []) {
        const contentWords = content?.prism_wordsInfo || content?.prismWordsInfo || content?.wordsInfo || [];
        if (Array.isArray(contentWords)) words.push(...contentWords);
      }
    }
  }
  return words.length ? words : null;
}

function boxFromAliyunItem(item, width, height) {
  const numericArrayToBox = (value) => {
    if (!Array.isArray(value) || value.length < 4) return null;
    const numbers = value.slice(0, 4).map(Number);
    if (!numbers.every(Number.isFinite)) return null;
    const [left, top, third, fourth] = numbers;
    const right = third > left ? third : left + third;
    const bottom = fourth > top ? fourth : top + fourth;
    if (right <= left || bottom <= top) return null;
    return {
      x: Math.max(0, Math.min(1, left / width)),
      y: Math.max(0, Math.min(1, top / height)),
      w: Math.max(0.001, Math.min(1, (right - left) / width)),
      h: Math.max(0.001, Math.min(1, (bottom - top) / height))
    };
  };

  const directBox =
    item?.box ||
    item?.rect ||
    item?.bbox ||
    item?.boundBox ||
    item?.positionBox ||
    item?.location ||
    item?.area;
  if (directBox && typeof directBox === "object" && !Array.isArray(directBox)) {
    const nested = boxFromAliyunItem(directBox, width, height);
    if (nested) return nested;
  }
  if (Array.isArray(directBox)) {
    const numericBox = numericArrayToBox(directBox);
    if (numericBox) return numericBox;
    const nested = boxFromAliyunItem({ points: directBox }, width, height);
    if (nested) return nested;
  }

  const points =
    (Array.isArray(item?.pos) && item.pos) ||
    (Array.isArray(item?.position) && item.position) ||
    (Array.isArray(item?.vertexes) && item.vertexes) ||
    (Array.isArray(item?.vertices) && item.vertices) ||
    (Array.isArray(item?.points) && item.points) ||
    [];
  const numericPointBox = numericArrayToBox(points);
  if (numericPointBox) return numericPointBox;
  const xs = points.map((point) =>
    Array.isArray(point) ? Number(point[0]) : Number(point?.x ?? point?.X)
  ).filter(Number.isFinite);
  const ys = points.map((point) =>
    Array.isArray(point) ? Number(point[1]) : Number(point?.y ?? point?.Y)
  ).filter(Number.isFinite);
  if (xs.length && ys.length) {
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    const right = Math.max(...xs);
    const bottom = Math.max(...ys);
    return {
      x: Math.max(0, Math.min(1, left / width)),
      y: Math.max(0, Math.min(1, top / height)),
      w: Math.max(0.001, Math.min(1, (right - left) / width)),
      h: Math.max(0.001, Math.min(1, (bottom - top) / height))
    };
  }

  const leftValue = Number(item?.x ?? item?.left ?? item?.Left);
  const topValue = Number(item?.y ?? item?.top ?? item?.Top);
  const rightValue = Number(item?.right ?? item?.Right ?? item?.x2 ?? item?.X2);
  const bottomValue = Number(item?.bottom ?? item?.Bottom ?? item?.y2 ?? item?.Y2);
  if ([leftValue, topValue, rightValue, bottomValue].every(Number.isFinite) && rightValue > leftValue && bottomValue > topValue) {
    return {
      x: Math.max(0, Math.min(1, leftValue / width)),
      y: Math.max(0, Math.min(1, topValue / height)),
      w: Math.max(0.001, Math.min(1, (rightValue - leftValue) / width)),
      h: Math.max(0.001, Math.min(1, (bottomValue - topValue) / height))
    };
  }

  const x = leftValue;
  const y = topValue;
  const w = Number(item?.w ?? item?.width ?? item?.Width);
  const h = Number(item?.h ?? item?.height ?? item?.Height);
  if ([x, y, w, h].every(Number.isFinite) && w > 0 && h > 0) {
    return {
      x: Math.max(0, Math.min(1, x / width)),
      y: Math.max(0, Math.min(1, y / height)),
      w: Math.max(0.001, Math.min(1, w / width)),
      h: Math.max(0.001, Math.min(1, h / height))
    };
  }
  return null;
}

function stringifyAliyunQuestionText(item) {
  const direct = [
    item?.word,
    item?.text,
    item?.content,
    item?.question,
    item?.title,
    item?.stem,
    item?.subject,
    item?.recText,
    item?.description
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  const nested = [];
  const nestedKeys = [
    "prism_wordsInfo",
    "prismWordsInfo",
    "wordsInfo",
    "content_list_info",
    "contentListInfo",
    "content_list",
    "children",
    "blocks",
    "items"
  ];
  for (const key of nestedKeys) {
    const values = Array.isArray(item?.[key]) ? item[key] : [];
    values.forEach((child) => {
      const text = stringifyAliyunQuestionText(child);
      if (text) nested.push(text);
    });
  }
  return [...direct, ...nested].join(" ").replace(/\s+/g, " ").trim();
}

function isLikelyAliyunOptionOnlyText(text) {
  const value = String(text || "").normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!value) return false;
  if (/^\s*(?:[（(]\s*\d+\s*[）)]|\d+\s*[）)]|[①②③④⑤⑥⑦⑧⑨⑩])/.test(value)) return false;
  if (/^\s*(?:第\s*)?\d{1,3}(?:\s*题|[.．、])\s*[\u4e00-\u9fa5A-Za-z]/.test(value)) return false;
  const hasQuestionStemWord = /已知|若|如果|如图|求|计算|证明|判断|选择|下列|关于|则|那么|为何|多少|哪个|正确|错误|满足|解|方程|比例|面积|周长|体积|圆心角/u.test(value);
  const startsWithOption = /^[A-D]\s*[.．、:：)]/i.test(value);
  const optionValuePattern = /^[A-D]?\s*[.．、:：)]?\s*[-+−]?\d+(?:\.\d+)?(?:\s*\/\s*[-+−]?\d+(?:\.\d+)?)?\s*(?:π|%|°|度|cm|mm|m|km|厘米|毫米|米|千米|平方厘米|立方厘米|元|分|克|千克|个)?\s*$/iu;
  const mostlyChoiceLine = startsWithOption && value.length <= 48 && !hasQuestionStemWord;
  return mostlyChoiceLine || optionValuePattern.test(value);
}

function hasAliyunQuestionStemText(text) {
  const value = String(text || "").normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!value) return false;
  const stemWords = /[\u5df2\u77e5]|\u82e5|\u5982\u679c|\u5982\u56fe|\u6c42|\u8ba1\u7b97|\u8bc1\u660e|\u5224\u65ad|\u9009\u62e9|\u4e0b\u5217|\u5173\u4e8e|\u5219|\u90a3\u4e48|\u4e3a\u4f55|\u591a\u5c11|\u54ea\u4e2a|\u6b63\u786e|\u9519\u8bef|\u6ee1\u8db3|\u89e3|\u65b9\u7a0b|\u6bd4\u4f8b|\u9762\u79ef|\u5468\u957f|\u4f53\u79ef|\u5706\u5fc3\u89d2|\u534a\u5f84|\u76f4\u5f84|\u7b49\u4e8e/u;
  const chineseCount = (value.match(/[\u4e00-\u9fa5]/gu) || []).length;
  const hasLegalQuestionPrefix = /^\s*(?:\u7b2c\s*)?\d{1,3}(?:\s*\u9898|[.．、])\s*[\u4e00-\u9fa5A-Za-z]/u.test(value);
  return stemWords.test(value) || (hasLegalQuestionPrefix && chineseCount >= 6);
}

function isLikelyAliyunFigureOnlyText(text) {
  const value = String(text || "").normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!value) return true;
  if (isLikelyAliyunOptionOnlyText(value)) return true;
  if (hasAliyunQuestionStemText(value)) return false;

  const compact = value.replace(/\s+/g, "");
  const onlyQuestionCaption = /^(?:\u7b2c)?\d{1,3}\u9898$/u.test(compact);
  const figureOrTableLabelOnly = /^(?:(?:\u56fe|\u8868)\s*(?:[①②③④⑤⑥⑦⑧⑨⑩]|\d{1,3}|[（(]\d{1,3}[）)]|\u4e00|\u4e8c|\u4e09|\u56db|\u4e94|\u516d|\u4e03|\u516b|\u4e5d|\u5341)\s*)+$/u.test(compact);
  const dataOrFormulaOnly = /^[A-Za-z0-9+\-−*/=<>≤≥().,，:：;；%°πΠ_\s\u00b2\u00b3\u2160-\u216b\u2460-\u2469]+$/u.test(value) &&
    !/[\u5df2\u77e5]|\u82e5|\u5982|\u6c42|\u5219|\u5173\u4e8e|\u4e0b\u5217|\u6b63\u786e|\u9009\u62e9/u.test(value);
  const veryShortNonStem = compact.length <= 16 && !/[?？]/u.test(compact);
  return onlyQuestionCaption || figureOrTableLabelOnly || dataOrFormulaOnly || veryShortNonStem;
}

function isLikelyAliyunVisualOnlyCard(text) {
  const value = String(text || "").normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!value) return true;
  if (hasAliyunQuestionStemText(value)) return false;
  const chineseCount = (value.match(/[\u4e00-\u9fa5]/gu) || []).length;
  const digitCount = (value.match(/\d/g) || []).length;
  const compact = value.replace(/\s+/g, "");
  const hasQuestionCaption = /\u7b2c\s*\d{1,3}\s*\u9898/u.test(value);
  const hasTableOrFigureSignal = /(?:\u56fe|\u8868|\u5b8c\u6210|\u6c34\u4f4d|\u65f6\u95f4|\u70b9|\u523b\u5ea6|\u5355\u4f4d|%|\d+\s*(?:cm|mm|km|m|\u5398\u7c73|\u7c73|\u5343\u7c73))/iu.test(value);
  const withoutQuestionCaption = value.replace(/\u7b2c\s*\d{1,3}\s*\u9898/gu, "");
  const onlyCaptionOrFigureLabel = /^(?:\u7b2c?\d{1,3}\u9898|(?:\u56fe|\u8868)[①②③④⑤⑥⑦⑧⑨⑩\d一二三四五六七八九十]+)$/u.test(compact);
  const tableCaptionBlock = hasQuestionCaption && hasTableOrFigureSignal && chineseCount <= 18;
  const dataHeavyCaptionBlock = hasQuestionCaption && digitCount >= 4 && chineseCount <= 24 && !hasAliyunQuestionStemText(withoutQuestionCaption);
  const shortVisualLabel = compact.length <= 20 && hasTableOrFigureSignal && !/[?？]/u.test(compact);
  return onlyCaptionOrFigureLabel || tableCaptionBlock || dataHeavyCaptionBlock || shortVisualLabel;
}

function extractAliyunLeadingQuestionNumberFromText(text) {
  const value = String(text || "").normalize("NFKC").trim();
  if (!value || isLikelyAliyunOptionOnlyText(value) || isLikelyAliyunFigureOnlyText(value) || isLikelyAliyunVisualOnlyCard(value)) return "";
  const match = value.match(/^\s*(?:第\s*)?(\d{1,3})(?:\s*题|[.．、])\s*(.+)$/u);
  if (!match) return "";
  const tail = String(match[2] || "").trim();
  if (!tail || !/[A-Za-z\u4e00-\u9fa5]/u.test(tail)) return "";
  const number = Number(match[1]);
  return Number.isInteger(number) && number > 0 && number <= 200 ? String(number) : "";
}

function getAliyunQuestionNumber(item, summary) {
  const rawValues = [
    Array.isArray(item?.ids) ? item.ids[0] : item?.ids,
    Array.isArray(item?.Ids) ? item.Ids[0] : item?.Ids,
    Array.isArray(item?.subjectIds) ? item.subjectIds[0] : item?.subjectIds,
    Array.isArray(item?.subject_ids) ? item.subject_ids[0] : item?.subject_ids,
    item?.questionNumber,
    item?.question_number,
    item?.questionNo,
    item?.question_no,
    item?.questionId,
    item?.question_id,
    item?.subjectNo,
    item?.subject_no,
    item?.problemNo,
    item?.problem_no,
    item?.no,
    item?.num,
    item?.number,
    item?.index
  ];
  for (const value of rawValues) {
    const number = normalizeSourceQuestionNumber(value);
    if (number) return number;
  }
  return extractAliyunLeadingQuestionNumberFromText(summary);
}

function collectAliyunQuestionLikeItems(root) {
  const collected = [];
  const visited = new Set();
  const questionArrayKeyPattern = /(subject|question|problem|paperCut|paper_cut|exercise|item).*list|list.*(subject|question|problem|exercise)|subjects|questions|problems|items/iu;
  const walk = (value, path = "") => {
    if (!value || typeof value !== "object") return;
    if (visited.has(value)) return;
    visited.add(value);
    if (Array.isArray(value)) {
      value.forEach((child, index) => walk(child, `${path}[${index}]`));
      return;
    }

    const keys = Object.keys(value);
    const hasOwnBox = Boolean(boxFromAliyunItem(value, 1, 1));
    const hasQuestionField = keys.some((key) =>
      /question|subject|problem|stem|title|content|word|text|no|number|index/iu.test(key)
    );
    const pathLooksQuestion = /subject|question|problem|paperCut|paper_cut|exercise/iu.test(path);
    if (hasOwnBox && (hasQuestionField || pathLooksQuestion)) {
      collected.push(value);
    }

    for (const key of keys) {
      const child = value[key];
      if (Array.isArray(child) && questionArrayKeyPattern.test(key)) {
        child.forEach((entry) => {
          if (entry && typeof entry === "object") collected.push(entry);
          walk(entry, `${path}.${key}`);
        });
      } else {
        walk(child, `${path}.${key}`);
      }
    }
  };
  walk(root, "");
  return collected;
}

function normalizeAliyunPaperCutQuestions(payload, width, height) {
  const pages = getAliyunPaperCutPages(payload);
  const questions = [];
  const seen = new Set();
  const addQuestion = (subject) => {
    if (!subject || typeof subject !== "object") return;
    const words = [];
    const boxes = [];
    const contentList = subject?.content_list_info || subject?.contentListInfo || subject?.content_list || [];
    const collectItem = (item) => {
      const text = String(item?.word || item?.text || item?.content || item?.title || item?.stem || "").trim();
      if (text) words.push(text);
      const box = boxFromAliyunItem(item, width, height);
      if (box) boxes.push(box);
    };

    collectItem(subject);
    const subjectWords = subject?.prism_wordsInfo || subject?.prismWordsInfo || subject?.wordsInfo || [];
    if (Array.isArray(subjectWords)) subjectWords.forEach(collectItem);
    if (Array.isArray(contentList)) {
      contentList.forEach((content) => {
        collectItem(content);
        const contentWords = content?.prism_wordsInfo || content?.prismWordsInfo || content?.wordsInfo || [];
        if (Array.isArray(contentWords)) contentWords.forEach(collectItem);
      });
    }

    const fallbackSummary = stringifyAliyunQuestionText(subject);
    const summary = (words.join(" ") || fallbackSummary).replace(/\s+/g, " ").trim();
    if (isLikelyAliyunOptionOnlyText(summary)) {
      console.log(`[segment] Aliyun option-only block skipped: "${summary.slice(0, 60)}"`);
      return;
    }
    if (isLikelyAliyunFigureOnlyText(summary) || isLikelyAliyunVisualOnlyCard(summary)) {
      console.log(`[segment] Aliyun figure/table-only block skipped: "${summary.slice(0, 60)}"`);
      return;
    }
    const number = getAliyunQuestionNumber(subject, summary);
    if (!boxes.length) return;
    const union = unionPixelBoxes(
      boxes.map((box) => normalizedBoxToPixels(box, width, height)).filter(Boolean),
      width,
      height
    );
    if (!union || union.w < 3 || union.h < 3) return;
    const key = `${number || "?"}:${Math.round(union.x)}:${Math.round(union.y)}:${Math.round(union.w)}:${Math.round(union.h)}`;
    if (seen.has(key)) return;
    seen.add(key);
    questions.push({
      questionNumber: number,
      stemBoxes: boxes.length ? boxes : [],
      optionBoxes: [],
      otherBoxes: [],
      summary,
      type: subject?.type || subject?.questionType || subject?.question_type || "未知",
      provider: "aliyun-paper-cut",
      evidenceSource: "aliyun-paper-cut"
    });
  };

  let directSubjectCount = 0;
  for (const page of pages) {
    const subjects = page?.subject_list || page?.subjectList || page?.subjects || [];
    for (const subject of Array.isArray(subjects) ? subjects : []) {
      directSubjectCount += 1;
      addQuestion(subject);
    }
  }
  if (!directSubjectCount) {
    collectAliyunQuestionLikeItems(payload).forEach(addQuestion);
  }
  console.log(`[segment] Aliyun paper-cut parser directSubjects=${directSubjectCount}, question candidates=${questions.length}`);
  return questions;
}

function aliyunPercentEncode(value) {
  return encodeURIComponent(String(value))
    .replace(/\+/g, "%20")
    .replace(/\*/g, "%2A")
    .replace(/%7E/g, "~");
}

function buildAliyunRpcSignedUrl(endpoint, params, accessKeySecret, method = "POST") {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  const canonicalizedQuery = Object.keys(filteredParams)
    .sort()
    .map((key) => `${aliyunPercentEncode(key)}=${aliyunPercentEncode(filteredParams[key])}`)
    .join("&");
  const stringToSign = `${String(method || "POST").toUpperCase()}&${aliyunPercentEncode("/")}&${aliyunPercentEncode(canonicalizedQuery)}`;
  const signature = crypto
    .createHmac("sha1", `${accessKeySecret}&`)
    .update(stringToSign, "utf8")
    .digest("base64");
  const url = new URL(endpoint);
  url.pathname = "/";
  const signedParams = { ...filteredParams, Signature: signature };
  Object.keys(signedParams)
    .sort()
    .forEach((key) => url.searchParams.set(key, signedParams[key]));
  return url;
}

function parseAliyunOfficialPayload(raw) {
  let payload = raw;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return raw;
    }
  }
  if (typeof payload?.Data === "string") {
    try {
      payload = { ...payload, Data: JSON.parse(payload.Data) };
    } catch {
      return payload;
    }
  }
  if (typeof payload?.data === "string") {
    try {
      payload = { ...payload, data: JSON.parse(payload.data) };
    } catch {
      return payload;
    }
  }
  return payload;
}

let aliyunNlsTokenCache = {
  token: "",
  expireAt: 0
};

const ALIYUN_TTS_TIMEOUT_MS = Math.max(
  3000,
  Number(process.env.ALIYUN_TTS_TIMEOUT_MS || 8000)
);

function describeAliyunNetworkError(error) {
  const cause = error?.cause;
  const code = cause?.code || cause?.errno || error?.code || "";
  const detail = cause?.message || error?.message || "Aliyun speech request failed";
  return code ? `${detail} (${code})` : detail;
}

async function fetchAliyunWithRetry(url, options = {}, label = "request") {
  let lastError = null;
  let lastResponse = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ALIYUN_TTS_TIMEOUT_MS);
    try {
      lastResponse = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      if (
        lastResponse.ok ||
        (lastResponse.status >= 400 && lastResponse.status < 500 && lastResponse.status !== 429)
      ) {
        return lastResponse;
      }
    } catch (error) {
      lastError = error;
      console.warn(`[tts] Aliyun ${label} attempt=${attempt + 1} failed:`, describeAliyunNetworkError(error));
    } finally {
      clearTimeout(timer);
    }

    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }

  if (lastError) {
    throw Object.assign(new Error(describeAliyunNetworkError(lastError)), {
      code: "aliyun_network_error",
      statusCode: 502,
      cause: lastError
    });
  }

  return lastResponse;
}

function aliyunSpeechConfigured() {
  return Boolean(
    ALIYUN_SPEECH_ENABLED &&
    ALIYUN_NLS_APPKEY &&
    ALIYUN_OCR_ACCESS_KEY_ID &&
    ALIYUN_OCR_ACCESS_KEY_SECRET
  );
}

async function getAliyunNlsToken() {
  const now = Date.now();
  if (aliyunNlsTokenCache.token && aliyunNlsTokenCache.expireAt - now > 60 * 1000) {
    return aliyunNlsTokenCache.token;
  }
  if (!ALIYUN_OCR_ACCESS_KEY_ID || !ALIYUN_OCR_ACCESS_KEY_SECRET) {
    throw Object.assign(new Error("Aliyun AccessKey not configured"), { code: "aliyun_speech_key_missing", statusCode: 503 });
  }

  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const nonce = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
  const query = {
    Action: "CreateToken",
    Version: "2019-02-28",
    Format: "JSON",
    RegionId: ALIYUN_NLS_REGION_ID,
    AccessKeyId: ALIYUN_OCR_ACCESS_KEY_ID,
    SignatureMethod: "HMAC-SHA1",
    SignatureVersion: "1.0",
    SignatureNonce: nonce,
    Timestamp: timestamp
  };
  if (ALIYUN_OCR_SECURITY_TOKEN) query.SecurityToken = ALIYUN_OCR_SECURITY_TOKEN;
  const url = buildAliyunRpcSignedUrl(ALIYUN_NLS_TOKEN_ENDPOINT, query, ALIYUN_OCR_ACCESS_KEY_SECRET, "GET");
  const response = await fetchAliyunWithRetry(url, { method: "GET" }, "nls-token");
  const raw = await response.text();
  let payload = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = {};
  }
  const token = payload?.Token?.Id || payload?.Token?.id || payload?.token || "";
  const expireTime = Number(payload?.Token?.ExpireTime || payload?.Token?.expireTime || 0);
  if (!response.ok || !token) {
    throw Object.assign(new Error(payload?.Message || raw.slice(0, 160) || "Aliyun NLS token failed"), {
      code: "aliyun_nls_token_failed",
      statusCode: response.status || 502
    });
  }
  aliyunNlsTokenCache = {
    token,
    expireAt: expireTime ? expireTime * 1000 : Date.now() + 50 * 60 * 1000
  };
  return token;
}

function decodeDataAudio(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(audio\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

async function synthesizeAliyunSpeech(text) {
  if (!aliyunSpeechConfigured()) return null;
  const token = await getAliyunNlsToken();
  const url = new URL(`${ALIYUN_NLS_GATEWAY}/stream/v1/tts`);
  url.searchParams.set("appkey", ALIYUN_NLS_APPKEY);
  url.searchParams.set("token", token);
  url.searchParams.set("text", text);
  url.searchParams.set("format", ALIYUN_NLS_TTS_FORMAT);
  url.searchParams.set("sample_rate", String(ALIYUN_NLS_SAMPLE_RATE));
  url.searchParams.set("voice", ALIYUN_NLS_VOICE);
  url.searchParams.set("volume", process.env.ALIYUN_NLS_TTS_VOLUME || "50");
  url.searchParams.set("speech_rate", process.env.ALIYUN_NLS_TTS_SPEECH_RATE || "-30");
  url.searchParams.set("pitch_rate", process.env.ALIYUN_NLS_TTS_PITCH_RATE || "0");
  const response = await fetchAliyunWithRetry(url, { method: "GET" }, "tts");
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !/^audio\//i.test(contentType)) {
    const message = buffer.toString("utf8").slice(0, 180);
    throw Object.assign(new Error(message || "Aliyun TTS failed"), {
      code: "aliyun_tts_failed",
      statusCode: response.status || 502
    });
  }
  return {
    buffer,
    contentType: contentType || "audio/mpeg",
    provider: "aliyun-nls",
    voice: ALIYUN_NLS_VOICE
  };
}

async function recognizeAliyunSpeech(audioDataUrl) {
  if (!aliyunSpeechConfigured()) {
    throw Object.assign(new Error("Aliyun speech not configured"), { code: "aliyun_speech_not_configured", statusCode: 503 });
  }
  const audio = decodeDataAudio(audioDataUrl);
  if (!audio?.buffer?.length) {
    throw Object.assign(new Error("Invalid audio data"), { code: "invalid_audio", statusCode: 400 });
  }
  const token = await getAliyunNlsToken();
  const url = new URL(`${ALIYUN_NLS_GATEWAY}/stream/v1/asr`);
  url.searchParams.set("appkey", ALIYUN_NLS_APPKEY);
  url.searchParams.set("token", token);
  url.searchParams.set("format", ALIYUN_NLS_ASR_FORMAT);
  url.searchParams.set("sample_rate", String(ALIYUN_NLS_SAMPLE_RATE));
  url.searchParams.set("enable_punctuation_prediction", "true");
  url.searchParams.set("enable_inverse_text_normalization", "true");
  url.searchParams.set("enable_voice_detection", "true");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream"
    },
    body: audio.buffer
  });
  const raw = await response.text();
  let payload = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = {};
  }
  const status = Number(payload.status ?? payload.Status ?? 0);
  const result = String(payload.result || payload.Result || payload.text || "").trim();
  if (!response.ok || status !== 20000000) {
    throw Object.assign(new Error(payload.message || payload.Message || raw.slice(0, 180) || "Aliyun ASR failed"), {
      code: "aliyun_asr_failed",
      statusCode: response.status || 502
    });
  }
  return {
    text: result,
    raw: payload,
    provider: "aliyun-nls"
  };
}

async function extractAliyunOfficialPaperCutResult(imageDataUrl, options = {}) {
  if (!ALIYUN_OCR_ACCESS_KEY_ID || !ALIYUN_OCR_ACCESS_KEY_SECRET) return null;
  const image = decodeDataImage(imageDataUrl);
  if (!image) return { blocks: [], questions: [] };
  const bodyBuffer = image.buffer;
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const nonce = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
  const query = {
    Action: "RecognizeEduPaperCut",
    Version: "2021-07-07",
    Format: "JSON",
    AccessKeyId: ALIYUN_OCR_ACCESS_KEY_ID,
    SignatureMethod: "HMAC-SHA1",
    SignatureVersion: "1.0",
    SignatureNonce: nonce,
    Timestamp: timestamp,
    CutType: process.env.ALIYUN_OCR_CUT_TYPE || "question",
    ImageType: process.env.ALIYUN_OCR_IMAGE_TYPE || "photo",
    Subject: process.env.ALIYUN_OCR_SUBJECT || "JHighSchool_Math",
    OutputOricoord: process.env.ALIYUN_OCR_OUTPUT_ORICOORD || "true"
  };
  if (ALIYUN_OCR_SECURITY_TOKEN) query.SecurityToken = ALIYUN_OCR_SECURITY_TOKEN;
  const url = buildAliyunRpcSignedUrl(ALIYUN_OCR_OFFICIAL_ENDPOINT, query, ALIYUN_OCR_ACCESS_KEY_SECRET);
  const headers = {
    "Content-Type": "application/octet-stream"
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ALIYUN_OCR_TIMEOUT_MS);
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: bodyBuffer,
      signal: controller.signal
    });
    const raw = await response.text();
    const payload = parseAliyunOfficialPayload(raw);
    const serviceCode = payload?.Code || payload?.code || payload?.Error?.Code || payload?.error_code;
    if (!response.ok || serviceCode) {
      const message = payload?.Message || payload?.message || payload?.error_msg || raw.slice(0, 180) || response.statusText;
      throw new Error(`Aliyun official OCR ${response.status}${serviceCode ? ` ${serviceCode}` : ""}: ${message}`);
    }
    const blocks = normalizeAliyunOcrBlocks(payload);
    const questions = normalizeAliyunPaperCutQuestions(
      payload,
      Number(options.width) || 1,
      Number(options.height) || 1
    );
    console.log(
      `[segment] Aliyun official edu paper-cut block count: ${blocks.length}, question count=${questions.length}, elapsed=${Date.now() - startedAt}ms`
    );
    const data = payload?.Data || payload?.data || payload?.result || payload;
    const pages = getAliyunPaperCutPages(payload);
    console.log(
      `[segment] Aliyun official response keys=${Object.keys(data || {}).slice(0, 12).join(",")}, pages=${pages.length}`
    );
    return { blocks, questions, provider: "aliyun-official-recognize-edu-paper-cut" };
  } finally {
    clearTimeout(timer);
  }
}

async function extractAliyunPaperCutResult(imageDataUrl, options = {}) {
  if (!ALIYUN_OCR_ENABLED) return { blocks: [], questions: [] };
  const image = decodeDataImage(imageDataUrl);
  if (!image) return { blocks: [], questions: [] };
  let firstError = null;

  if (ALIYUN_OCR_APPCODE) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ALIYUN_OCR_TIMEOUT_MS);
    const startedAt = Date.now();
    try {
      const response = await fetch(ALIYUN_OCR_URL, {
        method: "POST",
        headers: {
          "Authorization": `APPCODE ${ALIYUN_OCR_APPCODE}`,
          "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
          imgList: [image.buffer.toString("base64")],
          cutType: process.env.ALIYUN_OCR_CUT_TYPE || "question",
          imageType: process.env.ALIYUN_OCR_IMAGE_TYPE || "photo",
          subject: process.env.ALIYUN_OCR_SUBJECT || "JHighSchool_Math",
          prob: false,
          charInfo: false,
          rotate: true,
          table: false,
          sortPage: true
        }),
        signal: controller.signal
      });
      const raw = await response.text();
      let payload = null;
      try {
        payload = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error(`Aliyun OCR returned non-JSON: ${raw.slice(0, 160)}`);
      }
      if (!response.ok || payload?.error_code || payload?.code === "InvalidParam") {
        const message = payload?.error_msg || payload?.message || raw.slice(0, 160) || response.statusText;
        throw new Error(`Aliyun OCR ${response.status}: ${message}`);
      }

      const blocks = normalizeAliyunOcrBlocks(payload);
      const questions = normalizeAliyunPaperCutQuestions(
        payload,
        Number(options.width) || 1,
        Number(options.height) || 1
      );
      console.log(
        `[segment] Aliyun market paper-cut OCR block count: ${blocks.length}, question count=${questions.length}, elapsed=${Date.now() - startedAt}ms`
      );
      if (questions.length) return { blocks, questions, provider: "aliyun-market-paper-cut" };
      firstError = new Error(`Aliyun market paper-cut returned no question boxes, blocks=${blocks.length}`);
      if (SEGMENT_ALIYUN_ONLY) {
        console.warn("[segment] aliyun-only: market paper-cut returned no question boxes; skipping official/text OCR fallbacks");
        return { blocks, questions: [], provider: "aliyun-market-paper-cut-empty" };
      }
    } catch (error) {
      firstError = error;
      console.warn("[segment] Aliyun market paper-cut failed:", error.message || error);
    } finally {
      clearTimeout(timer);
    }
  }

  if (ALIYUN_OCR_ACCESS_KEY_ID && ALIYUN_OCR_ACCESS_KEY_SECRET) {
    try {
      const officialResult = await extractAliyunOfficialPaperCutResult(imageDataUrl, options);
      if (officialResult?.questions?.length) {
        return officialResult;
      }
      if (officialResult?.blocks?.length) {
        console.warn(
          `[segment] Aliyun official OCR returned text blocks but no question boxes: blocks=${officialResult.blocks.length}`
        );
      }
    } catch (error) {
      firstError ||= error;
      console.warn("[segment] Aliyun official edu paper-cut failed:", error.message || error);
    }
  }

  if (ALIYUN_OCR_APPCODE && ALIYUN_OCR_TEXT_FALLBACK_URL && ALIYUN_OCR_TEXT_FALLBACK_URL !== ALIYUN_OCR_URL) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ALIYUN_OCR_TIMEOUT_MS);
    const startedAt = Date.now();
    try {
      console.warn("[segment] Aliyun paper-cut has no question boxes, trying text OCR fallback");
      const response = await fetch(ALIYUN_OCR_TEXT_FALLBACK_URL, {
        method: "POST",
        headers: {
          "Authorization": `APPCODE ${ALIYUN_OCR_APPCODE}`,
          "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
          img: image.buffer.toString("base64"),
          prob: false,
          charInfo: false,
          rotate: true,
          table: false,
          sortPage: true
        }),
        signal: controller.signal
      });
      const raw = await response.text();
      let payload = null;
      try {
        payload = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error(`Aliyun text OCR returned non-JSON: ${raw.slice(0, 160)}`);
      }
      if (!response.ok || payload?.error_code || payload?.code === "InvalidParam") {
        const message = payload?.error_msg || payload?.message || raw.slice(0, 160) || response.statusText;
        throw new Error(`Aliyun text OCR ${response.status}: ${message}`);
      }
      const blocks = normalizeAliyunOcrBlocks(payload);
      console.log(
        `[segment] Aliyun text OCR fallback block count: ${blocks.length}, elapsed=${Date.now() - startedAt}ms`
      );
      return { blocks, questions: [] };
    } catch (error) {
      firstError ||= error;
      if (SEGMENT_ALIYUN_ONLY && firstError) throw firstError;
    } finally {
      clearTimeout(timer);
    }
  }

  if (SEGMENT_ALIYUN_ONLY && firstError) throw firstError;
  return { blocks: [], questions: [] };
}

async function extractAliyunTextBlocks(imageDataUrl) {
  const result = await extractAliyunPaperCutResult(imageDataUrl);
  return result.blocks || [];
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSegmentCacheKey(imageDataUrl, width, height, mode) {
  return crypto
    .createHash("sha256")
    .update(String(imageDataUrl || ""))
    .update(`|${width}x${height}|mode:${mode || "initial"}|fast:${SEGMENT_FAST_MODE}|ocr:${OCR_MAX_SIDE}|ocrFast:${OCR_FAST_MAX_SIDE}|aliyunPaperCutFirst:${ALIYUN_OCR_ENABLED}|aliyunFastPath:${SEGMENT_ALIYUN_FAST_PATH}|official:${Boolean(ALIYUN_OCR_ACCESS_KEY_ID && ALIYUN_OCR_ACCESS_KEY_SECRET)}|aliyunOnly:${SEGMENT_ALIYUN_ONLY}|officialEndpoint:${ALIYUN_OCR_OFFICIAL_ENDPOINT}|marketUrl:${ALIYUN_OCR_URL}|cutType:${process.env.ALIYUN_OCR_CUT_TYPE || "question"}|imageType:${process.env.ALIYUN_OCR_IMAGE_TYPE || "photo"}|subject:${process.env.ALIYUN_OCR_SUBJECT || "JHighSchool_Math"}|segment:v52`)
    .digest("hex");
}

function getCachedSegmentResult(key) {
  const cached = segmentCache.get(key);
  if (!cached) return null;
  segmentCache.delete(key);
  segmentCache.set(key, cached);
  return cloneJson(cached);
}

function setCachedSegmentResult(key, payload) {
  segmentCache.set(key, cloneJson(payload));
  while (segmentCache.size > SEGMENT_CACHE_LIMIT) {
    const oldestKey = segmentCache.keys().next().value;
    segmentCache.delete(oldestKey);
  }
}

function sendSegmentResult(res, cacheKey, payload) {
  setCachedSegmentResult(cacheKey, payload);
  sendJson(res, 200, payload);
}

function parseJsonOutput(stdout) {
  const text = String(stdout || "").trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const starts = [...text.matchAll(/\{/g)].map((match) => match.index);
    for (const start of starts) {
      try {
        return JSON.parse(text.slice(start));
      } catch {
        // Keep scanning in case a library printed a line before the JSON payload.
      }
    }
    return null;
  }
}

function rejectPendingOcrRequests(service, error) {
  for (const request of service.pending.values()) {
    clearTimeout(request.timer);
    request.reject(error);
  }
  service.pending.clear();
}

function getPaddleOcrService() {
  if (!LOCAL_OCR_ENABLED) return null;
  if (!fs.existsSync(OCR_PYTHON) || !fs.existsSync(PADDLE_OCR_SCRIPT)) return null;
  if (paddleOcrService && !paddleOcrService.exited) return paddleOcrService;

  const child = spawn(OCR_PYTHON, [PADDLE_OCR_SCRIPT, "--server"], {
    cwd: ROOT,
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8",
      OCR_MAX_SIDE: String(OCR_MAX_SIDE)
    }
  });

  const service = {
    child,
    buffer: "",
    pending: new Map(),
    exited: false,
    ready: false,
    startedAt: Date.now()
  };

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    service.buffer += chunk;
    const lines = service.buffer.split(/\r?\n/);
    service.buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch (error) {
        console.warn("[segment] PaddleOCR service returned non-JSON output:", line.slice(0, 300));
        continue;
      }

      if (message?.ready === true) {
        service.ready = true;
        console.log(`[segment] PaddleOCR service ready, startup=${Date.now() - service.startedAt}ms`);
        continue;
      }
      const request = service.pending.get(message.id);
      if (!request) continue;
      clearTimeout(request.timer);
      service.pending.delete(message.id);
      if (message.error) {
        request.reject(new Error(message.error));
      } else {
        request.resolve(message);
      }
    }
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    const text = chunk.trim();
    if (text) console.warn(`[paddle-ocr] ${text.slice(0, 1200)}`);
  });

  child.on("error", (error) => {
    service.exited = true;
    rejectPendingOcrRequests(service, error);
    if (paddleOcrService === service) paddleOcrService = null;
  });

  child.on("exit", (code, signal) => {
    service.exited = true;
    rejectPendingOcrRequests(service, new Error(`PaddleOCR service exited: code=${code}, signal=${signal}`));
    if (paddleOcrService === service) paddleOcrService = null;
  });

  paddleOcrService = service;
  console.log(`[segment] PaddleOCR service started, maxSide=${OCR_MAX_SIDE}`);
  return service;
}

function requestPaddleOcr(imagePath, maxSide = OCR_MAX_SIDE) {
  const service = getPaddleOcrService();
  if (!service) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const id = ++paddleOcrRequestId;
    const timer = setTimeout(() => {
      service.pending.delete(id);
      reject(new Error("PaddleOCR service timed out"));
    }, 180000);

    service.pending.set(id, { resolve, reject, timer });
    const payload = JSON.stringify({ id, imagePath, maxSide }) + "\n";
    service.child.stdin.write(payload, "utf8", (error) => {
      if (!error) return;
      clearTimeout(timer);
      service.pending.delete(id);
      reject(error);
    });
  });
}

async function extractPaddleTextBlocks(imagePath, maxSide = OCR_MAX_SIDE) {
  const data = await requestPaddleOcr(imagePath, maxSide);
  if (!data) return { blocks: [], skipped: true };
  return {
    blocks: normalizeOcrBlocks(data.blocks),
    resized: Boolean(data.resized),
    originalSize: data.originalSize,
    ocrSize: data.ocrSize,
    elapsedMs: data.elapsedMs,
    detectionMs: data.detectionMs,
    recognitionMs: data.recognitionMs,
    detectedLineCount: data.detectedLineCount,
    recognizedLineCount: data.recognizedLineCount,
    refinedLineCount: data.refinedLineCount
  };
}

function rejectPendingLayoutRequests(service, error) {
  for (const request of service.pending.values()) {
    clearTimeout(request.timer);
    request.reject(error);
  }
  service.pending.clear();
}

function getPaddleLayoutService() {
  if (!LOCAL_OCR_ENABLED) return null;
  if (!LAYOUT_ENABLED || !fs.existsSync(OCR_PYTHON) || !fs.existsSync(PADDLE_LAYOUT_SCRIPT)) return null;
  if (paddleLayoutService && !paddleLayoutService.exited) return paddleLayoutService;

  const child = spawn(OCR_PYTHON, [PADDLE_LAYOUT_SCRIPT, "--server"], {
    cwd: ROOT,
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8",
      LAYOUT_MAX_SIDE: String(LAYOUT_MAX_SIDE)
    }
  });
  const service = {
    child,
    buffer: "",
    pending: new Map(),
    exited: false,
    ready: false,
    startedAt: Date.now()
  };

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    service.buffer += chunk;
    const lines = service.buffer.split(/\r?\n/);
    service.buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        console.warn("[layout] Paddle layout service returned non-JSON output:", line.slice(0, 300));
        continue;
      }
      if (message?.ready === true) {
        service.ready = true;
        console.log(`[layout] service ready, startup=${Date.now() - service.startedAt}ms`);
        continue;
      }
      const request = service.pending.get(message.id);
      if (!request) continue;
      clearTimeout(request.timer);
      service.pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error));
      else request.resolve(message);
    }
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    const output = chunk.trim();
    if (output) console.warn(`[paddle-layout] ${output.slice(0, 1200)}`);
  });
  child.on("error", (error) => {
    service.exited = true;
    rejectPendingLayoutRequests(service, error);
    if (paddleLayoutService === service) paddleLayoutService = null;
  });
  child.on("exit", (code, signal) => {
    service.exited = true;
    rejectPendingLayoutRequests(service, new Error(`Paddle layout service exited: code=${code}, signal=${signal}`));
    if (paddleLayoutService === service) paddleLayoutService = null;
  });

  paddleLayoutService = service;
  console.log(`[layout] service started, model=${process.env.LAYOUT_MODEL || "PP-DocLayoutV2"}, maxSide=${LAYOUT_MAX_SIDE}`);
  return service;
}

function requestPaddleLayout(imagePath, maxSide = LAYOUT_MAX_SIDE) {
  const service = getPaddleLayoutService();
  if (!service) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const id = ++paddleLayoutRequestId;
    const timer = setTimeout(() => {
      service.pending.delete(id);
      reject(new Error("Paddle layout service timed out"));
    }, LAYOUT_TIMEOUT_MS);
    service.pending.set(id, { resolve, reject, timer });
    service.child.stdin.write(`${JSON.stringify({ id, imagePath, maxSide })}\n`, "utf8", (error) => {
      if (!error) return;
      clearTimeout(timer);
      service.pending.delete(id);
      reject(error);
    });
  });
}

function normalizeLayoutRegions(regions) {
  return (Array.isArray(regions) ? regions : [])
    .map((region) => ({
      label: String(region?.label || "unknown").trim().toLowerCase(),
      score: Number(region?.score) || 0,
      x: Math.max(0, Math.round(Number(region?.x) || 0)),
      y: Math.max(0, Math.round(Number(region?.y) || 0)),
      w: Math.max(1, Math.round(Number(region?.w) || 1)),
      h: Math.max(1, Math.round(Number(region?.h) || 1)),
      source: "paddle-layout"
    }))
    .filter((region) => region.score >= 0.18 && region.w > 1 && region.h > 1);
}

async function extractLayoutRegions(imageDataUrl, options = {}) {
  const image = decodeDataImage(imageDataUrl);
  if (!image || !LAYOUT_ENABLED) return [];
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lian-layout-"));
  const imagePath = path.join(tempDir, `source${image.ext}`);
  fs.writeFileSync(imagePath, image.buffer);
  try {
    const result = await requestPaddleLayout(
      imagePath,
      Number(options.maxSide) > 0 ? Number(options.maxSide) : LAYOUT_MAX_SIDE
    );
    const regions = normalizeLayoutRegions(result?.regions);
    console.log(
      `[layout] region count=${regions.length}, inference=${result?.inferenceMs || 0}ms, elapsed=${result?.elapsedMs || 0}ms`
    );
    return regions;
  } catch (error) {
    console.warn("[layout] local layout detection unavailable, continuing with OCR:", error.message || error);
    return [];
  } finally {
    fs.rm(tempDir, { recursive: true, force: true }, () => {});
  }
}

async function extractTextBlocks(imageDataUrl, options = {}) {
  const image = decodeDataImage(imageDataUrl);
  if (!image) return [];
  const maxSide = Number(options.maxSide) > 0 ? Number(options.maxSide) : OCR_MAX_SIDE;
  const cacheKey = getOcrCacheKey(image, maxSide);
  const cachedBlocks = getCachedOcrBlocks(cacheKey);
  if (cachedBlocks) {
    console.log(`[segment] OCR cache hit: ${cachedBlocks.length} blocks`);
    return cachedBlocks;
  }

  if (!options.skipAliyun) {
  try {
    const aliyunBlocks = await extractAliyunTextBlocks(imageDataUrl);
    if (aliyunBlocks.length) {
      setCachedOcrBlocks(cacheKey, aliyunBlocks);
      return cloneOcrBlocks(aliyunBlocks);
    }
  } catch (error) {
    console.warn("[segment] Aliyun OCR failed, trying local OCR fallback:", error.message || error);
  }
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lian-ocr-"));
  const imagePath = path.join(tempDir, `source${image.ext}`);
  fs.writeFileSync(imagePath, image.buffer);
  let paddleBlocks = null;

  try {
  try {
    const paddleResult = await extractPaddleTextBlocks(imagePath, maxSide);
    paddleBlocks = paddleResult.blocks;
    if (paddleBlocks.length) {
      const resizeNote = paddleResult.resized ? `, resized to ${paddleResult.ocrSize?.width}x${paddleResult.ocrSize?.height}` : "";
      console.log(
        `[segment] PaddleOCR block count: ${paddleBlocks.length}${resizeNote}, ` +
        `detected=${paddleResult.detectedLineCount || paddleBlocks.length}, recognized=${paddleResult.recognizedLineCount || 0}, ` +
        `refined=${paddleResult.refinedLineCount || 0}, ` +
        `detection=${paddleResult.detectionMs || 0}ms, recognition=${paddleResult.recognitionMs || 0}ms, elapsed=${paddleResult.elapsedMs || 0}ms`
      );
      setCachedOcrBlocks(cacheKey, paddleBlocks);
      return cloneOcrBlocks(paddleBlocks);
    }
  } catch (error) {
    console.warn("[segment] PaddleOCR failed, trying Tesseract fallback:", error.message || error);
  }

  if (LOCAL_OCR_ENABLED) {
    try {
      const tsv = await runCommand("tesseract", [imagePath, "stdout", "-l", "chi_sim+eng", "--psm", "6", "tsv"]);
      const tesseractBlocks = parseTesseractTsv(tsv);
      if (tesseractBlocks.length) {
        console.log(`[segment] Tesseract OCR block count: ${tesseractBlocks.length}`);
      }
      setCachedOcrBlocks(cacheKey, tesseractBlocks);
      return tesseractBlocks;
    } catch (error) {
      console.warn("[segment] OCR unavailable or failed. TODO: connect service OCR if local OCR is unavailable.", error.message || error);
      if (paddleBlocks) {
        setCachedOcrBlocks(cacheKey, paddleBlocks);
        return cloneOcrBlocks(paddleBlocks);
      }
      return [];
    }
  }

  console.warn("[segment] local OCR is disabled in this environment; using non-OCR fallback path.");
  setCachedOcrBlocks(cacheKey, []);
  return [];
} finally {
    fs.rm(tempDir, { recursive: true, force: true }, () => {});
  }
}

function parseTesseractTsv(tsv) {
  const rows = String(tsv || "").trim().split(/\r?\n/);
  if (rows.length < 2) return [];
  const headers = rows[0].split("\t");
  const indexOf = (name) => headers.indexOf(name);
  const col = {
    level: indexOf("level"),
    page: indexOf("page_num"),
    block: indexOf("block_num"),
    par: indexOf("par_num"),
    line: indexOf("line_num"),
    left: indexOf("left"),
    top: indexOf("top"),
    width: indexOf("width"),
    height: indexOf("height"),
    conf: indexOf("conf"),
    text: indexOf("text")
  };

  const lineMap = new Map();
  for (const row of rows.slice(1)) {
    const cells = row.split("\t");
    const text = String(cells[col.text] || "").trim();
    const conf = Number(cells[col.conf]);
    if (!text || Number.isFinite(conf) && conf < 25) continue;

    const left = Number(cells[col.left]);
    const top = Number(cells[col.top]);
    const width = Number(cells[col.width]);
    const height = Number(cells[col.height]);
    if (![left, top, width, height].every(Number.isFinite) || width <= 0 || height <= 0) continue;

    const key = [cells[col.page], cells[col.block], cells[col.par], cells[col.line]].join(":");
    const existing = lineMap.get(key);
    if (!existing) {
      lineMap.set(key, {
        text,
        x: left,
        y: top,
        right: left + width,
        bottom: top + height
      });
    } else {
      existing.text = `${existing.text} ${text}`.trim();
      existing.x = Math.min(existing.x, left);
      existing.y = Math.min(existing.y, top);
      existing.right = Math.max(existing.right, left + width);
      existing.bottom = Math.max(existing.bottom, top + height);
    }
  }

  return [...lineMap.values()]
    .map((block) => ({
      text: block.text.replace(/\s+/g, " ").trim(),
      x: Math.round(block.x),
      y: Math.round(block.y),
      w: Math.round(block.right - block.x),
      h: Math.round(block.bottom - block.y)
    }))
    .filter((block) => block.text && block.w > 2 && block.h > 2)
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

function extractModelText(data) {
  if (!data || typeof data !== "object") {
    const error = new Error("模型响应对象为空");
    error.code = "empty_model_response";
    error.errorType = "EMPTY_MODEL_RESPONSE";
    throw error;
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    const text = content.trim();
    if (!text) {
      const error = new Error("模型返回文本为空");
      error.code = "empty_model_text";
      error.errorType = "EMPTY_MODEL_TEXT";
      throw error;
    }
    return text;
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) => typeof part === "string" ? part : String(part?.text || ""))
      .join("")
      .trim();
    if (!text) {
      const error = new Error("模型返回内容中没有文本");
      error.code = "model_text_not_found";
      error.errorType = "MODEL_TEXT_NOT_FOUND";
      throw error;
    }
    return text;
  }

  const error = new Error("模型响应中没有 choices.message.content 文本字段");
  error.code = "model_text_not_found";
  error.errorType = "MODEL_TEXT_NOT_FOUND";
  error.responseKeys = Object.keys(data);
  throw error;
}

function extractDeepSeekText(data) {
  try {
    return extractModelText(data);
  } catch {
    return "";
  }
}

function parseModelJson(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
        // Fall through to object slicing.
      }
    }
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(raw.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function formatOcrBlocksForPrompt(blocks, limit = 180) {
  const visibleBlocks = blocks.slice(0, limit).map((block, index) => ({
    index,
    text: block.text,
    x: block.x,
    y: block.y,
    w: block.w,
    h: block.h
  }));
  const suffix = blocks.length > limit ? `\n...另有 ${blocks.length - limit} 个 OCR 块已省略` : "";
  return `${JSON.stringify(visibleBlocks, null, 2)}${suffix}`;
}

async function buildDeepSeekUserText(content) {
  const parts = [];
  let imageIndex = 0;
  for (const item of Array.isArray(content) ? content : []) {
    if (item?.type === "input_text") {
      parts.push(String(item.text || ""));
      continue;
    }
    if (item?.type === "input_image") {
      imageIndex += 1;
      const label = item.label || (imageIndex === 1 ? "题目图片" : imageIndex === 2 ? "板书截图" : `图片${imageIndex}`);
      let blocks = [];
      try {
        blocks = await extractTextBlocks(item.image_url);
      } catch (error) {
        console.warn(`[deepseek] ${label} OCR failed:`, error.message || error);
      }
      const blockLimit = Number.isFinite(Number(item.blockLimit)) ? Number(item.blockLimit) : 180;
      parts.push(
        [
          `[${label} OCR 结果]`,
          blocks.length
            ? formatOcrBlocksForPrompt(blocks, blockLimit)
            : "OCR 未识别到文字。DeepSeek 当前只能基于 OCR 文本判断，不能直接读取图片像素。"
        ].join("\n")
      );
    }
  }
  return parts.filter(Boolean).join("\n\n");
}

async function callDeepSeekJson({ model, content, schema, instructions, maxOutputTokens = 1800, timeoutMs = 0 }) {
  if (!DEEPSEEK_API_KEY) {
    const error = new Error("DEEPSEEK_API_KEY 未配置");
    error.statusCode = 503;
    error.code = "missing_api_key";
    throw error;
  }

  const userText = await buildDeepSeekUserText(content);
  const schemaText = JSON.stringify(schema.schema, null, 2);

  let response;
  const controller = timeoutMs > 0 ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      signal: controller?.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: [
              instructions,
              "你必须只输出一个合法 JSON 对象，不要输出 Markdown，不要输出解释。",
              `JSON schema 名称：${schema.name}`,
              "JSON schema：",
              schemaText
            ].join("\n\n")
          },
          { role: "user", content: userText }
        ],
        response_format: { type: "json_object" },
        max_tokens: maxOutputTokens,
        stream: false
      })
    });
  } catch (fetchError) {
    const timedOut = fetchError?.name === "AbortError";
    const error = new Error(timedOut ? "DeepSeek API request timed out" : "DeepSeek API 网络连接失败");
    error.statusCode = 502;
    error.code = timedOut ? "timeout" : "network_error";
    throw error;
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || `DeepSeek API 请求失败：${response.status}`);
    error.statusCode = response.status;
    error.code = data.error?.code || data.error?.type || "deepseek_error";
    throw error;
  }

  let rawText = "";
  try {
    rawText = extractModelText(data);
  } catch (error) {
    error.statusCode = error.statusCode || 502;
    error.code = error.code || "model_text_not_found";
    error.errorType = error.errorType || "MODEL_TEXT_NOT_FOUND";
    error.model = model;
    error.responseKeys = error.responseKeys || Object.keys(data || {});
    throw error;
  }
  const parsed = parseModelJson(rawText);
  if (!parsed) {
    console.warn("[qwen] invalid structured output", {
      model,
      schema: schema?.name || "",
      responseKeys: Object.keys(data || {}),
      choiceCount: Array.isArray(data?.choices) ? data.choices.length : 0,
      finishReason: data?.choices?.[0]?.finish_reason || "",
      textLength: String(rawText || "").length
    });
    const error = new Error("DeepSeek 没有返回可解析的结构化结果");
    error.statusCode = 502;
    error.code = "invalid_model_output";
    throw error;
  }
  return parsed;
}

function shouldUseFallbackModel(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "");
  return (
    code === "insufficient_quota" ||
    code === "model_not_found" ||
    /quota|billing|model|额度|模型/.test(message)
  );
}

async function callDeepSeekJsonWithFallback(options, fallbackModel) {
  try {
    return {
      result: await callDeepSeekJson(options),
      model: options.model
    };
  } catch (error) {
    if (!fallbackModel || fallbackModel === options.model || !shouldUseFallbackModel(error)) throw error;
    return {
      result: await callDeepSeekJson({ ...options, model: fallbackModel }),
      model: fallbackModel,
      fallbackFrom: options.model
    };
  }
}

function buildQwenContent(content) {
  const parts = [];
  for (const item of Array.isArray(content) ? content : []) {
    if (item?.type === "input_text") {
      const text = String(item.text || "").trim();
      if (text) parts.push({ type: "text", text });
      continue;
    }
    if (item?.type === "input_image" && item.image_url) {
      if (item.label) parts.push({ type: "text", text: `[${item.label}]` });
      parts.push({
        type: "image_url",
        image_url: {
          url: item.image_url
        }
      });
    }
  }
  return parts;
}

function isQwenJsonFormatUnsupported(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "");
  return /response_format|json_object|not support|unsupported|不支持/i.test(`${code} ${message}`);
}

async function requestQwenChatCompletionOnce(
  payload,
  useJsonFormat = true,
  timeoutMs = QWEN_REQUEST_TIMEOUT_MS,
  externalSignal = null,
  diagnostics = {}
) {
  const controller = new AbortController();
  const boundedTimeoutMs = Math.max(1000, Number(timeoutMs) || QWEN_REQUEST_TIMEOUT_MS);
  const model = String(payload?.model || "");
  const trace = diagnostics.qwenModels && typeof diagnostics.qwenModels === "object"
    ? (diagnostics.qwenModels[model] ||= {})
    : {};
  const startedAt = Date.now();
  let globalTimeout = null;
  let abortReason = "";
  let timedOutStage = "";
  const abortFromExternal = () => controller.abort();

  const mark = (key, value = new Date().toISOString()) => {
    trace[key] = value;
    diagnostics[key] = value;
  };
  const makeStageTimeout = (stage, stageTimeoutMs) => {
    const error = new Error(`Qwen ${stage} 阶段超过 ${Math.round(stageTimeoutMs / 1000)} 秒未返回`);
    error.name = "TimeoutError";
    error.statusCode = 504;
    error.code = `qwen_${stage}_timeout`;
    error.stage = stage;
    error.model = model;
    return error;
  };
  const runStage = (promise, stage, stageTimeoutMs) => awaitWithTimeout(
    promise,
    Math.max(1, Math.min(boundedTimeoutMs, Number(stageTimeoutMs) || boundedTimeoutMs)),
    () => {
      timedOutStage = stage;
      abortReason = `timeout:${stage}`;
      controller.abort();
    },
    () => makeStageTimeout(stage, Math.max(1, Number(stageTimeoutMs) || boundedTimeoutMs))
  );

  mark("qwen_request_start");
  trace.timeout_ms = boundedTimeoutMs;
  trace.model = model;
  diagnostics.model_name = model;
  globalTimeout = setTimeout(() => {
    timedOutStage = timedOutStage || "total";
    abortReason = abortReason || "timeout:total";
    controller.abort();
  }, boundedTimeoutMs);
  if (externalSignal) {
    if (externalSignal.aborted) {
      abortReason = "external";
      controller.abort();
    }
    else externalSignal.addEventListener("abort", abortFromExternal, { once: true });
  }
  try {
    const response = await runStage(fetch(`${QWEN_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${QWEN_API_KEY}`
      },
      body: JSON.stringify({
        ...payload,
        ...(useJsonFormat ? { response_format: { type: "json_object" } } : {})
      }),
      signal: controller.signal
    }), "connect", QWEN_CONNECT_TIMEOUT_MS);
    mark("first_response_time");
    trace.http_status = response.status;

    const responseStartedAt = Date.now();
    const rawBody = await runStage(
      response.text(),
      "response",
      Math.min(QWEN_RESPONSE_TIMEOUT_MS, Math.max(1000, boundedTimeoutMs - (Date.now() - startedAt)))
    );
    mark("response_complete_time");
    trace.response_bytes = Buffer.byteLength(rawBody || "", "utf8");
    trace.response_duration_ms = Date.now() - responseStartedAt;
    trace.token_count_estimate = Math.ceil(String(rawBody || "").length / 4);
    if (trace.response_bytes > QWEN_MAX_RESPONSE_BYTES) {
      abortReason = "response_too_large";
      controller.abort();
      const error = new Error(`Qwen 响应超过 ${QWEN_MAX_RESPONSE_BYTES} 字节上限`);
      error.statusCode = 502;
      error.code = "qwen_response_too_large";
      error.model = model;
      throw error;
    }

    let data = null;
    try {
      data = await runStage(
        Promise.resolve().then(() => JSON.parse(String(rawBody || ""))),
        "parse",
        Math.min(QWEN_PARSE_TIMEOUT_MS, Math.max(500, boundedTimeoutMs - (Date.now() - startedAt)))
      );
      mark("json_parse_time");
    } catch (parseError) {
      if (parseError?.code === "qwen_parse_timeout") throw parseError;
      const error = new Error("Qwen 多模态 API 返回了无法解析的响应");
      error.statusCode = 502;
      error.code = "upstream_invalid_response";
      error.errorType = "INVALID_JSON";
      error.parseError = parseError?.message || String(parseError);
      error.model = model;
      error.responseBytes = trace.response_bytes;
      error.responsePreview = String(rawBody || "").slice(0, 1200);
      if (QWEN_DEBUG_LOGS) trace.raw_response_preview = error.responsePreview;
      throw error;
    }

    if (!response.ok) {
      const rawMessage = data.error?.message || `Qwen 多模态 API 请求失败：${response.status}`;
      const rawCode = data.error?.code || data.error?.type || "qwen_error";
      const normalizedCode = response.status === 429
        ? "rate_limited"
        : response.status === 408 || response.status === 504
          ? "qwen_timeout"
          : response.status >= 500
            ? "upstream_5xx"
            : rawCode;
      console.warn("[qwen] http failure", {
        status: response.status,
        code: normalizedCode,
        upstreamCode: rawCode,
        message: rawMessage,
        model,
        useJsonFormat
      });
      const friendlyMessage =
        rawCode === "access_denied"
          ? "Qwen API 访问被拒绝，请确认 .env 里的 Qwen_api_key 是阿里云百炼 API Key，并已开通对应多模态模型权限。"
          : rawCode === "invalid_api_key" || /api key|authentication|认证|鉴权/i.test(rawMessage)
            ? "Qwen API key 无法通过认证，请检查 .env 里的 Qwen_api_key、QWEN_API_KEY 或 DASHSCOPE_API_KEY。"
            : rawMessage;
      const error = new Error(friendlyMessage);
      error.statusCode = response.status;
      error.status = response.status;
      error.code = normalizedCode;
      error.model = model;
      throw error;
    }

    trace.raw_response_preview = QWEN_DEBUG_LOGS ? String(rawBody || "").slice(0, 1200) : "";
    return data;
  } catch (fetchError) {
    if (externalSignal?.aborted) {
      const code = getAbortReasonCode(externalSignal.reason, "qwen_aborted");
      abortReason = abortReason || "external";
      const error = createAbortError("Qwen 请求已取消", code);
      error.model = model;
      throw error;
    }
    if (fetchError?.code === "upstream_invalid_response" || fetchError?.statusCode) {
      throw fetchError;
    }
    const causeCode = fetchError?.cause?.code || fetchError?.code || "";
    const timedOut = fetchError?.name === "AbortError" || abortReason.startsWith("timeout:");
    const timeoutCode = timedOutStage === "connect"
      ? "qwen_connect_timeout"
      : timedOutStage === "response"
        ? "qwen_response_timeout"
        : timedOutStage === "parse"
          ? "qwen_parse_timeout"
          : "qwen_total_timeout";
    const error = new Error(
      timedOut
        ? `Qwen 多模态 API ${timedOutStage || "total"} 阶段超过 ${Math.round(boundedTimeoutMs / 1000)} 秒未返回`
        : "Qwen 多模态 API 网络连接失败"
    );
    error.statusCode = timedOut ? 504 : 502;
    error.code = timedOut ? timeoutCode : "network_error";
    error.causeCode = causeCode;
    error.model = model;
    console.warn(
      `[qwen] ${timedOut ? "timeout" : "network"} failed model=${model} timeoutMs=${boundedTimeoutMs} stage=${timedOutStage || ""} code=${causeCode || "unknown"} message=${fetchError?.message || ""}`
    );
    throw error;
  } finally {
    clearTimeout(globalTimeout);
    mark("finish_time");
    trace.duration_ms = Date.now() - startedAt;
    trace.abort_reason = abortReason;
    trace.timed_out_stage = timedOutStage;
    externalSignal?.removeEventListener?.("abort", abortFromExternal);
  }
}

function getQwenModelCandidates(model, explicitCandidates = []) {
  const configured = String(model || "").trim();
  const explicit = Array.isArray(explicitCandidates) ? explicitCandidates : [];
  const byPurpose = configured === QWEN_HANDWRITING_MODEL
    ? QWEN_HANDWRITING_MODEL_CANDIDATES
    : configured === QWEN_VL_MODEL
      ? QWEN_VL_MODEL_CANDIDATES
      : QWEN_GUIDE_MODEL_CANDIDATES;
  return [...new Set([
    configured,
    ...explicit.map((item) => String(item || "").trim()),
    ...byPurpose
  ])].filter(Boolean);
}

function isQwenModelQuotaOrAvailabilityError(error) {
  const code = String(error?.code || "").toLowerCase();
  const status = Number(error?.statusCode || error?.status || 0);
  const message = String(error?.message || "").toLowerCase();
  const combined = `${code} ${message}`;
  if (code === "qwen_total_timeout") return false;
  if (/invalid_api_key|authentication|api key|鉴权|认证/.test(combined)) return false;
  if (/response_format|json_object|unsupported|不支持/.test(combined) && status < 500) return false;
  return (
    status === 402 ||
    status === 404 ||
    status === 408 ||
    status === 429 ||
    status >= 500 ||
    (status === 403 && /access|permission|model|权限|模型/.test(combined)) ||
    /quota|insufficient|rate.?limit|throttl|resource.?exhausted|model.?not.?found|model.?unavailable|limit|额度|限额|余额|限流|模型.*(?:不存在|不可用|无权限)/i.test(combined)
  );
}

function isQwenNetworkError(error) {
  const code = String(error?.code || "").toLowerCase();
  const causeCode = String(error?.causeCode || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  const combined = `${code} ${causeCode} ${message}`;
  return [
    "network_error",
    "eacces",
    "econnreset",
    "econnrefused",
    "enetunreach",
    "ehostunreach",
    "eai_again",
    "enotfound",
    "etimedout"
  ].some((token) => combined.includes(token)) || /fetch failed|network request failed|连接失败|网络错误/.test(combined);
}

function qwenModelIsCoolingDown(model) {
  return Number(qwenModelCooldownUntil.get(model) || 0) > Date.now();
}

async function requestQwenChatCompletion(payload, useJsonFormat = true, options = {}) {
  const modelCandidates = options.disableModelFallback
    ? [String(payload?.model || "").trim()].filter(Boolean)
    : getQwenModelCandidates(payload?.model, payload?.modelCandidates);
  const requestPayload = { ...(payload || {}) };
  delete requestPayload.modelCandidates;

  const availableCandidates = modelCandidates.filter((model) => !qwenModelIsCoolingDown(model));
  const candidates = availableCandidates.length ? availableCandidates : modelCandidates;
  const deadlineAt = Number(options.deadlineAt) > 0
    ? Number(options.deadlineAt)
    : Date.now() + Math.max(1000, Number(options.timeoutMs) || QWEN_TOTAL_TIMEOUT_MS);
  let lastError = null;

  for (let index = 0; index < candidates.length; index += 1) {
    const model = candidates[index];
    const remainingMs = deadlineAt - Date.now();
    if (remainingMs <= 0) {
      const timeoutError = new Error("Qwen 多模态 API 总请求时间已用尽");
      timeoutError.statusCode = 504;
      timeoutError.code = "qwen_total_timeout";
      timeoutError.model = model;
      throw timeoutError;
    }
    try {
      const data = await requestQwenChatCompletionOnce(
        { ...requestPayload, model },
        useJsonFormat,
        Math.min(QWEN_REQUEST_TIMEOUT_MS, remainingMs),
        options.signal || null,
        options.diagnostics || {}
      );
      if (index > 0) {
        console.info("[qwen-fallback] switched model successfully", {
          from: candidates[0],
          to: model,
          attempted: index + 1
        });
      }
      return data;
    } catch (error) {
      lastError = error;
      const canSwitch =
        index < candidates.length - 1 &&
        error?.code !== "qwen_total_timeout" &&
        !isQwenNetworkError(error) &&
        isQwenModelQuotaOrAvailabilityError(error);
      console.warn("[qwen-fallback] model attempt failed", {
        model,
        attempted: index + 1,
        candidates,
        canSwitch,
        code: error?.code || "",
        causeCode: error?.causeCode || "",
        status: error?.statusCode || error?.status || 0,
        message: error?.message || String(error)
      });
      if (!canSwitch) break;
      qwenModelCooldownUntil.set(model, Date.now() + QWEN_MODEL_COOLDOWN_MS);
    }
  }

  throw lastError || new Error("Qwen 多模态 API 请求失败");
}

async function callQwenMultimodalJson({
  model,
  content,
  schema,
  instructions,
  maxOutputTokens = 1200,
  deadlineAt: requestedDeadlineAt,
  timeoutMs = QWEN_TOTAL_TIMEOUT_MS,
  signal,
  diagnostics = {},
  disableModelFallback = false,
  allowTextFallback = false,
  plainTextMode = false
}) {
  if (!QWEN_API_KEY) {
    const error = new Error("Qwen API key 未配置");
    error.statusCode = 503;
    error.code = "missing_qwen_api_key";
    throw error;
  }

  const schemaText = JSON.stringify(schema?.schema || {}, null, 2);
  const payload = {
    model,
    messages: [
      {
        role: "system",
        content: plainTextMode
          ? [
            instructions,
            "这是板书观察请求。请只返回你从当前黑板中实际看见的数学文字、公式和步骤，使用普通文本即可。",
            "不要等待完整解题，不要猜测没有写出的内容；如果看不清或没有可识别内容，只返回‘无法识别’。"
          ].join("\n\n")
          : [
            instructions,
            "你必须只输出一个合法 JSON 对象，不要输出 Markdown，不要输出解释。",
            `JSON schema 名称：${schema?.name || "unknown"}`,
            "JSON schema：",
            schemaText
          ].join("\n\n")
      },
      {
        role: "user",
        content: buildQwenContent(content)
      }
    ],
    max_tokens: maxOutputTokens,
    stream: false
  };

  let data;
  const deadlineAt = Number(requestedDeadlineAt) > 0
    ? Number(requestedDeadlineAt)
    : Date.now() + Math.max(1000, Number(timeoutMs) || QWEN_TOTAL_TIMEOUT_MS);
  try {
    data = await requestQwenChatCompletion(payload, !plainTextMode, {
      deadlineAt,
      timeoutMs,
      signal,
      disableModelFallback,
      diagnostics
    });
  } catch (error) {
    if (disableModelFallback || plainTextMode) throw error;
    if (!isQwenJsonFormatUnsupported(error)) throw error;
    data = await requestQwenChatCompletion(payload, false, {
      deadlineAt,
      timeoutMs,
      signal,
      disableModelFallback,
      diagnostics
    });
  }

  let rawText;
  try {
    rawText = extractModelText(data);
  } catch (error) {
    error.statusCode = error.statusCode || 502;
    error.code = error.code || "model_text_not_found";
    error.errorType = error.errorType || "MODEL_TEXT_NOT_FOUND";
    error.model = error.model || model;
    error.responseKeys = error.responseKeys || Object.keys(data || {});
    throw error;
  }
  if (plainTextMode) {
    const handwritingText = String(rawText || "")
      .replace(/```(?:text|markdown)?/gi, "")
      .replace(/```/g, "")
      .trim();
    if (!handwritingText || /无法识别|看不清|没有可识别|无法判断|请求失败|接口|网络错误|超时/i.test(handwritingText)) {
      const error = new Error("Qwen 没有返回可识别的板书内容");
      error.statusCode = 502;
      error.code = "invalid_model_output";
      throw error;
    }
    console.info("[qwen] handwriting plain text accepted", {
      model,
      textLength: handwritingText.length
    });
    return {
      detectedWriting: handwritingText,
      recognizedText: handwritingText,
      mathExpression: handwritingText,
      completedSteps: [handwritingText],
      writingState: "in_progress",
      calculationStatus: "incomplete",
      isRelevant: true,
      boardComplete: false,
      confidence: 0.5,
      plainTextResult: true
    };
  }
  const parsed = parseModelJson(rawText);
  if (!parsed && allowTextFallback) {
    const speech = rawText
      .replace(/```(?:json|text)?/gi, "")
      .replace(/```/g, "")
      .replace(/^\s*(?:回复|引导|答案)\s*[:：]\s*/i, "")
      .trim();
    if (speech && !/请求失败|接口|稍后再试|没有返回|无法识别|网络错误|超时/i.test(speech)) {
      console.warn("[qwen] guide accepted plain text fallback", {
        model,
        textLength: speech.length
      });
      return {
        shouldSpeak: true,
        speech,
        guideState: "interactive_teaching",
        knowledgePoints: [],
        hintLevel: "worked_step",
        formulaOrStep: "",
        askStudentToRepeat: false,
        studentAction: "",
        lectureComplete: false,
        plainTextFallback: true
      };
    }
  }
  if (!parsed) {
    console.warn("[qwen] invalid structured output", {
      model,
      schema: schema?.name || "",
      responseKeys: Object.keys(data || {}),
      choiceCount: Array.isArray(data?.choices) ? data.choices.length : 0,
      finishReason: data?.choices?.[0]?.finish_reason || "",
      textLength: String(rawText || "").length
    });
    const error = new Error("Qwen 多模态模型没有返回可解析的结构化结果");
    error.statusCode = 502;
    error.code = "invalid_model_output";
    error.errorType = "INVALID_JSON";
    error.rawResponsePreview = String(rawText || "").slice(0, 1200);
    throw error;
  }
  return parsed;
}

function isConcreteGuideResult(result, diagnostics = {}) {
  if (!result || typeof result !== "object") return false;
  const eventType = String(diagnostics.eventType || "");
  if (result.shouldSpeak === false) {
    // A silent normal/thought-complete result is valid. A silence, help, or
    // answer-response event must produce an actual response before it wins a
    // parallel race; otherwise a fast empty result can suppress a useful one.
    return !/(?:silence|stuck|active_help|answer_to_lian_question|next_step)/.test(eventType);
  }
  const speech = String(result.speech || "").trim();
  if (!speech || /请求失败|接口|稍后再试|没有返回|无法识别|不确定|网络错误|超时/i.test(speech)) {
    return false;
  }
  const formula = String(result.formulaOrStep || "").trim();
  const action = String(result.studentAction || "").trim();
  if (/silence|stuck|active_help|answer_to_lian_question/.test(eventType)) {
    return Boolean(formula || action || speech.length >= 12);
  }
  return true;
}

function isValidHandwritingResult(result) {
  if (!result || typeof result !== "object") return false;
  const writingState = String(result.writingState || "").trim().toLowerCase();
  const calculationStatus = String(result.calculationStatus || "").trim().toLowerCase();
  const status = String(result.status || "").trim().toLowerCase();
  const uncertainStates = new Set(["unclear", "uncertain", "unknown", "不确定", "无法判断"]);
  // An explicit uncertain response is not a winner in a parallel race. It
  // must leave room for the other model to return an actually usable board
  // interpretation.
  if ([writingState, calculationStatus, status].some((value) => uncertainStates.has(value))) {
    return false;
  }
  const confidence = Number(result.confidence);
  if (Number.isFinite(confidence) && confidence < 0.35) return false;
  const hasVisibleContent = Boolean(
    String(result.detectedWriting || "").trim() ||
    String(result.mathExpression || "").trim() ||
    (Array.isArray(result.completedSteps) && result.completedSteps.some((step) => String(step || "").trim()))
  );
  const hasStructuredStatus = Boolean(writingState || calculationStatus || result.isRelevant != null || result.boardComplete != null);
  return hasVisibleContent || hasStructuredStatus;
}

function abortSignalPromise(signal) {
  if (!signal) return null;
  let cleanup = () => {};
  const promise = new Promise((resolve) => {
    const onAbort = () => resolve({ kind: "aborted", reason: signal.reason });
    cleanup = () => signal.removeEventListener("abort", onAbort);
    if (signal.aborted) onAbort();
    else signal.addEventListener("abort", onAbort, { once: true });
  });
  return { promise, cleanup };
}

async function raceQwenStructuredModels({ options = {}, models, isValid, diagnostics = {}, label, invokeModel }) {
  const normalizedCandidates = [...new Set((Array.isArray(models) ? models : [])
    .map((model) => String(model || "").trim())
    .filter(Boolean))];
  // Keep concurrency bounded, while still allowing a quota/availability
  // failure to be replaced by the next configured fallback. The old slice
  // limited the pool itself, so primary-quota + fallback-one could hang
  // forever without ever reaching fallback-two.
  const candidateLimit = Math.max(1, QWEN_MAX_MODEL_CANDIDATES);
  const activeCandidates = normalizedCandidates.filter((model) => !qwenModelIsCoolingDown(model));
  const candidatePool = activeCandidates.length ? activeCandidates : normalizedCandidates;
  const candidates = candidatePool;
  const parallelSlots = Math.min(candidateLimit, candidates.length);
  console.info(`[${label}] model race`, {
    candidates,
    candidateCount: candidates.length,
    parallelSlots,
    configuredCandidateCount: normalizedCandidates.length
  });
  if (!candidates.length) return callQwenMultimodalJson({ ...options, diagnostics });
  const deadlineAt = Number(options.deadlineAt) > 0
    ? Number(options.deadlineAt)
    : Date.now() + Math.max(1000, Number(options.timeoutMs) || (
      label === "guide"
        ? QWEN_GUIDE_TOTAL_TIMEOUT_MS
        : label === "handwriting"
          ? QWEN_HANDWRITING_TOTAL_TIMEOUT_MS
          : QWEN_TOTAL_TIMEOUT_MS
  ));
  let lastError = null;
  let nextCandidateIndex = 0;
  const entries = [];
  const startedAt = Date.now();

  const createEntry = (model, candidateIndex) => {
    const controller = new AbortController();
    const parentAbort = abortSignalPromise(options.signal);
    const abortParent = () => controller.abort();
    if (options.signal && !options.signal.aborted) {
      options.signal.addEventListener("abort", abortParent, { once: true });
    }
    const invoke = () => invokeModel
      ? invokeModel(model, controller.signal, deadlineAt)
      : callQwenMultimodalJson({
        ...options,
        model,
        deadlineAt,
        timeoutMs: Math.max(1000, deadlineAt - Date.now()),
        signal: controller.signal,
        diagnostics,
        disableModelFallback: true
      });
    const outcome = Promise.resolve()
      .then(invoke)
      .then((result) => ({ kind: "result", result, model, candidateIndex }))
      .catch((error) => ({ kind: "error", error, model, candidateIndex }));
    return {
      model,
      candidateIndex,
      controller,
      outcome,
      parentAbort,
      cleanup: () => {
        parentAbort?.cleanup?.();
        options.signal?.removeEventListener?.("abort", abortParent);
      }
    };
  };

  const fillSlots = () => {
    while (entries.length < parallelSlots && nextCandidateIndex < candidates.length) {
      const candidateIndex = nextCandidateIndex;
      nextCandidateIndex += 1;
      entries.push(createEntry(candidates[candidateIndex], candidateIndex));
    }
  };

  const abortAndCleanupEntries = () => {
    entries.forEach((entry) => entry.controller.abort());
    entries.forEach((entry) => entry.cleanup());
    entries.length = 0;
  };

  fillSlots();
  while (entries.length) {
    const remainingMs = deadlineAt - Date.now();
    if (remainingMs <= 0) {
      abortAndCleanupEntries();
      const timeoutError = new Error(`Qwen ${label} 阶段总等待时间已用尽`);
      timeoutError.statusCode = 504;
      timeoutError.code = "qwen_total_timeout";
      timeoutError.stage = label;
      throw timeoutError;
    }

    const abortWait = abortSignalPromise(options.signal);
    let deadlineTimer;
    const deadlinePromise = new Promise((resolve) => {
      deadlineTimer = setTimeout(() => resolve({ kind: "deadline" }), remainingMs);
    });
    let outcome;
    try {
      outcome = await Promise.race([
        ...entries.map((entry) => entry.outcome),
        deadlinePromise,
        ...(abortWait ? [abortWait.promise] : [])
      ]);
    } finally {
      clearTimeout(deadlineTimer);
      abortWait?.cleanup?.();
    }

    if (outcome?.kind === "deadline") {
      abortAndCleanupEntries();
      const timeoutError = new Error(`Qwen ${label} 阶段总等待时间已用尽`);
      timeoutError.statusCode = 504;
      timeoutError.code = "qwen_total_timeout";
      timeoutError.stage = label;
      throw timeoutError;
    }
    if (outcome?.kind === "aborted") {
      abortAndCleanupEntries();
      throw createAbortError(
        "Qwen 请求已取消",
        getAbortReasonCode(options.signal?.reason, "qwen_aborted")
      );
    }

    const entryIndex = entries.findIndex((entry) => entry.candidateIndex === outcome?.candidateIndex);
    if (entryIndex < 0) continue;
    const [entry] = entries.splice(entryIndex, 1);
    entry.cleanup();

    if (outcome.kind === "result") {
      const accepted = Boolean(outcome.result && isValid(outcome.result, diagnostics));
      console.info(`[${label}] parallel model result`, {
        model: outcome.model,
        elapsedMs: Date.now() - startedAt,
        accepted,
        resultType: typeof outcome.result,
        textLength: String(outcome.result?.detectedWriting || outcome.result?.speech || "").length
      });
      if (accepted) {
        entries.forEach((item) => item.controller.abort());
        entries.forEach((item) => item.cleanup());
        diagnostics.winnerModel = outcome.model;
        console.info(`[${label}] parallel winner`, {
          model: outcome.model,
          candidates,
          elapsedMs: Date.now() - startedAt,
          questionId: diagnostics.questionId || "",
          requestId: diagnostics.requestId || ""
        });
        return outcome.result;
      }
      lastError = Object.assign(new Error(`Qwen ${label} 返回了不可用结果`), {
        statusCode: 502,
        code: "invalid_model_output",
        model: outcome.model
      });
      fillSlots();
      continue;
    }

    lastError = outcome.error;
    console.warn(`[${label}] parallel model failed`, {
      model: outcome.model,
      elapsedMs: Date.now() - startedAt,
      code: outcome.error?.code || "",
      status: outcome.error?.statusCode || outcome.error?.status || 0,
      message: outcome.error?.message || String(outcome.error)
    });
    if (outcome.error?.name === "AbortError" && options.signal?.aborted) {
      abortAndCleanupEntries();
      throw outcome.error;
    }

    // A quota/availability failure removes only this model. Fill the freed
    // slot immediately so the next fallback does not wait for the other
    // in-flight model. Transient upstream failures use the same path; a
    // permanent configuration error still propagates after active work ends.
    const quotaOrAvailabilityFailure = isQwenModelQuotaOrAvailabilityError(outcome.error);
    if (quotaOrAvailabilityFailure) {
      qwenModelCooldownUntil.set(outcome.model, Date.now() + QWEN_MODEL_COOLDOWN_MS);
      console.warn(`[${label}] model cooled down`, {
        model: outcome.model,
        cooldownMs: QWEN_MODEL_COOLDOWN_MS,
        reason: outcome.error?.code || outcome.error?.statusCode || "quota_or_unavailable"
      });
    }
    if (quotaOrAvailabilityFailure || isTransientQwenError(outcome.error)) {
      fillSlots();
    }
  }

  if (Date.now() >= deadlineAt) {
    const timeoutError = new Error(`Qwen ${label} 阶段总等待时间已用尽`);
    timeoutError.statusCode = 504;
    timeoutError.code = "qwen_total_timeout";
    timeoutError.stage = label;
    throw timeoutError;
  }
  if (lastError?.code === "qwen_total_timeout") throw lastError;
  if (lastError?.code === "qwen_client_disconnected") throw lastError;
  if (lastError && !isTransientQwenError(lastError)) throw lastError;

  throw lastError || Object.assign(new Error(`Qwen ${label} 没有返回有效结构化结果`), {
    statusCode: 502,
    code: "invalid_model_output"
  });
}

async function callGuideQwenMultimodalJson(options, diagnostics = {}) {
  return raceQwenStructuredModels({
    options: {
      ...options,
      // A guide is useful as plain text too. Do not discard a usable response
      // merely because a provider ignored response_format=json_object.
      allowTextFallback: true
    },
    models: getQwenModelCandidates(options.model || QWEN_GUIDE_MODEL, options.modelCandidates),
    isValid: isConcreteGuideResult,
    diagnostics,
    label: "guide"
  });
}

function summarizeHandwritingDiagnostics(diagnostics = {}) {
  return {
    requestId: Number(diagnostics.requestId || 0),
    sessionId: Number(diagnostics.sessionId || 0),
    memoryId: String(diagnostics.memoryId || ""),
    questionId: String(diagnostics.questionId || ""),
    boardVersion: Number(diagnostics.boardVersion || 0),
    reason: String(diagnostics.reason || "").slice(0, 120),
    canvasWidth: Number(diagnostics.canvasWidth || 0),
    canvasHeight: Number(diagnostics.canvasHeight || 0),
    boardImageBytes: Number(diagnostics.boardImageBytes || 0),
    capturedAt: String(diagnostics.capturedAt || "")
  };
}

function isTransientQwenError(error) {
  const code = String(error?.code || "");
  const status = Number(error?.statusCode || error?.status || 0);
  if ([
    "invalid_model_output",
    "missing_qwen_api_key",
    "invalid_api_key",
    "access_denied",
    "model_not_found",
    "question_memory_missing",
    "question_memory_mismatch"
  ].includes(code)) return false;
  return (
    code === "network_error" ||
    code === "qwen_timeout" ||
    code === "qwen_total_timeout" ||
    code === "rate_limited" ||
    code === "upstream_5xx" ||
    status === 408 ||
    status === 429 ||
    status >= 500
  );
}

function classifyQwenError(error) {
  if (error?.errorType) return String(error.errorType);
  const code = String(error?.code || "").toLowerCase();
  if (code.includes("timeout")) return "TIMEOUT";
  if (code.includes("abort")) return "ABORTED";
  if (code.includes("invalid") || code.includes("parse")) return "INVALID_JSON";
  if (code.includes("empty")) return "EMPTY_RESPONSE";
  if (code.includes("network")) return "NETWORK_ERROR";
  if (Number(error?.statusCode || error?.status || 0) >= 500) return "MODEL_ERROR";
  return "MODEL_ERROR";
}

async function callHandwritingQwenJson(options, diagnostics = {}) {
  try {
    return await raceQwenStructuredModels({
      options: {
        ...options
      },
      models: getQwenModelCandidates(options.model || QWEN_HANDWRITING_MODEL, options.modelCandidates),
      isValid: isValidHandwritingResult,
      diagnostics,
      label: "handwriting"
    });
  } catch (error) {
    error.stage = error.stage || "handwriting-model";
    error.requestId = diagnostics.requestId || 0;
    error.sessionId = diagnostics.sessionId || 0;
    error.questionId = diagnostics.questionId || "";
    error.model = error.model || options.model || "";
    throw error;
  }
}

function sanitizeKnowledge(value) {
  const text = String(value || "").trim();
  if (!text || /OCR|图像|图片|识别|分割|裁剪|边界|检测/i.test(text)) return "";
  return text.split(/[、,，;；/|]+/).map((item) => item.trim()).filter(Boolean)[0] || "";
}

function normalizeQuestionType(value) {
  const text = String(value || "").trim();
  return ["计算题", "选择题", "填空题", "解答题", "未知"].includes(text) ? text : "未知";
}

function buildWholePageQuestion(width, height, reason = "OCR 未识别到文字块") {
  return {
    x: 0,
    y: 0,
    w: width,
    h: height,
    number: "",
    questionNumber: "",
    title: reason,
    problemText: reason,
    type: "未知",
    problemType: "未知",
    knowledge: "",
    mainKnowledgePoint: "",
    knowledgePoints: [],
    confidence: 0.2
  };
}

function normalizeBlockIndexes(indexes, blockCount) {
  if (!Array.isArray(indexes)) return [];
  const seen = new Set();
  const valid = [];
  for (const index of indexes) {
    const number = Number(index);
    if (!Number.isInteger(number) || number < 0 || number >= blockCount || seen.has(number)) continue;
    seen.add(number);
    valid.push(number);
  }
  return valid;
}

function buildQuestionBoxesFromGroups(groups, blocks, width, height) {
  const questions = [];
  const textLeft = Array.isArray(blocks) && blocks.length ? Math.min(...blocks.map((block) => block.x)) : 0;
  const textRight = Array.isArray(blocks) && blocks.length ? Math.max(...blocks.map((block) => block.x + block.w)) : width;
  for (const group of Array.isArray(groups) ? groups : []) {
    const indexes = normalizeBlockIndexes(group.blockIndexes, blocks.length);
    if (!indexes.length) continue;

    const selectedBlocks = indexes.map((index) => blocks[index]).filter(Boolean);
    if (!selectedBlocks.length) continue;

    const left = textLeft;
    const top = Math.min(...selectedBlocks.map((block) => block.y));
    const right = textRight;
    const bottom = Math.max(...selectedBlocks.map((block) => block.y + block.h));
    const x = Math.max(0, Math.floor(left - 24));
    const y = Math.max(0, Math.floor(top - 20));
    const paddedRight = Math.min(width, Math.ceil(right + 36));
    const paddedBottom = Math.min(height, Math.ceil(bottom + 30));
    const title = String(group.title || selectedBlocks.map((block) => block.text).join(" ").slice(0, 80) || "题目").trim();
    const knowledge = sanitizeKnowledge(group.knowledge);
    const number = String(group.number || "").trim();
    const type = normalizeQuestionType(group.type);

    if (paddedRight <= x || paddedBottom <= y) continue;

    questions.push({
      x,
      y,
      w: paddedRight - x,
      h: paddedBottom - y,
      number,
      questionNumber: number,
      title,
      problemText: title,
      type,
      problemType: type,
      knowledge,
      mainKnowledgePoint: knowledge,
      knowledgePoints: knowledge ? [knowledge] : [],
      confidence: 0.86
    });
  }

  return expandQuestionBoxesToVerticalBands(
    questions.sort((a, b) => a.y - b.y || a.x - b.x),
    blocks,
    width,
    height
  );
}

function expandQuestionBoxesToVerticalBands(questions, blocks, width, height) {
  if (!Array.isArray(questions) || !questions.length || !Array.isArray(blocks) || !blocks.length) return questions || [];
  const maxBlockBottom = Math.max(...blocks.map((block) => block.y + block.h));
  const minBandHeight = Math.max(84, height * 0.075);
  const sorted = questions
    .map((question) => ({ ...question }))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  for (let index = 0; index < sorted.length; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];
    const top = Math.max(0, current.y);
    const contentBottom = Math.max(current.y + current.h, top + minBandHeight);
    const bottom = next
      ? Math.max(contentBottom, next.y - 8)
      : Math.min(height, Math.max(contentBottom, maxBlockBottom + 34));
    current.x = 0;
    current.w = width;
    current.y = top;
    current.h = Math.max(1, Math.min(height, bottom) - top);
  }

  return sorted;
}

function mergeDuplicateQuestionBoxes(questions, width, height) {
  const merged = [];
  const numbered = new Map();

  for (const question of Array.isArray(questions) ? questions : []) {
    const number = String(question.questionNumber || question.number || "").trim();
    if (!number) {
      merged.push({ ...question, x: 0, w: width });
      continue;
    }
    const existing = numbered.get(number);
    if (!existing) {
      const copy = { ...question, x: 0, w: width };
      numbered.set(number, copy);
      merged.push(copy);
      continue;
    }

    const top = Math.min(existing.y, question.y);
    const bottom = Math.max(existing.y + existing.h, question.y + question.h);
    existing.y = Math.max(0, top);
    existing.h = Math.min(height, bottom) - existing.y;
    if (String(question.problemText || question.title || "").length > String(existing.problemText || existing.title || "").length) {
      existing.title = question.title;
      existing.problemText = question.problemText;
      existing.knowledge = question.knowledge;
      existing.mainKnowledgePoint = question.mainKnowledgePoint;
      existing.knowledgePoints = question.knowledgePoints;
    }
  }

  return merged.sort((a, b) => a.y - b.y || a.x - b.x);
}

function looksLikeChoiceText(text) {
  const value = String(text || "").trim();
  return /(^|\s)[A-D]\s*[.．、]/i.test(value) || /[A-D]\s*[.．、].*[A-D]\s*[.．、]/i.test(value);
}

function hasQuestionSentence(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  const chineseCount = (value.match(/[\u4e00-\u9fff]/gu) || []).length;
  const questionWords = /已知|若|如图|求|计算|证明|选择|填写|判断|解答|设|根据|下列|那么|多少|为何|为什么/u;
  return chineseCount >= 8 || (chineseCount >= 2 && questionWords.test(value));
}

function hasQuestionStemEvidence(text) {
  const value = String(text || "").trim();
  if (hasQuestionSentence(value)) return true;
  const chineseCount = (value.match(/[\u4e00-\u9fff]/gu) || []).length;
  const hasMathExpression = /[a-zA-Z0-9]\s*[=<>+\-*/^]|[=<>]\s*[a-zA-Z0-9]|[{}\[\]]/u.test(value);
  const hasMathTopic = /方程|函数|比例|几何|面积|体积|周长|概率|数列|角|圆|三角形|代数式/u.test(value);
  return (chineseCount >= 2 && hasMathExpression) || (chineseCount >= 4 && hasMathTopic);
}

function hasStandaloneMathQuestionStem(text) {
  const compact = String(text || "").replace(/\s+/g, "");
  if (compact.length < 5) return false;
  const variableCount = (compact.match(/[a-zA-Z]/g) || []).length;
  const operatorCount = (compact.match(/[=<>+\-*/:^：]/g) || []).length;
  const digitCount = (compact.match(/\d/g) || []).length;
  return variableCount >= 1 &&
    operatorCount >= 1 &&
    digitCount >= 1 &&
    /[=<>:：]/.test(compact);
}

function isFigureOrTableLabel(text) {
  return /^\s*(?:图|表|步骤|条件|方案)\s*(?:[（(]?\s*(?:\d{1,3}|[①②③④⑤⑥⑦⑧⑨⑩])\s*[）)]?)/u.test(String(text || ""));
}

function isTableOrFigureBlock(block, context = {}) {
  const text = String(block?.text ?? block ?? "").trim();
  if (!text) return false;
  if (isFigureOrTableLabel(text) || /图\s*[①②③④⑤⑥⑦⑧⑨⑩]/u.test(text)) return true;
  if (/^\s*\d{1,3}\s*$/u.test(text)) return true;

  const compact = text.replace(/\s+/g, "");
  const chineseCount = (compact.match(/[\u4e00-\u9fff]/gu) || []).length;
  const mathCount = (compact.match(/[0-9a-zA-Z+\-*/=<>^()[\]{}]/g) || []).length;
  const shortCells = text.split(/\s+/).filter((token) => /^[\d.+\-*/=a-zA-Z]+$/.test(token));
  const formulaLike = /(?:\d+[a-zA-Z]|[a-zA-Z]\s*[+\-*/=]|\d+\s*[+\-*/=]\s*\d+)/.test(text);
  const dataDominated = compact.length > 0 && mathCount / compact.length >= 0.58 && chineseCount < 4;
  const gridLikeText = shortCells.length >= 3 && chineseCount < 4;

  if (formulaLike && chineseCount < 4) return true;
  if (dataDominated || gridLikeText) return true;
  if (context.forceSupporting && !hasQuestionSentence(text)) return true;
  return false;
}

function createQuestionNumberContext(blocks, width = 0, height = 0) {
  const source = Array.isArray(blocks) ? blocks : [];
  const naturalLanguageBlocks = source.filter((block) => {
    const text = String(block.text || "");
    return (text.match(/[\u4e00-\u9fff]/gu) || []).length >= 4 && !isFigureOrTableLabel(text);
  });
  const xValues = (naturalLanguageBlocks.length ? naturalLanguageBlocks : source)
    .map((block) => Number(block.x))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const percentileIndex = Math.min(xValues.length - 1, Math.max(0, Math.floor(xValues.length * 0.12)));
  const pageContentLeft = xValues.length ? xValues[percentileIndex] : 0;
  const inferredWidth = width || Math.max(1, ...source.map((block) => Number(block.x || 0) + Number(block.w || 0)));
  const inferredHeight = height || Math.max(1, ...source.map((block) => Number(block.y || 0) + Number(block.h || 0)));
  return {
    blocks: source,
    width: inferredWidth,
    height: inferredHeight,
    pageContentLeft,
    allowedOffset: Math.max(48, Math.min(inferredWidth * 0.12, 130))
  };
}

function getAdjacentQuestionSentence(block, context = {}) {
  if (!block || !Array.isArray(context.blocks)) return "";
  const centerY = Number(block.y || 0) + Number(block.h || 0) / 2;
  const right = Number(block.x || 0) + Number(block.w || 0);
  return context.blocks
    .filter((candidate) => candidate !== block)
    .filter((candidate) => Number(candidate.x || 0) >= right - Math.max(8, Number(block.h || 0) * 0.5))
    .filter((candidate) => Math.abs(Number(candidate.y || 0) + Number(candidate.h || 0) / 2 - centerY) <= Math.max(12, Number(block.h || 0)))
    .sort((a, b) => Number(a.x || 0) - Number(b.x || 0))[0]?.text || "";
}

function groupOcrBlocksIntoLines(blocks, width = 0, height = 0) {
  const source = (Array.isArray(blocks) ? blocks : [])
    .map((block, index) => ({
      ...block,
      index,
      x: Number(block.x) || 0,
      y: Number(block.y) || 0,
      w: Math.max(1, Number(block.w) || 1),
      h: Math.max(1, Number(block.h) || 1)
    }))
    .filter((block) => String(block.text || "").trim())
    .sort((a, b) => (a.y + a.h / 2) - (b.y + b.h / 2) || a.x - b.x);
  if (!source.length) return [];

  const pageWidth = width || Math.max(...source.map((block) => block.x + block.w));
  const typicalHeight = median(source.map((block) => block.h)) || 18;
  const rows = [];
  for (const block of source) {
    const centerY = block.y + block.h / 2;
    let target = null;
    for (let index = rows.length - 1; index >= Math.max(0, rows.length - 4); index -= 1) {
      const row = rows[index];
      const tolerance = Math.max(4, Math.min(row.averageHeight, block.h) * 0.6);
      if (Math.abs(centerY - row.centerY) <= tolerance) {
        target = row;
        break;
      }
      if (centerY - row.centerY > typicalHeight * 1.2) break;
    }
    if (!target) {
      rows.push({ blocks: [block], centerY, averageHeight: block.h });
      continue;
    }
    target.blocks.push(block);
    target.centerY = target.blocks.reduce((sum, item) => sum + item.y + item.h / 2, 0) / target.blocks.length;
    target.averageHeight = target.blocks.reduce((sum, item) => sum + item.h, 0) / target.blocks.length;
  }

  const maxJoinGap = Math.max(12, pageWidth * 0.05);
  const lines = [];
  for (const row of rows) {
    const ordered = row.blocks.sort((a, b) => a.x - b.x);
    let segment = [];
    const flush = () => {
      if (!segment.length) return;
      const left = Math.min(...segment.map((block) => block.x));
      const top = Math.min(...segment.map((block) => block.y));
      const right = Math.max(...segment.map((block) => block.x + block.w));
      const bottom = Math.max(...segment.map((block) => block.y + block.h));
      lines.push({
        text: segment.map((block) => String(block.text || "").trim()).filter(Boolean).join(" ").replace(/\s+/g, " ").trim(),
        x: left,
        y: top,
        w: right - left,
        h: bottom - top,
        blockIndexes: segment.map((block) => block.index),
        blocks: segment.map((block) => ({ ...block }))
      });
      segment = [];
    };
    for (const block of ordered) {
      const previousRight = segment.length ? Math.max(...segment.map((item) => item.x + item.w)) : block.x;
      if (segment.length && block.x - previousRight > maxJoinGap) flush();
      segment.push(block);
    }
    flush();
  }
  return lines.sort((a, b) => a.y - b.y || a.x - b.x);
}

function mergeDetachedQuestionNumberLines(lines, width = 0) {
  const source = (Array.isArray(lines) ? lines : []).slice().sort((a, b) => a.y - b.y || a.x - b.x);
  if (!source.length) return [];
  const pageWidth = width || Math.max(...source.map((line) => line.x + line.w));
  const consumed = new Set();
  const merged = [];

  for (let index = 0; index < source.length; index += 1) {
    if (consumed.has(index)) continue;
    const line = source[index];
    const markerMatch = /^\s*(?:第\s*)?(\d{1,3})(?:\s*题|[.．、。:：])\s*$/u.exec(String(line.text || ""));
    if (!markerMatch || isSubQuestionNumber(line.text) || isFigureOrTableLabel(line.text)) {
      merged.push(line);
      continue;
    }

    const markerCenter = line.y + line.h / 2;
    const markerRight = line.x + line.w;
    const maxHorizontalGap = Math.max(pageWidth * 0.08, line.h * 3);
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let candidateIndex = 0; candidateIndex < source.length; candidateIndex += 1) {
      if (candidateIndex === index || consumed.has(candidateIndex)) continue;
      const candidate = source[candidateIndex];
      if (candidate.x < markerRight - Math.max(3, line.h * 0.2)) continue;
      const horizontalGap = candidate.x - markerRight;
      if (horizontalGap > maxHorizontalGap) continue;
      const centerDelta = Math.abs(candidate.y + candidate.h / 2 - markerCenter);
      if (centerDelta > Math.max(line.h, candidate.h) * 0.85) continue;
      if (!hasQuestionStemEvidence(candidate.text)) continue;
      const score = centerDelta * 3 + Math.max(0, horizontalGap);
      if (score < bestScore) {
        bestScore = score;
        bestIndex = candidateIndex;
      }
    }

    if (bestIndex < 0) {
      merged.push(line);
      continue;
    }
    const stemLine = source[bestIndex];
    consumed.add(bestIndex);
    const left = Math.min(line.x, stemLine.x);
    const top = Math.min(line.y, stemLine.y);
    const right = Math.max(line.x + line.w, stemLine.x + stemLine.w);
    const bottom = Math.max(line.y + line.h, stemLine.y + stemLine.h);
    const combined = {
      text: `${String(line.text || "").trim()} ${String(stemLine.text || "").trim()}`.replace(/\s+/g, " ").trim(),
      x: left,
      y: top,
      w: right - left,
      h: bottom - top,
      blockIndexes: [...new Set([...(line.blockIndexes || []), ...(stemLine.blockIndexes || [])])],
      blocks: [...(line.blocks || []), ...(stemLine.blocks || [])]
    };
    console.log(`[ocr-line-merge] detached Q${markerMatch[1]} marker joined with stem; gap=${Math.round(stemLine.x - markerRight)}px`);
    merged.push(combined);
  }
  return merged.sort((a, b) => a.y - b.y || a.x - b.x);
}

function explainRejectedAnchor(line, context) {
  const text = String(line?.text || "").trim();
  if (isSubQuestionNumber(text)) return "sub-question marker";
  if (isFigureOrTableLabel(text)) return "figure/table label";
  if (isTableOrFigureBlock(line)) return "table, formula, or numeric data";
  if (Number(line?.x) > Number(context.pageContentLeft) + Number(context.allowedOffset)) return "outside question-number column";
  const match = /^\s*(?:第\s*)?(\d{1,3})(?:\s*题|[.．、。:：])\s*(.*)$/u.exec(text);
  if (!match) return "not a main-question prefix";
  if (!hasQuestionStemEvidence(match[2])) return "missing question stem or formula";
  return "failed strict anchor validation";
}

function extractMainQuestionAnchors(ocrLines, width = 0, height = 0) {
  const lines = (Array.isArray(ocrLines) ? ocrLines : []).slice().sort((a, b) => a.y - b.y || a.x - b.x);
  const context = createQuestionNumberContext(lines, width, height);
  const anchors = [];
  for (const line of lines) {
    const text = String(line.text || "").trim();
    const looseMatch = /^\s*(?:第\s*)?(\d{1,3})(?:\s*题|[.．、。:：])/u.exec(text);
    const startInfo = getQuestionNumberStartInfo(text, line, context);
    if (!startInfo) {
      if (looseMatch) {
        const reason = explainRejectedAnchor(line, context);
        console.log(`[anchor] Q${looseMatch[1]} found=false reason=${reason}`);
        line.blocks?.forEach((block) => {
          console.log(`[anchor-debug] raw text="${String(block.text || "").slice(0, 80)}" x=${Math.round(block.x)} y=${Math.round(block.y)}`);
        });
        console.log(`[anchor-debug] grouped text="${text.slice(0, 120)}" x=${Math.round(line.x)} y=${Math.round(line.y)}`);
      }
      continue;
    }
    console.log(`[ocr-line] text="${text.slice(0, 120)}" y=${Math.round(line.y)}`);
    console.log(`[anchor] Q${startInfo.number} found=true`);
    anchors.push({
      questionNumber: startInfo.number,
      sourceQuestionNumber: startInfo.number,
      top: line.y,
      startY: line.y,
      left: line.x,
      text,
      line,
      startInfo
    });
  }

  const byNumber = new Map();
  anchors.forEach((anchor) => {
    const existing = byNumber.get(anchor.sourceQuestionNumber);
    if (!existing || anchor.startY < existing.startY) byNumber.set(anchor.sourceQuestionNumber, anchor);
  });
  return [...byNumber.values()].sort((a, b) => a.startY - b.startY || a.left - b.left);
}

function recoverNumberMarkerAnchors(ocrLines, anchors, visionQuestions, width = 0, height = 0) {
  const lines = (Array.isArray(ocrLines) ? ocrLines : []).slice().sort((a, b) => a.y - b.y || a.x - b.x);
  const result = (Array.isArray(anchors) ? anchors : []).slice();
  const existingNumbers = new Set(result.map((anchor) => String(anchor.sourceQuestionNumber)));
  const visionByNumber = new Map(
    (Array.isArray(visionQuestions) ? visionQuestions : [])
      .map((question) => [normalizeSourceQuestionNumber(question.questionNumber), question])
      .filter(([number]) => number)
  );
  const context = createQuestionNumberContext(lines, width, height);
  const markerPattern = /^\s*(?:\u7b2c\s*)?(\d{1,3})(?:\s*\u9898|[.\uFF0E\u3001])(?:\s*(.*))?$/u;

  for (const line of lines) {
    const text = String(line.text || "").trim();
    const match = markerPattern.exec(text);
    if (!match || isSubQuestionNumber(text) || isFigureOrTableLabel(text)) continue;
    const number = String(Number(match[1]));
    if (existingNumbers.has(number) || !visionByNumber.has(number)) continue;
    if (Number(line.x) > Number(context.pageContentLeft) + Number(context.allowedOffset || 0)) continue;

    const visionQuestion = visionByNumber.get(number);
    const ocrBodyText = String(match[2] || "").trim();
    const visionBodyText = String(visionQuestion?.summary || "").trim();
    const bodyText = ocrBodyText || visionBodyText;
    const evidenceSource = ocrBodyText
      ? "ocr-explicit-prefix+existing-vision-result"
      : "ocr-number-marker+existing-vision-result";
    result.push({
      questionNumber: number,
      sourceQuestionNumber: number,
      top: line.y,
      startY: line.y,
      left: line.x,
      text: ocrBodyText ? text : (bodyText ? `${text} ${bodyText}` : text),
      line,
      startInfo: {
        number,
        kind: "explicit-marker-with-vision-evidence",
        matchIndex: Math.max(0, text.indexOf(match[1])),
        textLength: Math.max(1, text.length),
        bodyText
      },
      evidenceSource
    });
    existingNumbers.add(number);
    console.log(`[anchor] Q${number} found=true evidence=${evidenceSource} y=${Math.round(line.y)}`);
  }

  return result.sort((a, b) => a.startY - b.startY || a.left - b.left);
}

function parseExplicitQuestionMarker(text, { allowBareNumber = false } = {}) {
  const value = String(text || "").normalize("NFKC").trim();
  if (!value || isSubQuestionNumber(value) || isFigureOrTableLabel(value)) return null;
  if (/^\s*(?:图|表|步骤|条件|方案)\s*\d/iu.test(value)) return null;
  const explicitMatch = /^\s*(?:第\s*)?(\d{1,3})(?:\s*题|[.、。:：])\s*(.*)$/u.exec(value);
  const bareMatch = allowBareNumber ? /^\s*(\d{1,3})\s*$/u.exec(value) : null;
  const match = explicitMatch || bareMatch;
  if (!match) return null;
  const number = Number(match[1]);
  if (!Number.isInteger(number) || number <= 0 || number > 200) return null;
  return {
    number: String(number),
    bodyText: String(match[2] || "").trim(),
    hasExplicitPunctuation: Boolean(explicitMatch)
  };
}

function hasRecoverableQuestionBody(text) {
  const value = String(text || "").normalize("NFKC").trim();
  if (!value || isSubQuestionNumber(value) || isFigureOrTableLabel(value)) return false;
  if (/^\s*[A-DＡ-Ｄ]\s*[.．、:：)]/iu.test(value)) return false;
  if (hasQuestionStemEvidence(value) || hasStandaloneMathQuestionStem(value)) return true;
  const chineseCount = (value.match(/[\u4e00-\u9fff]/gu) || []).length;
  return chineseCount >= 2 && value.length >= 4;
}

function collectExplicitQuestionMarkerCandidates(ocrLines, width = 0, height = 0) {
  const lines = (Array.isArray(ocrLines) ? ocrLines : [])
    .slice()
    .sort((a, b) => Number(a.y || 0) - Number(b.y || 0) || Number(a.x || 0) - Number(b.x || 0));
  if (!lines.length) return [];
  const context = createQuestionNumberContext(lines, width, height);
  const pageWidth = width || context.width || Math.max(...lines.map((line) => Number(line.x || 0) + Number(line.w || 0)));
  const segments = [
    ...lines.map((line) => ({ ...line, parentLine: line, segmentKind: "line" })),
    ...lines.flatMap((line) => (line.blocks || []).map((block) => ({
      ...block,
      parentLine: line,
      segmentKind: "raw-block"
    })))
  ];
  const candidates = [];

  for (const segment of segments) {
    const text = String(segment.text || "").trim();
    const parsed = parseExplicitQuestionMarker(text, { allowBareNumber: true });
    if (!parsed) continue;
    const x = Number(segment.x || 0);
    const y = Number(segment.y || 0);
    const w = Math.max(1, Number(segment.w || 1));
    const h = Math.max(1, Number(segment.h || 1));
    if (x > Number(context.pageContentLeft) + Math.max(Number(context.allowedOffset || 0), pageWidth * 0.02)) {
      continue;
    }

    const centerY = y + h / 2;
    const right = x + w;
    const sameRowCompanion = segments
      .filter((candidate) => candidate !== segment && candidate.parentLine !== segment.parentLine)
      .filter((candidate) => Number(candidate.x || 0) >= right - Math.max(4, h * 0.4))
      .filter((candidate) => {
        const candidateCenter = Number(candidate.y || 0) + Number(candidate.h || 0) / 2;
        return Math.abs(candidateCenter - centerY) <= Math.max(h, Number(candidate.h || 0)) * 0.95;
      })
      .filter((candidate) => Number(candidate.x || 0) - right <= Math.max(pageWidth * 0.1, h * 5))
      .filter((candidate) => hasRecoverableQuestionBody(candidate.text))
      .sort((a, b) => Number(a.x || 0) - Number(b.x || 0))[0];
    const parentParsed = segment.parentLine && segment.parentLine !== segment
      ? parseExplicitQuestionMarker(segment.parentLine.text)
      : null;
    const nearbyStem = lines
      .filter((line) => line !== segment.parentLine)
      .filter((line) => Number(line.y || 0) >= y - h * 0.3)
      .filter((line) => Number(line.y || 0) - y <= Math.max(height * 0.055, h * 4))
      .filter((line) => Number(line.x || 0) <= x + Math.max(pageWidth * 0.12, h * 6))
      .filter((line) => !parseExplicitQuestionMarker(line.text, { allowBareNumber: true }))
      .find((line) => hasRecoverableQuestionBody(line.text));
    const bodyText =
      parsed.bodyText ||
      String(parentParsed?.bodyText || "").trim() ||
      String(sameRowCompanion?.text || "").trim() ||
      String(nearbyStem?.text || "").trim();
    const hasBodyEvidence = hasRecoverableQuestionBody(bodyText);

    // A bare number is accepted only as an OCR punctuation-loss candidate when
    // the same row still contains clear question text.
    if (!parsed.hasExplicitPunctuation && !sameRowCompanion && !parentParsed?.hasExplicitPunctuation) {
      continue;
    }
    candidates.push({
      number: parsed.number,
      text,
      bodyText,
      hasBodyEvidence,
      hasExplicitPunctuation: parsed.hasExplicitPunctuation || Boolean(parentParsed?.hasExplicitPunctuation),
      x,
      y,
      w,
      h,
      line: segment.parentLine || segment,
      segmentKind: segment.segmentKind
    });
  }

  const deduped = [];
  candidates
    .sort((a, b) => a.y - b.y || a.x - b.x || Number(b.hasBodyEvidence) - Number(a.hasBodyEvidence))
    .forEach((candidate) => {
      const existing = deduped.find((item) =>
        item.number === candidate.number &&
        Math.abs(item.y - candidate.y) <= Math.max(item.h, candidate.h)
      );
      if (!existing) {
        deduped.push(candidate);
      } else if ((!existing.hasBodyEvidence && candidate.hasBodyEvidence) || candidate.text.length > existing.text.length) {
        Object.assign(existing, candidate);
      }
    });
  return deduped;
}

function recoverSequentialExplicitQuestionAnchors(ocrLines, anchors, width = 0, height = 0) {
  const result = (Array.isArray(anchors) ? anchors : [])
    .slice()
    .sort((a, b) => Number(a.startY ?? a.top) - Number(b.startY ?? b.top));
  const candidates = collectExplicitQuestionMarkerCandidates(ocrLines, width, height);
  const existingNumbers = new Set(result.map((anchor) => String(anchor.sourceQuestionNumber)));
  let changed = true;

  while (changed) {
    changed = false;
    for (const candidate of candidates) {
      if (existingNumbers.has(candidate.number)) continue;
      const previous = result
        .filter((anchor) => Number(anchor.startY ?? anchor.top) < candidate.y)
        .sort((a, b) => Number(b.startY ?? b.top) - Number(a.startY ?? a.top))[0];
      if (!previous) continue;
      const previousNumber = Number(previous.sourceQuestionNumber);
      const candidateNumber = Number(candidate.number);
      if (!Number.isInteger(previousNumber) || candidateNumber !== previousNumber + 1) continue;
      const previousLeft = Number(previous.left ?? previous.line?.x ?? 0);
      if (Math.abs(candidate.x - previousLeft) > Math.max(90, width * 0.1)) continue;

      const followingCandidate = candidates.find((item) =>
        item.y > candidate.y &&
        Number(item.number) === candidateNumber + 1
      );
      const hasSequentialMarkerEvidence = Boolean(followingCandidate);
      if (!candidate.hasBodyEvidence && !hasSequentialMarkerEvidence) continue;

      const bodyText = candidate.bodyText || candidate.text;
      result.push({
        questionNumber: candidate.number,
        sourceQuestionNumber: candidate.number,
        top: candidate.y,
        startY: candidate.y,
        left: candidate.x,
        text: candidate.bodyText
          ? `${candidate.number}. ${candidate.bodyText}`.trim()
          : candidate.text,
        line: candidate.line,
        startInfo: {
          number: candidate.number,
          kind: "sequential-explicit-marker-recovery",
          matchIndex: 0,
          textLength: Math.max(1, candidate.text.length),
          bodyText
        },
        evidenceSource: candidate.hasExplicitPunctuation
          ? "ocr-explicit-marker+sequential-number"
          : "ocr-punctuation-loss+sequential-number"
      });
      existingNumbers.add(candidate.number);
      result.sort((a, b) => Number(a.startY ?? a.top) - Number(b.startY ?? b.top));
      changed = true;
      console.log(
        `[anchor-recovery] Q${candidate.number} found=true evidence=explicit-marker+sequential-number ` +
        `after=Q${previousNumber} y=${Math.round(candidate.y)}`
      );
    }
  }
  return result;
}

function findUnresolvedSequentialMarkerCandidates(ocrLines, anchors, width = 0, height = 0) {
  const orderedAnchors = (Array.isArray(anchors) ? anchors : [])
    .slice()
    .sort((a, b) => Number(a.startY ?? a.top) - Number(b.startY ?? b.top));
  const existingNumbers = new Set(orderedAnchors.map((anchor) => String(anchor.sourceQuestionNumber)));
  const candidates = collectExplicitQuestionMarkerCandidates(ocrLines, width, height);
  return candidates.filter((candidate) => {
    if (existingNumbers.has(candidate.number)) return false;
    const previous = orderedAnchors
      .filter((anchor) => Number(anchor.startY ?? anchor.top) < candidate.y)
      .sort((a, b) => Number(b.startY ?? b.top) - Number(a.startY ?? a.top))[0];
    if (!previous) return false;
    return Number(candidate.number) === Number(previous.sourceQuestionNumber) + 1;
  });
}

function recoverLeadingMalformedQuestionAnchor(ocrLines, anchors, width = 0, height = 0) {
  const lines = (Array.isArray(ocrLines) ? ocrLines : []).slice().sort((a, b) => a.y - b.y || a.x - b.x);
  const result = (Array.isArray(anchors) ? anchors : []).slice().sort((a, b) => a.startY - b.startY);
  const firstAnchor = result[0];
  const secondAnchor = result[1];
  const firstNumber = Number(firstAnchor?.sourceQuestionNumber);
  const secondNumber = Number(secondAnchor?.sourceQuestionNumber);
  if (
    !Number.isInteger(firstNumber) ||
    !Number.isInteger(secondNumber) ||
    firstNumber <= 1 ||
    secondNumber !== firstNumber + 1
  ) {
    return result;
  }

  const expectedNumber = String(firstNumber - 1);
  const firstTop = Number(firstAnchor.startY ?? firstAnchor.top);
  const context = createQuestionNumberContext(lines, width, height);
  const candidate = lines
    .filter((line) => Number(line.y) < firstTop - Math.max(8, Number(line.h || 0) * 0.35))
    .filter((line) => Number(line.x) <= Number(context.pageContentLeft) + Number(context.allowedOffset || 0))
    .map((line) => {
      const text = String(line.text || "").trim();
      const match = /^\s*(?:第\s*)?(\d{1,5})(?:\s*题|[.．、。:：])\s*(.*)$/u.exec(text);
      if (!match || isSubQuestionNumber(text) || isFigureOrTableLabel(text)) return null;
      const rawNumber = String(match[1]);
      const bodyText = String(match[2] || "").trim();
      const exactExpected = rawNumber === expectedNumber;
      const gluedExpected =
        rawNumber.length > expectedNumber.length &&
        rawNumber.length <= expectedNumber.length + 2 &&
        rawNumber.startsWith(expectedNumber);
      if (!exactExpected && !gluedExpected) return null;
      const chineseCount = (bodyText.match(/[\u4e00-\u9fff]/gu) || []).length;
      if (!hasQuestionStemEvidence(bodyText) && chineseCount < 4 && bodyText.length < 8) return null;
      return { line, text, bodyText, rawNumber, exactExpected, gluedExpected };
    })
    .filter(Boolean)
    .sort((left, right) => Number(right.line.y) - Number(left.line.y))[0];

  if (!candidate) return result;
  const evidenceSource = candidate.gluedExpected
    ? "ocr-leading-number-glue-correction"
    : "ocr-leading-sequence-recovery";
  result.push({
    questionNumber: expectedNumber,
    sourceQuestionNumber: expectedNumber,
    top: candidate.line.y,
    startY: candidate.line.y,
    left: candidate.line.x,
    text: candidate.text.replace(
      new RegExp(`^\\s*(?:第\\s*)?${candidate.rawNumber}`),
      expectedNumber
    ),
    line: candidate.line,
    startInfo: {
      number: expectedNumber,
      kind: "recovered-leading-marker",
      matchIndex: 0,
      textLength: Math.max(1, candidate.text.length),
      bodyText: candidate.bodyText
    },
    evidenceSource
  });
  console.log(
    `[anchor-recovery] raw="${candidate.rawNumber}" corrected=Q${expectedNumber} ` +
    `before=Q${firstNumber} evidence=${evidenceSource} y=${Math.round(candidate.line.y)}`
  );
  return result.sort((a, b) => a.startY - b.startY || a.left - b.left);
}

function recoverDiscontinuousQuestionAnchors(ocrLines, anchors, visionQuestions, width = 0, height = 0) {
  const lines = (Array.isArray(ocrLines) ? ocrLines : []).slice().sort((a, b) => a.y - b.y || a.x - b.x);
  const result = (Array.isArray(anchors) ? anchors : []).slice().sort((a, b) => a.startY - b.startY);
  const existingNumbers = new Set(result.map((anchor) => String(anchor.sourceQuestionNumber)));
  const numberContext = createQuestionNumberContext(lines, width, height);
  const usedLocalStemLines = new Set();
  const visionRegions = normalizeVisualQuestionRegions(visionQuestions, width, height);
  const candidatesByNumber = new Map();
  visionRegions.forEach((candidate) => {
    const number = String(candidate.sourceQuestionNumber || "");
    if (!number) return;
    if (!candidatesByNumber.has(number)) candidatesByNumber.set(number, []);
    candidatesByNumber.get(number).push(candidate);
  });

  const originalAnchors = result.slice();
  for (let index = 0; index < originalAnchors.length - 1; index += 1) {
    const previousAnchor = originalAnchors[index];
    const nextAnchor = originalAnchors[index + 1];
    const previousNumber = Number(previousAnchor.sourceQuestionNumber);
    const nextNumber = Number(nextAnchor.sourceQuestionNumber);
    if (!Number.isInteger(previousNumber) || !Number.isInteger(nextNumber) || nextNumber <= previousNumber + 1) continue;

    const gapTop = Number(previousAnchor.startY);
    const gapBottom = Number(nextAnchor.startY);
    console.log(`[sequence-review] gap Q${previousNumber}->Q${nextNumber} y=[${Math.round(gapTop)},${Math.round(gapBottom)})`);
    for (let number = previousNumber + 1; number < nextNumber; number += 1) {
      const normalizedNumber = String(number);
      if (existingNumbers.has(normalizedNumber)) continue;
      const visionCandidates = (candidatesByNumber.get(normalizedNumber) || [])
        .filter((candidate) => candidate.box.y >= gapTop && candidate.box.y < gapBottom)
        .sort((a, b) => a.box.y - b.box.y);
      let recovered = null;

      for (const candidate of visionCandidates) {
        const candidateTop = Math.max(gapTop, candidate.box.y);
        const candidateBottom = Math.min(gapBottom, candidate.box.y + candidate.box.h);
        const linesInside = lines.filter((line) => {
          const centerY = Number(line.y) + Number(line.h) / 2;
          return centerY >= candidateTop && centerY < candidateBottom;
        });
        const explicitPrefix = linesInside.find((line) => {
          const match = /^\s*(?:第\s*)?(\d{1,3})(?:\s*题|[.．、。:：])/u.exec(String(line.text || ""));
          return match && Number(match[1]) === number && !isSubQuestionNumber(line.text) && !isFigureOrTableLabel(line.text);
        });
        const combinedText = [candidate.summary, ...linesInside.map((line) => line.text)].filter(Boolean).join(" ");
        const hasVisualStructureEvidence = candidate.rawModelBoxes.length > 0 &&
          candidate.box.h >= Math.max(1, height * 0.015) &&
          hasQuestionStemEvidence(candidate.summary);
        const hasContentEvidence = hasQuestionStemEvidence(candidate.summary) ||
          linesInside.some((line) => hasQuestionStemEvidence(line.text)) ||
          hasQuestionStemEvidence(combinedText);
        if (!explicitPrefix && !hasContentEvidence && !hasVisualStructureEvidence) continue;
        if (!linesInside.length && !hasVisualStructureEvidence) continue;

        const top = explicitPrefix ? Number(explicitPrefix.y) : Number(candidate.box.y);
        const line = explicitPrefix || {
          text: String(candidate.summary || combinedText).trim(),
          x: candidate.box.x,
          y: top,
          w: candidate.box.w,
          h: Math.max(1, Math.min(candidate.box.h, median(linesInside.map((item) => item.h)) || 18)),
          blockIndexes: [...new Set(linesInside.flatMap((item) => item.blockIndexes || []))],
          blocks: linesInside.flatMap((item) => item.blocks || [])
        };
        recovered = {
          questionNumber: normalizedNumber,
          sourceQuestionNumber: normalizedNumber,
          top,
          startY: top,
          left: Number(line.x) || candidate.box.x,
          text: String(line.text || candidate.summary || "").trim(),
          line,
          startInfo: {
            number: normalizedNumber,
            kind: "sequence-gap-review",
            matchIndex: 0,
            textLength: Math.max(1, String(line.text || "").length),
            bodyText: String(candidate.summary || "").trim()
          },
          evidenceSource: explicitPrefix
            ? "sequence-gap-review+ocr-prefix+vision"
            : linesInside.length
              ? "sequence-gap-review+ocr-content+vision"
              : "sequence-gap-review+vision-structure"
        };
        break;
      }

      if (!recovered) {
        const localStemLine = lines.find((line) => {
          if (usedLocalStemLines.has(line)) return false;
          const centerY = Number(line.y) + Number(line.h) / 2;
          if (centerY <= gapTop + Math.max(4, Number(line.h) * 0.5) || centerY >= gapBottom) return false;
          if (Number(line.x) > numberContext.pageContentLeft + numberContext.allowedOffset) return false;
          const text = String(line.text || "").trim();
          if (!hasQuestionSentence(text) || looksLikeChoiceText(text) || isTableOrFigureBlock(line)) return false;
          if (isSubQuestionNumber(text) || isFigureOrTableLabel(text)) return false;
          return !getQuestionNumberStartInfo(text, line, numberContext);
        });
        if (localStemLine) {
          usedLocalStemLines.add(localStemLine);
          const syntheticText = `${normalizedNumber}. ${String(localStemLine.text || "").trim()}`;
          recovered = {
            questionNumber: normalizedNumber,
            sourceQuestionNumber: normalizedNumber,
            top: Number(localStemLine.y),
            startY: Number(localStemLine.y),
            left: Number(localStemLine.x) || 0,
            text: syntheticText,
            line: { ...localStemLine, text: syntheticText },
            startInfo: {
              number: normalizedNumber,
              kind: "sequence-gap-local-ocr-stem",
              matchIndex: 0,
              textLength: syntheticText.length,
              bodyText: String(localStemLine.text || "").trim()
            },
            evidenceSource: "sequence-gap-review+local-ocr-stem"
          };
        }
      }

      if (recovered) {
        result.push(recovered);
        existingNumbers.add(normalizedNumber);
        console.log(
          `[sequence-review] recovered Q${normalizedNumber} y=${Math.round(recovered.startY)} evidence=${recovered.evidenceSource}`
        );
      } else {
        console.log(`[sequence-review] keep gap; Q${normalizedNumber} has insufficient existing evidence`);
      }
    }
  }

  const sortedResult = result.sort((a, b) => a.startY - b.startY || a.left - b.left);
  sortedResult.forEach((anchor) => {
    delete anchor.unresolvedFollowingNumbers;
    delete anchor.preserveUnresolvedUntilNextAnchor;
  });
  for (let index = 0; index < sortedResult.length - 1; index += 1) {
    const current = sortedResult[index];
    const next = sortedResult[index + 1];
    const currentNumber = Number(current.sourceQuestionNumber);
    const nextNumber = Number(next.sourceQuestionNumber);
    if (!Number.isInteger(currentNumber) || !Number.isInteger(nextNumber) || nextNumber <= currentNumber + 1) continue;

    const unresolvedFollowingNumbers = [];
    for (let number = currentNumber + 1; number < nextNumber; number += 1) {
      unresolvedFollowingNumbers.push(String(number));
    }
    current.unresolvedFollowingNumbers = unresolvedFollowingNumbers;
    current.preserveUnresolvedUntilNextAnchor = true;
    console.log(
      `[sequence-review] unresolved=[${unresolvedFollowingNumbers.join(",")}] merged into Q${current.sourceQuestionNumber} until Q${next.sourceQuestionNumber} boundary`
    );
  }

  return sortedResult;
}

function isLikelyQuestionStartCandidate(candidate, textLeft, textRight, pageHeight) {
  const text = String(candidate?.block?.text || "").trim();
  if (!candidate?.number || !text || !candidate.startInfo) return false;
  if (isTableOrFigureBlock(candidate.block)) return false;
  if (looksLikeChoiceText(text)) return false;
  if (/^\d{1,3}\s*[.．]\s*\d/u.test(text)) return false;
  if (/^[A-D]\s*[.．、]/i.test(text) && candidate.startInfo?.kind !== "embedded") return false;
  if (/^\d{1,3}\s*[)）]\s*$/u.test(text)) return false;

  const number = Number(candidate.number);
  if (!Number.isInteger(number) || number <= 0 || number > 200) return false;

  const textWidth = Math.max(1, textRight - textLeft);
  const xRatio = (candidate.x - textLeft) / textWidth;
  if (xRatio > 0.38) return false;

  const yRatio = candidate.y / Math.max(1, pageHeight);
  if (yRatio < 0.015 && text.length < 8) return false;

  return true;
}

function isSubQuestionNumber(text) {
  return /^\s*(?:[\uFF08(]\s*(?:\d{1,2}|[\u2160-\u216B]|[ivx]{1,5})\s*[\uFF09)]|\d{1,2}\s*[\uFF09)]|[\u2460-\u2469])/iu.test(String(text || ""));
}

function extractSubQuestionNumber(text) {
  const value = String(text || "").trim();
  if (!isSubQuestionNumber(value)) return "";
  const numeric = value.match(/\d{1,2}/);
  if (numeric) return numeric[0];
  const circled = value.match(/[\u2460-\u2469]/u);
  if (circled) return String(circled[0].codePointAt(0) - 0x245f);
  const roman = value.match(/[\u2160-\u216B]|[ivx]{1,5}/iu);
  return roman ? roman[0].toUpperCase() : "";
}

function isMainQuestionNumber(text, block = null, context = {}) {
  return Boolean(getQuestionNumberStartInfo(text, block, context));
}

function extractMainQuestionNumber(text, block = null, context = {}) {
  return getQuestionNumberStartInfo(text, block, context)?.number || "";
}

function getQuestionNumberStartInfo(text, block = null, context = {}) {
  const value = String(text || "").trim();
  if (!value || isSubQuestionNumber(value) || isFigureOrTableLabel(value)) return null;
  const match = /^\s*(?:第\s*)?(\d{1,3})(?:\s*题|[.．、。:：])\s*(.*)$/u.exec(value);
  if (!match) return null;
  const number = Number(match[1]);
  if (!Number.isInteger(number) || number <= 0 || number > 200) return null;

  if (block && Number.isFinite(context.pageContentLeft)) {
    const blockX = Number(block.x);
    if (!Number.isFinite(blockX) || blockX > context.pageContentLeft + Number(context.allowedOffset || 0)) return null;
  }
  const bodyText = String(match[2] || "").trim() || getAdjacentQuestionSentence(block, context);
  const shortStemChineseCount = (bodyText.match(/[\u4e00-\u9fff]/gu) || []).length;
  const hasShortExplicitStem = shortStemChineseCount >= 3 && bodyText.length >= 4;
  const hasMathStem = hasStandaloneMathQuestionStem(bodyText);
  if (!hasQuestionStemEvidence(bodyText) && !hasShortExplicitStem && !hasMathStem) return null;
  if (isTableOrFigureBlock({ ...(block || {}), text: value }) && !hasMathStem) return null;
  return {
    number: String(number),
    kind: "explicit",
    matchIndex: Math.max(0, match[0].indexOf(match[1])),
    textLength: Math.max(1, value.length),
    bodyText
  };
}

function detectQuestionNumberStart(text, block = null, context = {}) {
  return getQuestionNumberStartInfo(text, block, context)?.number || "";
}

function recoverLeadingQuestionStart(blocks, starts, leftBand, pageHeight) {
  const firstStart = starts[0];
  if (!firstStart || !Number.isInteger(Number(firstStart.number))) return null;
  const expectedNumber = Number(firstStart.number) - 1;
  if (expectedNumber <= 0) return null;

  // Only infer a missing leading question when the recognised starts themselves
  // are consecutive. This keeps an exam heading from being misread as a question.
  const nextStart = starts[1];
  if (!nextStart || Number(nextStart.number) !== Number(firstStart.number) + 1) return null;

  const leadingBlocks = blocks.filter((block) => block.y + block.h / 2 < firstStart.y - 18);
  const leadingText = leadingBlocks.map((block) => String(block.text || "")).join(" ").trim();
  const leadingTop = leadingBlocks.length ? Math.min(...leadingBlocks.map((block) => block.y)) : 0;
  const leadingBottom = leadingBlocks.length ? Math.max(...leadingBlocks.map((block) => block.y + block.h)) : 0;
  const hasSubstantiveLeadingContent =
    leadingBlocks.length >= 2 &&
    (leadingBottom - leadingTop >= 60 || leadingText.length >= 80);
  if (!hasSubstantiveLeadingContent) {
    const hasVisibleLeadingRegion = firstStart.y >= Math.max(64, pageHeight * 0.06);
    if (!hasVisibleLeadingRegion) return null;
    return {
      index: -1,
      number: expectedNumber,
      x: 0,
      y: 0,
      block: null,
      inferredFromLeadingRegion: true
    };
  }

  const leadingCandidates = leadingBlocks
    .map((block, index) => {
      const text = String(block.text || "").trim();
      const looseMatch = text.match(/^(\d{1,3})(?:\s|[.．、])/);
      return {
        index,
        number: looseMatch ? Number(looseMatch[1]) : 0,
        x: block.x,
        y: block.y,
        block
      };
    })
    .filter(
      (candidate) =>
        candidate.number === expectedNumber &&
        candidate.x <= leftBand
    )
    .sort((a, b) => b.y - a.y || a.x - b.x);

  if (leadingCandidates[0]) return leadingCandidates[0];

  // OCR can miss the printed question number while still recognising its body.
  // The region above a consecutive pair such as 25/26 is then kept as question 24.
  return {
    index: -1,
    number: expectedNumber,
    x: Math.min(...leadingBlocks.map((block) => block.x)),
    y: leadingTop,
    block: leadingBlocks[0],
    inferredFromLeadingContent: true
  };
}

function inferKnowledgeFromText(text) {
  const value = String(text || "");
  if (/比例|比值|比例式|成比例/.test(value)) return "比例与比例式";
  if (/圆|圆心角|圆周角|扇形|弧长|周长/.test(value)) return "圆的相关计算";
  if (/函数|一次函数|二次函数|反比例函数|坐标|图象/.test(value)) return "函数图象";
  if (/方程|未知数|解方程|方程组/.test(value)) return "方程思想";
  if (/几何|三角形|平行|垂直|相似|全等/.test(value)) return "几何推理";
  if (/统计|概率|平均数|中位数|众数/.test(value)) return "统计与概率";
  if (/表格|规律|方案|费用|利润|工程|速度|路程/.test(value)) return "综合应用";
  return "";
}

function dedupeQuestionStarts(candidates) {
  const byNumber = new Map();
  for (const candidate of candidates) {
    const number = String(candidate.number || "");
    if (!number) continue;
    if (!byNumber.has(number)) byNumber.set(number, []);
    byNumber.get(number).push(candidate);
  }

  return [...byNumber.values()]
    .map((matches) => {
      const explicit = matches.filter((candidate) => candidate.startInfo?.kind === "explicit");
      const preferred = explicit.length ? explicit : matches.filter((candidate) => candidate.startInfo?.kind !== "embedded");
      return (preferred.length ? preferred : matches).sort((a, b) => a.y - b.y || a.x - b.x)[0];
    })
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

function estimateQuestionMarkerY(block, startInfo) {
  if (!block || !startInfo) return Number(block?.y) || 0;
  if (startInfo.kind !== "embedded" || startInfo.matchIndex <= 0) return block.y;
  const relativeOffset = Math.min(0.88, Math.max(0.2, startInfo.matchIndex / startInfo.textLength));
  return block.y + block.h * relativeOffset;
}

function attachFigureCaptionContext(starts, captionCandidates, blocks, pageHeight) {
  if (!starts.length || !captionCandidates.length) return starts;
  const typicalLineHeight = median(blocks.map((block) => block.h)) || 18;
  const figureLookback = Math.max(72, Math.min(pageHeight * 0.13, typicalLineHeight * 5.5));

  return starts.map((start) => {
    const caption = captionCandidates
      .filter((candidate) => candidate.number === start.number && candidate.y < start.y)
      .sort((a, b) => b.y - a.y)[0];
    if (!caption || start.y - caption.y > pageHeight * 0.28) return start;
    return {
      ...start,
      figureContextTop: Math.max(0, caption.y - figureLookback)
    };
  });
}

function buildQuestionBoxesByNumberStarts(blocks, width, height) {
  if (!Array.isArray(blocks) || blocks.length < 2) return [];

  const numberingContext = createQuestionNumberContext(blocks, width, height);
  const textLeft = Math.min(...blocks.map((block) => block.x));
  const textRight = Math.max(...blocks.map((block) => block.x + block.w));
  const textTop = Math.min(...blocks.map((block) => block.y));
  const textBottom = Math.max(...blocks.map((block) => block.y + block.h));
  const leftBand = textLeft + Math.max(90, (textRight - textLeft) * 0.22);
  const allCandidates = blocks
    .map((block, index) => {
      const startInfo = getQuestionNumberStartInfo(block.text, block, numberingContext);
      return {
        index,
        number: startInfo?.number || "",
        x: block.x,
        y: estimateQuestionMarkerY(block, startInfo),
        block,
        startInfo
      };
    })
    .filter((candidate) => candidate.number && candidate.x <= leftBand);
  const captionCandidates = allCandidates.filter((candidate) => candidate.startInfo?.kind === "caption");
  const candidates = allCandidates
    .filter((candidate) => candidate.startInfo?.kind !== "caption")
    .filter((candidate) => isLikelyQuestionStartCandidate(candidate, textLeft, textRight, height));

  let starts = dedupeQuestionStarts(candidates);
  starts = attachFigureCaptionContext(starts, captionCandidates, blocks, height);
  if (starts.length < 2) return [];

  console.log(
    `[segment] question-number starts: ${starts
      .map((start) => `${start.number}@${Math.round(start.x)},${Math.round(start.y)}`)
      .join(", ")}`
  );

  const questions = [];
  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index];
    const next = starts[index + 1];
    const startY = Math.max(0, Math.min(start.y - 16, start.figureContextTop ?? start.y - 16));
    const contentStartY = Math.max(0, start.y - 4);
    const endY = next ? Math.max(contentStartY + 24, next.y - 3) : Math.min(height, textBottom + 34);
    const selectedBlocks = blocks.filter((block) => {
      const centerY = block.y + block.h / 2;
      return centerY >= contentStartY && centerY < endY;
    });
    if (!selectedBlocks.length) {
      if (!start.inferredFromLeadingRegion) continue;
      const x = 0;
      const y = Math.max(0, Math.floor(startY));
      const paddedBottom = Math.min(height, Math.ceil(endY));
      if (paddedBottom <= y) continue;
      questions.push({
        x,
        y,
        w: width,
        h: paddedBottom - y,
        number: start.number,
        questionNumber: start.number,
        title: `第 ${start.number} 题`,
        problemText: `第 ${start.number} 题`,
        type: "未知",
        problemType: "未知",
        knowledge: "",
        mainKnowledgePoint: "",
        knowledgePoints: [],
        confidence: 0.25,
        generatedBy: "leading-page-region-fallback"
      });
      continue;
    }

    const top = Math.min(...selectedBlocks.map((block) => block.y));
    const bottom = Math.max(...selectedBlocks.map((block) => block.y + block.h));
    const x = 0;
    const y = Math.max(0, Math.floor(Math.min(top, startY) - 18));
    const paddedRight = width;
    const boundaryOverlap = Math.max(7, Math.min(14, median(selectedBlocks.map((block) => block.h)) * 0.4));
    const paddedBottom = next
      ? Math.min(height, Math.ceil(next.y + boundaryOverlap))
      : Math.min(height, Math.ceil(Math.max(bottom + 28, endY + boundaryOverlap)));
    if (paddedRight <= x || paddedBottom <= y) continue;

    const embeddedQuestionText =
      start.startInfo?.kind === "embedded"
        ? String(start.block?.text || "").slice(start.startInfo.matchIndex).trim()
        : "";
    const mergedText = [embeddedQuestionText, ...selectedBlocks.map((block) => block.text)]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const knowledge = inferKnowledgeFromText(mergedText);
    questions.push({
      x,
      y,
      w: paddedRight - x,
      h: paddedBottom - y,
      number: start.number,
      questionNumber: start.number,
      title: mergedText.slice(0, 80) || `第 ${start.number} 题`,
      problemText: mergedText.slice(0, 80) || `第 ${start.number} 题`,
      type: "未知",
      problemType: "未知",
      knowledge,
      mainKnowledgePoint: knowledge,
      knowledgePoints: knowledge ? [knowledge] : [],
      confidence: knowledge ? 0.62 : 0.45,
      generatedBy: "question-number-fallback"
    });
  }

  return questions.sort((a, b) => a.y - b.y || a.x - b.x);
}

function shouldPreferNumberFallback(questions, width, height) {
  if (!questions.length) return true;
  if (questions.length > 1) return false;
  const question = questions[0];
  const areaRatio = (question.w * question.h) / Math.max(1, width * height);
  const heightRatio = question.h / Math.max(1, height);
  return areaRatio > 0.5 || heightRatio > 0.55;
}

function questionNumberList(questions) {
  return (Array.isArray(questions) ? questions : [])
    .map((question) => Number.parseInt(question.questionNumber || question.number, 10))
    .filter((number) => Number.isInteger(number) && number > 0);
}

function isConsecutiveQuestionSplit(questions) {
  const numbers = questionNumberList(questions);
  if (numbers.length !== questions.length || numbers.length < 2) return false;
  const seen = new Set(numbers);
  if (seen.size !== numbers.length) return false;
  for (let index = 1; index < numbers.length; index += 1) {
    if (numbers[index] !== numbers[index - 1] + 1) return false;
  }
  return true;
}

function isReliableFastQuestionSplit(questions, width, height) {
  if (!isConsecutiveQuestionSplit(questions)) return false;
  const pageArea = Math.max(1, width * height);
  return questions.every((question) => {
    const areaRatio = (question.w * question.h) / pageArea;
    const heightRatio = question.h / Math.max(1, height);
    return areaRatio > 0.015 && areaRatio < 0.65 && heightRatio > 0.025 && heightRatio < 0.72;
  });
}

function median(values) {
  const sorted = values.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function makeInferredQuestionBox(template, number, x, y, w, h, generatedBy) {
  const label = `第 ${number} 题`;
  const shouldUseLabel = /repair/.test(String(generatedBy || ""));
  return {
    ...template,
    x: Math.max(0, Math.round(x)),
    y: Math.max(0, Math.round(y)),
    w: Math.max(1, Math.round(w)),
    h: Math.max(1, Math.round(h)),
    number: String(number),
    questionNumber: String(number),
    title: shouldUseLabel ? label : template?.title && String(template.title).trim() ? template.title : label,
    problemText: shouldUseLabel ? label : template?.problemText && String(template.problemText).trim() ? template.problemText : label,
    confidence: Math.min(Number(template?.confidence) || 0.35, 0.38),
    generatedBy
  };
}

function repairQuestionNumberSplit(questions, width, height, blocks = []) {
  const sorted = (Array.isArray(questions) ? questions : [])
    .map((question) => ({
      ...question,
      numberValue: Number.parseInt(question.questionNumber || question.number, 10)
    }))
    .filter((question) => Number.isInteger(question.numberValue) && question.numberValue > 0)
    .sort((a, b) => a.y - b.y || a.x - b.x);
  if (sorted.length < 2 || isConsecutiveQuestionSplit(sorted)) return sorted;

  const left = Math.max(0, Math.min(...sorted.map((question) => question.x)));
  const right = Math.min(width, Math.max(...sorted.map((question) => question.x + question.w)));
  const boxWidth = Math.max(1, right - left);
  const repaired = [];
  const first = sorted[0];

  if (first.numberValue > 1 && first.y > Math.max(50, height * 0.035)) {
    const count = Math.min(first.numberValue - 1, 4);
    const sliceHeight = first.y / count;
    for (let index = 0; index < count; index += 1) {
      repaired.push(
        makeInferredQuestionBox(first, first.numberValue - count + index, left, index * sliceHeight, boxWidth, sliceHeight - 6, "question-number-gap-repair")
      );
    }
  }

  for (let index = 0; index < sorted.length; index += 1) {
    const current = { ...sorted[index] };
    const next = sorted[index + 1];
    delete current.numberValue;

    if (!next) {
      repaired.push(current);
      continue;
    }

    const currentNumber = sorted[index].numberValue;
    const nextNumber = next.numberValue;
    const missingCount = nextNumber - currentNumber - 1;
    if (missingCount <= 0) {
      repaired.push(current);
      continue;
    }

    const spanTop = sorted[index].y;
    const spanBottom = Math.max(next.y - 8, spanTop + current.h);
    const spanHeight = spanBottom - spanTop;
    const sliceCount = missingCount + 1;
    if (spanHeight < Math.max(70, height * 0.045) * sliceCount) {
      repaired.push(current);
      continue;
    }

    const sliceHeight = spanHeight / sliceCount;
    repaired.push({
      ...current,
      x: left,
      y: Math.round(spanTop),
      w: boxWidth,
      h: Math.max(1, Math.round(sliceHeight - 6)),
      generatedBy: "question-number-gap-repair"
    });
    for (let offset = 1; offset <= missingCount; offset += 1) {
      repaired.push(
        makeInferredQuestionBox(
          current,
          currentNumber + offset,
          left,
          spanTop + sliceHeight * offset,
          boxWidth,
          sliceHeight - 6,
          "question-number-gap-repair"
        )
      );
    }
  }

  const repairedHeights = repaired.map((question) => question.h);
  const typicalHeight = median(repairedHeights.slice(0, -1));
  const last = repaired[repaired.length - 1];
  if (last && typicalHeight > 0 && last.h > typicalHeight * 1.75) {
    const lastNumber = Number.parseInt(last.questionNumber || last.number, 10);
    const extraCount = Math.min(2, Math.max(1, Math.round(last.h / typicalHeight) - 1));
    const sliceCount = extraCount + 1;
    const sliceHeight = last.h / sliceCount;
    repaired.pop();
    for (let index = 0; index < sliceCount; index += 1) {
      repaired.push(
        makeInferredQuestionBox(
          last,
          lastNumber + index,
          last.x,
          last.y + sliceHeight * index,
          last.w,
          sliceHeight - 6,
          index === 0 ? "question-number-fallback" : "question-number-tail-repair"
        )
      );
    }
  }

  return expandQuestionBoxesToVerticalBands(
    repaired
    .filter((question) => question.w > 2 && question.h > 2)
      .sort((a, b) => a.y - b.y || a.x - b.x),
    blocks,
    width,
    height
  );
}

function clampPixelBox(box, width, height) {
  if (!box) return null;
  const x = Number(box.x);
  const y = Number(box.y);
  const w = Number(box.w);
  const h = Number(box.h);
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return null;
  const left = Math.max(0, Math.min(width, x));
  const top = Math.max(0, Math.min(height, y));
  const right = Math.max(left, Math.min(width, x + w));
  const bottom = Math.max(top, Math.min(height, y + h));
  if (right - left < 2 || bottom - top < 2) return null;
  return { x: left, y: top, w: right - left, h: bottom - top };
}

function normalizedBoxToPixels(box, width, height) {
  if (!box) return null;
  const values = [box.x, box.y, box.w, box.h].map(Number);
  if (!values.every(Number.isFinite) || values.some((value) => value < 0 || value > 1)) return null;
  return clampPixelBox({ x: values[0] * width, y: values[1] * height, w: values[2] * width, h: values[3] * height }, width, height);
}

function unionPixelBoxes(boxes, width, height) {
  const valid = (Array.isArray(boxes) ? boxes : []).map((box) => clampPixelBox(box, width, height)).filter(Boolean);
  if (!valid.length) return null;
  const left = Math.min(...valid.map((box) => box.x));
  const top = Math.min(...valid.map((box) => box.y));
  const right = Math.max(...valid.map((box) => box.x + box.w));
  const bottom = Math.max(...valid.map((box) => box.y + box.h));
  return clampPixelBox({ x: left, y: top, w: right - left, h: bottom - top }, width, height);
}

function padPixelBox(box, width, height, horizontalRatio = 0.015, verticalRatio = 0.008) {
  if (!box) return null;
  const horizontal = width * horizontalRatio;
  const vertical = height * verticalRatio;
  return clampPixelBox(
    { x: box.x - horizontal, y: box.y - vertical, w: box.w + horizontal * 2, h: box.h + vertical * 2 },
    width,
    height
  );
}

function getBoundaryGap(imageHeight) {
  return Math.max(2, Math.round(imageHeight * 0.005));
}

function mergeBoxesWithinBoundary(boxes, nextQuestionStart, width, height) {
  const merged = unionPixelBoxes(boxes, width, height);
  if (!merged || !Number.isFinite(nextQuestionStart)) return merged;
  const boundaryBottom = Math.max(merged.y + 1, nextQuestionStart - getBoundaryGap(height));
  return clampPixelBox(
    { ...merged, h: Math.min(merged.y + merged.h, boundaryBottom) - merged.y },
    width,
    height
  );
}

function getQuestionStartY(question) {
  const ocrStart = Number(question?.expectedBand?.startY);
  if (Number.isFinite(ocrStart)) return ocrStart;
  const modelTop = Number(question?.box?.y ?? question?.finalBox?.y ?? question?.y);
  return Number.isFinite(modelTop) ? modelTop : 0;
}

function normalizeSourceQuestionNumber(value) {
  const match = String(value || "").match(/\d{1,3}/);
  if (!match) return "";
  const number = Number(match[0]);
  return Number.isInteger(number) && number > 0 && number <= 200 ? String(number) : "";
}

function extractOptionLabels(text) {
  const labels = new Set();
  const pattern = /(?:^|\s)([A-D])\s*[.\uFF0E\u3001:：]/gi;
  for (const match of String(text || "").matchAll(pattern)) labels.add(match[1].toUpperCase());
  return [...labels];
}

function normalizeSimilarityText(text) {
  return String(text || "").toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
}

function textJaccardSimilarity(leftText, rightText) {
  const toBigrams = (value) => {
    const normalized = normalizeSimilarityText(value);
    if (!normalized) return new Set();
    if (normalized.length === 1) return new Set([normalized]);
    const result = new Set();
    for (let index = 0; index < normalized.length - 1; index += 1) result.add(normalized.slice(index, index + 2));
    return result;
  };
  const left = toBigrams(leftText);
  const right = toBigrams(rightText);
  if (!left.size || !right.size) return 0;
  const intersection = [...left].filter((item) => right.has(item)).length;
  return intersection / (left.size + right.size - intersection);
}

function boxIntersectionArea(a, b) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.w, b.x + b.w);
  const bottom = Math.min(a.y + a.h, b.y + b.h);
  return Math.max(0, right - left) * Math.max(0, bottom - top);
}

function boxIou(a, b) {
  const intersection = boxIntersectionArea(a, b);
  const union = a.w * a.h + b.w * b.h - intersection;
  return union > 0 ? intersection / union : 0;
}

function boxContainmentRatio(a, b) {
  const intersection = boxIntersectionArea(a, b);
  const smaller = Math.min(a.w * a.h, b.w * b.h);
  return smaller > 0 ? intersection / smaller : 0;
}

function horizontalOverlapRatio(a, b) {
  const overlap = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  return overlap / Math.max(1, Math.min(a.w, b.w));
}

function classifyOcrNumbering(blocks, width = 0, height = 0) {
  const annotations = new Map();
  let currentMainQuestion = "";
  const numberingContext = createQuestionNumberContext(blocks, width, height);
  const sorted = (Array.isArray(blocks) ? blocks : [])
    .map((block, index) => ({ block, index }))
    .sort((a, b) => a.block.y - b.block.y || a.block.x - b.block.x);

  for (const { block, index } of sorted) {
    const text = String(block.text || "").trim();
    if (isSubQuestionNumber(text)) {
      const subQuestionNumber = extractSubQuestionNumber(text);
      annotations.set(index, {
        type: "subQuestion",
        subQuestionNumber,
        parentQuestionNumber: currentMainQuestion
      });
      console.log(`[numbering] text="${text.slice(0, 40)}" type=subQuestion parent=${currentMainQuestion || "?"}`);
      continue;
    }
    const startInfo = getQuestionNumberStartInfo(text, block, numberingContext);
    if (!startInfo) {
      const tableOrFigure = isTableOrFigureBlock(block);
      if (tableOrFigure) {
        annotations.set(index, {
          type: "supportingContent",
          parentQuestionNumber: currentMainQuestion
        });
        console.log(`[block] text="${text.slice(0, 40)}" type=tableOrFigure`);
        if (currentMainQuestion) console.log(`[parent] assigned to Q${currentMainQuestion}`);
      }
      if (/^\s*\d{1,3}\s*$/u.test(text)) {
        console.log(`[numbering] text="${text}" validMainQuestion=false reason=single table cell number`);
      } else if (/^\s*(?:第\s*)?\d{1,3}(?:\s*题|[.．、。:：])/u.test(text)) {
        console.log(`[numbering] text="${text.slice(0, 40)}" validMainQuestion=false reason=missing natural-language stem or outside question-number column`);
      }
      continue;
    }
    currentMainQuestion = startInfo.number;
    annotations.set(index, { type: "mainQuestion", number: currentMainQuestion, startInfo });
    console.log(`[numbering] text="${text.slice(0, 40)}" type=mainQuestion number=${currentMainQuestion}`);
  }
  return annotations;
}

function buildOcrQuestionBands(blocks, width, height, prepared = {}) {
  if (!Array.isArray(blocks) || !blocks.length) return [];
  const ocrLines = Array.isArray(prepared.ocrLines)
    ? prepared.ocrLines
    : mergeDetachedQuestionNumberLines(groupOcrBlocksIntoLines(blocks, width, height), width);
  const anchors = Array.isArray(prepared.anchors)
    ? prepared.anchors
    : extractMainQuestionAnchors(ocrLines, width, height);
  if (!anchors.length) return [];
  const numbering = classifyOcrNumbering(ocrLines, width, height);

  return anchors.map((anchor, index) => {
    const next = anchors[index + 1];
    const top = Math.max(0, anchor.startY - 3);
    const bottom = next ? Math.max(top + 18, next.startY - 2) : height;
    const selectedLineEntries = ocrLines
      .map((line, lineIndex) => ({ line, lineIndex, center: line.y + line.h / 2 }))
      .filter((item) => item.center >= top && item.center < bottom);
    const selectedLines = selectedLineEntries.map((item) => item.line);
    const lineIndexes = [...new Set(selectedLines.flatMap((line) => line.blockIndexes || []))];
    const text = selectedLines.map((line) => line.text).join(" ").replace(/\s+/g, " ").trim();
    const subQuestions = selectedLineEntries
      .map((item) => numbering.get(item.lineIndex))
      .filter((annotation) => annotation?.type === "subQuestion" && annotation.parentQuestionNumber === anchor.sourceQuestionNumber)
      .map((annotation) => annotation.subQuestionNumber)
      .filter(Boolean);
    const supportingContentIndexes = selectedLineEntries
      .filter((item) => {
        const annotation = numbering.get(item.lineIndex);
        return annotation?.type === "supportingContent" && annotation.parentQuestionNumber === anchor.sourceQuestionNumber;
      })
      .flatMap((item) => item.line.blockIndexes || []);
    subQuestions.forEach((subQuestionNumber) => console.log(`[merge] subQuestion（${subQuestionNumber}） merged into Q${anchor.sourceQuestionNumber}`));
    if (supportingContentIndexes.length) {
      console.log(`[merge] table continuation merged into Q${anchor.sourceQuestionNumber}`);
    }
    const box = unionPixelBoxes(lineIndexes.map((blockIndex) => blocks[blockIndex]).filter(Boolean), width, height) || {
      x: 0, y: top, w: width, h: bottom - top
    };
    console.log(
      `[interval] Q${anchor.sourceQuestionNumber}=[${Math.round(anchor.startY)},${next ? `Q${next.sourceQuestionNumber}.top=${Math.round(next.startY)}` : height})`
    );
    return {
      sourceQuestionNumber: anchor.sourceQuestionNumber,
      startY: anchor.startY,
      nextStartY: next?.startY ?? height,
      nextQuestionNumber: next?.sourceQuestionNumber || "",
      lineIndexes,
      text,
      optionLabels: extractOptionLabels(text),
      subQuestions: [...new Set(subQuestions)],
      supportingContentIndexes: [...new Set(supportingContentIndexes)],
      box,
      startInfo: anchor.startInfo,
      evidenceSource: "ocr-anchor",
      unresolvedFollowingNumbers: [...new Set(anchor.unresolvedFollowingNumbers || [])],
      preserveUnresolvedUntilNextAnchor: Boolean(anchor.preserveUnresolvedUntilNextAnchor)
    };
  });
}

function normalizeVisualQuestionRegions(questions, width, height) {
  return (Array.isArray(questions) ? questions : [])
    .map((question, index) => {
      const stemBoxes = (question.stemBoxes || []).map((box) => normalizedBoxToPixels(box, width, height)).filter(Boolean);
      const optionBoxes = (question.optionBoxes || []).map((box) => normalizedBoxToPixels(box, width, height)).filter(Boolean);
      const otherBoxes = (question.otherBoxes || []).map((box) => normalizedBoxToPixels(box, width, height)).filter(Boolean);
      const rawModelBoxes = [...stemBoxes, ...optionBoxes, ...otherBoxes];
      const box = unionPixelBoxes(rawModelBoxes, width, height);
      if (!box) return null;
      return {
        sourceQuestionNumber: normalizeSourceQuestionNumber(question.questionNumber),
        questionRole: "mainQuestion",
        parentQuestionNumber: "",
        subQuestions: [],
        summary: String(question.summary || "").trim(),
        type: normalizeQuestionType(question.type),
        text: String(question.summary || "").trim(),
        stemBoxes,
        optionBoxes,
        otherBoxes,
        rawModelBoxes,
        ocrLineIndexes: [],
        optionLabels: [],
        box,
        mergeReasons: [`视觉结构候选 ${index + 1}`],
        uncertain: false
      };
    })
    .filter(Boolean);
}

function buildDirectAliyunQuestions(paperCutQuestions, width, height) {
  return normalizeVisualQuestionRegions(paperCutQuestions, width, height)
    .filter((candidate) => {
      const label = candidate.summary || candidate.text || "";
      const optionOnly = isLikelyAliyunOptionOnlyText(label);
      if (optionOnly) {
        console.log(`[segment-v2] direct Aliyun option-only card skipped: "${String(label).slice(0, 60)}"`);
      }
      const figureOnly = !optionOnly && (isLikelyAliyunFigureOnlyText(label) || isLikelyAliyunVisualOnlyCard(label));
      if (figureOnly) {
        console.log(`[segment-v2] direct Aliyun figure/table-only card skipped: "${String(label).slice(0, 60)}"`);
      }
      return !optionOnly && !figureOnly;
    })
    .sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x)
    .map((candidate, index) => {
      const finalBox = clampPixelBox(candidate.box, width, height) || {
        x: 0,
        y: 0,
        w: width,
        h: height
      };
      const sourceQuestionNumber = candidate.sourceQuestionNumber || String(index + 1);
      const summary = candidate.summary || candidate.text || `题目 ${sourceQuestionNumber}`;
      return {
        ...candidate,
        sourceQuestionNumber,
        questionNumber: sourceQuestionNumber,
        number: sourceQuestionNumber,
        displayIndex: index + 1,
        title: summary,
        problemText: summary,
        problemType: candidate.type || "未知",
        type: candidate.type || "未知",
        finalBox,
        x: finalBox.x,
        y: finalBox.y,
        w: finalBox.w,
        h: finalBox.h,
        needsReview: false,
        uncertain: false,
        validation: [],
        mergeReasons: ["阿里云教育版试卷切题 OCR 原始题块直出"],
        generatedBy: "aliyun-official-paper-cut-direct"
      };
    });
}

function isSupportingQuestionRole(role) {
  return ["subQuestion", "table", "figure", "formula", "supportingContent"].includes(String(role || ""));
}

function mergeQuestionRoles(leftRole, rightRole) {
  if (leftRole === "mainQuestion" || rightRole === "mainQuestion") return "mainQuestion";
  if (leftRole === "subQuestion" || rightRole === "subQuestion") return "subQuestion";
  return "supportingContent";
}

function mergeQuestionCandidate(base, extra, width, height, reason, nextQuestionStart = Number.POSITIVE_INFINITY) {
  const mergedBox = mergeBoxesWithinBoundary([base.box, extra.box], nextQuestionStart, width, height) || base.box;
  const sourceQuestionNumber = base.sourceQuestionNumber || extra.sourceQuestionNumber;
  return {
    ...base,
    sourceQuestionNumber,
    questionRole: mergeQuestionRoles(base.questionRole, extra.questionRole),
    parentQuestionNumber: base.parentQuestionNumber || extra.parentQuestionNumber || "",
    subQuestions: [...new Set([...(base.subQuestions || []), ...(extra.subQuestions || [])])],
    summary: base.summary.length >= extra.summary.length ? base.summary : extra.summary,
    type: base.type !== "未知" ? base.type : extra.type,
    text: [base.text, extra.text].filter(Boolean).join(" ").replace(/\s+/g, " ").trim(),
    stemBoxes: [...(base.stemBoxes || []), ...(extra.stemBoxes || [])],
    optionBoxes: [...(base.optionBoxes || []), ...(extra.optionBoxes || [])],
    otherBoxes: [...(base.otherBoxes || []), ...(extra.otherBoxes || [])],
    rawModelBoxes: [...(base.rawModelBoxes || []), ...(extra.rawModelBoxes || [])],
    ocrLineIndexes: [...new Set([...(base.ocrLineIndexes || []), ...(extra.ocrLineIndexes || [])])],
    optionLabels: [...new Set([...(base.optionLabels || []), ...(extra.optionLabels || [])])],
    box: mergedBox,
    mergeReasons: [...(base.mergeReasons || []), ...(extra.mergeReasons || []), reason],
    uncertain: Boolean(base.uncertain || extra.uncertain)
  };
}

function hasStrongVisionQuestionBeforeFirstOcrAnchor(candidate, ocrBands, imageHeight) {
  const firstBand = (Array.isArray(ocrBands) ? ocrBands : [])
    .filter((band) => band?.sourceQuestionNumber && Number.isFinite(Number(band.startY)))
    .sort((a, b) => Number(a.startY) - Number(b.startY))[0];
  if (!firstBand || !candidate?.box) return false;

  const modelNumber = Number(candidate.sourceQuestionNumber);
  const firstOcrNumber = Number(firstBand.sourceQuestionNumber);
  const modelBoxes = Array.isArray(candidate.rawModelBoxes) ? candidate.rawModelBoxes : [];
  const minimumHeight = Math.max(18, Number(imageHeight) * 0.02);
  return Number.isInteger(modelNumber) &&
    Number.isInteger(firstOcrNumber) &&
    modelNumber < firstOcrNumber &&
    Number(candidate.box.y) < Number(firstBand.startY) &&
    Number(candidate.box.h) >= minimumHeight &&
    modelBoxes.length > 0 &&
    hasQuestionStemEvidence(candidate.summary || candidate.text);
}

function normalizeQuestionRegions(visionQuestions, ocrBands, blocks, width, height) {
  const visual = normalizeVisualQuestionRegions(visionQuestions, width, height);
  const numberingContext = createQuestionNumberContext(blocks, width, height);
  visual.forEach((candidate) => {
    const lines = blocks
      .filter((block) => block.y + block.h / 2 >= candidate.box.y && block.y + block.h / 2 <= candidate.box.y + candidate.box.h)
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const firstNumberedLine = lines.find(
      (line) => isSubQuestionNumber(line.text) || isMainQuestionNumber(line.text, line, numberingContext)
    );
    const markerText = firstNumberedLine?.text || candidate.summary;
    const markerY = firstNumberedLine?.y ?? candidate.box.y;
    const parentBand = [...ocrBands]
      .filter((band) => band.startY <= markerY && markerY < band.nextStartY)
      .sort((a, b) => b.startY - a.startY)[0];
    if (hasStrongVisionQuestionBeforeFirstOcrAnchor(candidate, ocrBands, height)) {
      candidate.questionRole = "mainQuestion";
      candidate.parentQuestionNumber = "";
      candidate.uncertain = true;
      candidate.evidenceSource = "vision-structure-before-first-ocr-anchor";
      candidate.mergeReasons.push("OCR漏掉页面首题题号，保留已有视觉题号与完整结构区域");
      console.log(
        `[vision-anchor] preserve Q${candidate.sourceQuestionNumber} before first OCR anchor Q${ocrBands[0]?.sourceQuestionNumber || "?"}`
      );
      return;
    }
    if (isSubQuestionNumber(markerText)) {
      const subQuestionNumber = extractSubQuestionNumber(markerText);
      candidate.questionRole = "subQuestion";
      candidate.parentQuestionNumber = parentBand?.sourceQuestionNumber || "";
      candidate.sourceQuestionNumber = candidate.parentQuestionNumber;
      candidate.subQuestions = subQuestionNumber ? [subQuestionNumber] : [];
      candidate.text = lines.map((line) => line.text).join(" ") || candidate.text;
      candidate.mergeReasons.push(`小问（${subQuestionNumber || "?"}）归属最近主问题 Q${candidate.parentQuestionNumber || "?"}`);
      console.log(`[numbering] text="${String(markerText).slice(0, 40)}" type=subQuestion parent=${candidate.parentQuestionNumber || "?"}`);
      return;
    }

    const mainInfo = firstNumberedLine
      ? getQuestionNumberStartInfo(firstNumberedLine.text, firstNumberedLine, numberingContext)
      : null;
    if (mainInfo) {
      candidate.questionRole = "mainQuestion";
      candidate.parentQuestionNumber = "";
      candidate.sourceQuestionNumber = mainInfo.number;
      return;
    }

    const hasVisionQuestionEvidence = Boolean(
      candidate.sourceQuestionNumber &&
      candidate.rawModelBoxes.length &&
      (
        hasQuestionStemEvidence(candidate.summary || candidate.text) ||
        hasStandaloneMathQuestionStem(candidate.summary || candidate.text) ||
        candidate.type !== "未知"
      )
    );
    if (hasVisionQuestionEvidence) {
      candidate.questionRole = "mainQuestion";
      candidate.parentQuestionNumber = "";
      candidate.uncertain = true;
      candidate.evidenceSource = "qwen-structure-low-confidence-fallback";
      candidate.mergeReasons.push("OCR 题号证据不足，保留 Qwen 返回的完整题目结构");
      console.log(
        `[vision-fallback] preserve Q${candidate.sourceQuestionNumber} from Qwen structure`
      );
      return;
    }

    if (parentBand) {
      candidate.questionRole = "supportingContent";
      candidate.parentQuestionNumber = parentBand.sourceQuestionNumber;
      candidate.sourceQuestionNumber = "";
      candidate.text = lines.map((line) => line.text).join(" ") || candidate.text;
      candidate.mergeReasons.push(`无合法主问题号的图表/公式/续接区域归入 Q${parentBand.sourceQuestionNumber}`);
      console.log(`[block] type=tableOrFigure`);
      console.log(`[parent] assigned to Q${parentBand.sourceQuestionNumber}`);
      return;
    }

    candidate.questionRole = "supportingContent";
    candidate.parentQuestionNumber = "";
    candidate.sourceQuestionNumber = "";
    candidate.uncertain = true;
    candidate.mergeReasons.push("未发现合法正文题号，禁止根据模型编号独立成题");
    console.log(`[render] fake Q${normalizeSourceQuestionNumber(candidate.sourceQuestionNumber) || "?"} prevented`);
  });
  const usedVisual = new Set();
  const candidates = [];

  for (const band of ocrBands) {
    let matchIndex = visual.findIndex(
      (candidate, index) =>
        !usedVisual.has(index) &&
        candidate.questionRole !== "subQuestion" &&
        candidate.sourceQuestionNumber === band.sourceQuestionNumber
    );
    if (matchIndex < 0) {
      let bestScore = 0;
      visual.forEach((candidate, index) => {
        if (usedVisual.has(index) || candidate.sourceQuestionNumber || candidate.questionRole === "subQuestion") return;
        const overlap = boxIntersectionArea(candidate.box, band.box) / Math.max(1, candidate.box.w * candidate.box.h);
        if (overlap > bestScore) {
          bestScore = overlap;
          matchIndex = index;
        }
      });
      if (bestScore < 0.18) matchIndex = -1;
    }

    const ocrCandidate = {
      sourceQuestionNumber: band.sourceQuestionNumber,
      questionRole: "mainQuestion",
      parentQuestionNumber: "",
      subQuestions: band.subQuestions || [],
      summary: band.text.slice(0, 100),
      type: band.optionLabels.length ? "选择题" : "未知",
      text: band.text,
      stemBoxes: [],
      optionBoxes: [],
      otherBoxes: [],
      rawModelBoxes: [],
      ocrLineIndexes: band.lineIndexes,
      optionLabels: band.optionLabels,
      box: band.box,
      expectedBand: band,
      mergeReasons: ["OCR 从当前题号收集到下一题题号之前"],
      uncertain: false
    };
    if (matchIndex >= 0) {
      usedVisual.add(matchIndex);
      const merged = mergeQuestionCandidate(visual[matchIndex], ocrCandidate, width, height, "视觉题干/选项与 OCR 题号区间合并");
      merged.expectedBand = band;
      candidates.push(merged);
    } else {
      candidates.push(ocrCandidate);
    }
  }

  visual.forEach((candidate, index) => {
    if (!usedVisual.has(index)) candidates.push(candidate);
  });
  return candidates.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x);
}

function mergeQuestionRegions(candidates, width, height) {
  const nextKnownStarts = new Array(candidates.length).fill(Number.POSITIVE_INFINITY);
  let nextKnownStart = Number.POSITIVE_INFINITY;
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    nextKnownStarts[index] = nextKnownStart;
    if (candidates[index].sourceQuestionNumber) nextKnownStart = getQuestionStartY(candidates[index]);
  }

  const result = [];
  for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
    const candidate = candidates[candidateIndex];
    const previous = result[result.length - 1];
    if (!previous) {
      result.push(candidate);
      continue;
    }
    const sameNumber = previous.sourceQuestionNumber && previous.sourceQuestionNumber === candidate.sourceQuestionNumber;
    const differentKnownNumbers = previous.sourceQuestionNumber && candidate.sourceQuestionNumber && !sameNumber;
    const gap = candidate.box.y - (previous.box.y + previous.box.h);
    const closeVertically = gap <= height * 0.045;
    const horizontalOverlap = horizontalOverlapRatio(previous.box, candidate.box);
    const sameNumberSimilarity = textJaccardSimilarity(previous.text || previous.summary, candidate.text || candidate.summary);
    const sameNumberMergeable = sameNumber && (
      sameNumberSimilarity > 0.35 || closeVertically || boxContainmentRatio(previous.box, candidate.box) > 0.25
    );
    const previousIncompleteOptions = previous.optionLabels.length > 0 && previous.optionLabels.length < 4;
    const candidateStartsWithOption = /^[\s]*[A-D]\s*[.\uFF0E\u3001]/i.test(candidate.text || "");
    const candidateStartsNewQuestion = Boolean(getQuestionNumberStartInfo(candidate.text || ""));
    const textContinues = /[,，:：\uFF08(\/+\-=]$/.test(String(previous.text || "").trim());
    const nextBoundary = nextKnownStarts[candidateIndex];
    const staysInsideBoundary = !Number.isFinite(nextBoundary) || candidate.box.y < nextBoundary;
    const shouldMerge = !differentKnownNumbers && (!candidateStartsNewQuestion || sameNumber) && staysInsideBoundary && (
      sameNumberMergeable ||
      (closeVertically && horizontalOverlap > 0.5 && (candidateStartsWithOption || previousIncompleteOptions || textContinues))
    );
    if (shouldMerge) {
      const reason = candidate.questionRole === "subQuestion"
        ? `小问（${candidate.subQuestions?.join("、") || "?"}）合并到 Q${previous.sourceQuestionNumber || "?"}`
        : sameNumber
        ? "相同原题号区域合并"
        : candidateStartsWithOption
          ? "下一区域以选项开头，归入上一题"
          : "相邻区域横向重叠且语义连续";
      result[result.length - 1] = mergeQuestionCandidate(previous, candidate, width, height, reason, nextBoundary);
      if (candidate.questionRole === "subQuestion") {
        console.log(`[merge] subQuestion（${candidate.subQuestions?.join("、") || "?"}） merged into Q${previous.sourceQuestionNumber || "?"}`);
      }
    } else {
      if (sameNumber) {
        previous.uncertain = true;
        candidate.uncertain = true;
        previous.mergeReasons = [...(previous.mergeReasons || []), "相同题号但内容与位置差异明显，保留并标记待确认"];
      }
      result.push(candidate);
    }
  }
  return result;
}

function deduplicateQuestions(candidates, width, height) {
  const kept = [];
  const removed = [];
  for (const candidate of candidates) {
    let duplicateIndex = -1;
    let duplicateReason = "";
    for (let index = 0; index < kept.length; index += 1) {
      const existing = kept[index];
      const sameNumber = candidate.sourceQuestionNumber && candidate.sourceQuestionNumber === existing.sourceQuestionNumber;
      const textSimilarity = textJaccardSimilarity(candidate.text || candidate.summary, existing.text || existing.summary);
      const iou = boxIou(candidate.box, existing.box);
      const containment = boxContainmentRatio(candidate.box, existing.box);
      if (sameNumber && textSimilarity > 0.75) {
        duplicateIndex = index;
        duplicateReason = `题号相同且文本相似度 ${textSimilarity.toFixed(2)}`;
        break;
      }
      if (iou > 0.6 && textSimilarity > 0.55) {
        duplicateIndex = index;
        duplicateReason = `IoU ${iou.toFixed(2)} 且文本相似`;
        break;
      }
      if (containment > 0.82 && textSimilarity > 0.65) {
        duplicateIndex = index;
        duplicateReason = `区域包含率 ${containment.toFixed(2)} 且题干相同`;
        break;
      }
      if (sameNumber && textSimilarity < 0.35 && iou < 0.2) {
        existing.uncertain = true;
        candidate.uncertain = true;
      }
    }
    if (duplicateIndex < 0) {
      kept.push(candidate);
      continue;
    }
    const existing = kept[duplicateIndex];
    const existingScore = existing.box.w * existing.box.h + existing.optionLabels.length * width * height * 0.02;
    const candidateScore = candidate.box.w * candidate.box.h + candidate.optionLabels.length * width * height * 0.02;
    const preferred = existingScore >= candidateScore ? existing : candidate;
    const discarded = preferred === existing ? candidate : existing;
    preferred.mergeReasons = [...(preferred.mergeReasons || []), `去重保留更完整区域：${duplicateReason}`];
    kept[duplicateIndex] = preferred;
    removed.push({ box: discarded.box, sourceQuestionNumber: discarded.sourceQuestionNumber, reason: duplicateReason });
  }
  return { questions: kept.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x), removed };
}

function validateQuestionCrop(candidate, nextCandidate, blocks, width, height) {
  const validation = [];
  const originalBottom = candidate.box.y + candidate.box.h;
  const questionStartY = getQuestionStartY(candidate);
  let box = unionPixelBoxes([candidate.box, candidate.expectedBand?.box], width, height) || candidate.box;
  box = padPixelBox(box, width, height);
  const topPadding = Math.max(2, height * 0.006);
  const finalTop = Math.max(box.y, questionStartY - topPadding);
  box = clampPixelBox({ ...box, y: finalTop, h: box.y + box.h - finalTop }, width, height) || box;
  const nextCandidateAnchorStart = Number(nextCandidate?.expectedBand?.startY);
  const nextStarts = [
    Number(candidate.expectedBand?.nextStartY),
    Number(nextCandidate ? getQuestionStartY(nextCandidate) : Number.NaN),
    Number.isFinite(nextCandidateAnchorStart) ? Number.NaN : Number(nextCandidate?.box?.y)
  ].filter((value) => Number.isFinite(value) && value > questionStartY + 1);
  const nextStart = nextStarts.length ? Math.min(...nextStarts) : Number.POSITIVE_INFINITY;
  const boundaryGap = getBoundaryGap(height);
  if (Number.isFinite(nextStart) && box.y + box.h >= nextStart - boundaryGap) {
    box = clampPixelBox({ ...box, h: Math.max(12, nextStart - boundaryGap - box.y) }, width, height) || box;
    validation.push("已按下一题题号修正底边");
  }

  const includedIndexes = blocks
    .map((block, index) => ({ block, index, center: block.y + block.h / 2 }))
    .filter((item) => item.center >= box.y && item.center <= box.y + box.h)
    .map((item) => item.index);
  const includedText = includedIndexes.map((index) => blocks[index]?.text || "").join(" ");
  const optionLabels = [...new Set([...candidate.optionLabels, ...extractOptionLabels(includedText)])];
  const isChoice = candidate.type === "选择题" || optionLabels.length > 0;
  const hasStem = normalizeSimilarityText(candidate.text || includedText).length >= 6;
  const problems = [];
  if (!hasStem) problems.push("未确认完整题干");
  if (isChoice && optionLabels.length < 2) problems.push("选择题选项少于两个");
  if (isChoice && candidate.expectedBand?.optionLabels?.length > optionLabels.length) problems.push("存在选项截断风险");
  if (candidate.uncertain) problems.push("相同题号存在内容差异");
  validation.push(problems.length ? `需要确认：${problems.join("；")}` : "完整性检查通过");

  return {
    ...candidate,
    optionLabels,
    finalBox: {
      x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.w), h: Math.round(box.h)
    },
    originalBottom,
    questionStartY,
    nextQuestionStart: Number.isFinite(nextStart) ? nextStart : null,
    needsReview: problems.length > 0,
    validation,
    ocrLineIndexes: [...new Set([...(candidate.ocrLineIndexes || []), ...includedIndexes])]
  };
}

async function callVisionQuestionStructure(image) {
  return callQwenMultimodalJson({
    model: QWEN_VL_MODEL,
    schema: visionQuestionStructureSchema,
    instructions: VISION_QUESTION_STRUCTURE_PROMPT,
    content: [
      { type: "input_text", text: "完整阅读整页试卷，先确认所有题目结构，再统一返回题干、选项和其他区域。" },
      { type: "input_image", label: "整页试卷原图", image_url: image, detail: "high" }
    ],
    maxOutputTokens: 5000
  });
}

function buildFinalQuestionPayload(validated, blocks, width, height, displayIndex) {
  const finalBox = validated.finalBox;
  const text = validated.text || validated.summary || "";
  const knowledge = inferKnowledgeFromText(text);
  return {
    ...finalBox,
    finalBox,
    originalBottom: Math.round(validated.originalBottom ?? finalBox.y + finalBox.h),
    questionStartY: Math.round(validated.questionStartY ?? finalBox.y),
    nextQuestionStart: Number.isFinite(validated.nextQuestionStart) ? Math.round(validated.nextQuestionStart) : null,
    number: validated.sourceQuestionNumber,
    questionNumber: validated.sourceQuestionNumber,
    sourceQuestionNumber: validated.sourceQuestionNumber,
    questionRole: validated.questionRole || "mainQuestion",
    parentQuestionNumber: validated.parentQuestionNumber || "",
    subQuestions: [...new Set(validated.subQuestions || [])],
    displayIndex,
    title: validated.summary || text.slice(0, 100) || `题目 ${displayIndex}`,
    problemText: validated.summary || text.slice(0, 100),
    type: validated.type,
    problemType: validated.type,
    knowledge,
    mainKnowledgePoint: knowledge,
    knowledgePoints: knowledge ? [knowledge] : [],
    confidence: validated.needsReview ? 0.55 : 0.9,
    needsReview: validated.needsReview,
    uncertain: validated.uncertain,
    validation: validated.validation,
    mergeReasons: validated.mergeReasons,
    optionLabels: validated.optionLabels,
    rawModelBoxes: validated.rawModelBoxes,
    ocrLineBoxes: validated.ocrLineIndexes.map((index) => ({ index, ...blocks[index] })).filter((item) => item.text),
    generatedBy: "vision-ocr-question-merge"
  };
}

function validateNonOverlappingQuestions(questions, width, height) {
  const boundaryGap = getBoundaryGap(height);
  const minimumHeight = Math.max(18, Math.round(height * 0.02));
  const sorted = (Array.isArray(questions) ? questions : [])
    .map((question) => ({ ...question, finalBox: { ...question.finalBox } }))
    .sort((a, b) => a.finalBox.y - b.finalBox.y || a.finalBox.x - b.finalBox.x);

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];
    const nextTop = Number.isFinite(Number(next.questionStartY)) ? Number(next.questionStartY) : next.finalBox.y;
    const currentBottom = current.finalBox.y + current.finalBox.h;
    const overlaps = currentBottom > nextTop - boundaryGap;
    console.log(`[boundary] Q${current.sourceQuestionNumber || current.displayIndex} original bottom: ${Math.round(current.originalBottom ?? currentBottom)}`);
    console.log(`[boundary] Q${next.sourceQuestionNumber || next.displayIndex} start: ${Math.round(nextTop)}`);
    console.log(`[boundary] Q${current.sourceQuestionNumber || current.displayIndex} overlaps Q${next.sourceQuestionNumber || next.displayIndex}: ${overlaps}`);

    if (!overlaps) continue;
    const correctedBottom = Math.max(current.finalBox.y + 1, nextTop - boundaryGap);
    const correctedHeight = correctedBottom - current.finalBox.y;
    current.finalBox.h = Math.max(1, Math.round(correctedHeight));
    current.x = current.finalBox.x;
    current.y = current.finalBox.y;
    current.w = current.finalBox.w;
    current.h = current.finalBox.h;
    current.nextQuestionStart = Math.round(nextTop);
    current.validation = [...(current.validation || []), "防重叠校验：底边已截断到下一题题号之前"];
    if (correctedHeight < minimumHeight) {
      current.needsReview = true;
      current.validation.push("需要确认：硬边界截断后题目高度过小");
    }
    console.log(`[boundary] Q${current.sourceQuestionNumber || current.displayIndex} corrected bottom: ${Math.round(correctedBottom)}`);
  }

  return sorted.map((question, index) => ({ ...question, displayIndex: index + 1 }));
}

function attachSupportingContentResults(questions, width, height) {
  const sorted = (Array.isArray(questions) ? questions : []).sort(
    (a, b) => a.finalBox.y - b.finalBox.y || a.finalBox.x - b.finalBox.x
  );
  const result = [];
  let currentMainQuestion = null;
  const mainQuestionsByNumber = new Map();
  for (const question of sorted) {
    if (!isSupportingQuestionRole(question.questionRole)) {
      currentMainQuestion = question;
      if (question.sourceQuestionNumber) mainQuestionsByNumber.set(String(question.sourceQuestionNumber), question);
      result.push(question);
      continue;
    }
    const explicitParent = question.parentQuestionNumber
      ? mainQuestionsByNumber.get(String(question.parentQuestionNumber))
      : null;
    const parent = explicitParent || currentMainQuestion;
    if (!parent) {
      console.log(`[render] standalone card skipped`);
      console.log(`[render] fake Q${question.sourceQuestionNumber || question.displayIndex || "?"} prevented`);
      continue;
    }
    const mergedBox = unionPixelBoxes([parent.finalBox, question.finalBox], width, height);
    if (mergedBox) {
      parent.finalBox = {
        x: Math.round(mergedBox.x), y: Math.round(mergedBox.y), w: Math.round(mergedBox.w), h: Math.round(mergedBox.h)
      };
      parent.x = parent.finalBox.x;
      parent.y = parent.finalBox.y;
      parent.w = parent.finalBox.w;
      parent.h = parent.finalBox.h;
    }
    parent.subQuestions = [...new Set([...(parent.subQuestions || []), ...(question.subQuestions || [])])];
    parent.mergeReasons = [
      ...(parent.mergeReasons || []),
      question.questionRole === "subQuestion"
        ? `独立小问（${question.subQuestions?.join("、") || "?"}）并入父题`
        : "表格、图形、公式或续接区域并入父题"
    ];
    if (question.questionRole === "subQuestion") {
      console.log(`[merge] subQuestion（${question.subQuestions?.join("、") || "?"}） merged into Q${parent.sourceQuestionNumber || "?"}`);
    } else {
      console.log(`[merge] table continuation merged into Q${parent.sourceQuestionNumber || "?"}`);
    }
    console.log(`[render] standalone card skipped`);
  }
  return result;
}

function getAnchorFinalBox(anchor, blocks, width, height) {
  const boundaryGap = getBoundaryGap(height);
  const topPadding = Math.max(2, Math.round(height * 0.007));
  const horizontalPadding = Math.max(8, Math.round(width * 0.015));
  const anchorLines = (anchor.lineIndexes || []).map((index) => blocks[index]).filter(Boolean);
  const contentLines = anchorLines.length ? anchorLines : blocks;
  const contentBox = unionPixelBoxes(contentLines, width, height) || anchor.box || { x: 0, y: anchor.startY, w: width, h: 1 };
  const top = Math.max(0, Math.round(anchor.startY - topPadding));
  const nextStart = Number(anchor.nextStartY);
  const bottom = Number.isFinite(nextStart) && nextStart < height
    ? Math.max(top + 1, Math.round(nextStart - boundaryGap))
    : height;
  const left = Math.max(0, Math.round(contentBox.x - horizontalPadding));
  const right = Math.min(width, Math.round(contentBox.x + contentBox.w + horizontalPadding));
  return { x: left, y: top, w: Math.max(1, right - left), h: Math.max(1, bottom - top) };
}

function alignQuestionToAnchor(question, anchor, blocks, width, height) {
  const anchorBox = getAnchorFinalBox(anchor, blocks, width, height);
  const originalBottom = question.finalBox.y + question.finalBox.h;
  const mergedHorizontal = unionPixelBoxes([
    { ...question.finalBox, y: anchorBox.y, h: anchorBox.h },
    anchorBox
  ], width, height) || anchorBox;
  const finalBox = {
    x: mergedHorizontal.x,
    y: anchorBox.y,
    w: mergedHorizontal.w,
    h: anchorBox.h
  };
  const truncated = originalBottom >= Number(anchor.nextStartY) - getBoundaryGap(height);
  console.log(`[boundary] Q${anchor.sourceQuestionNumber} originalBottom=${Math.round(originalBottom)}`);
  if (Number(anchor.nextStartY) < height) {
    if (anchor.nextQuestionNumber) {
      console.log(`[boundary] Q${anchor.nextQuestionNumber} startY=${Math.round(anchor.nextStartY)}`);
    }
    console.log(`[boundary] Q${anchor.sourceQuestionNumber} nextStartY=${Math.round(anchor.nextStartY)}`);
  }
  console.log(`[boundary] Q${anchor.sourceQuestionNumber} truncated=${truncated}`);
  console.log(`[boundary] Q${anchor.sourceQuestionNumber} correctedBottom=${Math.round(finalBox.y + finalBox.h)}`);
  return {
    ...question,
    ...finalBox,
    finalBox,
    number: anchor.sourceQuestionNumber,
    questionNumber: anchor.sourceQuestionNumber,
    sourceQuestionNumber: anchor.sourceQuestionNumber,
    questionRole: "mainQuestion",
    evidenceSource: "ocr-anchor",
    parentQuestionNumber: "",
    subQuestions: [...new Set([...(question.subQuestions || []), ...(anchor.subQuestions || [])])],
    questionStartY: Math.round(anchor.startY),
    nextQuestionStart: Number(anchor.nextStartY) < height ? Math.round(anchor.nextStartY) : null,
    optionLabels: [...new Set([...(question.optionLabels || []), ...(anchor.optionLabels || [])])],
    mergeReasons: [...(question.mergeReasons || []), "按 OCR 主问题号锚点校准题目区间"],
    validation: [...(question.validation || []), "题目范围已限制在相邻 OCR 主问题号之间"],
    ocrLineBoxes: (anchor.lineIndexes || []).map((index) => ({ index, ...blocks[index] })).filter((line) => line.text)
  };
}

function createQuestionFromAnchor(anchor, blocks, width, height, displayIndex) {
  const finalBox = getAnchorFinalBox(anchor, blocks, width, height);
  const text = String(anchor.text || "").trim();
  const optionLabels = Array.isArray(anchor.optionLabels) ? anchor.optionLabels : extractOptionLabels(text);
  const needsReview = normalizeSimilarityText(text).length < 6;
  const knowledge = inferKnowledgeFromText(text);
  console.log(`[rebuild] created Q${anchor.sourceQuestionNumber} from OCR anchors`);
  console.log(`[rebuild] Q${anchor.sourceQuestionNumber} top=${finalBox.y}`);
  console.log(`[rebuild] Q${anchor.sourceQuestionNumber} bottom=${finalBox.y + finalBox.h}`);
  return {
    ...finalBox,
    finalBox,
    originalBottom: finalBox.y + finalBox.h,
    questionStartY: Math.round(anchor.startY),
    nextQuestionStart: Number(anchor.nextStartY) < height ? Math.round(anchor.nextStartY) : null,
    number: anchor.sourceQuestionNumber,
    questionNumber: anchor.sourceQuestionNumber,
    sourceQuestionNumber: anchor.sourceQuestionNumber,
    questionRole: "mainQuestion",
    parentQuestionNumber: "",
    subQuestions: [...new Set(anchor.subQuestions || [])],
    displayIndex,
    title: text.slice(0, 100) || `题目 ${anchor.sourceQuestionNumber}`,
    problemText: text.slice(0, 100),
    type: optionLabels.length ? "选择题" : "未知",
    problemType: optionLabels.length ? "选择题" : "未知",
    knowledge,
    mainKnowledgePoint: knowledge,
    knowledgePoints: knowledge ? [knowledge] : [],
    confidence: needsReview ? 0.62 : 0.88,
    needsReview,
    uncertain: false,
    validation: [needsReview ? "需要确认：OCR 锚点题干较短" : "由 OCR 主问题号锚点补建，完整性检查通过"],
    mergeReasons: ["AI 未保留独立题目，使用现有 OCR 主问题号区间补建"],
    optionLabels,
    rawModelBoxes: [],
    ocrLineBoxes: (anchor.lineIndexes || []).map((index) => ({ index, ...blocks[index] })).filter((line) => line.text),
    generatedBy: "ocr-anchor-rebuild",
    generatedFrom: "ocr-anchor",
    isPrimary: true
  };
}

function reconcileQuestionsWithOcrAnchors(questions, anchors, blocks, width, height, { alignExisting = true } = {}) {
  const sortedAnchors = (Array.isArray(anchors) ? anchors : [])
    .filter((anchor) => anchor.sourceQuestionNumber)
    .sort((a, b) => a.startY - b.startY);
  if (!sortedAnchors.length) return questions;

  const source = Array.isArray(questions) ? questions : [];
  const byNumber = new Map();
  source.forEach((question) => {
    if (question.questionRole !== "mainQuestion" || !question.sourceQuestionNumber) return;
    const number = String(question.sourceQuestionNumber);
    if (!byNumber.has(number)) byNumber.set(number, []);
    byNumber.get(number).push(question);
  });
  const anchorNumbers = sortedAnchors.map((anchor) => String(anchor.sourceQuestionNumber));
  const aiNumbers = [...byNumber.keys()];
  const missingNumbers = anchorNumbers.filter((number) => !byNumber.has(number));
  console.log(`[sequence] anchors=[${anchorNumbers.join(",")}]`);
  console.log(`[sequence] aiQuestions=[${aiNumbers.join(",")}]`);
  console.log(`[sequence] missing=[${missingNumbers.join(",")}]`);
  sortedAnchors.forEach((anchor) => console.log(`[anchor] found Q${anchor.sourceQuestionNumber} at y=${Math.round(anchor.startY)}`));

  const anchorByNumber = new Map(sortedAnchors.map((anchor) => [String(anchor.sourceQuestionNumber), anchor]));
  const aligned = source.map((question) => {
    const anchor = anchorByNumber.get(String(question.sourceQuestionNumber || ""));
    if (!alignExisting || !anchor || question.questionRole !== "mainQuestion") return question;
    return alignQuestionToAnchor(question, anchor, blocks, width, height);
  });
  missingNumbers.forEach((number) => {
    aligned.push(createQuestionFromAnchor(anchorByNumber.get(number), blocks, width, height, aligned.length + 1));
  });
  return aligned
    .sort((a, b) => a.finalBox.y - b.finalBox.y || a.finalBox.x - b.finalBox.x)
    .map((question, index) => ({ ...question, displayIndex: index + 1 }));
}

function validateQuestionSequence(questions, anchors, blocks, width, height) {
  return reconcileQuestionsWithOcrAnchors(questions, anchors, blocks, width, height, { alignExisting: false });
}

function getBoundaryAnchorInfo(anchor, fallbackNextTop = Number.NaN) {
  const sourceQuestionNumber = String(anchor?.sourceQuestionNumber || anchor?.questionNumber || "").trim();
  const top = Number(anchor?.top ?? anchor?.startY);
  const nextStartY = Number(anchor?.nextStartY ?? fallbackNextTop);
  if (!sourceQuestionNumber || !Number.isFinite(top)) return null;
  return { ...anchor, sourceQuestionNumber, questionNumber: sourceQuestionNumber, top, startY: top, nextStartY };
}

function logQuestionCoordinateStage(stage, questions, boxField = "finalBox") {
  (Array.isArray(questions) ? questions : []).forEach((question) => {
    const number = String(question?.sourceQuestionNumber || question?.questionNumber || question?.number || "?");
    const box = boxField === "box" ? question?.box : question?.finalBox;
    if (!box) return;
    const top = Number(box.y);
    const bottom = top + Number(box.h);
    console.log(`[Q${number}][${stage}] top=${Math.round(top)} bottom=${Math.round(bottom)} x=${Math.round(Number(box.x) || 0)} w=${Math.round(Number(box.w) || 0)}`);
  });
}

function createMinimalQuestionFromBoundaryAnchor(anchor, nextTop, questions, context, displayIndex) {
  const { blocks = [], width = 0, height = 0 } = context || {};
  const normalizedAnchor = {
    ...anchor,
    sourceQuestionNumber: String(anchor.sourceQuestionNumber),
    startY: Number(anchor.top),
    nextStartY: Number.isFinite(nextTop) ? nextTop : (Number(anchor.nextStartY) || height),
    lineIndexes: anchor.lineIndexes || [],
    text: anchor.text || "",
    optionLabels: anchor.optionLabels || [],
    subQuestions: anchor.subQuestions || []
  };
  if (width > 0 && height > 0) {
    return createQuestionFromAnchor(normalizedAnchor, blocks, width, height, displayIndex);
  }

  const template = (Array.isArray(questions) ? questions : []).find((question) => question?.finalBox) || {};
  const templateBox = template.finalBox || {};
  const top = Math.round(Number(anchor.top));
  const bottom = Number.isFinite(nextTop)
    ? Math.max(top + 1, Math.round(nextTop - 1))
    : Math.max(top + 1, Math.round(top + Number(templateBox.h || 1)));
  const finalBox = {
    x: Math.round(Number(templateBox.x) || 0),
    y: top,
    w: Math.max(1, Math.round(Number(templateBox.w) || 1)),
    h: Math.max(1, bottom - top)
  };
  return {
    ...finalBox,
    finalBox,
    number: normalizedAnchor.sourceQuestionNumber,
    questionNumber: normalizedAnchor.sourceQuestionNumber,
    sourceQuestionNumber: normalizedAnchor.sourceQuestionNumber,
    questionRole: "mainQuestion",
    displayIndex,
    generatedFrom: "ocr-anchor",
    generatedBy: "ocr-anchor-rebuild",
    isPrimary: true,
    needsReview: false,
    validation: [],
    mergeReasons: ["Created from an existing OCR question-number anchor"],
    optionLabels: [],
    subQuestions: [],
    ocrLineBoxes: []
  };
}

function normalizeMainQuestionAnchorList(anchors = []) {
  const normalized = (Array.isArray(anchors) ? anchors : [])
    .map((anchor, index, list) => getBoundaryAnchorInfo(
      anchor,
      list[index + 1]?.top ?? list[index + 1]?.startY
    ))
    .filter(Boolean)
    .sort((a, b) => a.top - b.top || Number(a.sourceQuestionNumber) - Number(b.sourceQuestionNumber));
  const seen = new Set();
  return normalized.filter((anchor) => {
    const key = `${anchor.sourceQuestionNumber}:${Math.round(anchor.top)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getMainQuestionAnchorsInsideBox(box, anchors = []) {
  if (!box) return [];
  const top = Number(box.y);
  const bottom = top + Number(box.h);
  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom <= top) return [];
  return normalizeMainQuestionAnchorList(anchors).filter(
    (anchor) => anchor.top >= top && anchor.top < bottom
  );
}

function splitQuestionCandidatesByMainQuestionAnchors(questions, anchors, context = {}) {
  const sortedAnchors = normalizeMainQuestionAnchorList(anchors);
  if (!sortedAnchors.length) return Array.isArray(questions) ? questions : [];
  const source = Array.isArray(questions) ? questions : [];
  const splitResults = [];
  let didSplit = false;

  for (const question of source) {
    const candidateBox = question?.finalBox || question?.box;
    const anchorsInside = getMainQuestionAnchorsInsideBox(candidateBox, sortedAnchors);
    if (anchorsInside.length < 2) {
      splitResults.push(question);
      continue;
    }

    didSplit = true;
    console.log(
      `[multi-anchor-split] candidate=${question.sourceQuestionNumber || question.displayIndex || "?"} anchors=[${anchorsInside.map((anchor) => anchor.sourceQuestionNumber).join(",")}]`
    );
    for (const anchor of anchorsInside) {
      const anchorIndex = sortedAnchors.findIndex((candidate) =>
        candidate.sourceQuestionNumber === anchor.sourceQuestionNumber &&
        candidate.top === anchor.top
      );
      const nextAnchor = sortedAnchors[anchorIndex + 1];
      const rebuilt = createMinimalQuestionFromBoundaryAnchor(
        anchor,
        Number(nextAnchor?.top),
        source,
        context,
        splitResults.length + 1
      );
      const sameQuestion = String(question.sourceQuestionNumber || "") === String(anchor.sourceQuestionNumber);
      splitResults.push({
        ...rebuilt,
        ...(sameQuestion ? {
          title: question.title,
          problemText: question.problemText,
          type: question.type,
          problemType: question.problemType,
          knowledge: question.knowledge,
          mainKnowledgePoint: question.mainKnowledgePoint,
          knowledgePoints: question.knowledgePoints,
          confidence: question.confidence,
          rawModelBoxes: question.rawModelBoxes || []
        } : {}),
        sourceQuestionNumber: String(anchor.sourceQuestionNumber),
        questionNumber: String(anchor.sourceQuestionNumber),
        number: String(anchor.sourceQuestionNumber),
        questionRole: "mainQuestion",
        generatedFrom: "multi-anchor-split",
        generatedBy: "local-main-question-anchor-split",
        mergeReasons: [
          ...(sameQuestion ? question.mergeReasons || [] : rebuilt.mergeReasons || []),
          `候选区域包含 ${anchorsInside.length} 个合法主问题号，已按 OCR 锚点拆分`
        ]
      });
    }
  }

  if (!didSplit) return source;

  const primaryByNumber = new Map();
  for (const question of splitResults) {
    const number = String(question?.sourceQuestionNumber || "");
    if (!number) continue;
    const existing = primaryByNumber.get(number);
    if (!existing || (
      existing.generatedFrom === "multi-anchor-split" &&
      question.generatedFrom !== "multi-anchor-split"
    )) {
      primaryByNumber.set(number, question);
    }
  }
  const deduplicated = splitResults.filter((question) => {
    const number = String(question?.sourceQuestionNumber || "");
    return !number || primaryByNumber.get(number) === question;
  });
  const ordered = deduplicated
    .sort((a, b) => Number(a?.finalBox?.y ?? a?.box?.y ?? 0) - Number(b?.finalBox?.y ?? b?.box?.y ?? 0))
    .map((question, index) => ({ ...question, displayIndex: index + 1 }));
  if (Number(context.width) > 0 && Number(context.height) > 0) {
    return enforceHardQuestionBoundaries(ordered, sortedAnchors, context);
  }
  return ordered;
}

function splitQuestionsUntilSingleMainQuestion(questions, anchors, context = {}) {
  const sortedAnchors = normalizeMainQuestionAnchorList(anchors);
  let result = Array.isArray(questions) ? questions : [];
  const maxPasses = Math.max(1, sortedAnchors.length + 1);

  for (let pass = 0; pass < maxPasses; pass += 1) {
    const offenders = result.filter((question) =>
      getMainQuestionAnchorsInsideBox(question?.finalBox || question?.box, sortedAnchors).length > 1
    );
    if (!offenders.length) return result;
    console.log(`[multi-anchor-split] pass=${pass + 1} offenders=${offenders.length}`);
    const split = splitQuestionCandidatesByMainQuestionAnchors(result, sortedAnchors, context);
    if (split.length === result.length && split.every((question, index) => question === result[index])) break;
    result = enforceHardQuestionBoundaries(split, sortedAnchors, context);
  }

  const unresolved = result.find((question) =>
    getMainQuestionAnchorsInsideBox(question?.finalBox || question?.box, sortedAnchors).length > 1
  );
  if (unresolved) {
    const inside = getMainQuestionAnchorsInsideBox(unresolved.finalBox || unresolved.box, sortedAnchors);
    throw new Error(
      `Unable to split question crop with multiple main anchors: ${inside.map((anchor) => anchor.sourceQuestionNumber).join(",")}`
    );
  }
  return result;
}

function collectQuestionContentBlocks(question, anchor, nextAnchorTop, context = {}) {
  const blocks = Array.isArray(context.blocks) ? context.blocks : [];
  const candidates = [
    ...(Array.isArray(question?.ocrLineBoxes)
      ? question.ocrLineBoxes.map((block) => ({ ...block, contentSource: "ocr" }))
      : []),
    ...(Array.isArray(question?.rawModelBoxes)
      ? question.rawModelBoxes.map((block) => ({ ...block, contentSource: "vision" }))
      : []),
    ...(Array.isArray(anchor?.lineIndexes)
      ? anchor.lineIndexes.map((index) => blocks[index]).filter(Boolean).map((block) => ({ ...block, contentSource: "ocr-anchor" }))
      : []),
    ...blocks.filter((block) => {
      const centerY = Number(block?.y) + Number(block?.h) / 2;
      return Number.isFinite(centerY) && centerY >= Number(anchor.top) && (
        !Number.isFinite(nextAnchorTop) || centerY < nextAnchorTop
      );
    }).map((block) => ({ ...block, contentSource: "ocr-interval" }))
  ];
  const seen = new Set();
  return candidates.filter((block) => {
    const x = Number(block?.x);
    const y = Number(block?.y);
    const w = Number(block?.w ?? block?.width);
    const h = Number(block?.h ?? block?.height);
    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return false;
    if (Number.isFinite(nextAnchorTop) && y >= nextAnchorTop) return false;
    if (
      block.contentSource === "vision" &&
      Number.isFinite(nextAnchorTop) &&
      y + h >= nextAnchorTop
    ) return false;
    const key = `${Math.round(x * 10)}:${Math.round(y * 10)}:${Math.round(w * 10)}:${Math.round(h * 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((block) => ({
    ...block,
    x: Number(block.x),
    y: Number(block.y),
    w: Number(block.w ?? block.width),
    h: Number(block.h ?? block.height)
  }));
}

function contentBlockBottom(block) {
  return Number(block?.y) + Number(block?.h ?? block?.height);
}

function isFormulaLikeContent(block) {
  const text = String(block?.text || "");
  return /[=+\-*/√∠∫∑()（）\[\]{}]|(?:cm|mm|km|m)(?:2|3|²|³)?\b|\d+\s*\/\s*\d+/iu.test(text);
}

function isBottomTooTight(question, contentBlocks, finalBottom, medianLineHeight = 0) {
  if (!Array.isArray(contentBlocks) || !contentBlocks.length) return false;
  const sorted = contentBlocks.slice().sort((a, b) => contentBlockBottom(a) - contentBlockBottom(b));
  const last = sorted[sorted.length - 1];
  const contentBottom = contentBlockBottom(last);
  const distance = Number(finalBottom) - contentBottom;
  return distance < 8 ||
    distance < Number(medianLineHeight || 0) * 0.4 ||
    isFormulaLikeContent(last) ||
    contentBottom >= Number(finalBottom);
}

function validateCropContainsContent(question, details) {
  const contentBottom = Number(details.contentBottom);
  const hardBottom = Number(details.hardBottom);
  const bottomPadding = Number(details.bottomPadding);
  const medianLineHeight = Number(details.medianLineHeight);
  let finalBottom = Number(details.finalBottom);
  const minimumSafetyPadding = Math.max(8, medianLineHeight * 0.4);
  const requiredBottom = Math.ceil(contentBottom + Math.max(minimumSafetyPadding, bottomPadding));
  if (finalBottom < requiredBottom) {
    const expandedTo = finalBottom < hardBottom
      ? Math.min(Math.ceil(hardBottom), requiredBottom)
      : finalBottom;
    console.warn(
      `[crop-incomplete] Q${question.sourceQuestionNumber} contentBottom=${Math.ceil(contentBottom)} finalBottom=${Math.ceil(finalBottom)} distance=${Math.ceil(finalBottom - contentBottom)} expandedTo=${expandedTo}`
    );
    if (expandedTo <= contentBottom) {
      question.needsReview = true;
      question.validation = [
        ...(question.validation || []),
        "需要确认：内容底部已触及下一题硬边界，无法继续向下扩展"
      ];
    }
    finalBottom = expandedTo;
  }
  return finalBottom;
}

function enforceHardQuestionBoundaries(questions, anchors, context = {}) {
  const width = Number(context.width) || Math.max(
    1,
    ...(Array.isArray(questions) ? questions : []).map((question) => Number(question?.finalBox?.x || 0) + Number(question?.finalBox?.w || 0)),
    ...(Array.isArray(context.blocks) ? context.blocks : []).map((block) => Number(block?.x || 0) + Number(block?.w ?? block?.width ?? 0))
  );
  const height = Number(context.height) || Math.max(
    1,
    ...(Array.isArray(questions) ? questions : []).map((question) => Number(question?.finalBox?.y || 0) + Number(question?.finalBox?.h || 0)),
    ...(Array.isArray(anchors) ? anchors : []).map((anchor) => Number(anchor?.nextStartY || anchor?.top || anchor?.startY || 0))
  );
  const boundaryGap = Number.isFinite(Number(context.boundaryGap))
    ? Math.max(1, Number(context.boundaryGap))
    : getBoundaryGap(height);
  const topPadding = Number.isFinite(Number(context.topPadding))
    ? Math.max(0, Number(context.topPadding))
    : Math.max(4, Math.round(height * 0.0035));
  const rawAnchors = (Array.isArray(anchors) ? anchors : [])
    .map((anchor, index, list) => getBoundaryAnchorInfo(anchor, list[index + 1]?.top ?? list[index + 1]?.startY))
    .filter(Boolean)
    .sort((a, b) => a.top - b.top);
  const sortedAnchors = rawAnchors.map((anchor, index) => ({
    ...anchor,
    cropTop: Math.max(0, Math.round(anchor.top - topPadding)),
    nextStartY: Number.isFinite(Number(rawAnchors[index + 1]?.top))
      ? Number(rawAnchors[index + 1].top)
      : Number(anchor.nextStartY)
  }));
  if (!sortedAnchors.length) return Array.isArray(questions) ? questions : [];

  const result = (Array.isArray(questions) ? questions : []).map((question) => ({
    ...question,
    finalBox: question.finalBox ? { ...question.finalBox } : null
  }));
  const byNumber = new Map();
  result.forEach((question) => {
    const number = String(question.sourceQuestionNumber || "");
    if (number && question.questionRole !== "subQuestion" && !byNumber.has(number)) byNumber.set(number, question);
  });
  const primaryBoxes = result
    .filter((question) => question?.questionRole !== "subQuestion" && question?.finalBox)
    .map((question) => question.finalBox)
    .filter((box) => [box.x, box.w].every((value) => Number.isFinite(Number(value))));
  const stableContentLeft = primaryBoxes.length >= 2
    ? median(primaryBoxes.map((box) => Number(box.x)))
    : Number.NaN;
  const stableContentRight = primaryBoxes.length >= 2
    ? median(primaryBoxes.map((box) => Number(box.x) + Number(box.w)))
    : Number.NaN;
  const stableContentWidth = stableContentRight - stableContentLeft;

  sortedAnchors.forEach((anchor, index) => {
    const number = String(anchor.sourceQuestionNumber);
    if (byNumber.has(number)) return;
    const created = createMinimalQuestionFromBoundaryAnchor(
      anchor,
      Number(sortedAnchors[index + 1]?.top),
      result,
      context,
      result.length + 1
    );
    result.push(created);
    byNumber.set(number, created);
    console.log(`[Q${number}][created] top=${created.finalBox.y} bottom=${created.finalBox.y + created.finalBox.h}`);
  });

  sortedAnchors.forEach((anchor, index) => {
    const question = byNumber.get(String(anchor.sourceQuestionNumber));
    if (!question?.finalBox) return;
    const previousAnchor = sortedAnchors[index - 1];
    const nextAnchor = sortedAnchors[index + 1];
    const nextAnchorTop = Number(nextAnchor?.top);
    const originalBox = { ...question.finalBox };
    const originalBottom = Number(originalBox.y) + Number(originalBox.h);
    let finalTop = Math.max(0, Math.floor(anchor.cropTop));
    const hasEarlierMainQuestion = result.some((candidate) =>
      candidate !== question &&
      candidate?.questionRole === "mainQuestion" &&
      candidate?.sourceQuestionNumber &&
      candidate?.finalBox &&
      Number(candidate.finalBox.y) < Number(anchor.top)
    );
    const contentBlocks = collectQuestionContentBlocks(question, anchor, nextAnchorTop, context);
    const lineHeights = contentBlocks
      .map((block) => Number(block.h))
      .filter((value) => Number.isFinite(value) && value > 0);
    const medianLineHeight = median(lineHeights) || Math.max(12, height * 0.012);
    const detectedContentTop = contentBlocks.length
      ? Math.min(...contentBlocks.map((block) => Number(block.y)).filter(Number.isFinite))
      : finalTop;
    if (
      !previousAnchor &&
      !hasEarlierMainQuestion &&
      !question.containsPageHeader &&
      Number.isFinite(detectedContentTop) &&
      detectedContentTop < finalTop
    ) {
      const maximumUpwardRecovery = Math.max(18, Math.min(60, Math.round(height * 0.035)));
      const topSafetyPadding = Math.max(8, Math.min(20, Math.round(medianLineHeight * 0.45)));
      const recoveredTop = Math.max(
        0,
        Math.floor(anchor.top - maximumUpwardRecovery),
        Math.floor(detectedContentTop - topSafetyPadding)
      );
      if (recoveredTop < finalTop) {
        console.log(
          `[top-recovery] Q${question.sourceQuestionNumber} anchorTop=${Math.floor(anchor.top)} contentTop=${Math.floor(detectedContentTop)} oldTop=${finalTop} recoveredTop=${recoveredTop}`
        );
        finalTop = recoveredTop;
        question.mergeReasons = [
          ...(question.mergeReasons || []),
          "题号上方已有视觉内容已向上恢复并保留"
        ];
        question.validation = [
          ...(question.validation || []),
          "顶部已根据现有视觉内容向上扩展"
        ];
      }
    }
    const detectedContentBottom = contentBlocks.length
      ? Math.max(...contentBlocks.map(contentBlockBottom))
      : originalBottom;
    const contentBottom = Math.min(
      Number.isFinite(nextAnchorTop) ? nextAnchorTop : height,
      Math.max(finalTop + 1, detectedContentBottom)
    );
    const lastContentBlock = contentBlocks
      .slice()
      .sort((a, b) => contentBlockBottom(a) - contentBlockBottom(b))
      .at(-1);
    const baseBottomPadding = Math.max(height * 0.015, medianLineHeight * 0.8);
    const bottomPadding = Math.min(
      40,
      Math.max(
        12,
        isFormulaLikeContent(lastContentBlock)
          ? Math.max(baseBottomPadding, medianLineHeight * 1.2, height * 0.018)
          : baseBottomPadding
      )
    );
    let desiredBottom = Math.ceil(contentBottom + bottomPadding);
    const standardHardBottom = Number.isFinite(nextAnchorTop)
      ? Math.min(
          Math.floor(nextAnchorTop - boundaryGap),
          Number.isFinite(Number(nextAnchor?.cropTop)) ? Math.floor(Number(nextAnchor.cropTop) - 1) : height
        )
      : height;
    if (Number.isFinite(nextAnchorTop)) {
      // OCR can miss option rows, formulas and figures. Preserve the complete
      // interval up to the next main-question anchor instead of ending at the
      // last detected text box.
      desiredBottom = Math.max(desiredBottom, standardHardBottom);
    }
    const unresolvedFollowingNumbers = Array.isArray(anchor.unresolvedFollowingNumbers)
      ? anchor.unresolvedFollowingNumbers.map(String).filter(Boolean)
      : [];
    const preserveUnresolvedGap = Boolean(
      nextAnchor &&
      anchor.preserveUnresolvedUntilNextAnchor &&
      unresolvedFollowingNumbers.length
    );
    if (preserveUnresolvedGap) {
      desiredBottom = Math.max(desiredBottom, standardHardBottom);
      question.needsReview = true;
      question.uncertain = true;
      question.mergedUnresolvedQuestionNumbers = unresolvedFollowingNumbers;
      question.mergeReasons = [
        ...(question.mergeReasons || []),
        `未能独立定位题目 ${unresolvedFollowingNumbers.join("、")}，其图像内容暂归入本题`
      ];
      question.validation = [
        ...(question.validation || []),
        `需要确认：题目 ${unresolvedFollowingNumbers.join("、")} 未能独立分块，内容已保留在本题中`
      ];
      console.log(
        `[sequence-fallback] unresolved=[${unresolvedFollowingNumbers.join(",")}] preserved in Q${question.sourceQuestionNumber} bottom=${standardHardBottom}`
      );
    }
    let hardBottom = standardHardBottom;
    if (
      nextAnchor &&
      contentBlocks.length > 0 &&
      desiredBottom > standardHardBottom &&
      contentBottom >= standardHardBottom
    ) {
      // Pixel crops use half-open ranges, so ending exactly at the next anchor
      // keeps every current-question pixel without including the next question.
      nextAnchor.cropTop = Math.max(Number(nextAnchor.cropTop) || 0, Math.floor(nextAnchorTop));
      hardBottom = Math.floor(nextAnchorTop);
      console.log(
        `[boundary-share] Q${question.sourceQuestionNumber} uses next anchor edge=${hardBottom}; Q${nextAnchor.sourceQuestionNumber} cropTop=${nextAnchor.cropTop}`
      );
    }
    let finalBottom = Math.max(finalTop + 1, Math.min(desiredBottom, hardBottom));
    if (isBottomTooTight(question, contentBlocks, finalBottom, medianLineHeight)) {
      finalBottom = validateCropContainsContent(question, {
        contentBottom,
        hardBottom,
        bottomPadding,
        medianLineHeight,
        finalBottom
      });
    }
    finalBottom = Math.max(finalTop + 1, Math.min(Math.ceil(finalBottom), Math.floor(hardBottom)));
    const originalLeft = Number(originalBox.x) || 0;
    const originalRight = originalLeft + Number(originalBox.w || 1);
    const shouldRecoverHorizontalBounds = Number.isFinite(stableContentWidth) &&
      stableContentWidth > 0 &&
      Number(originalBox.w || 0) < stableContentWidth * 0.72;
    const finalLeft = Math.max(
      0,
      Math.floor(shouldRecoverHorizontalBounds ? Math.min(originalLeft, stableContentLeft) : originalLeft)
    );
    const finalRight = Math.min(
      width,
      Math.max(
        finalLeft + 1,
        Math.ceil(shouldRecoverHorizontalBounds ? Math.max(originalRight, stableContentRight) : originalRight)
      )
    );
    if (shouldRecoverHorizontalBounds) {
      console.log(
        `[horizontal-recovery] Q${question.sourceQuestionNumber} left=${Math.round(originalLeft)} right=${Math.round(originalRight)} expandedLeft=${finalLeft} expandedRight=${finalRight}`
      );
    }
    question.finalBox = {
      x: finalLeft,
      y: finalTop,
      w: Math.max(1, finalRight - finalLeft),
      h: Math.max(1, finalBottom - finalTop)
    };
    question.x = question.finalBox.x;
    question.y = question.finalBox.y;
    question.w = question.finalBox.w;
    question.h = question.finalBox.h;
    question.questionStartY = finalTop;
    question.nextQuestionStart = Number.isFinite(nextAnchorTop) ? Math.floor(nextAnchorTop) : null;
    question.contentBottom = Math.ceil(contentBottom);
    question.bottomPadding = Math.ceil(bottomPadding);
    question.sourceQuestionNumber = String(anchor.sourceQuestionNumber);
    question.questionNumber = String(anchor.sourceQuestionNumber);
    question.number = String(anchor.sourceQuestionNumber);
    console.log(`[Q${question.sourceQuestionNumber}] contentBottom=${Math.ceil(contentBottom)}`);
    console.log(`[Q${question.sourceQuestionNumber}] medianLineHeight=${Math.round(medianLineHeight * 10) / 10}`);
    console.log(`[Q${question.sourceQuestionNumber}] bottomPadding=${Math.ceil(bottomPadding)}`);
    console.log(`[Q${question.sourceQuestionNumber}] nextQuestionTop=${Number.isFinite(nextAnchorTop) ? Math.floor(nextAnchorTop) : "page-end"}`);
    console.log(`[Q${question.sourceQuestionNumber}] desiredBottom=${desiredBottom}`);
    console.log(`[Q${question.sourceQuestionNumber}] finalBottom=${finalBottom}`);
    console.log(`[Q${question.sourceQuestionNumber}][after-boundary] top=${finalTop} bottom=${finalBottom} anchorTop=${Math.floor(anchor.top)} hardBottom=${hardBottom}`);
  });

  return result
    .filter((question) => question?.finalBox)
    .sort((a, b) => a.finalBox.y - b.finalBox.y || a.finalBox.x - b.finalBox.x)
    .map((question, index) => ({ ...question, displayIndex: index + 1 }));
}

function validateFinalQuestionBoxes(questions, anchors = []) {
  const sorted = (Array.isArray(questions) ? questions : [])
    .filter((question) => question?.finalBox)
    .slice()
    .sort((a, b) => a.finalBox.y - b.finalBox.y || a.finalBox.x - b.finalBox.x);
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];
    const currentBottom = Number(current.finalBox.y) + Number(current.finalBox.h);
    const nextTop = Number(next.finalBox.y);
    if (currentBottom > nextTop) {
      const error = new Error(
        `Question overlap: Q${current.sourceQuestionNumber} bottom=${currentBottom}, Q${next.sourceQuestionNumber} top=${nextTop}`
      );
      console.error(`[boundary-assert] ${error.message}`);
      if (process.env.NODE_ENV !== "production") throw error;
    }
  }
  return sorted;
}

function validateSingleMainQuestionPerCrop(questions, anchors = []) {
  const sortedAnchors = (Array.isArray(anchors) ? anchors : [])
    .map((anchor) => ({
      number: String(anchor.sourceQuestionNumber || anchor.questionNumber || ""),
      top: Number(anchor.top ?? anchor.startY)
    }))
    .filter((anchor) => anchor.number && Number.isFinite(anchor.top))
    .sort((a, b) => a.top - b.top);

  for (const question of Array.isArray(questions) ? questions : []) {
    if (!question?.finalBox) continue;
    const sourceNumber = String(question.sourceQuestionNumber || "");
    const cropTop = Number(question.finalBox.y);
    const cropBottom = cropTop + Number(question.finalBox.h);
    const anchorsInsideCrop = sortedAnchors.filter(
      (anchor) => anchor.top >= cropTop && anchor.top < cropBottom
    );
    const foreignAnchors = anchorsInsideCrop.filter((anchor) => anchor.number !== sourceNumber);
    console.log(
      `[single-question-check] Q${sourceNumber || "?"} anchors=[${anchorsInsideCrop.map((anchor) => anchor.number).join(",")}] top=${cropTop} bottom=${cropBottom}`
    );
    if (!foreignAnchors.length) continue;

    const error = new Error(
      `Question crop contains another main question: Q${sourceNumber || "?"} contains Q${foreignAnchors[0].number} at y=${foreignAnchors[0].top}`
    );
    console.error(`[single-question-assert] ${error.message}`);
    throw error;
  }
  return questions;
}

function normalizeQuestionText(text) {
  return String(text || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/题目\s*\d+/g, "")
    .replace(/ai\s*自动分割/gi, "")
    .replace(/[√×✓✗✔✘]/g, "")
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function questionTextPrefixSimilarity(leftText, rightText, length = 30) {
  const left = normalizeQuestionText(leftText).slice(0, length);
  const right = normalizeQuestionText(rightText).slice(0, length);
  if (!left || !right) return 0;
  let same = 0;
  const compared = Math.min(left.length, right.length);
  while (same < compared && left[same] === right[same]) same += 1;
  return same / Math.max(left.length, right.length);
}

function getQuestionOcrContext(question, blocks) {
  const box = question.finalBox || question;
  const sourceNumber = normalizeSourceQuestionNumber(question.sourceQuestionNumber || question.questionNumber);
  const numberingContext = createQuestionNumberContext(blocks);
  const lines = (Array.isArray(blocks) ? blocks : [])
    .map((block, index) => ({ ...block, index, centerY: block.y + block.h / 2 }))
    .filter((block) => block.centerY >= box.y && block.centerY <= box.y + box.h)
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const numberLines = lines.filter((line) => {
    const info = getQuestionNumberStartInfo(line.text, line, numberingContext);
    return info && (!sourceNumber || info.number === sourceNumber) && info.kind !== "caption";
  });
  const questionNumberTop = numberLines.length ? Math.min(...numberLines.map((line) => line.y)) : Number.NaN;
  const text = lines.map((line) => line.text).join(" ").replace(/\s+/g, " ").trim();
  return { lines, text, questionNumberTop };
}

function hasPageHeaderContent(question, imageHeight) {
  const text = String(question.ocrText || question.problemText || "");
  const keywordPatterns = [
    /班级/, /姓名/, /学校/, /考号/, /试卷/, /总分/, /时间/,
    /选择题/, /填空题/, /解答题/, /共\s*\d+\s*小题/, /每题\s*\d+\s*分/
  ];
  const matchedKeywords = keywordPatterns.filter((pattern) => pattern.test(text)).length;
  const nearPageTop = question.finalBox.y < imageHeight * 0.1;
  const hasClassAndName = /班级/.test(text) && /姓名/.test(text);
  const numberBelowTop = Number.isFinite(question.questionNumberTop) &&
    question.questionNumberTop - question.finalBox.y > question.finalBox.h * 0.2;
  return matchedKeywords >= 2 || (nearPageTop && hasClassAndName) || (nearPageTop && matchedKeywords >= 1 && numberBelowTop);
}

function scoreQuestionBox(question, groupMaxArea) {
  const text = question.ocrText || question.problemText || "";
  const optionLabels = extractOptionLabels(text);
  const hasQuestionNumber = Number.isFinite(question.questionNumberTop) || Boolean(question.sourceQuestionNumber);
  const normalized = normalizeQuestionText(text);
  const numberOffset = Number.isFinite(question.questionNumberTop)
    ? (question.questionNumberTop - question.finalBox.y) / Math.max(1, question.finalBox.h)
    : 1;
  let score = 0;
  if (hasQuestionNumber) score += 30;
  if (normalized.length >= 12) score += 20;
  if (optionLabels.length >= 2) score += 20;
  if (optionLabels.length >= 4) score += 15;
  if (numberOffset >= 0 && numberOffset < 0.2) score += 15;
  if (question.containsPageHeader) score -= 40;
  if (numberOffset > 0.2) score -= 25;
  const area = question.finalBox.w * question.finalBox.h;
  if (groupMaxArea > 0 && area > groupMaxArea * 0.82) score -= 10;
  score -= Math.min(8, Math.max(0, numberOffset) * 8);
  return score;
}

function deduplicateNestedQuestionBoxes(questions, blocks, width, height) {
  const topPadding = Math.max(2, Math.round(height * 0.007));
  const enriched = (Array.isArray(questions) ? questions : []).map((question) => {
    const copy = { ...question, finalBox: { ...question.finalBox } };
    const context = getQuestionOcrContext(copy, blocks);
    copy.ocrText = context.text || copy.problemText || "";
    copy.normalizedQuestionText = normalizeQuestionText(copy.ocrText);
    copy.questionNumberTop = context.questionNumberTop;
    copy.containsPageHeader = hasPageHeaderContent(copy, height);
    copy.isPrimary = true;

    if (copy.sourceQuestionNumber === "1" && Number.isFinite(copy.questionNumberTop)) {
      const oldBottom = copy.finalBox.y + copy.finalBox.h;
      const correctedTop = Math.max(0, copy.questionNumberTop - topPadding);
      if (correctedTop > copy.finalBox.y) {
        copy.finalBox.y = correctedTop;
        copy.finalBox.h = Math.max(1, oldBottom - correctedTop);
        copy.x = copy.finalBox.x;
        copy.y = copy.finalBox.y;
        copy.w = copy.finalBox.w;
        copy.h = copy.finalBox.h;
        copy.validation = [...(copy.validation || []), "已从第1题题号附近开始裁剪，移除页眉区域"];
      }
    }
    return copy;
  });

  const groups = new Map();
  enriched.forEach((question, index) => {
    const key = question.sourceQuestionNumber || `unknown:${index}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ question, index });
  });

  const removedIndexes = new Set();
  const removed = [];
  for (const [sourceQuestionNumber, entries] of groups.entries()) {
    if (entries.length < 2 || sourceQuestionNumber.startsWith("unknown:")) continue;
    const groupMaxArea = Math.max(...entries.map(({ question }) => question.finalBox.w * question.finalBox.h));
    entries.forEach(({ question }) => {
      question.dedupeScore = scoreQuestionBox(question, groupMaxArea);
    });
    console.log(`[dedupe] sourceQuestionNumber=${sourceQuestionNumber}`);
    console.log(`[dedupe] candidates=${entries.length}`);

    for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
      const leftEntry = entries[leftIndex];
      if (removedIndexes.has(leftEntry.index)) continue;
      for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
        const rightEntry = entries[rightIndex];
        if (removedIndexes.has(rightEntry.index)) continue;
        const left = leftEntry.question;
        const right = rightEntry.question;
        const intersection = boxIntersectionArea(left.finalBox, right.finalBox);
        const containmentLeft = intersection / Math.max(1, left.finalBox.w * left.finalBox.h);
        const containmentRight = intersection / Math.max(1, right.finalBox.w * right.finalBox.h);
        const prefixSimilarity = questionTextPrefixSimilarity(left.ocrText, right.ocrText);
        const jaccardSimilarity = textJaccardSimilarity(left.ocrText, right.ocrText);
        const smallTextInLarge = left.normalizedQuestionText.includes(right.normalizedQuestionText) ||
          right.normalizedQuestionText.includes(left.normalizedQuestionText);
        const nested = containmentLeft >= 0.8 || containmentRight >= 0.8;
        const sameQuestionEvidence = prefixSimilarity >= 0.65 || jaccardSimilarity >= 0.55 || smallTextInLarge || sourceQuestionNumber === left.sourceQuestionNumber;

        console.log(
          `[dedupe] boxA containment=${containmentLeft.toFixed(2)} containsPageHeader=${left.containsPageHeader} score=${left.dedupeScore.toFixed(1)}`
        );
        console.log(
          `[dedupe] boxB containment=${containmentRight.toFixed(2)} containsPageHeader=${right.containsPageHeader} score=${right.dedupeScore.toFixed(1)}`
        );
        if (!nested || !sameQuestionEvidence) continue;

        const keepLeft = left.dedupeScore >= right.dedupeScore;
        const keptEntry = keepLeft ? leftEntry : rightEntry;
        const removedEntry = keepLeft ? rightEntry : leftEntry;
        removedIndexes.add(removedEntry.index);
        removedEntry.question.isPrimary = false;
        const reason = removedEntry.question.containsPageHeader
          ? "nested duplicate with page header"
          : "nested duplicate with lower completeness score";
        console.log(`[dedupe] keep=box${keepLeft ? "A" : "B"}`);
        console.log(`[dedupe] remove=box${keepLeft ? "B" : "A"} reason=${reason}`);
        removed.push({
          ...removedEntry.question.finalBox,
          sourceQuestionNumber,
          reason
        });
        if (!keepLeft) break;
      }
    }
  }

  const finalQuestions = enriched
    .filter((question, index) => !removedIndexes.has(index))
    .map((question, index) => ({ ...question, displayIndex: index + 1, isPrimary: true }));
  return { questions: finalQuestions, removed };
}

const LAYOUT_IGNORED_LABELS = new Set([
  "header",
  "footer",
  "page_number",
  "header_image",
  "footer_image",
  "seal"
]);

function isRelevantLayoutRegion(region) {
  const label = String(region?.label || "").toLowerCase();
  return Boolean(label) && !LAYOUT_IGNORED_LABELS.has(label) && Number(region?.w) > 1 && Number(region?.h) > 1;
}

function buildLayoutContentBlocks(layoutRegions, anchors, width, height) {
  const regions = (Array.isArray(layoutRegions) ? layoutRegions : []).filter(isRelevantLayoutRegion);
  const orderedAnchors = (Array.isArray(anchors) ? anchors : [])
    .filter((anchor) => Number.isFinite(Number(anchor?.startY ?? anchor?.top)))
    .slice()
    .sort((a, b) => Number(a.startY ?? a.top) - Number(b.startY ?? b.top));
  const blocks = [];

  for (const region of regions) {
    const regionTop = Math.max(0, Number(region.y));
    const regionBottom = Math.min(height, regionTop + Number(region.h));
    if (!orderedAnchors.length) {
      blocks.push({
        text: `[layout:${region.label}]`,
        contentType: region.label,
        score: region.score,
        source: "paddle-layout",
        x: region.x,
        y: region.y,
        w: region.w,
        h: region.h
      });
      continue;
    }

    orderedAnchors.forEach((anchor, index) => {
      const bandTop = Math.max(0, Number(anchor.startY ?? anchor.top));
      const nextAnchor = orderedAnchors[index + 1];
      const bandBottom = nextAnchor
        ? Math.min(height, Number(nextAnchor.startY ?? nextAnchor.top))
        : height;
      const clippedTop = Math.max(regionTop, bandTop);
      const clippedBottom = Math.min(regionBottom, bandBottom);
      if (clippedBottom - clippedTop < 2) return;
      blocks.push({
        text: `[layout:${region.label}]`,
        contentType: region.label,
        score: region.score,
        source: "paddle-layout",
        parentQuestionNumber: String(anchor.sourceQuestionNumber || anchor.questionNumber || ""),
        x: Math.max(0, Math.round(region.x)),
        y: Math.max(0, Math.floor(clippedTop)),
        w: Math.max(1, Math.min(width - Math.max(0, Math.round(region.x)), Math.round(region.w))),
        h: Math.max(1, Math.ceil(clippedBottom) - Math.floor(clippedTop))
      });
    });
  }
  return blocks.sort((a, b) => a.y - b.y || a.x - b.x);
}

function assessLocalSegmentationConfidence({ anchors, ocrLines, layoutRegions, width, height }) {
  const orderedAnchors = (Array.isArray(anchors) ? anchors : [])
    .filter((anchor) => anchor?.sourceQuestionNumber && Number.isFinite(Number(anchor?.startY ?? anchor?.top)))
    .slice()
    .sort((a, b) => Number(a.startY ?? a.top) - Number(b.startY ?? b.top));
  const lines = Array.isArray(ocrLines) ? ocrLines : [];
  const regions = (Array.isArray(layoutRegions) ? layoutRegions : []).filter(isRelevantLayoutRegion);
  const reasons = [];
  let score = 0;

  if (orderedAnchors.length >= 2) score += 0.68;
  else if (orderedAnchors.length === 1) score += 0.38;
  else reasons.push("没有可靠主问题号锚点");

  if (lines.length >= 3) score += 0.12;
  else reasons.push("文字行过少");
  if (regions.length >= 1) score += 0.12;
  else reasons.push("版面检测未返回内容区域");

  const anchorNumbers = orderedAnchors.map((anchor) => Number(anchor.sourceQuestionNumber)).filter(Number.isFinite);
  const discontinuities = anchorNumbers.slice(1).filter((number, index) => number - anchorNumbers[index] > 1);
  if (discontinuities.length) {
    score -= 0.18;
    reasons.push("题号序列存在缺口");
  }
  const unresolvedSequentialMarkers = findUnresolvedSequentialMarkerCandidates(
    lines,
    orderedAnchors,
    width,
    height
  );
  if (unresolvedSequentialMarkers.length) {
    score -= 0.46;
    reasons.push(
      `存在未恢复的连续显式题号:${unresolvedSequentialMarkers.map((candidate) => candidate.number).join(",")}`
    );
    unresolvedSequentialMarkers.forEach((candidate) => {
      console.log(
        `[anchor-review] Q${candidate.number} explicit=true recovered=false ` +
        `text="${candidate.text.slice(0, 60)}" x=${Math.round(candidate.x)} y=${Math.round(candidate.y)}`
      );
    });
  }

  const firstTop = orderedAnchors.length ? Number(orderedAnchors[0].startY ?? orderedAnchors[0].top) : height;
  const lastTop = orderedAnchors.length ? Number(orderedAnchors.at(-1).startY ?? orderedAnchors.at(-1).top) : 0;
  const anchorCoverage = orderedAnchors.length >= 2 ? (lastTop - firstTop) / Math.max(1, height) : 0;
  if (orderedAnchors.length >= 2 && anchorCoverage >= 0.12) score += 0.08;

  const leadingLines = lines.filter((line) => {
    const lineBottom = Number(line.y || 0) + Number(line.h || 0);
    if (lineBottom >= firstTop - Math.max(8, height * 0.006)) return false;
    const text = String(line.text || "").trim();
    if (!text || isFigureOrTableLabel(text)) return false;
    return hasQuestionStemEvidence(text) ||
      (text.match(/[\u4e00-\u9fff]/gu) || []).length >= 4;
  });
  const leadingRegions = regions.filter((region) => {
    const regionTop = Number(region.y || 0);
    const regionBottom = regionTop + Number(region.h || 0);
    return regionTop < firstTop - height * 0.025 &&
      regionBottom <= firstTop + height * 0.01;
  });
  const leadingTopCandidates = [
    ...leadingLines.map((line) => Number(line.y || 0)),
    ...leadingRegions.map((region) => Number(region.y || 0))
  ].filter(Number.isFinite);
  const leadingTop = leadingTopCandidates.length ? Math.min(...leadingTopCandidates) : firstTop;
  const hasSubstantiveUnassignedLeadingContent =
    orderedAnchors.length > 0 &&
    firstTop >= Math.max(72, height * 0.12) &&
    (
      leadingLines.length >= 2 ||
      leadingRegions.some((region) => Number(region.h || 0) >= height * 0.045)
    ) &&
    firstTop - leadingTop >= height * 0.045;
  if (hasSubstantiveUnassignedLeadingContent) {
    score -= 0.46;
    reasons.push("首个题号上方存在大量未归属正文");
  }

  const looksLikeDensePage = lines.length >= 9 || regions.some((region) => region.h >= height * 0.45);
  if (looksLikeDensePage && orderedAnchors.length < 2) {
    score -= 0.25;
    reasons.push("整页内容密集但题号不足");
  }

  const uniqueNumbers = new Set(anchorNumbers);
  if (uniqueNumbers.size !== anchorNumbers.length) {
    score -= 0.2;
    reasons.push("题号锚点重复");
  }

  score = Math.max(0, Math.min(1, score));
  const threshold = Number(process.env.SEGMENT_LOCAL_CONFIDENCE_THRESHOLD || 0.72);
  const needsVisionReview = score < threshold;
  console.log(
    `[segment-confidence] score=${score.toFixed(2)} threshold=${threshold.toFixed(2)} ` +
    `anchors=[${anchorNumbers.join(",")}] lines=${lines.length} layout=${regions.length} ` +
    `visionReview=${needsVisionReview} reasons=${reasons.join(" | ") || "local evidence sufficient"}`
  );
  return { score, threshold, needsVisionReview, reasons, looksLikeDensePage, width, height };
}

async function handleSegmentV2(req, res) {
  const requestStartedAt = Date.now();
  const timings = {};
  const bodyReadStartedAt = Date.now();
  const body = await readJsonBody(req);
  timings.requestBodyReadMs = Date.now() - bodyReadStartedAt;
  if (!body.image || !body.width || !body.height) {
    sendJson(res, 400, { error: "缺少 image、width 或 height" });
    return;
  }

  const width = Number(body.width);
  const height = Number(body.height);
  const mode = String(body.mode || "initial");
  const forceVisionModel = !SEGMENT_FAST_MODE || mode === "strict_structure";
  const recognitionStrategy = forceVisionModel
    ? "aliyun-edu-paper-cut-first-strict-v1"
    : "aliyun-edu-paper-cut-first-v1";
  const ocrMaxSide = forceVisionModel ? OCR_MAX_SIDE : OCR_FAST_MAX_SIDE;
  const cacheLookupStartedAt = Date.now();
  const cacheKey = getSegmentCacheKey(body.image, width, height, `${mode}:${recognitionStrategy}`);
  const cachedSegment = getCachedSegmentResult(cacheKey);
  timings.cacheLookupMs = Date.now() - cacheLookupStartedAt;
  if (cachedSegment) {
    timings.backendTotalMs = Date.now() - requestStartedAt;
    timings.cacheHit = true;
    timings.originalColdBackendMs = Number(cachedSegment.timings?.backendTotalMs) || 0;
    console.log(`[segment-v2] result cache hit: ${cachedSegment.questions?.length || 0} questions`);
    console.log(`[segment-timing] ${JSON.stringify(timings)}`);
    sendJson(res, 200, { ...cachedSegment, timings, cacheHit: true });
    return;
  }

  const recognitionStartedAt = Date.now();
  let ocrPayload = { textBlocks: [], paperCutQuestions: [] };
  let layoutRegions = [];
  let eagerVisionResult = { status: "fulfilled", value: null };
  let paperCutUsed = false;
  let aliyunPaperCutError = "";
  const paperCutStartedAt = Date.now();
  try {
    const paperCut = await extractAliyunPaperCutResult(body.image, { width, height });
    timings.aliyunPaperCutMs = Date.now() - paperCutStartedAt;
    ocrPayload = {
      textBlocks: paperCut.blocks || [],
      paperCutQuestions: paperCut.questions || []
    };
    paperCutUsed = Boolean(ocrPayload.textBlocks.length || ocrPayload.paperCutQuestions.length);
  } catch (error) {
    timings.aliyunPaperCutMs = Date.now() - paperCutStartedAt;
    aliyunPaperCutError = error.message || String(error);
    console.warn("[segment-v2] Aliyun paper-cut OCR failed, trying local/Qwen fallback:", error.message || error);
  }

  // A successful education paper-cut response is already the desired final
  // segmentation. Avoid paying for the slower OCR/layout/vision verification
  // pipeline in the common case; only fall through when every returned block is
  // unusable after the existing local filters.
  if (SEGMENT_ALIYUN_FAST_PATH && ocrPayload.paperCutQuestions.length) {
    const directStartedAt = Date.now();
    const directQuestions = buildDirectAliyunQuestions(ocrPayload.paperCutQuestions, width, height);
    if (directQuestions.length) {
      timings.directAliyunMs = Date.now() - directStartedAt;
      timings.parallelRecognitionMs = Date.now() - recognitionStartedAt;
      timings.recognitionStrategy = "aliyun-edu-paper-cut-fast-path-v1";
      timings.ocrMaxSide = ocrMaxSide;
      timings.fastPath = "aliyun-paper-cut-direct";
      timings.backendTotalMs = Date.now() - requestStartedAt;
      timings.cacheHit = false;
      console.log(
        `[segment-v2] fast path: paperCutQuestions=${ocrPayload.paperCutQuestions.length}, ` +
        `direct=${directQuestions.length}, elapsed=${timings.backendTotalMs}ms`
      );
      console.log(`[render] final question numbers=[${directQuestions.map((question) => question.sourceQuestionNumber).filter(Boolean).join(",")}]`);
      const fastPayload = {
        questions: directQuestions,
        fallbackToWholePage: false,
        allowStrictRetry: false,
        note: "已使用阿里云教育版试卷切题 OCR 直接生成题目。",
        model: "Aliyun RecognizeEduPaperCut",
        provider: "aliyun-education-paper-cut-fast-path",
        recognitionStrategy: "aliyun-edu-paper-cut-fast-path-v1",
        ocrBlockCount: ocrPayload.textBlocks.length,
        layoutRegionCount: 0,
        localConfidence: null,
        visionUsed: false,
        timings,
        debug: {
          rawModelBoxes: normalizeVisualQuestionRegions(ocrPayload.paperCutQuestions, width, height).flatMap((question) => question.rawModelBoxes),
          ocrLineBoxes: ocrPayload.textBlocks.map((block, index) => ({ index, ...block })),
          layoutBoxes: [],
          finalBoxes: directQuestions.map((question) => ({
            sourceQuestionNumber: question.sourceQuestionNumber,
            needsReview: question.needsReview,
            ...question.finalBox
          })),
          boundaryLines: [],
          deduplicatedBoxes: []
        }
      };
      return sendSegmentResult(res, cacheKey, fastPayload);
    }
    console.warn("[segment-v2] fast path skipped: Aliyun paper-cut blocks were all filtered as non-question content");
  }

  if (SEGMENT_ALIYUN_ONLY) {
    const textBlocks = Array.isArray(ocrPayload?.textBlocks) ? ocrPayload.textBlocks : [];
    const paperCutQuestions = Array.isArray(ocrPayload?.paperCutQuestions) ? ocrPayload.paperCutQuestions : [];
    const directQuestions = buildDirectAliyunQuestions(paperCutQuestions, width, height);
    timings.parallelRecognitionMs = Date.now() - recognitionStartedAt;
    timings.recognitionStrategy = "aliyun-edu-paper-cut-only-v1";
    timings.ocrMaxSide = ocrMaxSide;
    timings.aliyunOnly = true;
    timings.backendTotalMs = Date.now() - requestStartedAt;
    timings.cacheHit = false;
    console.log(
      `[segment-v2] aliyun-only: paperCutQuestions=${paperCutQuestions.length}, direct=${directQuestions.length}, blocks=${textBlocks.length}, error=${aliyunPaperCutError || "none"}`
    );
    console.log(`[render] final question numbers=[${directQuestions.map((question) => question.sourceQuestionNumber).filter(Boolean).join(",")}]`);
    const aliyunOnlyPayload = {
      questions: directQuestions,
      fallbackToWholePage: false,
      note: directQuestions.length
        ? "仅使用阿里云教育版试卷切题 OCR 原始题块，已关闭本地 OCR、Qwen 和其他兜底。"
        : `仅使用阿里云教育版试卷切题 OCR，但阿里云没有返回可展示的题块；已关闭其他兜底。${aliyunPaperCutError ? `接口错误：${aliyunPaperCutError}` : ""}`,
      model: "Aliyun RecognizeEduPaperCut",
      provider: "aliyun-education-paper-cut-only",
      recognitionStrategy: "aliyun-edu-paper-cut-only-v1",
      ocrBlockCount: textBlocks.length,
      layoutRegionCount: 0,
      localConfidence: null,
      visionUsed: false,
      timings,
      debug: {
        rawModelBoxes: normalizeVisualQuestionRegions(paperCutQuestions, width, height).flatMap((question) => question.rawModelBoxes),
        ocrLineBoxes: textBlocks.map((block, index) => ({ index, ...block })),
        layoutBoxes: [],
        finalBoxes: directQuestions.map((question) => ({
          sourceQuestionNumber: question.sourceQuestionNumber,
          needsReview: question.needsReview,
          ...question.finalBox
        })),
        boundaryLines: [],
        deduplicatedBoxes: []
      }
    };
    if (!directQuestions.length) {
      return sendJson(res, 200, aliyunOnlyPayload);
    }
    return sendSegmentResult(res, cacheKey, aliyunOnlyPayload);
  }

  if (ocrPayload.paperCutQuestions.length) {
    timings.ocrMs = timings.aliyunPaperCutMs;
    timings.layoutMs = 0;
    timings.layoutSkipped = "aliyun-paper-cut-questions";
    timings.visionModelMs = 0;
    timings.visionDeferred = true;
    timings.visionSkipped = "aliyun-paper-cut-questions";
  } else {
    const fallbackStartedAt = Date.now();
    const ocrTask = (async () => {
      const startedAt = Date.now();
      try {
        if (ocrPayload.textBlocks.length) return ocrPayload;
        return {
          textBlocks: await extractTextBlocks(body.image, { maxSide: ocrMaxSide, skipAliyun: true }),
          paperCutQuestions: []
        };
      } finally {
        timings.ocrMs = (timings.aliyunPaperCutMs || 0) + Date.now() - startedAt;
      }
    })();
    const layoutTask = (async () => {
      const startedAt = Date.now();
      try {
        return await extractLayoutRegions(body.image, { maxSide: LAYOUT_MAX_SIDE });
      } finally {
        timings.layoutMs = Date.now() - startedAt;
      }
    })();
    const eagerVisionTask = forceVisionModel
      ? (async () => {
          const startedAt = Date.now();
          try {
            return await callVisionQuestionStructure(body.image);
          } finally {
            timings.visionModelMs = Date.now() - startedAt;
          }
        })()
      : Promise.resolve(null);
    if (!forceVisionModel) {
      timings.visionDeferred = true;
      timings.visionModelMs = 0;
    }
    const [ocrResult, layoutResult, visionResult] = await Promise.allSettled([
      ocrTask,
      layoutTask,
      eagerVisionTask
    ]);
    if (ocrResult.status === "fulfilled") ocrPayload = ocrResult.value;
    else console.warn("[segment-v2] OCR failed:", ocrResult.reason?.message || ocrResult.reason);
    if (layoutResult.status === "fulfilled") layoutRegions = layoutResult.value;
    else console.warn("[segment-v2] layout failed:", layoutResult.reason?.message || layoutResult.reason);
    eagerVisionResult = visionResult;
    timings.fallbackRecognitionMs = Date.now() - fallbackStartedAt;
  }
  timings.parallelRecognitionMs = Date.now() - recognitionStartedAt;
  timings.recognitionStrategy = recognitionStrategy;
  timings.ocrMaxSide = ocrMaxSide;
  const textBlocks = Array.isArray(ocrPayload)
    ? ocrPayload
    : (ocrPayload.textBlocks || []);
  const paperCutQuestions = Array.isArray(ocrPayload?.paperCutQuestions)
    ? ocrPayload.paperCutQuestions
    : [];
  let visionQuestions = [
    ...paperCutQuestions,
    ...(eagerVisionResult.status === "fulfilled" ? eagerVisionResult.value?.questions || [] : [])
  ];
  let visionUsed = (forceVisionModel && visionQuestions.length > 0) || paperCutQuestions.length > 0;
  if (eagerVisionResult.status === "rejected") console.warn("[segment-v2] vision failed:", eagerVisionResult.reason?.message || eagerVisionResult.reason);

  if (SEGMENT_ALIYUN_ONLY) {
    const directQuestions = buildDirectAliyunQuestions(paperCutQuestions, width, height);
    timings.aliyunOnly = true;
    timings.backendTotalMs = Date.now() - requestStartedAt;
    timings.cacheHit = false;
    console.log(
      `[segment-v2] aliyun-only: paperCutQuestions=${paperCutQuestions.length}, direct=${directQuestions.length}, blocks=${textBlocks.length}`
    );
    console.log(`[render] final question numbers=[${directQuestions.map((question) => question.sourceQuestionNumber).filter(Boolean).join(",")}]`);
    return sendSegmentResult(res, cacheKey, {
      questions: directQuestions,
      fallbackToWholePage: false,
      note: directQuestions.length
        ? "仅使用阿里云教育版试卷切题 OCR 原始题块，已关闭本地 OCR、Qwen 和其他兜底。"
        : `仅使用阿里云教育版试卷切题 OCR，但阿里云没有返回可展示的题块；已关闭其他兜底。${aliyunPaperCutError ? `接口错误：${aliyunPaperCutError}` : ""}`,
      model: "Aliyun RecognizeEduPaperCut",
      provider: "aliyun-education-paper-cut-only",
      recognitionStrategy: "aliyun-edu-paper-cut-only-v1",
      ocrBlockCount: textBlocks.length,
      layoutRegionCount: 0,
      localConfidence: null,
      visionUsed: false,
      timings,
      debug: {
        rawModelBoxes: normalizeVisualQuestionRegions(paperCutQuestions, width, height).flatMap((question) => question.rawModelBoxes),
        ocrLineBoxes: textBlocks.map((block, index) => ({ index, ...block })),
        layoutBoxes: [],
        finalBoxes: directQuestions.map((question) => ({
          sourceQuestionNumber: question.sourceQuestionNumber,
          needsReview: question.needsReview,
          ...question.finalBox
        })),
        boundaryLines: [],
        deduplicatedBoxes: []
      }
    });
  }

  const anchorStageStartedAt = Date.now();
  const groupedOcrLines = groupOcrBlocksIntoLines(textBlocks, width, height);
  const ocrLines = mergeDetachedQuestionNumberLines(groupedOcrLines, width);
  let mainQuestionAnchors = extractMainQuestionAnchors(ocrLines, width, height);
  mainQuestionAnchors = recoverNumberMarkerAnchors(
    ocrLines,
    mainQuestionAnchors,
    visionQuestions,
    width,
    height
  );
  mainQuestionAnchors = recoverSequentialExplicitQuestionAnchors(
    ocrLines,
    mainQuestionAnchors,
    width,
    height
  );
  mainQuestionAnchors = recoverLeadingMalformedQuestionAnchor(
    ocrLines,
    mainQuestionAnchors,
    width,
    height
  );
  mainQuestionAnchors = recoverDiscontinuousQuestionAnchors(
    ocrLines,
    mainQuestionAnchors,
    visionQuestions,
    width,
    height
  );
  let localConfidence = assessLocalSegmentationConfidence({
    anchors: mainQuestionAnchors,
    ocrLines,
    layoutRegions,
    width,
    height
  });
  timings.localConfidence = localConfidence.score;
  if (!forceVisionModel && localConfidence.needsVisionReview) {
    const visionStartedAt = Date.now();
    try {
      const review = await callVisionQuestionStructure(body.image);
      visionQuestions = [...paperCutQuestions, ...(review?.questions || [])];
      visionUsed = visionQuestions.length > 0;
      timings.visionFallbackTriggered = true;
      timings.visionDeferred = false;
    } catch (error) {
      timings.visionFallbackTriggered = true;
      timings.visionFallbackFailed = true;
      console.warn("[segment-v2] low-confidence Qwen review failed:", error.message || error);
    } finally {
      timings.visionModelMs = Date.now() - visionStartedAt;
    }
  }
  if (visionQuestions.length) {
    mainQuestionAnchors = extractMainQuestionAnchors(ocrLines, width, height);
    mainQuestionAnchors = recoverNumberMarkerAnchors(
      ocrLines,
      mainQuestionAnchors,
      visionQuestions,
      width,
      height
    );
    mainQuestionAnchors = recoverSequentialExplicitQuestionAnchors(
      ocrLines,
      mainQuestionAnchors,
      width,
      height
    );
    mainQuestionAnchors = recoverLeadingMalformedQuestionAnchor(
      ocrLines,
      mainQuestionAnchors,
      width,
      height
    );
    mainQuestionAnchors = recoverDiscontinuousQuestionAnchors(
      ocrLines,
      mainQuestionAnchors,
      visionQuestions,
      width,
      height
    );
  }
  localConfidence = assessLocalSegmentationConfidence({
    anchors: mainQuestionAnchors,
    ocrLines,
    layoutRegions,
    width,
    height
  });
  timings.localConfidence = localConfidence.score;
  const layoutContentBlocks = buildLayoutContentBlocks(
    layoutRegions,
    mainQuestionAnchors,
    width,
    height
  );
  const contentBlocks = [...textBlocks, ...layoutContentBlocks];
  mainQuestionAnchors.forEach((anchor) => {
    console.log(`[Q${anchor.sourceQuestionNumber}][anchor] top=${Math.round(anchor.startY)}`);
  });
  const ocrBands = buildOcrQuestionBands(textBlocks, width, height, {
    ocrLines,
    anchors: mainQuestionAnchors
  });
  timings.ocrLineAndAnchorMs = Date.now() - anchorStageStartedAt;
  console.log(
    `[segment-v2] strategy=${recognitionStrategy}, raw vision=${visionQuestions.length}, ` +
    `OCR lines=${textBlocks.length}, layout regions=${layoutRegions.length}, content blocks=${contentBlocks.length}`
  );
  console.log(`[ai] AI questions=[${visionQuestions.map((question) => normalizeSourceQuestionNumber(question.questionNumber)).filter(Boolean).join(",")}]`);
  logQuestionCoordinateStage("ai", normalizeVisualQuestionRegions(visionQuestions, width, height), "box");
  const regionStageStartedAt = Date.now();
  const normalized = normalizeQuestionRegions(visionQuestions, ocrBands, textBlocks, width, height);
  const merged = mergeQuestionRegions(normalized, width, height);
  logQuestionCoordinateStage("after-merge", merged, "box");
  const deduplicated = deduplicateQuestions(merged, width, height);
  logQuestionCoordinateStage("after-dedupe", deduplicated.questions, "box");
  let validated = deduplicated.questions.map((question, index, list) =>
    validateQuestionCrop(question, list[index + 1], contentBlocks, width, height)
  );
  timings.regionMergeAndInitialValidationMs = Date.now() - regionStageStartedAt;
  logQuestionCoordinateStage("after-initial-boundary", validated);

  if (!validated.length && textBlocks.length) {
    const fallback = buildQuestionBoxesByNumberStarts(textBlocks, width, height);
    validated = fallback.map((question) => ({
      sourceQuestionNumber: question.questionNumber || question.number || "",
      summary: question.problemText || question.title || "",
      type: question.problemType || question.type || "未知",
      text: question.problemText || question.title || "",
      rawModelBoxes: [],
      ocrLineIndexes: [],
      optionLabels: [],
      mergeReasons: ["视觉结构不可用，采用 OCR 题号区间兜底"],
      uncertain: true,
      needsReview: true,
      validation: ["需要确认：视觉结构未返回"],
      finalBox: { x: question.x, y: question.y, w: question.w, h: question.h }
    }));
  }

  const reconciliationStageStartedAt = Date.now();
  let questions = validated.map((question, index) => buildFinalQuestionPayload(question, textBlocks, width, height, index + 1));
  questions = splitQuestionCandidatesByMainQuestionAnchors(
    questions,
    ocrBands,
    { blocks: contentBlocks, width, height }
  );
  questions = reconcileQuestionsWithOcrAnchors(questions, ocrBands, contentBlocks, width, height);
  questions = attachSupportingContentResults(questions, width, height);
  questions = reconcileQuestionsWithOcrAnchors(questions, ocrBands, contentBlocks, width, height);
  questions = validateNonOverlappingQuestions(questions, width, height);
  const nestedDedupe = deduplicateNestedQuestionBoxes(questions, textBlocks, width, height);
  logQuestionCoordinateStage("after-nested-dedupe", nestedDedupe.questions);
  questions = validateQuestionSequence(nestedDedupe.questions, ocrBands, contentBlocks, width, height);
  if (!questions.length) {
    const wholePage = buildWholePageQuestion(width, height, "视觉模型和 OCR 均未可靠识别，保留整页");
    questions = [{
      ...wholePage,
      finalBox: { x: 0, y: 0, w: width, h: height },
      sourceQuestionNumber: "",
      displayIndex: 1,
      needsReview: true,
      uncertain: true,
      validation: ["需要确认：未识别出题目边界"],
      mergeReasons: ["整页兜底"],
      optionLabels: [],
      rawModelBoxes: [],
      ocrLineBoxes: [],
      generatedBy: "whole-page-review-fallback"
    }];
  }
  timings.reconciliationAndDedupeMs = Date.now() - reconciliationStageStartedAt;

  const finalBoundaryStageStartedAt = Date.now();
  questions = enforceHardQuestionBoundaries(questions, ocrBands, { blocks: contentBlocks, width, height });
  questions = splitQuestionsUntilSingleMainQuestion(
    questions,
    ocrBands,
    { blocks: contentBlocks, width, height }
  );
  validateFinalQuestionBoxes(questions, ocrBands);
  validateSingleMainQuestionPerCrop(questions, ocrBands);
  timings.finalBoundaryValidationMs = Date.now() - finalBoundaryStageStartedAt;
  logQuestionCoordinateStage("api-response", questions);

  const debugBuildStartedAt = Date.now();
  const debug = {
    rawModelBoxes: normalizeVisualQuestionRegions(visionQuestions, width, height).flatMap((question) => question.rawModelBoxes),
    ocrLineBoxes: textBlocks.map((block, index) => ({ index, ...block })),
    layoutBoxes: layoutRegions.map((region, index) => ({ index, ...region })),
    finalBoxes: questions.map((question) => ({
      sourceQuestionNumber: question.sourceQuestionNumber,
      needsReview: question.needsReview,
      ...question.finalBox
    })),
    boundaryLines: questions.flatMap((question, index) => {
      const lines = [{
        y: question.questionStartY ?? question.finalBox.y,
        sourceQuestionNumber: question.sourceQuestionNumber,
        kind: "start"
      }];
      if (index < questions.length - 1) {
        lines.push({
          y: questions[index + 1].questionStartY ?? questions[index + 1].finalBox.y,
          sourceQuestionNumber: questions[index + 1].sourceQuestionNumber,
          kind: "hard-boundary"
        });
      }
      return lines;
    }),
    deduplicatedBoxes: [
      ...deduplicated.removed.map((item) => ({
        ...item.box,
        sourceQuestionNumber: item.sourceQuestionNumber,
        reason: item.reason
      })),
      ...nestedDedupe.removed
    ]
  };
  timings.debugPayloadBuildMs = Date.now() - debugBuildStartedAt;

  console.log(`[segment-v2] normalized=${normalized.length}, merged=${merged.length}, deduplicated=${deduplicated.questions.length}, nestedDeduplicated=${nestedDedupe.questions.length}, final=${questions.length}`);
  console.log(`[render] final question numbers=[${questions.map((question) => question.sourceQuestionNumber).filter(Boolean).join(",")}]`);
  questions.forEach((question) => {
    console.log(
      `[segment-v2] question=${question.sourceQuestionNumber || "?"}, reasons=${question.mergeReasons.join(" | ")}, validation=${question.validation.join(" | ")}`
    );
  });
  deduplicated.removed.forEach((item) => console.log(`[segment-v2] removed duplicate ${item.sourceQuestionNumber || "?"}: ${item.reason}`));

  timings.backendTotalMs = Date.now() - requestStartedAt;
  timings.cacheHit = false;
  console.log(`[segment-timing] ${JSON.stringify(timings)}`);

  sendSegmentResult(res, cacheKey, {
    questions,
    fallbackToWholePage: questions.length === 1 && questions[0].generatedBy === "whole-page-review-fallback",
    note: visionUsed
      ? "本地版面检测与 OCR 置信度不足，已由 Qwen 复核题目结构。"
      : "本地版面检测与 OCR 已并行完成题目切分。",
    model: visionUsed ? QWEN_VL_MODEL : (LAYOUT_ENABLED ? "PP-DocLayoutV2 + PaddleOCR" : "PaddleOCR"),
    provider: visionUsed ? "qwen-vision-paddle-layout-ocr-hybrid" : "paddle-layout-ocr-local",
    note: paperCutUsed
      ? "已优先使用阿里云教育版试卷切题 OCR，并完成题目后处理。"
      : (visionUsed ? "本地证据不足，已由 Qwen 复核题目结构。" : "本地版面检测与 OCR 已完成题目切分。"),
    model: paperCutUsed ? "Aliyun Edu PaperCut OCR" : (visionUsed ? QWEN_VL_MODEL : (LAYOUT_ENABLED ? "PP-DocLayoutV2 + PaddleOCR" : "PaddleOCR")),
    provider: paperCutUsed ? "aliyun-education-paper-cut-ocr-first" : (visionUsed ? "qwen-vision-paddle-layout-ocr-hybrid" : "paddle-layout-ocr-local"),
    recognitionStrategy,
    ocrBlockCount: textBlocks.length,
    layoutRegionCount: layoutRegions.length,
    localConfidence,
    visionUsed,
    timings,
    debug
  });
}

async function handleSegment(req, res) {
  const body = await readJsonBody(req);
  if (!body.image || !body.width || !body.height) {
    sendJson(res, 400, { error: "缺少 image、width 或 height" });
    return;
  }

  const width = Number(body.width);
  const height = Number(body.height);
  const mode = String(body.mode || "initial");
  const cacheKey = getSegmentCacheKey(body.image, width, height, mode);
  const cachedSegment = getCachedSegmentResult(cacheKey);
  if (cachedSegment) {
    console.log(`[segment] result cache hit: ${cachedSegment.questions?.length || 0} questions`);
    sendJson(res, 200, { ...cachedSegment, cacheHit: true });
    return;
  }

  const textBlocks = await extractTextBlocks(body.image);
  console.log(`[segment] OCR block count: ${textBlocks.length}`);

  if (!textBlocks.length) {
    const questions = [buildWholePageQuestion(width, height, "OCR 未识别到文字块，返回整页题块")];
    console.log("[segment] LLM grouping skipped: no OCR blocks");
    console.log(`[segment] final box count: ${questions.length}`);
    sendSegmentResult(res, cacheKey, {
      questions,
      fallbackToWholePage: true,
      note: "OCR 未识别到文字块；TODO: 接入 PaddleOCR 或其他 OCR 服务后可细分题目。",
      model: SEGMENT_MODEL,
      ocrBlockCount: 0
    });
    return;
  }

  const fastNumberQuestions = buildQuestionBoxesByNumberStarts(textBlocks, width, height);
  const fastSplitReliable = isConsecutiveQuestionSplit(fastNumberQuestions);
  const repairedFastNumberQuestions = fastSplitReliable ? [] : repairQuestionNumberSplit(fastNumberQuestions, width, height, textBlocks);
  const repairedFastSplitReliable = isConsecutiveQuestionSplit(repairedFastNumberQuestions);
  if (fastNumberQuestions.length && !fastSplitReliable) {
    console.log(
      `[segment] fast question-number split not reliable, continue to LLM: ${questionNumberList(fastNumberQuestions).join(",") || "no-number"}`
    );
  }
  if (SEGMENT_FAST_MODE && fastSplitReliable) {
    console.log(`[segment] fast question-number split count: ${fastNumberQuestions.length}`);
    sendSegmentResult(res, cacheKey, {
      questions: fastNumberQuestions,
      fallbackToWholePage: false,
      note: "已按题号位置快速切分，跳过大模型分组。",
      model: "ocr-question-number-fast-path",
      ocrBlockCount: textBlocks.length
    });
    return;
  }
  if (SEGMENT_FAST_MODE && repairedFastSplitReliable) {
    console.log(
      `[segment] repaired question-number split count: ${repairedFastNumberQuestions.length}, numbers=${questionNumberList(repairedFastNumberQuestions).join(",")}`
    );
    sendSegmentResult(res, cacheKey, {
      questions: repairedFastNumberQuestions,
      fallbackToWholePage: false,
      note: "已按题号和缺号位置修复切分，跳过大模型分组。",
      model: "ocr-question-number-repaired-fast-path",
      ocrBlockCount: textBlocks.length
    });
    return;
  }

  let grouping = { questions: [], note: "" };
  try {
    grouping = await callDeepSeekJson({
      model: SEGMENT_MODEL,
      schema: segmentGroupingSchema,
      instructions: OCR_GROUPING_PROMPT,
      content: [
        {
          type: "input_text",
          text: JSON.stringify({
            imageSize: { width, height },
            blocks: textBlocks.map((block, index) => ({ index, ...block })),
            outputContract:
              "只返回每道题包含的 blockIndexes、number、title、type、knowledge。不要返回 x/y/w/h。"
          })
        }
      ],
      maxOutputTokens: 3000,
      timeoutMs: SEGMENT_LLM_TIMEOUT_MS
    });
  } catch (error) {
    console.warn("[segment] LLM grouping failed, fallback to whole page:", error.message || error);
  }

  console.log(`[segment] LLM grouping result: ${JSON.stringify(grouping.questions || []).slice(0, 1200)}`);
  let questions = mergeDuplicateQuestionBoxes(
    buildQuestionBoxesFromGroups(grouping.questions, textBlocks, width, height),
    width,
    height
  );
  let usedNumberFallback = false;
  const numberFallbackQuestions = shouldPreferNumberFallback(questions, width, height)
    ? buildQuestionBoxesByNumberStarts(textBlocks, width, height)
    : [];
  const repairedNumberFallbackQuestions = isConsecutiveQuestionSplit(numberFallbackQuestions)
    ? []
    : repairQuestionNumberSplit(numberFallbackQuestions, width, height, textBlocks);
  if (isConsecutiveQuestionSplit(numberFallbackQuestions)) {
    console.log(`[segment] question-number fallback count: ${numberFallbackQuestions.length}`);
    questions = numberFallbackQuestions;
    usedNumberFallback = true;
  } else if (isConsecutiveQuestionSplit(repairedNumberFallbackQuestions)) {
    console.log(
      `[segment] repaired question-number fallback count: ${repairedNumberFallbackQuestions.length}, numbers=${questionNumberList(repairedNumberFallbackQuestions).join(",")}`
    );
    questions = repairedNumberFallbackQuestions;
    usedNumberFallback = true;
  } else if (numberFallbackQuestions.length > 1) {
    console.log(
      `[segment] question-number fallback not reliable, keep LLM/whole-page result: ${questionNumberList(numberFallbackQuestions).join(",")}`
    );
  }
  if (!questions.length) {
    questions = [buildWholePageQuestion(width, height, "LLM 未返回有效题目分组，返回整页题块")];
  }
  console.log(`[segment] final box count: ${questions.length}`);

  sendSegmentResult(res, cacheKey, {
    questions,
    fallbackToWholePage: questions.length === 1 && questions[0].x === 0 && questions[0].y === 0 && questions[0].w === width && questions[0].h === height,
    note: usedNumberFallback
      ? "LLM 未可靠拆分时，已按题号位置兜底切分。"
      : grouping.note || "OCR blocks grouped by LLM; boxes generated by server.",
    model: SEGMENT_MODEL,
    ocrBlockCount: textBlocks.length
  });
}

const transcriptCorrectionSchema = {
  name: "math_transcript_correction",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      correctedText: {
        type: "string",
        description: "Corrected Chinese speech transcript, preserving the student's original meaning."
      },
      changed: {
        type: "boolean",
        description: "Whether an obvious speech recognition error was corrected."
      }
    },
    required: ["correctedText", "changed"]
  }
};

const TRANSCRIPT_CORRECTION_PROMPT = [
  "你是初中数学讲解场景里的语音转写校对器。",
  "浏览器语音识别已经先输出了一段中文，请结合当前题目图片，只修正明显的同音词、数字、字母、数学术语或标点识别错误。",
  "例如把明显的 x、y、m、n、等于、比例、方程等数学表达恢复正确；不能凭空补充学生没有说过的步骤。",
  "如果无法确定，就保留原文，不要为了通顺而改写。不要总结、解释或回答题目，只返回校对后的原句。"
].join("\n");

const TRANSCRIPT_CORRECTION_PROMPT_V2 = [
  "你是初中数学讲解场景里的语音转写校对器。",
  "浏览器语音识别已经先输出了一段中文，前端也做了一次本地数学规范化。请结合当前题目图片、题卡摘要、知识点、黑板内容和前文讲解，只修正明显的同音词、近音词、数字、字母、数学术语或标点识别错误。",
  "学生讲解通常紧贴题目条件，所以当 ASR 文本里出现和题目无关的词，要优先考虑它是不是题目中的数学词被误识别了。",
  "重点恢复数学与题面词：x、y、m、n、等于、负数、加、减、乘、除、比例、方程、等式、左数、右数、相邻、下方、上方、箭头、共同指向、差、和、积、商、选项、结论。",
  "数学表达要尽量规范：三x/3X 写成 3x，5Y 写成 5y，等于负一写成 = -1，x减y写成 x - y。",
  "例如题目说“上方相邻的左数与右数之差等于下方箭头共同指向的数”，ASR 把“左数/右数/之差/箭头”听成“总数/右束支/树”等时，要按题目语义改回。",
  "黑板内容只能作为纠错上下文：如果学生当前语音和黑板正在写的式子一致，可以用黑板帮助恢复变量、符号和数字；但不能凭空把黑板上有、学生没说的步骤加入文本。",
  "只校对学生确实可能说过的这一句，不要补充新的解题步骤，不要替学生回答题目。",
  "如果无法确定，就保留原文。只返回 correctedText 和 changed。"
].join("\n");

async function handleTranscriptCorrection(req, res) {
  const body = await readJsonBody(req);
  const text = String(body.text || "").trim();
  if (!text || !body.questionImage) {
    sendJson(res, 200, { correctedText: text, changed: false, skipped: true });
    return;
  }

  let result;
  try {
    result = await callQwenMultimodalJson({
    model: QWEN_GUIDE_MODEL,
    schema: transcriptCorrectionSchema,
    instructions: TRANSCRIPT_CORRECTION_PROMPT_V2,
    content: [
      {
        type: "input_text",
        text: JSON.stringify({
          asrText: text,
          rawAsrText: body.rawAsrText || text,
          localNormalizedText: body.localNormalizedText || text,
          problemText: body.problemText || "",
          knowledgePoints: body.knowledgePoints || [],
          latestHandwritingResult: body.latestHandwritingResult || null,
          transcriptBeforeThisSentence: body.transcript || "",
          correctionGoal: "把语音识别结果校正成贴合当前题目的学生原话；优先保留 localNormalizedText 中已经规范好的数学符号；不要讲题，不要总结。",
          instruction: "只返回 correctedText 和 changed，不要回答题目。"
        })
      },
      { type: "input_image", label: "当前数学题目", image_url: body.questionImage, detail: "high" },
      ...(body.boardImage ? [{ type: "input_image", label: "当前黑板内容", image_url: body.boardImage, detail: "low" }] : [])
    ],
    maxOutputTokens: 500
  });

    const correctedText = String(result.correctedText || text).trim() || text;
    sendJson(res, 200, {
      correctedText,
      changed: Boolean(result.changed) && correctedText !== text,
      model: QWEN_GUIDE_MODEL,
      provider: "qwen-multimodal-transcript-correction"
    });
  } catch (error) {
    console.warn("[transcript-correction] failed", {
      errorType: classifyQwenError(error),
      code: error.code || "",
      parseError: error.parseError || ""
    });
    sendJson(res, 200, { correctedText: text, changed: false, fallback: true });
  }
}

async function handleArchiveSummary(req, res) {
  const body = await readJsonBody(req);
  if (!body.questionImage) {
    sendJson(res, 400, { error: "缺少题目图片", code: "missing_question_image" });
    return;
  }

  const result = await callQwenMultimodalJson({
    model: QWEN_GUIDE_MODEL,
    schema: archiveSummarySchema,
    instructions: ARCHIVE_SUMMARY_PROMPT,
    content: [
      {
        type: "input_text",
        text: JSON.stringify({
          questionTitle: body.questionTitle || "",
          problemText: body.problemText || "",
          knowledgePoints: body.knowledgePoints || [],
          lectureText: body.lectureText || "",
          verifiedFinalAnswer: body.verifiedFinalAnswer || "",
          handwritingSummary: body.latestHandwritingResult || null,
          instruction:
            "请生成保存到错题本里的恋恋总结和易错点。必须具体到这道题；如果题图中有原来做错的痕迹，请明确指出。"
        })
      },
      { type: "input_image", label: "当前错题图片，包含可能的原错痕迹和批改痕迹", image_url: body.questionImage, detail: "high" },
      ...(body.boardImage ? [{ type: "input_image", label: "学生本次黑板笔迹", image_url: body.boardImage, detail: "high" }] : [])
    ],
    maxOutputTokens: 900
  });

  const mistakePoints = Array.isArray(result.mistakePoints)
    ? result.mistakePoints.map((point) => String(point || "").trim()).filter(Boolean).slice(0, 4)
    : [];

  sendJson(res, 200, {
    lianSummary: String(result.lianSummary || "").trim(),
    mistakePoints,
    observedWrongTrace: String(result.observedWrongTrace || "").trim(),
    reviewFocus: String(result.reviewFocus || "").trim(),
    confidence: Number(result.confidence) || 0,
    model: QWEN_GUIDE_MODEL,
    provider: "qwen-multimodal-archive-summary"
  });
}

const archiveSummarySchema = {
  name: "wrong_question_archive_summary",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      lianSummary: {
        type: "string",
        description: "A concrete review summary for this exact problem, mentioning the core condition, method, and final conclusion."
      },
      mistakePoints: {
        type: "array",
        items: { type: "string" },
        description: "Specific mistake points for this exact problem. Prefer observed original wrong traces in the image when visible."
      },
      observedWrongTrace: {
        type: "string",
        description: "Visible prior wrong-answer trace from the problem image, such as crossed-out answer, red marks, circled correction, or blank if not visible."
      },
      reviewFocus: {
        type: "string",
        description: "One concrete focus for next review."
      },
      confidence: {
        type: "number",
        description: "Confidence from 0 to 1."
      }
    },
    required: ["lianSummary", "mistakePoints", "observedWrongTrace", "reviewFocus", "confidence"]
  }
};

const ARCHIVE_SUMMARY_PROMPT = [
  "你是恋恋错题本的错题归档分析助手。",
  "请只针对当前这一道题生成复习用内容，必须具体到题目，不要泛泛而谈。",
  "你会看到：题目图片、可能的黑板笔迹图片、学生最后讲解文字、已核对答案和题卡摘要。",
  "如果题目图片中能看到学生之前的错误痕迹，例如被红叉划掉的答案、圈出的错选项、红笔改正、擦写痕迹、旁边写的正确答案，要把它作为易错点的优先依据。",
  "不要把红笔批改或学生原先填写的答案当成标准答案；只能把它们作为“之前可能错在哪里”的证据。",
  "lianSummary 只写本题的关键条件、解法抓手和最后结果，1 到 2 句即可；不要写易错点、错误原因、原错痕迹，也不要出现“易错点是”“误以为”“错在”等内容。",
  "mistakePoints 才写本题专属易错点，2 到 4 条，每条指出具体位置或具体关系，例如“原来把 2:3:x:6 的对应顺序看反”“题图中被叉掉的 35°说明圆心角没有按 360×1/8 算”等。不要重复 lianSummary 已经说过的同一句话。",
  "如果看不到明确错题痕迹，也要根据题目、讲解文字和黑板步骤总结具体风险，不要说空泛的‘注意审题’。",
  "只输出 JSON。"
].join("\n");

const answerKeySolverSchema = {
  name: "verified_question_solution",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      status: { type: "string", enum: ["solved", "ambiguous", "unreadable"] },
      problemText: { type: "string" },
      questionType: { type: "string" },
      knowledge: { type: "string" },
      finalAnswer: { type: "string" },
      canonicalAnswer: { type: "string" },
      acceptedAnswers: { type: "array", items: { type: "string" } },
      givenConditions: { type: "array", items: { type: "string" } },
      choiceAnalysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          options: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                label: { type: "string" },
                text: { type: "string" }
              },
              required: ["label", "text"]
            }
          },
          statementVerdicts: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                text: { type: "string" },
                correct: { type: "boolean" },
                evidence: { type: "string" }
              },
              required: ["id", "text", "correct", "evidence"]
            }
          },
          selectedOption: { type: "string" },
          selectedOptionText: { type: "string" }
        },
        required: ["options", "statementVerdicts", "selectedOption", "selectedOptionText"]
      },
      solutionSteps: { type: "array", items: { type: "string" } },
      solutionOutline: { type: "array", items: { type: "string" } },
      verificationChecks: { type: "array", items: { type: "string" } },
      confidence: { type: "number" },
      uncertainty: { type: "string" },
      hasStudentAnswer: { type: "boolean" },
      studentAnswer: { type: "string" },
      isStudentAnswerCorrect: { type: "boolean" },
      studentWrongReason: { type: "string" },
      isSolved: { type: "boolean" }
    },
    required: [
      "status",
      "problemText",
      "questionType",
      "knowledge",
      "finalAnswer",
      "canonicalAnswer",
      "acceptedAnswers",
      "givenConditions",
      "choiceAnalysis",
      "solutionSteps",
      "solutionOutline",
      "verificationChecks",
      "confidence",
      "uncertainty",
      "hasStudentAnswer",
      "studentAnswer",
      "isStudentAnswerCorrect",
      "studentWrongReason",
      "isSolved"
    ]
  }
};

const answerKeyVerifierSchema = {
  name: "independent_solution_verification",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      verified: { type: "boolean" },
      independentlySolvedAnswer: { type: "string" },
      acceptedAnswers: { type: "array", items: { type: "string" } },
      choiceAnalysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          options: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                label: { type: "string" },
                text: { type: "string" }
              },
              required: ["label", "text"]
            }
          },
          statementVerdicts: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                text: { type: "string" },
                correct: { type: "boolean" },
                evidence: { type: "string" }
              },
              required: ["id", "text", "correct", "evidence"]
            }
          },
          selectedOption: { type: "string" },
          selectedOptionText: { type: "string" }
        },
        required: ["options", "statementVerdicts", "selectedOption", "selectedOptionText"]
      },
      confidence: { type: "number" },
      contradiction: { type: "string" },
      verificationSummary: { type: "string" }
    },
    required: [
      "verified",
      "independentlySolvedAnswer",
      "acceptedAnswers",
      "choiceAnalysis",
      "confidence",
      "contradiction",
      "verificationSummary"
    ]
  }
};

const guideMathAuditSchema = {
  name: "guide_math_audit",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      safe: { type: "boolean" },
      confidence: { type: "number" },
      issue: { type: "string" }
    },
    required: ["safe", "confidence", "issue"]
  }
};

const ANSWER_KEY_SOLVER_PROMPT = [
  "你是初中数学题的独立解题与标准答案生成器。正确性优先于速度。",
  "完整读取题目图片，只解决图片中的当前这一道主问题；若包含小问，需要分别给出答案。",
  "必须自己根据题目条件计算，不得把图片里学生手写答案、红笔批改、勾叉或已填答案当成正确依据。",
  "先核对题意、条件、单位、符号和问题所求，再用代入、逆算、枚举选项或另一种独立方法复核最终答案。",
  "canonicalAnswer 只写最终标准答案；acceptedAnswers 写数学上等价的答案表达。",
  "先建立题目事实清单：givenConditions 必须包含题干描述、题目明确给出的数字/关系、定义、图形箭头关系、坐标轴信息、表格单元格信息以及图片中明确标注的已知量；这些内容都不是推导步骤。",
  "givenConditions 与 solutionSteps、solutionOutline 必须语义互斥。solutionSteps 和 solutionOutline 只能写对已知条件进行的代入、变形、计算、证明和结论，不能把任何原题条件作为独立步骤重复写入。",
  "如果是选择题，必须返回 choiceAnalysis：逐字抄录可见的 A/B/C/D 选项，分别写入 options；如果题目包含结论 I/II 或多个判断，逐项写入 statementVerdicts，并独立判断 correct；selectedOption 必须根据这些选项文字匹配，selectedOptionText 必须完整写出对应含义。不能只返回字母。",
  "如果不是选择题，choiceAnalysis 返回空的 options、statementVerdicts，并将 selectedOption 和 selectedOptionText 返回空字符串。",
  "solutionOutline 和 verificationChecks 只写简洁、可核验的关键步骤，不写冗长推理。",
  "如果题图不完整、题意存在多解或无法可靠读取，status 必须为 ambiguous 或 unreadable，不能猜答案。",
  ORDERED_PROPORTION_RULES
].join("\n");

const STRICT_ANSWER_KEY_SOLVER_PROMPT = [
  "你是一名严谨的初中数学解题老师，也是标准答案生成器。正确性是底线。",
  "请阅读我提供的题目图片，只解决图片里的当前这一道题，识别题目内容，给出正确答案和必要解题步骤。",
  "必须先理解图片中的题目，不要套用历史题目或上下文中的旧题。",
  "如果图片里有学生手写答案、红笔批改、叉号、圈画或擦写痕迹，要区分题目原文和学生作答痕迹；这些痕迹只能用于 studentTrace，不能当成正确答案依据。",
  "最终答案必须经过计算核验。先核对题意、条件、单位、符号和问题所求，再用代入、逆算、枚举选项或另一种独立方法复核。",
  "如果题目是选择题，finalAnswer 和 canonicalAnswer 必须包含选项字母和选项含义，例如：C. I 不对，II 对。不要只返回 C。",
  "choiceAnalysis 是选项语义的唯一依据。先判断各结论，再按题图中实际出现的选项文字匹配字母；不要凭记忆假定 C 或 D 的含义。",
  "如果不是选择题，choiceAnalysis 返回空的 options、statementVerdicts，并将 selectedOption 和 selectedOptionText 返回空字符串。",
  "finalAnswer 和 canonicalAnswer 都写最终标准答案；acceptedAnswers 写数学上等价的答案表达。",
  "givenConditions 必须单独列出题干、图片、图形、表格和定义中直接给出的全部事实；例如题图直接给出 m-n=8 时，必须把 m-n=8 放入 givenConditions，而不是把它当作需要学生推导的步骤。",
  "solutionSteps 和 solutionOutline 只能写基于这些条件进行的具体变形或计算，不能重复列出 m-n=8 这类原题条件。",
  "verification.checks 写代入检查或计算核验过程。",
  "如果无法确定题目内容或答案，不要猜：status 返回 ambiguous 或 unreadable，finalAnswer/canonicalAnswer 为空，verification.isSolved 为 false，confidence 低于 0.6，并在 uncertainty 和 verification.checks 中说明原因。",
  "只返回符合 schema 的 JSON，不要返回 Markdown，不要在 JSON 外输出任何文字。",
  ORDERED_PROPORTION_RULES
].join("\n");

const FLAT_ANSWER_KEY_SOLVER_PROMPT = [
  "你是一名严谨的初中数学解题老师，也是标准答案生成器。正确性是底线。",
  "请阅读题目图片，只解决图片里的当前这一道题，给出正确答案和必要解题步骤。",
  "必须先理解图片中的题目，不要套用历史题目或上下文里的旧题。",
  "如果图片里有学生手写答案、红笔批改、叉号、圈画或擦写痕迹，要区分题目原文和学生作答痕迹；这些痕迹只能写入 hasStudentAnswer、studentAnswer、isStudentAnswerCorrect、studentWrongReason，不能当成正确答案依据。",
  "最终答案必须经过计算核验。先核对题意、条件、单位、符号和问题所求，再用代入、逆算、枚举选项或另一种独立方法复核。",
  "如果题目是选择题，finalAnswer 和 canonicalAnswer 必须包含选项字母和选项含义，例如：C. I 不对，II 对。不要只返回 C。",
  "必须返回 choiceAnalysis：逐字抄录题图中的选项文字，独立填写各结论的 true/false，并用结论组合匹配 selectedOption 和 selectedOptionText。",
  "如果不是选择题，choiceAnalysis 返回空的 options、statementVerdicts，并将 selectedOption 和 selectedOptionText 返回空字符串。",
  "acceptedAnswers 写数学上等价的答案表达；solutionSteps 和 solutionOutline 只能写代入、变形、计算、证明和结论，简短且可核验；verificationChecks 写代入检查或计算核验过程。",
  "givenConditions 必须覆盖题干、图片、图形箭头、表格、坐标和定义中所有直接给出的事实；题目直接给出的 m-n=8 不能作为待推导步骤，也不能在 solutionOutline 中重复出现。",
  "如果无法确定题目内容或答案，不要猜：status 返回 ambiguous 或 unreadable，finalAnswer/canonicalAnswer 为空，isSolved 为 false，confidence 低于 0.6，并在 uncertainty 和 verificationChecks 中说明原因。",
  "只返回符合 schema 的 JSON。不要返回 Markdown，不要在 JSON 外输出任何文字。",
  ORDERED_PROPORTION_RULES
].join("\n");

const ANSWER_KEY_VERIFIER_PROMPT = [
  "你是第二位独立的初中数学答案复核员。候选答案可能是错的，不能顺着候选答案解释。",
  "你会收到原始题目图片、从题图清洗出的完整题目文本和候选答案。必须重新查看原始题图，尤其核对图形、表格、A/B/C/D 选项的完整文字和顺序；不能只相信清洗文本。",
  "如果是选择题，必须返回 choiceAnalysis：重新抄录 options，独立判断 statementVerdicts，并根据选项文字得到 selectedOption 和 selectedOptionText。字母相同但选项含义不同，必须 verified=false。",
  "必须检查题目顺序、正负号、单位、选项、定义域、是否漏解以及题目实际问法。",
  "不要采用候选答案的计算过程，也不要自行补充题目文本中不存在的条件。",
  "如果题目依赖图形或表格，而清洗后的题目文本没有包含关键关系，verified 必须为 false，不能猜。",
  "只有独立结果与候选标准答案数学等价时 verified 才能为 true；有任何冲突或题图不清都返回 false。",
  ORDERED_PROPORTION_RULES
].join("\n");

const GUIDE_MATH_AUDIT_PROMPT = [
  "你是恋恋数学引导语的独立事实审校员。",
  "根据已双重核验的标准答案和简要验算，检查候选引导中明确说出的每个数学判断、算式、正负号、选项和结论。",
  "标准答案已经完成视觉解题和独立复核，你不得重新质疑或改写这份基线；候选话术确认同一答案时应判 safe=true。",
  "只检查候选话术实际表达的内容，不能因为它没有讨论某个错误答案、可能暗示其他含义或省略完整过程而判不安全。",
  "候选引导只要包含一个错误、无依据的肯定或与标准答案冲突的内容，safe 必须为 false。",
  "只审校事实，不改写话术；无法确定也返回 safe=false。"
].join("\n");

function normalizeAnswerForComparison(value) {
  const normalized = String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[−﹣－]/g, "-")
    .replace(/(?:角)?度/g, "°")
    .replace(/(?:最终|最后|标准)?(?:答案|结果|选项)(?:是|为|等于)?/g, "")
    .replace(/([a-z])(?:=|等于|为)/g, "")
    .replace(/[\s，,。；;：:、（）()【】\[\]]+/g, "")
    .replace(/选项|项/g, "")
    .trim();
  return normalizeStandaloneChineseInteger(normalized);
}

function normalizeStandaloneChineseInteger(value) {
  const text = String(value || "").trim();
  const match = /^([负-]?)([零〇一二两三四五六七八九十百千万]+)$/.exec(text);
  if (!match) return text;
  const sign = match[1] ? -1 : 1;
  const body = match[2];
  const digits = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  if (!/[十百千万]/.test(body)) {
    return String(sign * Number([...body].map((character) => digits[character]).join("")));
  }

  const units = { 十: 10, 百: 100, 千: 1000 };
  let total = 0;
  let section = 0;
  let current = 0;
  for (const character of body) {
    if (Object.hasOwn(digits, character)) {
      current = digits[character];
      continue;
    }
    if (character === "万") {
      section += current;
      total += Math.max(1, section) * 10000;
      section = 0;
      current = 0;
      continue;
    }
    const unit = units[character];
    if (unit) {
      section += (current || 1) * unit;
      current = 0;
    }
  }
  return String(sign * (total + section + current));
}

function answerValuesEquivalent(left, right) {
  const a = normalizeAnswerForComparison(left);
  const b = normalizeAnswerForComparison(right);
  if (!a || !b) return false;
  if (a === b) return true;

  const fractionValue = (value) => {
    const fraction = value.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (fraction && Number(fraction[2])) return Number(fraction[1]) / Number(fraction[2]);
    return /^-?\d+(?:\.\d+)?$/.test(value) ? Number(value) : NaN;
  };
  const numberA = fractionValue(a);
  const numberB = fractionValue(b);
  return Number.isFinite(numberA) && Number.isFinite(numberB) && Math.abs(numberA - numberB) < 1e-9;
}

function answerKeyCandidates(value) {
  return [value?.canonicalAnswer, ...(Array.isArray(value?.acceptedAnswers) ? value.acceptedAnswers : [])]
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function normalizeChoiceAnalysis(value = {}) {
  const input = value && typeof value === "object" ? value : {};
  const options = (Array.isArray(input.options) ? input.options : [])
    .map((option) => ({
      label: String(option?.label || "").normalize("NFKC").trim().toUpperCase(),
      text: String(option?.text || "").normalize("NFKC").replace(/\s+/g, " ").trim()
    }))
    .filter((option) => /^[A-D]$/.test(option.label) && option.text);
  const statementVerdicts = (Array.isArray(input.statementVerdicts) ? input.statementVerdicts : [])
    .map((statement) => ({
      id: String(statement?.id || "").normalize("NFKC").trim(),
      text: String(statement?.text || "").normalize("NFKC").replace(/\s+/g, " ").trim(),
      correct: statement?.correct === true,
      evidence: String(statement?.evidence || "").normalize("NFKC").replace(/\s+/g, " ").trim()
    }))
    .filter((statement) => statement.id && statement.text);
  const selectedOption = String(input.selectedOption || "").normalize("NFKC").trim().toUpperCase();
  const selectedOptionText = String(input.selectedOptionText || "").normalize("NFKC").replace(/\s+/g, " ").trim();
  return { options, statementVerdicts, selectedOption, selectedOptionText };
}

function normalizeChoiceText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s，,。；;：:、（）()【】\[\]“”"'‘’]+/g, "")
    .trim();
}

function isChoiceQuestionContext(value = {}) {
  const text = [value?.questionType, value?.problemText, value?.questionText]
    .filter(Boolean)
    .join(" ");
  return /选择题|下列.*(?:正确|错误)|正确的是|不正确的是|选项|结论\s*[一二三四IVX]/.test(text);
}

function choiceAnalysisIsUsable(value) {
  const choice = normalizeChoiceAnalysis(value);
  return choice.options.length >= 2 &&
    /^[A-D]$/.test(choice.selectedOption) &&
    choice.options.some((option) =>
      option.label === choice.selectedOption &&
      normalizeChoiceText(option.text) === normalizeChoiceText(choice.selectedOptionText)
    );
}

function choiceAnalysesAgree(solver, verifier) {
  const left = normalizeChoiceAnalysis(solver?.choiceAnalysis);
  const right = normalizeChoiceAnalysis(verifier?.choiceAnalysis);
  const isChoice = isChoiceQuestionContext(solver) ||
    left.options.length >= 2 ||
    right.options.length >= 2;
  if (!isChoice) return true;
  if (!choiceAnalysisIsUsable(left) || !choiceAnalysisIsUsable(right)) return false;
  if (left.selectedOption !== right.selectedOption) return false;
  if (normalizeChoiceText(left.selectedOptionText) !== normalizeChoiceText(right.selectedOptionText)) return false;

  const rightOptions = new Map(right.options.map((option) => [option.label, normalizeChoiceText(option.text)]));
  for (const option of left.options) {
    if (rightOptions.has(option.label) && rightOptions.get(option.label) !== normalizeChoiceText(option.text)) {
      return false;
    }
  }

  const rightVerdicts = new Map(right.statementVerdicts.map((statement) => [statement.id, statement.correct]));
  for (const statement of left.statementVerdicts) {
    if (rightVerdicts.has(statement.id) && rightVerdicts.get(statement.id) !== statement.correct) return false;
  }
  return true;
}

function answerKeyResultsAgree(solver, verifier) {
  const solverAnswers = answerKeyCandidates(solver);
  const verifierAnswers = [verifier?.independentlySolvedAnswer, ...(Array.isArray(verifier?.acceptedAnswers) ? verifier.acceptedAnswers : [])]
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  return solverAnswers.some((left) => verifierAnswers.some((right) => answerValuesEquivalent(left, right))) &&
    choiceAnalysesAgree(solver, verifier);
}

function getAnswerKeyCacheKey(questionImage, context = {}) {
  return crypto
    .createHash("sha256")
    .update(String(questionImage || ""))
    .update(`|problem:${String(context.problemText || "").replace(/\s+/g, " ").trim()}`)
    .update(`|model:${QWEN_GUIDE_MODEL}|answer-key:v10-trusted-steps`)
    .digest("hex");
}

function setCachedAnswerKey(key, value) {
  answerKeyCache.set(key, cloneJson(value));
  while (answerKeyCache.size > ANSWER_KEY_CACHE_LIMIT) {
    answerKeyCache.delete(answerKeyCache.keys().next().value);
  }
}

async function solveAndVerifyAnswerKey(questionImage, context = {}) {
  const startedAt = Date.now();
  const deterministicFromContext = deterministicArrowDifferenceAnswerKey(context.problemText || "");
  if (deterministicFromContext) {
    return {
      ...deterministicFromContext,
      elapsedMs: Date.now() - startedAt
    };
  }

  const solver = await callQwenMultimodalJson({
    model: QWEN_GUIDE_MODEL,
    schema: answerKeySolverSchema,
    instructions: FLAT_ANSWER_KEY_SOLVER_PROMPT,
    content: [
      {
        type: "input_text",
        text: JSON.stringify({
          knownProblemText: context.problemText || "",
          instruction: "独立求解并生成标准答案。不要采用图片中的学生作答或批改结论。"
        })
      },
      { type: "input_image", label: "当前题目图片", image_url: questionImage, detail: "high" }
    ],
    maxOutputTokens: 1400,
    signal: context.signal,
    diagnostics: context.diagnostics || {}
  });

  solver.finalAnswer = String(solver.finalAnswer || solver.canonicalAnswer || "").trim();
  solver.canonicalAnswer = String(solver.canonicalAnswer || solver.finalAnswer || "").trim();
  solver.givenConditions = normalizeGivenConditions(solver.givenConditions);
  solver.choiceAnalysis = normalizeChoiceAnalysis(solver.choiceAnalysis);
  solver.solutionOutline = Array.isArray(solver.solutionSteps) && solver.solutionSteps.length
    ? solver.solutionSteps
    : (Array.isArray(solver.solutionOutline) ? solver.solutionOutline : []);
  solver.verificationChecks = Array.isArray(solver.verification?.checks) && solver.verification.checks.length
    ? solver.verification.checks
    : (Array.isArray(solver.verificationChecks) ? solver.verificationChecks : []);
  solver.confidence = Number(solver.verification?.confidence ?? solver.confidence) || 0;
  solver.studentTrace = solver.studentTrace || {
    hasStudentAnswer: Boolean(solver.hasStudentAnswer),
    studentAnswer: String(solver.studentAnswer || "").trim(),
    isStudentAnswerCorrect: Boolean(solver.isStudentAnswerCorrect),
    wrongReason: String(solver.studentWrongReason || "").trim()
  };
  if ((solver.verification?.isSolved === false || solver.isSolved === false) && solver.status === "solved") {
    solver.status = "ambiguous";
  }

  const deterministicFromSolverText = deterministicArrowDifferenceAnswerKey(
    [context.problemText, solver.problemText].filter(Boolean).join("\n")
  );
  if (deterministicFromSolverText) {
    return {
      ...deterministicFromSolverText,
      elapsedMs: Date.now() - startedAt
    };
  }

  const hasVerifiableWork = solver.solutionOutline.length > 0 && solver.verificationChecks.length > 0;
  if (
    solver.status !== "solved" ||
    Number(solver.confidence) < ANSWER_KEY_MIN_CONFIDENCE ||
    !solver.canonicalAnswer ||
    !hasVerifiableWork
  ) {
    return {
      trusted: false,
      status: solver.status || "unverified",
      confidence: Number(solver.confidence) || 0,
      reason: solver.uncertainty || (!hasVerifiableWork
        ? "标准答案缺少可核验的关键步骤或验算记录"
        : "独立解题未达到可信阈值"),
      solutionOutline: solver.solutionOutline.slice(0, 8),
      verificationChecks: solver.verificationChecks.slice(0, 8),
      elapsedMs: Date.now() - startedAt
    };
  }

  // 选项语义已经由标准答案模型在同一次看图解题中返回。
  // 不再串行调用第二个答案复核模型，避免把 C/D 的含义重新解释并拖慢板书反馈。
  const solverQuestionContext = {
    ...solver,
    problemText: solver.problemText || context.problemText || ""
  };
  const solverChoiceAnalysis = normalizeChoiceAnalysis(solver.choiceAnalysis);
  const isChoiceAnswer = isChoiceQuestionContext(solverQuestionContext) || solverChoiceAnalysis.options.length >= 2;
  if (isChoiceAnswer && !choiceAnalysisIsUsable(solverChoiceAnalysis)) {
    return {
      trusted: false,
      status: "choice-semantics-incomplete",
      confidence: Number(solver.confidence) || 0,
      reason: "选择题缺少可核对的选项文字或选项映射",
      problemText: String(solver.problemText || context.problemText || "").trim(),
      questionType: String(solver.questionType || "").trim(),
      choiceAnalysis: solverChoiceAnalysis,
      elapsedMs: Date.now() - startedAt
    };
  }

  return {
    trusted: true,
    status: "structured-single-pass",
    canonicalAnswer: String(solver.canonicalAnswer).trim(),
    acceptedAnswers: answerKeyCandidates(solver),
    givenConditions: normalizeGivenConditions(solver.givenConditions),
    choiceAnalysis: solverChoiceAnalysis,
    problemText: String(solver.problemText || context.problemText || "").trim(),
    questionType: String(solver.questionType || "").trim(),
    knowledge: String(solver.knowledge || "").trim(),
    solutionOutline: filterGuideStepsByKnownConditions(solver.solutionOutline, solver.givenConditions),
    verificationChecks: Array.isArray(solver.verificationChecks) ? solver.verificationChecks.slice(0, 8) : [],
    studentTrace: solver.studentTrace || {
      hasStudentAnswer: false,
      studentAnswer: "",
      isStudentAnswerCorrect: false,
      wrongReason: ""
    },
    confidence: Number(solver.confidence) || 0,
    reason: "标准答案模型已返回结构化答案、选项语义和关键步骤",
    elapsedMs: Date.now() - startedAt
  };

}

async function getVerifiedAnswerKey(questionImage, context = {}) {
  const cacheKey = getAnswerKeyCacheKey(questionImage, context);
  const cached = answerKeyCache.get(cacheKey);
  if (cached) {
    console.log(`[answer-key] cache hit trusted=${cached.trusted} confidence=${cached.confidence}`);
    return cloneJson(cached);
  }
  // A request carrying a client-owned signal must not borrow another
  // request's in-flight promise: that would make disconnect cancellation
  // impossible and would leave the caller waiting for a task it no longer owns.
  if (!context.signal && answerKeyInflight.has(cacheKey)) {
    return cloneJson(await answerKeyInflight.get(cacheKey));
  }

  const request = solveAndVerifyAnswerKey(questionImage, context)
    .then((result) => {
      if (result.trusted) setCachedAnswerKey(cacheKey, result);
      console.log(
        `[answer-key] resolved trusted=${result.trusted} status=${result.status} confidence=${result.confidence} elapsed=${result.elapsedMs}ms`
      );
      return result;
    })
    .finally(() => answerKeyInflight.delete(cacheKey));
  if (!context.signal) answerKeyInflight.set(cacheKey, request);
  return cloneJson(await request);
}

function privateAnswerReference(answerKey) {
  if (!answerKey?.trusted) {
    return {
      trusted: false,
      instruction: "标准答案尚未通过结构化答案校验。禁止判断学生对错，禁止输出确定答案或确定算式。"
    };
  }
  return {
    trusted: true,
    canonicalAnswer: answerKey.canonicalAnswer,
    acceptedAnswers: answerKey.acceptedAnswers,
    givenConditions: answerKey.givenConditions,
    choiceAnalysis: normalizeChoiceAnalysis(answerKey.choiceAnalysis),
    solutionOutline: filterGuideStepsByKnownConditions(answerKey.solutionOutline, answerKey.givenConditions),
    verificationChecks: answerKey.verificationChecks,
    confidence: answerKey.confidence,
    instruction: "这是服务端私有标准答案基线。所有数学判断必须与它一致；选择题必须同时依据 selectedOption 和 selectedOptionText，不得重新猜测字母含义；未解锁讲解时不得把最终答案直接告诉学生。"
  };
}

function privateQuestionMemoryReference(answerKey) {
  if (!answerKey?.trusted) {
    return {
      ready: false,
      status: answerKey?.status || "question-memory-unavailable",
      instruction: "Question Memory 不完整。只能转写板书并返回 unclear/incomplete，禁止自行解题或判断对错。"
    };
  }
  return {
    ready: true,
    status: answerKey.status || "question-memory-ready",
    questionText: answerKey.problemText || "",
    questionType: answerKey.questionType || "",
    knowledgePoints: [answerKey.knowledge].filter(Boolean),
    answer: {
      canonicalAnswer: answerKey.canonicalAnswer,
      acceptedAnswers: answerKey.acceptedAnswers,
      choiceAnalysis: normalizeChoiceAnalysis(answerKey.choiceAnalysis)
    },
    standardSteps: filterGuideStepsByKnownConditions(answerKey.solutionOutline, answerKey.givenConditions),
    givenConditions: Array.isArray(answerKey.givenConditions) ? answerKey.givenConditions : [],
    verificationChecks: Array.isArray(answerKey.verificationChecks) ? answerKey.verificationChecks : [],
    instruction: "这是唯一题目依据。只比较学生已经写出的可见步骤，不得重解题目、补全步骤或反推完整答案。"
  };
}

function makeUnavailableAnswerKey(error, status = "answer-key-unavailable") {
  return {
    trusted: false,
    status: error?.code || status,
    confidence: 0,
    canonicalAnswer: "",
    acceptedAnswers: [],
    givenConditions: [],
    problemText: "",
    questionType: "",
    knowledge: "",
    solutionOutline: [],
    verificationChecks: [],
    studentTrace: null,
    reason: error?.message || "standard answer service unavailable",
    elapsedMs: 0
  };
}

function normalizeProgressText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[−一]/g, "-")
    .replace(/[＝﹦]/g, "=")
    .replace(/[×＊]/g, "*")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function normalizeGivenConditions(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map((item) => String(item || "").replace(/^\s*(?:已知|条件|其中|约定)\s*[:：]?\s*/u, "").trim())
    .filter(Boolean))].slice(0, 12);
}

function isExplicitGivenConditionStep(step, givenConditions = []) {
  const candidate = String(step || "").trim();
  if (!candidate) return false;
  return normalizeGivenConditions(givenConditions).some((condition) => {
    const left = normalizeProgressText(candidate);
    const right = normalizeProgressText(condition);
    if (!left || !right) return false;
    if (left === right) return true;
    if (left.includes(right) || right.includes(left)) return true;
    const candidateEquation = extractLinearEquationText(left);
    const conditionEquation = extractLinearEquationText(right);
    return Boolean(candidateEquation && conditionEquation && equationsEquivalent(candidateEquation, conditionEquation));
  });
}

function filterGuideStepsByKnownConditions(steps = [], givenConditions = []) {
  return (Array.isArray(steps) ? steps : [])
    .map((step) => String(step || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((step) => !isExplicitGivenConditionStep(step, givenConditions))
    .slice(0, 8);
}

function parseLinearExpression(expression) {
  const compact = normalizeProgressText(expression).replace(/\*/g, "");
  if (!compact || /[^0-9a-z+\-.]/i.test(compact)) return null;
  const coefficients = { x: 0, y: 0, m: 0, n: 0, constant: 0 };
  const terms = compact.replace(/-/g, "+-").split("+").filter(Boolean);
  for (const term of terms) {
    const variable = term.match(/^([+-]?\d*\.?\d*)([xymn])$/i);
    if (variable) {
      const coefficientText = variable[1];
      const coefficient = coefficientText === "" || coefficientText === "+"
        ? 1
        : coefficientText === "-" ? -1 : Number(coefficientText);
      if (!Number.isFinite(coefficient)) return null;
      coefficients[variable[2].toLowerCase()] += coefficient;
      continue;
    }
    if (/^[+-]?\d*\.?\d+$/.test(term)) {
      coefficients.constant += Number(term);
      continue;
    }
    return null;
  }
  return coefficients;
}

function canonicalLinearEquation(value) {
  const text = normalizeProgressText(value);
  const match = text.match(/([^\n。；;]{1,100})=([^\n。；;]{1,100})/);
  if (!match) return null;
  const left = parseLinearExpression(match[1].replace(/^[^0-9a-z+\-.]*/i, ""));
  const right = parseLinearExpression(match[2].replace(/[^0-9a-z+\-.]*$/i, ""));
  if (!left || !right) return null;
  const vector = ["x", "y", "m", "n", "constant"].map((key) => left[key] - right[key]);
  const scale = vector.find((value) => Math.abs(value) > 1e-9);
  if (scale === undefined) return null;
  const normalized = vector.map((value) => Number((value / Math.abs(scale)).toFixed(8)));
  const first = normalized.find((value) => Math.abs(value) > 1e-9);
  return first < 0 ? normalized.map((value) => -value) : normalized;
}

function equationsEquivalent(left, right) {
  const a = canonicalLinearEquation(left);
  const b = canonicalLinearEquation(right);
  return Boolean(a && b && a.length === b.length && a.every((value, index) => Math.abs(value - b[index]) < 1e-7));
}

function extractLinearEquationText(value) {
  const text = normalizeProgressText(value);
  const match = text.match(/[0-9a-z][0-9a-z+\-*/().]{0,40}=[0-9a-z][0-9a-z+\-*/().]{0,40}/i);
  return match ? match[0] : "";
}

function evidenceContainsStep(expectedStep, evidenceText) {
  const expected = normalizeProgressText(expectedStep);
  const evidence = normalizeProgressText(evidenceText);
  if (!expected || !evidence) return false;
  if (evidence.includes(expected) || expected.includes(evidence)) return true;
  const expectedEquation = extractLinearEquationText(expected);
  if (expectedEquation && expectedEquation !== expected) {
    if (evidence.includes(expectedEquation)) return true;
    const evidenceEquations = evidence.match(/[0-9a-z][0-9a-z+\-*/().]{0,40}=[0-9a-z][0-9a-z+\-*/().]{0,40}/gi) || [];
    if (evidenceEquations.some((candidate) => equationsEquivalent(expectedEquation, candidate))) return true;
  }
  if (!canonicalLinearEquation(expected)) return false;
  const equationMatches = evidence.match(/[^\n。；;]{1,100}=[^\n。；;]{1,100}/g) || [];
  return equationMatches.some((candidate) => equationsEquivalent(expected, candidate));
}

function deriveGuideProgress({
  verifiedGuideSteps = [],
  givenConditions = [],
  latestHandwritingResult = null,
  latestStudentSpeech = "",
  previousGuideQuestion = "",
  askedConcepts = [],
  resolvedConcepts = []
} = {}) {
  const result = latestHandwritingResult && typeof latestHandwritingResult === "object"
    ? latestHandwritingResult
    : {};
  const knownConditions = normalizeGivenConditions(givenConditions);
  const usableGuideSteps = filterGuideStepsByKnownConditions(verifiedGuideSteps, knownConditions);
  const boardEvidence = [
    result.detectedWriting,
    result.recognizedText,
    result.mathExpression,
    ...(Array.isArray(result.completedSteps)
      ? result.completedSteps.map((step) => typeof step === "object" ? step.evidence || step.text || "" : step)
      : [])
  ].filter(Boolean).join("\n");
  const evidence = `${boardEvidence}\n${String(latestStudentSpeech || "")}`;
  const completedSteps = [];
  const resolved = new Set(
    [...(Array.isArray(askedConcepts) ? askedConcepts : []), ...(Array.isArray(resolvedConcepts) ? resolvedConcepts : [])]
      .map((item) => String(item || "").trim()).filter(Boolean)
  );
  for (let index = 0; index < usableGuideSteps.length; index += 1) {
    const step = String(usableGuideSteps[index] || "").trim();
    const stepId = `step_${index + 1}`;
    if (!step || !evidenceContainsStep(step, evidence)) continue;
    completedSteps.push({ stepId, evidence: step });
    resolved.add(stepId);
    const equation = canonicalLinearEquation(step);
    if (equation) resolved.add(`equation:${equation.join(",")}`);
  }
  const previousGuideQuestionAnswered = Boolean(previousGuideQuestion && evidenceContainsStep(previousGuideQuestion, evidence));
  const currentIndex = usableGuideSteps
    .findIndex((step, index) => !completedSteps.some((item) => item.stepId === `step_${index + 1}`));
  return {
    completedSteps,
    currentStep: currentIndex >= 0 ? String(usableGuideSteps[currentIndex] || "").trim() : "",
    answeredPreviousQuestion: previousGuideQuestionAnswered,
    shouldGuideCurrentStep: currentIndex >= 0,
    givenConditions: knownConditions,
    askedConcepts: [...new Set((Array.isArray(askedConcepts) ? askedConcepts : []).map(String))],
    resolvedConcepts: [...resolved]
  };
}

function requestRegistryKey(sessionId, questionId) {
  return `${String(sessionId || "")}:${String(questionId || "")}`;
}

function questionMemoryFingerprint(questionMemory) {
  if (!questionMemory || typeof questionMemory !== "object") return "";
  return JSON.stringify({
    questionId: String(questionMemory.questionId || ""),
    ready: Boolean(questionMemory.ready),
    canonicalAnswer: String(questionMemory.canonicalAnswer || ""),
    acceptedAnswers: Array.isArray(questionMemory.acceptedAnswers) ? questionMemory.acceptedAnswers : [],
    givenConditions: normalizeGivenConditions(questionMemory.givenConditions),
    choiceAnalysis: questionMemory.choiceAnalysis || null,
    solutionOutline: Array.isArray(questionMemory.solutionOutline) ? questionMemory.solutionOutline : [],
    verificationChecks: Array.isArray(questionMemory.verificationChecks) ? questionMemory.verificationChecks : []
  });
}

function registerQuestionMemoryIdentity(sessionId, questionId, memoryId, fingerprint = "") {
  const normalizedSessionId = String(sessionId || "").trim();
  const normalizedQuestionId = String(questionId || "").trim();
  const normalizedMemoryId = String(memoryId || "").trim();
  if (!normalizedSessionId || !normalizedQuestionId || !normalizedMemoryId) {
    const error = new Error("Question Memory identity is required");
    error.statusCode = 409;
    error.code = "question_memory_identity_missing";
    throw error;
  }
  const key = requestRegistryKey(normalizedSessionId, normalizedQuestionId);
  const previous = questionMemoryIdentityRegistry.get(key);
  const normalizedFingerprint = String(fingerprint || "");
  if (previous && previous.memoryId !== normalizedMemoryId) {
    const error = new Error("Question Memory identity conflict");
    error.statusCode = 409;
    error.code = "question_memory_conflict";
    throw error;
  }
  if (previous?.fingerprint && normalizedFingerprint && previous.fingerprint !== normalizedFingerprint) {
    const error = new Error("Question Memory content conflict");
    error.statusCode = 409;
    error.code = "question_memory_conflict";
    throw error;
  }
  questionMemoryIdentityRegistry.set(key, {
    memoryId: normalizedMemoryId,
    fingerprint: previous?.fingerprint || normalizedFingerprint
  });
  while (questionMemoryIdentityRegistry.size > REQUEST_REGISTRY_LIMIT) {
    questionMemoryIdentityRegistry.delete(questionMemoryIdentityRegistry.keys().next().value);
  }
  return normalizedMemoryId;
}

function registerHandwritingRequest(sessionId, questionId, requestId) {
  const normalizedRequestId = Number(requestId || 0);
  if (!normalizedRequestId) {
    const error = new Error("handwriting requestId is required");
    error.statusCode = 400;
    error.code = "request_id_missing";
    throw error;
  }
  const key = requestRegistryKey(sessionId, questionId);
  const previous = Number(handwritingRequestRegistry.get(key) || 0);
  if (normalizedRequestId < previous) {
    const error = new Error("stale handwriting request");
    error.statusCode = 409;
    error.code = "stale_request";
    throw error;
  }
  handwritingRequestRegistry.set(key, normalizedRequestId);
  while (handwritingRequestRegistry.size > REQUEST_REGISTRY_LIMIT) {
    handwritingRequestRegistry.delete(handwritingRequestRegistry.keys().next().value);
  }
  return normalizedRequestId;
}

function isLatestHandwritingRequest(sessionId, questionId, requestId) {
  return Number(handwritingRequestRegistry.get(requestRegistryKey(sessionId, questionId)) || 0) === Number(requestId || 0);
}

function registerGuideRequest(sessionId, questionId, requestId) {
  const normalizedRequestId = String(requestId || "").trim();
  if (!normalizedRequestId) return "";
  const key = requestRegistryKey(sessionId, questionId);
  guideRequestRegistry.set(key, normalizedRequestId);
  while (guideRequestRegistry.size > REQUEST_REGISTRY_LIMIT) {
    guideRequestRegistry.delete(guideRequestRegistry.keys().next().value);
  }
  return normalizedRequestId;
}

function isLatestGuideRequest(sessionId, questionId, requestId) {
  const normalizedRequestId = String(requestId || "").trim();
  if (!normalizedRequestId) return true;
  return String(guideRequestRegistry.get(requestRegistryKey(sessionId, questionId)) || "") === normalizedRequestId;
}

function buildQuestionMemory(questionId, answerKey = {}, memoryId = "", sessionId = 0) {
  const ready = Boolean(answerKey.trusted);
  return {
    version: 1,
    memoryId: String(memoryId || ""),
    sessionId: Number(sessionId || 0),
    questionId: String(questionId || ""),
    ready,
    status: String(answerKey.status || (ready ? "ready" : "unverified")),
    confidence: ready ? Number(answerKey.confidence) || 0 : 0,
    canonicalAnswer: ready ? String(answerKey.canonicalAnswer || "").trim() : "",
    acceptedAnswers: ready && Array.isArray(answerKey.acceptedAnswers) ? answerKey.acceptedAnswers : [],
    choiceAnalysis: ready ? normalizeChoiceAnalysis(answerKey.choiceAnalysis) : {
      options: [],
      statementVerdicts: [],
      selectedOption: "",
      selectedOptionText: ""
    },
    problemText: ready ? String(answerKey.problemText || "").trim() : "",
    questionType: ready ? String(answerKey.questionType || "").trim() : "",
    knowledge: ready ? String(answerKey.knowledge || "").trim() : "",
    givenConditions: ready ? normalizeGivenConditions(answerKey.givenConditions) : [],
    solutionOutline: ready
      ? filterGuideStepsByKnownConditions(answerKey.solutionOutline, answerKey.givenConditions)
      : [],
    verificationChecks: ready && Array.isArray(answerKey.verificationChecks) ? answerKey.verificationChecks : [],
    studentTrace: ready ? answerKey.studentTrace || null : null,
    reason: String(answerKey.reason || "").trim(),
    elapsedMs: Number(answerKey.elapsedMs) || 0,
    provider: "qwen-structured-single-pass-question-memory",
    createdAt: new Date().toISOString()
  };
}

function questionMemoryToAnswerKey(questionMemory, expectedQuestionId = "", expectedMemoryId = "") {
  if (!questionMemory || typeof questionMemory !== "object") {
    const error = new Error("缺少进入题目时生成的 Question Memory，板书识别不会重新获取标准答案");
    error.statusCode = 409;
    error.code = "question_memory_missing";
    error.stage = "question-memory";
    throw error;
  }

  const memoryQuestionId = String(questionMemory.questionId || "");
  if (expectedQuestionId && memoryQuestionId !== String(expectedQuestionId)) {
    const error = new Error("Question Memory 与当前题目不匹配");
    error.statusCode = 409;
    error.code = "question_memory_mismatch";
    error.stage = "question-memory";
    throw error;
  }

  if (expectedMemoryId && String(questionMemory.memoryId || "") !== String(expectedMemoryId)) {
    const error = new Error("Question Memory identity mismatch");
    error.statusCode = 409;
    error.code = "question_memory_conflict";
    error.stage = "question-memory";
    throw error;
  }

  const trusted = Boolean(questionMemory.ready);
  return {
    trusted,
    status: String(questionMemory.status || (trusted ? "question-memory-ready" : "question-memory-unavailable")),
    confidence: trusted ? Number(questionMemory.confidence) || 0 : 0,
    canonicalAnswer: trusted ? String(questionMemory.canonicalAnswer || "").trim() : "",
    acceptedAnswers: trusted && Array.isArray(questionMemory.acceptedAnswers) ? questionMemory.acceptedAnswers : [],
    choiceAnalysis: trusted ? normalizeChoiceAnalysis(questionMemory.choiceAnalysis) : normalizeChoiceAnalysis(null),
    problemText: trusted ? String(questionMemory.problemText || "").trim() : "",
    questionType: trusted ? String(questionMemory.questionType || "").trim() : "",
    knowledge: trusted ? String(questionMemory.knowledge || "").trim() : "",
    givenConditions: trusted ? normalizeGivenConditions(questionMemory.givenConditions) : [],
    solutionOutline: trusted
      ? filterGuideStepsByKnownConditions(questionMemory.solutionOutline, questionMemory.givenConditions)
      : [],
    verificationChecks: trusted && Array.isArray(questionMemory.verificationChecks)
      ? questionMemory.verificationChecks
      : [],
    studentTrace: trusted ? questionMemory.studentTrace || null : null,
    reason: String(questionMemory.reason || "").trim(),
    elapsedMs: Number(questionMemory.elapsedMs) || 0
  };
}

function guideHasCheckableMathClaim(result) {
  const value = [result?.speech, result?.formulaOrStep, result?.studentAction].filter(Boolean).join(" ");
  return /(?:正确|对的|成立|不成立|算错|结果|答案|选项|等于|推出|应该是|不是|[=＝]|\d\s*[:：/]\s*\d)/.test(value);
}

function hasFinalAnswerEvidence(result = {}, body = {}) {
  if (body?.answerVerified === true || body?.studentFinalAnswerEvidence === true) return true;
  if (String(result?.finalAnswer || result?.canonicalAnswer || "").trim()) return true;
  if (result?.lectureComplete === true) return true;

  const text = [result?.speech, result?.formulaOrStep, result?.studentAction]
    .filter(Boolean)
    .join(" ");
  return /(?:最终答案|最后答案|答案(?:是|为)|结论|解得|得到|所以)[^\n]{0,32}(?:=|等于|[A-D]|-?\d)/i.test(text);
}

function continueWithoutFinalAnswer(result = {}, body = {}) {
  const concreteStep = String(
    body?.silenceContextStep ||
    result?.formulaOrStep ||
    result?.expectedNextStep ||
    ""
  ).replace(/\s+/g, " ").trim();
  const speech = concreteStep
    ? `还在中间步骤，先继续这一步：${concreteStep}。写完后把下一步算出来。`
    : "现在还没到最终答案，先根据题目条件继续写出下一步。";
  return {
    ...(result || {}),
    shouldSpeak: true,
    speech,
    hintLevel: concreteStep ? "light" : "micro_hint",
    formulaOrStep: concreteStep,
    askStudentToRepeat: false,
    studentAction: concreteStep
      ? `请把${concreteStep}写在黑板上，再继续往下算。`
      : "请先写出下一步关系式或计算。",
    lectureComplete: false
  };
}

function makeUnverifiedGuideSafe(result, body = {}) {
  if (!guideHasCheckableMathClaim(result)) return { ...(result || {}), lectureComplete: false };
  if (!hasFinalAnswerEvidence(result, body)) return continueWithoutFinalAnswer(result, body);
  return {
    ...(result || {}),
    shouldSpeak: true,
    speech: "这一步我还需要重新核对，先别把它当成最终结论。我们按题目条件再检查一下。",
    hintLevel: "light",
    formulaOrStep: "",
    askStudentToRepeat: false,
    studentAction: "重新读题目条件并说明这一步的依据。",
    lectureComplete: false
  };
}

function extractAnswerVariable(answerKey) {
  const candidates = answerKeyCandidates(answerKey);
  for (const candidate of candidates) {
    const match = String(candidate || "").normalize("NFKC").match(/^\s*([a-zA-Z])\s*(?:=|＝|等于|为)/);
    if (match) return match[1].toLowerCase();
  }
  return "";
}

function extractGuideAnswerClaims(text, answerKey) {
  const value = String(text || "").normalize("NFKC").replace(/[−﹣－]/g, "-");
  const answerVariable = extractAnswerVariable(answerKey);
  const claims = [];
  const numeric = "-?\\d+(?:\\.\\d+)?(?:\\s*/\\s*-?\\d+(?:\\.\\d+)?)?";

  if (answerVariable) {
    const variablePattern = new RegExp(`\\b${answerVariable}\\s*(?:=|＝|等于|为)\\s*(${numeric})`, "gi");
    let match;
    while ((match = variablePattern.exec(value))) {
      claims.push({ raw: `${answerVariable}=${match[1].replace(/\s+/g, "")}`, reason: "variable-assignment" });
    }
  }

  const answerPattern = new RegExp(`(?:答案|结果|解得|最终|最后|正确应(?:该)?是|所以(?:得到|有)?)\\s*(?:是|为|等于|=|：|:)?\\s*(${numeric})`, "gi");
  let match;
  while ((match = answerPattern.exec(value))) {
    claims.push({ raw: match[1].replace(/\s+/g, ""), reason: "answer-claim" });
  }

  const optionReference = answerKeyCandidates(answerKey)
    .map((candidate) => String(candidate || "").normalize("NFKC").trim().toUpperCase())
    .find((candidate) => /^[ABCD]$/.test(candidate));
  if (optionReference) {
    const optionPattern = /(?:选|选择|应(?:该)?选|答案(?:是|为)?|而不是)\s*([ABCD])/gi;
    while ((match = optionPattern.exec(value))) {
      const prefix = value.slice(Math.max(0, match.index - 6), match.index);
      claims.push({
        raw: prefix.includes("不是") || prefix.includes("不选") ? `not:${match[1].toUpperCase()}` : match[1].toUpperCase(),
        reason: "option-claim"
      });
    }
  }

  if (optionReference) {
    const optionLetterPattern = /(?<![A-Z])([ABCD])(?![A-Z])/gi;
    while ((match = optionLetterPattern.exec(value))) {
      const prefix = value.slice(Math.max(0, match.index - 10), match.index);
      if (/(?:不是|不选|不对|错误|wrong|incorrect|而不是)/i.test(prefix)) {
        claims.push({ raw: `not:${match[1].toUpperCase()}`, reason: "option-negated-claim" });
      } else if (/(?:选|选择|答案|应选|应该选|是|为|correct)/i.test(prefix)) {
        claims.push({ raw: match[1].toUpperCase(), reason: "option-context-claim" });
      }
    }
  }

  const seenClaims = new Set();
  return claims.filter((claim) => {
    const key = String(claim.raw || "");
    if (seenClaims.has(key)) return false;
    seenClaims.add(key);
    return true;
  });
}

function guideContradictsVerifiedAnswer(result, answerKey) {
  if (!answerKey?.trusted) return null;
  const text = [result?.speech, result?.formulaOrStep, result?.studentAction].filter(Boolean).join(" ");
  if (!text) return null;
  const claims = extractGuideAnswerClaims(text, answerKey);
  let wrongClaims = claims.filter((claim) => !studentAnswerMatchesVerifiedKey(claim.raw, answerKey));
  const optionReference = answerKeyCandidates(answerKey)
    .map((candidate) => String(candidate || "").normalize("NFKC").trim().toUpperCase())
    .find((candidate) => /^[ABCD]$/.test(candidate));
  if (optionReference) {
    const normalizedText = text.normalize("NFKC").toUpperCase();
    const optionPattern = /(?<![A-Z])([ABCD])(?![A-Z])/g;
    let optionMatch;
    while ((optionMatch = optionPattern.exec(normalizedText))) {
      const prefix = normalizedText.slice(Math.max(0, optionMatch.index - 10), optionMatch.index);
      const raw = /(?:\u4e0d\u662f|\u4e0d\u9009|\u4e0d\u5bf9|\u9519\u8bef|\u800c\u4e0d\u662f|WRONG|INCORRECT)/i.test(prefix)
        ? `not:${optionMatch[1]}`
        : /(?:\u9009|\u9009\u62e9|\u7b54\u6848|\u5e94\u9009|\u5e94\u8be5\u9009|\u6b63\u786e|CORRECT)/i.test(prefix)
          ? optionMatch[1]
          : "";
      if (raw && !studentAnswerMatchesVerifiedKey(raw, answerKey)) {
        wrongClaims.push({ raw, reason: "option-final-audit" });
      }
    }
  }
  const seenWrongClaims = new Set();
  wrongClaims = wrongClaims.filter((claim) => {
    const key = String(claim.raw || "");
    if (seenWrongClaims.has(key)) return false;
    seenWrongClaims.add(key);
    return true;
  });
  if (!wrongClaims.length) return null;
  return wrongClaims;
}

function makeAnswerLockedGuideSafe(result, answerKey, body, reason = "answer contradiction") {
  const canonicalAnswer = String(answerKey?.canonicalAnswer || "").trim();
  const canStateAnswer = Boolean(body?.lectureUnlocked || body?.answerVerified || body?.boardCompletionVerified);
  const speech = canStateAnswer && canonicalAnswer
    ? `刚才那句我收回，以核准结果为准：${canonicalAnswer}。这里我们只按题目条件核对常数项和符号。`
    : "刚才那一步我需要收回重新核对，先不要把它当成结论。我们回到题目条件检查常数项和符号。";
  console.warn(`[guide-safety] blocked guide answer contradiction: ${reason}`);
  return {
    ...(result || {}),
    shouldSpeak: true,
    speech,
    hintLevel: "light",
    formulaOrStep: "",
    askStudentToRepeat: false,
    studentAction: "按题目条件重新核对这一步，不要采用刚才那句里不一致的结果。",
    lectureComplete: false
  };
}

async function auditGuideMath(result, answerKey, body) {
  if (!answerKey?.trusted) {
    if (body?.allowUnverifiedFinalAnswer === true && Number(body?.silenceStage) >= 4) return result;
    return makeUnverifiedGuideSafe(result, body);
  }
  if (!guideHasCheckableMathClaim(result)) return result;
  const wrongClaims = guideContradictsVerifiedAnswer(result, answerKey);
  if (wrongClaims) {
    return makeAnswerLockedGuideSafe(
      result,
      answerKey,
      body,
      wrongClaims.map((claim) => `${claim.raw}:${claim.reason}`).join(",")
    );
  }
  // The answer-key solver already supplied the trusted solution outline and
  // arithmetic checks. A second model audit here only adds latency and can
  // replace a concrete, correct step with a vague fail-closed message. Keep
  // it explicitly opt-in for diagnostics instead of making every guide wait
  // for a second multimodal request.
  if (!GUIDE_MODEL_AUDIT_ENABLED || body?.skipGuideModelAudit === true) return result;
  try {
    const audit = await callQwenMultimodalJson({
      model: QWEN_GUIDE_MODEL,
      schema: guideMathAuditSchema,
      instructions: [GUIDE_MATH_AUDIT_PROMPT, STATEMENT_EVALUATION_RULES].join("\n\n"),
      content: [
        {
          type: "input_text",
          text: JSON.stringify({
            verifiedAnswerReference: privateAnswerReference(answerKey),
            candidateGuide: result,
            studentTranscript: body.transcript || "",
            latestStudentSpeech: body.latestStudentSpeech || ""
          })
        }
      ],
      maxOutputTokens: 450
    });
    if (audit.safe === true && Number(audit.confidence) >= ANSWER_KEY_MIN_CONFIDENCE) return result;
    console.warn(`[guide-audit] blocked unsafe guidance: ${audit.issue || "unverified math claim"}`);
    return makeUnverifiedGuideSafe(result, body);
  } catch (error) {
    console.warn(`[guide-audit] failed closed: ${error.message}`);
    return makeUnverifiedGuideSafe(result, body);
  }
}

function studentAnswerMatchesVerifiedKey(studentAnswer, answerKey) {
  if (/^\s*not:/i.test(String(studentAnswer || ""))) return false;
  const normalizedStudent = normalizeAnswerForComparison(studentAnswer);
  if (!normalizedStudent || !answerKey?.trusted) return false;
  return answerKeyCandidates(answerKey).some((candidate) => {
    if (answerValuesEquivalent(normalizedStudent, candidate)) return true;
    const normalizedCandidate = normalizeAnswerForComparison(candidate);
    if (!normalizedCandidate) return false;
    if (/^-?\d+(?:\.\d+)?$/.test(normalizedCandidate)) {
      const escaped = normalizedCandidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(?:^|[^\\d.\\-])${escaped}(?:$|[^\\d.])`).test(normalizedStudent);
    }
    return normalizedStudent.endsWith(normalizedCandidate);
  });
}

function enforceOrderedProportionConvention(result, context = {}) {
  const output = { ...(result || {}) };
  const currentQuestionContext = [
    context.problemText,
    context.latestStudentSpeech,
    ...(Array.isArray(context.knowledgePoints) ? context.knowledgePoints : [])
  ].filter(Boolean).join(" ");
  const hasCurrentProportionEvidence =
    /(?:成比例|比例式|比例关系|比值)/.test(currentQuestionContext) ||
    /[\dA-Za-z]+\s*[:：]\s*[\dA-Za-z]+\s*(?:=|＝|等于)\s*[\dA-Za-z]+\s*[:：]\s*[\dA-Za-z]+/.test(
      currentQuestionContext
    );
  if (!hasCurrentProportionEvidence) return output;
  const combined = [
    output.speech,
    output.formulaOrStep,
    output.studentAction,
    context.transcript,
    context.latestStudentSpeech,
    context.problemText
  ].filter(Boolean).join(" ");
  const compact = combined.replace(/\s+/g, "");
  const claimsOrderIsOptional =
    /(?:成比例|比例).{0,24}(?:没有|未|不).{0,10}(?:规定)?(?:顺序|对应)/.test(compact) ||
    /(?:任意|随意).{0,10}(?:交换|调换|排列).{0,10}(?:顺序|位置|比例项)/.test(compact) ||
    /(?:换|调换).{0,8}(?:顺序|位置).{0,16}(?:另一个|其他|多个)(?:答案|解)/.test(compact) ||
    /(?:另一个|其他|多个)(?:答案|解).{0,16}(?:顺序|位置|排列)/.test(compact);

  if (!claimsOrderIsOptional) return output;

  const hasTwoThreeXSixEquation =
    /2(?:比|:|：|\/|分之)3(?:=|＝|等于)x(?:比|:|：|\/|分之)6/i.test(compact) ||
    /2(?:比|:|：|\/|分之)3(?:=|＝|等于)6(?:比|:|：|\/|分之)x/i.test(compact);
  const studentReachedFour =
    /x(?:=|＝|等于)4(?!\d)/i.test(compact) ||
    /(?:答案|结果|算出|得到)(?:是|为|了)?4(?!\d)/.test(compact);

  output.shouldSpeak = true;
  output.speech = hasTwoThreeXSixEquation && studentReachedFour
    ? "这里要按题目给出的顺序列成二比三等于 x 比六，所以 x 等于四。你刚才算出的四是正确的。"
    : "四个数成比例要按题目给出的顺序对应，不能任意换位置。请按第一项比第二项等于第三项比第四项核对。";
  output.hintLevel = hasTwoThreeXSixEquation && studentReachedFour ? "encourage" : "light";
  output.formulaOrStep = hasTwoThreeXSixEquation ? "2:3=x:6，x=4" : "第一项/第二项=第三项/第四项";
  output.askStudentToRepeat = false;
  output.studentAction = "按题目给出的顺序继续讲解。";
  console.warn("[guide-safety] corrected unsupported proportion reordering claim");
  return output;
}

function applyLatestHandwritingConsistency(result, body = {}) {
  const output = result && typeof result === "object" ? { ...result } : {};
  const handwriting = body.latestHandwritingResult;
  const eventType = String(body.eventType || "");
  const latestSpeech = String(body.latestStudentSpeech || body.transcript || "").trim();
  const speechContainsMathOrHelp = /[=＋+\-−*/÷:：]|x|y|m|n|\u7b54\u6848|\u7ed3\u679c|\u7b49\u4e8e|\u4e0d\u4f1a|\u4e0d\u61c2|\u6ca1\u601d\u8def|\u600e\u4e48/i.test(latestSpeech);

  const questionType = String(body.questionType || body.problemType || body.type || "");
  const isChoiceQuestion = /选择|判断|单选|多选/.test(questionType);
  const hasExplicitChoiceSpeech = /(?:答案\s*(?:是|为)?|选|选择|应选|选项)\s*[:：]?\s*[A-DＡ-Ｄ]/i.test(latestSpeech)
    || /(?:^|\s)[A-DＡ-Ｄ](?:\s*选项)?(?:$|\s)/i.test(latestSpeech);
  const speechCanStandInForMissingBoard = isChoiceQuestion && hasExplicitChoiceSpeech;

  if (body.hasBoardInk === false && latestSpeech && speechContainsMathOrHelp && eventType !== "question_start") {
    return {
      ...output,
      shouldSpeak: true,
      speech: "我听到你的思路了，请把关键式子或计算过程写在黑板上，我再结合题目帮你核对。",
      hintLevel: "light",
      formulaOrStep: "",
      askStudentToRepeat: false,
      lectureComplete: false
    };
  }

  if (!handwriting || typeof handwriting !== "object") return output;

  const status = String(handwriting.calculationStatus || "").trim().toLowerCase();
  const pending = Boolean(body.boardPendingRecognition);
  const speech = String(output.speech || "");

  if (pending && eventType !== "question_start") {
    return {
      ...output,
      shouldSpeak: true,
      speech: "我先不急着判断刚写的这一步，等板书识别更新后再核对。你可以先把刚才的思路接着说。",
      hintLevel: "light",
      formulaOrStep: "",
      askStudentToRepeat: false,
      lectureComplete: false
    };
  }

  if (status === "wrong") {
    const hasExplicitError = Boolean(
      String(handwriting.errorLocation || "").trim() &&
      String(handwriting.errorEvidence || handwriting.issueSummary || "").trim() &&
      Number(handwriting.confidence) >= 0.72
    );
    const correction = String(
      handwriting.guidance || handwriting.expectedNextStep || handwriting.issueSummary || ""
    ).trim();
    if (hasExplicitError && correction) {
      return {
        ...output,
        shouldSpeak: true,
        speech: correction,
        hintLevel: output.hintLevel === "worked_step" ? output.hintLevel : "light",
        formulaOrStep: String(handwriting.expectedNextStep || "").trim(),
        askStudentToRepeat: true,
        lectureComplete: false
      };
    }
  }

  if (status === "correct") {
    const contradictory = /错|错误|不对|不一致|算错|不符合|wrong|incorrect/i.test(speech);
    if (contradictory) {
      const completedStep = Array.isArray(handwriting.completedSteps)
        ? String(handwriting.completedSteps.at(-1) || "").trim()
        : "";
      return {
        ...output,
        shouldSpeak: Boolean(completedStep),
        speech: completedStep ? `你已经写出的“${completedStep}”与 Question Memory 一致。` : "",
        hintLevel: "encourage",
        formulaOrStep: "",
        lectureComplete: false
      };
    }
  }

  if (status === "unclear" || status === "incomplete") {
    const definitive = /正确|错误|不对|答案是|结果是|wrong|incorrect/i.test(speech);
    if (definitive) {
      const canPrompt = ["active_help", "stuck", "silence", "silence_followup", "silence_escalation", "error_silence"].includes(eventType);
      const nextStep = String(
        handwriting.expectedNextStep ||
        handwriting.missingBoardContent ||
        output.formulaOrStep ||
        ""
      ).replace(/\s+/g, " ").trim();
      return {
        ...output,
        shouldSpeak: canPrompt,
        speech: canPrompt
          ? nextStep
            ? `这还是中间步骤，先继续：${nextStep}。写完后再往下算。`
            : "还没到最终答案，先把下一步关系式或计算写出来。"
          : "",
        hintLevel: "light",
        formulaOrStep: nextStep,
        lectureComplete: false
      };
    }
  }

  return output;
}

function ensureConcreteSilenceGuide(result, body = {}) {
  const output = result && typeof result === "object" ? { ...result } : {};
  const eventType = String(body.eventType || "");
  const silenceStage = Math.max(0, Math.min(4, Number(body.silenceStage) || 0));
  const contextualStep = String(body.silenceContextStep || "").replace(/\s+/g, " ").trim();
  const modelStep = String(output.formulaOrStep || "").replace(/\s+/g, " ").trim();
  const concreteStep = contextualStep || (
    /[A-Za-z0-9].*(?:=|:|：).*[A-Za-z0-9]/.test(modelStep) ? modelStep : ""
  );

  if (!/silence/.test(eventType) || silenceStage < 1 || silenceStage > 3) {
    return output;
  }
  if (body.boardPendingRecognition === true) {
    return output;
  }

  // Do not let a model response such as “write the next relation” or “I will
  // check the answer” reach the student. When neither the question memory nor
  // the structured model field contains a concrete relation, expose the
  // loading problem honestly instead of inventing mathematics.
  if (!concreteStep) {
    return {
      ...output,
      shouldSpeak: true,
      speech: "当前题目的具体步骤还没有加载完成，我暂时不猜式子，以免误导你。步骤加载后我会直接给出对应关系式。",
      hintLevel: "light",
      formulaOrStep: "",
      askStudentToRepeat: false,
      studentAction: "等待题目步骤加载后再继续。",
      lectureComplete: false
    };
  }

  const stageSpeech = {
    1: `先根据题目给出的条件写出：${concreteStep}。`,
    2: `下一步直接用这个关系计算：${concreteStep}。算完后把结果写在黑板上。`,
    3: `关键式是：${concreteStep}。请把它写在黑板上，再继续算。`
  }[silenceStage];

  const currentSpeech = String(output.speech || "").trim();
  const hasConcreteStepInResponse = currentSpeech.includes(concreteStep)
    || modelStep === concreteStep;
  const vagueSpeech = /下一步关系(?:式)?写出来|把对应的式子写|继续往下算|我来核对答案|核对服务.*没有返回|把最后答案再讲一次|卡在哪里/i.test(currentSpeech);
  if (hasConcreteStepInResponse && !vagueSpeech) {
    return { ...output, formulaOrStep: concreteStep };
  }

  console.warn(`[silence-guide] restored concrete step stage=${silenceStage}: ${concreteStep}`);
  return {
    ...output,
    shouldSpeak: true,
    speech: stageSpeech,
    hintLevel: silenceStage >= 3 ? "worked_step" : "light",
    formulaOrStep: concreteStep,
    askStudentToRepeat: silenceStage >= 3,
    studentAction: silenceStage >= 3
      ? `请把${concreteStep}写在黑板上，或用自己的话复述。`
      : `请先写出${concreteStep}。`,
    lectureComplete: false
  };
}

function ensureConcreteGuideInstruction(result, context = {}) {
  const output = result && typeof result === "object" ? { ...result } : {};
  if (output.shouldSpeak === false || output.lectureComplete === true) return output;

  const speech = String(output.speech || "").replace(/\s+/g, " ").trim();
  const formula = String(output.formulaOrStep || "").replace(/\s+/g, " ").trim();
  const action = String(output.studentAction || "").replace(/\s+/g, " ").trim();
  const vague = /(?:确认(?:一下|下)|看看?怎么来|看(?:看|一下)怎么|怎么来的|怎么得到|怎么用(?:它们|这些|这个)?(?:推|算|得)|怎么推(?:出来|得出)?|如何(?:用|推|得出)|想一想|再想想|检查一下|看一看|能求出吗|能算出吗|是不是|对不对|正确吗|哪里错|继续往下|再试试|说说看|先看看|推出来|最终答案或关键结论|最终答案.*(?:写在|写到).*(?:核验|检查)|关键结论.*(?:写在|写到).*(?:核验|检查))/i.test(speech);
  const hasConcreteRelation = /(?:=|＝|等于|成比例|比例|代入|相减|相加|消元|移项|乘以|除以|写出|算出|求得|得到)/i.test(`${formula} ${action}`);
  const hasFinalAnswer = Boolean(
    context.hasFinalAnswer ||
    context.answerVerified ||
    context.boardCompletionVerified ||
    String(context.recognizedBoardProgress?.finalAnswer || "").trim()
  );
  if (!vague && hasConcreteRelation && formula) return output;

  // Guidance must come from Qwen. If the model returned an empty, generic,
  // or non-actionable response, suppress it instead of fabricating a local
  // mathematical instruction from Question Memory or OCR fragments.
  return {
    ...output,
    shouldSpeak: false,
    speech: "",
    formulaOrStep: "",
    askStudentToRepeat: false,
    studentAction: "",
    lectureComplete: false,
    guideUnavailableReason: "model_response_not_actionable"
  };
}

function getSilenceGuidePolicy(stage) {
  const level = Math.max(0, Math.min(4, Number(stage) || 0));
  return {
    stage: level,
    guideState: level >= 2 ? "interactive_teaching" : "micro_hint",
    allowConcreteStep: level >= 1,
    allowFormula: level >= 1,
    allowFinalAnswer: level >= 4,
    allowUnverifiedFinalAnswer: level >= 4
  };
}

async function handleGuide(req, res) {
  const body = await readJsonBody(req);
  const currentBoardImage = body.boardImage || body.questionImage || "";
  if (!currentBoardImage) {
    sendJson(res, 400, { error: "缺少当前黑板截图 boardImage" });
    return;
  }

  const guideSessionId = String(body.sessionId || "").trim();
  const guideQuestionId = String(body.questionId || "").trim();
  const guideRequestId = String(body.requestId || body.responseId || "").trim();
  registerGuideRequest(guideSessionId, guideQuestionId, guideRequestId);

  const eventText = {
    answer_to_lian_question: "学生正在回答恋恋刚才主动提出的问题。请及时回应这个回答，不要沉默，也不要当作普通连续讲解忽略。",
    active_help: "学生主动求助、提问或明确表示不会。",
    stuck: "学生明确表示不会、没思路或卡住。",
    silence: "学生讲解过程中已经沉默 1 分钟。请及时结合当前题目和学生最后的思路，给一个很小、可继续开口的切入提示。",
    silence_followup: "1 分钟提示后，学生仍沉默或无法推进，可以进入互动讲解。",
    error_silence: "局部错误或笔迹可疑后，学生 1 分钟没有新的语音或书写，可以进入互动讲解。",
    repeat_wrong: "学生连续答错或修正失败达到 3 次，可以进入互动讲解。",
    next_step: "学生在互动讲解中要求听下一小步。",
    jump: "学生可能直接跳到结果，缺少列式或理由。",
    check: "学生提到算错、符号、单位或需要检查。",
    thought_complete: "学生停顿了 2 到 3 秒，可能完成了一段思路；请先判断是否真的需要回应。",
    normal: "学生正在正常讲解。"
  }[body.eventType || "normal"] || "学生正在讲题。";

  if (body.eventType === "silence_escalation") {
    eventText.silence_escalation = "The student has remained silent through another escalation interval. Give a more concrete next step than the previous hint; later stages may include the equation and verified answer.";
  }
  const silenceStage = Math.max(0, Math.min(4, Number(body.silenceStage) || 0));
  const silencePolicy = getSilenceGuidePolicy(silenceStage);
  const guideState = body.guideState || silencePolicy.guideState || "heuristic_guidance";
  const lectureUnlocked = Boolean(body.lectureUnlocked || silencePolicy.guideState === "interactive_teaching");
  const allowUnverifiedFinalAnswer = body.allowUnverifiedFinalAnswer === true || silencePolicy.allowUnverifiedFinalAnswer;
  let answerKey;
  const memoryId = String(body.memoryId || body.questionMemory?.memoryId || "").trim();
  try {
    if (body.questionMemory?.ready === true) {
      answerKey = questionMemoryToAnswerKey(
        body.questionMemory,
        String(body.questionId || "").trim(),
        memoryId
      );
      console.info("[guide] answer-key source=question-memory", {
        questionId: body.questionId || "",
        memoryId,
        trusted: Boolean(answerKey?.trusted)
      });
    } else {
      // Do not serialize a second multimodal answer-key request in front of
      // every guide request. On a cold question that created a 45s + 45s
      // chain, while the browser gives the guide request only ~52s. The guide
      // model already receives the question image and can produce the next
      // concrete step directly; a verified key is reused only when the frozen
      // Question Memory is ready.
      console.info("[guide] answer-key lookup skipped for single-pass guide", {
        questionId: body.questionId || "",
        hasQuestionMemory: Boolean(body.questionMemory),
        reason: "avoid-serial-multimodal-request"
      });
      answerKey = makeUnavailableAnswerKey(
        new Error("guide-single-pass-no-ready-question-memory")
      );
    }
  } catch (error) {
    console.warn(`[guide] answer-key unavailable: ${error?.code || "unknown"} ${error?.message || error}`);
    answerKey = makeUnavailableAnswerKey(error);
  }

  console.info("[guide] qwen request-start", {
    eventType: body.eventType || "normal",
    questionId: body.questionId || "",
    model: QWEN_GUIDE_MODEL,
    silenceStage,
    answerKeyTrusted: Boolean(answerKey?.trusted)
  });

  const answerReference = !answerKey?.trusted && allowUnverifiedFinalAnswer
    ? {
        trusted: false,
        instruction: "No verified answer key is available. At silence stage 4, solve the problem directly from the question image, derive the key equations, check the arithmetic, and state the final answer. Do not withhold the solution merely because the reference key is unavailable."
      }
    : privateAnswerReference(answerKey);

  // The question image is the authority, and the answer-key outline is the
  // authority for concrete guidance. The client can send a board/OCR-derived
  // hint, but that hint must never replace a verified step: OCR fragments can
  // concatenate unrelated symbols and create equations that are not in the
  // question.
  const givenConditions = answerKey?.trusted
    ? normalizeGivenConditions(answerKey.givenConditions)
    : [];
  const verifiedGuideSteps = answerKey?.trusted && Array.isArray(answerKey.solutionOutline)
    ? filterGuideStepsByKnownConditions(answerKey.solutionOutline, givenConditions)
    : [];
  // The current screenshot is the visual source of board progress. A fresh
  // structured result from the immediately preceding multimodal recognition
  // may additionally mark already-confirmed steps, so the guide can advance
  // instead of asking for the same written line again.
  const guideProgress = deriveGuideProgress({
    verifiedGuideSteps,
    givenConditions,
    latestHandwritingResult: body.recognizedBoardProgress || null,
    latestStudentSpeech: body.latestStudentSpeech || "",
    previousGuideQuestion: body.lianQuestion || body.previousGuideQuestion || "",
    askedConcepts: body.askedConcepts,
    resolvedConcepts: body.resolvedConcepts
  });
  const suppliedStep = String(body.silenceContextStep || "").replace(/\s+/g, " ").trim();
  const suppliedStepIsTrusted = Boolean(
    suppliedStep && verifiedGuideSteps.some((step) => step === suppliedStep || step.includes(suppliedStep) || suppliedStep.includes(step))
  );
  const verifiedGuideStep = guideProgress.currentStep || "";
  const guideBody = {
    ...body,
    skipGuideModelAudit: true,
    problemText: answerKey?.trusted && answerKey.problemText
      ? answerKey.problemText
      : body.problemText || "",
    silenceContextStep: suppliedStepIsTrusted && !guideProgress.completedSteps.some((item) => item.evidence === suppliedStep)
      ? suppliedStep
      : verifiedGuideStep,
    verifiedGuideSteps,
    guideProgress
  };

  const guideRequestStartedAt = Date.now();
  console.info("[guide] payload-images", {
    questionId: body.questionId || "",
    questionImageChars: 0,
    boardImageChars: String(currentBoardImage).length,
    totalImageChars: String(currentBoardImage).length
  });
  let guideResult = await callGuideQwenMultimodalJson({
    model: QWEN_GUIDE_MODEL,
    schema: guideSchema,
    instructions: [
      LIAN_GUIDE_PROMPT,
      HANDWRITING_CONSISTENCY_RULES,
      ORDERED_PROPORTION_RULES,
      STATEMENT_EVALUATION_RULES,
      COMPANION_DIALOGUE_POLICY,
      LECTURE_COMPLETION_RULES,
      "Concrete guidance source: prefer verifiedGuideSteps and verifiedAnswerReference.solutionOutline. When Question Memory is unavailable, derive only one non-final next operation from the current screenshot's visible equation and the question image; never copy an unverified OCR fragment or invent a relation that is not visible.",
    `SILENCE POLICY OVERRIDE: stage ${silenceStage}. The first automatic silence response is stage 2 at 60 seconds; do not give the vague stage-1 care prompt. Stage 2 must give the first concrete problem-specific relation or operation; stage 3 gives the next key equation and asks the student to write or repeat it; stage 4 gives a concise but complete explanation with the key equations and final answer. At stage 4, solve from the question image when no verified reference is available, and check the arithmetic before speaking. Never invent an answer and never repeat an earlier weaker hint.`,
    ].join("\n\n"),
    content: [
      {
        type: "input_text",
        text: JSON.stringify({
          event: eventText,
          eventType: body.eventType || "normal",
          questionId: body.questionId || "",
          questionTitle: body.questionTitle || "",
          lianQuestion: body.lianQuestion || "",
          currentGuideState: guideState,
          lectureUnlocked,
          silenceStage,
          allowConcreteStep: body.allowConcreteStep === true || silencePolicy.allowConcreteStep,
          allowFormula: body.allowFormula === true || silencePolicy.allowFormula,
          allowFinalAnswer: body.allowFinalAnswer === true || silencePolicy.allowFinalAnswer,
          allowUnverifiedFinalAnswer,
          silenceSeconds: body.silenceSeconds || 0,
          boardIdleSeconds: body.boardIdleSeconds || 0,
          stuckCount: body.stuckCount || 0,
          wrongAttemptCount: body.wrongAttemptCount || 0,
          interactiveStepCount: body.interactiveStepCount || 0,
          awaitingSilenceFollowup: Boolean(body.awaitingSilenceFollowup),
          dialogueMode: body.dialogueMode || "standard",
          thoughtSegments: body.thoughtSegments || 0,
          hasConclusion: Boolean(body.hasConclusion),
          hasMathStep: Boolean(body.hasMathStep),
          studentFinalAnswerEvidence: Boolean(body.studentFinalAnswerEvidence),
          answerVerified: Boolean(body.answerVerified),
          boardCompletionVerified: Boolean(body.boardCompletionVerified),
          transcript: body.transcript || "",
          latestStudentSpeech: body.latestStudentSpeech || "",
          knownProblemText: guideBody.problemText || "",
          questionType: body.questionType || body.problemType || body.type || "",
          knownKnowledgePoints: body.knowledgePoints || [],
          hasBoardInk: body.hasBoardInk === true,
          guideProgress,
          givenConditions: guideProgress.givenConditions,
          askedConcepts: guideProgress.askedConcepts,
          resolvedConcepts: guideProgress.resolvedConcepts,
          silenceContextStep: guideBody.silenceContextStep || "",
          verifiedGuideSteps,
          boardPendingRecognition: Boolean(body.boardPendingRecognition),
          recognizedBoardProgress: body.recognizedBoardProgress || null,
          verifiedAnswerReference: answerReference,
          boundaryRules: [
            "When silenceStage is at least 1 and silenceContextStep is present, use that exact problem-specific relation as formulaOrStep and explain only that one next step; do not replace it with generic wording.",
            "givenConditions 是题目明确给出的已知条件，优先级高于所有推导步骤。绝对不要询问 givenConditions 中的关系式是如何由其他式子推出的；例如 givenConditions 包含 m-n=8 时，只能把它作为已知条件使用，不能再问 m-n=8 是怎么得到的。",
            "At silenceStage 1, one concrete relation or formula is allowed, but the final answer is still forbidden until the verified-answer stage.",
            "At silenceStage 4, give the complete problem-specific explanation, key equations, and final answer even when the standard answer reference is unavailable; derive and check it from the question image instead of returning a generic retry message.",
            "如果 eventType=answer_to_lian_question，必须优先回应 lianQuestion 和 latestStudentSpeech 的对应关系，shouldSpeak=true，通常一句话确认后再给一个很小的下一步。",
            "如果学生回答的是要讲哪一道题、哪一步或哪种方式，先接受这个选择，不要根据黑板截图另行改成别的题号。",
            "lectureUnlocked=false 时只能启发引导或微提示，hintLevel 只能为 encourage/light。",
            "lectureUnlocked=false 时 speech 不得包含最终答案、中间完整算式或完整解题步骤。",
            "lectureUnlocked=true 时默认只讲一个小步骤；但 silenceStage>=4 且学生持续沉默时，必须一次性完成当前题的详细讲解，给出关键式和最终答案。",
            `沉默引导阶段=${silenceStage}：阶段1必须直接指出下一步要使用的具体条件或关系，不得只问“卡在哪里”；阶段2可以给出下一步具体运算关系；阶段3可以给出关键式子并要求学生写下或复述；阶段4如果学生持续沉默，直接根据题图完成详细讲解，给出关键式子和最终答案，不需要等待标准答案核验，但必须先自行检查计算。`,
            "沉默时间越长，引导必须越具体：不能在后续阶段重复阶段1的泛泛提问，也不能把已经给过的提示原样重复。",
            "每次互动讲解后 studentAction 必须要求学生复述、继续说或写回黑板。",
            "如果 eventType=active_help，学生已经明确提问或表示不会，必须 shouldSpeak=true，并直接回应这个问题；只给当前最需要的一个小步骤，不要先泛泛鼓励。",
            "普通沉默达到 60 秒时，必须 shouldSpeak=true，并直接给出贴着题目和学生当前进度的具体关系或下一步操作；不要再给泛泛的‘你卡在哪里’。只有 silenceStage>=3 才能逐步给出关键式；silenceStage>=4 且学生持续沉默时，允许直接完成题目讲解并给出最终答案，即使标准答案参考暂不可用，也必须从题图推导并检查。",
            "如果 eventType=thought_complete 且学生只是半句话、过渡句或仍在铺垫，shouldSpeak=false。",
            "如果 eventType=thought_complete 且确实需要回应，speech 只能是一句短回应；不要展开完整讲解、不要连续解释多个概念。",
            "lectureComplete 默认必须为 false；只有 answerVerified=true、boardCompletionVerified=true，且学生已经讲完关键思路时才设为 true。点击‘我讲完了’本身不是完成证据。",
            "lectureComplete=true 后 speech 只做一次收束，不得继续追问、要求复述或重复已经说过的选项。",
            "任何对错判断、算式、选项或答案都必须与 verifiedAnswerReference 一致；但 silenceStage>=4 且 allowUnverifiedFinalAnswer=true 时，允许直接从题目图片推导并检查后给出关键式和最终答案，不要因为 trusted=false 而退回泛泛提示。",
            "verifiedAnswerReference.trusted=true 时，禁止给出与 canonicalAnswer 不一致的候选最终答案；指出错误时只说具体错在常数项、符号、对应关系或公式，不要说“或者另一个答案”。",
            "如果 verifiedAnswerReference.choiceAnalysis 存在，选项字母只能和其中同标签的 selectedOptionText 一起使用；不要重新猜测 C、D 或其他字母的含义。涉及结论 I/II 时，必须依据 statementVerdicts 的 correct 判断说明。",
            "不要把题目图片里被划掉、红叉或旁边批改的原错答案当作可能正确答案。",
            "禁止使用固定鼓励词：很好、不错、继续、真棒、非常好、很棒。"
          ],
          styleRules: LIAN_STYLE_RULES
        })
      },
      { type: "input_image", label: "当前黑板区域截图（题目与原始笔迹）", image_url: currentBoardImage, detail: "high" }
    ],
    maxOutputTokens: 1200
  }, {
    questionId: guideQuestionId,
    eventType: body.eventType || "",
    requestId: guideRequestId,
    sessionId: guideSessionId
  });

  guideResult = ensureConcreteGuideInstruction(guideResult, {
    guideProgress,
    silenceContextStep: guideBody.silenceContextStep,
    verifiedGuideSteps,
    recognizedBoardProgress: body.recognizedBoardProgress,
    hasFinalAnswer: Boolean(body.studentFinalAnswerEvidence || body.answerVerified),
    answerVerified: body.answerVerified === true,
    boardCompletionVerified: body.boardCompletionVerified === true
  });

  if (!isLatestGuideRequest(guideSessionId, guideQuestionId, guideRequestId)) {
    sendJson(res, 409, {
      error: "stale guide request",
      code: "stale_request",
      stage: "response-order",
      requestId: guideRequestId,
      sessionId: guideSessionId,
      questionId: guideQuestionId
    });
    return;
  }

  // Model-only guide mode: only an actionable Qwen speech is returned.
  // Local code may reject a vague response, but it never writes replacement
  // mathematics or speech into the model result.
  console.info("[guide] qwen response accepted without local post-processing", {
    eventType: body.eventType || "",
    silenceStage: Number(body.silenceStage) || 0,
    hasSpeech: Boolean(String(guideResult?.speech || "").trim()),
    hasFormula: Boolean(String(guideResult?.formulaOrStep || "").trim()),
    shouldSpeak: guideResult?.shouldSpeak !== false,
    lectureComplete: guideResult?.lectureComplete === true,
    elapsedMs: Date.now() - guideRequestStartedAt
  });
  sendJson(res, 200, {
    ...guideResult,
    progress: guideProgress,
    model: guideResult?.model || guideResult?.qwenModel || QWEN_GUIDE_MODEL,
    requestId: guideRequestId,
    sessionId: guideSessionId,
    questionId: guideQuestionId,
    answerVerification: answerKey.trusted ? "structured-single-pass" : answerKey.status,
    provider: "qwen-structured-answer-guidance",
    fallbackFrom: "",
    guideSpeechSource: "qwen"
  });
}

async function handleHandwriting(req, res) {
  const task = createHandwritingTask();
  const listeners = [];
  const markClientDisconnected = (reason) => {
    if (task.disconnectHandled || res.writableEnded) return;
    task.clientConnected = false;
    task.disconnectHandled = true;
    task.disconnectReason = reason;
    let abortSuccess = false;
    try {
      task.abortController.abort(createAbortError("客户端已断开", "qwen_client_disconnected"));
      abortSuccess = task.abortController.signal.aborted;
    } catch (error) {
      task.abortError = error?.message || String(error);
    }
    task.abortSuccess = abortSuccess;
    console.warn("[handwriting-task] client_disconnected", {
      task_id: task.taskId,
      reason,
      abort_success: abortSuccess,
      request_start_time: task.requestStartTime
    });
  };
  const onRequestAborted = () => markClientDisconnected("req.aborted");
  const onRequestClose = () => {
    if (req.aborted || !req.complete) markClientDisconnected("req.close");
  };
  const onResponseClose = () => {
    if (!res.writableEnded) markClientDisconnected("res.close");
  };
  req.on("aborted", onRequestAborted);
  req.on("close", onRequestClose);
  res.on("close", onResponseClose);
  listeners.push(
    [req, "aborted", onRequestAborted],
    [req, "close", onRequestClose],
    [res, "close", onResponseClose]
  );

  try {
    await handleHandwritingInternal(req, res, task);
    if (task.finalStatus === "RUNNING" && !task.disconnectHandled) {
      finishHandwritingTask(task, "SUCCEEDED");
    }
  } catch (error) {
    task.errorCode = error?.code || error?.name || "handwriting_failed";
    task.errorStage = error?.stage || "handwriting";
    if (task.disconnectHandled || task.errorCode === "qwen_client_disconnected") {
      finishHandwritingTask(task, "CLIENT_DISCONNECTED", {
        errorMessage: error?.message || "client disconnected"
      });
      return;
    }
    console.error("[handwriting-task] failed", {
      task_id: task.taskId,
      stage: task.errorStage,
      code: task.errorCode,
      message: error?.message || String(error)
    });
    if (!res.writableEnded && !res.destroyed) {
      sendJson(res, error?.statusCode || 502, {
        error: error?.message || "板书识别失败",
        code: task.errorCode,
        stage: task.errorStage,
        task_id: task.taskId
      });
    }
    finishHandwritingTask(task, "FAILED", {
      errorMessage: error?.message || String(error)
    });
  } finally {
    for (const [emitter, eventName, listener] of listeners) {
      emitter.removeListener(eventName, listener);
    }
    if (task.finalStatus === "RUNNING") {
      finishHandwritingTask(task, task.disconnectHandled ? "CLIENT_DISCONNECTED" : "FINISHED");
    }
  }
}

async function handleHandwritingInternal(req, res, task) {
  const requestStartedAt = Date.now();
  const body = await readJsonBody(req, 24 * 1024 * 1024, task.abortController.signal);
  const sessionId = String(body.sessionId || "").trim();
  const questionId = String(body.questionId || "").trim();
  const memoryId = String(body.memoryId || body.questionMemory?.memoryId || "").trim();
  if (!sessionId || !questionId || !memoryId) {
    sendJson(res, 409, {
      error: "handwriting request identity is incomplete",
      code: "request_identity_missing",
      stage: "request-identity"
    });
    return;
  }
  if (!body.boardImage) {
    sendJson(res, 400, { error: "缺少当前黑板截图 boardImage" });
    return;
  }

  const boardImage = body.boardImage;
  const diagnostics = summarizeHandwritingDiagnostics(body.handwritingDiagnostics);
  task.taskId = String(body.taskId || body.handwritingDiagnostics?.taskId || task.taskId);
  task.boardVersion = Number(diagnostics.boardVersion || 0);
  task.sessionId = sessionId;
  task.questionId = questionId;
  task.memoryId = memoryId;
  task.versionKey = handwritingVersionKey(sessionId, questionId, task.boardVersion);
  diagnostics.taskId = task.taskId;
  diagnostics.task_id = task.taskId;
  diagnostics.request_start_time = task.requestStartTime;
  diagnostics.client_connected = true;
  if (
    (diagnostics.sessionId && diagnostics.sessionId !== Number(sessionId)) ||
    (diagnostics.requestId && diagnostics.requestId !== Number(body.requestId || 0)) ||
    (diagnostics.memoryId && diagnostics.memoryId !== memoryId)
  ) {
    sendJson(res, 409, { error: "handwriting request identity mismatch", code: "request_identity_mismatch", stage: "request-identity" });
    return;
  }
  try {
    registerQuestionMemoryIdentity(
      sessionId,
      questionId,
      memoryId,
      questionMemoryFingerprint(body.questionMemory)
    );
    registerHandwritingRequest(sessionId, questionId, body.requestId);
  } catch (error) {
    sendJson(res, error.statusCode || 409, {
      error: error.message || "handwriting request rejected",
      code: error.code || "request_rejected",
      stage: error.stage || "request-identity"
    });
    return;
  }
  if (
    body.questionMemory?.sessionId != null &&
    Number(body.questionMemory.sessionId) !== Number(sessionId)
  ) {
    sendJson(res, 409, { error: "Question Memory session mismatch", code: "question_memory_conflict", stage: "question-memory" });
    return;
  }
  const existingTaskId = activeHandwritingVersions.get(task.versionKey);
  if (existingTaskId && activeHandwritingTasks.has(existingTaskId)) {
    sendJson(res, 409, {
      error: "已有相同板书版本正在识别，请等待当前任务结束",
      code: "handwriting_task_running",
      stage: "handwriting-task",
      task_id: task.taskId,
      existing_task_id: existingTaskId
    });
    finishHandwritingTask(task, "DUPLICATE_SUPPRESSED", {
      errorCode: "handwriting_task_running"
    });
    return;
  }
  activeHandwritingTasks.set(task.taskId, task);
  activeHandwritingVersions.set(task.versionKey, task.taskId);
  console.info("[handwriting-task] create", {
    task_id: task.taskId,
    request_start_time: task.requestStartTime,
    client_connected: task.clientConnected,
    session_id: sessionId,
    question_id: questionId,
    board_version: task.boardVersion
  });
  console.log("[handwriting] request", diagnostics);
  if (String(boardImage || "").length < 100) {
    sendJson(res, 400, {
      error: "板书快照为空或过小，请保留板书后重试",
      code: "empty_board_snapshot",
      stage: "snapshot"
    });
    return;
  }
  // The handwriting request consumes the frozen Question Memory created when
  // the question was entered. The same multimodal call now compares visible
  // board work with that trusted reference; no second answer-check call is
  // needed for the normal completion path.
  const answerKey = questionMemoryToAnswerKey(body.questionMemory, questionId, memoryId);
  console.log(
    `[handwriting-timing] question-memory=${Date.now() - requestStartedAt}ms trusted=${answerKey.trusted} q=${diagnostics.questionId} v=${diagnostics.boardVersion}`
  );

  task.qwenStartTime = new Date().toISOString();
  diagnostics.qwen_start_time = task.qwenStartTime;
  console.info("[handwriting-task] qwen_start", {
    task_id: task.taskId,
    stage: "handwriting-model",
    model_name: QWEN_HANDWRITING_MODEL,
    start_time: task.qwenStartTime
  });
  let result = await callHandwritingQwenJson({
    model: diagnostics.winnerModel || QWEN_HANDWRITING_MODEL,
    schema: handwritingSchema,
    instructions: HANDWRITING_PROMPT,
    content: [
      {
        type: "input_text",
        text: JSON.stringify({
          trigger: body.reason || "停笔后异步识别",
          boardIdleSeconds: Math.max(0, Number(body.boardIdleSeconds) || 0),
          latestStudentSpeech: String(body.latestStudentSpeech || "").trim(),
          studentSpeechTranscript: String(body.studentSpeechTranscript || "").trim(),
          hasBoardInk: body.hasBoardInk === true,
          instruction:
            "只依据当前黑板区域截图（题目图片与学生原始笔迹）判断当前状态和下一动作；笔迹优先于本题完整语音记录 studentSpeechTranscript 及 latestStudentSpeech；当截图中出现最终答案和关键步骤时，使用 verifiedAnswerReference 直接完成核验；如果没有笔迹只能提醒写板书；不要读取或复述任何旧识别结果。",
          verifiedAnswerReference: privateAnswerReference(answerKey)
        })
      },
      { type: "input_image", label: "当前黑板区域截图（题目与原始笔迹）", image_url: boardImage, detail: "high" }
    ],
    maxOutputTokens: 700,
    signal: task.abortController.signal,
    timeoutMs: QWEN_HANDWRITING_TOTAL_TIMEOUT_MS
  }, diagnostics);
  task.qwenResponseTime = new Date().toISOString();
  diagnostics.qwen_response_time = task.qwenResponseTime;
  console.info("[handwriting-task] qwen_response", {
    task_id: task.taskId,
    stage: "handwriting-model",
    response_time: task.qwenResponseTime
  });
  console.log(`[handwriting-timing] initial=${Date.now() - requestStartedAt}ms`);

  result = await auditHandwritingResult(result, answerKey, body, boardImage, {
    signal: task.abortController.signal,
    timeoutMs: QWEN_HANDWRITING_TOTAL_TIMEOUT_MS,
    diagnostics
  });
  result = applyStatementEvaluationSafety(result, answerKey);
  result = buildHandwritingProcessFeedback(result, answerKey, body);
  result = applyHandwritingAnswerVerification(result, answerKey);

  if (!answerKey.trusted && ["correct", "wrong"].includes(result.calculationStatus)) {
    result = {
      ...result,
      answerVerificationStatus: result.finalAnswer ? "unclear" : "not_present",
      answerFeedback: "",
      answerHint: "Question Memory 尚未就绪，暂时不能确认最终答案。",
      calculationStatus: "unclear",
      calculationCheck: "Question Memory 尚未就绪，暂不判断板书对错。",
      hasPossibleIssue: false,
      issueType: "unclear",
      issueSummary: "",
      errorLocation: "",
      errorEvidence: "",
      expectedNextStep: "",
      guidance: "",
      positiveFeedback: "",
      boardComplete: false,
      missingBoardContent: result.missingBoardContent || "Question Memory 尚未就绪，暂时不能确认板书完整。"
    };
  }

  if (
    /完成讲解前检查/.test(String(body.reason || "")) &&
    result.boardComplete === true &&
    isOnlyDirectAnswerWriting(result.detectedWriting || result.mathExpression)
  ) {
    result = {
      ...result,
      boardComplete: false,
      missingBoardContent: "目前只有最终答案，请再写一个关键关系式、公式或计算步骤。"
    };
  }

  const timingMs = Date.now() - requestStartedAt;
  console.log(`[handwriting-timing] total=${timingMs}ms`);
  if (!isLatestHandwritingRequest(sessionId, questionId, body.requestId)) {
    sendJson(res, 409, {
      error: "stale handwriting request",
      code: "stale_request",
      stage: "response-order"
    });
    return;
  }
  sendJson(res, 200, {
    ...result,
    requestId: Number(body.requestId || 0),
    sessionId: Number(sessionId),
    questionId,
    memoryId,
    answerVerification: answerKey.trusted ? "question-memory" : answerKey.status,
    model: QWEN_HANDWRITING_MODEL,
    provider: "qwen-structured-answer-handwriting",
    task_id: task.taskId,
    task_status: "SUCCEEDED",
    timingMs,
    handwritingDiagnostics: diagnostics
  });
}

function isOnlyDirectAnswerWriting(value) {
  const text = String(value || "")
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[。；;，,]/g, "")
    .replace(/^(?:最终答案|答案|结果)(?:是|为)?/, "")
    .replace(/(?:厘米|米|千米|平方厘米|平方米|立方厘米|立方米|度|°|cm|m|km)\d*$/i, "");
  if (!text) return true;
  if (/^(?:选)?[A-D](?:选项)?$/i.test(text)) return true;
  return /^(?:[a-zA-Z]|[A-Za-z][A-Za-z0-9_]*)=(?:[-+]?\d+(?:\.\d+)?|[-+]?\d+\/[-+]?\d+)$/.test(text);
}

function shouldAuditHandwritingResult(result, answerKey, body = {}) {
  if (!HANDWRITING_AUDIT_ENABLED) return false;
  // Completion is a single user-facing save gate. Running a second
  // multimodal audit after the primary handwriting result makes this path
  // consume two full model calls and can exhaust the handwriting deadline.
  // The primary result plus the local safety checks are sufficient here;
  // audit remains available for ordinary handwriting observations.
  if (/完成讲解前检查/.test(String(body.reason || ""))) return false;
  if (!answerKey?.trusted) return false;
  const status = String(result?.calculationStatus || "");
  if (!["correct", "wrong"].includes(status)) return false;
  // A complete, correct board with a visible final answer has already been
  // verified by the primary multimodal request. Running a second visual call
  // here can replace its visible steps with an empty/uncertain audit and send
  // the student back into guidance. Keep the single-pass verdict authoritative.
  if (
    status === "correct" &&
    result?.boardComplete === true &&
    String(result?.finalAnswer || "").trim() &&
    Array.isArray(result?.completedSteps) &&
    result.completedSteps.length > 0
  ) return false;
  const confidence = Number(result?.confidence) || 0;
  const hasConcreteWrongEvidence = Boolean(
    String(result?.errorLocation || "").trim() &&
    String(result?.errorEvidence || result?.issueSummary || result?.calculationCheck || "").trim()
  );
  // Only unstable judgments need a second model call. Stable results return
  // after the primary multimodal request so each board pause stays fast.
  if (status === "wrong") return confidence < 0.86 || !hasConcreteWrongEvidence;
  return confidence < HANDWRITING_FAST_CONFIDENCE || result?.boardComplete !== true;
}

function makeHandwritingUncertain(result, reason = "板书判断还需要再核对") {
  return {
    ...(result || {}),
    calculationStatus: "unclear",
    calculationCheck: reason,
    hasPossibleIssue: false,
    issueType: "unclear",
    issueSummary: "",
    errorLocation: "",
    errorEvidence: "",
    guidance: "",
    positiveFeedback: "",
    confidence: Math.min(Number(result?.confidence) || 0.5, 0.55)
  };
}

function normalizeVisibleCompletedSteps(value) {
  const seen = new Set();
  return (Array.isArray(value) ? value : [])
    .map((item) => String(item || "").trim())
    .filter((item) => item && !seen.has(item) && seen.add(item))
    .slice(0, 8);
}

function buildHandwritingProcessFeedback(result, answerKey, body = {}) {
  const completedSteps = normalizeVisibleCompletedSteps(result?.completedSteps);
  const modelAction = ["continue_guidance", "verify_answer", "ask_for_board", "finished"].includes(result?.nextAction)
    ? result.nextAction
    : "";
  const modelGuidance = String(result?.guidance || "").trim();
  const idleSeconds = Math.max(0, Number(body.boardIdleSeconds) || 0);
  const initialWritingState = String(result?.writingState || "").trim();
  const writingState = initialWritingState === "stalled" && idleSeconds < 15
    ? "in_progress"
    : initialWritingState || (
      result?.calculationStatus === "incomplete"
        ? "in_progress"
        : result?.calculationStatus === "not_relevant"
          ? "not_relevant"
          : result?.calculationStatus === "unclear"
            ? "unclear"
            : "complete"
    );
  const errorLocation = String(result?.errorLocation || "").trim();
  const errorEvidence = String(result?.errorEvidence || result?.issueSummary || "").trim();
  const explicitWrong =
    result?.calculationStatus === "wrong" &&
    Number(result?.confidence) >= 0.72 &&
    Boolean(errorLocation && errorEvidence);

  if (result?.calculationStatus === "wrong" && !explicitWrong) {
    return {
      ...makeHandwritingUncertain(result, "没有同时确认明确错误位置和可核对证据，暂不打断学生。"),
      writingState: writingState === "complete" ? "unclear" : writingState,
      completedSteps,
      expectedNextStep: ""
    };
  }

  const memorySteps = answerKey?.trusted && Array.isArray(answerKey.solutionOutline)
    ? answerKey.solutionOutline.map((step) => String(step || "").trim()).filter(Boolean)
    : [];
  const nextMemoryStep = memorySteps.find((step) => !completedSteps.some((item) => evidenceContainsStep(step, item))) || "";
  const latestVisibleStep = completedSteps.at(-1) || "";
  const output = {
    ...(result || {}),
    writingState,
    completedSteps,
    errorLocation: explicitWrong ? errorLocation : "",
    errorEvidence: explicitWrong ? errorEvidence : "",
    expectedNextStep: "",
    guidance: modelGuidance,
    positiveFeedback: ""
  };

  if (explicitWrong) {
    return {
      ...output,
      hasPossibleIssue: true,
      boardComplete: false,
      guidance: `先检查${errorLocation}：${errorEvidence}${answerKeyCorrection(answerKey)}`
    };
  }

  // A structured handwriting result owns the next action. For a correct,
  // already-progressing board, replace a repetitive model prompt with the
  // next trusted step so completed work is never requested again.
  if (modelAction) {
    if (
      result?.calculationStatus === "correct" &&
      completedSteps.length > 0 &&
      ["continue_guidance", "ask_for_board"].includes(modelAction) &&
      nextMemoryStep
    ) {
      return {
        ...output,
        guidance: `下一步直接做：${nextMemoryStep}`,
        expectedNextStep: nextMemoryStep
      };
    }
    return output;
  }

  if (result?.calculationStatus === "incomplete" && writingState === "stalled" && nextMemoryStep) {
    return {
      ...output,
      expectedNextStep: nextMemoryStep,
      guidance: latestVisibleStep
        ? `你已经写到“${latestVisibleStep}”。可以从 Question Memory 的下一小步“${nextMemoryStep}”继续。`
        : `可以从 Question Memory 的下一小步“${nextMemoryStep}”开始。`
    };
  }

  if (result?.calculationStatus === "correct" && latestVisibleStep) {
    return {
      ...output,
      positiveFeedback: `你已经写出了“${latestVisibleStep}”。`
    };
  }

  return output;
}

function answerKeyCorrection(answerKey) {
  const choice = normalizeChoiceAnalysis(answerKey?.choiceAnalysis);
  if (choice.selectedOption && choice.selectedOptionText) {
    return `正确选项应为：${choice.selectedOption}。${choice.selectedOptionText}`;
  }
  const canonical = String(answerKey?.canonicalAnswer || "").trim();
  return canonical ? `正确答案应为：${canonical}` : "";
}

function applyHandwritingAnswerVerification(result, answerKey) {
  const finalAnswer = String(result?.finalAnswer || "").normalize("NFKC").trim();
  const status = ["not_present", "correct", "wrong", "unclear"].includes(result?.answerVerificationStatus)
    ? result.answerVerificationStatus
    : "unclear";
  if (!finalAnswer) {
    return {
      ...(result || {}),
      answerVerificationStatus: "not_present",
      answerFeedback: "",
      answerHint: ""
    };
  }
  if (!answerKey?.trusted) {
    return {
      ...(result || {}),
      answerVerificationStatus: "unclear",
      answerFeedback: "",
      answerHint: "标准答案还没有准备完成，暂时不能确认最终答案。"
    };
  }

  const matches = studentAnswerMatchesVerifiedKey(finalAnswer, answerKey);
  const errorLocation = String(result?.errorLocation || "").trim();
  const errorEvidence = String(result?.errorEvidence || "").trim();
  const concreteHint = errorLocation && errorEvidence
    ? `先检查${errorLocation}：${errorEvidence}`
    : "";
  const modelHint = String(result?.answerHint || "").trim();
  const genericHint = /最终答案与标准答案不一致|检查最后一步|检查最后一步的计算或选项/.test(modelHint);
  const expectedHint = answerKeyCorrection(answerKey);
  const detailedHint = concreteHint && genericHint
    ? concreteHint
    : String(modelHint || concreteHint || result?.issueSummary || "最终答案与标准答案不一致，请检查最后一步。").trim();
  const answerHintWithExpected = expectedHint && !/(?:正确应为|正确答案应为|正确选项应为|应选|应该是)/.test(detailedHint)
    ? `${detailedHint}${expectedHint}`
    : detailedHint;
  if (matches && status === "correct") {
    return {
      ...(result || {}),
      answerVerificationStatus: "correct",
      answerFeedback: String(result?.answerFeedback || "答案与标准答案一致。").trim(),
      answerHint: ""
    };
  }
  if (!matches && status === "wrong") {
    return {
      ...(result || {}),
      answerVerificationStatus: "wrong",
      answerFeedback: "",
      answerHint: answerHintWithExpected
    };
  }
  if (!matches && status === "correct") {
    return {
      ...(result || {}),
      answerVerificationStatus: "wrong",
      answerFeedback: "",
      answerHint: answerHintWithExpected || `最终答案与标准答案不一致。${expectedHint}`
    };
  }
  return {
    ...(result || {}),
    answerVerificationStatus: "unclear",
    answerFeedback: "",
    answerHint: String(result?.answerHint || "最终答案暂时看不清，或还不能与标准答案可靠比较。").trim()
  };
}

function answerKeyTextForSafety(answerKey) {
  const parts = [
    answerKey?.problemText,
    answerKey?.canonicalAnswer,
    answerKey?.questionType,
    answerKey?.knowledge,
    ...(Array.isArray(answerKey?.givenConditions) ? answerKey.givenConditions : []),
    ...(Array.isArray(answerKey?.acceptedAnswers) ? answerKey.acceptedAnswers : []),
    ...(Array.isArray(answerKey?.solutionOutline) ? answerKey.solutionOutline : []),
    ...(Array.isArray(answerKey?.verificationChecks) ? answerKey.verificationChecks : [])
  ];
  return parts.filter(Boolean).join(" ").normalize("NFKC");
}

function looksLikeStatementEvaluationQuestion(answerKey) {
  const text = answerKeyTextForSafety(answerKey);
  return /(?:\u7ed3\u8bba|\u8bf4\u6cd5|\u5224\u65ad|\u6b63\u786e\u7684\u662f|\u4e0d\u6b63\u786e|\u9009\u9879|I{1,3}|[ABCD][\.\u3001\uff0e]?|[\u2160\u2161\u2162])/i.test(text);
}

function applyStatementEvaluationSafety(result, answerKey) {
  if (!looksLikeStatementEvaluationQuestion(answerKey)) return result;
  if (String(result?.calculationStatus || "") !== "wrong") return result;
  const issueText = [
    result?.calculationCheck,
    result?.issueSummary,
    result?.errorLocation,
    result?.errorEvidence
  ].filter(Boolean).join(" ").normalize("NFKC");
  const saysConditionMismatch = /(?:\u4e0d\u7b26|\u4e0d\u7b26\u5408|\u4e0d\u4e00\u81f4|\u51b2\u7a81|inconsistent|conflict|violate)/i.test(issueText);
  const hasConcreteArithmeticFault = /(?:\u7b97\u9519|\u8fd0\u7b97\u9519|\u7b26\u53f7\u9519|\u6b63\u8d1f|\u7b49\u53f7\u9519|\u4ee3\u5165\u9519|\u5217\u5f0f\u9519|arithmetic|sign error|wrong equation)/i.test(issueText);
  if (!saysConditionMismatch || hasConcreteArithmeticFault) return result;
  return makeHandwritingUncertain(
    result,
    "\u8fd9\u662f\u7ed3\u8bba/\u9009\u9879\u6838\u5bf9\u9898\uff0c\u677f\u4e66\u53ef\u80fd\u662f\u5728\u53cd\u9a73\u67d0\u4e2a\u7ed3\u8bba\uff0c\u6682\u4e0d\u64ad\u51fa\u7b3c\u7edf\u7684\u9519\u8bef\u5224\u65ad\u3002"
  );
}

function applyHandwritingAudit(result, audit) {
  const status = String(audit?.correctedStatus || result?.calculationStatus || "unclear");
  const confidence = Math.max(0, Math.min(1, Number(audit?.confidence) || 0));
  const safeToSpeak = audit?.safeToSpeak === true && confidence >= 0.72;
  const auditedStatus = safeToSpeak
    ? status
    : (status === "correct" || status === "wrong" ? "unclear" : status);
  const hasIssue = auditedStatus === "wrong";
  const auditedSteps = normalizeVisibleCompletedSteps(audit?.completedSteps);
  const originalSteps = normalizeVisibleCompletedSteps(result?.completedSteps);
  const completedSteps = auditedSteps.length ? auditedSteps : originalSteps;
  const auditBoardComplete = audit?.boardComplete === true || (
    audit?.boardComplete !== false && result?.boardComplete === true
  );
  return {
    ...(result || {}),
    calculationStatus: auditedStatus,
    calculationCheck: audit?.correctedCheck || audit?.reason || result?.calculationCheck || "",
    completedSteps,
    hasPossibleIssue: hasIssue,
    issueType: hasIssue ? (audit?.issueType || result?.issueType || "unclear") : "none",
    issueSummary: hasIssue ? (audit?.issueSummary || audit?.reason || "") : "",
    errorLocation: hasIssue ? String(audit?.errorLocation || result?.errorLocation || "").trim() : "",
    errorEvidence: hasIssue ? String(audit?.errorEvidence || result?.errorEvidence || "").trim() : "",
    guidance: String(result?.guidance || "").trim(),
    positiveFeedback: "",
    boardComplete: auditedStatus === "correct" && auditBoardComplete,
    missingBoardContent: audit?.missingBoardContent || "",
    confidence: confidence || Number(result?.confidence) || 0.5
  };
}

async function auditHandwritingResult(result, answerKey, body, boardImage, control = {}) {
  if (!shouldAuditHandwritingResult(result, answerKey, body)) {
    console.log(
      `[handwriting-audit] skipped status=${result?.calculationStatus || ""} confidence=${result?.confidence || 0}`
    );
    return result;
  }
  try {
    const audit = await callQwenMultimodalJson({
      model: QWEN_HANDWRITING_MODEL,
      schema: handwritingAuditSchema,
      instructions: HANDWRITING_AUDIT_PROMPT,
      content: [
        {
          type: "input_text",
          text: JSON.stringify({
            trigger: body.reason || "",
            boardIdleSeconds: Math.max(0, Number(body.boardIdleSeconds) || 0),
            instruction:
              "只根据当前黑板区域截图独立审校可见步骤，并参考 verifiedAnswerReference 审校可见最终答案。不得读取旧识别结果、补全未写步骤或生成反馈；wrong 必须同时给出明确错误位置和来自截图的证据。",
            verifiedAnswerReference: privateAnswerReference(answerKey)
          })
        },
        { type: "input_image", label: "当前黑板区域截图（题目与原始笔迹）", image_url: boardImage, detail: "high" }
      ],
      maxOutputTokens: 500,
      signal: control.signal || null,
      timeoutMs: control.timeoutMs || QWEN_HANDWRITING_TOTAL_TIMEOUT_MS,
      diagnostics: control.diagnostics || {}
    });
    const audited = applyHandwritingAudit(result, audit);
    console.log(
      `[handwriting-audit] ${result.calculationStatus}->${audited.calculationStatus} safe=${audit.safeToSpeak} confidence=${audit.confidence} reason=${audit.reason || ""}`
    );
    return audited;
  } catch (error) {
    console.warn(`[handwriting-audit] failed: ${error?.message || error}`);
    if (String(result?.calculationStatus || "") === "wrong" || Number(result?.confidence) < 0.85) {
      return makeHandwritingUncertain(result, "板书判断审校没有成功返回，先不判断对错。");
    }
    return result;
  }
}

async function handleQuestionMemory(req, res) {
  const body = await readJsonBody(req);
  const questionId = String(body.questionId || "").trim();
  const sessionId = String(body.sessionId || "").trim();
  const memoryId = String(body.memoryId || "").trim();
  if (!questionId || !sessionId || !memoryId) {
    sendJson(res, 409, {
      error: "Question Memory identity is incomplete",
      code: "question_memory_identity_missing",
      stage: "question-memory"
    });
    return;
  }
  if (!body.questionImage) {
    sendJson(res, 400, { error: "缺少 questionImage" });
    return;
  }
  try {
    registerQuestionMemoryIdentity(sessionId, questionId, memoryId);
  } catch (error) {
    sendJson(res, error.statusCode || 409, {
      error: error.message || "Question Memory identity rejected",
      code: error.code || "question_memory_conflict",
      stage: "question-memory"
    });
    return;
  }
  const answerKey = await getVerifiedAnswerKey(body.questionImage, { problemText: body.problemText || "" });
  sendJson(res, 200, { questionMemory: buildQuestionMemory(questionId, answerKey, memoryId, sessionId) });
}

function supabaseNotebookConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function getNotebookClientId(req) {
  const raw = String(req.headers["x-lian-client-id"] || "").trim();
  const cleaned = raw.replace(/[^A-Za-z0-9._:-]/g, "").slice(0, 128);
  if (cleaned.length < 8) {
    const error = new Error("missing notebook sync id");
    error.statusCode = 400;
    error.code = "missing_notebook_client_id";
    throw error;
  }
  return cleaned;
}

function normalizeNotebookRecord(record) {
  const data = record && typeof record === "object" ? record : {};
  const id = String(data.id || "").trim().slice(0, 160);
  if (!id) return null;
  return {
    client_id: "",
    record_id: id,
    title: String(data.title || "").slice(0, 240),
    status: String(data.status || "").slice(0, 80),
    review_at: data.reviewAt || null,
    created_at: data.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    data
  };
}

async function callSupabaseNotebook(pathSuffix, options = {}) {
  if (!supabaseNotebookConfigured()) {
    const error = new Error("Supabase is not configured");
    error.statusCode = 503;
    error.code = "supabase_not_configured";
    throw error;
  }
  if (!/^[A-Za-z0-9_]+$/.test(SUPABASE_NOTEBOOK_TABLE)) {
    const error = new Error("Invalid Supabase notebook table name");
    error.statusCode = 500;
    error.code = "invalid_supabase_table";
    throw error;
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_NOTEBOOK_TABLE}${pathSuffix}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) {
    const error = new Error(
      (payload && typeof payload === "object" && (payload.message || payload.error)) ||
        text ||
        `Supabase request failed: ${response.status}`
    );
    error.statusCode = response.status;
    error.code = "supabase_request_failed";
    throw error;
  }
  return payload;
}

async function handleNotebookList(req, res) {
  if (!supabaseNotebookConfigured()) {
    sendJson(res, 200, { configured: false, records: [] });
    return;
  }
  const clientId = getNotebookClientId(req);
  const query = [
    `client_id=eq.${encodeURIComponent(clientId)}`,
    "select=record_id,data,updated_at,created_at",
    "order=created_at.desc"
  ].join("&");
  const rows = await callSupabaseNotebook(`?${query}`, { method: "GET" });
  sendJson(res, 200, {
    configured: true,
    records: Array.isArray(rows) ? rows.map((row) => row.data).filter(Boolean) : []
  });
}

async function handleNotebookSync(req, res) {
  if (!supabaseNotebookConfigured()) {
    sendJson(res, 200, { configured: false, synced: 0 });
    return;
  }
  const clientId = getNotebookClientId(req);
  const body = await readJsonBody(req, 32 * 1024 * 1024);
  const records = Array.isArray(body.records) ? body.records : [];
  const rows = records
    .map(normalizeNotebookRecord)
    .filter(Boolean)
    .map((row) => ({ ...row, client_id: clientId }));
  if (!rows.length) {
    sendJson(res, 200, { configured: true, synced: 0 });
    return;
  }
  await callSupabaseNotebook("", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows)
  });
  sendJson(res, 200, { configured: true, synced: rows.length });
}

async function handleNotebookDelete(req, res, recordId) {
  if (!supabaseNotebookConfigured()) {
    sendJson(res, 200, { configured: false, deleted: false });
    return;
  }
  const clientId = getNotebookClientId(req);
  const query = [
    `client_id=eq.${encodeURIComponent(clientId)}`,
    `record_id=eq.${encodeURIComponent(recordId)}`
  ].join("&");
  await callSupabaseNotebook(`?${query}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
  sendJson(res, 200, { configured: true, deleted: true });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
  const safePath = path.normalize(urlPath === "/" ? "/index.html" : urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const extension = path.extname(filePath);
    const headers = { "Content-Type": mimeTypes[extension] || "application/octet-stream" };
    if ([".html", ".js", ".css"].includes(extension)) headers["Cache-Control"] = "no-store";
    res.writeHead(200, headers);
    res.end(data);
  });
}

async function handleRequest(req, res) {
  const pathname = new URL(req.url, `http://localhost:${PORT}`).pathname;
  try {
    if (req.method === "GET" && pathname === "/api/health") {
      return sendJson(res, 200, {
        ok: true,
        service: "lian-wrong-question-book",
        runtime: IS_VERCEL ? "vercel" : "local",
        qwenConfigured: Boolean(QWEN_API_KEY),
        qwenModel: QWEN_VL_MODEL,
        qwenModels: QWEN_VL_MODEL_CANDIDATES,
        qwenGuideModel: QWEN_GUIDE_MODEL,
        qwenGuideModels: QWEN_GUIDE_MODEL_CANDIDATES,
        qwenHandwritingModel: QWEN_HANDWRITING_MODEL,
        qwenHandwritingModels: QWEN_HANDWRITING_MODEL_CANDIDATES,
        qwenModelCooldownMs: QWEN_MODEL_COOLDOWN_MS,
        qwenRequestTimeoutMs: QWEN_REQUEST_TIMEOUT_MS,
        qwenHandwritingRetryCount: QWEN_HANDWRITING_RETRY_COUNT,
        handwritingAuditEnabled: HANDWRITING_AUDIT_ENABLED,
        aliyunOcrConfigured: Boolean(ALIYUN_OCR_APPCODE),
        aliyunOcrEnabled: ALIYUN_OCR_ENABLED,
        aliyunOfficialEduPaperCutConfigured: Boolean(ALIYUN_OCR_ACCESS_KEY_ID && ALIYUN_OCR_ACCESS_KEY_SECRET),
        azureTtsConfigured: Boolean(AZURE_TTS_KEY && AZURE_TTS_REGION),
        azureTtsVoice: AZURE_TTS_VOICE,
        aliyunSpeechConfigured: aliyunSpeechConfigured(),
        aliyunSpeechAppkey: ALIYUN_NLS_APPKEY ? `${ALIYUN_NLS_APPKEY.slice(0, 4)}...${ALIYUN_NLS_APPKEY.slice(-4)}` : "",
        aliyunSpeechVoice: ALIYUN_NLS_VOICE,
        supabaseConfigured: supabaseNotebookConfigured(),
        supabaseNotebookTable: SUPABASE_NOTEBOOK_TABLE,
        segmentAliyunOnly: SEGMENT_ALIYUN_ONLY,
        localOcrEnabled: LOCAL_OCR_ENABLED,
        layoutEnabled: LAYOUT_ENABLED,
        uptimeSeconds: Math.round(process.uptime())
      });
    }
    if (req.method === "GET" && pathname === "/api/notebook") return await handleNotebookList(req, res);
    if (req.method === "PUT" && pathname === "/api/notebook") return await handleNotebookSync(req, res);
    if (req.method === "DELETE" && pathname.startsWith("/api/notebook/")) {
      const recordId = decodeURIComponent(pathname.slice("/api/notebook/".length));
      return await handleNotebookDelete(req, res, recordId);
    }
    if (req.method === "POST" && pathname === "/api/segment") return await handleSegmentV2(req, res);
    if (req.method === "POST" && pathname === "/api/transcript-correct") return await handleTranscriptCorrection(req, res);
    if (req.method === "POST" && pathname === "/api/archive-summary") return await handleArchiveSummary(req, res);
    if (req.method === "POST" && pathname === "/api/question-memory") return await handleQuestionMemory(req, res);
    if (req.method === "POST" && pathname === "/api/tts") return await handleTextToSpeech(req, res);
    if (req.method === "POST" && pathname === "/api/asr") return await handleSpeechRecognition(req, res);
    if (req.method === "POST" && pathname === "/api/guide") return await handleGuide(req, res);
    if (req.method === "POST" && pathname === "/api/handwriting") return await handleHandwriting(req, res);
    if (req.method === "GET") return serveStatic(req, res);
    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("[api] request-failed", {
      method: req.method,
      path: pathname,
      status: error.statusCode || 500,
      code: error.code || "server_error",
      model: error.model || "",
      questionId: error.questionId || "",
      message: error.message || "服务器错误"
    });
    sendJson(res, error.statusCode || 500, {
      error: error.message || "服务器错误",
      code: error.code || "server_error",
      stage: error.stage || "",
      requestId: error.requestId || 0,
      sessionId: error.sessionId || 0,
      questionId: error.questionId || "",
      model: error.model || "",
      retryable: isTransientQwenError(error)
    });
  }
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`恋恋错题本服务已启动：http://127.0.0.1:${PORT}`);
    console.log(
      `题目分割：PP-DocLayoutV2 + PaddleOCR 本地并行；低置信度页面使用 ${QWEN_VL_MODEL} 复核`
    );
    console.log(
      `Qwen 多模态 API：${QWEN_BASE_URL}；讲解引导模型：${QWEN_GUIDE_MODEL}；板书识别模型：${QWEN_HANDWRITING_MODEL}`
    );
    const ocrService = getPaddleOcrService();
    if (ocrService) {
      console.log("[segment] PaddleOCR service prewarming in background");
    }
    const layoutService = getPaddleLayoutService();
    if (layoutService) {
      console.log("[layout] PP-DocLayoutV2 service prewarming in background");
    }
  });
}

module.exports = {
  handleRequest,
  server,
  groupOcrBlocksIntoLines,
  mergeDetachedQuestionNumberLines,
  extractMainQuestionAnchors,
  recoverNumberMarkerAnchors,
  recoverSequentialExplicitQuestionAnchors,
  recoverLeadingMalformedQuestionAnchor,
  recoverDiscontinuousQuestionAnchors,
  buildOcrQuestionBands,
  normalizeQuestionRegions,
  reconcileQuestionsWithOcrAnchors,
  enforceHardQuestionBoundaries,
  validateFinalQuestionBoxes,
  validateSingleMainQuestionPerCrop,
  splitQuestionCandidatesByMainQuestionAnchors,
  splitQuestionsUntilSingleMainQuestion,
  buildLayoutContentBlocks,
  assessLocalSegmentationConfidence,
  enforceOrderedProportionConvention,
  auditGuideMath,
  guideContradictsVerifiedAnswer,
  makeAnswerLockedGuideSafe,
  answerValuesEquivalent,
  normalizeChoiceAnalysis,
  choiceAnalysesAgree,
  answerKeyResultsAgree,
  makeUnverifiedGuideSafe,
  studentAnswerMatchesVerifiedKey,
  isOnlyDirectAnswerWriting,
  applyStatementEvaluationSafety,
  applyLatestHandwritingConsistency,
  ensureConcreteSilenceGuide,
  summarizeHandwritingDiagnostics,
  buildQuestionMemory,
  questionMemoryToAnswerKey,
  deriveGuideProgress,
  normalizeGivenConditions,
  filterGuideStepsByKnownConditions,
  canonicalLinearEquation,
  equationsEquivalent,
  classifyQwenError,
  buildHandwritingProcessFeedback,
  isTransientQwenError,
  isConcreteGuideResult,
  isValidHandwritingResult,
  requestQwenChatCompletionOnce,
  raceQwenStructuredModels,
  registerQuestionMemoryIdentity,
  registerHandwritingRequest,
  isLatestHandwritingRequest,
  getSilenceGuidePolicy
};
