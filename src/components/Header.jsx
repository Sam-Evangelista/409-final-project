import '../assets/Header.css';
import { Link } from 'react-router';

function Header () {
    return (
        <div className="header">
            <Link to='/'>
                <img className='record' src="https://pngimg.com/d/vinyl_PNG18.png"/>
            </Link>
            
            <Link to='/'>
                <h1>RecorDB</h1>
            </Link>
            
            <div className='header-right'>
                <Link to ='/login'>
                    <h2>Sign In!</h2>
                </Link>
                <Link to='/login'>
                    <img className='user' src="https://cdn-icons-png.flaticon.com/512/1144/1144760.png"/>            
                </Link>
            </div>
        </div>
    );
}
export default Header;