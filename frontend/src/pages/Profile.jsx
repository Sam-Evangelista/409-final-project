import Header from "../components/Header";
import '../assets/Profile.css';
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";

function Profile () {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const accessToken = params.get('access_token');

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
        .then(res => {
            setUser(res.data);
          console.log("Spotify /me response:", res.data);   // THIS LOGS THE JSON
        })
        .catch(err => {
          console.error("Error fetching /me:", err);
        });
      }, [accessToken]);

    return (
        <div>
            <Header/>

            
            <div className="profile-top">
                <div className="profile-box">
                    <div>
                        <img className="profile-img" src={user?.images[0].url}/>
                        <div className="profile-icons">
                            <img className="profile-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/250px-Spotify_icon.svg.png"/>
                            <img className="profile-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/2048px-Apple_Music_icon.svg.png"/>
                            <img className="profile-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/2048px-Youtube_Music_icon.svg.png"/>

                        </div>
                    </div>

                    <div>
                        <h1>{user?.display_name || "Loading..."}</h1>
                        <h2>25 Followers 27 Following</h2>
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
                    <div className="top-artists">
                        <img src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <h1>Tame Impala</h1>
                    </div>
                    <div className="top-artists">
                        <img src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <h1>Tame Impala</h1>
                    </div>
                    <div className="top-artists">
                        <img src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <h1>Tame Impala</h1>
                    </div>
                    <div className="top-artists">
                        <img src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <h1>Tame Impala</h1>
                    </div>
                </div>

                <div className="top-artist-container">
                    <h1>Top Songs</h1>
                    <div className="top-artists">
                        <img src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <h1>Tame Impala</h1>
                    </div>
                    <div className="top-artists">
                        <img src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <h1>Tame Impala</h1>
                    </div>
                    <div className="top-artists">
                        <img src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <h1>Tame Impala</h1>
                    </div>
                    <div className="top-artists">
                        <img src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"/>
                        <h1>Tame Impala</h1>
                    </div>
                </div>
                
                

            </div>
        </div>
    );
}

export default Profile;