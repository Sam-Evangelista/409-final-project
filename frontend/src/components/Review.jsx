import { useState, useEffect } from 'react';
import { Rating as StarRating } from '@smastrom/react-rating';
import TracklistRanking from './TracklistRanking';
import Comments from './Comments';
import '../assets/Review.css';
import '@smastrom/react-rating/style.css';
import axios from "axios";
import '@fortawesome/fontawesome-free/css/all.min.css';




function Review({ ratingId, userId }) {
    const [rating, setRating] = useState(null);
    const [albumInfo, setAlbumInfo] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [ratingUserInfo, setRatingUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);

    console.log("User id:", userId);

    //const ACCESS_TOKEN = localStorage.getItem("spotify_token");
    const ACCESS_TOKEN = 'BQC_uKVaz_tUeGLTxCWcfEvMLCbmUbjVHw44X5wTQoYS5a0udoaB1xmwvrCsjz1MsOE5uelTCnlJLTKv8NqKWz0dyds09j2ql514R3zKuvZA9Azbef49Fb0JtPtRZvX_URLVnQ0YZr6ZeU5DDf2GlmqbFSDLvasUAlAtYcHDlzdy5qNfiTmi7ws4t75rYYNC3ovMoL_gakn5CqbBSAKLreap_sFssZQHJw21VJ1lrZb2DlNBXFXJ97PSzfXejQ7UuALFKj0';
    const spotifyId = localStorage.getItem("spotify_user_id");
    console.log(spotifyId);
    console.log("Review Access token:", ACCESS_TOKEN);
      
    useEffect(() => {
      if (!spotifyId) return;
    
      const fetchAlbumAndTracks = async () => {
        try {
          const userRes = await axios.get(`http://127.0.0.1:8000/user/${userId}`);
          setUserInfo(userRes.data);
    
          const ratingRes = await axios.get(`http://127.0.0.1:8000/ratings/${ratingId}`);
          setRating(ratingRes.data);

          const rating_userRes = await axios.get(`http://127.0.0.1:8000/user/${ratingRes.data.user_id}`);
          setRatingUserInfo(rating_userRes.data);

    
          // Helper for requests with retry
          const axiosWithRetry = async (url, options, retries = 3) => {
            for (let i = 0; i < retries; i++) {
              try {
                return await axios.get(url, options);
              } catch (err) {
                if (err.response && err.response.status === 429) {
                  const retryAfter = parseInt(err.response.headers['retry-after'] || '1', 10);
                  console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
                  await new Promise(res => setTimeout(res, (retryAfter + 1) * 1000));
                } else {
                  throw err;
                }
              }
            }
            throw new Error('Max retries exceeded');
          };
    
          // Fetch album info with retry
          const albumRes = await axiosWithRetry(
            `https://api.spotify.com/v1/albums/${ratingRes.data.album_id}`,
            { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
          );
          setAlbumInfo(albumRes.data);
    
          // Fetch tracks in batch
          if (ratingRes.data.tracklist_rating?.length > 0) {
            const trackIds = ratingRes.data.tracklist_rating.join(',');
            const tracksRes = await axiosWithRetry(
              `https://api.spotify.com/v1/tracks?ids=${trackIds}`,
              { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
            );
            const trackData = tracksRes.data.tracks.map(t => ({
              id: t.id,
              name: t.name,
              duration: t.duration_ms
            }));
            setTracks(trackData);
          }
        } catch (err) {
          console.error('Error fetching rating data:', err);
        } finally {
          setLoading(false);
        }
      };
    
      fetchAlbumAndTracks();
    }, [ratingId]);
    
    
      

    const handleLikes = async () => {
      try {
        // Optimistic UI update for smoothness
        setLiked(prev => !prev);
        setRating(prev => ({
          ...prev,
          likes: prev.likes + (liked ? -1 : 1),
        }));
  
        //need to call backend endpoint to update rating with a like

        const res = {
          isLiked: true,
          likes: 2
        }
  
        // Update with actual backend values
        setLiked(res.isLiked);
        setRating(prev => ({ ...prev, likes: res.likes }));
  
      } catch (error) {
        console.error("Error liking review:", error);
      }
    };

    if (loading) {
        return <div className="review-loading">Loading review...</div>;
    }

    if (!rating) {
        return <div className="review-error">Review not found</div>;
    }

    return (
      <div className='review'>
        <div className='review-box'>

            <div className='left-side'>
              <div className='info'>
                <div className='album-box'>
                    {albumInfo?.images?.[0]?.url && (
                      <img className='album-img' src={albumInfo.images[0].url} alt="Album cover" />
                    )}
                    <img className='vinyl-img' src='https://pngimg.com/d/vinyl_PNG18.png' alt='vinyl' />
                </div>


                  <div className='review-details'>
                    <div className="title-box">
                        <h1>{albumInfo?.name || rating.album}</h1>
                        <h2>{albumInfo?.artists?.map((a) => a.name).join(", ") || 'Unknown Artist'}</h2>
                    </div>
                      <div className="stars-display">
                          <StarRating
                              style={{ maxWidth: 200 }}
                              value={rating.stars}
                              readOnly
                          />
                      </div>

                      <div className="likes-display" onClick={handleLikes} style={{ cursor: "pointer" }}>
                      <img
                        className="heart"
                        src={
                          liked
                            ? <i class="fa-solid fa-heart"></i> // filled heart
                            : <i class="fa-regular fa-heart"></i> // outline heart
                        }
                        alt="like"
                      />
                      <span>{rating.likes}</span>
                    </div>
                  </div>
              </div>
                
              <div className="review-text-section">
                  <h3 className="review-text-label">Review</h3>
                  <p className="review-text">{rating.review}</p>
              </div>
            </div>

            <div className='right-side'>

                <div className="rater-info">
                        <img className='rater-img' src={ratingUserInfo?.icon || 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'} alt={ratingUserInfo?.display_name || 'User'} />
                        <div>
                            <i>{rating.username}'s review</i>
                            <p className="review-date">{new Date(rating.date).toLocaleDateString()}</p>
                        </div>
                </div>
              <div className="review-tracklist-section">
                  {tracks.length > 0 ? (
                      <TracklistRanking
                          tracks={tracks}
                          readOnly={true}
                          initialOrder={rating.tracklist_rating}
                      />
                  ) : (
                      <div className="review-no-tracks">No tracklist ranking available</div>
                  )}
              </div>

            </div>

        </div>
        <div className="review-comments-section">
        <Comments ratingId={rating._id} commentIds={rating.comments  || []} userInfo={userInfo} />
      </div>
      </div>
     
    );
}

export default Review;
