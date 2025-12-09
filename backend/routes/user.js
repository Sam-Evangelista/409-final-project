const express = require('express');
const router = express.Router();
const request = require('request');

const User = require("../models/user");
const authToken = require('../models/authToken');

// takes in body to create
const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// gets all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers following ratings');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getUserFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('followers')
      .populate('followers');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.followers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const getUserFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('following')
      .populate('following');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.following);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const getUserBySpotifyId = async (req, res) => {
  try {
    const user = await User.findOne({ spotify_id: req.params.spotifyId });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// takes in userId and targetId
const followUser = async (req, res) => {
  const { userId, targetId } = req.body;

  try {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { following: targetId }
    });

    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: userId }
    });

    res.json({ message: 'Followed user' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// takes in userId and targetId
const unfollowUser = async (req, res) => {
  const { userId, targetId } = req.body;

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { following: targetId }
    });

    await User.findByIdAndUpdate(targetId, {
      $pull: { followers: userId }
    });

    res.json({ message: 'Unfollowed user' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

router.get('/:spotifyId/top-albums-art', async (req, res) => {
  try {
    // 1. Find the user by Spotify ID
    const user = await User.findOne({ spotify_id: req.params.spotifyId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2. Get their Spotify auth token from the authToken collection
    const tokenDoc = await authToken.findOne({ user_id: user._id });
    if (!tokenDoc) return res.status(401).json({ error: 'Missing auth token' });

    const accessToken = tokenDoc.access_token;

    // 3. Prefer `top_albums`, fallback to `most_listened_albums`, limit to first 4
    const albumIds = (Array.isArray(user.top_albums) && user.top_albums.length
      ? user.top_albums
      : (Array.isArray(user.most_listened_albums) ? user.most_listened_albums : [])
    ).slice(0, 4);

    // 4. Fetch album details from Spotify using the access token
    const fetchAlbum = (albumId) =>
      new Promise((resolve) => {
        request.get(
          {
            url: `https://api.spotify.com/v1/albums/${albumId}`,
            headers: { Authorization: `Bearer ${accessToken}` },
            json: true
          },
          (err, response, body) => {
            if (err || response.statusCode !== 200) return resolve(null);

            resolve({
              spotify_id: body.id,
              name: body.name,
              image: body.images?.[0]?.url || null,
              artist: body.artists?.[0]?.name || null
            });
          }
        );
      });

    // 5. Wait for all album fetches
    const albums = await Promise.all(albumIds.map(fetchAlbum));

    // 6. Return array of album artworks
    res.json(albums.filter(Boolean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', createUser);
router.get('/', getUsers);
router.get('/spotify/:spotifyId', getUserBySpotifyId);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

router.post('/follow', followUser);
router.post('/unfollow', unfollowUser);

router.get('/:id/following', getUserFollowing)
router.get('/:id/followers', getUserFollowers)

module.exports = router;