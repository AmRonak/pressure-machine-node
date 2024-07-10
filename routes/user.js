const express = require('express');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { userValidationRules, loginValidationRules, validate, changePasswordValidationRules } = require('../middleware/validators');
const userController = require('../controllers/userController');

const router = express.Router();

// User registration endpoint (Admin only)
router.post(
    '/register',
    authenticateJWT,
    authorizeRole(['Administrator']),
    userValidationRules(),
    validate,
    userController.registerUser
);

// User login endpoint
router.post('/login', loginValidationRules(), validate, userController.loginUser);

router.get('/profile', authenticateJWT, userController.currentProfile);

// Block/Unblock users (Admin only)
router.post('/block', authenticateJWT, authorizeRole(['Administrator']), userController.blockUser);

// List users (Admin only)
router.get('/', authenticateJWT, authorizeRole(['Administrator']), userController.listUsers);

// List users (Admin only)
router.get('/:id', authenticateJWT, userController.getUserById);

// Update user details (Admin only)
router.put('/:id', authenticateJWT, authorizeRole(['Administrator']), userValidationRules(), validate, userController.updateUser);

router.patch('/changePassword', authenticateJWT, changePasswordValidationRules(), validate, userController.changePassword);


module.exports = router;
