const express = require("express");
const Post = require("../models/post.model");
const { getPosts, createPost } = require("../controllers/posts.controller");

const router = express.Router();

router.get("/", getPosts);

router.post("/", createPost);

module.exports = router;
