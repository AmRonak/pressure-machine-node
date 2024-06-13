require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    const jwtToken = token?.startsWith('Bearer ') && token?.split(" ")[1] ? token?.split(" ")[1] : null

    if (!jwtToken) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(jwtToken, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
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

module.exports = { authenticateJWT, authorizeRole };
