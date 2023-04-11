const express = require("express");
const multer = require("multer");
const storage = require("../../config/cloudinary");
const {
  registerCtrl,
  loginCtrl,
  userDetailsCtrl,
  profileCtrl,
  uploadProfilePhotoCtrl,
  uploadCoverPhotoCtrl,
  updatePasswordCtrl,
  updateUserCtrl,
  logoutCtrl,
} = require("../../controllers/users/users");
const isLogin = require("../../middlewares/isLogin");
const userRoutes = express.Router();

// instance of multer
const upload = multer({ storage });

// =========== Rendering forms
// Login Form
userRoutes.get("/login", (req, res) => {
  res.render("users/login.ejs", {
    error: "",
  });
});

// Register Form
userRoutes.get("/register", (req, res) => {
  res.render("users/register.ejs", {
    error: "",
  });
});

// upload profile photo
userRoutes.get("/upload-profile-photo-form", (req, res) => {
  res.render("users/uploadProfilePhoto.ejs", {
    error: "",
  });
});

// upload cover photo
userRoutes.get("/upload-cover-photo-form", (req, res) => {
  res.render("users/uploadCoverPhoto.ejs", {
    error: "",
  });
});

// update user password form
userRoutes.get("/update-user-password", (req, res) => {
  res.render("users/updatePassword.ejs", { error: "" });
});

// ============ API
// POST /api/v1/users/register
userRoutes.post("/register", registerCtrl);

// POST /api/v1/users/login
userRoutes.post("/login", loginCtrl);

// GET /api/v1/users/profile
userRoutes.get("/profile-page", isLogin, profileCtrl);

// PUT /api/v1/users/profile-photo-upload
userRoutes.put(
  "/profile-photo-upload",
  isLogin,
  upload.single("profile_img"),
  uploadProfilePhotoCtrl
);

// PUT /api/v1/users/cover-photo-upload
userRoutes.put(
  "/cover-photo-upload",
  isLogin,
  upload.single("cover_photo"),
  uploadCoverPhotoCtrl
);

// PUT /api/v1/users/update-password
userRoutes.put("/update-password", isLogin, updatePasswordCtrl);

// PUT /api/v1/users/update
userRoutes.put("/update", isLogin, updateUserCtrl);

// GET /api/v1/users/logout
userRoutes.get("/logout", logoutCtrl);

// GET /api/v1/users/:id
userRoutes.get("/:id", userDetailsCtrl);

module.exports = userRoutes;
