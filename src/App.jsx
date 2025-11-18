import './App.css';
import Header from './components/Header';
import MakeRating from './components/MakeRating';
import Recently from './components/Recently';
import Review from './components/Review';

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
          <Review/>
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
