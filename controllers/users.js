const express = require('express');
const router = express.Router();

const User = require('../models/user');
const verifyToken = require('../middleware/verify-token');

router.get('/', verifyToken, async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        if (!users) {
            return res.status(404).json({ e: 'User not found.' });
        }
        res.json(users);
    } catch (e) {
        res.status(500).json({ e: e.message });
    }
});

router.get('/:userId', verifyToken, async (req, res) => {
    try {
        if (!req.params.userId) {
            return res.status(403).json({ e: 'Unauthorised' })
        }
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ e: 'User not found.' });
        }
        res.json(user);
    } catch (e) {
        res.status(500).json({ e: e.message });
    }
}
);

module.exports = router;

