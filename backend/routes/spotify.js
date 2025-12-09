const express = require('express');
const querystring = require('querystring');
const router = express.Router();
const request = require('request');

const authToken = require("../models/authToken")
const User = require("../models/user")

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const redirect_uri = 'http://127.0.0.1:8000/spotify/callback';

function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


router.get('/login', (req, res) => {
  var state = generateRandomString(16);
  var scope = 'user-read-private user-read-email user-top-read';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

router.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (!code) {
    return res.status(400).json({ error: 'missing_code' });
  }

  if (state === null) {
    return res.status(400).json({ error: 'state_mismatch' });
  }

  try {
    // Step 1: Exchange code for tokens
    const tokenResponse = await new Promise((resolve, reject) => {
      const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization':
            'Basic ' +
            Buffer.from(client_id + ':' + client_secret).toString('base64')
        },
        json: true
      };

      request.post(authOptions, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`Token error: ${response.statusCode}`));
        }
        resolve(body);
      });
    });

    const { access_token, token_type, scope, expires_in, refresh_token } = tokenResponse;

    // Step 2: Get user profile from Spotify
    const userProfile = await new Promise((resolve, reject) => {
      const options = {
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        json: true
      };

      request.get(options, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`Spotify API error: ${response.statusCode}`));
        }
        resolve(body);
      });
    });
    const spotifyId = userProfile.id;
    const displayName = userProfile.display_name;
    const icon = userProfile.images?.[0]?.url || null;

    // get top albums when logging in
    const topTracks = await new Promise((resolve, reject) => {
      const options = {
        url: 'https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=medium_term',
        headers: {
          Authorization: 'Bearer ' + access_token
        },
        json: true
      };

      request.get(options, (error, response, body) => {
        if (error) return reject(error);
        if (response.statusCode !== 200) {
          return reject(new Error(`Top tracks error: ${response.statusCode}`));
        }
        resolve(body.items);
      });
    });

    const mostListenedAlbums = [
      ...new Set(
        topTracks
          .map(track => track.album?.id)
          .filter(Boolean)
      )
    ].slice(0, 4);

    const existing = await User.findOne({spotify_id: spotifyId});

    if (!existing) {
          const user = new User({
          spotify_id: spotifyId,
          username: displayName,
          icon: icon,
          most_listened_albums: mostListenedAlbums
      });
      const saved_user = await user.save(user);
      const auth_Token = new authToken({
          user_id: saved_user._id,
          access_token: access_token,
          expires_in: expires_in,
          refresh_token: refresh_token
      });
      await auth_Token.save();
    } else {
        let atoken = await authToken.findOne({user_id:existing._id});
        if (!atoken) {
        // Auth token doesn't exist, create it
        atoken = new authToken({
          user_id: existing._id,
          access_token: access_token,
          expires_in: expires_in,
          refresh_token: refresh_token
        });
      } else {
        // Auth token exists, update it
        atoken.access_token = access_token;
        atoken.expires_in = expires_in;
        atoken.refresh_token = refresh_token;
      }
        existing.username = displayName;
        existing.icon = icon;
        existing.most_listened_albums = mostListenedAlbums;
        await existing.save();
        await atoken.save();
    }
    const frontendRedirect = `http://127.0.0.1:3000/user?access_token=${access_token}`;
    res.redirect(frontendRedirect);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'authentication_failed', message: error.message });
  }

});

router.get('/me', (req, res) => {
  // Option 1: from query string: /spotify/me?access_token=...
  let access_token = req.query.access_token;

  // Option 2: from Authorization header: "Bearer <token>"
  if (!access_token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts[0] === 'Bearer' && parts[1]) {
      access_token = parts[1];
    }
  }

  if (!access_token) {
    return res.status(400).json({ error: 'missing_access_token' });
  }

  const options = {
    url: 'https://api.spotify.com/v1/me',
    headers: {
      'Authorization': 'Bearer ' + access_token
    },
    json: true
  };

  request.get(options, (error, response, body) => {
    if (error) {
      console.error('Error calling /me:', error);
      return res.status(500).json({ error: 'spotify_request_failed' });
    }

    if (response.statusCode !== 200) {
      console.error('Spotify /me error:', body);
      return res
        .status(response.statusCode)
        .json({ error: 'spotify_api_error', details: body });
    }

    // Success: send Spotify's user object back to your frontend
    res.json(body);
  });
});

// GET /spotify/top/:type   where :type is "artists" or "tracks"
router.get('/top/:type', (req, res) => {
  let access_token = req.query.access_token;

  if (!access_token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts[0] === 'Bearer' && parts[1]) {
      access_token = parts[1];
    }
  }

  if (!access_token) {
    return res.status(400).json({ error: 'missing_access_token' });
  }

  const type = req.params.type; // "artists" or "tracks"
  if (!['artists', 'tracks'].includes(type)) {
    return res.status(400).json({ error: 'invalid_type' });
  }

  const options = {
    url: `https://api.spotify.com/v1/me/top/${type}?limit=5&time_range=medium_term`,
    headers: {
      Authorization: 'Bearer ' + access_token
    },
    json: true
  };

  request.get(options, (error, response, body) => {
    if (error) {
      console.error('Error calling /me/top:', error);
      return res.status(500).json({ error: 'spotify_request_failed' });
    }

    if (response.statusCode !== 200) {
      console.error('Spotify /me/top error:', body);
      return res
        .status(response.statusCode)
        .json({ error: 'spotify_api_error', details: body });
    }

    res.json(body);
  });
});

module.exports = router;