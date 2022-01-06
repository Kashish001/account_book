const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sonOff: {
        type: String,
    },
    address: {
        type: String,
    },
    careOff: {
        type: String, 
    },
    contact: {
        type: Number,
        required: true
    },
    transactions: {
        type: Array,
        default: []
    },
    bill: {
        type: Array,
        default: []
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Customer', CustomerSchema)