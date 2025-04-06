const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const ticketsSchema = new mongoose.Schema({
    number: {
        type: Number,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
        required: true,
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open',
        required: true,
    },
    application: {
        type: String,
        required: true,
    },
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [commentsSchema],
}, { timestamps: true });

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    tickets: [ticketsSchema],
});

module.exports = mongoose.model("Company", companySchema);