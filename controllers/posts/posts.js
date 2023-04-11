const Post = require("../../models/post/post");
const User = require("../../models/user/user");
const appErr = require("../../utils/appErr");

// create
const createPostCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    if (!title || !description || !category || !req.file) {
      // return next(appErr("All fields are required."));
      return res.render("posts/addPost.ejs", {
        error: "All fields are required",
      });
    }
    // find the user
    const userID = req.session.userAuth;
    const userFound = await User.findById(userID);
    // create the post
    const postCreated = await Post.create({
      title,
      description,
      category,
      user: req.session.userAuth,
      image: req.file.path,
    });
    // push the post created into the array of user's post
    userFound.posts.push(postCreated._id);
    // resave
    await userFound.save();
    // res.json({
    //   status: "success",
    //   data: postCreated,
    // });
    // redirect
    res.redirect("/");
  } catch (error) {
    // next(appErr(error.message));
    return res.render("posts/addPost.ejs", {
      error: error.message,
    });
  }
};

// all
const fetchPostsCtrl = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("comments").populate("user");
    res.render("index.ejs", { posts });
  } catch (error) {
    // next(appErr(error.message));
    res.render("index.ejs", { error: error.message });
  }
};

// details
const fetchPostCtrl = async (req, res, next) => {
  try {
    // get the id from params
    const id = req.params.id;
    // find the post
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
      })
      .populate("user");
    // res.json({
    //   status: "success",
    //   data: post,
    // });
    res.render("posts/postDetails.ejs", {
      post,
      error: "",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// delete
const deletePostCtrl = async (req, res, next) => {
  try {
    // find the post
    const post = await Post.findById(req.params.id);
    // check if the post belongs to the user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      // return next(appErr("You are not allowed to delete this post", 403));
      return res.render("posts/postDetails.ejs", {
        post,
        error: "You are not authorized to delete this post",
      });
    }
    // delete post
    await Post.findByIdAndDelete(req.params.id);
    // delete post from user model also
    await User.findByIdAndUpdate(req.session.userAuth, {
      $pull: { posts: { $eq: req.params.id } },
    });
    // res.json({
    //   status: "success",
    //   data: "Post has been deleted successfully",
    // });

    // redirect
    res.redirect("/");
  } catch (error) {
    // next(appErr(error.message));
    return res.render("posts/postDetails.ejs", {
      post: "",
      error: error.message,
    });
  }
};

// update
const updatePostCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;

  try {
    // find the post
    const post = await Post.findById(req.params.id);
    // check if the post belongs to the user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return res.render("posts/updatePost.ejs", {
        post: "",
        error: "You are not authorized to update this post",
      });
      // return next(appErr("You are not allowed to update this post", 403));
    }
    // check if user is updating image
    if (req.file) {
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          category,
          image: req.file.path,
        },
        {
          new: true,
        }
      );
    } else {
      // update
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          category,
        },
        {
          new: true,
        }
      );
    }

    // res.json({
    //   status: "success",
    //   data: postUpdated,
    // });

    // redirect
    res.redirect("/");
  } catch (error) {
    return res.render("posts/updatePost.ejs", {
      post: "",
      error: error.message,
    });
    // next(appErr(error.message));
  }
};

module.exports = {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  deletePostCtrl,
  updatePostCtrl,
};
