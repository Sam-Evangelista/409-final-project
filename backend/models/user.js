const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    spotify_id:{
        type: String,
        required: true
    },
    followers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    following: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    username: {
        type: String,
        required: true
    },
    ratings : {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    icon: {
        type: String,
        required: true
    },
    top_albums: {
        type: [String],
        default: []
    },
    most_listened_albums: {
        type: [String],
        default: []
    },
    top_artists: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },
    top_songs: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },
    bio : {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('User', userSchema);