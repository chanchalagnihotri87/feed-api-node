const { validationResult } = require("express-validator");
const Post = require("../models/post");
const path = require("path");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  let currentPage = req.query.page || 1;
  let pageSize = 2;
  let totalPosts = await Post.countDocuments();

  let posts = await Post.find()
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize);
  res.status(200).json({
    posts: posts,
    totalItems: totalPosts,
  });
};

exports.createPost = async (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;

    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;

    throw error;
  }

  const imageUrl = req.file.path.replace("\\", "/");

  let post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: {
      name: "Chanchal",
      userId: req.userId, // Assuming userId is set in the request by the authentication middleware
    },
  });

  await post.save();

  let user = await User.findById(req.userId);
  if (!user) {
    let error = new Error("User not found");
    error.statusCode = 404;

    throw error;
  }

  user.posts.push(post);

  await user.save();

  console.log(post);

  res.status(201).json({
    message: "Post created successfully.",
    post: post,
  });
};

exports.getPost = async (req, res, next) => {
  let postId = req.params.postId;

  let post = await Post.findById(postId);

  if (!post) {
    let error = new Error("Post not found");
    error.statusCode = 404;

    throw error;
  }

  res.status(200).json({ message: "Post fetched", post: post });
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;

    throw error;
  }

  let post = await Post.findById(postId);

  if (!post) {
    let error = new Error("Post not found");
    error.statusCode = 404;

    throw error;
  }

  post.title = title;
  post.content = content;

  if (req.file) {
    if (post.imageUrl) {
      clearFile(post.imageUrl);
    }
    post.imageUrl = req.file.path.replace("\\", "/");
  }

  await post.save();

  res.status(200).json({ message: "Post updated", post: post });
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  let post = await Post.findOne({ _id: postId, "creator.userId": req.userId });

  if (!post) {
    let error = new Error("Post not found");
    error.statusCode = 404;

    throw error;
  }

  await Post.deleteOne(post);

  if (post.imageUrl) {
    clearFile(post.imageUrl);
  }

  let user = await User.findById(req.userId);
  if (!user) {
    let error = new Error("User not found");
    error.statusCode = 404;

    throw error;
  }

  user.posts.pull(postId);
  await user.save();

  res.status(200).json({ message: "Post deleted" });
};

const clearFile = (filePath) => {
  const fs = require("fs");

  filePath = path.join(__dirname, "..", filePath);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted successfully:", filePath);
    }
  });
};
