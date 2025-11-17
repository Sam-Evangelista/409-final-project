import '../assets/Header.css';

function Header () {
    return (
        <div className="header">
            <img className='record' src="https://pngimg.com/d/vinyl_PNG18.png"/>
            <h1>RecorDB</h1>
            
            <div className='header-right'>
                <h2>Sign In!</h2>
                <img className='user' src="https://cdn-icons-png.flaticon.com/512/1144/1144760.png"/>            
            </div>
        </div>
    );
}
export default Header;