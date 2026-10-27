const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isConcreteGuideResult,
  isValidHandwritingResult,
  normalizeUnclearHandwritingResult,
  buildHandwritingProcessFeedback,
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
  assert.equal(
    isConcreteGuideResult(
      { shouldSpeak: true, speech: "我们继续看看这道题，先理清思路。", formulaOrStep: "" },
      { eventType: "silence_escalation" }
    ),
    false
  );
  assert.equal(
    isConcreteGuideResult(
      { shouldSpeak: false, speech: "" },
      { eventType: "silence_escalation" }
    ),
    false
  );
});

test("handwriting validator accepts explicit unclear but still rejects malformed statuses", () => {
  assert.equal(
    isValidHandwritingResult({
      detectedWriting: "",
      mathExpression: "",
      writingState: "unclear",
      calculationStatus: "unclear",
      confidence: 0.2
    }),
    true
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
  assert.equal(isValidHandwritingResult({ message: "无法判断" }), false);
  assert.equal(isValidHandwritingResult([]), false);
  assert.equal(isValidHandwritingResult({ detectedWriting: "x=1", calculationStatus: "correct", confidence: 0.2 }), true);
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

test("an unclear handwriting result returns normally without claiming progress or correctness", async () => {
  const modelResult = {
    detectedWriting: "x - ?y = 10m - 5",
    mathExpression: "",
    writingState: "unclear",
    calculationStatus: "unclear",
    nextAction: "continue_guidance",
    guidance: "把两边相加得到答案",
    boardComplete: true,
    finalAnswer: "m=1",
    answerVerificationStatus: "correct",
    confidence: 0.18
  };
  const result = await raceQwenStructuredModels({
    options: {},
    models: ["handwriting-model"],
    label: "handwriting",
    isValid: isValidHandwritingResult,
    invokeModel: async () => modelResult
  });
  assert.deepEqual(result, modelResult);

  const normalized = normalizeUnclearHandwritingResult(result);
  assert.equal(normalized.calculationStatus, "unclear");
  assert.equal(normalized.nextAction, "ask_for_board");
  assert.equal(normalized.guidance, "");
  assert.equal(normalized.boardComplete, false);
  assert.equal(normalized.answerVerificationStatus, "unclear");
  assert.deepEqual(normalized.recognizedKeyStepIds, []);
  const feedback = buildHandwritingProcessFeedback(normalized, {
    trusted: true,
    solutionOutline: ["先列关系式", "再求最终答案"]
  });
  assert.equal(feedback.guidance, "");
  assert.deepEqual(feedback.recognizedKeyStepIds, []);

  const lowConfidenceVerdict = normalizeUnclearHandwritingResult({
    detectedWriting: "x=1",
    writingState: "complete",
    calculationStatus: "correct",
    nextAction: "finished",
    boardComplete: true,
    confidence: 0.2
  });
  assert.equal(lowConfidenceVerdict.calculationStatus, "unclear");
  assert.equal(lowConfidenceVerdict.nextAction, "ask_for_board");
  assert.equal(lowConfidenceVerdict.boardComplete, false);
});

test("malformed handwriting output remains a format error", async () => {
  await assert.rejects(
    raceQwenStructuredModels({
      options: {},
      models: ["handwriting-model"],
      label: "handwriting",
      isValid: isValidHandwritingResult,
      invokeModel: async () => ({ message: "无法判断" })
    }),
    (error) => error.code === "invalid_model_output"
  );
});

test("answer-key race includes structured validation reasons when every candidate is rejected", async () => {
  await assert.rejects(
    raceQwenStructuredModels({
      options: {},
      models: ["answer-model"],
      label: "answer-key",
      isValid: () => false,
      getValidationIssues: () => ["solution-steps-missing", "verification-checks-missing"],
      invokeModel: async () => ({ canonicalAnswer: "0" })
    }),
    (error) => {
      assert.equal(error.code, "invalid_model_output");
      assert.deepEqual(error.validationIssues, ["solution-steps-missing", "verification-checks-missing"]);
      assert.match(error.message, /solution-steps-missing、verification-checks-missing/);
      return true;
    }
  );
});

test("answer-key race retries one empty array response without accepting it", async () => {
  let calls = 0;
  const result = await raceQwenStructuredModels({
    options: { deadlineAt: Date.now() + 5000 },
    models: ["answer-model"],
    label: "answer-key",
    isValid: (value) => value?.status === "solved",
    getValidationIssues: () => ["status-missing"],
    invokeModel: async () => (++calls === 1 ? [] : { status: "solved" })
  });

  assert.equal(calls, 2);
  assert.deepEqual(result, { status: "solved" });
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

test("quota-exhausted primary is removed and the next fallback fills the free slot", async () => {
  const started = [];
  const result = await raceQwenStructuredModels({
    options: { deadlineAt: Date.now() + 500 },
    models: ["primary-quota", "fallback-one", "fallback-two", "fallback-three"],
    label: "test-quota-failover",
    isValid: (value) => Boolean(value?.valid),
    invokeModel: (model, signal) => {
      started.push(model);
      if (model === "primary-quota") {
        const error = new Error("insufficient quota");
        error.code = "insufficient_quota";
        error.statusCode = 429;
        return Promise.reject(error);
      }
      if (model === "fallback-two") return Promise.resolve({ valid: true, model });
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        }, { once: true });
      });
    }
  });

  assert.deepEqual(result, { valid: true, model: "fallback-two" });
  assert.ok(started.includes("primary-quota"));
  assert.ok(started.includes("fallback-one"));
  assert.ok(started.includes("fallback-two"));
  assert.equal(started.includes("fallback-three"), false);
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
