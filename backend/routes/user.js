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

const refreshSpotifyToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    request.post(
      {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        },
        headers: {
          'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
        },
        json: true
      },
      (err, response, body) => {
        if (err) return reject(err);
        if (response.statusCode !== 200) return reject(new Error(`Token refresh failed: ${response.statusCode}`));
        resolve(body.access_token);
      }
    );
  });
};

router.get('/:spotifyId/top-albums-art', async (req, res) => {
  try {
    const user = await User.findOne({ spotify_id: req.params.spotifyId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const albumUrls = (Array.isArray(user.most_listened_albums) ? user.most_listened_albums : []).slice(0, 4);

    res.json(albumUrls);
  } catch (err) {
    console.error('Error in top-albums-art:', err);
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