const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("colors");
process.env.BUILD_PATH = path.join(__dirname, "..", "frontend", "build");
process.env.PORT = 8000;
process.env.DB_PATH = "mongodb://localhost:27017";
const mongoose = require("mongoose");
const app = express();
const jwt = require("jsonwebtoken");
const password = "platypus6";

app.use(cors({origin: true, optionsSuccessStatus: 200, credentials: true}));
app.use(express.json());
app.use(express.static(process.env.BUILD_PATH));

app.use((req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    req.data = {authorized: false, error: "No Authorization header provided."};
    next();
    return;
  }
  if (!auth.startsWith("Bearer ")) {
    req.data = {authorized: false, error: "Authorization header is not bearer token."};
    next();
    return;
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, password);
    console.log(decoded);
    req.data = {...decoded, authorized: true};
  }
  catch (e) {
    req.data = {authorized: false, error: "Invalid JWT provided."};
    next();
    return;
  }
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Started server on port ${process.env.PORT}`.bold.red);
});

const accountSchema = new mongoose.Schema({
  username: String,
  password: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
}, {collection: "accounts"});

const userSchema = new mongoose.Schema({
  username: String,
  biography: String,
  donalds: [{type: mongoose.Schema.Types.ObjectId, ref: "Donald"}],
  redonalds: [{type: mongoose.Schema.Types.ObjectId, ref: "ReDonald"}],
  ratings: [{type: mongoose.Schema.Types.ObjectId, ref: "Rating"}],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}]
}, {collection: "users"});

const redonaldSchema = new mongoose.Schema({
  donald: {type: mongoose.Schema.Types.ObjectId, ref: "Donald"},
  timestamp: Number,
  author: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
}, {collection: "redonalds"});

const ratingSchema = new mongoose.Schema({
  like: Boolean,
  donald: {type: mongoose.Schema.Types.ObjectId, ref: "Donald"},
  author: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
}, {collection: "ratings"});

const commentSchema = new mongoose.Schema({
  content: String,
  author: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  timestamp: Number,
  donald: {type: mongoose.Schema.Types.ObjectId, ref: "Donald"}
}, {collection: "comments"});

const donaldSchema = new mongoose.Schema({
  content: String,
  author: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  redonalds: [{type: mongoose.Schema.Types.ObjectId, ref: "ReDonald"}],
  timestamp: Number,
  ratings: [{type: mongoose.Schema.Types.ObjectId, ref: "Rating"}],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}]
}, {collection: "donalds"});

(async () => {
  const connection = await mongoose.createConnection(`${process.env.DB_PATH}/trump`, {useNewUrlParser: true, useUnifiedTopology: true});
  const User = connection.model("User", userSchema);
  const ReDonald = connection.model("ReDonald", redonaldSchema);
  const Rating = connection.model("Rating", ratingSchema);
  const Comment = connection.model("Comment", commentSchema);
  const Donald = connection.model("Donald", donaldSchema);
  const Account = connection.model("Account", accountSchema);
  const endpoints = fs.readdirSync("./endpoints");

  const theDonald = {
    User, ReDonald, Rating, Comment, Donald, Account,
    sign: (data, opt) => jwt.sign(data, password, opt)
  };

  for (const ep of endpoints) {
    const endpoint = require(`./endpoints/${ep}`);
    app[endpoint.method](endpoint.path, (req, res) => endpoint.run(req, res, theDonald));
    console.log(`Loaded endpoint ${endpoint.path.cyan}!`);
  }

  app.get("*", (req, res) => {
    res.sendFile(path.join(process.env.BUILD_PATH, "index.html"));
  });
})();