import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/files/upload/route";

describe("upload route validation", () => {
  it("rejects non-image uploads before storage work", async () => {
    const form = new FormData();
    form.append("file", new File(["hello"], "notes.txt", { type: "text/plain" }));

    const response = await POST(new Request("http://localhost/api/files/upload", {
      method: "POST",
      body: form,
    }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("PNG");
  });

  it("rejects files above the MVP upload limit", async () => {
    const form = new FormData();
    form.append("file", new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", { type: "image/png" }));

    const response = await POST(new Request("http://localhost/api/files/upload", {
      method: "POST",
      body: form,
    }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("5MB");
  });
});
