import '../assets/SignUp.css';

function SignUp() {
    return (
        <div className='sign-container'>
            <img className='user-icon' src='https://icons.iconarchive.com/icons/mahm0udwally/all-flat/256/User-icon.png'/>
            <h1>Sign Up</h1>
            
            <h2>Username</h2>
            <input type="text"/>
            
            <h2>Password</h2>
            <input type="text"/>

            <h2>Retype Password</h2>
            <input type="text"/>

            <button className='sign-button'>Sign Up</button>
        </div>
    )};

export default SignUp;