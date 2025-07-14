const express = require("express");

const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const feedController = require("../controllers/feed");

const router = express.Router();

router.get("/posts", isAuth, feedController.getPosts);
router.post(
  "/posts",
  isAuth,
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required.")
      .isLength({ min: 5 })
      .withMessage("Title should be atleast 5 characters long."),
    body("content")
      .notEmpty()
      .withMessage("Content is required.")
      .isLength({ min: 5 })
      .withMessage("Content should be atleast 5 characters long."),
  ],
  feedController.createPost
);

router.get("/post/:postId", isAuth, feedController.getPost);

router.put(
  "/post/:postId",
  isAuth,
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required.")
      .isLength({ min: 5 })
      .withMessage("Title should be atleast 5 characters long."),
    body("content")
      .notEmpty()
      .withMessage("Content is required.")
      .isLength({ min: 5 })
      .withMessage("Content should be atleast 5 characters long."),
  ],
  feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
