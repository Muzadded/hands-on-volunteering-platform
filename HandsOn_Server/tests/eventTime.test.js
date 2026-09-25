import { describe, expect, it } from "vitest";
import { buildEventTimestamps } from "../src/utils/eventTime.js";

describe("buildEventTimestamps", () => {
  it("builds UTC timestamps from date and times", () => {
    const { startsAt, endsAt } = buildEventTimestamps(
      "2032-06-01",
      "09:00",
      "12:30"
    );
    expect(startsAt.toISOString()).toBe("2032-06-01T09:00:00.000Z");
    expect(endsAt.toISOString()).toBe("2032-06-01T12:30:00.000Z");
  });

  it("rolls overnight end times to the next day", () => {
    const { startsAt, endsAt } = buildEventTimestamps(
      "2032-06-01",
      "22:00",
      "02:00"
    );
    expect(startsAt.toISOString()).toBe("2032-06-01T22:00:00.000Z");
    expect(endsAt.toISOString()).toBe("2032-06-02T02:00:00.000Z");
  });
});
