import './App.css';
import Header from './components/Header';
import MakeRating from './components/MakeRating';
import Recently from './components/Recently';
import Review from './components/Review';

const example_rating = '693618a841e627ee811604bb'
const example_user_id = '6934c1425922a9cee32e9a28';

function App() {
  return (
    <div className="App">
      <Header/>
      <div className='columns'>
        <div className='column-1'>
          <div className='App-container'> 
            <h1 className='blur-text'>Following</h1>
            <h1>Popular Ratings</h1>
          </div>
          <Review  ratingId={example_rating} userId={example_user_id}/>
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
