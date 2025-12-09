import './App.css';
import Header from './components/Header';
import MakeRating from './components/MakeRating';
import Recently from './components/Recently';
import Review from './components/Review';
import { useState, useEffect } from "react";
import axios from "axios";
import Profile from './pages/Profile';


function App() {

  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUser] = useState(null);
  


  useEffect(() => {

    const ACCESS_TOKEN = localStorage.getItem("spotify_token");
      const spotifyId = localStorage.getItem("spotify_user_id");
      console.log(spotifyId);
      // const search = window.location.search;
      // const params = new URLSearchParams(search);
      // const ACCESS_TOKEN = params.get('access_token');
      // const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN;


    if (!spotifyId) {
      console.log("No spotifyId in localStorage");
      return;
    }

    axios.get(`http://127.0.0.1:8000/user/spotify/${spotifyId}`)
    .then((response) => {
      const userId = response.data._id;
      setUser(userId);
      console.log("User id:", userId);
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
    })
    .finally(() => {
      setLoading(false);
    });

}, []);


  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const ratingRes = await axios.get(`http://127.0.0.1:8000/ratings/`);
        const all_ratings = ratingRes.data.map(rating => rating._id);
        setRatings(all_ratings);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRatings();
  }, []);   // <-- correct place
  

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
