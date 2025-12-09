import { useState, useEffect } from "react";
import axios from "axios";
import ReviewModal from "../components/ReviewModal";
import "../assets/UserRating.css";
import { useNavigate } from 'react-router-dom';

//replace with session cookie from backend?
//const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN;

function UserRating() {
    const [mongoId, setMongoId] = useState(null);
    const [user, setUserInfo] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(null);

    const ACCESS_TOKEN = localStorage.getItem("spotify_token");
    

    const navigate = useNavigate();

    // 1. Get currently logged-in user
    //hardcoded for now, needs to get from session cookie sent from backend???

    // const user_id = '6934c1425922a9cee32e9a28';
    const spotify_id = localStorage.getItem("spotify_user_id");
    const spotifyId = localStorage.getItem("spotify_user_id");

    useEffect(() => {
        if (!spotifyId) {
            console.log("No spotifyId in localStorage");
            return;
        }

        axios.get(`http://127.0.0.1:8000/user/spotify/${spotifyId}`)
            .then(res => {
                console.log("Mongo user:", res.data);
                setMongoId(res.data._id);   // store the MongoDB _id
            })
            .catch(err => console.error("Error getting MongoDB user:", err));
    }, [spotifyId]);

    const username = 'maya ajit hi';

    // 2. Get user's ratings + album covers
    useEffect(() => {
        if (!mongoId) return;

        const fetchRatings = async () => {
            try {
                const userRes = await axios.get(`http://127.0.0.1:8000/user/${mongoId}`);
                console.log("Fetched user:", userRes.data);
                setUserInfo(userRes.data);

                const ratingsRes = await axios.get(
                    `http://127.0.0.1:8000/ratings/user/${userRes.data.username}`
                );

                const userRatings = ratingsRes.data;

                const ratingsWithCovers = await Promise.all(
                    userRatings.map(async (rating) => {
                        const albumRes = await fetch(
                            `https://api.spotify.com/v1/albums/${rating.album_id}`,
                            { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
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
    }, [mongoId]);


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
