const mongoose = require('mongoose');

const { Schema } = mongoose;

// DEFINIMOS UN ESQUEMA
const urlSchema = new Schema({
    origin: {
        type: String,
        unique: true,
        required: true
    },
    shortURL: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});
// PASAMOS EL ESQUEMA A UN MODELO, PARA USARLO CADA VEZ
const Url = mongoose.model('Url', urlSchema);

module.exports = Url;