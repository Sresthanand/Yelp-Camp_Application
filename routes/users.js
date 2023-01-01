const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");

router
  .route("/register") //path is defined and we chained the further routes with this path
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router
  .route("/login") //path is defined and we chained the further routes with this path
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
