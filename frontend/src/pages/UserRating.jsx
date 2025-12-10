import { useState, useEffect } from "react";
import Header from "../components/Header";
import axios from "axios";
import ReviewModal from "../components/ReviewModal";
import "../assets/UserRating.css";
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getAlbumsBatch } from '../utils/spotifyCache';
import { getFromCache, setInCache, CACHE_KEYS, TTL } from '../utils/cache';

function UserRating() {
    const { username } = useParams(); // Get username from URL
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(null);
    const [targetUsername, setTargetUsername] = useState(null);
    const [targetUser, setTargetUser] = useState(null);

    // Get user data from context (cached)
    const { dbUser: user, getToken } = useUser();
    const ACCESS_TOKEN = getToken();

    const navigate = useNavigate();

    // Determine which user's ratings to fetch
    useEffect(() => {
        const fetchTargetUser = async () => {
            if (username) {
                setTargetUsername(username);
                // Fetch the target user's data
                try {
                    
                    // const usersRes = await axios.get(`http://127.0.0.1:8000/user/`);
                    const usersRes = await axios.get(`https://recordbackend.vercel.app/user/`);
                    const foundUser = usersRes.data.find(u => u.username === username);
                    if (foundUser) {
                        setTargetUser(foundUser);
                    }
                } catch (err) {
                    console.error("Error fetching target user:", err);
                }
            } else if (user?.username) {
                setTargetUsername(user.username);
                setTargetUser(user);
            }
        };

        fetchTargetUser();
    }, [username, user]);

    // Fetch user's ratings + album covers using batch API
    useEffect(() => {
        if (!targetUsername || !ACCESS_TOKEN) return;

        const fetchRatings = async () => {
            try {
                // Check cache first for user ratings
                const cacheKey = CACHE_KEYS.userRatings(targetUsername);
                const cachedRatings = getFromCache(cacheKey);

                if (cachedRatings) {
                    setRatings(cachedRatings);
                    setLoading(false);
                    return;
                }

                
                // const ratingsRes = await axios.get(
                //     `http://127.0.0.1:8000/ratings/user/${targetUsername}`
                // );
                const ratingsRes = await axios.get(
                    `https://recordbackend.vercel.app/ratings/user/${targetUsername}`
                );

                const userRatings = ratingsRes.data;

                if (userRatings.length === 0) {
                    setRatings([]);
                    setLoading(false);
                    return;
                }

                // Get unique album IDs
                const albumIds = [...new Set(userRatings.map(r => r.album_id).filter(Boolean))];

                // Batch fetch all albums at once (uses caching internally)
                const albums = await getAlbumsBatch(albumIds, ACCESS_TOKEN);

                // Create a map for quick lookup
                const albumMap = {};
                albums.forEach(album => {
                    if (album) {
                        albumMap[album.id] = album;
                    }
                });

                // Combine ratings with album data
                const ratingsWithCovers = userRatings.map(rating => {
                    const album = albumMap[rating.album_id];
                    return {
                        ...rating,
                        albumCover: album?.images?.[1]?.url || album?.images?.[0]?.url,
                        albumName: album?.name || rating.album,
                        artist: album?.artists?.[0]?.name || 'Unknown Artist',
                    };
                });

                // Cache the combined result for 5 minutes
                setInCache(cacheKey, ratingsWithCovers, TTL.MEDIUM);
                setRatings(ratingsWithCovers);
            } catch (error) {
                console.error("Error fetching ratings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRatings();
    }, [targetUsername, ACCESS_TOKEN]);


    if (loading) return <div className="loading">Loading your ratings...</div>;

    return (
        <div>
            <Header/>
        <div className="user-ratings-page">
            <div className="ratings-header">
                <img onClick={() => navigate(username ? `/user/${username}` : '/user')}
                    className="user"
                    src={targetUser?.icon || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png"}
                    alt="User"
                />
                <h1>{targetUsername || "Loading..."}'s Ratings</h1>
            </div>

            <div className="shelf-container">
            {Array.from({ length: Math.max(Math.ceil(ratings.length / 5), 3) }).map(
                (_, rowIndex) => {
                const rowAlbums = ratings.slice(rowIndex * 5, rowIndex * 5 + 5);

                return (
                    <div key={rowIndex} className="shelf-row">
                    <div className="albums">
                        {rowAlbums.map((r, index) => (
                        <div
                            key={r._id}
                            className="album-shelf-item"
                            onClick={() => setActiveIndex(rowIndex * 5 + index)}
                        >
                            <img
                            src={r.albumCover}
                            alt={r.albumName}
                            className="album-cover"
                            />
                        </div>
                        ))}
                    </div>
                    <div className="shelf"></div>
                    </div>
                );
                }
            )}
            </div>

            <ReviewModal
                ratings={ratings}
                currentIndex={activeIndex}
                setCurrentIndex={setActiveIndex}
                isOpen={activeIndex !== null}
                onClose={() => setActiveIndex(null)}
            />
        </div>
        </div>
    );
}

export default UserRating;
