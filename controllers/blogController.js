const { Blog, User } = require('../models');

// Middleware to check user roles
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasRequiredRole = requiredRoles.some(role => {
      switch (role) {
        case 'vendor': return user.is_vendor;
        case 'admin': return user.is_admin;
        case 'user': return !user.is_vendor && !user.is_admin;
        default: return false;
      }
    });

    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Helper to normalize blog data for compatibility
const normalizeBlogData = (blog) => {
  const normalizedBlog = { ...blog };
  
  // Ensure title and heading are synchronized
  if (normalizedBlog.title && !normalizedBlog.heading) {
    normalizedBlog.heading = normalizedBlog.title;
  } else if (normalizedBlog.heading && !normalizedBlog.title) {
    normalizedBlog.title = normalizedBlog.heading;
  }
  
  // Ensure content and text are synchronized
  if (normalizedBlog.content && !normalizedBlog.text) {
    normalizedBlog.text = normalizedBlog.content;
  } else if (normalizedBlog.text && !normalizedBlog.content) {
    normalizedBlog.content = normalizedBlog.text;
  }
  
  return normalizedBlog;
};

// Create Blog -- Admin only
exports.createBlog = [
  checkRole(['admin']),
  async (req, res) => {
  try {
    const blogData = normalizeBlogData(req.body);
    
    const blog = await Blog.create({
      ...blogData,
      user_id: req.user.dataValues.id,
    });

    res.status(201).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
];

// Get All Blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['id'] // Remove 'name' attribute, only include 'id'
      }],
      order: [['createdAt', 'DESC']],
    });

    // Normalize blog data for frontend
    const normalizedBlogs = blogs.map(blog => {
      const plainBlog = blog.get({ plain: true });
      return normalizeBlogData(plainBlog);
    });

    res.status(200).json({
      success: true,
      blogs: normalizedBlogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Single Blog
exports.getBlogDetails = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id, {
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['id'] // Remove 'name' attribute, only include 'id'
      }],
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: "Blog not found",
      });
    }

    // Normalize blog data for frontend
    const plainBlog = blog.get({ plain: true });
    const normalizedBlog = normalizeBlogData(plainBlog);

    res.status(200).json({
      success: true,
      blog: normalizedBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update Blog -- Admin only
exports.updateBlog = [
  checkRole(['admin']),
  async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: "Blog not found",
      });
    }

    // Normalize the update data to ensure old and new field compatibility
    const updateData = normalizeBlogData(req.body);
    
    await blog.update(updateData);

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
];

// Delete Blog -- Admin only
exports.deleteBlog = [
  checkRole(['admin']),
  async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: "Blog not found",
      });
    }

    await blog.destroy();

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
];