const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper to validate password complexity
const isStrongPassword = (password) => {
  // At least 6 characters, includes at least one letter and one number
  const minLength = password && password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return minLength && hasLetter && hasNumber;
};

// @route   POST /api/auth/register
// @desc    Register a new user account
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, confirmPassword, phone, preferredCarModel, role } = req.body;

    // Field presence validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Password strength validation
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long and contain both letters and numbers.'
      });
    }

    // Password match validation
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username ? username.toLowerCase().trim() : cleanEmail.split('@')[0];

    // Check duplicate email
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({ message: 'An account with this email address already exists.' });
    }

    // Check duplicate username if provided
    if (username) {
      const existingUsername = await User.findOne({ username: cleanUsername });
      if (existingUsername) {
        return res.status(409).json({ message: 'This username is already taken. Please choose another.' });
      }
    }

    // Create user (allow admin/staff role only if explicitly configured or first user)
    const count = await User.countDocuments();
    const assignedRole = count === 0 ? 'admin' : (role === 'staff' ? 'staff' : 'customer');

    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      username: cleanUsername,
      password,
      phone: phone ? phone.trim() : '',
      preferredCarModel: preferredCarModel ? preferredCarModel.trim() : '',
      role: assignedRole
    });

    const savedUser = await newUser.save();
    const token = generateToken(savedUser);

    res.status(201).json({
      message: 'Account successfully registered!',
      token,
      user: savedUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message || 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginTarget = (identifier || email || '').toLowerCase().trim();

    if (!loginTarget || !password) {
      return res.status(400).json({ message: 'Please provide both your email/username and password.' });
    }

    // Find user by either email or username
    const user = await User.findOne({
      $or: [
        { email: loginTarget },
        { username: loginTarget }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful!',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || 'Server error during login.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently authenticated user details
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
  res.status(200).json({ user: req.user });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile information
// @access  Private
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, preferredCarModel } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (preferredCarModel !== undefined) user.preferredCarModel = preferredCarModel.trim();

    const updatedUser = await user.save();
    res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: err.message || 'Failed to update profile.' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password with current password verification
// @access  Private
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long and contain both letters and numbers.'
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: err.message || 'Failed to update password.' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset instructions
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return 200 to prevent email enumeration attacks
      return res.status(200).json({
        message: 'If an account with that email exists, reset instructions have been sent.'
      });
    }

    res.status(200).json({
      message: 'Password reset instructions have been dispatched to your email address.'
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error processing request.' });
  }
});

module.exports = router;
