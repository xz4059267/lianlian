const test = require("node:test");
const assert = require("node:assert/strict");

const {
  groupOcrBlocksIntoLines,
  mergeDetachedQuestionNumberLines,
  extractMainQuestionAnchors,
  recoverNumberMarkerAnchors,
  recoverDiscontinuousQuestionAnchors,
  buildOcrQuestionBands,
  normalizeQuestionRegions,
  reconcileQuestionsWithOcrAnchors,
  enforceHardQuestionBoundaries,
  validateFinalQuestionBoxes,
  validateSingleMainQuestionPerCrop,
  splitQuestionCandidatesByMainQuestionAnchors,
  splitQuestionsUntilSingleMainQuestion
} = require("../server.js");

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

test("keeps discontinuous numbering when the missing number has no existing visual evidence", () => {
  const lines = [
    { text: "5. \u5df2\u77e5\u4e00\u4e2a\u51e0\u4f55\u56fe\u5f62\uff0c\u8bf7\u6c42\u9762\u79ef", x: 40, y: 100, w: 500, h: 24, blockIndexes: [0], blocks: [] },
    { text: "7. \u5df2\u77e5\u4e24\u4e2a\u6570\u6210\u6bd4\u4f8b\uff0c\u8bf7\u6c42\u672a\u77e5\u6570", x: 40, y: 300, w: 500, h: 24, blockIndexes: [1], blocks: [] }
  ];
  const anchors = extractMainQuestionAnchors(lines, 800, 500);
  const recovered = recoverDiscontinuousQuestionAnchors(lines, anchors, [], 800, 500);
  assert.deepEqual(recovered.map((anchor) => anchor.sourceQuestionNumber), ["5", "7"]);
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
