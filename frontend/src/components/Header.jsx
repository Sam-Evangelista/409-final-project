import '../assets/Header.css';
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Header () {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('spotify_token');

        if (!token || token === 'null') {
            setLoading(false);
            return;
        }

        axios.get("http://127.0.0.1:8000/spotify/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            setUser(res.data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Token invalid or expired:", err);
            // Clear invalid token
            localStorage.removeItem('spotify_token');
            localStorage.removeItem('spotify_user_id');
            setLoading(false);
        });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('spotify_user_id');
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="header">
            <Link to='/home'>
                <img className='record' src="https://pngimg.com/d/vinyl_PNG18.png"/>
            </Link>

            <Link to='/home'>
                <h1>RecorDB</h1>
            </Link>

            <div className='header-right'>
                {loading ? null : user ? (
                    <>
                        <Link to='/user' className='header-user-link'>
                            <h2>Hello, {user.display_name?.split(' ')[0] || 'User'}!</h2>
                            <img
                                className='user-avatar'
                                src={user.images?.[0]?.url || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png"}
                                alt={user.display_name}
                            />
                        </Link>
                        <button className='logout-btn' onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to='/login'>
                            <h2>Sign In!</h2>
                        </Link>
                        <Link to='/login'>
                            <img className='user' src="https://cdn-icons-png.flaticon.com/512/1144/1144760.png"/>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
export default Header;