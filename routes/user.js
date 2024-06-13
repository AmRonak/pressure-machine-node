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

// List users (Admin only)
router.get('/', authenticateJWT, authorizeRole(['Administrator']), userController.listUsers);

// Block/Unblock user (Admin only)
router.patch('/block/:id', authenticateJWT, authorizeRole(['Administrator']), userController.blockUser);

// Forget password endpoint
router.post('/forgetpassword', passwordResetValidationRules(), validate, userController.forgetPassword);

// Update user details (Admin only)
router.put('/update/:id', authenticateJWT, authorizeRole(['Administrator']), userValidationRules(), validate, userController.updateUser);



module.exports = router;
