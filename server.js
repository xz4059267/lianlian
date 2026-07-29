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
  "qwen3.5-omni-plus";
const QWEN_GUIDE_MODEL = process.env.QWEN_GUIDE_MODEL || QWEN_VL_MODEL;
const QWEN_HANDWRITING_MODEL = process.env.QWEN_HANDWRITING_MODEL || QWEN_VL_MODEL;
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
  "如果前端传入 lectureUnlocked=true，你仍然不能一次性倒完整答案；只给一小步，并把话交还给学生。",
  "不要直接说“你错了”，要转成检查提醒或启发式问题。",
  "必须以当前传入的题目图片和当前黑板截图为准；不要沿用上一道题的变量、答案、比例式或知识点。",
  "如果当前题目图片和黑板里没有出现 x、y、比例式等内容，不要主动提这些符号或关系。",
  "输出必须严格遵守 JSON schema；speech 用中文口语。普通讲解停顿只说一句且不超过 45 个汉字；主动求助或分步讲解最多两句且不超过 75 个汉字。"
].join("\n");

const ORDERED_PROPORTION_RULES = [
  "比例题必须遵守给定顺序：题目说‘a、b、c、d 成比例’时，标准含义是 a:b=c:d，也就是第一项比第二项等于第三项比第四项。",
  "除非题目明确要求重新排列，否则禁止交换四个比例项，禁止声称‘没有规定顺序’，也禁止为了得到另一个结果而改成 a:b=d:c。",
  "例如‘2、3、x、6 成比例’必须写成 2:3=x:6，交叉相乘得到 x=4；学生得到 4 时应判定正确，不能再引导其尝试 2:3=6:x。",
  "判断学生比例式或答案前必须先按上述顺序实际代入验算。"
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
  "你是初中数学黑板板书的异步辅助识别器。",
  "你会同时看到当前题目图片和学生黑板板书截图。",
  "任务是识别学生写下的关键公式、数字、等式、结论，并结合题目条件进行一次数学核算。",
  "先读题目条件和学生板书，再计算或验算学生写出的关系式、推导和结论是否成立；不要只做文字转写。",
  "你会看到多个图片来源：题目图片、纯板书截图、包含题目区域的板书截图。它们互相补充，若纯板书截图有字迹遮挡，可参考合成截图；若合成截图混入题目印刷内容，以纯板书和题意为准。",
  "例如板书写出 2/3 = x/6 且结论 x=4 时，需要实际验算比例关系是否能推出这个结果。",
  "如果板书写出 2/3 = x/6 但最后结论写成 x=-2，必须判为 calculationStatus=\"wrong\"，因为由 2/3 = x/6 应推出 x=4。",
  "如果能看出学生写了等式、比例式或 x/y 的结论，就要尽量判断 correct 或 wrong；只有关键数字/符号确实看不出时，才返回 unclear。",
  "必须优先以纯板书截图判断学生写了什么；题目图片和包含题目区域的截图只用于理解题目，不能把题目原图里的答案、红叉、批改痕迹或印刷文字当成学生板书。",
  "判断 correct 必须同时满足：学生写出的关键关系式成立，且学生最后写出的结论/答案也与关系式和题意一致。只要最后结论错，就必须 hasPossibleIssue=true。",
  "不要做逐笔批改，不要因为字迹潦草就判错；只在数学关系、关键数字、符号或结论明显不合理时标记 hasPossibleIssue=true。",
  "如果核算正确，calculationStatus=\"correct\"，hasPossibleIssue=false，并在 positiveFeedback 写一句贴着内容的短鼓励，避免固定说“很好/很棒”。",
  "如果核算错误，calculationStatus=\"wrong\"，hasPossibleIssue=true，guidance 要转成恋恋可以说出口的温和检查提醒，不要直接说“你错了”。",
  "如果学生只是还没写完、只写出一部分比例/方程、缺少后续项，不能判为错误：hasPossibleIssue=false，guidance 置空或只说明继续观察。",
  "额外判断板书是否留下了至少一个可核验的正确关键步骤。boardComplete=true 只需满足：板书与本题相关，存在一个数学上成立的关系式、公式、代入、计算步骤或推理依据，并且没有尚未修正的明显数学错误。",
  "不要求板书写完整推导，不要求写最终答案、单位或覆盖全部小问；学生可以在口头讲解中给出最终答案。比如正确写出 2:3=x:6，即使没有继续写 3x=12 和 x=4，boardComplete 也应为 true。",
  "只有孤立的最终答案、与题目无关的字迹、无法辨认的涂写或明显错误步骤不算正确关键步骤；此时 boardComplete=false，并在 missingBoardContent 中简短说明需要补写或修正哪一个关键步骤。",
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
      "isRelevant",
      "calculationStatus",
      "calculationCheck",
      "hasPossibleIssue",
      "issueType",
      "issueSummary",
      "expectedNextStep",
      "guidance",
      "positiveFeedback",
      "boardComplete",
      "missingBoardContent",
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

function buildAliyunRpcSignedUrl(endpoint, params, accessKeySecret) {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  const canonicalizedQuery = Object.keys(filteredParams)
    .sort()
    .map((key) => `${aliyunPercentEncode(key)}=${aliyunPercentEncode(filteredParams[key])}`)
    .join("&");
  const stringToSign = `POST&${aliyunPercentEncode("/")}&${aliyunPercentEncode(canonicalizedQuery)}`;
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
  if (ALIYUN_OCR_ACCESS_KEY_ID && ALIYUN_OCR_ACCESS_KEY_SECRET) {
    try {
      const officialResult = await extractAliyunOfficialPaperCutResult(imageDataUrl, options);
      if (officialResult && (officialResult.questions?.length || officialResult.blocks?.length)) {
        return officialResult;
      }
    } catch (error) {
      if (SEGMENT_ALIYUN_ONLY) throw error;
      console.warn("[segment] Aliyun official edu paper-cut failed, trying AppCode fallback:", error.message || error);
    }
  }
  if (!ALIYUN_OCR_APPCODE) return { blocks: [], questions: [] };
  const image = decodeDataImage(imageDataUrl);
  if (!image) return { blocks: [], questions: [] };

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
      `[segment] Aliyun paper-cut OCR block count: ${blocks.length}, question count=${questions.length}, elapsed=${Date.now() - startedAt}ms`
    );
    return { blocks, questions };
  } catch (error) {
    if (ALIYUN_OCR_TEXT_FALLBACK_URL && ALIYUN_OCR_TEXT_FALLBACK_URL !== ALIYUN_OCR_URL) {
      console.warn("[segment] Aliyun paper-cut failed, trying text OCR fallback:", error.message || error);
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
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
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
    .update(`|${width}x${height}|mode:${mode || "initial"}|fast:${SEGMENT_FAST_MODE}|ocr:${OCR_MAX_SIDE}|ocrFast:${OCR_FAST_MAX_SIDE}|aliyunPaperCutFirst:${ALIYUN_OCR_ENABLED}|official:${Boolean(ALIYUN_OCR_ACCESS_KEY_ID && ALIYUN_OCR_ACCESS_KEY_SECRET)}|aliyunOnly:${SEGMENT_ALIYUN_ONLY}|segment:v50`)
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

async function requestQwenChatCompletion(payload, useJsonFormat = true) {
  let response;
  try {
    response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${QWEN_API_KEY}`
      },
      body: JSON.stringify({
        ...payload,
        ...(useJsonFormat ? { response_format: { type: "json_object" } } : {})
      })
    });
  } catch (fetchError) {
    const causeCode = fetchError?.cause?.code || fetchError?.code || "";
    const error = new Error("Qwen 多模态 API 网络连接失败");
    error.statusCode = 502;
    error.code = "network_error";
    error.causeCode = causeCode;
    console.warn(`[qwen] network failed code=${causeCode || "unknown"} message=${fetchError?.message || ""}`);
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const rawMessage = data.error?.message || `Qwen 多模态 API 请求失败：${response.status}`;
    const rawCode = data.error?.code || data.error?.type || "qwen_error";
    const friendlyMessage =
      rawCode === "access_denied"
        ? "Qwen API 访问被拒绝，请确认 .env 里的 Qwen_api_key 是阿里云百炼 API Key，并已开通对应多模态模型权限。"
        : rawCode === "invalid_api_key" || /api key|authentication|认证|鉴权/i.test(rawMessage)
          ? "Qwen API key 无法通过认证，请检查 .env 里的 Qwen_api_key、QWEN_API_KEY 或 DASHSCOPE_API_KEY。"
          : rawMessage;
    const error = new Error(friendlyMessage);
    error.statusCode = response.status;
    error.code = rawCode;
    throw error;
  }
  return data;
}

async function callQwenMultimodalJson({ model, content, schema, instructions, maxOutputTokens = 1200 }) {
  if (!QWEN_API_KEY) {
    const error = new Error("Qwen API key 未配置");
    error.statusCode = 503;
    error.code = "missing_qwen_api_key";
    throw error;
  }

  const schemaText = JSON.stringify(schema.schema, null, 2);
  const payload = {
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
      {
        role: "user",
        content: buildQwenContent(content)
      }
    ],
    max_tokens: maxOutputTokens,
    stream: false
  };

  let data;
  try {
    data = await requestQwenChatCompletion(payload, true);
  } catch (error) {
    if (!isQwenJsonFormatUnsupported(error)) throw error;
    data = await requestQwenChatCompletion(payload, false);
  }

  const parsed = parseModelJson(extractDeepSeekText(data));
  if (!parsed) {
    const error = new Error("Qwen 多模态模型没有返回可解析的结构化结果");
    error.statusCode = 502;
    error.code = "invalid_model_output";
    throw error;
  }
  return parsed;
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

  const result = await callQwenMultimodalJson({
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

const finalAnswerSchema = {
  name: "final_answer_check",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      correct: {
        type: "boolean",
        description: "Whether the student's final answer matches the current problem."
      },
      finalAnswer: { type: "string", description: "The answer understood from the student." },
      feedback: { type: "string", description: "Short warm feedback when the answer is correct." },
      hint: { type: "string", description: "A gentle checking hint when the answer is wrong or unclear." },
      confidence: { type: "number", description: "Confidence from 0 to 1." }
    },
    required: ["correct", "finalAnswer", "feedback", "hint", "confidence"]
  }
};

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
  "lianSummary 要写出本题的关键条件、解法抓手和最后结果，1 到 2 句即可。",
  "mistakePoints 必须是本题专属，2 到 4 条，每条指出具体位置或具体关系，例如“原来把 2:3:x:6 的对应顺序看反”“题图中被叉掉的 35°说明圆心角没有按 360×1/8 算”等。",
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
      canonicalAnswer: { type: "string" },
      acceptedAnswers: { type: "array", items: { type: "string" } },
      solutionOutline: { type: "array", items: { type: "string" } },
      verificationChecks: { type: "array", items: { type: "string" } },
      confidence: { type: "number" },
      uncertainty: { type: "string" }
    },
    required: [
      "status",
      "problemText",
      "questionType",
      "canonicalAnswer",
      "acceptedAnswers",
      "solutionOutline",
      "verificationChecks",
      "confidence",
      "uncertainty"
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
      confidence: { type: "number" },
      contradiction: { type: "string" },
      verificationSummary: { type: "string" }
    },
    required: [
      "verified",
      "independentlySolvedAnswer",
      "acceptedAnswers",
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
  "solutionOutline 和 verificationChecks 只写简洁、可核验的关键步骤，不写冗长推理。",
  "如果题图不完整、题意存在多解或无法可靠读取，status 必须为 ambiguous 或 unreadable，不能猜答案。",
  ORDERED_PROPORTION_RULES
].join("\n");

const ANSWER_KEY_VERIFIER_PROMPT = [
  "你是第二位独立的初中数学答案复核员。候选答案可能是错的，不能顺着候选答案解释。",
  "你会收到从题图清洗出的完整题目文本。请只根据这份题目文本独立计算，然后再与候选答案比较。",
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

function answerKeyResultsAgree(solver, verifier) {
  const solverAnswers = answerKeyCandidates(solver);
  const verifierAnswers = [verifier?.independentlySolvedAnswer, ...(Array.isArray(verifier?.acceptedAnswers) ? verifier.acceptedAnswers : [])]
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  return solverAnswers.some((left) => verifierAnswers.some((right) => answerValuesEquivalent(left, right)));
}

function getAnswerKeyCacheKey(questionImage, context = {}) {
  return crypto
    .createHash("sha256")
    .update(String(questionImage || ""))
    .update(`|problem:${String(context.problemText || "").replace(/\s+/g, " ").trim()}`)
    .update(`|model:${QWEN_GUIDE_MODEL}|answer-key:v5`)
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
  const solver = await callQwenMultimodalJson({
    model: QWEN_GUIDE_MODEL,
    schema: answerKeySolverSchema,
    instructions: ANSWER_KEY_SOLVER_PROMPT,
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
    maxOutputTokens: 1400
  });

  if (solver.status !== "solved" || Number(solver.confidence) < ANSWER_KEY_MIN_CONFIDENCE || !solver.canonicalAnswer) {
    return {
      trusted: false,
      status: solver.status || "unverified",
      confidence: Number(solver.confidence) || 0,
      reason: solver.uncertainty || "独立解题未达到可信阈值",
      elapsedMs: Date.now() - startedAt
    };
  }

  const verifier = await callQwenMultimodalJson({
    model: QWEN_GUIDE_MODEL,
    schema: answerKeyVerifierSchema,
    instructions: ANSWER_KEY_VERIFIER_PROMPT,
    content: [
      {
        type: "input_text",
        text: JSON.stringify({
          cleanedProblemText: solver.problemText,
          questionType: solver.questionType,
          candidateAnswer: solver.canonicalAnswer,
          candidateAcceptedAnswers: solver.acceptedAnswers,
          instruction: "只用 cleanedProblemText 独立解题；算完后再看 candidateAnswer 是否一致。"
        })
      }
    ],
    maxOutputTokens: 900
  });

  const confidence = Math.min(Number(solver.confidence) || 0, Number(verifier.confidence) || 0);
  const trusted =
    verifier.verified === true &&
    confidence >= ANSWER_KEY_MIN_CONFIDENCE &&
    answerKeyResultsAgree(solver, verifier);

  if (!trusted) {
    console.warn(
      `[answer-key] verification conflict solver=${JSON.stringify(solver.canonicalAnswer)} verifier=${JSON.stringify(
        verifier.independentlySolvedAnswer
      )} solverConfidence=${solver.confidence} verifierConfidence=${verifier.confidence} verified=${verifier.verified}`
    );
  }

  return {
    trusted,
    status: trusted ? "verified" : "conflict",
    canonicalAnswer: trusted ? String(solver.canonicalAnswer).trim() : "",
    acceptedAnswers: trusted ? answerKeyCandidates(solver) : [],
    problemText: String(solver.problemText || context.problemText || "").trim(),
    questionType: String(solver.questionType || "").trim(),
    solutionOutline: trusted && Array.isArray(solver.solutionOutline) ? solver.solutionOutline.slice(0, 8) : [],
    verificationChecks: trusted && Array.isArray(solver.verificationChecks) ? solver.verificationChecks.slice(0, 8) : [],
    confidence,
    reason: trusted ? verifier.verificationSummary || "双重核验通过" : verifier.contradiction || "两次独立结果不一致",
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
  if (answerKeyInflight.has(cacheKey)) return cloneJson(await answerKeyInflight.get(cacheKey));

  const request = solveAndVerifyAnswerKey(questionImage, context)
    .then((result) => {
      if (result.trusted) setCachedAnswerKey(cacheKey, result);
      console.log(
        `[answer-key] resolved trusted=${result.trusted} status=${result.status} confidence=${result.confidence} elapsed=${result.elapsedMs}ms`
      );
      return result;
    })
    .finally(() => answerKeyInflight.delete(cacheKey));
  answerKeyInflight.set(cacheKey, request);
  return cloneJson(await request);
}

function privateAnswerReference(answerKey) {
  if (!answerKey?.trusted) {
    return {
      trusted: false,
      instruction: "标准答案尚未通过双重核验。禁止判断学生对错，禁止输出确定答案或确定算式。"
    };
  }
  return {
    trusted: true,
    canonicalAnswer: answerKey.canonicalAnswer,
    acceptedAnswers: answerKey.acceptedAnswers,
    solutionOutline: answerKey.solutionOutline,
    verificationChecks: answerKey.verificationChecks,
    confidence: answerKey.confidence,
    instruction: "这是服务端私有核验基线。所有数学判断必须与它一致；未解锁讲解时不得把最终答案直接告诉学生。"
  };
}

function guideHasCheckableMathClaim(result) {
  const value = [result?.speech, result?.formulaOrStep, result?.studentAction].filter(Boolean).join(" ");
  return /(?:正确|对的|成立|不成立|算错|结果|答案|选项|等于|推出|应该是|不是|[=＝]|\d\s*[:：/]\s*\d)/.test(value);
}

function makeUnverifiedGuideSafe(result) {
  if (!guideHasCheckableMathClaim(result)) return { ...(result || {}), lectureComplete: false };
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

  return claims;
}

function guideContradictsVerifiedAnswer(result, answerKey) {
  if (!answerKey?.trusted) return null;
  const text = [result?.speech, result?.formulaOrStep, result?.studentAction].filter(Boolean).join(" ");
  if (!text) return null;
  const claims = extractGuideAnswerClaims(text, answerKey);
  const wrongClaims = claims.filter((claim) => !studentAnswerMatchesVerifiedKey(claim.raw, answerKey));
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
  if (!answerKey?.trusted) return makeUnverifiedGuideSafe(result);
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
  try {
    const audit = await callQwenMultimodalJson({
      model: QWEN_GUIDE_MODEL,
      schema: guideMathAuditSchema,
      instructions: GUIDE_MATH_AUDIT_PROMPT,
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
    return makeUnverifiedGuideSafe(result);
  } catch (error) {
    console.warn(`[guide-audit] failed closed: ${error.message}`);
    return makeUnverifiedGuideSafe(result);
  }
}

function studentAnswerMatchesVerifiedKey(studentAnswer, answerKey) {
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

const FINAL_ANSWER_PROMPT = [
  "你是初中数学错题讲解的收尾核对助手。",
  "请结合当前题目图片、学生讲解文字、黑板图片和学生刚说出的最后答案，判断最后答案是否正确。",
  "必须实际根据题目条件和计算关系核对，不能因为学生说得肯定就判定正确。",
  "如果学生没有给出明确答案、答案看不清或题目条件不足以判断，correct 必须为 false，hint 要请学生把最后答案和单位再说清楚。",
  "correct=true 时 feedback 只给一句简短、贴合内容的确认，不要继续追问。",
  "correct=false 时 hint 必须明确指出学生答案与题目在哪一步不一致，例如具体的运算错误、符号错误、对应关系错误、选项错误或遗漏单位。",
  "错误提示最多两句话，可以给出该错误步骤的正确计算或正确关系，但不要展开整道题的完整解法。",
  "禁止只说‘再检查一下’‘没有对上’‘重新算一遍’等空泛套话。",
  "不要输出完整解题过程，不要替学生讲完。严格返回 JSON。"
].join("\n");

async function handleFinalAnswerCheck(req, res) {
  const body = await readJsonBody(req);
  if (!body.questionImage || !String(body.answer || "").trim()) {
    sendJson(res, 400, { error: "缺少 questionImage 或 answer" });
    return;
  }

  let answerKey = null;
  try {
    answerKey = await getVerifiedAnswerKey(body.questionImage, { problemText: body.problemText || "" });
  } catch (error) {
    console.warn(`[final-answer] answer-key unavailable, using direct fallback: ${error.message || error}`);
    sendJson(
      res,
      200,
      await safeDirectFinalAnswerCheck(body, {
        reason: error.message || "answer-key request failed",
        status: error.code || "answer-key-error"
      })
    );
    return;
  }
  if (!answerKey.trusted) {
    console.warn(
      `[final-answer] answer-key not trusted, using direct fallback status=${answerKey.status} confidence=${answerKey.confidence}`
    );
    sendJson(
      res,
      200,
      await safeDirectFinalAnswerCheck(body, {
        reason: answerKey.reason || "answer key not trusted",
        status: answerKey.status || "answer-key-untrusted"
      })
    );
    return;
  }
  if (!answerKey.trusted) {
    sendJson(res, 200, {
      correct: false,
      finalAnswer: String(body.answer).trim(),
      feedback: "",
      hint: "这道题的标准答案还没有可靠核准，我先不判断对错。请确认题目图片完整清晰后再核对。",
      confidence: 0,
      verificationStatus: answerKey.status,
      model: QWEN_GUIDE_MODEL,
      provider: "qwen-double-verified-final-answer"
    });
    return;
  }

  const directlyCompatible = studentAnswerMatchesVerifiedKey(body.answer, answerKey);
  if (directlyCompatible) {
    sendJson(res, 200, {
      correct: true,
      finalAnswer: String(body.answer).trim(),
      feedback: "这个结果和题目条件对上了。",
      hint: "",
      confidence: answerKey.confidence,
      verificationStatus: "double-verified-direct-match",
      model: QWEN_GUIDE_MODEL,
      provider: "qwen-double-verified-final-answer"
    });
    return;
  }

  const result = await callQwenMultimodalJson({
    model: QWEN_GUIDE_MODEL,
    schema: finalAnswerSchema,
    instructions: [
      FINAL_ANSWER_PROMPT,
      ORDERED_PROPORTION_RULES,
      "服务端已提供经过两次独立求解一致确认的私有标准答案。必须以该基线比较学生答案，不能重新猜测或被学生语气影响。"
    ].join("\n\n"),
    content: [
      {
        type: "input_text",
        text: JSON.stringify({
          studentAnswer: String(body.answer).trim(),
          lectureText: body.lectureText || "",
          latestHandwritingResult: body.latestHandwritingResult || null,
          verifiedAnswerReference: privateAnswerReference(answerKey)
        })
      },
      { type: "input_image", label: "当前题目图片", image_url: body.questionImage, detail: "high" },
      ...(body.boardImage ? [{ type: "input_image", label: "当前黑板图片", image_url: body.boardImage, detail: "high" }] : [])
    ],
    maxOutputTokens: 700
  });

  const interpretedCompatible = studentAnswerMatchesVerifiedKey(result.finalAnswer, answerKey);
  const correct =
    result.correct === true &&
    Number(result.confidence) >= ANSWER_KEY_MIN_CONFIDENCE &&
    interpretedCompatible;
  sendJson(res, 200, {
    ...result,
    correct,
    feedback: correct ? result.feedback : "",
    hint: correct
      ? ""
      : result.hint ||
        "这个答案与已核准结果不一致。请检查得出最终结果的那一步运算、符号或单位。",
    confidence: correct ? Math.min(Number(result.confidence) || 0, answerKey.confidence) : Number(result.confidence) || 0,
    verificationStatus: "double-verified",
    model: QWEN_GUIDE_MODEL,
    provider: "qwen-double-verified-final-answer"
  });
}

async function directFinalAnswerCheck(body, fallbackInfo = {}) {
  const result = await callQwenMultimodalJson({
    model: QWEN_GUIDE_MODEL,
    schema: finalAnswerSchema,
    instructions: [
      FINAL_ANSWER_PROMPT,
      ORDERED_PROPORTION_RULES,
      "标准答案双重核验暂时不可用。你必须直接根据题目图片重新计算，并核对学生最后答案。若图片题意足够清楚，可以判断 correct=true/false；若题目关键条件看不清，才返回 correct=false 并说明需要补充清晰题图。不要因为缺少双重基线就拒绝核对。"
    ].join("\n\n"),
    content: [
      {
        type: "input_text",
        text: JSON.stringify({
          studentAnswer: String(body.answer || "").trim(),
          lectureText: body.lectureText || "",
          latestHandwritingResult: body.latestHandwritingResult || null,
          knownProblemText: body.problemText || "",
          fallbackReason: fallbackInfo.reason || "",
          instruction:
            "请先读题并独立计算，再判断 studentAnswer 是否正确。正确时 feedback 只说一句确认并提醒点击我讲完了；错误时 hint 必须指出具体错在哪里。"
        })
      },
      { type: "input_image", label: "当前题目图片", image_url: body.questionImage, detail: "high" },
      ...(body.boardImage ? [{ type: "input_image", label: "当前黑板图片", image_url: body.boardImage, detail: "high" }] : [])
    ],
    maxOutputTokens: 700
  });

  const confidence = Number(result.confidence) || 0;
  const correct = result.correct === true && confidence >= 0.72;
  return {
    ...result,
    correct,
    feedback: correct ? result.feedback || "最后答案核对正确。" : "",
    hint: correct
      ? ""
      : result.hint || "我直接核对后还不能确认这个答案正确，请把最后一步运算或单位再检查一下。",
    confidence,
    verificationStatus: `direct-fallback:${fallbackInfo.status || "answer-key-unavailable"}`,
    model: QWEN_GUIDE_MODEL,
    provider: "qwen-direct-final-answer-fallback"
  };
}

async function safeDirectFinalAnswerCheck(body, fallbackInfo = {}) {
  try {
    return await directFinalAnswerCheck(body, fallbackInfo);
  } catch (error) {
    console.warn(`[final-answer] direct fallback failed: ${error.message || error}`);
    return {
      correct: false,
      finalAnswer: String(body.answer || "").trim(),
      feedback: "",
      hint:
        "核对服务现在连接失败，可能是 API key、额度或模型权限问题。你刚才的答案已经收到，请先不要保存，稍后重试一次核对。",
      confidence: 0,
      verificationStatus: `service-unavailable:${error.code || fallbackInfo.status || "qwen-error"}`,
      model: QWEN_GUIDE_MODEL,
      provider: "qwen-direct-final-answer-fallback"
    };
  }
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

async function handleGuide(req, res) {
  const body = await readJsonBody(req);
  if (!body.questionImage) {
    sendJson(res, 400, { error: "缺少 questionImage" });
    return;
  }

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

  const guideState = body.guideState || "heuristic_guidance";
  const lectureUnlocked = Boolean(body.lectureUnlocked);
  const answerKey = await getVerifiedAnswerKey(body.questionImage, { problemText: body.problemText || "" });

  let guideResult = await callQwenMultimodalJson({
    model: QWEN_GUIDE_MODEL,
    schema: guideSchema,
    instructions: [LIAN_GUIDE_PROMPT, ORDERED_PROPORTION_RULES, COMPANION_DIALOGUE_POLICY, LECTURE_COMPLETION_RULES].join("\n\n"),
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
          knownProblemText: body.problemText || "",
          knownKnowledgePoints: body.knowledgePoints || [],
          verifiedAnswerReference: privateAnswerReference(answerKey),
          boundaryRules: [
            "如果 eventType=answer_to_lian_question，必须优先回应 lianQuestion 和 latestStudentSpeech 的对应关系，shouldSpeak=true，通常一句话确认后再给一个很小的下一步。",
            "如果学生回答的是要讲哪一道题、哪一步或哪种方式，先接受这个选择，不要根据黑板截图另行改成别的题号。",
            "lectureUnlocked=false 时只能启发引导或微提示，hintLevel 只能为 encourage/light。",
            "lectureUnlocked=false 时 speech 不得包含最终答案、中间完整算式或完整解题步骤。",
            "lectureUnlocked=true 时只讲一个小步骤，不得一次性讲完整题。",
            "每次互动讲解后 studentAction 必须要求学生复述、继续说或写回黑板。",
            "如果 eventType=active_help，学生已经明确提问或表示不会，必须 shouldSpeak=true，并直接回应这个问题；只给当前最需要的一个小步骤，不要先泛泛鼓励。",
            "如果只是普通 1 分钟沉默且 awaitingSilenceFollowup=false，必须 shouldSpeak=true，并贴着学生最后讲到的内容给一个小切入点；不直接给完整公式或完整答案。",
            "如果 eventType=thought_complete 且学生只是半句话、过渡句或仍在铺垫，shouldSpeak=false。",
            "如果 eventType=thought_complete 且确实需要回应，speech 只能是一句短回应；不要展开完整讲解、不要连续解释多个概念。",
            "lectureComplete 默认必须为 false；只有 answerVerified=true、boardCompletionVerified=true，且学生已经讲完关键思路时才设为 true。点击‘我讲完了’本身不是完成证据。",
            "lectureComplete=true 后 speech 只做一次收束，不得继续追问、要求复述或重复已经说过的选项。",
            "任何对错判断、算式、选项或答案都必须与 verifiedAnswerReference 一致。trusted=false 时禁止判断对错或输出确定数学结论。",
            "verifiedAnswerReference.trusted=true 时，禁止给出与 canonicalAnswer 不一致的候选最终答案；指出错误时只说具体错在常数项、符号、对应关系或公式，不要说“或者另一个答案”。",
            "不要把题目图片里被划掉、红叉或旁边批改的原错答案当作可能正确答案。",
            "禁止使用固定鼓励词：很好、不错、继续、真棒、非常好、很棒。"
          ],
          styleRules: LIAN_STYLE_RULES
        })
      },
      { type: "input_image", label: "题目图片", image_url: body.questionImage, detail: "high" },
      ...(body.boardImage ? [{ type: "input_image", label: "当前黑板截图", image_url: body.boardImage, detail: "high" }] : [])
    ],
    maxOutputTokens: 1200
  });

  guideResult = enforceOrderedProportionConvention(guideResult, {
    latestStudentSpeech: body.latestStudentSpeech || "",
    problemText: body.problemText || "",
    knowledgePoints: body.knowledgePoints || []
  });
  guideResult = await auditGuideMath(guideResult, answerKey, body);

  sendJson(res, 200, {
    ...guideResult,
    model: QWEN_GUIDE_MODEL,
    answerVerification: answerKey.trusted ? "double-verified" : answerKey.status,
    provider: "qwen-double-verified-guidance",
    fallbackFrom: ""
  });
}

async function handleHandwriting(req, res) {
  const body = await readJsonBody(req);
  if (!body.questionImage || !(body.boardOnlyImage || body.boardImage)) {
    sendJson(res, 400, { error: "缺少 questionImage 或 boardOnlyImage" });
    return;
  }

  const boardForOcr = body.boardOnlyImage || body.boardImage;
  const answerKey = await getVerifiedAnswerKey(body.questionImage, { problemText: body.problemText || "" });

  let result = await callQwenMultimodalJson({
    model: QWEN_HANDWRITING_MODEL,
    schema: handwritingSchema,
    instructions: [HANDWRITING_PROMPT, ORDERED_PROPORTION_RULES].join("\n\n"),
    content: [
      {
        type: "input_text",
        text: JSON.stringify({
          trigger: body.reason || "停笔后异步识别",
          transcript: body.transcript || "",
          knownProblemText: body.problemText || "",
          knownKnowledgePoints: body.knowledgePoints || [],
          verifiedAnswerReference: privateAnswerReference(answerKey),
          instruction:
            "请直接观察题目图片、纯板书截图、包含题目区域的板书截图。纯板书截图用来判断学生真正写了什么；题目图片和包含题目区域的截图用于理解题意、确认题目条件和板书所在位置。不要把题目原图里的印刷答案、红叉、批改痕迹当成学生板书。然后根据题目条件实际计算/验算。若 verifiedAnswerReference.trusted=true，所有对错判断必须与这份双重核验基线一致；若 trusted=false，只能返回 unclear 或 incomplete，禁止判 correct/wrong。若可见关键步骤数学上成立，即使后续推导和最终答案没有写在板书上，也可返回 calculationStatus=correct；若可见步骤或最后结论算错，必须返回 calculationStatus=wrong；若明显不符合题意，给温和检查提醒；若只是字迹不清，不要轻易判错。若 trigger 表示完成讲解前检查，boardComplete 只判断是否至少存在一个与本题相关、可复核且正确的关键步骤，不要求完整推导或板书最终答案。"
        })
      },
      { type: "input_image", label: "题目图片", image_url: body.questionImage, detail: "high" },
      { type: "input_image", label: "纯板书截图", image_url: boardForOcr, detail: "high" },
      ...(body.boardImage ? [{ type: "input_image", label: "包含题目区域的板书截图", image_url: body.boardImage, detail: "high" }] : [])
    ],
    maxOutputTokens: 1000
  });

  if (!answerKey.trusted && ["correct", "wrong"].includes(result.calculationStatus)) {
    result = {
      ...result,
      calculationStatus: "unclear",
      calculationCheck: "标准答案尚未通过双重核验，暂不判断板书对错。",
      hasPossibleIssue: false,
      issueType: "unclear",
      issueSummary: "",
      expectedNextStep: "",
      guidance: "",
      positiveFeedback: "",
      boardComplete: false,
      missingBoardContent: result.missingBoardContent || "标准答案尚未通过双重核验，暂时不能确认板书完整。"
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

  sendJson(res, 200, {
    ...result,
    answerVerification: answerKey.trusted ? "double-verified" : answerKey.status,
    model: QWEN_HANDWRITING_MODEL,
    provider: "qwen-double-verified-handwriting"
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

async function handleAnswerKeyPrefetch(req, res) {
  const body = await readJsonBody(req);
  if (!body.questionImage) {
    sendJson(res, 400, { error: "缺少 questionImage" });
    return;
  }
  const answerKey = await getVerifiedAnswerKey(body.questionImage, { problemText: body.problemText || "" });
  sendJson(res, 200, {
    ready: answerKey.trusted,
    status: answerKey.status,
    confidence: answerKey.trusted ? answerKey.confidence : 0,
    provider: "qwen-double-verified-answer-key"
  });
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
        aliyunOcrConfigured: Boolean(ALIYUN_OCR_APPCODE),
        aliyunOcrEnabled: ALIYUN_OCR_ENABLED,
        aliyunOfficialEduPaperCutConfigured: Boolean(ALIYUN_OCR_ACCESS_KEY_ID && ALIYUN_OCR_ACCESS_KEY_SECRET),
        segmentAliyunOnly: SEGMENT_ALIYUN_ONLY,
        localOcrEnabled: LOCAL_OCR_ENABLED,
        layoutEnabled: LAYOUT_ENABLED,
        uptimeSeconds: Math.round(process.uptime())
      });
    }
    if (req.method === "POST" && pathname === "/api/segment") return await handleSegmentV2(req, res);
    if (req.method === "POST" && pathname === "/api/transcript-correct") return await handleTranscriptCorrection(req, res);
    if (req.method === "POST" && pathname === "/api/archive-summary") return await handleArchiveSummary(req, res);
    if (req.method === "POST" && pathname === "/api/answer-key") return await handleAnswerKeyPrefetch(req, res);
    if (req.method === "POST" && pathname === "/api/final-answer") return await handleFinalAnswerCheck(req, res);
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
  guideContradictsVerifiedAnswer,
  makeAnswerLockedGuideSafe,
  answerValuesEquivalent,
  answerKeyResultsAgree,
  makeUnverifiedGuideSafe,
  studentAnswerMatchesVerifiedKey,
  isOnlyDirectAnswerWriting
};
