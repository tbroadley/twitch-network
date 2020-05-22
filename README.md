1. Go to https://id.twitch.tv/oauth2/authorize?client_id=[client_id]&redirect_uri=http://localhost&response_type=token, replacing `[client_id]` with your application's client ID.
2. Copy the access token from the URL to which you're redirected into `.env` as `TWITCH_ACCESS_TOKEN`.
3. `node index.js`
