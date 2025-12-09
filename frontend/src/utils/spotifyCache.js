// Spotify-specific caching utilities
// Handles album metadata, tracks, and batch fetching with rate limit awareness

import axios from 'axios';
import {
  getFromCache,
  setInCache,
  CACHE_KEYS,
  TTL
} from './cache';

/**
 * Fetch album from Spotify API with caching
 * Album metadata is static, so we cache permanently
 * @param {string} albumId - Spotify album ID
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Object|null>} Album data
 */
export async function getAlbum(albumId, accessToken) {
  if (!albumId || !accessToken) return null;

  // Check cache first
  const cached = getFromCache(CACHE_KEYS.album(albumId));
  if (cached) {
    return cached;
  }

  try {
    const res = await axios.get(
      `https://api.spotify.com/v1/albums/${albumId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // Cache permanently - album metadata doesn't change
    setInCache(CACHE_KEYS.album(albumId), res.data, TTL.PERMANENT);
    return res.data;
  } catch (err) {
    if (err.response?.status === 429) {
      const retryAfter = parseInt(err.response.headers['retry-after'] || '1', 10);
      console.warn(`Rate limited fetching album. Retry after ${retryAfter}s`);
      await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
      return getAlbum(albumId, accessToken); // Retry once
    }
    console.error('Error fetching album:', err);
    return null;
  }
}

/**
 * Fetch multiple albums in batch from Spotify API with caching
 * Much more efficient than fetching one by one
 * @param {string[]} albumIds - Array of Spotify album IDs
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Object[]>} Array of album data
 */
export async function getAlbumsBatch(albumIds, accessToken) {
  if (!albumIds?.length || !accessToken) return [];

  // Filter out already cached albums
  const results = {};
  const uncachedIds = [];

  for (const id of albumIds) {
    const cached = getFromCache(CACHE_KEYS.album(id));
    if (cached) {
      results[id] = cached;
    } else {
      uncachedIds.push(id);
    }
  }

  // Fetch uncached albums in batches of 20 (Spotify API limit)
  if (uncachedIds.length > 0) {
    const batches = [];
    for (let i = 0; i < uncachedIds.length; i += 20) {
      batches.push(uncachedIds.slice(i, i + 20));
    }

    for (const batch of batches) {
      try {
        const res = await axios.get(
          `https://api.spotify.com/v1/albums?ids=${batch.join(',')}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // Cache each album permanently
        for (const album of res.data.albums) {
          if (album) {
            setInCache(CACHE_KEYS.album(album.id), album, TTL.PERMANENT);
            results[album.id] = album;
          }
        }
      } catch (err) {
        if (err.response?.status === 429) {
          const retryAfter = parseInt(err.response.headers['retry-after'] || '1', 10);
          console.warn(`Rate limited fetching albums. Retry after ${retryAfter}s`);
          await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
          // Retry this batch
          const retryRes = await axios.get(
            `https://api.spotify.com/v1/albums?ids=${batch.join(',')}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          for (const album of retryRes.data.albums) {
            if (album) {
              setInCache(CACHE_KEYS.album(album.id), album, TTL.PERMANENT);
              results[album.id] = album;
            }
          }
        } else {
          console.error('Error fetching albums batch:', err);
        }
      }
    }
  }

  // Return in original order
  return albumIds.map(id => results[id]).filter(Boolean);
}

/**
 * Fetch tracks from Spotify API with caching
 * @param {string[]} trackIds - Array of Spotify track IDs
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Object[]>} Array of track data
 */
export async function getTracksBatch(trackIds, accessToken) {
  if (!trackIds?.length || !accessToken) return [];

  // Create a cache key for this specific set of tracks
  const cacheKey = CACHE_KEYS.tracks(trackIds.join(','));
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Spotify allows up to 50 tracks per request
    const batches = [];
    for (let i = 0; i < trackIds.length; i += 50) {
      batches.push(trackIds.slice(i, i + 50));
    }

    const allTracks = [];
    for (const batch of batches) {
      const res = await axios.get(
        `https://api.spotify.com/v1/tracks?ids=${batch.join(',')}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      allTracks.push(...res.data.tracks.filter(Boolean));
    }

    // Cache the result
    setInCache(cacheKey, allTracks, TTL.PERMANENT);
    return allTracks;
  } catch (err) {
    if (err.response?.status === 429) {
      const retryAfter = parseInt(err.response.headers['retry-after'] || '1', 10);
      console.warn(`Rate limited fetching tracks. Retry after ${retryAfter}s`);
      await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
      return getTracksBatch(trackIds, accessToken);
    }
    console.error('Error fetching tracks:', err);
    return [];
  }
}

/**
 * Fetch user's top artists from Spotify API with caching
 * @param {string} accessToken - Spotify access token
 * @param {string} spotifyId - User's Spotify ID (for cache key)
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object[]>} Array of artist data
 */
export async function getTopArtists(accessToken, spotifyId, forceRefresh = false) {
  if (!accessToken) return [];

  // Check cache first
  if (!forceRefresh) {
    const cached = getFromCache(CACHE_KEYS.topArtists(spotifyId));
    if (cached) {
      return cached;
    }
  }

  try {
    const res = await axios.get(
      "http://127.0.0.1:8000/spotify/top/artists",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const artists = res.data.items || [];
    // Cache for 30 minutes - top artists change infrequently
    setInCache(CACHE_KEYS.topArtists(spotifyId), artists, TTL.LONG);
    return artists;
  } catch (err) {
    console.error('Error fetching top artists:', err);
    return [];
  }
}

/**
 * Fetch user's top tracks from Spotify API with caching
 * @param {string} accessToken - Spotify access token
 * @param {string} spotifyId - User's Spotify ID (for cache key)
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object[]>} Array of track data
 */
export async function getTopTracks(accessToken, spotifyId, forceRefresh = false) {
  if (!accessToken) return [];

  // Check cache first
  if (!forceRefresh) {
    const cached = getFromCache(CACHE_KEYS.topTracks(spotifyId));
    if (cached) {
      return cached;
    }
  }

  try {
    const res = await axios.get(
      "http://127.0.0.1:8000/spotify/top/tracks",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const tracks = res.data.items || [];
    // Cache for 30 minutes - top tracks change infrequently
    setInCache(CACHE_KEYS.topTracks(spotifyId), tracks, TTL.LONG);
    return tracks;
  } catch (err) {
    console.error('Error fetching top tracks:', err);
    return [];
  }
}

/**
 * Search for albums on Spotify with debounce-friendly caching
 * @param {string} query - Search query
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Object[]>} Array of album search results
 */
export async function searchAlbums(query, accessToken) {
  if (!query || !accessToken) return [];

  const cacheKey = `album_search_${query.toLowerCase().trim()}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const res = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=10`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const albums = res.data.albums?.items || [];
    // Cache search results for 5 minutes
    setInCache(cacheKey, albums, TTL.MEDIUM);

    // Also cache individual albums
    for (const album of albums) {
      setInCache(CACHE_KEYS.album(album.id), album, TTL.PERMANENT);
    }

    return albums;
  } catch (err) {
    console.error('Error searching albums:', err);
    return [];
  }
}
