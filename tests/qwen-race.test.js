const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isConcreteGuideResult,
  isValidHandwritingResult,
  requestQwenChatCompletionOnce,
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

test("a hung model is closed by the race deadline", async () => {
  const deadlineAt = Date.now() + 35;
  await assert.rejects(
    raceQwenStructuredModels({
      options: { deadlineAt },
      models: ["hung-model"],
      label: "test-timeout",
      isValid: () => true,
      invokeModel: () => new Promise(() => {})
    }),
    (error) => error?.code === "qwen_total_timeout" && error?.stage === "test-timeout"
  );
});

test("an external abort closes all model work", async () => {
  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), 15);
  await assert.rejects(
    raceQwenStructuredModels({
      options: { signal: controller.signal, deadlineAt: Date.now() + 1000 },
      models: ["hung-model-a", "hung-model-b"],
      label: "test-abort",
      isValid: () => true,
      invokeModel: () => new Promise(() => {})
    }),
    (error) => error?.name === "AbortError" && error?.code === "qwen_aborted"
  );
  clearTimeout(abortTimer);
});

test("external cancellation reaches the underlying fetch", async () => {
  const originalFetch = global.fetch;
  let observedSignal = null;
  const controller = new AbortController();
  global.fetch = (_url, options) => {
    observedSignal = options.signal;
    return new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => {
        const error = new Error("aborted by transport timeout");
        error.name = "AbortError";
        reject(error);
      }, { once: true });
    });
  };

  try {
    const abortTimer = setTimeout(() => controller.abort(), 20);
    await assert.rejects(
      requestQwenChatCompletionOnce(
        { model: "test-model", messages: [] },
        false,
        1000,
        controller.signal
      ),
      (error) => error?.name === "AbortError" && error?.code === "qwen_aborted"
    );
    clearTimeout(abortTimer);
    assert.ok(observedSignal instanceof AbortSignal);
    assert.equal(observedSignal.aborted, true);
  } finally {
    global.fetch = originalFetch;
  }
});
