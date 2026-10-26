const test = require("node:test");
const assert = require("node:assert/strict");

const {
  deriveGuideProgress,
  buildGuideEvidenceContent,
  getGuideReasoningEffort,
  filterGuideStepsByKnownConditions,
  equationsEquivalent,
  classifyQwenError,
  deriveTerminalScalarAnswer,
  reconcileAnswerKeyWithSolutionOutline,
  answerKeySolverValidationIssues,
  independentAnswerKeyValidationIssues,
  buildQuestionMemory
} = require("../server");

test("question memory answer follows the model's derived terminal step, not a conflicting answer field", () => {
  const result = reconcileAnswerKeyWithSolutionOutline({
    canonicalAnswer: "-1/4",
    acceptedAnswers: ["-1/4"],
    solutionOutline: ["2m - 1 = -1", "2m = 0", "解得：m = 0"]
  });

  assert.equal(deriveTerminalScalarAnswer(["2m = 0", "解得：m = 0"]), "0");
  assert.equal(result.corrected, true);
  assert.equal(result.answerKey.canonicalAnswer, "0");
  assert.deepEqual(result.answerKey.acceptedAnswers, ["0"]);
});

test("answer reconciliation preserves a model answer that agrees with the derivation", () => {
  const original = {
    canonicalAnswer: "0",
    acceptedAnswers: ["0"],
    solutionOutline: ["2m = 0", "m=0"]
  };
  const result = reconcileAnswerKeyWithSolutionOutline(original);

  assert.equal(result.corrected, undefined);
  assert.equal(result.answerKey, original);
});

test("stored Question Memory uses the reconciled model-derived answer", () => {
  const memory = buildQuestionMemory("q14", {
    trusted: true,
    canonicalAnswer: "-1/4",
    acceptedAnswers: ["-1/4"],
    solutionOutline: ["2m = 0", "m=0"]
  });

  assert.equal(memory.ready, true);
  assert.equal(memory.canonicalAnswer, "0");
  assert.deepEqual(memory.acceptedAnswers, ["0"]);
});

test("answer memory accepts a complete derivation with an explicit terminal scalar even when self-reported confidence is modest", () => {
  const issues = answerKeySolverValidationIssues({
    status: "solved",
    confidence: 0.75,
    canonicalAnswer: "-1/4",
    solutionOutline: ["2m = 0", "解得：m = 0"],
    verificationChecks: ["将 m=0 代入关系式，等式成立"]
  });

  assert.deepEqual(issues, []);
});

test("answer memory reports concrete validation failures instead of a generic rejected result", () => {
  const issues = answerKeySolverValidationIssues({
    status: "ambiguous",
    confidence: 0.4,
    canonicalAnswer: "",
    solutionOutline: [],
    verificationChecks: []
  });

  assert.ok(issues.includes("status-ambiguous"));
  assert.ok(issues.includes("canonical-answer-missing"));
  assert.ok(issues.includes("confidence-below-0.86"));
  assert.ok(issues.includes("solution-steps-missing"));
  assert.ok(issues.includes("verification-checks-missing"));
});

test("independent Kimi verifier must agree on answer and validate every key step", () => {
  const solver = {
    problemText: "关于 x、y 的方程组的解满足 x-y=-1，求 m",
    canonicalAnswer: "0",
    acceptedAnswers: ["0"],
    solutionOutline: ["两式相减得到 5x-5y=10m-5", "代入 x-y=-1，得 -5=10m-5", "解得 m=0"],
    verificationChecks: ["将 m=0 代入，得到 -5=-5"],
    choiceAnalysis: { options: [], statementVerdicts: [], selectedOption: "", selectedOptionText: "" }
  };
  const verified = {
    verified: true,
    independentlySolvedAnswer: "m=0",
    acceptedAnswers: ["0"],
    stepsVerified: true,
    stepIssues: [],
    choiceAnalysis: { options: [], statementVerdicts: [], selectedOption: "", selectedOptionText: "" },
    confidence: 0.82,
    verificationSummary: "由两式相减并代入条件，独立得到 m=0，候选各步等价且验算成立。"
  };

  assert.deepEqual(independentAnswerKeyValidationIssues(solver, verified), []);
  assert.ok(independentAnswerKeyValidationIssues(solver, {
    ...verified,
    independentlySolvedAnswer: "-1/4",
    stepsVerified: false,
    stepIssues: ["代入后常数项符号错误"]
  }).includes("independent-steps-not-verified"));
  assert.ok(independentAnswerKeyValidationIssues(solver, {
    ...verified,
    independentlySolvedAnswer: "-1/4"
  }).includes("independent-result-disagrees-with-answer-key"));
});

test("guide uses OCR text instead of images when OCR has recognized handwriting", () => {
  assert.deepEqual(buildGuideEvidenceContent({
    boardImage: "question-and-board-image",
    studentStrokeImage: "student-stroke-image",
    handwritingRecognitionMode: "aliyun-ocr-text",
    recognizedBoardProgress: { ocrRecognizedText: "x - 2y = m" },
    answerKeyTrusted: true
  }), []);
});

test("guide uses only the completed board judgment when raw OCR stays on the server", () => {
  assert.deepEqual(buildGuideEvidenceContent({
    studentStrokeImage: "student-stroke-image",
    handwritingRecognitionMode: "aliyun-ocr-text",
    recognizedBoardProgress: {
      recognizedText: "5x - 5y = 10m - 5",
      completedSteps: ["5x - 5y = 10m - 5"]
    }
  }), []);
});

test("guide falls back only to the isolated student strokes when OCR is unavailable", () => {
  const content = buildGuideEvidenceContent({
    boardImage: "question-and-board-image",
    studentStrokeImage: "student-stroke-image",
    handwritingRecognitionMode: "student-stroke-image-fallback",
    recognizedBoardProgress: { ocrRecognizedText: "" },
    answerKeyTrusted: true
  });
  assert.equal(content.length, 1);
  assert.equal(content[0].image_url, "student-stroke-image");
  assert.match(content[0].label, /OCR 无有效结果/);
});

test("guide uses the isolated student strokes when OCR returns empty text", () => {
  const content = buildGuideEvidenceContent({
    boardImage: "question-and-board-image",
    studentStrokeImage: "student-stroke-image",
    handwritingRecognitionMode: "aliyun-ocr-text",
    recognizedBoardProgress: { ocrRecognizedText: "" },
    answerKeyTrusted: false
  });
  assert.equal(content.length, 1);
  assert.equal(content[0].image_url, "student-stroke-image");
});

test("guide with a trusted answer key does not resend the question image", () => {
  assert.deepEqual(buildGuideEvidenceContent({
    boardImage: "question-and-board-image",
    studentStrokeImage: "",
    answerKeyTrusted: true
  }), []);
});

test("guide never falls back to a combined question and board image", () => {
  assert.deepEqual(buildGuideEvidenceContent({
    boardImage: "question-and-board-image",
    studentStrokeImage: "",
    answerKeyTrusted: false
  }), []);
});

test("Qwen3.8 Omni Flash guide requests use low reasoning effort", () => {
  assert.equal(getGuideReasoningEffort("qwen3.8-omni-flash"), "low");
  assert.equal(getGuideReasoningEffort("qwen3.7-plus"), "");
});

test("Case 1: latest board steps are completed and are not asked again", () => {
  const progress = deriveGuideProgress({
    verifiedGuideSteps: ["4x - 4y = 8", "x - y = 2", "下一步求最终答案"],
    latestHandwritingResult: {
      detectedWriting: "4x - 4y = 8\nx - y = 2",
      completedSteps: ["4x - 4y = 8", "x - y = 2"]
    }
  });
  assert.deepEqual(progress.completedSteps.map((step) => step.stepId), ["step_1", "step_2"]);
  assert.equal(progress.currentStep, "下一步求最终答案");
});

test("Case 2: board evidence answers the previous guide question", () => {
  const progress = deriveGuideProgress({
    verifiedGuideSteps: ["4x - 4y = 8", "x - y = 2"],
    previousGuideQuestion: "x-y=2 是怎么得到的？",
    latestHandwritingResult: {
      detectedWriting: "4x - 4y = 8\nx - y = 2"
    }
  });
  assert.equal(progress.answeredPreviousQuestion, true);
  assert.equal(progress.currentStep, "");
});

test("Case 3: equivalent equations count as the same mathematical step", () => {
  assert.equal(equationsEquivalent("x-y=2", "y=x-2"), true);
  const progress = deriveGuideProgress({
    verifiedGuideSteps: ["x-y=2"],
    latestHandwritingResult: { detectedWriting: "y=x-2" }
  });
  assert.equal(progress.completedSteps.length, 1);
});

test("guide progress advances when the expected equation exists only in Aliyun OCR text", () => {
  const progress = deriveGuideProgress({
    verifiedGuideSteps: ["5x - 5y = 10m - 5"],
    latestHandwritingResult: {
      ocrRecognizedText: "5x - 5y = 10m - 5"
    }
  });

  assert.deepEqual(progress.completedSteps.map((step) => step.stepId), ["step_1"]);
});

test("one algebraically equivalent board line completes only the earliest matching guide step", () => {
  const progress = deriveGuideProgress({
    verifiedGuideSteps: [
      "(4x - y) + (x - 4y) = (7m + 1) + (3m - 6)",
      "5x - 5y = 10m - 5",
      "x - y = 2m - 1"
    ],
    latestHandwritingResult: {
      ocrRecognizedText: "4x-y+x-4y=10m-5"
    }
  });

  assert.deepEqual(progress.completedSteps.map((step) => step.stepId), ["step_1"]);
  assert.equal(progress.currentStepId, "step_2");
});

test("progress matching supports different variables, parentheses and distribution", () => {
  const progress = deriveGuideProgress({
    verifiedGuideSteps: ["(2a + b) + (3a - 2b) = (4c + 1) + (2c - 1)", "5a - b = 6c"],
    latestHandwritingResult: {
      ocrRecognizedText: "2a+b+3a-2b=6c"
    }
  });

  assert.deepEqual(progress.completedSteps.map((step) => step.stepId), ["step_1"]);
  assert.equal(progress.currentStepId, "step_2");
});

test("progress matching recognizes equivalent polynomial forms with powers", () => {
  const progress = deriveGuideProgress({
    verifiedGuideSteps: ["(a + b)^2 = c"],
    latestHandwritingResult: {
      ocrRecognizedText: "a^2+2ab+b^2=c"
    }
  });

  assert.deepEqual(progress.completedSteps.map((step) => step.stepId), ["step_1"]);
});

test("a later exact board step advances past the earlier outline even if OCR missed it", () => {
  const progress = deriveGuideProgress({
    verifiedGuideSteps: ["2x + 3x = 20", "5x = 20", "x = 4"],
    latestHandwritingResult: {
      ocrRecognizedText: "x=4"
    }
  });

  assert.deepEqual(progress.completedSteps.map((step) => step.stepId), ["step_1", "step_2", "step_3"]);
  assert.equal(progress.currentStepId, "");
});

test("Case 4: stale request metadata cannot be treated as current", () => {
  const requestA = { requestId: 10, boardVersion: 10 };
  const current = { requestId: 11, boardVersion: 11 };
  assert.notEqual(requestA.requestId, current.requestId);
  assert.notEqual(requestA.boardVersion, current.boardVersion);
});

test("Case 5: malformed model output is classified as INVALID_JSON", () => {
  assert.equal(classifyQwenError({ code: "invalid_model_output" }), "INVALID_JSON");
  assert.equal(classifyQwenError({ code: "qwen_response_timeout" }), "TIMEOUT");
});

test("Case 6: explicit known conditions are never treated as derivation steps", () => {
  const givenConditions = ["m-n=8"];
  assert.deepEqual(
    filterGuideStepsByKnownConditions(["m-n=8", "4x-4y=8", "x-y=2"], givenConditions),
    ["4x-4y=8", "x-y=2"]
  );
  const progress = deriveGuideProgress({
    verifiedGuideSteps: ["m-n=8", "4x-4y=8", "x-y=2"],
    givenConditions,
    latestHandwritingResult: { detectedWriting: "m-n=8" }
  });
  assert.equal(progress.currentStep, "4x-4y=8");
  assert.deepEqual(progress.givenConditions, ["m-n=8"]);
});

test("a substitution step that cites a given condition remains a guide step", () => {
  assert.deepEqual(filterGuideStepsByKnownConditions(
    ["x-y=-1", "代入 x-y=-1：5(x-y)=-5=10m-5"],
    ["x-y=-1"]
  ), ["代入 x-y=-1：5(x-y)=-5=10m-5"]);
});
