const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.payload;
        next();
    } catch (e) {
        res.status(401).json({ e: 'Invalid token.' })
    }
};

module.exports = verifyToken;