import '../assets/Login.css';
import { Link } from 'react-router';

function Login() { 
    return (
        <div className="login-box">
            <img className='user-icon' src='https://icons.iconarchive.com/icons/mahm0udwally/all-flat/256/User-icon.png'/>
            {/* <Link to='/user'> */}
                <button onClick={() => window.location.href = "http://127.0.0.1:8000/spotify/login"}>Sign in with Spotify</button>
            {/* </Link> */}
        </div>
    );
}

export default Login;