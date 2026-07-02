const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { execFile, spawn } = require("child_process");

const ROOT = __dirname;
loadEnvFile(path.join(ROOT, ".env"));

const PORT = Number(process.env.PORT || 4173);
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.deepseek_api_key || "";
const DEEPSEEK_BASE_URL = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
const SEGMENT_MODEL = process.env.DEEPSEEK_SEGMENT_MODEL || "deepseek-v4-flash";
const GUIDE_MODEL = process.env.DEEPSEEK_GUIDE_MODEL || "deepseek-v4-pro";
const GUIDE_FALLBACK_MODEL = process.env.DEEPSEEK_GUIDE_FALLBACK_MODEL || "deepseek-v4-flash";
const HANDWRITING_MODEL = process.env.DEEPSEEK_HANDWRITING_MODEL || "deepseek-v4-flash";
const OCR_PYTHON = process.env.OCR_PYTHON || path.join(ROOT, ".venv", "Scripts", "python.exe");
const PADDLE_OCR_SCRIPT = path.join(ROOT, "tools", "paddle_ocr.py");
const OCR_MAX_SIDE = Number(process.env.OCR_MAX_SIDE || 1800);
const OCR_CACHE_LIMIT = Number(process.env.OCR_CACHE_LIMIT || 32);
const ocrCache = new Map();
let paddleOcrService = null;
let paddleOcrRequestId = 0;

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
  "B 知识点微提示：局部错误、跳步、笔迹可疑或普通沉默 2 分钟时，只点出检查位置或矛盾点，不给修正后的完整算式。",
  "C 互动讲解：只有学生主动求助、连续 3 次答错/修正失败、错后 1 分钟无语音或无书写、或 2 分钟关怀询问后仍无法推进时才进入。",
  "C 状态下可以讲知识点和步骤，但每次只讲一个逻辑节点或一个小步骤；每步后必须让学生确认、复述或写回黑板。",
  "学生在互动讲解中插话提问时，先回答疑问，再用“我们回到刚才这一步”恢复主线。",
  "普通沉默超过 2 分钟时，第一次只关怀询问卡在哪一步；不要直接完整讲题。只有询问后继续沉默或学生确认不会，才分步讲解。",
  "学生讲得顺时，优先不说；需要回应时必须贴着学生内容做理解确认，不使用固定鼓励词。",
  "如果前端传入 lectureUnlocked=false，你只能输出 encourage 或 light 级别内容，不能输出 formula/worked_step/summary。",
  "如果前端传入 lectureUnlocked=true，你仍然不能一次性倒完整答案；只给一小步，并把话交还给学生。",
  "不要直接说“你错了”，要转成检查提醒或启发式问题。",
  "输出必须严格遵守 JSON schema；speech 用中文口语，通常不超过 60 个汉字。"
].join("\n");

const LIAN_STYLE_RULES = [
  "你是引导者，不是代答者。",
  "正常讲解时默认不说；不要用固定鼓励词刷存在感。",
  "未解锁讲解时，不能主动输出最终答案、中间完整算式或完整解题步骤。",
  "主动求助、连续 3 次答错、错后 1 分钟无输入、或关怀询问后仍沉默，才允许分步讲解。",
  "互动讲解时，每次只讲一个小步骤，并要求学生复述或写回黑板。",
  "每次提示后都要把讲解权交还给学生。",
  "回应必须贴着学生刚才的内容，先做理解确认，再给一个小追问。"
];

const COMPANION_DIALOGUE_POLICY = [
  "你不是一个不停回应的 AI。你更像坐在学生旁边陪伴学习的人。",
  "你的首要任务不是一直说话，而是判断现在是否应该说话。",
  "默认行为是 Listening：学生思考或连续表达时保持安静，shouldSpeak=false，speech 留空。",
  "不要因为识别到一句完整的话就立即回复；只有学生明显完成一段思路、停顿等待反馈、提出问题、明显卡住，或思路明显错误且继续推导会偏离时，才回应。",
  "如果 eventType=thought_complete，只表示学生停顿了 2 到 3 秒；你仍要先判断这是否真是一段完整思路。若只是半句话、过渡句、还在铺垫，shouldSpeak=false。",
  "回应时先用一句话证明你听懂了学生刚才的思路，再给一个很小的追问或检查点。",
  "不要频繁使用固定鼓励词：很好、不错、继续、真棒、非常好、很棒。不要为了回应而回应。",
  "不要泛泛评价学生本人；要针对内容反馈，例如“你是在把未知量表示出来”“你已经开始找数量关系了”。",
  "学生讲错时不要说“不对”或“你错了”，改成一起检查：例如“我们一起检查一下这里，面积通常和哪两个量有关？”",
  "每次回应尽量不超过两句话。"
].join("\n");

const HANDWRITING_PROMPT = [
  "你是初中数学黑板板书的异步辅助识别器。",
  "你会同时看到当前题目图片和学生黑板板书截图。",
  "任务是识别学生写下的关键公式、数字、等式、结论，并结合题目条件进行一次数学核算。",
  "先读题目条件和学生板书，再计算或验算学生写出的关系式、推导和结论是否成立；不要只做 OCR 转写。",
  "你会看到多个 OCR 来源：题目图片、纯板书截图、包含题目区域的板书截图。它们互相补充，若纯板书 OCR 漏字，可参考合成截图；若合成截图混入题目印刷内容，以纯板书和题意为准。",
  "例如板书写出 2/3 = x/6 且结论 x=4 时，需要实际验算比例关系是否能推出这个结果。",
  "如果板书写出 2/3 = x/6 但最后结论写成 x=-2，必须判为 calculationStatus=\"wrong\"，因为由 2/3 = x/6 应推出 x=4。",
  "如果能看出学生写了等式、比例式或 x/y 的结论，就要尽量判断 correct 或 wrong；只有关键数字/符号确实看不出时，才返回 unclear。",
  "必须优先以“纯板书 OCR 结果”判断学生写了什么；题目图片和包含题目区域的截图只用于理解题目，不能把题目原图里的答案、红叉、批改痕迹或印刷文字当成学生板书。",
  "判断 correct 必须同时满足：学生写出的关键关系式成立，且学生最后写出的结论/答案也与关系式和题意一致。只要最后结论错，就必须 hasPossibleIssue=true。",
  "不要做逐笔批改，不要因为字迹潦草就判错；只在数学关系、关键数字、符号或结论明显不合理时标记 hasPossibleIssue=true。",
  "如果核算正确，calculationStatus=\"correct\"，hasPossibleIssue=false，并在 positiveFeedback 写一句贴着内容的短鼓励，避免固定说“很好/很棒”。",
  "如果核算错误，calculationStatus=\"wrong\"，hasPossibleIssue=true，guidance 要转成恋恋可以说出口的温和检查提醒，不要直接说“你错了”。",
  "如果学生只是还没写完、只写出一部分比例/方程、缺少后续项，不能判为错误：hasPossibleIssue=false，guidance 置空或只说明继续观察。",
  "如果看不清或无法核算，calculationStatus=\"unclear\"；如果与题目无关，calculationStatus=\"not_relevant\"。",
  "guidance 应指出需要检查的位置或关系，并给一个很小的下一步，例如“圆周角/圆心角”“360 度乘几分之几”“等号后面的数”。",
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
      }
    },
    required: ["shouldSpeak", "speech", "guideState", "knowledgePoints", "hintLevel", "formulaOrStep", "askStudentToRepeat", "studentAction"]
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
        description: "Main formula, relation, or conclusion inferred from the board."
      },
      isRelevant: {
        type: "boolean",
        description: "Whether the handwriting appears related to the current problem."
      },
      calculationStatus: {
        type: "string",
        enum: ["not_relevant", "incomplete", "unclear", "correct", "wrong"],
        description: "Result of checking the student's visible math against the problem."
      },
      calculationCheck: {
        type: "string",
        description: "Short private explanation of the verification or calculation performed."
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
      expectedNextStep: {
        type: "string",
        description: "A small next step or relation the student should check."
      },
      guidance: {
        type: "string",
        description: "Warm Chinese guidance Lian can speak. Avoid saying the student is wrong directly."
      },
      positiveFeedback: {
        type: "string",
        description: "Short Chinese feedback Lian can speak when calculationStatus is correct. Keep empty otherwise."
      },
      confidence: {
        type: "number",
        description: "0 to 1 confidence in this analysis."
      }
    },
    required: [
      "detectedWriting",
      "mathExpression",
      "isRelevant",
      "calculationStatus",
      "calculationCheck",
      "hasPossibleIssue",
      "issueType",
      "issueSummary",
      "expectedNextStep",
      "guidance",
      "positiveFeedback",
      "confidence"
    ]
  }
};

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
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readJsonBody(req, limit = 24 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("请求体过大，请换更小或更清晰的图片"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("请求格式不是有效 JSON"));
      }
    });
    req.on("error", reject);
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

function getOcrCacheKey(image) {
  return crypto
    .createHash("sha256")
    .update(image.buffer)
    .update(`|maxSide:${OCR_MAX_SIDE}|ocr:v2`)
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
    exited: false
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

function requestPaddleOcr(imagePath) {
  const service = getPaddleOcrService();
  if (!service) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const id = ++paddleOcrRequestId;
    const timer = setTimeout(() => {
      service.pending.delete(id);
      reject(new Error("PaddleOCR service timed out"));
    }, 180000);

    service.pending.set(id, { resolve, reject, timer });
    const payload = JSON.stringify({ id, imagePath, maxSide: OCR_MAX_SIDE }) + "\n";
    service.child.stdin.write(payload, "utf8", (error) => {
      if (!error) return;
      clearTimeout(timer);
      service.pending.delete(id);
      reject(error);
    });
  });
}

async function extractPaddleTextBlocks(imagePath) {
  const data = await requestPaddleOcr(imagePath);
  if (!data) return { blocks: [], skipped: true };
  return {
    blocks: normalizeOcrBlocks(data.blocks),
    resized: Boolean(data.resized),
    originalSize: data.originalSize,
    ocrSize: data.ocrSize,
    elapsedMs: data.elapsedMs
  };
}

async function extractTextBlocks(imageDataUrl) {
  const image = decodeDataImage(imageDataUrl);
  if (!image) return [];
  const cacheKey = getOcrCacheKey(image);
  const cachedBlocks = getCachedOcrBlocks(cacheKey);
  if (cachedBlocks) {
    console.log(`[segment] OCR cache hit: ${cachedBlocks.length} blocks`);
    return cachedBlocks;
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lian-ocr-"));
  const imagePath = path.join(tempDir, `source${image.ext}`);
  fs.writeFileSync(imagePath, image.buffer);
  let paddleBlocks = null;

  try {
    const paddleResult = await extractPaddleTextBlocks(imagePath);
    paddleBlocks = paddleResult.blocks;
    if (paddleBlocks.length) {
      const resizeNote = paddleResult.resized ? `, resized to ${paddleResult.ocrSize?.width}x${paddleResult.ocrSize?.height}` : "";
      console.log(`[segment] PaddleOCR block count: ${paddleBlocks.length}${resizeNote}, elapsed=${paddleResult.elapsedMs || 0}ms`);
      setCachedOcrBlocks(cacheKey, paddleBlocks);
      return cloneOcrBlocks(paddleBlocks);
    }
  } catch (error) {
    console.warn("[segment] PaddleOCR failed, trying Tesseract fallback:", error.message || error);
  }

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

function extractDeepSeekText(data) {
  return String(data?.choices?.[0]?.message?.content || "").trim();
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

async function callDeepSeekJson({ model, content, schema, instructions, maxOutputTokens = 1800 }) {
  if (!DEEPSEEK_API_KEY) {
    const error = new Error("DEEPSEEK_API_KEY 未配置");
    error.statusCode = 503;
    error.code = "missing_api_key";
    throw error;
  }

  const userText = await buildDeepSeekUserText(content);
  const schemaText = JSON.stringify(schema.schema, null, 2);

  let response;
  try {
    response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
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
  } catch {
    const error = new Error("DeepSeek API 网络连接失败");
    error.statusCode = 502;
    error.code = "network_error";
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || `DeepSeek API 请求失败：${response.status}`);
    error.statusCode = response.status;
    error.code = data.error?.code || data.error?.type || "deepseek_error";
    throw error;
  }

  const parsed = parseModelJson(extractDeepSeekText(data));
  if (!parsed) {
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
  for (const group of Array.isArray(groups) ? groups : []) {
    const indexes = normalizeBlockIndexes(group.blockIndexes, blocks.length);
    if (!indexes.length) continue;

    const selectedBlocks = indexes.map((index) => blocks[index]).filter(Boolean);
    if (!selectedBlocks.length) continue;

    const left = Math.min(...selectedBlocks.map((block) => block.x));
    const top = Math.min(...selectedBlocks.map((block) => block.y));
    const right = Math.max(...selectedBlocks.map((block) => block.x + block.w));
    const bottom = Math.max(...selectedBlocks.map((block) => block.y + block.h));
    const x = Math.max(0, Math.floor(left - 20));
    const y = Math.max(0, Math.floor(top - 20));
    const paddedRight = Math.min(width, Math.ceil(right + 30));
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

  return questions.sort((a, b) => a.y - b.y || a.x - b.x);
}

async function handleSegment(req, res) {
  const body = await readJsonBody(req);
  if (!body.image || !body.width || !body.height) {
    sendJson(res, 400, { error: "缺少 image、width 或 height" });
    return;
  }

  const width = Number(body.width);
  const height = Number(body.height);
  const textBlocks = await extractTextBlocks(body.image);
  console.log(`[segment] OCR block count: ${textBlocks.length}`);

  if (!textBlocks.length) {
    const questions = [buildWholePageQuestion(width, height, "OCR 未识别到文字块，返回整页题块")];
    console.log("[segment] LLM grouping skipped: no OCR blocks");
    console.log(`[segment] final box count: ${questions.length}`);
    sendJson(res, 200, {
      questions,
      fallbackToWholePage: true,
      note: "OCR 未识别到文字块；TODO: 接入 PaddleOCR 或其他 OCR 服务后可细分题目。",
      model: SEGMENT_MODEL,
      ocrBlockCount: 0
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
      maxOutputTokens: 3000
    });
  } catch (error) {
    console.warn("[segment] LLM grouping failed, fallback to whole page:", error.message || error);
  }

  console.log(`[segment] LLM grouping result: ${JSON.stringify(grouping.questions || []).slice(0, 1200)}`);
  let questions = buildQuestionBoxesFromGroups(grouping.questions, textBlocks, width, height);
  if (!questions.length) {
    questions = [buildWholePageQuestion(width, height, "LLM 未返回有效题目分组，返回整页题块")];
  }
  console.log(`[segment] final box count: ${questions.length}`);

  sendJson(res, 200, {
    questions,
    fallbackToWholePage: questions.length === 1 && questions[0].x === 0 && questions[0].y === 0 && questions[0].w === width && questions[0].h === height,
    note: grouping.note || "OCR blocks grouped by LLM; boxes generated by server.",
    model: SEGMENT_MODEL,
    ocrBlockCount: textBlocks.length
  });
}

async function handleGuide(req, res) {
  const body = await readJsonBody(req);
  if (!body.questionImage) {
    sendJson(res, 400, { error: "缺少 questionImage" });
    return;
  }

  const eventText = {
    active_help: "学生主动求助、提问或明确表示不会。",
    stuck: "学生明确表示不会、没思路或卡住。",
    silence: "学生讲解过程中普通沉默超过 2 分钟，当前只适合关怀询问。",
    silence_followup: "2 分钟关怀询问后，学生仍沉默或无法推进，可以进入互动讲解。",
    error_silence: "局部错误或笔迹可疑后，学生 1 分钟没有新的语音或书写，可以进入互动讲解。",
    repeat_wrong: "学生连续答错或修正失败达到 3 次，可以进入互动讲解。",
    next_step: "学生在互动讲解中要求听下一小步。",
    jump: "学生可能直接跳到结果，缺少列式或理由。",
    check: "学生提到算错、符号、单位或需要检查。",
    thought_complete: "学生停顿了 2 到 3 秒，可能完成了一段思路；请先判断是否真的需要回应。",
    normal: "学生正在正常讲解。"
  }[body.eventType || "normal"] || "学生正在讲题。";

  const guideState = body.guideState || "heuristic_guidance";
  const lectureUnlocked = Boolean(body.lectureUnlocked);

  const guideCall = await callDeepSeekJsonWithFallback({
    model: GUIDE_MODEL,
    schema: guideSchema,
    instructions: [LIAN_GUIDE_PROMPT, COMPANION_DIALOGUE_POLICY].join("\n\n"),
    content: [
      {
        type: "input_text",
        text: JSON.stringify({
          event: eventText,
          eventType: body.eventType || "normal",
          currentGuideState: guideState,
          lectureUnlocked,
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
          transcript: body.transcript || "",
          latestStudentSpeech: body.latestStudentSpeech || "",
          knownProblemText: body.problemText || "",
          knownKnowledgePoints: body.knowledgePoints || [],
          boundaryRules: [
            "lectureUnlocked=false 时只能启发引导或微提示，hintLevel 只能为 encourage/light。",
            "lectureUnlocked=false 时 speech 不得包含最终答案、中间完整算式或完整解题步骤。",
            "lectureUnlocked=true 时只讲一个小步骤，不得一次性讲完整题。",
            "每次互动讲解后 studentAction 必须要求学生复述、继续说或写回黑板。",
            "如果只是普通 2 分钟沉默且 awaitingSilenceFollowup=false，只做关怀询问，不给公式。",
            "如果 eventType=thought_complete 且学生只是半句话、过渡句或仍在铺垫，shouldSpeak=false。",
            "禁止使用固定鼓励词：很好、不错、继续、真棒、非常好、很棒。"
          ],
          styleRules: LIAN_STYLE_RULES
        })
      },
      { type: "input_image", image_url: body.questionImage, detail: "high" },
      ...(body.boardImage ? [{ type: "input_image", image_url: body.boardImage, detail: "high" }] : [])
    ],
    maxOutputTokens: 1200
  }, GUIDE_FALLBACK_MODEL);

  sendJson(res, 200, {
    ...guideCall.result,
    model: guideCall.model,
    fallbackFrom: guideCall.fallbackFrom || ""
  });
}

async function handleHandwriting(req, res) {
  const body = await readJsonBody(req);
  if (!body.questionImage || !(body.boardOnlyImage || body.boardImage)) {
    sendJson(res, 400, { error: "缺少 questionImage 或 boardOnlyImage" });
    return;
  }

  const boardForOcr = body.boardOnlyImage || body.boardImage;

  const result = await callDeepSeekJson({
    model: HANDWRITING_MODEL,
    schema: handwritingSchema,
    instructions: HANDWRITING_PROMPT,
    content: [
      {
        type: "input_text",
        text: JSON.stringify({
          trigger: body.reason || "停笔后异步识别",
          transcript: body.transcript || "",
          knownProblemText: body.problemText || "",
          knownKnowledgePoints: body.knowledgePoints || [],
          instruction:
            "请同时参考题目图片 OCR、纯板书 OCR、包含题目区域的板书截图 OCR。纯板书 OCR 用来判断学生真正写了什么；题目图片和包含题目区域的截图用于理解题意、确认题目条件和板书所在位置。不要把题目原图里的印刷答案、红叉、批改痕迹当成学生板书。然后根据题目条件实际计算/验算。若关键公式和最后结论都正确，返回 calculationStatus=correct；若公式对但最后结论算错，也必须返回 calculationStatus=wrong；若明显不符合题意，给温和检查提醒；若只是字迹不清或还没写完，不要轻易判错。"
        })
      },
      { type: "input_image", label: "题目图片", image_url: body.questionImage, detail: "high", blockLimit: 80 },
      { type: "input_image", label: "纯板书截图", image_url: boardForOcr, detail: "high", blockLimit: 80 },
      ...(body.boardImage ? [{ type: "input_image", label: "包含题目区域的板书截图", image_url: body.boardImage, detail: "high", blockLimit: 120 }] : [])
    ],
    maxOutputTokens: 1000
  });

  sendJson(res, 200, { ...result, model: HANDWRITING_MODEL });
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
    res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://localhost:${PORT}`).pathname;
  try {
    if (req.method === "POST" && pathname === "/api/segment") return await handleSegment(req, res);
    if (req.method === "POST" && pathname === "/api/guide") return await handleGuide(req, res);
    if (req.method === "POST" && pathname === "/api/handwriting") return await handleHandwriting(req, res);
    if (req.method === "GET") return serveStatic(req, res);
    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      error: error.message || "服务器错误",
      code: error.code || "server_error"
    });
  }
});

server.listen(PORT, () => {
  console.log(`恋恋错题本服务已启动：http://127.0.0.1:${PORT}`);
  console.log(
    `DeepSeek API：${DEEPSEEK_BASE_URL}；题目分割模型：${SEGMENT_MODEL}；讲解引导模型：${GUIDE_MODEL}；讲解兜底模型：${GUIDE_FALLBACK_MODEL}；板书识别模型：${HANDWRITING_MODEL}`
  );
});
