const express = require("express");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");
const User = require("../models/user");

const { body } = require("express-validator");

const routes = express.Router();

routes.put(
  "/signup",
  [
    body("email")
      .trim()
      .not()
      .isEmpty()
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail()
      .custom(async (value) => {
        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          return Promise.reject("E-Mail address already exists!");
        }
      }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long."),
    body("name").trim().not().isEmpty().withMessage("Name is required."),
  ],
  authController.signup
);

routes.post(
  "/login",
  [
    body("email")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
    body("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Password is required."),
  ],
  authController.login
);
routes.get("/status", isAuth, authController.getUserStatus);

routes.patch(
  "/status",
  isAuth,
  [body("status").trim().not().isEmpty()],
  authController.updateUserStatus
);

module.exports = routes;
