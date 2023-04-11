const express = require("express");
const multer = require("multer");
const storage = require("../../config/cloudinary");
const {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  deletePostCtrl,
  updatePostCtrl,
} = require("../../controllers/posts/posts");
const postRoutes = express.Router();
const isLogin = require("../../middlewares/isLogin");
const Post = require("../../models/post/post");

// instance of multer
const upload = multer({ storage });

// Render post creation form
postRoutes.get("/create-post-form", (req, res) => {
  res.render("posts/addPost.ejs", {
    error: "",
  });
});

// render post update form
postRoutes.get("/get-update-form/:id", isLogin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.render("posts/updatePost.ejs", {
      post,
      error: "",
    });
  } catch (error) {
    res.render("posts/updatePost.ejs", {
      post: "",
      error: error.message,
    });
  }
});

// ===========API
// POST /api/v1/posts
postRoutes.post("/", isLogin, upload.single("post_image"), createPostCtrl);

// GET /api/v1/posts
postRoutes.get("/", fetchPostsCtrl);

// GET /api/v1/posts/:id
postRoutes.get("/:id", fetchPostCtrl);

// DELETE /api/v1/posts/:id
postRoutes.delete("/:id", isLogin, deletePostCtrl);

// PUT /api/v1/posts/:id
postRoutes.put("/:id", isLogin, upload.single("post_image"), updatePostCtrl);

module.exports = postRoutes;
