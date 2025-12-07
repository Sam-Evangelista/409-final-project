import { useState, useEffect } from 'react';
import '../assets/Comments.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FaPlus } from "react-icons/fa";


function Comments({ ratingId, commentIds = [] }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [newCommentText, setNewCommentText] = useState('');
    const [addCommentModal, setAddCommentModal] = useState(false); // For adding a new comment

    // Fetch comments (placeholder for backend API)
    useEffect(() => {
        setLoading(true);

        // Placeholder data
        const placeholderComments = commentIds.map((id, index) => ({
            _id: id,
            user_id: `user-${index}`,
            username: `user${index + 1}`,
            profilePic: `https://media.licdn.com/dms/image/v2/D5603AQEQwus3EcW9mA/profile-displayphoto-scale_400_400/B56Zh4BQQ_G0Ak-/0/1754360252022?e=1766620800&v=beta&t=I8wC5MSCZasSyUyHgnHkmUK7Y6ZqWP1iQNDLlRWBfdU`,
            comment_body: `This is placeholder comment ${index + 1}.`,
            likes: Math.floor(Math.random() * 20),
            date: new Date(Date.now() - index * 86400000),
            child_comments: [
                { _id: `${id}-1`, username: `child1`, profilePic: `https://i.pravatar.cc/50?img=${index + 1}`, comment_body: `Child comment 1 of ${id}`, likes: 3, date: new Date() },
                { _id: `${id}-2`, username: `child2`, profilePic: `https://i.pravatar.cc/50?img=${index + 1}`, comment_body: `Child comment 2 of ${id}`, likes: 1, date: new Date() },
            ],
        }));

        setComments(placeholderComments);
        setLoading(false);
    }, [commentIds, ratingId]);

    const handleLike = (id, isChild = false) => {
        setComments((prevComments) => {
            return prevComments.map((comment, cIndex) => {
                if (isChild) {
                    // Look inside child_comments
                    const updatedChildren = comment.child_comments.map((child) => {
                        if (child._id === id && !child.isLiked) {
                            return {
                                ...child,
                                likes: child.likes + 1,
                                isLiked: true,
                            };
                        }
                        return child;
                    });
                    return { ...comment, child_comments: updatedChildren };
                } else {
                    if (comment._id === id && !comment.isLiked) {
                        return {
                            ...comment,
                            likes: comment.likes + 1,
                            isLiked: true,
                        };
                    }
                    return comment;
                }
            });
        });
    

        // TODO: call backend to update likes
        // axios.post(`/comments/${commentId}/like`);
    };

    const openModal = (index) => {
        setActiveIndex(index);
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const goNext = () => setActiveIndex((prev) => (prev + 1) % comments.length);
    const goPrev = () => setActiveIndex((prev) => (prev - 1 + comments.length) % comments.length);

    if (loading) return <div className="comments-loading">Loading comments...</div>;

    const handleAddComment = () => {
        if (!newCommentText.trim()) return;

        const newComment = {
            _id: `new-${Date.now()}`,
            username: 'You',
            comment_body: newCommentText,
            likes: 0,
            isLiked: false,
            date: new Date(),
            child_comments: [],
        };

        setComments((prev) => [...prev, newComment]);
        setNewCommentText('');
        setAddCommentModal(false);
    };

    if (!comments || comments.length === 0) {
        return (
            <div className="comments-section">
                <h3 className="comments-title">Comments</h3>
                <p className="comments-empty">No comments yet. Be the first to comment!</p>
                <div className="add-comment-box">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                    />
                    <button onClick={handleAddComment}>Post</button>
                </div>
            </div>
        );
    }

    const activeComment = comments[activeIndex];

    return (
        <div className="comments-section">
            <h3 className="comments-title">Comments ({comments.length})</h3>
            <div className="comments-list">
                {comments.map((comment, index) => (
                    <div
                        key={comment._id}
                        className="comment-item"
                        onClick={() => openModal(index)}
                    >
                        <div className="comment-header">
                            <img src={comment.profilePic} alt={comment.username} className="comment-profile-pic" />
                            <span className="comment-username">{comment.username}</span>
                        </div>
                        <div className="comment-body">{comment.comment_body}</div>
                        <div className="comment-footer">
                        <button
                                className={`like-btn ${comment.isLiked ? 'liked' : ''}`}
                                onClick={() => handleLike(comment._id)}
                            >
                                {comment.isLiked ? <i class="fa-solid fa-heart"></i> : <i class="fa-regular fa-heart"></i>} {comment.likes}
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    className="add-comment-btn"
                    onClick={() => setAddCommentModal(true)}
                >
                <FaPlus size={70} color="#4D2727" />
            </button>
            </div>

    

            {/* Add Comment Modal */}
            {addCommentModal && (
                <div className="modal-overlay" onClick={() => setAddCommentModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setAddCommentModal(false)}>X</button>
                        <h4 className='new-comment-title'>Add a New Comment</h4>
                        <textarea className='new-comment-text'
                            placeholder="Write your comment..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            rows={4}
                        />
                        <button onClick={handleAddComment} className="submit-comment-btn">Post</button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {modalOpen && activeComment && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>X</button>
                        <div className="modal-comment">
                            <div className='modal-comment-header'>
                            <img src={activeComment.profilePic} alt={activeComment.username} className="comment-profile-pic" />
                            <h4>{activeComment.username}</h4>
                            </div>
                            <div className='modal-comment-content'>
                            <p>{activeComment.comment_body}</p>
                            <div className="modal-likes">
                            <button
                                className={`like-btn ${activeComment.isLiked ? 'liked' : ''}`}
                                onClick={() => handleLike(activeComment._id)}>
                                {activeComment.isLiked ? <i class="fa-solid fa-heart"></i> : <i class="fa-regular fa-heart"></i>} {activeComment.likes}
                            </button>
                            </div>
                            </div>
                        </div>

                        {activeComment.child_comments && activeComment.child_comments.length > 0 && (
                            <div className="modal-child-comments">
                                <h5>Replies</h5>
                                {activeComment.child_comments.map((child) => (
                                    <div key={child._id} className="modal-child-comment">
                                        <img src={child.profilePic} alt={child.username} className="comment-profile-pic-small" />
                                            <p>{child.username}:</p>
                                            <p>{child.comment_body}</p>
                                            <button
                                            className={`like-btn ${child.isLiked ? 'liked' : ''}`}
                                                onClick={() => handleLike(child._id, true)}>
                                            {child.isLiked ? <i class="fa-solid fa-heart"></i> : <i class="fa-regular fa-heart"></i>} {child.likes}
                                            </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="modal-navigation">
                        <button onClick={goPrev} className="modal-nav-btn">←</button>
                        <button onClick={goNext} className="modal-nav-btn">→</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Comments;



