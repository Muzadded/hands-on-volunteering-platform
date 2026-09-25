import { describe, expect, it } from "vitest";
import {
  approximateCoord,
  canViewExactLocation,
  haversineKm,
  presentHelpPost,
} from "../src/utils/geo.js";

describe("geo utils", () => {
  it("computes haversine distance roughly", () => {
    // ~5.5 km between Mirpur and Dhanmondi-ish points
    const km = haversineKm(23.8223, 90.3654, 23.7461, 90.3742);
    expect(km).toBeGreaterThan(5);
    expect(km).toBeLessThan(12);
  });

  it("hides exact address from strangers", () => {
    const post = {
      help_post_id: 1,
      created_by: 2,
      claimed_by: null,
      location: "House 12, Road 5",
      lat: 23.822345,
      lng: 90.365432,
    };
    expect(canViewExactLocation(post, 9)).toBe(false);
    const shown = presentHelpPost(post, 9);
    expect(shown.location).toMatch(/Approximate/);
    expect(shown.location_hidden).toBe(true);
    expect(shown.lat).toBe(approximateCoord(23.822345));
  });

  it("reveals exact address to owner and claimer", () => {
    const post = {
      created_by: 2,
      claimed_by: 7,
      location: "House 12",
      lat: 23.8,
      lng: 90.3,
    };
    expect(presentHelpPost(post, 2).location).toBe("House 12");
    expect(presentHelpPost(post, 7).location_hidden).toBe(false);
  });
});
