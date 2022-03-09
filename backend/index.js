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
const token = jwt.sign({"david":"cool"}, "password123");
console.log(token);
const decoded = jwt.verify(token, "password123");
console.log(decoded);
const password = "platypus6";

app.use(cors({origin: true, optionsSuccessStatus: 200, credentials: true}));
app.use(express.json());
app.use(express.static(process.env.BUILD_PATH));

app.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})

app.listen(process.env.PORT, () => {
  console.log(`Started server on port ${process.env.PORT}`.bold.red);
});

const userSchema = new mongoose.Schema({
  username: String,
  biography: String,
  donalds: [{type: mongoose.Schema.Types.ObjectId, ref: "users"}],
  redonalds: [{type: mongoose.Schema.Types.ObjectId, ref: "redonalds"}],
  ratings: [{type: mongoose.Schema.Types.ObjectId, ref: "ratings"}],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: "comments"}]
}, {collection: "users"});

const redonaldSchema = new mongoose.Schema({
  donald: {type: mongoose.Schema.Types.ObjectId, ref: "donalds"},
  timestamp: Number,
  author: {type: mongoose.Schema.Types.ObjectId, ref: "users"}
}, {collection: "redonalds"});

const ratingSchema = new mongoose.Schema({
  like: Boolean,
  donald: {type: mongoose.Schema.Types.ObjectId, ref: "donalds"},
  author: {type: mongoose.Schema.Types.ObjectId, ref: "users"}
}, {collection: "ratings"});

const commentSchema = new mongoose.Schema({
  content: String,
  author: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
  timestamp: Number,
  donald: {type: mongoose.Schema.Types.ObjectId, ref: "donalds"}
}, {collection: "comments"});

const donaldSchema = new mongoose.Schema({
  content: String,
  author: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
  redonalds: [{type: mongoose.Schema.Types.ObjectId, ref: "redonalds"}],
  timestamp: Number,
  ratings: [{type: mongoose.Schema.Types.ObjectId, ref: "ratings"}],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: "comments"}]
}, {collection: "donalds"});

(async () => {
  const connection = await mongoose.createConnection(`${process.env.DB_PATH}/trump`, {useNewUrlParser: true, useUnifiedTopology: true});
  const User = connection.model("User", userSchema);
  const ReDonald = connection.model("ReDonald", redonaldSchema);
  const Rating = connection.model("Rating", ratingSchema);
  const Comment = connection.model("Comment", commentSchema);
  const Donald = connection.model("Donald", donaldSchema);
  const endpoints = fs.readdirSync("./endpoints");

  const theDonald = {
    User, ReDonald, Rating, Comment, Donald,
    user: {username: "realDonaldTrump", _id: "6222c6039d92085c8a5439ae"}
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