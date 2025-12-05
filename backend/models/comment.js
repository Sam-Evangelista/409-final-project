const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating',
        required: true
    },
    likes : {
        type: Number,
        default: 0
    },
    comment_body: {
        type: String,
        required: true
    },
    child_comments: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);