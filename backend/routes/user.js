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

const getTopAlbumArtwork = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = await authToken.findOne({ user_id: user._id });
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    const fetchAlbumArt = (albumName) => {
      return new Promise((resolve) => {
        request.get(
          {
            url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(albumName)}&type=album&limit=1`,
            headers: {
              Authorization: `Bearer ${token.access_token}`
            },
            json: true
          },
          (err, response, body) => {
            if (err || response.statusCode !== 200) return resolve(null);

            const album = body.albums.items[0];
            if (!album) return resolve(null);

            resolve({
              name: album.name,
              image: album.images[0]?.url || null,
              spotify_id: album.id
            });
          }
        );
      });
    };

    const albums = await Promise.all(
      user.top_albums.map(fetchAlbumArt)
    );

    res.json(albums.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

router.get('/:id/top-albums', getTopAlbumArtwork);



module.exports = router;