/**
 * Haversine distance formula between two lat/lng coordinates
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const radiusKm = 6371;
  const toRadians = (value) => value * (Math.PI / 180);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return radiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function parseCoordinate(value, label, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    const error = new Error(`${label} must be a number between ${min} and ${max}`);
    error.status = 400;
    throw error;
  }
  return number;
}

function parsePositiveInteger(value, label, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > maximum) {
    const error = new Error(`${label} must be an integer between 1 and ${maximum}`);
    error.status = 400;
    throw error;
  }
  return number;
}

module.exports = { calculateDistance, parseCoordinate, parsePositiveInteger };
