const express = require('express');
const { authenticateJWT } = require('../middleware/auth');
const { userValidationRules, loginValidationRules, validate, changePasswordValidationRules } = require('../middleware/validators');
const userController = require('../controllers/userController');

const router = express.Router();

// User registration endpoint
router.post(
    '/register',
    authenticateJWT,
    userValidationRules(),
    validate,
    userController.registerUser
);

// User login endpoint
router.post('/login', loginValidationRules(), validate, userController.loginUser);

router.get('/profile', authenticateJWT, userController.currentProfile);

// Block/Unblock users
router.post('/block', authenticateJWT, userController.blockUser);

// List users
router.get('/', authenticateJWT, userController.listUsers);

// List of usernames
router.get('/usernames', authenticateJWT, userController.getAllUsernames);

// List users
router.get('/:id', authenticateJWT, userController.getUserById);

// Update user details
router.put('/:id', authenticateJWT,  userValidationRules(), validate, userController.updateUser);

router.patch('/changePassword', authenticateJWT, changePasswordValidationRules(), validate, userController.changePassword);

module.exports = router;
