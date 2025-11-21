const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    album: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    artist: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    
});

module.exports = mongoose.model('Rating', ratingSchema);