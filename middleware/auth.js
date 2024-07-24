require('dotenv').config();
const jwt = require('jsonwebtoken');
const getmac = require('getmac');
const Permission = require('../models/permission');
const User = require('../models/user');

const authenticateJWT = async (req, res, next) => {
    const token = req.header('Authorization');
    const jwtToken = token?.startsWith('Bearer ') && token?.split(" ")[1] ? token?.split(" ")[1] : null

    if (!jwtToken) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const macAddress = getmac.default();
        const user = await User.findByPk(verified.id);
        if (!user.active) {
            return res.status(403).json({ message: `Account is blocked.` });
        }

        req.user = verified;
        req.macAddress = macAddress
        next();
    } catch (err) {
        res.status(400).send(err ? err : 'Invalid Token');
    }
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.userLevel)) {
            return res.status(403).send('Access Denied');
        }
        next();
    };
};

const checkPermission = (module) => {
    return async (req, res, next) => {
      const userRole = req.user.userLevel;
      const permission = await Permission.findOne({ where: { module } });
  
      if (!permission || !permission[userRole.toLowerCase()]) {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      next();
    };
  };

module.exports = { authenticateJWT, authorizeRole, checkPermission };
