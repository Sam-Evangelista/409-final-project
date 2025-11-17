import './App.css';
import Header from './components/Header';
import MakeRating from './components/MakeRating';
import Recently from './components/Recently';
import Review from './components/Review';

function App() {
  return (
    <div className="App">
      <Header/> 
      <Review/>
      <Recently/> 
      <MakeRating/>
    </div>
  );
}

export default App;
