const express = require('express');
const userRoutes = require('./user');
const recipeSetting = require('./recipeSetting');
const parameterSetting = require('./parameterSetting');
const masterParameter = require('./masterParameter');
const auditLog = require('./auditLog');
const testResult = require('./testResult');
const permissions = require('./permissions');
const device = require('./device');
const logging = require('./logging');
const { checkTokenExpiration } = require('../middleware/auth');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/recipeSetting', recipeSetting);
router.use('/parameterSetting', parameterSetting);
router.use('/masterParameter', masterParameter);
router.use('/auditLog', auditLog);
router.use('/testResult', testResult);
router.use('/permissions', permissions);
router.use('/devices', device);
router.use('/logs', logging);

router.post('/refresh-token', checkTokenExpiration, (req, res, next) => {
  if (req.isTokenExpiring) {
    const user = req.user;
    const newToken = jwt.sign({ id: user.id, userLevel: user.userLevel, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30m' });

    return res.status(200).json({
      status: 'success',
      token: newToken,
    });
  } else {
    return res.status(200).json({
      status: 'success',
      message: "Token will not expire in next 15 minutes"
    });
  }
});

module.exports = router;
