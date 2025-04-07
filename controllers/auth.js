const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const saltRounds = 12;

router.post('/sign-up', async (req, res) => {
    try {
        const userInDatabase = await User.findOne({ username: req.body.username });
        if (userInDatabase) {
            return res.status(409).json({e: 'Username already taken.'});
        }
        const user = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            role: req.body.role,
            username: req.body.username,
            hashedPassword: bcrypt.hashSync(req.body.password, saltRounds)
        });
        const payload = { username: user.username, _id: user._id };
        const token = jwt.sign({ payload }, process.env.JWT_SECRET);
        res.status(201).json({ token });
    } catch (e) {
        res.status(500).json({ e: e.message });
    }
});

router.post('/sign-in', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(401).json({ e: 'Invalid credentials' });
        };
        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password, user.hashedPassword
        )
        if (!isPasswordCorrect) {
            return res.status(401).json({ e: 'Invalid credentials' });
        }
        const payload = { username: user.username, _id: user._id };
        const token = jwt.sign({ payload }, process.env.JWT_SECRET);
        res.status(200).json({ token });
    } catch (e) {
        res.status(500).json({ e: e.message });
    }
});

module.exports = router;