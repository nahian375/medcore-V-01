import { Router } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import db from '../config/db.ts';

const router = Router();

router.get('/google/url', (req, res) => {
  const origin = req.query.origin as string || req.headers.origin || '';
  const redirectUri = `${origin}/api/auth/google/callback`;
  
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: origin
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl });
});

router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  // Use state to pass the redirectUri if needed, or just construct it
  // But Google requires exact match. Let's assume the client passes the origin in state
  const origin = (state as string) || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${origin}/api/auth/google/callback`;
  
  try {
    // Exchange code for token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });

    const { access_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id: googleId, email, name, picture } = userResponse.data;

    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?').get(googleId, email) as any;

    if (!user) {
      // Create new user
      const result = db.prepare('INSERT INTO users (google_id, email, name, photo) VALUES (?, ?, ?, ?)').run(googleId, email, name, picture);
      user = { id: result.lastInsertRowid, google_id: googleId, email, name, photo: picture };
    } else if (!user.google_id) {
      // Update existing user with google_id
      db.prepare('UPDATE users SET google_id = ?, photo = ? WHERE email = ?').run(googleId, picture, email);
      user.google_id = googleId;
      user.photo = picture;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, photo: user.photo },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Send success message to parent window and close popup
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                token: '${token}',
                user: ${JSON.stringify({ id: user.id, email: user.email, name: user.name, photo: user.photo })}
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth Error:', error);
    res.status(500).send('Authentication failed');
  }
});

export default router;
