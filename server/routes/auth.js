const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const twilio   = require('twilio');
const db       = require('../db');
const rateLimit = require('express-rate-limit');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Rate limit OTP sends — max 3 per phone per 10 min
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body.phone || req.ip,
  message: { error: 'Too many OTP requests. Try again in 10 minutes.' }
});

// ── SIGN UP ──────────────────────────────────────────
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  if (!full_name || !email || !password || !phone)
    return res.status(400).json({ error: 'All fields are required' });

  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    // Check email uniqueness
    const [emailRows] = await db.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (emailRows.length > 0)
      return res.status(409).json({ error: 'Email already registered' });

    // Check phone uniqueness — one phone, one account
    const [phoneRows] = await db.query(
      'SELECT id FROM users WHERE phone = ?', [phone]
    );
    if (phoneRows.length > 0)
      return res.status(409).json({ error: 'Phone number already in use' });

    const password_hash = await bcrypt.hash(password, 12);

    await db.query(
      `INSERT INTO users (full_name, email, password_hash, phone)
       VALUES (?, ?, ?, ?)`,
      [full_name, email, password_hash, phone]
    );

    res.status(201).json({ message: 'Account created. Please verify your phone.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── SEND OTP ─────────────────────────────────────────
// POST /api/auth/send-otp
router.post('/send-otp', otpLimiter, async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone is required' });

  try {
    // Phone must exist in users table
    const [rows] = await db.query(
      'SELECT id FROM users WHERE phone = ?', [phone]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'No account with this phone number' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Invalidate previous unused OTPs for this phone
    await db.query(
      'UPDATE phone_verifications SET used = 1 WHERE phone = ? AND used = 0',
      [phone]
    );

    await db.query(
      'INSERT INTO phone_verifications (phone, otp_code, expires_at) VALUES (?, ?, ?)',
      [phone, otp, expires_at]
    );

    await twilioClient.messages.create({
      body: `Your BeFit verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// ── VERIFY OTP ────────────────────────────────────────
// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp)
    return res.status(400).json({ error: 'Phone and OTP are required' });

  try {
    const [rows] = await db.query(
      `SELECT * FROM phone_verifications
       WHERE phone = ? AND otp_code = ? AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phone, otp]
    );

    if (rows.length === 0)
      return res.status(400).json({ error: 'Invalid or expired OTP' });

    // Mark OTP as used
    await db.query(
      'UPDATE phone_verifications SET used = 1 WHERE id = ?',
      [rows[0].id]
    );

    // Mark user phone as verified
    await db.query(
      'UPDATE users SET phone_verified = 1 WHERE phone = ?',
      [phone]
    );

    // Issue JWT
    const [userRows] = await db.query(
      'SELECT id, full_name, email, phone, tier FROM users WHERE phone = ?',
      [phone]
    );
    const user = userRows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, tier: user.tier },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── SIGN IN ───────────────────────────────────────────
// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];

    if (!user.phone_verified)
      return res.status(403).json({
        error: 'Phone not verified',
        phone: user.phone,
        needsVerification: true
      });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, tier: user.tier },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        tier: user.tier,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET PROFILE (protected) ───────────────────────────
// GET /api/auth/me
const authMiddleware = require('../middleware/authMiddleware');
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, full_name, email, phone, phone_verified, tier, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── UPDATE PROFILE (CRUD) ─────────────────────────────
// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { full_name } = req.body;
  if (!full_name)
    return res.status(400).json({ error: 'full_name is required' });

  try {
    await db.query(
      'UPDATE users SET full_name = ? WHERE id = ?',
      [full_name, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE ACCOUNT (CRUD) ─────────────────────────────
// DELETE /api/auth/account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;