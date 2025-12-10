import Header from "../components/Header";
import Followers from "../components/Followers";
import AlbumSearch from "../components/AlbumSearch";
import '../assets/Profile.css';
import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { getTopArtists, getTopTracks, getAlbumsBatch } from "../utils/spotifyCache";
import { getFromCache, setInCache, CACHE_KEYS, TTL } from "../utils/cache";
import {
    USE_FAKE_DATA,
    fakeDbUser,
    fakeTopArtists,
    fakeTopTracks,
    fakeFollowers,
    fakeFollowing
} from "../utils/fakeData";

function MostListenedAlbums({ spotifyId, fakeAlbums }) {
  const [albumUrls, setAlbumUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spotifyId) {
      setLoading(false);
      return;
    }

    const fetchAlbums = async () => {
      try {
        setLoading(true);

        // Check cache first
        const cacheKey = `most_listened_${spotifyId}`;
        const cached = getFromCache(cacheKey);
        if (cached) {
          setAlbumUrls(cached);
          setLoading(false);
          return;
        }

        const res = await fetch(`http://127.0.0.1:8000/user/${spotifyId}/top-albums-art`);
        if (!res.ok) {
          setAlbumUrls([]);
          return;
        }
        const data = await res.json();
        const urls = Array.isArray(data) ? data : [];

        // Cache for 5 minutes
        setInCache(cacheKey, urls, TTL.MEDIUM);
        setAlbumUrls(urls);
      } catch (err) {
        console.error("Error fetching top albums:", err);
        setAlbumUrls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [spotifyId, fakeAlbums]);

  if (loading) return <p>Loading albums...</p>;
  if (!albumUrls.length) return <p>No most listened albums found.</p>;

  return (
    <div>
      <h1>Most Listened to Albums</h1>
      <div className="top-spacing">
        {albumUrls.map((imageUrl, index) => (
          <img
            key={index}
            className="top-album"
            src={imageUrl || "/default-album.png"}
            alt={`Most Listened Album ${index + 1}`}
          />
        ))}
      </div>
      <div className="rectangle"></div>
    </div>
  );
}

function Profile () {
    const { username } = useParams(); // Get username from URL

    // Get user data from context (cached)
    const {
        spotifyUser: user,
        dbUser,
        loading: contextLoading,
        fetchDbUser,
        updateDbUser,
        getToken
    } = useUser();

    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);
    const [activeList, setActiveList] = useState(null);
    const [listUsers, setListUsers] = useState([]);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState('');
    const [isEditingTopAlbums, setIsEditingTopAlbums] = useState(false);
    const [selectedTopAlbums, setSelectedTopAlbums] = useState([]);
    const [topAlbumsData, setTopAlbumsData] = useState([]);
    const [localDbUser, setLocalDbUser] = useState(null);
    const [userRatings, setUserRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(true);
    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
    const [localProgress, setLocalProgress] = useState(0);
    const [viewingOtherUser, setViewingOtherUser] = useState(false);

    const navigate = useNavigate();

    // Handle URL token on callback
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const urlToken = params.get('access_token');

    const accessToken = urlToken || getToken();

    if (urlToken) {
        localStorage.setItem("spotify_token", urlToken);
    }

    // Sync localDbUser with context dbUser or fetch other user
    useEffect(() => {
        const fetchUserData = async () => {
            if (username) {
                // Viewing another user's profile
                setViewingOtherUser(true);
                try {
                    const usersRes = await axios.get(`http://127.0.0.1:8000/user/`);
                    const targetUser = usersRes.data.find(u => u.username === username);
                    if (targetUser) {
                        setLocalDbUser(targetUser);
                    }
                } catch (err) {
                    console.error("Error fetching user:", err);
                }
            } else {
                // Viewing own profile
                setViewingOtherUser(false);
                if (dbUser) {
                    setLocalDbUser(dbUser);
                }
            }
        };

        fetchUserData();
    }, [dbUser, username]);

    const handleLoadFollowList = async (type) => {
        if (USE_FAKE_DATA) {
            setListUsers(type === 'followers' ? fakeFollowers : fakeFollowing);
            setActiveList(type);
            return;
        }

        if (!localDbUser?._id) return;

        // Check cache first
        const cacheKey = type === 'followers'
            ? CACHE_KEYS.followers(localDbUser._id)
            : CACHE_KEYS.following(localDbUser._id);
        const cached = getFromCache(cacheKey);

        if (cached) {
            setListUsers(cached);
            setActiveList(type);
            return;
        }

        try {
            const res = await axios.get(`http://127.0.0.1:8000/user/${localDbUser._id}/${type}`);
            const data = res.data || [];
            // Cache for 5 minutes
            setInCache(cacheKey, data, TTL.MEDIUM);
            setListUsers(data);
            setActiveList(type);
        } catch (err) {
            console.error(`Error fetching ${type}:`, err);
        }
    };

    const handleUserClick = (clickedUser) => {
        setActiveList(null);
        navigate(`/user/${clickedUser.username}`);
    };

    const handleEditBio = () => {
        setBioText(localDbUser?.bio || '');
        setIsEditingBio(true);
    };

    const handleSaveBio = async () => {
        if (USE_FAKE_DATA) {
            setLocalDbUser({ ...localDbUser, bio: bioText });
            setIsEditingBio(false);
            return;
        }

        if (!localDbUser?._id) {
            console.error("No dbUser._id found");
            return;
        }
        try {
            const updatedUser = await updateDbUser(localDbUser._id, { bio: bioText });
            setLocalDbUser(updatedUser);
            setIsEditingBio(false);
        } catch (err) {
            console.error("Error updating bio:", err.response?.data || err.message);
        }
    };

    const handleCancelBio = () => {
        setIsEditingBio(false);
        setBioText(localDbUser?.bio || '');
    };

    const handleEditTopAlbums = () => {
        setSelectedTopAlbums([]);
        setIsEditingTopAlbums(true);
    };

    const handleAlbumSelect = (album) => {
        if (selectedTopAlbums.length >= 4) {
            alert("You can only select up to 4 albums");
            return;
        }
        if (selectedTopAlbums.find(a => a.id === album.id)) {
            return;
        }
        setSelectedTopAlbums([...selectedTopAlbums, album]);
    };

    const handleRemoveAlbum = (albumId) => {
        setSelectedTopAlbums(selectedTopAlbums.filter(a => a.id !== albumId));
    };

    const handleSaveTopAlbums = async () => {
        const albumImageUrls = selectedTopAlbums.map(a => a.images?.[0]?.url || a.images?.[1]?.url || '');

        if (USE_FAKE_DATA) {
            setLocalDbUser({ ...localDbUser, top_albums: albumImageUrls });
            setTopAlbumsData(albumImageUrls);
            setIsEditingTopAlbums(false);
            return;
        }

        if (!localDbUser?._id) return;
        try {
            const updatedUser = await updateDbUser(localDbUser._id, { top_albums: albumImageUrls });
            setLocalDbUser(updatedUser);
            setIsEditingTopAlbums(false);
            setTopAlbumsData(albumImageUrls);
        } catch (err) {
            console.error("Error saving top albums:", err);
        }
    };

    const handleCancelTopAlbums = () => {
        setIsEditingTopAlbums(false);
        setSelectedTopAlbums([]);
    };

    // Fetch top artists and tracks with caching
    useEffect(() => {
        if (viewingOtherUser) {
            // Load from database for other users
            if (localDbUser?.top_artists && Array.isArray(localDbUser.top_artists)) {
                setTopArtists(localDbUser.top_artists);
            } else {
                setTopArtists([]);
            }
            if (localDbUser?.top_songs && Array.isArray(localDbUser.top_songs)) {
                setTopTracks(localDbUser.top_songs);
            } else {
                setTopTracks([]);
            }
            return;
        }

        if (USE_FAKE_DATA) {
            setTopArtists(fakeTopArtists);
            setTopTracks(fakeTopTracks);
            setTopAlbumsData(fakeDbUser.top_albums);
            return;
        }

        if (!accessToken || !user?.id) return;

        // Use cached Spotify data functions
        const fetchData = async () => {
            const [artists, tracks] = await Promise.all([
                getTopArtists(accessToken, user.id),
                getTopTracks(accessToken, user.id)
            ]);
            setTopArtists(artists);
            setTopTracks(tracks);

            // Save to database for logged-in user
            if (localDbUser?._id) {
                try {
                    await updateDbUser(localDbUser._id, {
                        top_artists: artists,
                        top_songs: tracks
                    });
                } catch (err) {
                    console.error("Error saving top artists/songs:", err);
                }
            }
        };

        fetchData();
    }, [accessToken, user?.id, viewingOtherUser, localDbUser]);

    // Set top albums data when localDbUser changes
    useEffect(() => {
        if (localDbUser?.top_albums && localDbUser.top_albums.length > 0) {
            setTopAlbumsData(localDbUser.top_albums);
        }
    }, [localDbUser]);

    // Fetch user ratings preview (up to 2 ratings)
    useEffect(() => {
        if (!localDbUser?.username || !accessToken) {
            setLoadingRatings(false);
            return;
        }

        const fetchUserRatings = async () => {
            try {
                setLoadingRatings(true);

                // Check cache first
                const cacheKey = CACHE_KEYS.userRatings(localDbUser.username);
                const cachedRatings = getFromCache(cacheKey);

                let ratingsData;
                if (cachedRatings) {
                    ratingsData = cachedRatings;
                } else {
                    const ratingsRes = await axios.get(
                        `http://127.0.0.1:8000/ratings/user/${localDbUser.username}`
                    );
                    const userRatingsData = ratingsRes.data;

                    if (userRatingsData.length === 0) {
                        setUserRatings([]);
                        setLoadingRatings(false);
                        return;
                    }

                    // Get unique album IDs
                    const albumIds = [...new Set(userRatingsData.map(r => r.album_id).filter(Boolean))];

                    // Batch fetch albums
                    const albums = await getAlbumsBatch(albumIds, accessToken);

                    // Create album map
                    const albumMap = {};
                    albums.forEach(album => {
                        if (album) {
                            albumMap[album.id] = album;
                        }
                    });

                    // Combine ratings with album data
                    ratingsData = userRatingsData.map(rating => {
                        const album = albumMap[rating.album_id];
                        return {
                            ...rating,
                            albumCover: album?.images?.[1]?.url || album?.images?.[0]?.url,
                            albumName: album?.name || rating.album,
                            artist: album?.artists?.[0]?.name || 'Unknown Artist',
                        };
                    });

                    // Cache the result
                    setInCache(cacheKey, ratingsData, TTL.MEDIUM);
                }

                // Only show first 2 ratings
                setUserRatings(ratingsData.slice(0, 2));
            } catch (error) {
                console.error("Error fetching user ratings:", error);
                setUserRatings([]);
            } finally {
                setLoadingRatings(false);
            }
        };

        fetchUserRatings();
    }, [localDbUser?.username, accessToken]);

    // Fetch currently playing track (only for own profile)
    useEffect(() => {
        if (!accessToken || viewingOtherUser) {
            setCurrentlyPlaying(null);
            setLocalProgress(0);
            return;
        }

        const fetchCurrentlyPlaying = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/spotify/currently-playing', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                if (response.data.isPlaying) {
                    setCurrentlyPlaying(response.data);
                    setLocalProgress(response.data.progressMs);
                } else {
                    setCurrentlyPlaying(null);
                    setLocalProgress(0);
                }
            } catch (error) {
                console.error('Error fetching currently playing:', error);
                setCurrentlyPlaying(null);
                setLocalProgress(0);
            }
        };

        fetchCurrentlyPlaying();
        // Poll every 5 seconds to sync with server
        const syncInterval = setInterval(fetchCurrentlyPlaying, 5000);

        return () => clearInterval(syncInterval);
    }, [accessToken, viewingOtherUser]);

    // Local timer that increments progress every second
    useEffect(() => {
        if (!currentlyPlaying || !currentlyPlaying.isPlaying) return;

        const timer = setInterval(() => {
            setLocalProgress(prev => {
                const newProgress = prev + 1000;

                // If we've reached or exceeded the duration, fetch new track
                if (newProgress >= currentlyPlaying.durationMs) {
                    // Trigger a refresh to get next track
                    axios.get('http://127.0.0.1:8000/spotify/currently-playing', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }).then(response => {
                        if (response.data.isPlaying) {
                            setCurrentlyPlaying(response.data);
                            setLocalProgress(response.data.progressMs);
                        } else {
                            setCurrentlyPlaying(null);
                            setLocalProgress(0);
                        }
                    }).catch(error => {
                        console.error('Error fetching next track:', error);
                    });

                    return 0;
                }

                return newProgress;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentlyPlaying, accessToken]);

    return (
        <div>
            <Header/>

            <div className="profile-top">
                <div className="profile-box">
                    <div>
                        <img className="profile-img" src={localDbUser?.icon || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png"}/>
                    </div>

                    <div>
                        <h1>{localDbUser?.username || "Loading..."}</h1>
                        <h2>
                            <span className="clickable-text" onClick={() => handleLoadFollowList('followers')}>
                                {localDbUser?.followers?.length || 0} Followers
                            </span>
                            {' '}
                            <span className="clickable-text" onClick={() => handleLoadFollowList('following')}>
                                {localDbUser?.following?.length || 0} Following
                            </span>
                        </h2>
                        {isEditingBio ? (
                            <div className="bio-edit">
                                <input
                                    type="text"
                                    value={bioText}
                                    onChange={(e) => setBioText(e.target.value)}
                                    className="bio-input"
                                    placeholder="Enter your bio..."
                                    autoFocus
                                />
                                <div className="bio-buttons">
                                    <button onClick={handleSaveBio} className="bio-save-btn">Save</button>
                                    <button onClick={handleCancelBio} className="bio-cancel-btn">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <h2 className={viewingOtherUser ? "" : "clickable-text"} onClick={viewingOtherUser ? undefined : handleEditBio}>
                                {localDbUser?.bio || (viewingOtherUser ? "No bio" : "Add a bio...")}
                            </h2>
                        )}

                        {!viewingOtherUser && currentlyPlaying && (
                            <div className="currently-playing">
                                <img
                                    src={currentlyPlaying.albumArt}
                                    alt={currentlyPlaying.trackName}
                                    className="currently-playing-art"
                                />
                                <div className="currently-playing-info">
                                    <p className="currently-playing-track">{currentlyPlaying.trackName}</p>
                                    <p className="currently-playing-artist">{currentlyPlaying.artist}</p>
                                    <p className="currently-playing-time">
                                        {Math.floor(localProgress / 60000)}:{String(Math.floor((localProgress % 60000) / 1000)).padStart(2, '0')} / {Math.floor(currentlyPlaying.durationMs / 60000)}:{String(Math.floor((currentlyPlaying.durationMs % 60000) / 1000)).padStart(2, '0')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="ratings-box">
                        <Link to={viewingOtherUser ? `/user/${localDbUser?.username}/ratings` : '/user/ratings'}>
                            <h1>{localDbUser?.username || "Loading..."}'s Ratings</h1>
                        </Link>
                        <Link to={viewingOtherUser ? `/user/${localDbUser?.username}/ratings` : '/user/ratings'}>
                            <img className="ratings-icon" src="https://icons.veryicon.com/png/o/miscellaneous/rookie-30-official-icon-library/button-arrow-right-1.png"/>
                        </Link>
                    </div>
                    <div className="user-ratings-box">
                        {loadingRatings ? (
                            <p className="ratings-loading">Loading ratings...</p>
                        ) : userRatings.length > 0 ? (
                            <div className="ratings-preview">
                                {userRatings.map((rating) => (
                                    <div key={rating._id} className="rating-preview-item">
                                        <img
                                            src={rating.albumCover || '/default-album.png'}
                                            alt={rating.albumName}
                                            className="rating-preview-cover"
                                        />
                                        <div className="rating-preview-info">
                                            <p className="rating-preview-album">{rating.albumName}</p>
                                            <p className="rating-preview-artist">{rating.artist}</p>
                                        </div>
                                        <div className="rating-preview-stars">
                                            {'★'.repeat(Math.floor(rating.stars))}{'☆'.repeat(5 - Math.floor(rating.stars))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-ratings-message">No ratings yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="top-columns">
                <div className="albums-section">
                    <div>
                        <div className="section-header">
                            <h1>Top Albums</h1>
                            {!viewingOtherUser && (
                                <button className="edit-albums-btn" onClick={handleEditTopAlbums}>Edit</button>
                            )}
                        </div>
                        <div className="top-spacing">
                            {topAlbumsData.length > 0 ? (
                                topAlbumsData.map((imageUrl, index) => (
                                    <img
                                        key={index}
                                        className="top-album"
                                        src={imageUrl || "/default-album.png"}
                                        alt={`Top Album ${index + 1}`}
                                    />
                                ))
                            ) : (
                                <p className="no-albums-text">
                                    {viewingOtherUser ? "No top albums" : "Click Edit to add your top albums"}
                                </p>
                            )}
                        </div>
                        <div className="rectangle"></div>
                    </div>

                    {viewingOtherUser ? (
                        localDbUser?.spotify_id && <MostListenedAlbums spotifyId={localDbUser.spotify_id} />
                    ) : (
                        user?.id && <MostListenedAlbums spotifyId={user.id} />
                    )}
                </div>

                <div className="artists-songs-section">
                    <div className="top-artist-container">
                        <h1>Top Artists</h1>
                        {topArtists.map((artist, index) => (
                            <div className="top-artists" key={index} onClick={() => window.open(artist.external_urls.spotify, "_blank")}>
                                <img src={artist.images[0]?.url} alt={artist.name} />
                                <h1>{artist.name}</h1>
                            </div>
                        ))}
                    </div>

                    <div className="top-artist-container">
                        <h1>Top Songs</h1>
                        {topTracks.map((track, index) => (
                            <div className="top-artists" key={index} onClick={() => window.open(track.external_urls.spotify, "_blank")}>
                                <img src={track.album.images[0]?.url} alt={track.name} />
                                <h1>{track.name}</h1>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Followers
                isOpen={activeList !== null}
                type={activeList}
                users={listUsers}
                onClose={() => setActiveList(null)}
                onUserClick={handleUserClick}
            />

            {isEditingTopAlbums && (
                <div className="modal-backdrop" onClick={handleCancelTopAlbums}>
                    <div className="modal-box top-albums-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h1>Edit Top Albums</h1>
                            <button className="modal-close" onClick={handleCancelTopAlbums}>X</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-subtitle">Select up to 4 albums ({selectedTopAlbums.length}/4)</p>

                            <AlbumSearch
                                accessToken={accessToken}
                                onAlbumSelect={handleAlbumSelect}
                            />

                            <div className="selected-albums">
                                {selectedTopAlbums.map((album) => (
                                    <div key={album.id} className="selected-album-item">
                                        <img
                                            src={album.images?.[0]?.url || album.images?.[1]?.url}
                                            alt={album.name}
                                        />
                                        <div className="selected-album-info">
                                            <p className="selected-album-name">{album.name}</p>
                                            <p className="selected-album-artist">{album.artists?.[0]?.name}</p>
                                        </div>
                                        <button
                                            className="remove-album-btn"
                                            onClick={() => handleRemoveAlbum(album.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button className="bio-save-btn" onClick={handleSaveTopAlbums}>Save</button>
                                <button className="bio-cancel-btn" onClick={handleCancelTopAlbums}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
