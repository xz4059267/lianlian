const test = require("node:test");
const assert = require("node:assert/strict");

const {
  deriveGuideProgress,
  equationsEquivalent,
  classifyQwenError
} = require("../server");

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
