import Header from "../components/Header";
import '../assets/Profile.css';
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import Followers from "../components/Followers";

function Profile () {
    const [user, setUser] = useState(null);
    const [dbUser, setDbUser] = useState(null);          
    const [activeList, setActiveList] = useState(null);  
    const [listUsers, setListUsers] = useState([]);      
    
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const accessToken = params.get('access_token');

    console.log(accessToken);
    // if (accessToken) {
        localStorage.setItem("spotify_token", accessToken);
    // }
    useEffect(() => {
        if (!accessToken) {
            console.log("No access token found");
            return;
        }
    
        axios.get("http://127.0.0.1:8000/spotify/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        .then(async (res) => {
            const spotifyUser = res.data;
            setUser(spotifyUser);

            try {
            const dbRes = await axios.get(
                `http://127.0.0.1:8000/user/spotify/${spotifyUser.id}`
            );
            setDbUser(dbRes.data);
            } catch (err) {
            console.error("Error fetching DB user:", err);
            }
        })
        .catch(err => {
            console.error("Error fetching /me:", err);
        });

        // Top artists
        axios.get("http://127.0.0.1:8000/spotify/top/artists", {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        .then(res => {
            console.log("Top artists:", res.data);
            setTopArtists(res.data.items || []);
        })
        .catch(err => console.error("Error fetching top artists:", err));

        // Top tracks
        axios.get("http://127.0.0.1:8000/spotify/top/tracks", {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        .then(res => {
            console.log("Top tracks:", res.data);
            setTopTracks(res.data.items || []);
        }).catch(err => console.error("Error fetching top tracks:", err));
        
        axios.get("http://127.0.0.1:8000/spotify/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        .then(res => {
            setUser(res.data);

            // Save Spotify user ID
            localStorage.setItem("spotify_user_id", res.data.id);

            console.log("Spotify User ID:", res.data.id);
        })
        .catch(err => console.error("Error fetching user id:", err));

      }, [accessToken]);

      const handleLoadFollowList = async (type) => {
        if (!dbUser?._id) return;
    
        try {
            const res = await axios.get(
              `http://127.0.0.1:8000/user/${dbUser._id}/${type}`
            );
            setActiveList(type);
            setListUsers(res.data); // array of user docs
        } catch (err) {
            console.error(`Error loading ${type}:`, err);
        }
    };
    return (
        <div>
            <Header/>

            <div className="profile-top">
                <div className="profile-box">
                    <div>
                        <img className="profile-img" src={user?.images[0].url}/>
                        {/* <div className="profile-icons">
                            <img className="profile-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/250px-Spotify_icon.svg.png"/>
                            <img className="profile-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/2048px-Apple_Music_icon.svg.png"/>
                            <img className="profile-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/2048px-Youtube_Music_icon.svg.png"/>

                        </div> */}
                    </div>

                    <div>
                        <h1>{user?.display_name || "Loading..."}</h1>
                        <h2>
                        <span
                            className="clickable-text"
                            onClick={() => handleLoadFollowList('followers')}
                        >
                            {dbUser?.followers?.length ?? 0} Followers
                        </span>
                        {" "}
                        <span
                            className="clickable-text"
                            onClick={() => handleLoadFollowList('following')}
                        >
                            {dbUser?.following?.length ?? 0} Following
                        </span>
                        </h2>

                        <h2>uiuc cs '27</h2>
                    </div>
                </div>
                            
                <div>
                    <div className="ratings-box">
                        <Link to='/user/ratings'>
                            <h1>{user?.display_name || "Loading..."}'s Ratings</h1>
                        </Link>
                        <Link to='/user/ratings'>
                            <img className="ratings-icon" src="https://icons.veryicon.com/png/o/miscellaneous/rookie-30-official-icon-library/button-arrow-right-1.png"/>
                        </Link>
                    </div>
                    <div className="user-ratings-box">
                        <h1>Testing</h1>
                    </div>
                </div>
            </div>

            <div className="top-columns">
                
                <div> 
                    <h1>Top Albums</h1>
                    <div className="top-spacing">
                        <img className="top-album" src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <img className="top-album" src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <img className="top-album" src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <img className="top-album" src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                    </div>
                    <div className="rectangle"></div>
                    <img/>

                    <h1>Most Listened to Albums</h1>
                    <div className="top-spacing">
                        <img className="top-album" src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <img className="top-album" src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <img className="top-album" src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <img className="top-album" src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                    </div>
                    <div className="rectangle"></div>
                </div>

                <div className="top-artist-container">
                    <h1>Top Artists</h1>
                    {topArtists.map((artist, index) => (
                        <div className="top-artists" key={index} onClick={() => window.open(artist.external_urls.spotify, "_blank")}>
                            <img src={artist.images[0].url} alt={artist.name} />
                            <h1>{artist.name}</h1>
                        </div>
                    ))}
                </div>

                <div className="top-artist-container">
                    <h1>Top Songs</h1>
                    {topTracks.map((track, index) => (
                    <div className="top-artists" key={index} onClick={() => window.open(track.external_urls.spotify, "_blank")}>
                        <img src={track.album.images[0].url} alt={track.name} />
                        <h1>{track.name.substring(0,12)}</h1>
                    </div>
                    ))}
                    
                </div>
            </div>
            <Followers
                isOpen={!!activeList}
                type={activeList}
                users={listUsers}
                onClose={() => setActiveList(null)}
                onUserClick={(u) => {
                    // window.location.href = `/user/profile/${u._id}`;
                    window.open(`https://open.spotify.com/user/${u.spotify_id}`, "_blank");
                    console.log("Clicked user:", u);
                }}
                />


        </div>
    );
}

export default Profile;