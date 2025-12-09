import './App.css';
import Header from './components/Header';
import MakeRating from './components/MakeRating';
import Recently from './components/Recently';
import Review from './components/Review';
import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from './context/UserContext';
import { getFromCache, setInCache, CACHE_KEYS, TTL } from './utils/cache';


function App() {

  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user data from context (cached)
  const { dbUser } = useUser();
  const userId = dbUser?._id;

  // Fetch all ratings with caching
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        // Check cache first
        const cached = getFromCache(CACHE_KEYS.ratings());
        if (cached) {
          setRatings(cached);
          setLoading(false);
          return;
        }

        const ratingRes = await axios.get(`http://127.0.0.1:8000/ratings/`);
        const all_ratings = ratingRes.data.map(rating => rating._id);

        // Cache for 1 minute (ratings change frequently)
        setInCache(CACHE_KEYS.ratings(), all_ratings, TTL.SHORT);
        setRatings(all_ratings);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);
  

if (loading) return (
  <div className="App">
      <Header/>
      <div className='columns'>
        <div className='column-1'>
          <div className='App-container'> 
            <h1 className='blur-text'>Following</h1>
            <h1>Popular Ratings</h1>
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
            <h1 className='blur-text'>Following</h1>
            <h1>Popular Ratings</h1>
          </div>
          <div className='ratings-container'>
          {ratings.map(rating_id => (
            <Review key={rating_id} ratingId={rating_id} userId={userId}/>
          ))}
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
