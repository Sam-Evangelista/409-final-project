import '../assets/Recently.css';

function Recently() {
    return (
        <div className='recently-box'>
            <h2>Recently Listened To</h2>
            {/* Content for recently viewed items goes here */}
            <div className='img-box'>
                <img className='recent-img' src="https://qodeinteractive.com/magazine/wp-content/uploads/2020/06/8-Tyler-the-Creator.jpg"/>
                <img className='recent-img' src="https://i.pinimg.com/474x/e7/28/7f/e7287f3d18b5b8ae025617df4baf012b.jpg"/>
                <img className='recent-img' src="https://qodeinteractive.com/magazine/wp-content/uploads/2020/06/16-Tame-Impala.jpg"/>
            </div>
        </div>
    );
}
export default Recently;