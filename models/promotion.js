const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;
const Promotion = new mongoose.model(
    "PromotionSchema", new mongoose.Schema({
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
        cost: {
            type: Currency
        },
        description: {
            type: String,
            required: true
        },

    })
)
module.exports = Promotion ;