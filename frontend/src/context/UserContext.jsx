import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  getFromCache,
  setInCache,
  removeFromCache,
  clearCacheByPrefix,
  CACHE_KEYS,
  TTL
} from '../utils/cache';
import { USE_FAKE_DATA, fakeUser, fakeDbUser } from '../utils/fakeData';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [spotifyUser, setSpotifyUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const getToken = useCallback(() => {
    return localStorage.getItem('spotify_token');
  }, []);

  // Fetch Spotify user profile (with caching)
  const fetchSpotifyUser = useCallback(async (forceRefresh = false) => {
    // Use fake data if enabled
    if (USE_FAKE_DATA) {
      setSpotifyUser(fakeUser);
      setInCache(CACHE_KEYS.spotifyUser(), fakeUser, TTL.SESSION);
      return fakeUser;
    }

    const token = getToken();
    if (!token || token === 'null') {
      setSpotifyUser(null);
      return null;
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = getFromCache(CACHE_KEYS.spotifyUser());
      if (cached) {
        setSpotifyUser(cached);
        return cached;
      }
    }

    try {
      
      // const res = await axios.get("http://127.0.0.1:8000/spotify/me", {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      const res = await axios.get("https://recordbackend.vercel.app/spotify/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSpotifyUser(res.data);
      setInCache(CACHE_KEYS.spotifyUser(), res.data, TTL.SESSION);

      // Also store spotify_user_id in localStorage for other uses
      localStorage.setItem('spotify_user_id', res.data.id);

      return res.data;
    } catch (err) {
      console.error("Error fetching Spotify user:", err);
      // Token might be invalid
      if (err.response?.status === 401) {
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('spotify_user_id');
        setSpotifyUser(null);
      }
      setError(err);
      return null;
    }
  }, [getToken]);

  // Fetch DB user by Spotify ID (with caching)
  const fetchDbUser = useCallback(async (spotifyId, forceRefresh = false) => {
    if (!spotifyId) return null;

    // Use fake data if enabled
    if (USE_FAKE_DATA) {
      setDbUser(fakeDbUser);
      setInCache(CACHE_KEYS.dbUser(spotifyId), fakeDbUser, TTL.MEDIUM);
      return fakeDbUser;
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = getFromCache(CACHE_KEYS.dbUser(spotifyId));
      if (cached) {
        setDbUser(cached);
        return cached;
      }
    }

    try {
      
      // const res = await axios.get(`http://127.0.0.1:8000/user/spotify/${spotifyId}`);
      const res = await axios.get(`https://recordbackend.vercel.app/user/spotify/${spotifyId}`);
      if (res.data) {
        setDbUser(res.data);
        setInCache(CACHE_KEYS.dbUser(spotifyId), res.data, TTL.MEDIUM);
        // Also cache by MongoDB ID for lookups
        setInCache(CACHE_KEYS.dbUserById(res.data._id), res.data, TTL.MEDIUM);
      }
      return res.data;
    } catch (err) {
      console.error("Error fetching DB user:", err);
      setError(err);
      return null;
    }
  }, []);

  // Fetch DB user by MongoDB ID (with caching)
  const fetchDbUserById = useCallback(async (mongoId, forceRefresh = false) => {
    if (!mongoId) return null;

    // Check cache first
    if (!forceRefresh) {
      const cached = getFromCache(CACHE_KEYS.dbUserById(mongoId));
      if (cached) {
        return cached;
      }
    }

    try {
      
      // const res = await axios.get(`http://127.0.0.1:8000/user/${mongoId}`);
      const res = await axios.get(`https://recordbackend.vercel.app/user/${mongoId}`);
      if (res.data) {
        setInCache(CACHE_KEYS.dbUserById(mongoId), res.data, TTL.MEDIUM);
        // Also cache by Spotify ID if available
        if (res.data.spotify_id) {
          setInCache(CACHE_KEYS.dbUser(res.data.spotify_id), res.data, TTL.MEDIUM);
        }
      }
      return res.data;
    } catch (err) {
      console.error("Error fetching DB user by ID:", err);
      return null;
    }
  }, []);

  // Update DB user and invalidate cache
  const updateDbUser = useCallback(async (mongoId, updates) => {
    try {
      // const res = await axios.put(`http://127.0.0.1:8000/user/${mongoId}`, updates);
      const res = await axios.put(`https://recordbackend.vercel.app/user/${mongoId}`, updates);
      if (res.data) {
        setDbUser(res.data);
        // Update cache
        setInCache(CACHE_KEYS.dbUserById(mongoId), res.data, TTL.MEDIUM);
        if (res.data.spotify_id) {
          setInCache(CACHE_KEYS.dbUser(res.data.spotify_id), res.data, TTL.MEDIUM);
        }
      }
      return res.data;
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    }
  }, []);

  // Logout - clear user data and cache
  const logout = useCallback(() => {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_user_id');
    setSpotifyUser(null);
    setDbUser(null);
    removeFromCache(CACHE_KEYS.spotifyUser());
    clearCacheByPrefix('db_user_');
    clearCacheByPrefix('top_');
  }, []);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const user = await fetchSpotifyUser();
      if (user?.id) {
        await fetchDbUser(user.id);
      }
      setLoading(false);
    };

    init();
  }, [fetchSpotifyUser, fetchDbUser]);

  const value = {
    spotifyUser,
    dbUser,
    loading,
    error,
    fetchSpotifyUser,
    fetchDbUser,
    fetchDbUserById,
    updateDbUser,
    logout,
    getToken,
    isAuthenticated: !!spotifyUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
