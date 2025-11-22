const express = require('express');
const querystring = require('querystring');
const router = express.Router();
const request = require('request');

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
  var scope = 'user-read-private user-read-email';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

router.get('/callback', (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (!code) {
    return res.status(400).json({ error: 'missing_code' });
  }

  // You *could* do a proper state check with cookies/session.
  // For now, just make sure it's present:
  if (state === null) {
    return res.status(400).json({ error: 'state_mismatch' });
  }

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
      console.error('Token request error:', error);
      return res.status(500).json({ error: 'token_request_failed' });
    }

    if (response.statusCode !== 200) {
      console.error('Spotify token response error:', body);
      return res
        .status(response.statusCode)
        .json({ error: 'token_response_error', details: body });
    }

    const access_token = body.access_token;
    const token_type = body.token_type;
    const scope = body.scope;
    const expires_in = body.expires_in;
    const refresh_token = body.refresh_token;

    // For now, just send them back so you can see it works
    res.json({
      access_token,
      token_type,
      scope,
      expires_in,
      refresh_token
    });
  });
});


module.exports = router;