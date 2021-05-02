const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String    //유효성
    },
    tokenExp: {
        type: Number    //토큰 유효기간
    }
})


const User = mongoose.model('User', userSchema)

module.exports = { User }   //다른곳에서도 사용할 수 있게 export