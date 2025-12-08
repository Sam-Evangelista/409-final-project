const express = require('express');
const router = express.Router();

const User = require("../models/user");

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

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.get('/spotify/:spotifyId', getUserBySpotifyId);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

router.post('/follow', followUser);
router.post('/unfollow', unfollowUser);

module.exports = router;