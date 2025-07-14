const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const { default: mongoose } = require("mongoose");

const app = express();

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(bodyparser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime().toString(36) + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  let status = error.statusCode || 500;
  let message = error.message;
  let data = error.data;

  return res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://chanchal:chanchal123456@cluster0.vfl3qua.mongodb.net/feed-deployed?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then((result) => {
    console.log("Connected!");
    const server = app.listen(8080);
  })
  .catch((err) => console.log(err));
