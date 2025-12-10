import '../assets/Login.css';

function Login() { 
    return (
        <div className="login-box">
            <img className='user-icon' src='https://icons.iconarchive.com/icons/mahm0udwally/all-flat/256/User-icon.png'/>
            
            {/* <div className='spotify-button' onClick={() => window.location.href = "http://127.0.0.1:8000/spotify/login"}> */}
            <div className='spotify-button' onClick={() => window.location.href = "https://recordbackend.vercel.app/spotify/login"}>
                <img className='spotify-img' src='https://cdn-icons-png.flaticon.com/256/232/232436.png'/>
                <p>Sign in with Spotify</p>
            </div>
            
            
        </div>
    );
}

export default Login;