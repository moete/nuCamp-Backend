const mongoose = require('mongoose');

const Partner = mongoose.model(
    "Partner",
    new mongoose.Schema({
        name: {
            type: String,
            unique: true,
            required: true
        },
        image: {
            data: Buffer,
            contentType: String
        },
        featured: {
            type: Boolean,

        },
        description: {
            type: String,
            required: true
        },
    },
        { timestamps: true }

    )
);
module.exports = Partner ;

