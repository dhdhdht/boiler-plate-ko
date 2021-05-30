const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const saltRounds = 10   //비밀번호가 몇줄 
const jwt = require('jsonwebtoken');


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
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {    //유효성
        type: String
    },
    tokenExp: {
        type: Number
    }
})

//user모델에 저장하기전에 function을 한다
userSchema.pre('save', function( next ){
    var user = this;

    //비밀번호가 바뀔때만 비밀번호 암호화 진행
    if(user.isModified('password')){
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds,function(err, salt){
            if(err) return next(err)

            //hash될 password는 사용자가 입력하는(암호화되어있지 않은) 값이 들어가야하므로
            //mongoose.Schema의 password부분이 들어가야함 그래서 위에 var로 변수 생성
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err)   //실패시 err로 이동
                user.password = hash        //성공시 hash된 비밀번호로 변경
                next()                      //할거를 다 한다음에 next()으로 user.save로 보낸다
            })
        })
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){   //여기서 cb는 callback의 약자

    //plainPassword와 암호화된 비밀번호가 같은지 비교해야함
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err),
            cb(null, isMatch)   //맞다면 여기부분에서 index.js로 보내줌
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;

    //jsonwebtoken을 이용해서 token생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    //user._id + secretToken = token
    //->
    //'secretToken' 을 입력하면 -> user._id

    user.token = token  //userSchema에 token값에 넣어줘야한다.
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;

    //token을 decode한다.   모르는건 jsonwebtoken 웹사이트 참조.
    jwt.verify(token, 'secretToken', function(err, decoded) {
        //유저 아이디를 이용해서 유저를 찾은다음
        //클라이언트에서 가져온 token과 db에서 가져온 token이 일치하는지 확인
        user.findOne({"_id": decoded, "token": token}, function(err, user){

            if(err) return cb(err)
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = {User}
