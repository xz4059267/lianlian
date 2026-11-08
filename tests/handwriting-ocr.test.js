const test = require("node:test");
const assert = require("node:assert/strict");

process.env.ALIYUN_OCR_ACCESS_KEY_ID = "test-access-key";
process.env.ALIYUN_OCR_ACCESS_KEY_SECRET = "test-access-secret";
process.env.ALIYUN_HANDWRITING_OCR_ENABLED = "1";
const {
  extractAliyunHandwritingContent,
  extractAliyunHandwritingBlocks,
  isAliyunHandwritingOcrIncomplete
} = require("../server.js");
const { recognizeAliyunHandwriting } = require("../server.js");
const { getStudentStrokeImageForHandwriting } = require("../server.js");

test("Aliyun handwriting OCR receives only the student stroke layer, never the question board image", () => {
  assert.equal(
    getStudentStrokeImageForHandwriting({
      boardImage: "data:image/png;base64,question-and-board",
      studentStrokeImage: "data:image/png;base64,student-strokes"
    }),
    "data:image/png;base64,student-strokes"
  );
  assert.equal(
    getStudentStrokeImageForHandwriting({ boardImage: "data:image/png;base64,question-only" }),
    ""
  );
});

test("Aliyun unified OCR extracts handwriting text from its Data object", () => {
  assert.equal(
    extractAliyunHandwritingContent({ Data: { Content: "x - 2y = m" } }),
    "x - 2y = m"
  );
});

test("Aliyun unified OCR extracts handwriting text when Data is JSON encoded", () => {
  assert.equal(
    extractAliyunHandwritingContent({ Data: JSON.stringify({ Content: '"m = x - 2y"' }) }),
    "m = x - 2y"
  );
});

test("Aliyun unified OCR accepts lowercase response fields and empty results", () => {
  assert.equal(
    extractAliyunHandwritingContent({ data: { content: "  y = 3  " } }),
    "y = 3"
  );
  assert.equal(extractAliyunHandwritingContent({ Data: {} }), "");
});

test("handwriting OCR recovers block text when the summary omits written lines", () => {
  const payload = {
    Data: {
      Content: "x=4",
      SubImages: [{ BlockInfo: { BlockDetails: [
        { BlockContent: "5x-5y=10m-5" },
        { BlockContent: "x-y=-1" },
        { BlockContent: "x=4" }
      ] } }]
    }
  };
  assert.deepEqual(extractAliyunHandwritingBlocks(payload), ["5x-5y=10m-5", "x-y=-1", "x=4"]);
  assert.equal(extractAliyunHandwritingContent(payload), "5x-5y=10m-5\nx-y=-1\nx=4");
});

test("short OCR from a multi-line board is treated as failed recognition", () => {
  assert.equal(
    isAliyunHandwritingOcrIncomplete(
      { text: "x=4", blockCount: 1 },
      { inkRowBandCount: 3, inkAspectRatio: 2.5 }
    ),
    true
  );
  assert.equal(
    isAliyunHandwritingOcrIncomplete(
      { text: "5x-5y=10m-5\nx-y=-1\nx=4", blockCount: 3 },
      { inkRowBandCount: 3, inkAspectRatio: 2.5 }
    ),
    false
  );
  assert.equal(
    isAliyunHandwritingOcrIncomplete(
      { text: "x=4", blockCount: 1 },
      { inkRowBandCount: 1, inkAspectRatio: 2 }
    ),
    false
  );
});

test("handwriting OCR calls RecognizeAllText with HandWriting and image bytes", async () => {
  const originalFetch = global.fetch;
  let requestUrl;
  let requestOptions;
  global.fetch = async (url, options) => {
    requestUrl = new URL(url);
    requestOptions = options;
    return new Response(JSON.stringify({ Data: { Content: "m = x - 2y" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  try {
    const result = await recognizeAliyunHandwriting("data:image/png;base64,aGVsbG8=");
    assert.equal(requestUrl.searchParams.get("Action"), "RecognizeAllText");
    assert.equal(requestUrl.searchParams.get("Type"), "HandWriting");
    assert.equal(requestUrl.searchParams.get("OutputCoordinate"), "rectangle");
    assert.equal(requestUrl.searchParams.get("RegionId"), "cn-hangzhou");
    assert.equal(requestOptions.method, "POST");
    assert.equal(requestOptions.headers["Content-Type"], "application/octet-stream");
    assert.equal(Buffer.from(requestOptions.body).toString(), "hello");
    assert.equal(result.text, "m = x - 2y");
  } finally {
    global.fetch = originalFetch;
  }
});
