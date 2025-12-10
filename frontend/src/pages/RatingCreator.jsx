import { useState, useEffect } from 'react';
import '../assets/RatingCreator.css';
import AlbumSearch from '../components/AlbumSearch';
import { Rating } from '@smastrom/react-rating';
import TracklistRanking from '../components/TracklistRanking';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { getTracksBatch } from '../utils/spotifyCache';
import { getFromCache, setInCache, TTL, removeFromCache, clearCacheByPrefix, CACHE_KEYS } from '../utils/cache';
import Header from "../components/Header";

import '@smastrom/react-rating/style.css';

function RatingCreator() {
    const [user, setUser] = useState(null); // Spotify user info
    const [mongoId, setMongoId] = useState(null); // MongoDB _id
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [tracks, setTracks] = useState([]);
    const [loadingTracks, setLoadingTracks] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();
    const ACCESS_TOKEN = localStorage.getItem("spotify_token");
    const spotifyId = localStorage.getItem("spotify_user_id");

    // Fetch Spotify user info
    useEffect(() => {
        if (!ACCESS_TOKEN) return;

        
        // axios.get("http://127.0.0.1:8000/spotify/me", {
        axios.get("https://recordbackend.vercel.app/spotify/me", {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        })
        .then(res => setUser(res.data))
        .catch(err => console.error("Error fetching /me:", err));
    }, [ACCESS_TOKEN]);

    // Fetch MongoDB _id using Spotify ID
    useEffect(() => {
        if (!spotifyId) return;
        
        // axios.get(`http://127.0.0.1:8000/user/spotify/${spotifyId}`)
        axios.get(`https://recordbackend.vercel.app/user/spotify/${spotifyId}`)
            .then(res => setMongoId(res.data._id))
            .catch(err => console.error("Error getting MongoDB user:", err));
    }, [spotifyId]);

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
                    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
                );
                if (!response.ok) throw new Error('Failed to fetch tracks');
                const data = await response.json();

                const trackIds = data.items.map(track => track.id);
                let trackDetails = [];

                if (trackIds.length > 0) {
                    trackDetails = await getTracksBatch(trackIds, ACCESS_TOKEN);
                } else {
                    trackDetails = data.items;
                }

                setInCache(cacheKey, trackDetails, TTL.PERMANENT);
                setTracks(trackDetails);
            } catch (err) {
                console.error('Error fetching album tracks:', err);
                setTracks([]);
            } finally {
                setLoadingTracks(false);
            }
        };

        fetchAlbumTracks();
    }, [selectedAlbum, ACCESS_TOKEN]);

    const handleAlbumSelect = (album) => {
        setSelectedAlbum(album);
        setReview('');
        setRating(0);
        setTracks([]);
    };

    const handleBack = () => {
        setSelectedAlbum(null);
        setReview('');
        setRating(0);
        setTracks([]);
    };

    const handleRatingChange = (newRating) => setRating(newRating);
    const handleTrackReorder = (reorderedTracks) => setTracks(reorderedTracks);

    const artistNames = selectedAlbum?.artists?.map(a => a.name).join(", ") || "";

    const handleSubmit = async () => {
        if (!user || !selectedAlbum || !mongoId) return;

        const trackNames = tracks.map(track => track.name);

        try {
            
            // const response = await axios.post('http://127.0.0.1:8000/ratings/', {
            const response = await axios.post('https://recordbackend.vercel.app/ratings/', {
                user_id: mongoId, // use MongoDB _id here
                username: user.display_name || user.username || 'Unknown User',
                album: selectedAlbum.name,
                album_id: selectedAlbum.id,
                album_cover: selectedAlbum.images?.[0]?.url || "",
                artist: artistNames,
                stars: rating,
                review: review,
                tracklist_rating: trackNames,
            });

            console.log(response.data);
            setSubmitted(true);

            // Invalidate ratings cache
            removeFromCache(CACHE_KEYS.ratings());
            removeFromCache(CACHE_KEYS.userRatings(user.display_name || user.username || 'Unknown User'));

            // Clear all following feed caches since followers might see this new rating
            clearCacheByPrefix('following_ratings_');
        } catch (err) {
            console.error('Error submitting rating:', err.response?.data ?? err.message);
        }
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
        <div>
        <Header/>
        <div className="rating-creator-page">
            <div className="rating-creator-container">
                <h1 className="rating-creator-title">Create Rating</h1>

                {!selectedAlbum ? (
                    <AlbumSearch accessToken={ACCESS_TOKEN} onAlbumSelect={handleAlbumSelect} />
                ) : (
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
                                    <p className="album-artist">{artistNames}</p>
                                    <p className="album-year">{selectedAlbum.release_date?.split('-')[0]}</p>
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
        </div>
    );
}

export default RatingCreator;



