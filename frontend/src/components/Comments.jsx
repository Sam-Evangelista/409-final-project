import { useState, useEffect } from 'react';
import '../assets/Comments.css';

function Comments({ ratingId, commentIds = [] }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Placeholder function - will be replaced with actual API call
    useEffect(() => {
        // TODO: Replace with actual API call
        // const fetchComments = async () => {
        //     if (!commentIds || commentIds.length === 0) return;
        //     setLoading(true);
        //     try {
        //         const commentPromises = commentIds.map(id => 
        //             axios.get(`http://127.0.0.1:8000/comments/${id}`)
        //         );
        //         const responses = await Promise.all(commentPromises);
        //         setComments(responses.map(res => res.data));
        //     } catch (error) {
        //         console.error('Error fetching comments:', error);
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchComments();

        // Placeholder data
        const placeholderComments = commentIds.map((id, index) => ({
            _id: id,
            user_id: `user-${index}`,
            username: `user${index + 1}`,
            comment_body: `This is a placeholder comment ${index + 1}. The actual comments will be fetched from the backend when the API is implemented.`,
            likes: Math.floor(Math.random() * 20),
            date: new Date(Date.now() - index * 86400000) // Different dates
        }));

        setComments(placeholderComments);
    }, [commentIds, ratingId]);

    if (loading) {
        return <div className="comments-loading">Loading comments...</div>;
    }

    if (!comments || comments.length === 0) {
        return (
            <div className="comments-section">
                <h3 className="comments-title">Comments</h3>
                <p className="comments-empty">No comments yet. Be the first to comment!</p>
            </div>
        );
    }

    return (
        <div className="comments-section">
            <h3 className="comments-title">Comments ({comments.length})</h3>
            <div className="comments-list">
                {comments.map((comment) => (
                    <div key={comment._id} className="comment-item">
                        <div className="comment-header">
                            <span className="comment-username">{comment.username}</span>
                            <span className="comment-date">
                                {new Date(comment.date).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="comment-body">{comment.comment_body}</div>
                        <div className="comment-footer">
                            <span className="comment-likes">❤️ {comment.likes}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Comments;

