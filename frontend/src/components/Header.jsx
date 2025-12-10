import '../assets/Header.css';
import { Link, useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';

function Header () {
    const { spotifyUser: user, loading, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="header">
            <Link to='/home'>
                <img className='record' src="https://pngimg.com/d/vinyl_PNG18.png"/>
            </Link>

            <Link to='/home'>
                <h1 className="header-title">
                    RecorDB
                </h1>
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