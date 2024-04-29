import express from "express";
import * as blogController from '../controllers/blogController.js';

const router = express.Router();

//get all blogs
router.get('/', blogController.getAllBlogs);

//get blog by ID
router.get('/getUserById/:id', blogController.getBlogByID);

//create new blog post
router.post('/', blogController.createBlogPost);

//like blog post
router.put('/like/:id', blogController.likeBlogPost);

//add comment to post
router.post('/:id/comment', blogController.addBlogComment);

//like a comment
router.put('/:id/comment/like/:commentIndex', blogController.likeBlogComment);

//delete blog post
router.delete('/:id', blogController.deleteBlogPost);

export default router;