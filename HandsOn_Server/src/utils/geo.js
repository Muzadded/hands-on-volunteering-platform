/** Approximate Earth radius in km. */
const EARTH_KM = 6371;

export function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

/** Haversine distance in kilometers. */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(a));
}

/** Round coords to ~1.1 km precision for privacy on the public map. */
export function approximateCoord(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Math.round(Number(value) * 100) / 100;
}

export function canViewExactLocation(post, viewerId) {
  if (!viewerId || !post) return false;
  if (String(post.created_by) === String(viewerId)) return true;
  if (post.claimed_by && String(post.claimed_by) === String(viewerId)) return true;
  return false;
}

/**
 * Strip exact address/coords from a help post for viewers who are not parties.
 */
export function presentHelpPost(post, viewerId) {
  if (!post) return post;
  if (canViewExactLocation(post, viewerId)) {
    return { ...post, location_hidden: false };
  }

  return {
    ...post,
    location: post.location
      ? "Approximate area (exact address hidden until claimed)"
      : null,
    lat: approximateCoord(post.lat),
    lng: approximateCoord(post.lng),
    location_hidden: true,
  };
}
