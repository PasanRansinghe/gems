const express = require('express');
const GemPost = require('../models/GemPost');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// GET all gem posts
router.get('/', async (req, res) => {
  try {
    const gemPosts = await GemPost.findAll();
    res.json(gemPosts);
  } catch (error) {
    console.error('Error fetching gem posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET filtered gem posts (for search)
router.get('/search', async (req, res) => {
  try {
    const { color, type } = req.query;
    const filters = {};
    if (color) filters.color = color;
    if (type) filters.type = type;

    const gemPosts = await GemPost.findByFilters(filters);
    res.json(gemPosts);
  } catch (error) {
    console.error('Error searching gem posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create a new gem post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      posted_date,
      gem_type,
      gem_color,
      gem_weight,
      gem_weight_unit,
      owner_name,
      contact_number,
      address,
      other_info
    } = req.body;

    // Validate required fields
    if (!posted_date || !gem_type || !gem_color || !gem_weight || !gem_weight_unit || !owner_name || !contact_number || !address) {
      return res.status(400).json({ message: 'All fields except other_info are required' });
    }

    const gemPostData = {
      user_id: req.user.userId,
      posted_date,
      gem_type,
      gem_color,
      gem_weight: parseFloat(gem_weight),
      gem_weight_unit,
      owner_name,
      contact_number,
      address,
      other_info: other_info || ''
    };

    const newGemPost = await GemPost.create(gemPostData);
    res.status(201).json({ message: 'Gem post created successfully', gemPost: newGemPost });
  } catch (error) {
    console.error('Error creating gem post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a gem post - ADD THIS NEW ENDPOINT
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;

    // First, check if the post exists and belongs to the user
    const post = await GemPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Gem post not found' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Delete the post
    await GemPost.delete(postId);
    
    res.json({ message: 'Gem post deleted successfully' });
  } catch (error) {
    console.error('Error deleting gem post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;