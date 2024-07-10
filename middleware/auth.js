require('dotenv').config();
const jwt = require('jsonwebtoken');
const getmac = require('getmac')

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    const jwtToken = token?.startsWith('Bearer ') && token?.split(" ")[1] ? token?.split(" ")[1] : null

    if (!jwtToken) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const macAddress = getmac.default();
        // console.log("macAddress ", macAddress);
        req.user = verified;
        req.macAddress = macAddress
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
