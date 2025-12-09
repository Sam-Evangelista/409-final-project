// Cache utility with TTL (Time To Live) support
// Stores data in memory with optional localStorage persistence

const memoryCache = new Map();

// Default TTL values in milliseconds
export const TTL = {
  SHORT: 1 * 60 * 1000,         // 1 minute - for frequently changing data
  MEDIUM: 5 * 60 * 1000,        // 5 minutes - for moderately stable data
  LONG: 30 * 60 * 1000,         // 30 minutes - for stable data like top artists
  SESSION: 60 * 60 * 1000,      // 1 hour - for session-level data
  PERMANENT: Infinity,          // Never expires - for static data like album metadata
};

/**
 * Get item from cache
 * @param {string} key - Cache key
 * @param {boolean} useLocalStorage - Whether to check localStorage as fallback
 * @returns {any|null} Cached value or null if not found/expired
 */
export function getFromCache(key, useLocalStorage = false) {
  // Check memory cache first
  const memoryItem = memoryCache.get(key);
  if (memoryItem) {
    if (Date.now() < memoryItem.expiry) {
      return memoryItem.value;
    }
    // Expired, remove from cache
    memoryCache.delete(key);
  }

  // Check localStorage as fallback
  if (useLocalStorage) {
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() < parsed.expiry) {
          // Restore to memory cache
          memoryCache.set(key, parsed);
          return parsed.value;
        }
        // Expired, remove from localStorage
        localStorage.removeItem(`cache_${key}`);
      }
    } catch (e) {
      console.error('Cache localStorage error:', e);
    }
  }

  return null;
}

/**
 * Set item in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds
 * @param {boolean} persistToLocalStorage - Whether to also store in localStorage
 */
export function setInCache(key, value, ttl = TTL.MEDIUM, persistToLocalStorage = false) {
  const item = {
    value,
    expiry: ttl === Infinity ? Infinity : Date.now() + ttl,
    timestamp: Date.now(),
  };

  memoryCache.set(key, item);

  if (persistToLocalStorage) {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (e) {
      console.error('Cache localStorage error:', e);
    }
  }
}

/**
 * Remove item from cache
 * @param {string} key - Cache key
 * @param {boolean} removeFromLocalStorage - Whether to also remove from localStorage
 */
export function removeFromCache(key, removeFromLocalStorage = false) {
  memoryCache.delete(key);
  if (removeFromLocalStorage) {
    localStorage.removeItem(`cache_${key}`);
  }
}

/**
 * Clear all cached items matching a prefix
 * @param {string} prefix - Key prefix to match
 */
export function clearCacheByPrefix(prefix) {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }

  // Clear from localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(`cache_${prefix}`)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  memoryCache.clear();

  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('cache_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// Cache key generators for consistency
export const CACHE_KEYS = {
  spotifyUser: () => 'spotify_user',
  dbUser: (spotifyId) => `db_user_${spotifyId}`,
  dbUserById: (mongoId) => `db_user_mongo_${mongoId}`,
  album: (albumId) => `album_${albumId}`,
  tracks: (trackIds) => `tracks_${trackIds}`,
  topArtists: (spotifyId) => `top_artists_${spotifyId}`,
  topTracks: (spotifyId) => `top_tracks_${spotifyId}`,
  ratings: () => 'all_ratings',
  followingRatings: (userId) => `following_ratings_${userId}`,
  userRatings: (username) => `user_ratings_${username}`,
  followers: (userId) => `followers_${userId}`,
  following: (userId) => `following_${userId}`,
};
