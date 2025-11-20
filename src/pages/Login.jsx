import '../assets/Login.css';
import { Link } from 'react-router';

function Login() { 
    return (
        <div className="login-box">
            <img className='user-icon' src='https://icons.iconarchive.com/icons/mahm0udwally/all-flat/256/User-icon.png'/>
            <Link to='/user'>
                <button>Sign in with Spotify</button>
            </Link>
        </div>
    );
}

export default Login;