import { describe, expect, it } from "vitest";
import {
  hoursBetween,
  normalizeTags,
  overlapCount,
  scoreEventForUser,
} from "../src/utils/matching.js";

describe("matching utils", () => {
  it("normalizes comma strings and arrays", () => {
    expect(normalizeTags("Teaching, Education")).toEqual(["teaching", "education"]);
    expect(normalizeTags(["Teaching", "teaching", ""])).toEqual(["teaching"]);
  });

  it("counts overlaps case-insensitively", () => {
    expect(overlapCount(["Teaching"], ["teaching", "gardening"])).toBe(1);
  });

  it("scores skill and cause overlap", () => {
    const { score, breakdown } = scoreEventForUser(
      { skills: ["teaching"], causes: ["education"] },
      { tags: ["teaching"], category: "Education", location: "Community Center" }
    );
    expect(breakdown.skillOverlap).toBe(1);
    expect(breakdown.causeOverlap).toBe(0);
    expect(breakdown.categoryCause).toBe(1);
    expect(score).toBeGreaterThan(0);
  });

  it("computes volunteer hours from times", () => {
    expect(hoursBetween("09:00", "12:00")).toBe(3);
    expect(hoursBetween("10:00", "09:00")).toBe(0);
  });
});
