import '../assets/MakeRating.css';
import { useNavigate } from 'react-router-dom';




function MakeRating() {

    const navigate = useNavigate();
    return(
        <div className="makerating-box">
            <img onClick={() => navigate('/user/ratings/create')} src="https://cdn-icons-png.flaticon.com/256/25/25304.png"/>
            <h1>Make a Rating</h1>
        </div>
    );
}

export default MakeRating;