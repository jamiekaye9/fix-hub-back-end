const express = require('express');
const verifyToken = require('../middleware/verify-token');
const Ticket = require('../models/ticket');
const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
    try {
        const allTickets = await Ticket.find();
        req.body.number = allTickets.length + 1;
        req.body.openedBy = req.user._id;
        const serviceDeskUsers = await User.find({ role: 'Service Desk' });
        if (serviceDeskUsers.length === 0) {
            return req.body.assignedTo = null;
        }
        let leastBusyUser = serviceDeskUsers[0];
        serviceDeskUsers.forEach(user => {
            if (user.ticketsAssigned < leastBusyUser.ticketsAssigned) {
                leastBusyUser = user;
            }
            
        });
        const ticket = await Ticket.create(req.body);
        ticket._doc.openedBy = req.user;
        res.status(201).json(ticket);
    } catch (e) {
        res.status(500).json({ e: e.message });
    }
})

module.exports = router;

