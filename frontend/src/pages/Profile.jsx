import Header from "../components/Header";
import Followers from "../components/Followers";
import AlbumSearch from "../components/AlbumSearch";
import '../assets/Profile.css';
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    USE_FAKE_DATA,
    fakeUser,
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
    // if (USE_FAKE_DATA) {
    //   setAlbumUrls(fakeAlbums || fakeDbUser.most_listened_albums);
    //   setLoading(false);
    //   return;
    // }

    if (!spotifyId) {
      setLoading(false);
      return;
    }

    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://127.0.0.1:8000/user/${spotifyId}/top-albums-art`);
        if (!res.ok) {
          setAlbumUrls([]);
          return;
        }
        const data = await res.json();

        setAlbumUrls(Array.isArray(data) ? data : []);
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
    const [user, setUser] = useState(null);
    const [dbUser, setDbUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);
    const [activeList, setActiveList] = useState(null);
    const [listUsers, setListUsers] = useState([]);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState('');
    const [isEditingTopAlbums, setIsEditingTopAlbums] = useState(false);
    const [selectedTopAlbums, setSelectedTopAlbums] = useState([]);
    const [topAlbumsData, setTopAlbumsData] = useState([]);

    const navigate = useNavigate();

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const urlToken = params.get('access_token');

    const accessToken = urlToken || localStorage.getItem('spotify_token');

    if (urlToken) {
        localStorage.setItem("spotify_token", urlToken);
    }

    const handleLoadFollowList = async (type) => {
        if (USE_FAKE_DATA) {
            setListUsers(type === 'followers' ? fakeFollowers : fakeFollowing);
            setActiveList(type);
            return;
        }

        if (!dbUser?._id) return;
        try {
            const res = await axios.get(`http://127.0.0.1:8000/user/${dbUser._id}/${type}`);
            setListUsers(res.data || []);
            setActiveList(type);
        } catch (err) {
            console.error(`Error fetching ${type}:`, err);
        }
    };

    const handleUserClick = (clickedUser) => {
        setActiveList(null);
        window.open(`https://open.spotify.com/user/${clickedUser.spotify_id}`, '_blank');
    };

    const handleEditBio = () => {
        setBioText(dbUser?.bio || '');
        setIsEditingBio(true);
    };

    const handleSaveBio = async () => {
        if (USE_FAKE_DATA) {
            setDbUser({ ...dbUser, bio: bioText });
            setIsEditingBio(false);
            return;
        }

        console.log("Saving bio, dbUser:", dbUser);
        if (!dbUser?._id) {
            console.error("No dbUser._id found");
            return;
        }
        try {
            console.log("Making PUT request to:", `http://127.0.0.1:8000/user/${dbUser._id}`);
            const res = await axios.put(`http://127.0.0.1:8000/user/${dbUser._id}`, {
                bio: bioText
            });
            console.log("Response:", res.data);
            setDbUser(res.data);
            setIsEditingBio(false);
        } catch (err) {
            console.error("Error updating bio:", err.response?.data || err.message);
        }
    };

    const handleCancelBio = () => {
        setIsEditingBio(false);
        setBioText(dbUser?.bio || '');
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
            setDbUser({ ...dbUser, top_albums: albumImageUrls });
            setTopAlbumsData(albumImageUrls);
            setIsEditingTopAlbums(false);
            return;
        }

        if (!dbUser?._id) return;
        try {
            const res = await axios.put(`http://127.0.0.1:8000/user/${dbUser._id}`, {
                top_albums: albumImageUrls
            });
            setDbUser(res.data);
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

    useEffect(() => {
        if (USE_FAKE_DATA) {
            setUser(fakeUser);
            setDbUser(fakeDbUser);
            setTopArtists(fakeTopArtists);
            setTopTracks(fakeTopTracks);
            setTopAlbumsData(fakeDbUser.top_albums);
            setLoading(false);
            return;
        }

        if (!accessToken) {
            console.log("No access token found");
            setLoading(false);
            return;
        }

        // Fetch user profile
        axios.get("http://127.0.0.1:8000/spotify/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        .then(res => {
            setUser(res.data);
            console.log("BACKEND RESPONSE:", res.data);
            localStorage.setItem("spotify_user_id", res.data.id);
            console.log("Spotify User ID:", res.data.id);
            setLoading(false);

            axios.get(`http://127.0.0.1:8000/user/spotify/${res.data.id}`)
                .then(dbRes => {
                    if (dbRes?.data) {
                        setDbUser(dbRes.data);
                        console.log("DB User:", dbRes.data);
                    }
                })
                .catch(dbErr => {
                    console.error("Error fetching db user:", dbErr);
                });
        })
        .catch(err => {
            console.error("Error fetching user:", err);
            setLoading(false);
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

      }, [accessToken]);

    useEffect(() => {
        if (dbUser?.top_albums && dbUser.top_albums.length > 0) {
            setTopAlbumsData(dbUser.top_albums);
        }
    }, [dbUser]);

    return (
        <div>
            <Header/>

            <div className="profile-top">
                <div className="profile-box">
                    <div>
                        <img className="profile-img" src={user?.images[0].url}/>
                        {<div className="profile-icons">
                            <img className="profile-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/250px-Spotify_icon.svg.png"/>
                            <img className="profile-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/2048px-Apple_Music_icon.svg.png"/>
                            <img className="profile-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/2048px-Youtube_Music_icon.svg.png"/>
                        </div>}
                    </div>

                    <div>
                        <h1>{user?.display_name || "Loading..."}</h1>
                        <h2>
                            <span className="clickable-text" onClick={() => handleLoadFollowList('followers')}>
                                {dbUser?.followers?.length || 0} Followers
                            </span>
                            {' '}
                            <span className="clickable-text" onClick={() => handleLoadFollowList('following')}>
                                {dbUser?.following?.length || 0} Following
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
                            <h2 className="clickable-text" onClick={handleEditBio}>
                                {dbUser?.bio || "Add a bio..."}
                            </h2>
                        )}
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
                <div className="albums-section">
                    <div>
                        <div className="section-header">
                            <h1>Top Albums</h1>
                            <button className="edit-albums-btn" onClick={handleEditTopAlbums}>Edit</button>
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
                                <p className="no-albums-text">Click Edit to add your top albums</p>
                            )}
                        </div>
                        <div className="rectangle"></div>
                    </div>

                    {user?.id && <MostListenedAlbums spotifyId={user.id} />}
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