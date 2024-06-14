const express = require('express');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { userValidationRules, loginValidationRules, passwordResetValidationRules, validate } = require('../middleware/validators');
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

// Block/Unblock user (Admin only)
router.patch('/block/:id', authenticateJWT, authorizeRole(['Administrator']), userController.blockUser);

// Forget password endpoint
router.post('/forgetpassword', passwordResetValidationRules(), validate, userController.forgetPassword);

// List users (Admin only)
router.get('/', authenticateJWT, authorizeRole(['Administrator']), userController.listUsers);

// Update user details (Admin only)
router.put('/:id', authenticateJWT, authorizeRole(['Administrator']), userValidationRules(), validate, userController.updateUser);



module.exports = router;
