const Comment = require("../../models/comment/comment");
const Post = require("../../models/post/post");
const User = require("../../models/user/user");
const appErr = require("../../utils/appErr");

// create
const createCommentCtrl = async (req, res) => {
  const { message } = req.body;
  try {
    // find the post
    const post = await Post.findById(req.params.id);
    // create comment
    const comment = await Comment.create({
      user: req.session.userAuth,
      post: req.params.id,
      message,
    });
    // push the comment to post
    post.comments.push(comment._id);
    // find the user
    const user = await User.findById(req.session.userAuth);
    // push the comment into user
    user.comments.push(comment._id);
    // save
    await post.save();
    await user.save();
    // res.json({
    //   status: "success",
    //   data: comment,
    // });

    // redirect
    res.redirect(`/api/v1/posts/${post?._id}`);
  } catch (error) {
    res.json(error);
  }
};

// single
const commentDetailsCtrl = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    // res.json({
    //   status: "success",
    //   user: "Comment details",
    // });
    res.render("comments/updateComment.ejs", {
      comment,
      error: "",
    });
  } catch (error) {
    // res.json(error);
    res.render("comments/updateComment.ejs", {
      comment: "",
      error: error.message,
    });
  }
};

// delete
const deleteCommentCtrl = async (req, res, next) => {
  // console.log(req.query);
  try {
    // find the comment
    const comment = await Comment.findById(req.params.id);
    // check if the comment belongs to the user
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to delete this comment", 403));
    }
    // delete comment
    await Comment.findByIdAndDelete(req.params.id);
    // delete comment from user model also
    await User.findByIdAndUpdate(req.session.userAuth, {
      $pull: { comments: { $eq: req.params.id } },
    });
    // delete comment from post model also
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: { $eq: req.params.id } },
    });
    // res.json({
    //   status: "success",
    //   data: "Comment has been deleted successfully",
    // });

    // redirect
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    res.json(error);
  }
};

// update
const updateCommentCtrl = async (req, res, next) => {
  try {
    const { message } = req.body;
    // find the comment
    const comment = await Comment.findById(req.params.id);
    // check if comment exists
    if (!comment) {
      return next(appErr("Comment not found."));
    }
    // check if the comment belongs to the user
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to update this comment", 403));
    }
    // check if comment is empty
    if (!message || !message.trim()) {
      return next(appErr("Comment can not be empty."));
    }
    // update
    const commentUpdated = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        message,
      },
      {
        new: true,
      }
    );
    // res.json({
    //   status: "success",
    //   data: commentUpdated,
    // });

    //redirect
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    next(appErr(error.message));
  }
};

module.exports = {
  createCommentCtrl,
  commentDetailsCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
};
