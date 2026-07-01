const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
loadEnvFile(path.join(ROOT, ".env"));

const PORT = Number(process.env.PORT || 4173);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const SEGMENT_MODEL = process.env.SEGMENT_MODEL || "gpt-5.4-mini";
const GUIDE_MODEL = process.env.GUIDE_MODEL || "gpt-5.5";
const GUIDE_FALLBACK_MODEL = process.env.GUIDE_FALLBACK_MODEL || "gpt-5.4-mini";
const HANDWRITING_MODEL = process.env.HANDWRITING_MODEL || "gpt-5.4-mini";

const SEGMENTER_PROMPT =
  [
    "你是一名试卷版面分析助手。你的任务不是直接裁剪图片，而是先识别题目结构，再确定裁剪边界。只返回 JSON，坐标必须使用原图像素坐标。",
    "必须严格按两个阶段执行：第一阶段先完整阅读整张试卷，识别所有题目的边界；第二阶段再根据已确认的边界为每一道题返回一个题块。",
    "第一阶段重点识别：每道题的题号、题干范围、图片/图形/表格属于哪一道题、选项/答题区域属于哪一道题、子问题（①②③、（1）（2））是否属于同一道题。",
    "第一阶段不要裁剪，不要根据局部 OCR 文本框或图片边界直接定框；必须先得到题目1开始位置到结束位置、题目2开始位置到结束位置，直到题目N。",
    "固定处理顺序：Step 1 阅读整页试卷；Step 2 识别所有题号；Step 3 确定每道题开始和结束位置；Step 4 确认图片、题干、选项分别属于哪一道题；Step 5 检查跨区域或跨栏题目；Step 6 完成所有题目边界确认；Step 7 最后再返回裁剪框。",
    "每个题块必须包含该题全部内容：题号、完整题干、图片/图形/表格、选项、答题区域、属于同一道题的子问题。",
    "坐标规则非常重要：每道题必须返回自己独立的矩形边界；不同题目的 x,y,w,h 不得相同，不得都返回整页；除跨栏同题外，不同题块不应大面积重叠。",
    "纵向排列的题目中，上一题的 bottom 必须在下一题题号开始位置之前或附近结束；下一题的内容不得进入上一题框。",
    "横向双栏或多栏试卷中，先判断栏结构，再确定每道题属于哪一栏；同一栏内按从上到下切分，不同栏题目不得合并。",
    "完整性优先于裁剪紧凑度。边界不确定时宁可多保留少量留白，但不允许截断题目，不允许拆分一道题，不允许将下一题内容裁入当前题，也不允许将当前题内容裁入下一题。",
    "禁止行为：图片和题干分离；图片属于上一题而题干属于下一题；选项被拆开；子问题被拆开；一道题拆成多个题块；多道题合并成一个题块；根据 OCR 文本框或局部图片边界直接裁剪。",
    "如果看到 1.、2.、3.、4.、第5题、第6题等主题号，通常每个主题号对应一个独立 question；只有（1）（2）或①②③明显属于同一主题时才合并。",
    "problemText 必须概括这一道题的实际题干内容，problemType 和 mainKnowledgePoint 必须来自数学内容，禁止写“题目边界分割”“图像识别”“OCR”等任务名。",
    "mainKnowledgePoint/knowledgePoints 只能给 1 个最主要知识点，不要列多个，不要用顿号或逗号串联。",
    "如果无法在整页层面确认所有题目边界，请返回 questions=[]，并在 note 中说明需要手动框选；不要用整页大框冒充单题结果。"
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
  "学生讲得顺时，优先不说；需要回应时只说“很好”“很棒”“继续”这类极短鼓励。",
  "如果前端传入 lectureUnlocked=false，你只能输出 encourage 或 light 级别内容，不能输出 formula/worked_step/summary。",
  "如果前端传入 lectureUnlocked=true，你仍然不能一次性倒完整答案；只给一小步，并把话交还给学生。",
  "不要直接说“你错了”，要转成检查提醒或启发式问题。",
  "输出必须严格遵守 JSON schema；speech 用中文口语，通常不超过 60 个汉字。"
].join("\n");

const LIAN_STYLE_RULES = [
  "你是引导者，不是代答者。",
  "正常讲解时尽量不说；需要鼓励时只给 2 到 6 个字。",
  "未解锁讲解时，不能主动输出最终答案、中间完整算式或完整解题步骤。",
  "主动求助、连续 3 次答错、错后 1 分钟无输入、或关怀询问后仍沉默，才允许分步讲解。",
  "互动讲解时，每次只讲一个小步骤，并要求学生复述或写回黑板。",
  "每次提示后都要把讲解权交还给学生。"
];

const HANDWRITING_PROMPT = [
  "你是初中数学黑板板书的异步辅助识别器。",
  "你会同时看到当前题目图片和学生黑板板书截图。",
  "任务是识别学生写下的关键公式、数字、等式、结论，并判断它与题目条件是否基本合理。",
  "不要做逐笔批改，不要因为字迹潦草就判错；只在数学关系、关键数字、符号或结论明显不合理时标记 hasPossibleIssue=true。",
  "如果发现问题，guidance 要转成恋恋可以说出口的温和检查提醒，不要直接说“你错了”。",
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

const segmentSchema = {
  name: "question_segmentation",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      questions: {
        type: "array",
        description: "Detected independent math question regions in original image pixel coordinates.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            x: { type: "number", description: "Left pixel of the question box." },
            y: { type: "number", description: "Top pixel of the question box." },
            w: { type: "number", description: "Width of the question box." },
            h: { type: "number", description: "Height of the question box." },
            questionNumber: { type: "string", description: "Visible question number or label, such as 1, 2, 第5题. Empty if unclear." },
            confidence: { type: "number", description: "0 to 1 detection confidence." },
            problemText: { type: "string", description: "Brief OCR-style summary of the problem." },
            problemType: { type: "string", description: "Math problem type, such as equation, geometry, ratio." },
            mainKnowledgePoint: {
              type: "string",
              description: "The single most important math knowledge point for this exact question. Never use task names like segmentation or OCR."
            },
            knowledgePoints: {
              type: "array",
              description: "Exactly one main knowledge point for this single question. Do not include multiple points.",
              items: { type: "string" }
            }
          },
          required: ["x", "y", "w", "h", "questionNumber", "confidence", "problemText", "problemType", "mainKnowledgePoint", "knowledgePoints"]
        }
      },
      fallbackToWholePage: {
        type: "boolean",
        description: "True when reliable segmentation is not possible and the whole page should be used."
      },
      note: { type: "string", description: "Short diagnostic note for the UI or logs." }
    },
    required: ["questions", "fallbackToWholePage", "note"]
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
      confidence: {
        type: "number",
        description: "0 to 1 confidence in this analysis."
      }
    },
    required: [
      "detectedWriting",
      "mathExpression",
      "isRelevant",
      "hasPossibleIssue",
      "issueType",
      "issueSummary",
      "expectedNextStep",
      "guidance",
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

function extractResponseText(data) {
  if (data.output_text) return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if ((content.type === "output_text" || content.type === "text") && content.text) {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n");
}

async function callOpenAIJson({ model, content, schema, instructions, maxOutputTokens = 1800 }) {
  if (!OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY 未配置");
    error.statusCode = 503;
    throw error;
  }

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        instructions,
        input: [{ role: "user", content }],
        max_output_tokens: maxOutputTokens,
        text: {
          format: {
            type: "json_schema",
            name: schema.name,
            strict: schema.strict,
            schema: schema.schema
          }
        }
      })
    });
  } catch {
    const error = new Error("OpenAI API 网络连接失败");
    error.statusCode = 502;
    error.code = "network_error";
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || `OpenAI API 请求失败：${response.status}`);
    error.statusCode = response.status;
    error.code = data.error?.code || data.error?.type || "openai_error";
    throw error;
  }

  const text = extractResponseText(data);
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error("模型没有返回可解析的结构化结果");
    error.statusCode = 502;
    error.code = "invalid_model_output";
    throw error;
  }
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

async function callOpenAIJsonWithFallback(options, fallbackModel) {
  try {
    return {
      result: await callOpenAIJson(options),
      model: options.model
    };
  } catch (error) {
    if (!fallbackModel || fallbackModel === options.model || !shouldUseFallbackModel(error)) throw error;
    return {
      result: await callOpenAIJson({ ...options, model: fallbackModel }),
      model: fallbackModel,
      fallbackFrom: options.model
    };
  }
}

async function handleSegment(req, res) {
  const body = await readJsonBody(req);
  if (!body.image || !body.width || !body.height) {
    sendJson(res, 400, { error: "缺少 image、width 或 height" });
    return;
  }

  const strictRetryText =
    body.mode === "strict_structure"
      ? "上一轮结果疑似将多道题合并，或把题目结构误当成图像/OCR任务。本轮必须重新阅读整页，先确认所有主题号和题目边界，再统一返回单题边界。"
      : "";

  const result = await callOpenAIJson({
    model: SEGMENT_MODEL,
    schema: segmentSchema,
    instructions: SEGMENTER_PROMPT,
    content: [
      {
        type: "input_text",
        text:
          strictRetryText +
          `原图尺寸：${body.width}x${body.height}。请先完成整页试卷版面分析，识别所有主题号和所有题目开始/结束位置，确认图形、选项、答题区域和子问题归属后，再统一返回每道题的 x,y,w,h、题号、置信度、题型、题干摘要和 1 个最主要知识点。` +
          "如果返回多道题，它们的坐标必须是互不相同的单题边界，禁止每道题都返回整页坐标。纵向相邻题目必须用题号开始位置切开，上一题不能包含下一题。若无法可靠确认所有题目边界，请返回 questions=[] 并提示手动框选。"
      },
      { type: "input_image", image_url: body.image, detail: "high" }
    ]
  });

  sendJson(res, 200, { ...result, model: SEGMENT_MODEL });
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
    normal: "学生正在正常讲解。"
  }[body.eventType || "normal"];

  const guideState = body.guideState || "heuristic_guidance";
  const lectureUnlocked = Boolean(body.lectureUnlocked);

  const guideCall = await callOpenAIJsonWithFallback({
    model: GUIDE_MODEL,
    schema: guideSchema,
    instructions: LIAN_GUIDE_PROMPT,
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
          transcript: body.transcript || "",
          latestStudentSpeech: body.latestStudentSpeech || "",
          knownProblemText: body.problemText || "",
          knownKnowledgePoints: body.knowledgePoints || [],
          boundaryRules: [
            "lectureUnlocked=false 时只能启发引导或微提示，hintLevel 只能为 encourage/light。",
            "lectureUnlocked=false 时 speech 不得包含最终答案、中间完整算式或完整解题步骤。",
            "lectureUnlocked=true 时只讲一个小步骤，不得一次性讲完整题。",
            "每次互动讲解后 studentAction 必须要求学生复述、继续说或写回黑板。",
            "如果只是普通 2 分钟沉默且 awaitingSilenceFollowup=false，只做关怀询问，不给公式。"
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
  if (!body.questionImage || !body.boardImage) {
    sendJson(res, 400, { error: "缺少 questionImage 或 boardImage" });
    return;
  }

  const result = await callOpenAIJson({
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
            "请比较题目图片和学生板书截图。若板书中关键公式、运算或结论明显不符合题意，给出温和检查提醒；若只是字迹不清或还没写完，不要轻易判错。"
        })
      },
      { type: "input_image", image_url: body.questionImage, detail: "high" },
      { type: "input_image", image_url: body.boardImage, detail: "high" }
    ],
    maxOutputTokens: 1200
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
    `题目分割模型：${SEGMENT_MODEL}；讲解引导模型：${GUIDE_MODEL}；讲解兜底模型：${GUIDE_FALLBACK_MODEL}；板书识别模型：${HANDWRITING_MODEL}`
  );
});
