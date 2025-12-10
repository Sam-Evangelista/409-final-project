const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    album: {
        type: String,
        required: true
    },
    album_id : {
        type: String,
        required: true
    },
    album_cover: {
        type: String,
        required: true,
    },
    artist : {
        type: String,
        required: true,
    },
    likes : {
        type: Number,
        default: 0
    },
    liked_by: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comments: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    review: {
        type: String,
        required: true
    },
    tracklist_rating: {
        type: [String],
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    },
    
});

module.exports = mongoose.model('Rating', ratingSchema);