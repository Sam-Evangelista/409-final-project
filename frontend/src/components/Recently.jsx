import '../assets/Recently.css';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';

function Recently() {
    const [recentAlbums, setRecentAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, getToken } = useUser();

    useEffect(() => {
        const fetchRecentlyPlayed = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            const token = getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                
                // const response = await axios.get('http://127.0.0.1:8000/spotify/recently-played', {
                //     headers: {
                //         Authorization: `Bearer ${token}`
                //     }
                // });
                const response = await axios.get('https://recordbackend.vercel.app/spotify/recently-played', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setRecentAlbums(response.data);
            } catch (error) {
                console.error('Error fetching recently played:', error);
                setRecentAlbums([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentlyPlayed();
    }, [isAuthenticated, getToken]);

    return (
        <div className='recently-box'>
            <h2>Recently Listened To</h2>
            <div className='img-box'>
                {!isAuthenticated ? (
                    <>
                        <img className='recent-img blurred' src="https://qodeinteractive.com/magazine/wp-content/uploads/2020/06/8-Tyler-the-Creator.jpg" alt="Blurred album 1"/>
                        <img className='recent-img blurred' src="https://i.pinimg.com/474x/e7/28/7f/e7287f3d18b5b8ae025617df4baf012b.jpg" alt="Blurred album 2"/>
                        <img className='recent-img blurred' src="https://qodeinteractive.com/magazine/wp-content/uploads/2020/06/16-Tame-Impala.jpg" alt="Blurred album 3"/>
                    </>
                ) : loading ? (
                    <p className="loading-text">Loading...</p>
                ) : recentAlbums.length > 0 ? (
                    recentAlbums.map((album) => (
                        <div key={album.id} className='recent-album-item'>
                            <img
                                className='recent-img'
                                src={album.image || 'https://via.placeholder.com/150'}
                                alt={album.name}
                            />
                            <div className='recent-album-info'>
                                <p className='recent-album-name'>{album.name}</p>
                                <p className='recent-album-artist'>{album.artist}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-recent-text">No recently played albums found</p>
                )}
            </div>
        </div>
    );
}
export default Recently;