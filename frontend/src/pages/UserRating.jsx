import { useState, useEffect } from "react";
import axios from "axios";
import ReviewModal from "../components/ReviewModal";
import "../assets/UserRating.css";
import { useNavigate } from 'react-router-dom';

//replace with session cookie from backend?
const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN;

function UserRating() {
    const [user, setUserInfo] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(null);

    const navigate = useNavigate();

    // 1. Get currently logged-in user
    //hardcoded for now, needs to get from session cookie sent from backend???
    const user_id = '6934c1425922a9cee32e9a28';
    const username = 'maya ajit';

    // 2. Get user's ratings + album covers
    useEffect(() => {
        if (!user_id) return;

        const fetchRatings = async () => {
            try {
                const userRes = await axios.get(`http://127.0.0.1:8000/user/${user_id}`);
                const userData = userRes.data;
                setUserInfo(userData);

                const res = await axios.get(
                    `http://127.0.0.1:8000/ratings/user/${userData.username}`
                );

                const userRatings = res.data;

                // Fetch album covers for each rating
                const ratingsWithCovers = await Promise.all(
                    userRatings.map(async (rating) => {

                        const albumRes = await fetch(
                            `https://api.spotify.com/v1/albums/${rating.album_id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                                },
                            }
                        );

                        const albumData = await albumRes.json();

                        return {
                            ...rating,
                            albumCover: albumData.images?.[1]?.url,
                            albumName: albumData.name,
                            artist: albumData.artists[0].name,
                        };
                    })
                );

                setRatings(ratingsWithCovers);
            } catch (error) {
                console.error("Error fetching ratings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRatings();
    }, [username]);

    if (loading) return <div className="loading">Loading your ratings...</div>;

    return (
        <div className="user-ratings-page">
            <div className="ratings-header">
                <img onClick={() => navigate('/user')}
                    className="user"
                    src={user?.icon || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png"}
                    alt="User"
                />
                <h1>{user?.username || "Loading..."}'s Ratings</h1>
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
    );
}

export default UserRating;
