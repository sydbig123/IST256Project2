import BlogModel from "../models/blogModel.js";
import UserModel from "../models/userModel.js";

//get all blogs
export async function getAllBlogs(req, res){
    try {
        const blogs = await BlogModel.find();
        res.json(blogs);
    } catch(error) {
        res.status(500).json({error: error.message});
    }
}

//get blog by id
export async function getBlogByID(req, res){
    try {
        const blog = await BlogModel.findById(req.params.id);
        if(!blog) {
            return res.status(404).json({message: 'Blog not found'});
        } else {
            res.json(blog);
        }
        res.json(blog);
    } catch(error) {
        res.status(500).json({error: error.message});
    }
}

//create new blog post
export async function createBlogPost(req, res){
    try {
        const { title, content, author} = req.body;
        const newBlog = new BlogModel({
            title,
            content,
            author,
            createdAt: new Date(),
            comments: [],
            likes: 0
        });
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch(error) {
        res.status(400).json({ error: error.message });
    }
}

//like a blog post
export async function likeBlogPost(req, res){
    try {
        const blog = await BlogModel.findById(req.params.id);
        if(!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        blog.likes++;
        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } catch(error) {
        res.status(500).json({error: error.message});
    }
}

//create a blog comment
export async function addBlogComment(req, res) {
    try {
        const { userID, content } = req.body;
        const blog = await BlogModel.findById(req.params.id);
        if(!blog) {
            return res.status(404).json({message: 'Blog not found'});
        }
        const newComment = {
            user: userID,
            content,
            likes: 0
        };
        blog.comments.push(newComment);
        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

//like blog comment
export async function likeBlogComment(req, res) {
    try {
        const blog = await BlogModel.findById(req.params.id);
        if(!blog) {
            return res.status(404).json({message: 'Blog not found'});
        }
        const commentIndex =  parseInt(req.params.commentIndex);
        if (isNaN(commentIndex) || commentIndex < 0 || commentIndex >= blog.comments.length) {
            return res.status(404).json({message: 'Index comment invalid'});
        }
        const comment = blog.comments[commentIndex];
        comment.likes++;
        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } catch(error) {
        res.status(500).json({error: error.message});
    }
}

//delete a blog post
export async function deleteBlogPost(req, res) {
    try {
        const blog = await BlogModel.findByIdAndDelete(req.params.id);
        if(!blog) {
            return res.status(404).json({message: 'Blog not found'});
        }
        res.json(blog);
    } catch(error) {
        res.status(500).json({error: error.message});
    }
}