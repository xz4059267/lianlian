const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isConcreteGuideResult,
  isValidHandwritingResult,
  raceQwenStructuredModels
} = require("../server.js");

test("guide validator rejects empty and generic failure messages", () => {
  assert.equal(isConcreteGuideResult({ shouldSpeak: true, speech: "" }, { eventType: "silence" }), false);
  assert.equal(
    isConcreteGuideResult({ shouldSpeak: true, speech: "接口暂时没有返回，请稍后再试。" }, { eventType: "silence" }),
    false
  );
  assert.equal(
    isConcreteGuideResult(
      { shouldSpeak: true, speech: "先把两个已知量写成关系式。", formulaOrStep: "x - 2y = m" },
      { eventType: "silence" }
    ),
    true
  );
});

test("handwriting validator rejects uncertain empty output", () => {
  assert.equal(
    isValidHandwritingResult({
      detectedWriting: "",
      mathExpression: "",
      writingState: "unclear",
      calculationStatus: "unclear",
      confidence: 0.2
    }),
    false
  );
  assert.equal(
    isValidHandwritingResult({
      detectedWriting: "x=1",
      mathExpression: "x=1",
      writingState: "uncertain",
      confidence: 0.92
    }),
    false
  );
  assert.equal(
    isValidHandwritingResult({
      detectedWriting: "x - 2y = m",
      mathExpression: "x - 2y = m",
      writingState: "in_progress",
      calculationStatus: "incomplete",
      completedSteps: ["x - 2y = m"],
      confidence: 0.88
    }),
    true
  );
});

test("parallel race returns the first valid structured result and aborts the slower request", async () => {
  let slowAborted = false;
  const result = await raceQwenStructuredModels({
    options: {},
    models: ["fast-model", "slow-model"],
    label: "test",
    isValid: (value) => Boolean(value?.valid),
    invokeModel: (model, signal) => new Promise((resolve) => {
      const delay = model === "fast-model" ? 15 : 100;
      const timer = setTimeout(() => resolve({ valid: model === "fast-model", model }), delay);
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        slowAborted = model === "slow-model";
      }, { once: true });
    })
  });

  assert.deepEqual(result, { valid: true, model: "fast-model" });
  assert.equal(slowAborted, true);
});

test("an invalid fast guide result cannot suppress a slower valid result", async () => {
  const result = await raceQwenStructuredModels({
    options: {},
    models: ["fast-invalid", "slow-valid"],
    label: "test-invalid-first",
    isValid: (value) => Boolean(value?.valid),
    invokeModel: (model, signal) => new Promise((resolve) => {
      const delay = model === "fast-invalid" ? 10 : 30;
      const timer = setTimeout(() => resolve({ valid: model === "slow-valid", model }), delay);
      signal.addEventListener("abort", () => clearTimeout(timer), { once: true });
    })
  });

  assert.deepEqual(result, { valid: true, model: "slow-valid" });
});
