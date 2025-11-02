// backend/routes/auth.js (FINAL FIXED VERSION)
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Use the User model
const { protect } = require('../middleware/auth');

// REGISTER (FIXED: Removes manual hashing)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ⭐️ FIX: Pass the plain password. The User model's pre('save') hook handles hashing.
    const user = await User.create({
      name,
      email,
      password: password, 
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      profileSetupComplete: user.profileSetupComplete || false,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

// LOGIN (FIXED: Uses matchPassword instance method)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ⭐️ CRITICAL FIX: Use the model's instance method for comparison ⭐️
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      profileSetupComplete: user.profileSetupComplete || false,
      // Ensure all profile fields are returned for frontend state
      headline: user.headline,
      about: user.about,
      experiences: user.experiences,
      skills: user.skills,
      profileImage: user.profileImage,
      phone: user.phone,
      bio: user.bio,
      university: user.university,
      major: user.major,
      year: user.year,
      interests: user.interests,
      github: user.github,
      linkedin: user.linkedin,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET CURRENT USER (Protected)
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is set by middleware/auth.js
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE CURRENT USER PROFILE (Protected)
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      name, email, phone, bio, university, major, year, interests,
      skills, github, linkedin, profileSetupComplete
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (university !== undefined) user.university = university;
    if (major !== undefined) user.major = major;
    if (year !== undefined) user.year = year;
    if (interests !== undefined) user.interests = interests;
    if (skills !== undefined) user.skills = skills;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (profileSetupComplete !== undefined) user.profileSetupComplete = profileSetupComplete;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, 
      phone: updatedUser.phone, bio: updatedUser.bio, 
      university: updatedUser.university, major: updatedUser.major,
      year: updatedUser.year, interests: updatedUser.interests,
      skills: updatedUser.skills, github: updatedUser.github, 
      linkedin: updatedUser.linkedin, profileSetupComplete: updatedUser.profileSetupComplete,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET PUBLIC PROFILE BY USER ID (Anyone can view)
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user and exclude sensitive information
    const user = await User.findById(userId).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return public profile information
    res.json({
      _id: user._id, name: user.name, email: user.email, bio: user.bio,
      university: user.university, major: user.major, year: user.year,
      interests: user.interests, skills: user.skills, github: user.github,
      linkedin: user.linkedin, profileImage: user.profileImage, createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

module.exports = router;