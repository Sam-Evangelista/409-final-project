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
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);

    console.log("User id:", userId);

    useEffect(() => {
      const ACCESS_TOKEN = localStorage.getItem("spotify_token");
      const spotifyId = localStorage.getItem("spotify_user_id");
      console.log(spotifyId);
      // const search = window.location.search;
      // const params = new URLSearchParams(search);
      // const ACCESS_TOKEN = params.get('access_token');
      // const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN;
      console.log("Review Access token:", ACCESS_TOKEN);
      if (!ratingId) return;
  
      const fetchData = async () => {
        try {

          if (!spotifyId) {
            console.log("No spotifyId in localStorage");
            return;
          }
                
          const userRes = await axios.get(`http://127.0.0.1:8000/user/${userId}`);
          const userData = userRes.data;
          setUserInfo(userData);

          const ratingRes = await axios.get(`http://127.0.0.1:8000/ratings/${ratingId}`);
          const ratingData = ratingRes.data;
          setRating(ratingData);
  
          const albumRes = await axios.get(`https://api.spotify.com/v1/albums/${ratingData.album_id}`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          });
          setAlbumInfo(albumRes.data);
  
          const trackData = [];
          for (const trackId of ratingData.tracklist_rating) {
            const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
              headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
            });
            const trackJson = await trackRes.json();
            trackData.push({
              id: trackId,
              name: trackJson.name,
              duration: trackJson.duration_ms,
            });
          }
          setTracks(trackData);
        } catch (error) {
          console.error('Error fetching rating data:', error);
        } 
      };
  
      fetchData();
      setLoading(false);
    // }, [ratingId, ACCESS_TOKEN]);
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





    // Placeholder function - will be replaced with actual API call
    /*
    useEffect(() => {
        // TODO: Replace with actual API call

      console.log(ratingId);
      const fetchRating = async () => {
          const response = await axios.get(`http://127.0.0.1:8000/ratings/${ratingId}`);
          setRating(response.data);
      };
      fetchRating();

      console.log(rating);

      const getAlbumInfo = async () => {
        const response = await axios.get(`https://api.spotify.com/v1/albums/${rating.album_id}`,
          {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
          }
        );
        setAlbumInfo(response.data);
      };
      getAlbumInfo();

      const fetchTracks = async () => {
      const tracks = await Promise.all(
        rating.tracklist_rating.map(async (track_id) => {
            const trackRes = await fetch(
                `https://api.spotify.com/v1/tracks/${track_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${ACCESS_TOKEN}`,
                    },
                }
            );

            const trackData = await trackRes.json();

              return {
                  id: track_id,
                  name: trackData.name,
                  duration: trackData.duration_ms,
              };
            })
          );
          }
        fetchTracks();
        setTracks(tracks);



  

        // Placeholder data based on ratingSchema
        const placeholderRating = {
            _id: ratingId || 'placeholder-id',
            user_id: 'user-id',
            username: 'cmonzon2',
            album: 'Debi Tirar Mas Fotos',
            album_id: '4m2880jivkbyQAK7jJg8qj',
            likes: 42,
            stars: 4.5,
            review: 'This is a placeholder review. The actual review will be fetched from the backend when the API is implemented. This album is amazing and I love every track on it!',
            tracklist_rating: ['track1', 'track2', 'track3'],
            comments: ['comment1', 'comment2'],
            date: new Date('2024-01-15')
        };

        // Placeholder album info - will be fetched from Spotify using album_id
        const placeholderAlbum = {
            id: placeholderRating.album_id,
            name: placeholderRating.album,
            artists: [{ name: 'Bad Bunny' }],
            images: [
                { url: 'data:image/jpeg;base64,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' }
            ],
            release_date: '2023-01-01'
        };

        // Placeholder tracks - will be fetched from Spotify
        const placeholderTracks = [
            { id: 'track1', name: 'Track 1', duration_ms: 180000 },
            { id: 'track2', name: 'Track 2', duration_ms: 200000 },
            { id: 'track3', name: 'Track 3', duration_ms: 190000 }
        ];

        // Placeholder user info
        const placeholderUser = {
            id: 'user-id',
            display_name: placeholderRating.username,
            images: [{ url: 'https://cdn-icons-png.freepik.com/512/6596/6596121.png' }]
        };

        setRating(placeholderRating);
        setAlbumInfo(placeholderAlbum);
        setTracks(placeholderTracks);
        setUserInfo(placeholderUser);
        setLoading(false);
    }, [ratingId]);*/

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
                        <img className='rater-img' src={userInfo?.icon || 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'} alt={userInfo?.display_name || 'User'} />
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
