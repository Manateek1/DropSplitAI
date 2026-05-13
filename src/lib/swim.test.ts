import { describe, expect, it } from "vitest";

import { detectCourse, detectSwimEvent, detectTime, isValidSwimTime, parseTimeString } from "@/lib/swim";

describe("swim parsing", () => {
  it("detects common event and course language", () => {
    expect(detectSwimEvent("I swam the 100 freestyle today")).toBe("100 free");
    expect(detectSwimEvent("new 50 backstroke time")).toBe("50 back");
    expect(detectCourse("that was scm")).toBe("SCM");
    expect(detectCourse("that was lcm")).toBe("LCM");
    expect(detectCourse("pool swim")).toBe("SCY");
  });

  it("detects and parses valid swim times", () => {
    expect(detectTime("I went 25.29 in 50 free")).toBe("25.29");
    expect(detectTime("100 back was 1:02.14")).toBe("1:02.14");
    expect(parseTimeString("1:02.14")).toBe(62.14);
    expect(isValidSwimTime("55.88")).toBe(true);
  });

  it("rejects invalid manual time formats", () => {
    expect(isValidSwimTime("abc")).toBe(false);
    expect(isValidSwimTime("55")).toBe(false);
    expect(() => parseTimeString("55")).toThrow("Enter times");
  });
});
