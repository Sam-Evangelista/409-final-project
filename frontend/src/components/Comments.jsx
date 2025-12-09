import { useState, useEffect } from 'react';
import '../assets/Comments.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AddCommentBox from "./AddCommentBox";
import axios from "axios";

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

        const fetchData = async () => {
            try {
    
            const commentRes = await axios.get(`http://127.0.0.1:8000/comments/rating/${ratingId}`);
            const commentData = commentRes.data;
            setComments(commentData);
            } catch (error) {
              console.error('Error fetching comments:', error);
            } finally {
                setLoading(false);
            }
          };
      
        fetchData();
    }, [commentIds, ratingId]);


        /*
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
    }, [commentIds, ratingId]);*/


    const handleLike = async (id, isChild = false) => {
        try {
            // Call backend to increment likes
            const response = await axios.patch(`http://127.0.0.1:8000/comments/${id}/like`);
            const updatedLikes = response.data.likes;
    
            // Update state locally
            setComments(prev =>
                prev.map(comment => {
                    if (!isChild) {
                        if (comment._id === id) {
                            return { ...comment, isLiked: true, likes: updatedLikes };
                        }
                        return comment;
                    }
    
                    const updatedChildren = comment.child_comments.map(child => {
                        if (child._id === id) {
                            return { ...child, isLiked: true, likes: updatedLikes };
                        }
                        return child;
                    });
    
                    return { ...comment, child_comments: updatedChildren };
                })
            );
        } catch (err) {
            console.error("Error liking comment:", err);
        }
    };

    const openModal = async (index) => {
        setActiveIndex(index);
        setShowReplyBox(false);
        setReplyText('');
        setModalOpen(true);
    
        const parentId = comments[index]._id;
    
        try {
            const response = await axios.get(`http://127.0.0.1:8000/comments/${parentId}/replies`);
            const replies = response.data;
    
            // Inject replies into that comment
            setComments(prev =>
                prev.map((c, i) => {
                    if (i === index) {
                        return { 
                            ...c, 
                            child_comments: replies.map(r => ({
                                ...r,
                                isLiked: false // frontend-only state
                            }))
                        };
                    }
                    return c;
                })
            );
        } catch (error) {
            console.error("Error fetching replies:", error);
        }
    };
    

    const closeModal = () => setModalOpen(false);

    const goNext = () =>
        setActiveIndex(prev => (prev + 1) % comments.length);

    const goPrev = () =>
        setActiveIndex(prev => (prev - 1 + comments.length) % comments.length);

    const handleAddComment = async (text) => {
        if (!text.trim()) return;
    
        try {
            const response = await axios.post('http://127.0.0.1:8000/comments/', {
                user_id: userInfo._id,
                rating_id: ratingId,
                comment_body: text
            });
    
            const savedComment = response.data;
    
            setComments(prev => [...prev, {
                ...savedComment,
                isLiked: false,
                child_comments: savedComment.child_comments || []
            }]);
        } catch (err) {
            console.error("Error adding comment:", err);
        }
    };
    

    // Add a reply to an existing comment
    const handleAddReply = async (text) => {
        if (!text.trim()) return;

        const parentComment = comments[activeIndex]; // comment being replied to

        try {
            const response = await axios.post(`http://127.0.0.1:8000/comments/${parentComment._id}/reply`, {
                user_id: userInfo._id,
                comment_body: text
            });

            const savedReply = response.data;

            setComments(prev =>
                prev.map((c, i) => {
                    if (i === activeIndex) {
                        return {
                            ...c,
                            child_comments: [...c.child_comments, { 
                                ...savedReply, 
                                isLiked: false 
                            }]
                        };
                    }
                    return c;
                })
            );

            setReplyText('');
            setShowReplyBox(false);
        } catch (err) {
            console.error("Error adding reply:", err);
        }
    };


    if (loading) return <div>Loading comments…</div>;

    if (!comments.length) {
        return (
            <div className="comments-section">
                <h3>Comments</h3>
                <p>No comments yet. Be the first to comment!</p>

                <AddCommentBox onSubmit={(text) => handleAddComment(text)} />
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

                <AddCommentBox onSubmit={(text) => handleAddComment(text)} />
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
                                <button 
                                    className="submit-reply-btn"
                                    onClick={() => handleAddReply(replyText)}
                                >
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




