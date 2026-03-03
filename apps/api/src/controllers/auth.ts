import { Request, Response } from 'express';

export const authController = {
  me(req: Request, res: Response) {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ ...user, sub: user.id });
  },
  googleAuth(_req: Request, res: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
    if (!clientId) return res.status(500).json({ error: 'Google OAuth not configured' });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20email%20profile`;
    res.redirect(url);
  },
  googleCallback(req: Request, res: Response) {
    const code = req.query.code as string;
    if (!code) return res.redirect('/?error=no_code');
    (async () => {
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      const tokenData = await tokenRes.json();
      if (tokenData.error) return res.redirect(`/?error=${tokenData.error}`);
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const user = await userRes.json();
      const { db } = await import('../db/client.js');
      await db.ensureUser(user.id, user.email, user.name || '', user.picture || '');
      const jwt = (await import('jsonwebtoken')).default;
      const token = jwt.sign(
        { sub: user.id, email: user.email, name: user.name, picture: user.picture },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      );
      const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontend}/auth/callback?token=${encodeURIComponent(token)}`);
    })().catch(() => res.redirect('/?error=auth_failed'));
  },
  logout(_req: Request, res: Response) {
    res.json({ ok: true });
  },
};
