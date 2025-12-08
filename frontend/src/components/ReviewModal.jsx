// ReviewModal.js
import { useState } from 'react';
import Review from './Review';
import '../assets/ReviewModal.css'; // for modal styling

function ReviewModal({ ratings, currentIndex, isOpen, onClose, setCurrentIndex }) {
    if (!isOpen) return null;
  
    const prevReview = () => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : ratings.length - 1));
    };
  
    const nextReview = () => {
      setCurrentIndex((prev) => (prev < ratings.length - 1 ? prev + 1 : 0));
    };
  
    const currentRating = ratings[currentIndex];
  
    return (
      <div className="modal-overlay" onClick={onClose}>
        {/* Left Arrow */}
        <button className="arrow left-arrow" onClick={(e) => { e.stopPropagation(); prevReview(); }}>
          &#8592;
        </button>
  
        {/* Modal Content */}
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <Review ratingId={currentRating._id} userId={currentRating.user_id} />
        </div>

        <button className="close-button" onClick={onClose}>
            &times;
          </button>
  
        {/* Right Arrow */}
        <button className="arrow right-arrow" onClick={(e) => { e.stopPropagation(); nextReview(); }}>
          &#8594;
        </button>
      </div>
    );
  }
  
  export default ReviewModal;