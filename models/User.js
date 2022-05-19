const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const {Schema} = mongoose;

const userSchema = new Schema({
    userName : {
        type: String,
        lowercase: true,
        required: true,
    },
    email : {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        index: {unique: true}
    },
    password : {
        type: String,
        required: true
    },
    tokenConfirm : {
        type: String,
        default: null
    },
    cuentaConfirmada : {
        type: Boolean,
        default: false
    },
    imagen: {
        type: String,
        default: null
    }
});

userSchema.pre('save', async function(next){
    const user = this;
    if(!user.isModified('password')) return next();

    try {
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(user.password, salt);

        user.password = hash;
        next();

    } catch (error) {
        console.log(error);
        throw new Error('Error al codificar la contraseña');
    }
});

userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcryptjs.compare(candidatePassword, this.password);
}

module.exports = mongoose.model('User', userSchema);