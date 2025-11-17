import './App.css';
import Header from './components/Header';
import Recently from './components/Recently';
import Review from './components/Review';

function App() {
  return (
    <div className="App">
      <Header/> 
      <Review/>
      <Recently/> 
    </div>
  );
}

export default App;
