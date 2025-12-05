const mongoose = require('mongoose');

const authTokenSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    access_token: {
        type: String,
        required: true
    },
    refresh_token : {
        type: String,
        required: true
    },
    expires_in: {
        type: Number,
    }
});

module.exports = mongoose.model('AuthToken', authTokenSchema);