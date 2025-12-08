// src/components/AddCommentBox.jsx
import { useState } from "react";
import '../assets/Comments.css';
import { FaPlus } from "react-icons/fa";

function AddCommentBox({ onSubmit }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
    setOpen(false);
    //TODO need to call backend to save comment
  };

  return (
    <>
      {/* Plus Button */}
      <button className="add-comment-btn" onClick={() => setOpen(true)}>
        <FaPlus size={70} color="#4D2727" />
      </button>

      {/* Modal */}
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpen(false)}>X</button>
            <h4 className="new-comment-title">Add a Comment</h4>

            <textarea
              className="new-comment-text"
              placeholder="Write your comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button onClick={handleSubmit} className="submit-comment-btn">
              Post
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AddCommentBox;
