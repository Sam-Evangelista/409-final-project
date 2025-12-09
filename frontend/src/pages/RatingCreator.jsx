import { useState, useEffect } from 'react';
import '../assets/RatingCreator.css';
import AlbumSearch from '../components/AlbumSearch';
import { Rating } from '@smastrom/react-rating'
import TracklistRanking from '../components/TracklistRanking';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getAlbum, getTracksBatch } from '../utils/spotifyCache';
import { getFromCache, setInCache, TTL } from '../utils/cache';

import '@smastrom/react-rating/style.css'

function RatingCreator() {
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [tracks, setTracks] = useState([]);
    const [loadingTracks, setLoadingTracks] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();

    // Get user data from context (cached)
    const { spotifyUser: user, dbUser, getToken } = useUser();
    const ACCESS_TOKEN = getToken();

    // Fetch tracks when album is selected (with caching)
    useEffect(() => {
        const fetchAlbumTracks = async () => {
            if (!selectedAlbum?.id || !ACCESS_TOKEN) return;

            // Check cache first
            const cacheKey = `album_tracks_${selectedAlbum.id}`;
            const cached = getFromCache(cacheKey);
            if (cached) {
                setTracks(cached);
                return;
            }

            setLoadingTracks(true);
            try {
                const response = await fetch(
                    `https://api.spotify.com/v1/albums/${selectedAlbum.id}/tracks`,
                    {
                        headers: {
                            Authorization: `Bearer ${ACCESS_TOKEN}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch tracks');
                }

                const data = await response.json();
                const trackIds = data.items.map(track => track.id);

                if (trackIds.length > 0) {
                    // Use cached batch fetch
                    const trackDetails = await getTracksBatch(trackIds, ACCESS_TOKEN);
                    // Cache the album tracks result
                    setInCache(cacheKey, trackDetails, TTL.PERMANENT);
                    setTracks(trackDetails);
                } else {
                    setTracks(data.items || []);
                }
            } catch (error) {
                console.error('Error fetching album tracks:', error);
                setTracks([]);
            } finally {
                setLoadingTracks(false);
            }
        };

        fetchAlbumTracks();
    }, [selectedAlbum, ACCESS_TOKEN]);

    const handleAlbumSelect = (album) => {
        setSelectedAlbum(album);
        setReview(''); // Reset review when selecting a new album
        setRating(0); // Reset rating when selecting a new album
        setTracks([]); // Reset tracks
    };

    const handleBack = () => {
        setSelectedAlbum(null);
        setReview('');
        setRating(0);
        setTracks([]);
    };

    const handleRatingChange = (newRating) => {
        setRating(newRating);
    };

    const handleTrackReorder = (reorderedTracks) => {
        setTracks(reorderedTracks);
    };

    const handleSubmit = () => {
        if (!dbUser?._id) {
            console.error("No user ID found");
            return;
        }

        const trackIdStrings = tracks.map(track => track.name);

        axios.post('http://127.0.0.1:8000/ratings/', {
            user_id: dbUser._id,
            username: dbUser.username,
            album: selectedAlbum.name,
            album_id: selectedAlbum.id,
            album_cover: selectedAlbum.images[0].url,
            stars: rating,
            review: review,
            tracklist_rating: trackIdStrings,
          })
          .then(function (response) {
            console.log(response.data);
            setSubmitted(true);
            // Invalidate ratings cache since we added a new one
            import('../utils/cache').then(({ removeFromCache, CACHE_KEYS }) => {
                removeFromCache(CACHE_KEYS.ratings());
                removeFromCache(CACHE_KEYS.userRatings(dbUser.username));
            });
          })
          .catch(function (error) {
            console.error('Error:', error);
          });
    };

    if (submitted) {
        return (
            <div className="rating-creator-page">
                <div className="rating-creator-container">
                    <h1 className="success-title">Your rating has been successfully submitted!</h1>
                    <div className="success-buttons">
                    <button className="submit-button" onClick={() => navigate('/user/ratings/create')}>
                        Create another rating
                    </button>
                    <button className="submit-button" onClick={() => navigate('/user/ratings')}>
                        Go to your ratings
                    </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rating-creator-page">
            <div className="rating-creator-container">
                <h1 className="rating-creator-title">Create Rating</h1>
                
                {!selectedAlbum ? (
                    // Search view
                        <AlbumSearch
                            accessToken={ACCESS_TOKEN}
                            onAlbumSelect={handleAlbumSelect}
                        />
                ) : (
                    // Album review view
                    <div className="album-review-view">
                        <div className="album-rating-section">
                        <button className="back-button" onClick={handleBack}>
                            ← Select Different Album
                        </button>
                        <div className="album-info-section">
                            <img 
                                src={selectedAlbum.images?.[1]?.url || selectedAlbum.images?.[0]?.url} 
                                alt={selectedAlbum.name}
                                className="album-cover-large"
                            />
                            <div className="album-details">
                                <h2 className="album-title">{selectedAlbum.name}</h2>
                                <p className="album-artist">
                                    {selectedAlbum.artists.map((a) => a.name).join(", ")}
                                </p>
                                <p className="album-year">{selectedAlbum.release_date.split('-')[0]}</p>
                            </div>
                        </div>
                        <div className="rating-section">
                            <label htmlFor="rating-input" className="rating-label">Rating</label>
                            <div className="stars-container">
                            <Rating style={{ maxWidth: 250 }} value={rating} onChange={handleRatingChange} />
                            </div>
                        </div>
                        <div className="review-section">
                            <label htmlFor="review-input" className="review-label">Your Review</label>
                            <textarea
                                maxLength={1000}
                                id="review-input"
                                className="review-input"
                                placeholder="Write your review here... (max 1000 characters)"
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                rows={8}
                            />

                        </div>
                    
                        </div>
                        <div className="tracklist-section">
                            <div className="tracklist-content">
                                {loadingTracks ? (
                                    <div className="tracklist-loading">Loading tracks...</div>
                                ) : (
                                    <TracklistRanking tracks={tracks} onReorder={handleTrackReorder} />
                                )}
                            </div>
                            <button className="submit-button" onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RatingCreator;