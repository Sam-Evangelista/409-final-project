const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    spotify_id:{
        type: String,
        required: true
    },
    followers: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    following: {
        type: [mongoose.Schema.Types.ObjectId],
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
    bio : {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('User', userSchema);