import test from "node:test";
import assert from "node:assert/strict";

// Import the Route Handler methods directly
import { GET, POST, PUT, DELETE, PATCH } from "../src/app/ping/route.ts";

test("1. GET /ping succeeds with status ok and relay active", async () => {
  const response = await GET();
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data, { status: "ok", relay: "active" });
});

test("2. POST /ping with CHATGPT_TEST succeeds", async () => {
  const req = new Request("http://localhost/ping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "CHATGPT_TEST" }),
  });
  const response = await POST(req);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data, { received: true, message: "CHATGPT_TEST" });
});

test("3. POST /ping with incorrect payload fails (400)", async () => {
  const payloads = [
    { message: "WRONG_MESSAGE" },
    { message: "CHATGPT_TEST", extraProp: "unauthorized" },
    { otherKey: "value" },
    { message: 123 },
    {},
  ];

  for (const payload of payloads) {
    const req = new Request("http://localhost/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const response = await POST(req);
    assert.equal(response.status, 400);
    const data = await response.json();
    assert.equal(data.error, "Invalid payload");
  }
});

test("4. POST /ping with malformed JSON fails (400)", async () => {
  const req = new Request("http://localhost/ping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{ message: 'CHATGPT_TEST', broken: ",
  });
  const response = await POST(req);
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.equal(data.error, "Malformed JSON");
});

test("5. Unsupported HTTP methods fail (405)", async () => {
  const putRes = await PUT();
  assert.equal(putRes.status, 405);
  const deleteRes = await DELETE();
  assert.equal(deleteRes.status, 405);
  const patchRes = await PATCH();
  assert.equal(patchRes.status, 405);
});
