import { describe, it, expect } from "vitest";
import { health, appName } from "../src/lib/health";

describe("scaffold health", () => {
  it("reports ok", () => {
    expect(health()).toEqual({ status: "ok", app: "BookIt" });
  });

  it("names the app", () => {
    expect(appName).toBe("BookIt");
  });
});
