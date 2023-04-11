const bcrypt = require("bcryptjs");
const User = require("../../models/user/user");
const appErr = require("../../utils/appErr");
const castErr = require("../../utils/castErr");

// register
const registerCtrl = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  // check if field is empty
  if (!fullname || !email || !password) {
    // return next(appErr("All Fields are required"));
    return res.render("users/register", {
      error: "All fields are required",
    });
  }
  try {
    // 1. check if user exist (email)
    const userFound = await User.findOne({ email });
    // throw an error
    if (userFound) {
      // return next(appErr("User already exist"));
      return res.render("users/register", {
        error: "User already exists.",
      });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // register user
    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
    });
    // res.json({
    //   status: "success",
    //   data: user,
    // });

    // redirect
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    next(appErr(error.message));
  }
};

// login
const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    // return next(appErr("Email and password fields are required"));
    return res.render("users/login", {
      error: "Email and password fields are required",
    });
  }
  try {
    // check if email exist
    const userFound = await User.findOne({ email });
    if (!userFound) {
      // throw an error
      // return next(appErr("Invalid login credentials"));
      return res.render("users/login", {
        error: "Invalid login credentials",
      });
    }
    // verify password
    const isPasswordValid = await bcrypt.compare(password, userFound.password);
    if (!isPasswordValid) {
      // return next(appErr("Invalid login credentials"));
      return res.render("users/login", {
        error: "Invalid login credentials",
      });
    }
    // save the user into session
    req.session.userAuth = userFound._id;
    // res.json({
    //   status: "success",
    //   data: userFound,
    // });

    // redirect
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    res.json(error);
  }
};

// details
const userDetailsCtrl = async (req, res, next) => {
  try {
    // get userID from params
    const userID = req.params.id;
    // find the user
    const user = await User.findById(userID);
    // res.json({
    //   status: "success",
    //   data: user,
    // });
    res.render("users/updateUser.ejs", {
      user,
      error: "",
    });
  } catch (error) {
    // next(castErr(error));
    res.render("users/updateUser.ejs", {
      user: "",
      error: error.message,
    });
  }
};

// profile
const profileCtrl = async (req, res) => {
  try {
    // get the login user
    const userID = req.session.userAuth;
    // find the user
    const user = await User.findById(userID)
      .populate("posts")
      .populate("comments");
    res.render("users/profile", { user });
    // res.json({
    //   status: "success",
    //   user: user,
    // });
  } catch (error) {
    res.json(error);
  }
};

// upload profile photo
const uploadProfilePhotoCtrl = async (req, res, next) => {
  try {
    // check if file exists
    if (!req.file) {
      return res.render("users/uploadProfilePhoto.ejs", {
        error: "Please upload image",
      });
    }
    // 1. find the user to be updated
    const userID = req.session.userAuth;
    const userFound = await User.findById(userID);
    // 2. check if user is found
    if (!userFound) {
      // return next(appErr("User not found", 403));
      return res.render("users/uploadProfilePhoto.ejs", {
        error: "User not found",
      });
    }
    // 3. Update profile photo
    await User.findByIdAndUpdate(
      userID,
      {
        profileImage: req.file.path,
      },
      {
        new: true,
      }
    );
    // redirect
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/uploadProfilePhoto.ejs", {
      error: error.message,
    });
  }
};

// upload cover photo
const uploadCoverPhotoCtrl = async (req, res, next) => {
  try {
    // check if file exists
    if (!req.file) {
      return res.render("users/uploadCoverPhoto.ejs", {
        error: "Please upload image",
      });
    }
    // Find the user to be updated
    const userID = req.session.userAuth;
    const userFound = await User.findById(userID);
    // check if user is found
    if (!userFound) {
      return res.render("users/uploadCoverPhoto.ejs", {
        error: "User not found",
      });
      // return next(appErr("User not found", 403));
    }
    // update cover photo of user
    await User.findByIdAndUpdate(
      userID,
      {
        coverImage: req.file.path,
      },
      {
        new: true,
      }
    );
    res.redirect("/api/v1/users/profile-page");
    // res.json({
    //   status: "success",
    //   data: updatedUser,
    // });
  } catch (error) {
    // next(appErr(error.message));
    return res.render("users/uploadCoverPhoto.ejs", {
      error: error.message,
    });
  }
};

// update password
const updatePasswordCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    // Check if user is updating the password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // update user
      await User.findByIdAndUpdate(
        req.session.userAuth,
        {
          password: hashedPassword,
        },
        {
          new: true,
        }
      );
      // res.json({
      //   status: "success",
      //   user: "Password has been changed successfully",
      // });

      // redirect
      res.redirect("/api/v1/users/profile-page");
    } else {
      return res.render("users/updatePassword.ejs", {
        error: "Please provide password.",
      });
    }
  } catch (error) {
    // return next(appErr("Please provide password field"));
    return res.render("users/updatePassword.ejs", {
      error: error.message,
    });
  }
};

// update user
const updateUserCtrl = async (req, res, next) => {
  const { fullname, email } = req.body;
  try {
    if (!fullname || !email) {
      return res.render("users/updateUser.ejs", {
        user: "",
        error: "Please provide details",
      });
    }
    // check if email is not taken
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken._id.toString() !== req.session.userAuth) {
        // return next(appErr("Email is taken", 400));
        return res.render("users/updateUser.ejs", {
          user: "",
          error: "Email is already in use.",
        });
      }
    }
    // Update the user
    await User.findByIdAndUpdate(
      req.session.userAuth,
      {
        fullname,
        email,
      },
      {
        new: true,
      }
    );

    // res.json({
    //   status: "success",
    //   data: user,
    // });

    // redirect
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    // return next(appErr(error.message));
    return res.render("/users/updateUser.ejs", {
      error: error.message,
      user: "",
    });
  }
};

// logout
const logoutCtrl = async (req, res) => {
  // destroy session
  req.session.destroy(() => {
    res.redirect("/api/v1/users/login");
  });
};

module.exports = {
  registerCtrl,
  loginCtrl,
  userDetailsCtrl,
  profileCtrl,
  uploadProfilePhotoCtrl,
  uploadCoverPhotoCtrl,
  updatePasswordCtrl,
  updateUserCtrl,
  logoutCtrl,
};
