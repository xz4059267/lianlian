const test = require("node:test");
const assert = require("node:assert/strict");

const { withTemporaryKimiImageUrl } = require("../server");

const questionImage = `data:image/png;base64,${Buffer.from("question-photo").toString("base64")}`;

function createBlobSdk() {
  const calls = [];
  return {
    calls,
    async put(pathname, body, options) {
      calls.push({ method: "put", pathname, body, options });
      return { pathname };
    },
    async issueSignedToken(options) {
      calls.push({ method: "issueSignedToken", options });
      return { delegationToken: "limited-token", clientSigningToken: "secret-token" };
    },
    async presignUrl(token, options) {
      calls.push({ method: "presignUrl", token, options });
      return { presignedUrl: "https://private.blob.example/question.png?signature=short-lived" };
    },
    async del(pathname) {
      calls.push({ method: "del", pathname });
    }
  };
}

test("Kimi receives a private signed image URL and the temporary upload is deleted", async () => {
  const previousStoreId = process.env.BLOB_STORE_ID;
  process.env.BLOB_STORE_ID = "store_test";
  const blobSdk = createBlobSdk();
  try {
    const result = await withTemporaryKimiImageUrl(
      questionImage,
      async (imageUrl) => {
        assert.equal(imageUrl, "https://private.blob.example/question.png?signature=short-lived");
        return "verified";
      },
      { blobSdk }
    );

    assert.equal(result, "verified");
    assert.deepEqual(blobSdk.calls.map((call) => call.method), ["put", "issueSignedToken", "presignUrl", "del"]);
    assert.equal(blobSdk.calls[0].options.access, "private");
    assert.equal(blobSdk.calls[0].options.contentType, "image/png");
    assert.equal(blobSdk.calls[1].options.operations.includes("get"), true);
    assert.equal(blobSdk.calls[2].options.access, "private");
    assert.equal(blobSdk.calls[2].options.useCache, false);
    assert.equal(blobSdk.calls[3].pathname, blobSdk.calls[0].pathname);
  } finally {
    if (previousStoreId === undefined) delete process.env.BLOB_STORE_ID;
    else process.env.BLOB_STORE_ID = previousStoreId;
  }
});

test("temporary private image is deleted even when Kimi request fails", async () => {
  const previousStoreId = process.env.BLOB_STORE_ID;
  process.env.BLOB_STORE_ID = "store_test";
  const blobSdk = createBlobSdk();
  try {
    await assert.rejects(
      withTemporaryKimiImageUrl(questionImage, async () => {
        throw new Error("Kimi unavailable");
      }, { blobSdk }),
      /Kimi unavailable/
    );
    assert.equal(blobSdk.calls.at(-1).method, "del");
  } finally {
    if (previousStoreId === undefined) delete process.env.BLOB_STORE_ID;
    else process.env.BLOB_STORE_ID = previousStoreId;
  }
});

test("existing HTTPS image URLs bypass temporary Blob storage", async () => {
  const blobSdk = createBlobSdk();
  const result = await withTemporaryKimiImageUrl(
    "https://images.example/question.jpg",
    async (imageUrl) => imageUrl,
    { blobSdk }
  );

  assert.equal(result, "https://images.example/question.jpg");
  assert.deepEqual(blobSdk.calls, []);
});
