const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
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
  answerValuesEquivalent,
  choiceAnalysesAgree,
  answerKeyResultsAgree,
  makeUnverifiedGuideSafe,
  studentAnswerMatchesVerifiedKey,
  isOnlyDirectAnswerWriting,
  applyStatementEvaluationSafety,
  applyLatestHandwritingConsistency,
  summarizeHandwritingDiagnostics,
  buildQuestionMemory,
  questionMemoryToAnswerKey,
  buildHandwritingProcessFeedback,
  registerQuestionMemoryIdentity,
  registerHandwritingRequest,
  isLatestHandwritingRequest
} = require("../server.js");

test("captures one standard-answer result as a reusable Question Memory snapshot", () => {
  const memory = buildQuestionMemory("q-1", {
    trusted: true,
    status: "structured-single-pass",
    confidence: 0.96,
    canonicalAnswer: "C",
    acceptedAnswers: ["C"],
    problemText: "选择正确答案",
    questionType: "choice",
    knowledge: "比例",
    solutionOutline: ["按题目顺序列比例"],
    verificationChecks: ["代入检查"]
  });

  assert.equal(memory.version, 1);
  assert.equal(memory.questionId, "q-1");
  assert.equal(memory.ready, true);
  assert.equal(memory.canonicalAnswer, "C");
  assert.deepEqual(memory.solutionOutline, ["按题目顺序列比例"]);

  const answerKey = questionMemoryToAnswerKey(memory, "q-1");
  assert.equal(answerKey.trusted, true);
  assert.equal(answerKey.canonicalAnswer, "C");
});

test("keeps one Question Memory identity per answer session", () => {
  const sessionId = `session-${Date.now()}-${Math.random()}`;
  const questionId = "q-memory-singleton";
  assert.equal(registerQuestionMemoryIdentity(sessionId, questionId, "memory-a"), "memory-a");
  assert.equal(registerQuestionMemoryIdentity(sessionId, questionId, "memory-a"), "memory-a");
  assert.throws(
    () => registerQuestionMemoryIdentity(sessionId, questionId, "memory-b"),
    (error) => error.code === "question_memory_conflict" && error.statusCode === 409
  );
  assert.equal(
    registerQuestionMemoryIdentity(sessionId, "q-memory-content", "memory-c", "answer:C"),
    "memory-c"
  );
  assert.throws(
    () => registerQuestionMemoryIdentity(sessionId, "q-memory-content", "memory-c", "answer:D"),
    (error) => error.code === "question_memory_conflict" && error.statusCode === 409
  );
});

test("rejects an older handwriting response after a newer request starts", () => {
  const sessionId = `session-order-${Date.now()}-${Math.random()}`;
  const questionId = "q-handwriting-order";
  registerHandwritingRequest(sessionId, questionId, 2);
  assert.equal(isLatestHandwritingRequest(sessionId, questionId, 2), true);
  assert.equal(isLatestHandwritingRequest(sessionId, questionId, 1), false);
  assert.throws(
    () => registerHandwritingRequest(sessionId, questionId, 1),
    (error) => error.code === "stale_request" && error.statusCode === 409
  );
});

test("propagates session and memory identity through handwriting requests", () => {
  const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  const serverSource = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
  const requestSource = appSource.slice(
    appSource.indexOf("async function requestHandwritingAnalysis"),
    appSource.indexOf("async function verifyCurrentBoardForCompletion")
  );
  const handlerSource = serverSource.slice(
    serverSource.indexOf("async function handleHandwriting"),
    serverSource.indexOf("function isOnlyDirectAnswerWriting")
  );
  assert.match(requestSource, /sessionId/);
  assert.match(requestSource, /requestId/);
  assert.match(requestSource, /memoryId/);
  assert.match(requestSource, /boardVersion/);
  assert.match(handlerSource, /registerQuestionMemoryIdentity/);
  assert.match(handlerSource, /registerHandwritingRequest/);
  assert.match(handlerSource, /isLatestHandwritingRequest/);
});

test("fails closed when handwriting has no matching Question Memory", () => {
  assert.throws(
    () => questionMemoryToAnswerKey(null, "q-1"),
    (error) => error.code === "question_memory_missing" && error.stage === "question-memory"
  );
  assert.throws(
    () => questionMemoryToAnswerKey({ questionId: "q-2", ready: true }, "q-1"),
    (error) => error.code === "question_memory_mismatch" && error.stage === "question-memory"
  );
});

test("handwriting consumes Question Memory without acquiring an answer key", () => {
  const serverSource = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
  const handlerSource = serverSource.slice(
    serverSource.indexOf("async function handleHandwriting"),
    serverSource.indexOf("function isOnlyDirectAnswerWriting")
  );
  const auditSource = serverSource.slice(
    serverSource.indexOf("async function auditHandwritingResult"),
    serverSource.indexOf("async function handleQuestionMemory")
  );
  const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  const appHandwritingRequest = appSource.slice(
    appSource.indexOf("async function requestHandwritingAnalysis"),
    appSource.indexOf("async function verifyCurrentBoardForCompletion")
  );
  const appHandwritingRun = appSource.slice(
    appSource.indexOf("async function runHandwritingRecognition"),
    appSource.indexOf("async function requestHandwritingAnalysis")
  );

  assert.match(handlerSource, /questionMemoryToAnswerKey\(body\.questionMemory/);
  assert.doesNotMatch(handlerSource, /getVerifiedAnswerKey\(/);
  assert.doesNotMatch(handlerSource, /body\.questionImage|body\.problemText|body\.knowledgePoints|包含题目区域|ORDERED_PROPORTION_RULES|STATEMENT_EVALUATION_RULES/);
  assert.doesNotMatch(auditSource, /body\.questionImage|body\.problemText|body\.knowledgePoints|包含题目区域|ORDERED_PROPORTION_RULES|STATEMENT_EVALUATION_RULES/);
  assert.match(appSource, /fetch\("\/api\/question-memory"/);
  assert.doesNotMatch(appSource, /fetch\("\/api\/answer-key"/);
  assert.match(appSource, /questionMemory,/);
  assert.doesNotMatch(appHandwritingRequest, /questionImage:|problemText:|knowledgePoints:|boardImage:|createCurrentBoardSnapshot/);
  assert.doesNotMatch(appHandwritingRun, /maybeSpeakHandwritingSuccess|maybeSpeakHandwritingUnclear|maybeVerifyFinalAnswerFromHandwriting|maybePromptSaveFromHandwriting/);
});

test("keeps correct board progress silent and grounds feedback in visible work", () => {
  const answerKey = questionMemoryToAnswerKey(buildQuestionMemory("q-1", {
    trusted: true,
    status: "structured-single-pass",
    confidence: 0.95,
    canonicalAnswer: "x=4",
    acceptedAnswers: ["x=4"],
    solutionOutline: ["列出 2:3=x:6", "交叉相乘得到 3x=12", "求得 x=4"]
  }), "q-1");
  const result = buildHandwritingProcessFeedback({
    writingState: "complete",
    completedSteps: ["列出 2:3=x:6"],
    calculationStatus: "correct",
    confidence: 0.9,
    hasPossibleIssue: false
  }, answerKey, { boardIdleSeconds: 7 });

  assert.equal(result.guidance, "");
  assert.equal(result.positiveFeedback, "你已经写出了“列出 2:3=x:6”。");
  assert.doesNotMatch(result.positiveFeedback, /很好|很棒|继续努力/);
});

test("only gives stalled guidance from Question Memory standard steps", () => {
  const answerKey = questionMemoryToAnswerKey(buildQuestionMemory("q-1", {
    trusted: true,
    canonicalAnswer: "x=4",
    acceptedAnswers: ["x=4"],
    solutionOutline: ["列出 2:3=x:6", "交叉相乘得到 3x=12"]
  }), "q-1");
  const observation = {
    writingState: "stalled",
    completedSteps: ["列出 2:3=x:6"],
    calculationStatus: "incomplete",
    confidence: 0.86,
    hasPossibleIssue: false
  };

  const shortPause = buildHandwritingProcessFeedback(observation, answerKey, { boardIdleSeconds: 7 });
  assert.equal(shortPause.writingState, "in_progress");
  assert.equal(shortPause.guidance, "");

  const stalled = buildHandwritingProcessFeedback(observation, answerKey, { boardIdleSeconds: 20 });
  assert.equal(stalled.expectedNextStep, "交叉相乘得到 3x=12");
  assert.match(stalled.guidance, /列出 2:3=x:6/);
  assert.match(stalled.guidance, /交叉相乘得到 3x=12/);
});

test("requires a concrete visible error location before interrupting", () => {
  const answerKey = { trusted: true, solutionOutline: ["核对等号后的数"] };
  const explicit = buildHandwritingProcessFeedback({
    writingState: "complete",
    completedSteps: ["写出 x=-2"],
    calculationStatus: "wrong",
    confidence: 0.91,
    hasPossibleIssue: true,
    errorLocation: "最后一行 x=-2",
    errorEvidence: "它与 Question Memory 中已核验的 x=4 冲突"
  }, answerKey);
  assert.equal(explicit.guidance, "先检查最后一行 x=-2：它与 Question Memory 中已核验的 x=4 冲突");

  const vague = buildHandwritingProcessFeedback({
    writingState: "complete",
    calculationStatus: "wrong",
    confidence: 0.91,
    hasPossibleIssue: true,
    issueSummary: "可能不对"
  }, answerKey);
  assert.equal(vague.calculationStatus, "unclear");
  assert.equal(vague.guidance, "");
});

test("keeps independent handwriting attempts distinguishable", () => {
  const first = summarizeHandwritingDiagnostics({
    requestId: 11,
    questionId: "q-1",
    boardVersion: 1,
    reason: "停笔后识别",
    canvasWidth: 800,
    canvasHeight: 600,
    boardOnlyBytes: 1200
  });
  const second = summarizeHandwritingDiagnostics({
    requestId: 12,
    questionId: "q-1",
    boardVersion: 2,
    reason: "继续写字后再次停笔",
    canvasWidth: 800,
    canvasHeight: 600,
    boardOnlyBytes: 1800
  });

  assert.notEqual(first.requestId, second.requestId);
  assert.notEqual(first.boardVersion, second.boardVersion);
  assert.equal(first.questionId, second.questionId);
  assert.ok(second.boardOnlyBytes > first.boardOnlyBytes);
});

test("clips layout regions to OCR question-number intervals", () => {
  const anchors = [
    { sourceQuestionNumber: "11", startY: 100 },
    { sourceQuestionNumber: "12", startY: 260 },
    { sourceQuestionNumber: "13", startY: 420 }
  ];
  const regions = [
    { label: "text", score: 0.95, x: 40, y: 80, w: 700, h: 380 },
    { label: "table", score: 0.91, x: 90, y: 300, w: 500, h: 90 },
    { label: "page_number", score: 0.99, x: 380, y: 760, w: 30, h: 20 }
  ];

  const blocks = buildLayoutContentBlocks(regions, anchors, 800, 800);
  const q11 = blocks.filter((block) => block.parentQuestionNumber === "11");
  const q12 = blocks.filter((block) => block.parentQuestionNumber === "12");
  const q13 = blocks.filter((block) => block.parentQuestionNumber === "13");

  assert.ok(q11.length >= 1);
  assert.ok(q12.length >= 2);
  assert.ok(q13.length >= 1);
  assert.ok(q11.every((block) => block.y + block.h <= 260));
  assert.ok(q12.every((block) => block.y >= 260 && block.y + block.h <= 420));
  assert.ok(q13.every((block) => block.y >= 420));
  assert.equal(blocks.some((block) => block.contentType === "page_number"), false);
});

test("routes a dense page with too few OCR anchors to vision review", () => {
  const confidence = assessLocalSegmentationConfidence({
    anchors: [{ sourceQuestionNumber: "11", startY: 120 }],
    ocrLines: Array.from({ length: 14 }, (_, index) => ({
      text: `line ${index}`,
      x: 40,
      y: 80 + index * 35,
      w: 600,
      h: 20
    })),
    layoutRegions: [{ label: "text", score: 0.9, x: 30, y: 70, w: 720, h: 520 }],
    width: 800,
    height: 700
  });

  assert.equal(confidence.needsVisionReview, true);
  assert.ok(confidence.reasons.includes("整页内容密集但题号不足"));
});

test("keeps a well-anchored local page on the fast path", () => {
  const confidence = assessLocalSegmentationConfidence({
    anchors: [
      { sourceQuestionNumber: "11", startY: 100 },
      { sourceQuestionNumber: "12", startY: 260 },
      { sourceQuestionNumber: "13", startY: 430 }
    ],
    ocrLines: Array.from({ length: 12 }, (_, index) => ({
      text: `line ${index}`,
      x: 40,
      y: 80 + index * 40,
      w: 600,
      h: 20
    })),
    layoutRegions: [
      { label: "text", score: 0.92, x: 30, y: 80, w: 720, h: 480 },
      { label: "table", score: 0.88, x: 100, y: 300, w: 450, h: 80 }
    ],
    width: 800,
    height: 700
  });

  assert.equal(confidence.needsVisionReview, false);
  assert.ok(confidence.score >= confidence.threshold);
});

test("recovers a leading question number when OCR glues the next body digit to it", () => {
  const lines = [
    {
      text: "242. 年，中国成功发射了某空间望远镜，运行轨道距地面约450千米",
      x: 86,
      y: 209,
      w: 720,
      h: 30
    },
    {
      text: "25. 某粮库用于储存小麦的粮囤是圆柱和圆锥的组合体",
      x: 96,
      y: 568,
      w: 760,
      h: 32
    },
    {
      text: "26. 三所学校开展数学实践活动，回答下列问题",
      x: 107,
      y: 1025,
      w: 730,
      h: 32
    }
  ];
  const anchors = extractMainQuestionAnchors(lines, 1280, 1706);
  const recovered = recoverLeadingMalformedQuestionAnchor(lines, anchors, 1280, 1706);

  assert.deepEqual(recovered.map((anchor) => anchor.sourceQuestionNumber), ["24", "25", "26"]);
  assert.equal(recovered[0].startY, 209);
  assert.equal(recovered[0].evidenceSource, "ocr-leading-number-glue-correction");
});

test("routes a page to vision review when substantial content sits above the first anchor", () => {
  const confidence = assessLocalSegmentationConfidence({
    anchors: [
      { sourceQuestionNumber: "25", startY: 568 },
      { sourceQuestionNumber: "26", startY: 1025 }
    ],
    ocrLines: [
      { text: "年，中国成功发射了某空间望远镜，运行轨道距地面约450千米", x: 86, y: 209, w: 720, h: 30 },
      { text: "运行周期约95分钟，地球半径约为6400千米", x: 90, y: 280, w: 650, h: 28 },
      { text: "25. 某粮库用于储存小麦的粮囤", x: 96, y: 568, w: 500, h: 32 },
      { text: "26. 如图，回答下列问题", x: 107, y: 1025, w: 420, h: 32 }
    ],
    layoutRegions: [
      { label: "text", score: 0.95, x: 70, y: 190, w: 900, h: 300 },
      { label: "text", score: 0.95, x: 80, y: 560, w: 980, h: 430 }
    ],
    width: 1280,
    height: 1706
  });

  assert.equal(confidence.needsVisionReview, true);
  assert.ok(confidence.reasons.includes("首个题号上方存在大量未归属正文"));
});

test("accepts a formula-led main question when it has a legal numbered prefix", () => {
  const anchors = extractMainQuestionAnchors(
    [
      { text: "11. 已知关于 x、y 的方程", x: 40, y: 100, w: 620, h: 24 },
      { text: "12. a:b=1/5:1/3，b:c=2:7", x: 40, y: 180, w: 620, h: 24 },
      { text: "13. 如图，某条河遭受暴雨袭击", x: 40, y: 260, w: 620, h: 24 }
    ],
    800,
    600
  );

  assert.deepEqual(anchors.map((anchor) => anchor.sourceQuestionNumber), ["11", "12", "13"]);
});

test("keeps Qwen question structures when local OCR has no reliable anchors", () => {
  const candidates = normalizeQuestionRegions(
    [
      {
        questionNumber: "21",
        stemBoxes: [{ x: 0.08, y: 0.12, w: 0.84, h: 0.1 }],
        optionBoxes: [{ x: 0.1, y: 0.23, w: 0.8, h: 0.14 }],
        otherBoxes: [],
        summary: "已知两个数的关系，选择正确答案",
        type: "选择题"
      },
      {
        questionNumber: "22",
        stemBoxes: [{ x: 0.08, y: 0.45, w: 0.84, h: 0.1 }],
        optionBoxes: [{ x: 0.1, y: 0.56, w: 0.8, h: 0.14 }],
        otherBoxes: [],
        summary: "根据图形中的条件计算面积",
        type: "计算题"
      }
    ],
    [],
    [],
    1000,
    1200
  );

  assert.deepEqual(candidates.map((candidate) => candidate.sourceQuestionNumber), ["21", "22"]);
  assert.ok(candidates.every((candidate) => candidate.questionRole === "mainQuestion"));
});

function makeQuestion(number, y, h = 90) {
  return {
    sourceQuestionNumber: String(number),
    questionRole: "mainQuestion",
    subQuestions: [],
    optionLabels: [],
    finalBox: { x: 30, y, w: 720, h },
    mergeReasons: [],
    validation: [],
    ocrLineBoxes: []
  };
}

test("groups a detached question number and stem into one Q3 anchor on a narrow page", () => {
  const blocks = [
    { text: "3.", x: 40, y: 300, w: 12, h: 24 },
    { text: "“滴水湖”的湖面呈圆形，半径约是1.25千米。", x: 80, y: 302, w: 320, h: 24 }
  ];
  const groupedLines = groupOcrBlocksIntoLines(blocks, 450, 800);
  const lines = mergeDetachedQuestionNumberLines(groupedLines, 450);
  const anchors = extractMainQuestionAnchors(lines, 450, 800);

  assert.equal(groupedLines.length, 2);
  assert.equal(lines.length, 1);
  assert.match(lines[0].text, /^3\.\s*“滴水湖”/);
  assert.deepEqual(anchors.map((anchor) => anchor.sourceQuestionNumber), ["3"]);
});

test("rebuilds Q3 when OCR anchors are 2,3,4 but AI results are 2,4", () => {
  const blocks = [
    { text: "2. 若x、y均不为0，请选择正确答案", x: 40, y: 100, w: 650, h: 24 },
    { text: "A. 1 B. 2 C. 3 D. 4", x: 65, y: 145, w: 610, h: 24 },
    { text: "3.", x: 40, y: 220, w: 18, h: 24 },
    { text: "“滴水湖”的湖面呈圆形，半径约是1.25千米。", x: 70, y: 222, w: 540, h: 24 },
    { text: "A. 1.25π B. 2.5π C. 5π D. 2.25π", x: 65, y: 270, w: 650, h: 24 },
    { text: "4. 有编号为1到10的10个篮球，请判断下列说法", x: 40, y: 350, w: 680, h: 24 }
  ];
  const lines = groupOcrBlocksIntoLines(blocks, 800, 500);
  const anchors = extractMainQuestionAnchors(lines, 800, 500);
  const bands = buildOcrQuestionBands(blocks, 800, 500, { ocrLines: lines, anchors });
  const questions = [makeQuestion(2, 95, 210), makeQuestion(4, 345, 120)];
  const finalQuestions = reconcileQuestionsWithOcrAnchors(questions, bands, blocks, 800, 500);

  assert.deepEqual(finalQuestions.map((question) => question.sourceQuestionNumber), ["2", "3", "4"]);
  assert.equal(finalQuestions[1].generatedFrom, "ocr-anchor");
  assert.ok(finalQuestions[0].finalBox.y + finalQuestions[0].finalBox.h < bands[1].startY);
  assert.equal(finalQuestions[1].questionStartY, bands[1].startY);
});

test("does not invent Q3 when OCR anchors only contain 2 and 4", () => {
  const blocks = [
    { text: "2. 若x、y均不为0，请选择正确答案", x: 40, y: 100, w: 650, h: 24 },
    { text: "4. 有编号为1到10的10个篮球，请判断下列说法", x: 40, y: 350, w: 680, h: 24 }
  ];
  const lines = groupOcrBlocksIntoLines(blocks, 800, 500);
  const anchors = extractMainQuestionAnchors(lines, 800, 500);
  const bands = buildOcrQuestionBands(blocks, 800, 500, { ocrLines: lines, anchors });
  const questions = [makeQuestion(2, 95), makeQuestion(4, 345)];
  const finalQuestions = reconcileQuestionsWithOcrAnchors(questions, bands, blocks, 800, 500);

  assert.deepEqual(finalQuestions.map((question) => question.sourceQuestionNumber), ["2", "4"]);
});

test("preserves a standalone OCR Q3 marker when the existing vision result also identifies Q3", () => {
  const lines = [
    { text: "2. 若甲乙两个数均不为零，请选择正确答案", x: 40, y: 100, w: 500, h: 24, blockIndexes: [0], blocks: [] },
    { text: "3.", x: 40, y: 400, w: 18, h: 24, blockIndexes: [1], blocks: [] },
    { text: "4. 已知十个篮球的编号，请选择正确答案", x: 40, y: 600, w: 500, h: 24, blockIndexes: [2], blocks: [] }
  ];
  const strictAnchors = extractMainQuestionAnchors(lines, 800, 900);
  const recovered = recoverNumberMarkerAnchors(
    lines,
    strictAnchors,
    [{ questionNumber: "2" }, { questionNumber: "3", summary: "A complete existing vision result" }, { questionNumber: "4" }],
    800,
    900
  );

  assert.deepEqual(recovered.map((anchor) => anchor.sourceQuestionNumber), ["2", "3", "4"]);
  assert.equal(recovered[1].evidenceSource, "ocr-number-marker+existing-vision-result");
});

test("recognizes a formula-heavy main question without depending on a specific question number", () => {
  const blocks = [
    { text: "13. \u5df2\u77e5\u67d0\u6761\u6cb3\u906d\u53d7\u66b4\u96e8\u88ad\u51fb\uff0c\u8bf7\u6839\u636e\u8868\u683c\u56de\u7b54\u95ee\u9898", x: 40, y: 100, w: 650, h: 24 },
    { text: "14. \u5173\u4e8ex\u3001y\u7684\u65b9\u7a0b\u7ec4 {4x-y=7m+1", x: 40, y: 220, w: 650, h: 24 },
    { text: "15. \u5df2\u77e5\u76f4\u89d2\u4e09\u89d2\u5f62\u7684\u4e24\u6761\u76f4\u89d2\u8fb9\uff0c\u8bf7\u6c42\u659c\u8fb9\u957f", x: 40, y: 340, w: 650, h: 24 }
  ];
  const lines = groupOcrBlocksIntoLines(blocks, 800, 500);
  const strictAnchors = extractMainQuestionAnchors(lines, 800, 500);
  assert.deepEqual(strictAnchors.map((anchor) => anchor.sourceQuestionNumber), ["13", "14", "15"]);

  const questions = enforceHardQuestionBoundaries(
    [makeQuestion(13, 95, 210), makeQuestion(15, 335, 120)],
    strictAnchors,
    { blocks, width: 800, height: 500, boundaryGap: 3, topPadding: 4 }
  );
  validateFinalQuestionBoxes(questions, strictAnchors);
  validateSingleMainQuestionPerCrop(questions, strictAnchors);

  assert.deepEqual(questions.map((question) => question.sourceQuestionNumber), ["13", "14", "15"]);
  const q13 = questions.find((question) => question.sourceQuestionNumber === "13");
  const q14 = questions.find((question) => question.sourceQuestionNumber === "14");
  const q15 = questions.find((question) => question.sourceQuestionNumber === "15");
  assert.ok(q13.finalBox.y + q13.finalBox.h <= q14.finalBox.y);
  assert.ok(q14.finalBox.y + q14.finalBox.h <= q15.finalBox.y);
  assert.equal(q14.generatedFrom, "ocr-anchor");
});

function splitOneLargeCandidate(numbers) {
  const anchors = numbers.map((number, index) => ({
    questionNumber: number,
    sourceQuestionNumber: String(number),
    top: 100 + index * 120,
    startY: 100 + index * 120,
    nextStartY: index < numbers.length - 1 ? 100 + (index + 1) * 120 : 500,
    text: `${number}. question stem`
  }));
  const candidate = makeQuestion(numbers[0], 95, Math.max(140, numbers.length * 120));
  candidate.finalBox = { x: 30, y: 95, w: 720, h: Math.max(140, numbers.length * 120) };
  const questions = splitQuestionCandidatesByMainQuestionAnchors(
    [candidate],
    anchors,
    { blocks: [], width: 800, height: 500 }
  );
  return { anchors, questions };
}

test("splits one candidate containing Q2 and Q3 into two questions", () => {
  const { questions } = splitOneLargeCandidate([2, 3]);
  assert.deepEqual(questions.map((question) => question.sourceQuestionNumber), ["2", "3"]);
  assert.ok(questions[0].finalBox.h > 80);
  assert.ok(questions[0].finalBox.y + questions[0].finalBox.h < questions[1].finalBox.y);
});

test("splits one candidate containing Q13 and Q14 without special-case code", () => {
  const { questions } = splitOneLargeCandidate([13, 14]);
  assert.deepEqual(questions.map((question) => question.sourceQuestionNumber), ["13", "14"]);
});

test("splits one candidate containing Q25, Q26, and Q27 into three questions", () => {
  const { questions } = splitOneLargeCandidate([25, 26, 27]);
  assert.deepEqual(questions.map((question) => question.sourceQuestionNumber), ["25", "26", "27"]);
  assert.ok(questions.every((question) => question.finalBox.h > 80));
});

test("splits detected Q5 and Q7 without inventing Q6", () => {
  const { questions } = splitOneLargeCandidate([5, 7]);
  assert.deepEqual(questions.map((question) => question.sourceQuestionNumber), ["5", "7"]);
});

test("supports three-digit question numbers without special handling", () => {
  const { questions } = splitOneLargeCandidate([99, 100]);
  assert.deepEqual(questions.map((question) => question.sourceQuestionNumber), ["99", "100"]);
});

test("rechecks a numbering gap and recovers a real intermediate question from existing OCR and vision evidence", () => {
  const lines = [
    { text: "11. \u5df2\u77e5\u4e8c\u5143\u4e00\u6b21\u65b9\u7a0b\uff0c\u8bf7\u6c42\u53c2\u6570", x: 40, y: 100, w: 620, h: 24, blockIndexes: [0], blocks: [] },
    { text: "a:b=1/5:1/3, b:c=2:7", x: 60, y: 220, w: 480, h: 24, blockIndexes: [1], blocks: [] },
    { text: "13. \u5982\u56fe\uff0c\u8bf7\u6839\u636e\u6c34\u4f4d\u8bb0\u5f55\u8868\u56de\u7b54\u95ee\u9898", x: 40, y: 340, w: 620, h: 24, blockIndexes: [2], blocks: [] }
  ];
  const anchors = extractMainQuestionAnchors(lines, 800, 500);
  const recovered = recoverDiscontinuousQuestionAnchors(
    lines,
    anchors,
    [{
      questionNumber: "12",
      summary: "\u82e5 a:b=1/5:1/3\uff0cb:c=2:7\uff0c\u6c42 a:b:c",
      stemBoxes: [{ x: 0.05, y: 0.38, w: 0.8, h: 0.2 }],
      optionBoxes: [],
      otherBoxes: []
    }],
    800,
    500
  );

  assert.deepEqual(recovered.map((anchor) => anchor.sourceQuestionNumber), ["11", "12", "13"]);
  assert.equal(recovered[1].evidenceSource, "sequence-gap-review+ocr-content+vision");
});

test("recovers a blurred intermediate number from an existing local OCR stem", () => {
  const lines = [
    { text: "2. 已知两个数成比例，请选择正确答案", x: 40, y: 100, w: 620, h: 24, blockIndexes: [0], blocks: [] },
    { text: "有编号为一到十的篮球，请判断下列说法", x: 42, y: 220, w: 600, h: 24, blockIndexes: [1], blocks: [] },
    { text: "4. 如图，请根据图形关系选择正确答案", x: 40, y: 340, w: 620, h: 24, blockIndexes: [2], blocks: [] }
  ];
  const anchors = extractMainQuestionAnchors(lines, 800, 500);
  const recovered = recoverDiscontinuousQuestionAnchors(lines, anchors, [], 800, 500);

  assert.deepEqual(recovered.map((anchor) => anchor.sourceQuestionNumber), ["2", "3", "4"]);
  assert.equal(recovered[1].evidenceSource, "sequence-gap-review+local-ocr-stem");
  assert.equal(recovered[1].startY, 220);
});

test("keeps discontinuous numbering when the missing number has no existing visual evidence", () => {
  const lines = [
    { text: "5. \u5df2\u77e5\u4e00\u4e2a\u51e0\u4f55\u56fe\u5f62\uff0c\u8bf7\u6c42\u9762\u79ef", x: 40, y: 100, w: 500, h: 24, blockIndexes: [0], blocks: [] },
    { text: "7. \u5df2\u77e5\u4e24\u4e2a\u6570\u6210\u6bd4\u4f8b\uff0c\u8bf7\u6c42\u672a\u77e5\u6570", x: 40, y: 300, w: 500, h: 24, blockIndexes: [1], blocks: [] }
  ];
  const anchors = extractMainQuestionAnchors(lines, 800, 500);
  const recovered = recoverDiscontinuousQuestionAnchors(lines, anchors, [], 800, 500);
  assert.deepEqual(recovered.map((anchor) => anchor.sourceQuestionNumber), ["5", "7"]);
});

test("recovers explicit consecutive Q7 and Q8 markers after Q6", () => {
  const marker7 = { text: "7.", x: 40, y: 220, w: 18, h: 22 };
  const stem7 = { text: "已知四个数成比例，求未知数的值", x: 72, y: 221, w: 520, h: 22 };
  const marker8 = { text: "8．", x: 40, y: 340, w: 18, h: 22 };
  const stem8 = { text: "根据题目条件选择正确答案", x: 72, y: 341, w: 500, h: 22 };
  const lines = [
    { text: "6. 如图，请判断两个结论是否正确", x: 40, y: 100, w: 620, h: 24, blockIndexes: [0], blocks: [] },
    { text: marker7.text, ...marker7, blockIndexes: [1], blocks: [marker7] },
    { text: stem7.text, ...stem7, blockIndexes: [2], blocks: [stem7] },
    { text: marker8.text, ...marker8, blockIndexes: [3], blocks: [marker8] },
    { text: stem8.text, ...stem8, blockIndexes: [4], blocks: [stem8] }
  ];
  const anchors = [{
    sourceQuestionNumber: "6",
    questionNumber: "6",
    startY: 100,
    top: 100,
    left: 40,
    text: lines[0].text,
    line: lines[0]
  }];
  const recovered = recoverSequentialExplicitQuestionAnchors(lines, anchors, 800, 500);

  assert.deepEqual(recovered.map((anchor) => anchor.sourceQuestionNumber), ["6", "7", "8"]);
  assert.equal(recovered[1].evidenceSource, "ocr-explicit-marker+sequential-number");
  assert.equal(recovered[2].startY, 340);
});

test("does not turn sub-question markers into consecutive main questions", () => {
  const lines = [
    { text: "6. 已知条件，请完成下面各小问", x: 40, y: 100, w: 620, h: 24, blockIndexes: [0], blocks: [] },
    { text: "（7）求第一种情况", x: 60, y: 220, w: 420, h: 22, blockIndexes: [1], blocks: [] },
    { text: "8）求第二种情况", x: 60, y: 300, w: 420, h: 22, blockIndexes: [2], blocks: [] }
  ];
  const anchors = extractMainQuestionAnchors(lines, 800, 500);
  const recovered = recoverSequentialExplicitQuestionAnchors(lines, anchors, 800, 500);

  assert.deepEqual(recovered.map((anchor) => anchor.sourceQuestionNumber), ["6"]);
});

test("does not invent Q7 when no explicit Q7 marker exists", () => {
  const lines = [
    { text: "6. 已知条件，请完成下面各小问", x: 40, y: 100, w: 620, h: 24, blockIndexes: [0], blocks: [] },
    { text: "继续根据上面的条件进行计算", x: 60, y: 220, w: 520, h: 22, blockIndexes: [1], blocks: [] }
  ];
  const anchors = extractMainQuestionAnchors(lines, 800, 500);
  const recovered = recoverSequentialExplicitQuestionAnchors(lines, anchors, 800, 500);

  assert.deepEqual(recovered.map((anchor) => anchor.sourceQuestionNumber), ["6"]);
});

test("preserves an unresolved missing question inside the previous crop instead of deleting its image content", () => {
  const blocks = [
    { text: "11. Given m and x, solve the equation", x: 40, y: 100, w: 620, h: 24 },
    { text: "13. Read the chart and answer the question", x: 40, y: 350, w: 650, h: 24 }
  ];
  const lines = blocks.map((block, index) => ({
    ...block,
    blockIndexes: [index],
    blocks: [block]
  }));
  const baseAnchors = [
    { sourceQuestionNumber: "11", questionNumber: "11", startY: 100, top: 100, left: 40, text: blocks[0].text, line: lines[0] },
    { sourceQuestionNumber: "13", questionNumber: "13", startY: 350, top: 350, left: 40, text: blocks[1].text, line: lines[1] }
  ];
  const recovered = recoverDiscontinuousQuestionAnchors(lines, baseAnchors, [], 800, 500);
  const bands = buildOcrQuestionBands(blocks, 800, 500, { ocrLines: lines, anchors: recovered });
  const questions = [makeQuestion(11, 95, 80), makeQuestion(13, 345, 100)];
  const finalQuestions = enforceHardQuestionBoundaries(questions, bands, { blocks, width: 800, height: 500 });
  const q11 = finalQuestions.find((question) => question.sourceQuestionNumber === "11");

  assert.deepEqual(finalQuestions.map((question) => question.sourceQuestionNumber), ["11", "13"]);
  assert.deepEqual(q11.mergedUnresolvedQuestionNumbers, ["12"]);
  assert.equal(q11.needsReview, true);
  assert.ok(q11.finalBox.y + q11.finalBox.h >= 340);
  assert.ok(q11.finalBox.y + q11.finalBox.h < bands[1].startY);
});

test("recovers existing visual content above the first reliable question anchor", () => {
  const blocks = [
    { text: "25. A grain store uses a combined solid", x: 70, y: 570, w: 650, h: 30 },
    { text: "26. Complete the next problem", x: 70, y: 1051, w: 650, h: 30 }
  ];
  const anchors = [
    { sourceQuestionNumber: "25", startY: 570, nextStartY: 1051, lineIndexes: [0], text: blocks[0].text },
    { sourceQuestionNumber: "26", startY: 1051, nextStartY: 1706, lineIndexes: [1], text: blocks[1].text }
  ];
  const q25 = makeQuestion(25, 558, 480);
  q25.rawModelBoxes = [{ x: 58, y: 529, w: 1074, h: 360 }];
  const q26 = makeQuestion(26, 1045, 420);
  const finalQuestions = enforceHardQuestionBoundaries(
    [q25, q26],
    anchors,
    { blocks, width: 1200, height: 1706 }
  );
  const recoveredQ25 = finalQuestions.find((question) => question.sourceQuestionNumber === "25");

  assert.ok(recoveredQ25.finalBox.y < 529);
  assert.ok(recoveredQ25.finalBox.y >= 510);
  assert.match(recoveredQ25.validation.join(" "), /顶部/);
});

test("keeps a strong visual Q24 before the first OCR anchor Q25", () => {
  const width = 1200;
  const height = 1706;
  const ocrBands = [
    { sourceQuestionNumber: "25", startY: 570, nextStartY: 1051, lineIndexes: [0], optionLabels: [], text: "25. Current question", box: { x: 70, y: 570, w: 1050, h: 470 } },
    { sourceQuestionNumber: "26", startY: 1051, nextStartY: height, lineIndexes: [1], optionLabels: [], text: "26. Next question", box: { x: 70, y: 1051, w: 1050, h: 620 } }
  ];
  const blocks = [
    { text: "25. Current question", x: 70, y: 570, w: 650, h: 30 },
    { text: "26. Next question", x: 70, y: 1051, w: 650, h: 30 }
  ];
  const visionQuestions = [{
    questionNumber: "24",
    summary: "2023年中国成功发射卫星，已知运行速度和距离，求运行时间",
    type: "解答题",
    stemBoxes: [{ x: 0.0725, y: 0.112, w: 0.813, h: 0.229 }],
    optionBoxes: [],
    otherBoxes: []
  }];
  const normalized = normalizeQuestionRegions(visionQuestions, ocrBands, blocks, width, height);
  const q24 = normalized.find((question) => question.sourceQuestionNumber === "24");

  assert.ok(q24);
  assert.equal(q24.questionRole, "mainQuestion");
  assert.equal(q24.evidenceSource, "vision-structure-before-first-ocr-anchor");
  assert.equal(q24.uncertain, true);
});

test("does not recover upward across a previous main-question anchor", () => {
  const blocks = [
    { text: "24. Previous question", x: 70, y: 300, w: 650, h: 30 },
    { text: "25. Current question", x: 70, y: 570, w: 650, h: 30 },
    { text: "26. Next question", x: 70, y: 1051, w: 650, h: 30 }
  ];
  const anchors = [
    { sourceQuestionNumber: "24", startY: 300, nextStartY: 570, lineIndexes: [0], text: blocks[0].text },
    { sourceQuestionNumber: "25", startY: 570, nextStartY: 1051, lineIndexes: [1], text: blocks[1].text },
    { sourceQuestionNumber: "26", startY: 1051, nextStartY: 1706, lineIndexes: [2], text: blocks[2].text }
  ];
  const q24 = makeQuestion(24, 294, 250);
  const q25 = makeQuestion(25, 558, 480);
  q25.rawModelBoxes = [{ x: 58, y: 529, w: 1074, h: 360 }];
  const q26 = makeQuestion(26, 1045, 420);
  const finalQuestions = enforceHardQuestionBoundaries(
    [q24, q25, q26],
    anchors,
    { blocks, width: 1200, height: 1706 }
  );
  const boundedQ25 = finalQuestions.find((question) => question.sourceQuestionNumber === "25");

  assert.ok(boundedQ25.finalBox.y >= 564);
});

test("does not recover a gap candidate when its existing visual evidence is insufficient", () => {
  const lines = [
    { text: "20. \u5df2\u77e5\u6761\u4ef6\uff0c\u8bf7\u6c42\u51fd\u6570\u503c", x: 40, y: 100, w: 500, h: 24, blockIndexes: [0], blocks: [] },
    { text: "22. \u5df2\u77e5\u6761\u4ef6\uff0c\u8bf7\u6c42\u9762\u79ef", x: 40, y: 350, w: 500, h: 24, blockIndexes: [1], blocks: [] }
  ];
  const anchors = extractMainQuestionAnchors(lines, 800, 500);
  const recovered = recoverDiscontinuousQuestionAnchors(
    lines,
    anchors,
    [{
      questionNumber: "21",
      summary: "\u56fe\u5f62\u533a\u57df",
      stemBoxes: [{ x: 0.05, y: 0.48, w: 0.8, h: 0.08 }],
      optionBoxes: [],
      otherBoxes: []
    }],
    800,
    500
  );
  assert.deepEqual(recovered.map((anchor) => anchor.sourceQuestionNumber), ["20", "22"]);
});

test("recovers a missing OCR line when an existing visual result has a valid numbered question structure in the gap", () => {
  const lines = [
    { text: "30. \u5df2\u77e5\u4e8c\u5143\u4e00\u6b21\u65b9\u7a0b\uff0c\u8bf7\u6c42\u53c2\u6570", x: 40, y: 100, w: 620, h: 24, blockIndexes: [0], blocks: [] },
    { text: "32. \u5982\u56fe\uff0c\u8bf7\u6839\u636e\u8868\u683c\u56de\u7b54\u95ee\u9898", x: 40, y: 340, w: 620, h: 24, blockIndexes: [1], blocks: [] }
  ];
  const anchors = extractMainQuestionAnchors(lines, 800, 500);
  const recovered = recoverDiscontinuousQuestionAnchors(
    lines,
    anchors,
    [{
      questionNumber: "31",
      summary: "\u82e5 a:b=1:2\uff0cb:c=2:3\uff0c\u6c42 a:b:c",
      stemBoxes: [{ x: 0.05, y: 0.4, w: 0.8, h: 0.16 }],
      optionBoxes: [],
      otherBoxes: []
    }],
    800,
    500
  );
  assert.deepEqual(recovered.map((anchor) => anchor.sourceQuestionNumber), ["30", "31", "32"]);
  assert.equal(recovered[1].evidenceSource, "sequence-gap-review+vision-structure");
});

test("keeps subquestions under Q25 as one main-question anchor", () => {
  const blocks = [
    { text: "25. \u5df2\u77e5\u4e00\u4e2a\u51fd\u6570\uff0c\u8bf7\u6839\u636e\u6761\u4ef6\u56de\u7b54\u95ee\u9898", x: 40, y: 100, w: 600, h: 24 },
    { text: "\uff081\uff09\u6c42\u51fd\u6570\u89e3\u6790\u5f0f", x: 70, y: 150, w: 300, h: 24 },
    { text: "\uff082\uff09\u8bc1\u660e\u8be5\u51fd\u6570\u7684\u6027\u8d28", x: 70, y: 200, w: 360, h: 24 }
  ];
  const lines = groupOcrBlocksIntoLines(blocks, 800, 400);
  const anchors = extractMainQuestionAnchors(lines, 800, 400);
  assert.deepEqual(anchors.map((anchor) => anchor.sourceQuestionNumber), ["25"]);
});

test("does not treat figure labels, table labels, or formulas as main-question anchors", () => {
  const blocks = [
    { text: "\u56fe1", x: 40, y: 100, w: 80, h: 24 },
    { text: "\u88682", x: 40, y: 150, w: 80, h: 24 },
    { text: "3x+1=7", x: 40, y: 200, w: 120, h: 24 }
  ];
  const lines = groupOcrBlocksIntoLines(blocks, 800, 400);
  const anchors = extractMainQuestionAnchors(lines, 800, 400);
  assert.deepEqual(anchors, []);
});

test("recursively splits a final crop until every crop contains at most one main anchor", () => {
  const { anchors } = splitOneLargeCandidate([36, 37, 38]);
  const oversized = makeQuestion(36, 95, 365);
  oversized.finalBox = { x: 30, y: 95, w: 720, h: 365 };
  const questions = splitQuestionsUntilSingleMainQuestion(
    [oversized],
    anchors,
    { blocks: [], width: 800, height: 500, boundaryGap: 3, topPadding: 4 }
  );
  validateSingleMainQuestionPerCrop(questions, anchors);
  assert.deepEqual(questions.map((question) => question.sourceQuestionNumber), ["36", "37", "38"]);
  assert.ok(questions.every((question) => question.finalBox.h > 80));
});

test("enforces Q2/Q3/Q4 hard boundaries and rebuilds Q3 from a real anchor", () => {
  const anchors = [
    { questionNumber: 2, top: 100 },
    { questionNumber: 3, top: 400 },
    { questionNumber: 4, top: 600 }
  ];
  const questions = [
    {
      ...makeQuestion(2, 100, 430),
      finalBox: { x: 30, y: 100, w: 720, h: 430 }
    },
    {
      ...makeQuestion(4, 600, 200),
      finalBox: { x: 30, y: 600, w: 720, h: 200 }
    }
  ];

  const finalQuestions = enforceHardQuestionBoundaries(questions, anchors, {
    height: 900,
    boundaryGap: 3
  });
  validateFinalQuestionBoxes(finalQuestions, anchors);

  assert.deepEqual(finalQuestions.map((question) => Number(question.sourceQuestionNumber)), [2, 3, 4]);
  const q2 = finalQuestions.find((question) => String(question.sourceQuestionNumber) === "2");
  const q3 = finalQuestions.find((question) => String(question.sourceQuestionNumber) === "3");
  assert.ok(q2.finalBox.y + q2.finalBox.h < q3.finalBox.y);
  assert.equal(q3.generatedFrom, "ocr-anchor");
  assert.ok(q3.finalBox.y < 400);
  assert.ok(q3.finalBox.y >= 395);
  const q4 = finalQuestions.find((question) => String(question.sourceQuestionNumber) === "4");
  assert.ok(q3.finalBox.y + q3.finalBox.h < q4.finalBox.y);
});

test("adds bottom safety padding for Q17 formula content without crossing Q18", () => {
  const anchors = [
    { questionNumber: 17, top: 600 },
    { questionNumber: 18, top: 720 }
  ];
  const q17 = {
    ...makeQuestion(17, 600, 90),
    finalBox: { x: 30, y: 600, w: 720, h: 90 },
    ocrLineBoxes: [
      { text: "V=12cm³", x: 50, y: 670, w: 240, h: 20 }
    ],
    rawModelBoxes: []
  };
  const q18 = {
    ...makeQuestion(18, 720, 100),
    finalBox: { x: 30, y: 720, w: 720, h: 100 },
    ocrLineBoxes: [
      { text: "18. 下一道题", x: 50, y: 720, w: 300, h: 20 }
    ],
    rawModelBoxes: []
  };

  const finalQuestions = enforceHardQuestionBoundaries([q17, q18], anchors, {
    height: 900,
    boundaryGap: 3,
    topPadding: 4
  });
  validateFinalQuestionBoxes(finalQuestions, anchors);

  const finalQ17 = finalQuestions.find((question) => String(question.sourceQuestionNumber) === "17");
  const finalQ18 = finalQuestions.find((question) => String(question.sourceQuestionNumber) === "18");
  const q17Bottom = finalQ17.finalBox.y + finalQ17.finalBox.h;
  assert.ok(q17Bottom - 690 >= 12);
  assert.ok(q17Bottom < finalQ18.finalBox.y);
  assert.ok(finalQ17.bottomPadding >= 12);
});

test("keeps a non-final question through the full interval before the next anchor", () => {
  const anchors = [
    { questionNumber: 13, top: 100 },
    { questionNumber: 14, top: 220 }
  ];
  const q13 = {
    ...makeQuestion(13, 100, 40),
    ocrLineBoxes: [{ text: "13. 题干", x: 40, y: 100, w: 500, h: 24 }]
  };
  const q14 = makeQuestion(14, 220, 80);
  const finalQuestions = enforceHardQuestionBoundaries([q13, q14], anchors, {
    height: 400,
    width: 800,
    boundaryGap: 5,
    topPadding: 4
  });
  const finalQ13 = finalQuestions.find((question) => String(question.sourceQuestionNumber) === "13");

  assert.equal(finalQ13.finalBox.y + finalQ13.finalBox.h, 215);
});

test("recovers a suspiciously narrow crop from stable neighboring question widths", () => {
  const anchors = [
    { questionNumber: 13, top: 100 },
    { questionNumber: 14, top: 220 },
    { questionNumber: 15, top: 340 }
  ];
  const q13 = { ...makeQuestion(13, 100, 80), finalBox: { x: 100, y: 100, w: 900, h: 80 } };
  const q14 = { ...makeQuestion(14, 220, 60), finalBox: { x: 110, y: 220, w: 390, h: 60 } };
  const q15 = { ...makeQuestion(15, 340, 100), finalBox: { x: 105, y: 340, w: 910, h: 100 } };
  const finalQuestions = enforceHardQuestionBoundaries([q13, q14, q15], anchors, {
    height: 600,
    width: 1200,
    boundaryGap: 5,
    topPadding: 4
  });
  const finalQ14 = finalQuestions.find((question) => String(question.sourceQuestionNumber) === "14");

  assert.ok(finalQ14.finalBox.w >= 890);
});

test("ignores a vision box that crosses Q18 and keeps the full Q17 bottom at the anchor edge", () => {
  const anchors = [
    { questionNumber: 17, top: 1130 },
    { questionNumber: 18, top: 1285 }
  ];
  const q17 = {
    ...makeQuestion(17, 1118, 158),
    finalBox: { x: 109, y: 1118, w: 1097, h: 158 },
    ocrLineBoxes: [
      { text: "这个圆柱形铁块的体积为10πcm³", x: 130, y: 1260, w: 760, h: 25 }
    ],
    rawModelBoxes: [
      { x: 137, y: 947, w: 1050, h: 356 }
    ]
  };
  const q18 = {
    ...makeQuestion(18, 1273, 300),
    finalBox: { x: 106, y: 1273, w: 1100, h: 300 },
    ocrLineBoxes: [
      { text: "18. 下一道题", x: 130, y: 1285, w: 500, h: 24 }
    ],
    rawModelBoxes: []
  };

  const finalQuestions = enforceHardQuestionBoundaries([q17, q18], anchors, {
    height: 1706,
    boundaryGap: 9,
    topPadding: 6
  });
  validateFinalQuestionBoxes(finalQuestions, anchors);

  const finalQ17 = finalQuestions.find((question) => String(question.sourceQuestionNumber) === "17");
  const finalQ18 = finalQuestions.find((question) => String(question.sourceQuestionNumber) === "18");
  assert.equal(finalQ17.contentBottom, 1285);
  assert.equal(finalQ17.finalBox.y + finalQ17.finalBox.h, 1285);
  assert.equal(finalQ18.finalBox.y, 1285);
});

test("corrects guidance that illegally reorders four proportional terms", () => {
  const corrected = enforceOrderedProportionConvention(
    {
      shouldSpeak: true,
      speech: "题目没有规定这四个数的顺序，把6放在分子写成2:3=6:x，还能得到另一个答案。",
      hintLevel: "light",
      formulaOrStep: "2:3=6:x",
      askStudentToRepeat: true,
      studentAction: "再试一种顺序。",
      lectureComplete: false
    },
    {
      problemText: "已知 2、3、x、6 成比例，求 x 的值。",
      transcript: "我按2:3=x:6算出x=4。",
      latestStudentSpeech: "答案是4"
    }
  );

  assert.match(corrected.speech, /题目给出的顺序|二比三等于 x 比六/);
  assert.match(corrected.speech, /四是正确的/);
  assert.equal(corrected.formulaOrStep, "2:3=x:6，x=4");
  assert.equal(corrected.askStudentToRepeat, false);
  assert.doesNotMatch(corrected.speech, /没有规定|另一个答案/);
});

test("does not carry old proportion guidance into a different current problem", () => {
  const original = {
    shouldSpeak: true,
    speech: "我们检查圆心角是360度的几分之几。",
    hintLevel: "light",
    formulaOrStep: "360×1/8",
    askStudentToRepeat: false,
    studentAction: "接着讲圆心角。",
    lectureComplete: false
  };
  const corrected = enforceOrderedProportionConvention(original, {
    problemText: "这个扇形的面积是所在圆面积的1/8，求圆心角。",
    transcript: "上一题我按2:3=x:6算出x=4。",
    latestStudentSpeech: "45度",
    knowledgePoints: ["圆心角"]
  });

  assert.equal(corrected.speech, original.speech);
  assert.equal(corrected.formulaOrStep, original.formulaOrStep);
});

test("accepts only equivalent answers from the independent solver and verifier", () => {
  assert.equal(answerValuesEquivalent("x=4", "答案是4"), true);
  assert.equal(answerValuesEquivalent("1/2", "0.5"), true);
  assert.equal(answerValuesEquivalent("4", "-4"), false);

  assert.equal(
    answerKeyResultsAgree(
      { canonicalAnswer: "x=4", acceptedAnswers: ["4"] },
      { independentlySolvedAnswer: "4", acceptedAnswers: ["x=4"] }
    ),
    true
  );
  assert.equal(
    answerKeyResultsAgree(
      { canonicalAnswer: "x=4", acceptedAnswers: [] },
      { independentlySolvedAnswer: "x=-4", acceptedAnswers: [] }
    ),
    false
  );
});

test("preserves the meaning of a choice letter instead of comparing the letter alone", () => {
  const solver = {
    questionType: "选择题",
    problemText: "下列说法正确的是",
    choiceAnalysis: {
      options: [
        { label: "A", text: "I、II都对" },
        { label: "B", text: "I对，II不对" },
        { label: "C", text: "I不对，II对" },
        { label: "D", text: "I、II都不对" }
      ],
      statementVerdicts: [
        { id: "I", text: "结论I", correct: false, evidence: "代入检验不成立" },
        { id: "II", text: "结论II", correct: true, evidence: "由定义可得" }
      ],
      selectedOption: "C",
      selectedOptionText: "I不对，II对"
    }
  };
  const sameMeaning = {
    ...solver,
    choiceAnalysis: {
      ...solver.choiceAnalysis,
      selectedOption: "C",
      selectedOptionText: "I不对，II对"
    }
  };
  const wrongMeaning = {
    ...solver,
    choiceAnalysis: {
      ...solver.choiceAnalysis,
      selectedOption: "C",
      selectedOptionText: "I对，II不对",
      statementVerdicts: [
        { id: "I", text: "结论I", correct: true, evidence: "错误复核" },
        { id: "II", text: "结论II", correct: false, evidence: "错误复核" }
      ]
    }
  };

  assert.equal(choiceAnalysesAgree(solver, sameMeaning), true);
  assert.equal(choiceAnalysesAgree(solver, wrongMeaning), false);
});

test.skip("legacy single-problem local answer override is disabled", () => {
  const key = deterministicArrowDifferenceAnswerKey(
    "如图，约定：上方相邻的左数与右数之差等于这两数下方箭头共同指向的数。图中有 x、2y、3x、m、n 和 8。结论 I：若 m 的值为 3，则 y 的值为 4；结论 II：不论 m、n 取何值，x-y 的值一定为 2。下列说法正确的是 A. I，II 都对 B. I 对，II 不对 C. I 不对，II 对 D. I，II 都不对"
  );

  assert.equal(key.trusted, true);
  assert.equal(key.canonicalAnswer, "C");
  assert.equal(studentAnswerMatchesVerifiedKey("选C", key), true);
  assert.equal(studentAnswerMatchesVerifiedKey("选A", key), false);
  assert.deepEqual(
    guideContradictsVerifiedAnswer(
      { speech: "两个结论都对，应该选 A，而不是 C。" },
      key
    ).map((claim) => claim.raw),
    ["A", "not:C"]
  );
  assert.deepEqual(
    guideContradictsVerifiedAnswer(
      { speech: "\u800c\u4e0d\u662f C" },
      key
    ).map((claim) => claim.raw),
    ["not:C"]
  );
});

test("treats spoken Chinese zero as equivalent to m=0", () => {
  const answerKey = {
    trusted: true,
    canonicalAnswer: "m=0",
    acceptedAnswers: ["0"]
  };

  assert.equal(answerValuesEquivalent("M等于零", "m=0"), true);
  assert.equal(studentAnswerMatchesVerifiedKey("M等于零", answerKey), true);
  assert.equal(answerValuesEquivalent("m为负二", "m=-2"), true);
});

test("does not mark statement-check refutation steps wrong on vague condition mismatch", () => {
  const answerKey = {
    trusted: true,
    problemText: "\u4e0b\u5217\u8bf4\u6cd5\u6b63\u786e\u7684\u662f\uff1a\u7ed3\u8bba I\uff0c\u7ed3\u8bba II\u3002",
    canonicalAnswer: "C",
    acceptedAnswers: ["I\u4e0d\u5bf9\uff0cII\u5bf9"],
    solutionOutline: ["\u5bf9\u7ed3\u8bba I \u4ee3\u5165\u68c0\u67e5\uff0c\u63a8\u51fa\u53cd\u4f8b\u503c\u3002"],
    verificationChecks: ["\u53cd\u4f8b\u63a8\u5bfc\u53ef\u7528\u6765\u5224\u65ad\u7ed3\u8bba\u4e0d\u6210\u7acb\u3002"]
  };

  const vague = applyStatementEvaluationSafety(
    {
      calculationStatus: "wrong",
      calculationCheck: "\u677f\u4e66\u63a8\u51fa y=-1\uff0c\u4e0e\u9898\u76ee\u6761\u4ef6\u4e0d\u7b26\u3002",
      confidence: 0.92
    },
    answerKey
  );
  assert.equal(vague.calculationStatus, "unclear");

  const concrete = applyStatementEvaluationSafety(
    {
      calculationStatus: "wrong",
      calculationCheck: "\u8fd9\u4e00\u6b65\u7b26\u53f7\u9519\uff0c\u6b63\u8d1f\u53f7\u5904\u7406\u6709\u95ee\u9898\u3002",
      confidence: 0.92
    },
    answerKey
  );
  assert.equal(concrete.calculationStatus, "wrong");
});

test("fails closed when a math judgment has no verified answer key", () => {
  const safe = makeUnverifiedGuideSafe({
    shouldSpeak: true,
    speech: "你算出的4是正确的。",
    hintLevel: "encourage",
    formulaOrStep: "x=4",
    askStudentToRepeat: false,
    studentAction: "继续。",
    lectureComplete: true
  });

  assert.match(safe.speech, /重新核对|再检查/);
  assert.equal(safe.formulaOrStep, "");
  assert.equal(safe.lectureComplete, false);
  assert.doesNotMatch(safe.speech, /正确/);
});

test("allows a correct verdict only when the student answer matches the verified key", () => {
  const key = {
    trusted: true,
    canonicalAnswer: "x=4",
    acceptedAnswers: ["4", "x等于4"]
  };
  assert.equal(studentAnswerMatchesVerifiedKey("最后答案是4", key), true);
  assert.equal(studentAnswerMatchesVerifiedKey("最后答案是-4", key), false);
  assert.equal(studentAnswerMatchesVerifiedKey("最后答案是5", key), false);
  assert.equal(studentAnswerMatchesVerifiedKey("最后答案是4", { ...key, trusted: false }), false);
});

test("uses the latest wrong handwriting result to guide from the actual mistake", () => {
  const result = applyLatestHandwritingConsistency(
    {
      shouldSpeak: true,
      speech: "这个比例式是正确的，继续算 x=4。",
      hintLevel: "light",
      formulaOrStep: "x=4",
      lectureComplete: false
    },
    {
      eventType: "check",
      latestHandwritingResult: {
        calculationStatus: "wrong",
        confidence: 0.9,
        issueSummary: "减法符号写反了",
        errorLocation: "第二行减号",
        errorEvidence: "第二行把减号写成了加号",
        guidance: "先重新检查两边相减时的符号。",
        expectedNextStep: "重新检查符号"
      }
    }
  );

  assert.equal(result.speech, "先重新检查两边相减时的符号。");
  assert.equal(result.askStudentToRepeat, true);
  assert.equal(result.lectureComplete, false);
});

test("asks for board evidence when the student only speaks", () => {
  const result = applyLatestHandwritingConsistency(
    {
      shouldSpeak: true,
      speech: "可以直接算出答案。",
      hintLevel: "light",
      lectureComplete: false
    },
    {
      eventType: "thought_complete",
      hasBoardInk: false,
      latestStudentSpeech: "我算出答案等于4"
    }
  );

  assert.match(result.speech, /写在黑板上/);
  assert.equal(result.lectureComplete, false);
});

test("also asks for board evidence when a choice answer is spoken", () => {
  const result = applyLatestHandwritingConsistency(
    {
      shouldSpeak: true,
      speech: "我来核对这个选项。",
      hintLevel: "light",
      lectureComplete: false
    },
    {
      eventType: "answer_to_lian_question",
      questionType: "选择题",
      hasBoardInk: false,
      latestStudentSpeech: "答案是C选项"
    }
  );

  assert.match(result.speech, /写在黑板上/);
  assert.equal(result.lectureComplete, false);
});

test("does not contradict a latest correct handwriting result", () => {
  const result = applyLatestHandwritingConsistency(
    {
      shouldSpeak: true,
      speech: "这一步算错了，需要重新检查。",
      hintLevel: "light",
      lectureComplete: false
    },
    {
      eventType: "check",
      latestHandwritingResult: {
        calculationStatus: "correct",
        completedSteps: []
      }
    }
  );

  assert.equal(result.shouldSpeak, false);
  assert.equal(result.speech, "");
  assert.equal(result.hintLevel, "encourage");
});

test("avoids a definitive judgment while new board strokes await recognition", () => {
  const result = applyLatestHandwritingConsistency(
    {
      shouldSpeak: true,
      speech: "你的最后一步是错误的。",
      lectureComplete: false
    },
    {
      eventType: "silence",
      boardPendingRecognition: true,
      latestHandwritingResult: {
        calculationStatus: "correct"
      }
    }
  );

  assert.match(result.speech, /等板书识别更新/);
  assert.equal(result.hintLevel, "light");
  assert.equal(result.lectureComplete, false);
});

test("accepts a real board step but rejects an isolated final answer", () => {
  assert.equal(isOnlyDirectAnswerWriting("x = 4"), true);
  assert.equal(isOnlyDirectAnswerWriting("答案是 C"), true);
  assert.equal(isOnlyDirectAnswerWriting("2:3=x:6"), false);
  assert.equal(isOnlyDirectAnswerWriting("3x=12"), false);
  assert.equal(isOnlyDirectAnswerWriting("S=πr²"), false);
});
