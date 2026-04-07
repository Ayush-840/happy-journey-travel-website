/**
 * Geolocation Utilities for Happy Journey
 * Includes Distance calculation and Geofencing.
 */

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} - Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks if a user is within a specified radius of a destination.
 * @param {number} userLat 
 * @param {number} userLng 
 * @param {object} destination - Object with lat and lng properties
 * @param {number} radiusKm - Default 0.5km (500m)
 * @returns {boolean}
 */
export function isWithinRadius(userLat, userLng, destination, radiusKm = 0.5) {
  if (!userLat || !userLng || !destination?.lat || !destination?.lng) return false;
  const dist = calculateDistance(userLat, userLng, destination.lat, destination.lng);
  return dist <= radiusKm;
}
