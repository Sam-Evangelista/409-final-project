import './App.css';
import Header from './components/Header';
import MakeRating from './components/MakeRating';
import Recently from './components/Recently';
import Review from './components/Review';
import UserSearch from './components/UserSearch';
import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from './context/UserContext';
import { getFromCache, setInCache, CACHE_KEYS, TTL } from './utils/cache';


function App() {

  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('popular'); // 'popular' or 'following'

  // Get user data from context (cached)
  const { dbUser, isAuthenticated } = useUser();
  const userId = dbUser?._id;

  // Fetch ratings based on active tab
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);

        if (activeTab === 'following') {
          // Fetch following feed if user is authenticated
          if (!isAuthenticated || !userId) {
            setRatings([]);
            setLoading(false);
            return;
          }

          // Check cache first
          const cached = getFromCache(CACHE_KEYS.followingRatings(userId));
          if (cached) {
            setRatings(cached);
            setLoading(false);
            return;
          }

          const ratingRes = await axios.get(`http://127.0.0.1:8000/ratings/following/${userId}`);
          const following_ratings = ratingRes.data.map(rating => rating._id);

          // Cache for 1 minute
          setInCache(CACHE_KEYS.followingRatings(userId), following_ratings, TTL.SHORT);
          setRatings(following_ratings);
        } else {
          // Fetch popular ratings
          const cached = getFromCache(CACHE_KEYS.ratings());
          if (cached) {
            setRatings(cached);
            setLoading(false);
            return;
          }

          const ratingRes = await axios.get(`http://127.0.0.1:8000/ratings/popular/ratings`);
          const all_ratings = ratingRes.data.map(rating => rating._id);

          // Cache for 1 minute (ratings change frequently)
          setInCache(CACHE_KEYS.ratings(), all_ratings, TTL.SHORT);
          setRatings(all_ratings);
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [activeTab, userId, isAuthenticated]);
  

if (loading) return (
  <div className="App">
      <Header/>
      <div className='columns'>
        <div className='column-1'>
          <div className='App-container'>
            <h1
              className={!isAuthenticated ? 'blur-text' : 'clickable-tab' + (activeTab === 'following' ? ' active-tab' : '')}
              onClick={() => isAuthenticated && setActiveTab('following')}
            >
              Following
            </h1>
            <h1
              className={'clickable-tab' + (activeTab === 'popular' ? ' active-tab' : '')}
              onClick={() => setActiveTab('popular')}
            >
              Popular Ratings
            </h1>
            <UserSearch currentUserId={userId} />
          </div>
          <div className='ratings-container'>
              <h1 className="loading-text">Loading ratings...</h1>
          </div>
        </div>
        <div className='column-2'>

        <Recently/>
        </div>
      </div>
      <div className='rating-alignment'>
        <MakeRating/>
      </div>
    </div>
);



  return (
    <div className="App">
      <Header/>
      <div className='columns'>
        <div className='column-1'>
          <div className='App-container'>
            <h1
              className={!isAuthenticated ? 'blur-text' : 'clickable-tab' + (activeTab === 'following' ? ' active-tab' : '')}
              onClick={() => isAuthenticated && setActiveTab('following')}
            >
              Following
            </h1>
            <h1
              className={'clickable-tab' + (activeTab === 'popular' ? ' active-tab' : '')}
              onClick={() => setActiveTab('popular')}
            >
              Popular Ratings
            </h1>
            <UserSearch currentUserId={userId} />
          </div>
          <div className='ratings-container'>
          {ratings.length > 0 ? (
            ratings.map(rating_id => (
              <Review key={rating_id} ratingId={rating_id} userId={userId}/>
            ))
          ) : (
            <p className="no-ratings-text">
              {activeTab === 'following'
                ? "No ratings from people you follow yet. Start following users to see their ratings here!"
                : "No ratings available"
              }
            </p>
          )}
          </div>
        </div>
        <div className='column-2'>

        <Recently/>
        </div>
      </div>
      <div className='rating-alignment'>
        <MakeRating/>
      </div>
    </div>
  );
}

export default App;
