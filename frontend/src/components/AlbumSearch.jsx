import React, { useState, useEffect, useRef } from "react";
import { searchAlbums } from "../utils/spotifyCache";

export default function AlbumSearch({ accessToken, onAlbumSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  // hide dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      // Use cached search function
      const albums = await searchAlbums(query, accessToken);
      setResults(albums);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [query, accessToken]);

  return (
    <div ref={containerRef} className="album-search-container">
      {/* Search box container */}
      <div className="album-search-box">
        <input
          type="text"
          placeholder="Search for an album..."
          className="album-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowDropdown(true)}
        />
      </div>

      {/* Dropdown results */}
      {showDropdown && results.length > 0 && (
        <ul className="album-search-dropdown">
          {results.map((album) => (
            <li
              key={album.id}
              onClick={() => {
                onAlbumSelect && onAlbumSelect(album);
                setShowDropdown(false);
                setQuery(album.name);
              }}
              className="album-search-item"
            >
              <img
                src={album.images?.[2]?.url || album.images?.[0]?.url}
                alt={album.name}
                className="album-search-image"
              />
              <div className="album-search-info">
                <p className="album-search-name">{album.name}</p>
                <p className="album-search-artist">
                  {album.artists.map((a) => a.name).join(", ")}
                </p>
                <p className="album-search-year">{album.release_date.split('-')[0]}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
