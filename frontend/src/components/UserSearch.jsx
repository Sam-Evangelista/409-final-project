import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/UserSearch.css";

export default function UserSearch({ currentUserId }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Hide dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced user search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        console.log("Searching for:", query);
        const response = await axios.get(`http://127.0.0.1:8000/user/search/${encodeURIComponent(query)}`);
        console.log("Search results:", response.data);

        // Check if current user is following each result
        let resultsWithFollowStatus = response.data;
        if (currentUserId) {
          const currentUserRes = await axios.get(`http://127.0.0.1:8000/user/${currentUserId}`);
          const followingIds = currentUserRes.data.following.map(f => f._id || f);

          resultsWithFollowStatus = response.data.map(user => ({
            ...user,
            isFollowing: followingIds.includes(user._id)
          }));
        }

        setResults(resultsWithFollowStatus);
        if (resultsWithFollowStatus.length > 0) {
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Error searching users:", err);
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [query, currentUserId]);

  const handleUserClick = (user) => {
    navigate(`/user/${user.username}`);
    setShowDropdown(false);
    setQuery("");
  };

  const handleFollow = async (e, targetUserId, isCurrentlyFollowing) => {
    e.stopPropagation();
    if (!currentUserId) return;

    try {
      if (isCurrentlyFollowing) {
        // Unfollow
        await axios.post('http://127.0.0.1:8000/user/unfollow', {
          userId: currentUserId,
          targetId: targetUserId
        });
        setResults(prev => prev.map(user =>
          user._id === targetUserId ? { ...user, isFollowing: false } : user
        ));
      } else {
        // Follow
        await axios.post('http://127.0.0.1:8000/user/follow', {
          userId: currentUserId,
          targetId: targetUserId
        });
        setResults(prev => prev.map(user =>
          user._id === targetUserId ? { ...user, isFollowing: true } : user
        ));
      }
    } catch (err) {
      console.error("Error following/unfollowing user:", err);
    }
  };

  return (
    <div ref={containerRef} className="user-search-container">
      <div className="user-search-box">
        <input
          type="text"
          placeholder="Search users..."
          className="user-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowDropdown(true)}
        />
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="user-search-dropdown">
          {results.map((user) => (
            <li
              key={user._id}
              onClick={() => handleUserClick(user)}
              className="user-search-item"
            >
              <img
                src={user.icon || 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'}
                alt={user.username}
                className="user-search-image"
              />
              <div className="user-search-info">
                <p className="user-search-name">{user.username}</p>
                {user.bio && <p className="user-search-bio">{user.bio}</p>}
              </div>
              {currentUserId && currentUserId !== user._id && (
                <button
                  className={`user-search-follow-btn ${user.isFollowing ? 'following' : ''}`}
                  onClick={(e) => handleFollow(e, user._id, user.isFollowing)}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
