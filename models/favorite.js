const mongoose = require('mongoose');

const Favorite = mongoose.model(
    "Favorite",
    new mongoose.Schema({
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        campsites: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campsite'
        }]
    },
        { timestamps: true }

    )
);
module.exports = Favorite ;