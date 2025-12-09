import { useState, useEffect } from 'react';
import '../assets/Comments.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AddCommentBox from "./AddCommentBox";

function Comments({ ratingId, commentIds = [], userInfo }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [newCommentText, setNewCommentText] = useState('');
    const [addCommentModal, setAddCommentModal] = useState(false);

    const [replyText, setReplyText] = useState('');
    const [showReplyBox, setShowReplyBox] = useState(false);

    // Fetch placeholder comments
    useEffect(() => {
        setLoading(true);

        const placeholderComments = commentIds.map((id, index) => ({
            _id: id,
            user_id: `user-${index}`,
            username: `user${index + 1}`,
            profilePic: `https://media.licdn.com/dms/image/v2/D5603AQEQwus3EcW9mA/profile-displayphoto-scale_400_400/B56Zh4BQQ_G0Ak-/0/1754360252022`,
            comment_body: `This is placeholder comment ${index + 1}.`,
            likes: Math.floor(Math.random() * 20),
            date: new Date(Date.now() - index * 86400000),
            child_comments: [
                {
                    _id: `${id}-1`,
                    username: `child1`,
                    profilePic: `https://i.pravatar.cc/50?img=${index + 1}`,
                    comment_body: `Child comment 1 of ${id}`,
                    likes: 3,
                    date: new Date()
                },
                {
                    _id: `${id}-2`,
                    username: `child2`,
                    profilePic: `https://i.pravatar.cc/50?img=${index + 1}`,
                    comment_body: `Child comment 2 of ${id}`,
                    likes: 1,
                    date: new Date()
                },
            ],
        }));

        setComments(placeholderComments);
        setLoading(false);
    }, [commentIds, ratingId]);

    const handleLike = (id, isChild = false) => {
        setComments(prev =>
            prev.map(comment => {
                if (!isChild) {
                    if (comment._id === id && !comment.isLiked) {
                        return { ...comment, isLiked: true, likes: comment.likes + 1 };
                    }
                    return comment;
                }

                const updatedChildren = comment.child_comments.map(child => {
                    if (child._id === id && !child.isLiked) {
                        return { ...child, isLiked: true, likes: child.likes + 1 };
                    }
                    return child;
                });

                return { ...comment, child_comments: updatedChildren };
            })
        );
    };

    const openModal = (index) => {
        setActiveIndex(index);
        setShowReplyBox(false);
        setReplyText('');
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const goNext = () =>
        setActiveIndex(prev => (prev + 1) % comments.length);

    const goPrev = () =>
        setActiveIndex(prev => (prev - 1 + comments.length) % comments.length);

    const handleAddComment = () => {
        if (!newCommentText.trim()) return;

        const newComment = {
            _id: `new-${Date.now()}`,
            username: userInfo.username,
            comment_body: newCommentText,
            likes: 0,
            isLiked: false,
            date: new Date(),
            child_comments: []
        };

        setComments(prev => [...prev, newComment]);
        setNewCommentText('');
        setAddCommentModal(false);
    };

    const handleAddReply = () => {
        if (!replyText.trim()) return;

        const newReply = {
            _id: `reply-${Date.now()}`,
            username: userInfo.username,
            profilePic: userInfo.icon || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
            comment_body: replyText,
            likes: 0,
            isLiked: false,
            date: new Date()
        };

        setComments(prev =>
            prev.map((c, i) => {
                if (i === activeIndex) {
                    return {
                        ...c,
                        child_comments: [...c.child_comments, newReply]
                    };
                }
                return c;
            })
        );

        setReplyText('');
        setShowReplyBox(false);
    };

    if (loading) return <div>Loading comments…</div>;

    if (!comments.length) {
        return (
            <div className="comments-section">
                <h3>Comments</h3>
                <p>No comments yet. Be the first to comment!</p>

                <AddCommentBox
                    onSubmit={(text) => {
                        const savedComment = {
                            username: userInfo.username,
                            profilePic: userInfo.icon,
                            comment_body: text,
                            likes: 0,
                            date: new Date(),
                            child_comments: []
                        };
                        setComments(prev => [...prev, savedComment]);
                    }}
                />
            </div>
        );
    }

    const activeComment = comments[activeIndex];

    return (
        <div className="comments-section">
            <h3>Comments ({comments.length})</h3>

            <div className="comments-list">
                {comments.map((comment, index) => (
                    <div key={comment._id} className="comment-item" onClick={() => openModal(index)}>
                        <div className="comment-header">
                            <img className="comment-profile-pic" src={comment.profilePic} alt="" />
                            <span>{comment.username}</span>
                        </div>

                        <div className="comment-body">{comment.comment_body}</div>

                        <button
                            className={`like-btn ${comment.isLiked ? 'liked' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLike(comment._id);
                            }}
                        >
                            {comment.isLiked ? (
                                <i className="fa-solid fa-heart"></i>
                            ) : (
                                <i className="fa-regular fa-heart"></i>
                            )}
                            {comment.likes}
                        </button>
                    </div>
                ))}

                <AddCommentBox
                    onSubmit={(text) => {
                        const savedComment = {
                            username: userInfo.username,
                            profilePic: userInfo.icon,
                            comment_body: text,
                            likes: 0,
                            date: new Date(),
                            child_comments: []
                        };
                        setComments(prev => [...prev, savedComment]);
                    }}
                />
            </div>

            {/* ---------------- MODAL ---------------- */}
            {modalOpen && activeComment && (
                <div className="comments-modal-overlay" onClick={closeModal}>
                    <div className="comments-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="comments-modal-close" onClick={closeModal}>X</button>

                        <div className="modal-comment-header">
                            <img className="comment-profile-pic" src={activeComment.profilePic} alt="" />
                            <h4>{activeComment.username}</h4>
                        </div>

                        <div className="modal-comment-text-container">
                        <p className="modal-comment-text">{activeComment.comment_body}</p>
                        </div>

                        <div className="modal-actions">

                                <button
                                className="reply-btn"
                                onClick={() => setShowReplyBox(!showReplyBox)} >
                                Reply
                            </button>
                            <button
                                className={`like-btn ${activeComment.isLiked ? 'liked' : ''}`}
                                onClick={() => handleLike(activeComment._id)}
                            >
                                {activeComment.isLiked ? (
                                    <i className="fa-solid fa-heart"></i>
                                ) : (
                                    <i className="fa-regular fa-heart"></i>
                                )}
                                {activeComment.likes}
                            </button>
                        </div>

                        {/* Reply Box */}
                        {showReplyBox && (
                            <div className="reply-box">
                                <textarea
                                    className="reply-textarea"
                                    placeholder="Write a reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={3}
                                />
                                <button className="submit-reply-btn" onClick={handleAddReply}>
                                    Post Reply
                                </button>
                            </div>
                        )}

                        {/* Replies */}
                        {activeComment.child_comments.length > 0 && (
                            <div className="modal-child-comments">
                                <h5>Replies</h5>

                                {activeComment.child_comments.map(child => (
                                    <div key={child._id} className="modal-child-comment">
                                        <img className="comment-profile-pic-small" src={child.profilePic} alt="" />
                                        <p><strong>{child.username}</strong>: {child.comment_body}</p>

                                        <button
                                            className={`like-btn ${child.isLiked ? 'liked' : ''}`}
                                            onClick={() => handleLike(child._id, true)}
                                        >
                                            {child.isLiked ? (
                                                <i className="fa-solid fa-heart"></i>
                                            ) : (
                                                <i className="fa-regular fa-heart"></i>
                                            )}
                                            {child.likes}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Modal Navigation */}
                        <div className="comments-modal-navigation">
                            <button onClick={goPrev}>←</button>
                            <button onClick={goNext}>→</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Comments;




