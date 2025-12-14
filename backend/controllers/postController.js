// controllers/postController.js
const Post = require('../models/Post');
const { cloudinary } = require('../config/cloudinary'); // your existing config
const User = require('../models/User');
const RoommateProfile = require('../models/RoommateProfile');
// Create Post
// controllers/postController.js
// controllers/postController.js
const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const media = req.files?.map(file => ({
      url: file.path,
      public_id: file.filename,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image'
    })) || [];

    const post = await Post.create({
      author: req.user._id,
      content,
      media
    });

    // Manually populate author + avatar (consistent with getPosts)
    const author = await User.findById(req.user._id).select('name userType');
    const profile = await RoommateProfile.findOne({ user: req.user._id }).select('images');

    const populatedPost = {
      ...post.toObject(),
      author: {
        ...author.toObject(),
        avatar: profile?.images?.[0] || '/default-avatar.png'
      }
    };

    // SAFE SOCKET EMIT — This was crashing your request!
    if (req.io) {
      try {
        req.io.emit('newPost', populatedPost);
      } catch (emitError) {
        console.error('Socket emit failed (non-critical):', emitError);
        // Don't crash the whole request!
      }
    }

    // Send response FIRST — this must come before any risky operations
    res.status(201).json(populatedPost);

  } catch (err) {
    console.error('Create Post Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name userType')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });

    // 1. Collect all unique author IDs
    const authorIds = [...new Set(posts.map(p => p.author?._id).filter(Boolean))];

    // 2. Fetch profiles in one batch
    const profiles = await RoommateProfile.find(
      { user: { $in: authorIds } },
      { user: 1, images: 1 }
    );

    // 3. Create a lookup map: userId -> avatarUrl
    const avatarMap = {};
    profiles.forEach(prof => {
      if (prof.images && prof.images.length > 0) {
        avatarMap[prof.user.toString()] = prof.images[0];
      }
    });

    // 4. Attach avatars to posts
    const finalData = posts.map(p => {
      const authorObj = p.author ? p.author.toObject() : {};
      const authorIdStr = authorObj._id ? authorObj._id.toString() : null;

      return {
        ...p.toObject(),
        author: {
          ...authorObj,
          avatar: (authorIdStr && avatarMap[authorIdStr]) || '/default-avatar.png'
        }
      };
    });

    res.json(finalData);
  } catch (err) {
    console.error("Posts fetch error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Like / Unlike Post
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userIdStr = req.user._id.toString();
    const likedIndex = post.likes.findIndex(id => id.toString() === userIdStr);

    if (likedIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likedIndex, 1);
    }

    await post.save();

    // RE-POPULATE AUTHOR WITH AVATAR
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name userType')
      .populate('comments.user', 'name');

    // Manually fetch profile to get avatar (like we do in getPosts)
    const profile = await RoommateProfile.findOne({ user: post.author }).select('images');

    const postObj = updatedPost.toObject();
    if (postObj.author) {
      postObj.author.avatar = profile?.images?.[0] || '/default-avatar.png';
    }

    // Emit real-time update (with avatar)
    req.io?.emit('postUpdated', postObj);

    // RETURN THE FULL UPDATED POST
    res.json(postObj);
  } catch (err) {
    console.error('Like Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // CHECK OWNERSHIP
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // DELETE FROM CLOUDINARY (with correct resource_type)
    const { cloudinary } = require('../config/cloudinary');
    for (let m of post.media) {
      if (m.public_id) {
        await cloudinary.uploader.destroy(m.public_id, {
          resource_type: m.type === 'video' ? 'video' : 'image'
        });
      }
    }

    // THIS IS THE FIX – USE deleteOne() or findByIdAndDelete()
    await Post.findByIdAndDelete(req.params.id);
    // OR: await post.deleteOne();

    // Emit real-time
    if (req.io) req.io.emit('postDeleted', req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('DELETE POST ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  deletePost
};