import { useState, useEffect } from 'react';
import { Rating as StarRating } from '@smastrom/react-rating';
import TracklistRanking from './TracklistRanking';
import Comments from './Comments';
import '../assets/Review.css';
import '@smastrom/react-rating/style.css';
import axios from "axios";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useUser } from '../context/UserContext';
import { getAlbum, getTracksBatch } from '../utils/spotifyCache';
import { getFromCache, setInCache, CACHE_KEYS, TTL } from '../utils/cache';
import { useNavigate } from 'react-router-dom';




function Review({ ratingId, userId }) {
    const [rating, setRating] = useState(null);
    const [albumInfo, setAlbumInfo] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [ratingUserInfo, setRatingUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);

    // Get token from context
    const { getToken, fetchDbUserById } = useUser();
    const ACCESS_TOKEN = getToken();
    const navigate = useNavigate();

    useEffect(() => {
      if (!ACCESS_TOKEN) return;

      const fetchAlbumAndTracks = async () => {
        try {
          // Fetch user info with caching
          if (userId) {
            const cachedUser = getFromCache(CACHE_KEYS.dbUserById(userId));
            if (cachedUser) {
              setUserInfo(cachedUser);
            } else {
              const userData = await fetchDbUserById(userId);
              setUserInfo(userData);
            }
          }

          // Fetch rating data
          // https://recordbackend.vercel.app
          // const ratingUrl = userId
          //   ? `http://127.0.0.1:8000/ratings/${ratingId}?user_id=${userId}`
          //   : `http://127.0.0.1:8000/ratings/${ratingId}`;
          const ratingUrl = userId
            ? `https://recordbackend.vercel.app/ratings/${ratingId}?user_id=${userId}`
            : `https://recordbackend.vercel.app/ratings/${ratingId}`;
          const ratingRes = await axios.get(ratingUrl);
          setRating(ratingRes.data);

          // Set initial liked state
          if (ratingRes.data.isLiked !== undefined) {
            setLiked(ratingRes.data.isLiked);
          }

          // Fetch rating author info with caching
          if (ratingRes.data.user_id) {
            const cachedRatingUser = getFromCache(CACHE_KEYS.dbUserById(ratingRes.data.user_id));
            if (cachedRatingUser) {
              setRatingUserInfo(cachedRatingUser);
            } else {
              const ratingUserData = await fetchDbUserById(ratingRes.data.user_id);
              setRatingUserInfo(ratingUserData);
            }
          }

          // Fetch album info using cached function (permanently cached)
          if (ratingRes.data.album_id) {
            const albumData = await getAlbum(ratingRes.data.album_id, ACCESS_TOKEN);
            setAlbumInfo(albumData);
          }

          // Fetch tracks using cached batch function
          if (ratingRes.data.tracklist_rating?.length > 0) {
            const tracksData = await getTracksBatch(ratingRes.data.tracklist_rating, ACCESS_TOKEN);
            const trackData = tracksData.map(t => ({
              id: t.id,
              name: t.name,
              duration_ms: t.duration_ms
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
    }, [ratingId, ACCESS_TOKEN, userId, fetchDbUserById]);
    
    
      

    const handleLikes = async () => {
      if (!userId) {
        console.error('User must be logged in to like');
        return;
      }

      try {
        // Optimistic UI update for smoothness
        const wasLiked = liked;
        setLiked(prev => !prev);
        setRating(prev => ({
          ...prev,
          likes: prev.likes + (wasLiked ? -1 : 1),
        }));

        // Call backend endpoint to toggle like
        
        // const response = await axios.patch(`http://127.0.0.1:8000/ratings/${ratingId}/like`, {
        //   user_id: userId
        // });
        const response = await axios.patch(`https://recordbackend.vercel.app/ratings/${ratingId}/like`, {
          user_id: userId
        });

        const { likes, isLiked } = response.data;

        // Update with actual backend values
        setLiked(isLiked);
        setRating(prev => ({ ...prev, likes }));

      } catch (error) {
        console.error("Error liking review:", error);
        // Revert optimistic update on error
        setLiked(!liked);
        setRating(prev => ({
          ...prev,
          likes: prev.likes + (liked ? 1 : -1),
        }));
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
                      {liked ? (
                        <i className="fa-solid fa-heart"></i>
                      ) : (
                        <i className="fa-regular fa-heart"></i>
                      )}
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
                        <img
                            className='rater-img'
                            src={ratingUserInfo?.icon || 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'}
                            alt={ratingUserInfo?.username || 'User'}
                            onClick={() => navigate(`/user/${rating.username}`)}
                            style={{ cursor: 'pointer' }}
                        />
                        <div>
                            <i
                                onClick={() => navigate(`/user/${rating.username}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                {rating.username}'s review
                            </i>
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
