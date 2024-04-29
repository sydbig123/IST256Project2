import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

//get all users
router.get('/', userController.getAllUsers);

//get user by id
router.get('/getUserById/:id', userController.getUserByID);

//creating a new user
router.post('/', userController.createUser);

//login
router.post('/login', userController.login);

export default router;