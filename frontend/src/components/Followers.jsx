import "../assets/Profile.css";

export default function Followers({ isOpen, type, users, onClose, onUserClick }) {
  if (!isOpen) return null;

  const title = type === "followers" ? "Followers" : "Following";

  const handleRowClick = (user) => {
    if (onUserClick) onUserClick(user);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h1>{title}</h1>
          <button className="modal-close" onClick={onClose}>
            X
          </button>
        </div>

        <div className="modal-body">
          {users.length === 0 ? (
            <p className="modal-empty">No {title.toLowerCase()} yet.</p>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className="modal-user-row clickable-row"
                onClick={() => handleRowClick(u)}
              >
                <img
                  src={u.icon}
                  alt={u.username}
                  className="modal-user-avatar-img"
                />
                <div className="modal-user-info">
                  <p className="modal-username">
                    {u.username || u.spotify_id || u._id}
                  </p>
                  <p className="modal-handle">
                    @{u.spotify_id || "unknown"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
