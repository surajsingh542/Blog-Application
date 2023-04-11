const express = require("express");
const {
  createCommentCtrl,
  commentDetailsCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
} = require("../../controllers/comments/comments");
const isLogin = require("../../middlewares/isLogin");
const commentRoutes = express.Router();

// POST /api/v1/comments/:id
commentRoutes.post("/:id", isLogin, createCommentCtrl);

// GET /api/v1/comments/:id
commentRoutes.get("/:id", commentDetailsCtrl);

// DELETE /api/v1/comments/:id
commentRoutes.delete("/:id", isLogin, deleteCommentCtrl);

// PUT /api/v1/comments/:id
commentRoutes.put("/:id", isLogin, updateCommentCtrl);

module.exports = commentRoutes;
