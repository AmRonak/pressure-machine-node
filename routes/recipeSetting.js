const express = require('express');
const router = express.Router();
const { authenticateJWT, checkPermission } = require('../middleware/auth');
const recipeSettingController = require('../controllers/recipeSettingController');
const { recipeSettingValidationRules, validate } = require('../middleware/validators');

router.put('/', authenticateJWT, checkPermission('Recipe Settings'), recipeSettingValidationRules(), validate, recipeSettingController.updateRecipeSetting);
router.get('/', authenticateJWT, recipeSettingController.getRecipeSetting);

module.exports = router;
