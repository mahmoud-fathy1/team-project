const Post = require("../models/post.model");
const capitalizeWords = require("../utils/capitalizeWords");

async function getPosts(req, res) {
    const posts = await Post.find();
    res.json(posts);
}

async function createPost(req, res) {
    const newTitle = capitalizeWords(req.body.title);

    let newPost = await Post.create({
        title: newTitle,
        content: req.body.content,
    });
    res.json(newPost);
}

module.exports = { getPosts, createPost };
