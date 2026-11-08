const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

test("cloud permission failure is not retried as a transient speech error", () => {
  const source = appSource.slice(
    appSource.indexOf("function isCloudTtsPermissionFailure"),
    appSource.indexOf("function primeLianCloudSpeech")
  );
  const isPermissionFailure = vm.runInNewContext(`(${source.trim()})`);
  assert.equal(isPermissionFailure(502, '{"code":"aliyun_nls_token_failed","message":"No permission!"}'), true);
  assert.equal(isPermissionFailure(503, "temporary service error"), false);
});

test("cloud speech failure still speaks the guidance in the browser", async () => {
  const source = appSource.slice(
    appSource.indexOf("function lianSpeak("),
    appSource.indexOf("function lianSilentNotice")
  );
  const spoken = [];
  const state = {
    teachSessionPaused: false,
    spokenGuidanceByKey: new Map(),
    lianSpeechRequestId: 0,
    lianAudioUnlocked: true,
    isMuted: false,
    lianTtsPermissionDeniedUntil: Date.now() + 60_000
  };
  const dom = {
    lianState: { textContent: "" },
    lianBubble: { textContent: "" },
    lianAvatar: { classList: { add() {}, remove() {} } }
  };
  class SpeechSynthesisUtterance {
    constructor(text) { this.text = text; }
  }
  const context = {
    state,
    dom,
    window: { speechSynthesis: {
      cancel() {},
      resume() {},
      speak(utterance) {
        spoken.push(utterance.text);
        setTimeout(() => {
          utterance.onstart?.();
          utterance.onend?.();
        }, 0);
      }
    } },
    SpeechSynthesisUtterance,
    AbortController,
    Date,
    Promise,
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    REPEATED_GUIDANCE_COOLDOWN_MS: 90_000,
    LIAN_TEXT_PUBLISH_WATCHDOG_MS: 10_000,
    LIAN_VOICE_RATE: 0.92,
    LIAN_VOICE_PITCH: 1.01,
    LIAN_VOICE_VOLUME: 0.82,
    getGuidanceDedupeKey: () => "",
    getInteractionToken: () => ({ sessionId: 1, sequenceId: 1 }),
    isCurrentInteraction: () => true,
    stopLianSpeechOutput() {},
    pauseRecognitionForLianSpeech: () => false,
    guideIdleText: () => "待命",
    prepareLianSpeechText: (text) => text,
    splitLianSpeechText: (text) => [text],
    playCloudLianSpeech: async () => false,
    refreshLianVoice() {},
    getLianVoice: () => null,
    addLog() {},
    rememberLianQuestion() {}
  };
  const lianSpeak = vm.runInNewContext(`(${source.trim()})`, context);
  assert.equal(await lianSpeak("请继续下一步"), true);
  assert.deepEqual(spoken, ["请继续下一步"]);
  assert.equal(dom.lianBubble.textContent, "请继续下一步");
});
