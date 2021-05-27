const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');

const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

//bodyparser가 client에서 오는정보를 server에서 분석해서 가져올 수 있게 해준다
//application/x-www-form-urlencoded 이렇게 된 데이터를 분석해서 가져올 수 있게 해준다
app.use(bodyParser.urlencoded({extended: true}));

//application/json타입으로 된것을 분석해서 가져올 수 있게 해준다
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected....'))
.catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World! 하이?')
})

app.get('/api/hello', (req, res) =>{
  res.send("hi there~")
})

app.post('/api/users/register', (req, res) => {
  //회원가입할때 필요한 정보들은 client에서 가져오면
  //그것들을 db에 넣어준다

    const user = new User(req.body)
    //user : mongodb에서 오는 method (오는 정보들 저장)
    user.save((err, userInfo) => {
      //저장할 때 err발생시 json형식으로 err메시지 전달
      if(err) return res.json({ success: false, err})
      return res.status(200).json({   //status 200 : 접속 성공했을때
        success: true
      })
    })
})

app.post('/api/users/login', (req, res) => {
  //요청된 이메일이 데이터베이스에 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user){
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
  //요청된 이메일이 데이터베이스에 있다면 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch)
      return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})
  
  //비밀번호까지 맞다면 token을 생성하기
      user.generateToken((err, user) => {     //generateToken여기부분 임의로 정해주면된다.
        if(err) return res.status(400).send(err);

        //토큰을 저장한다. 어디에? 쿠키, 로컬스트리지, 세션 등...
        //여기서는 쿠키에 저장할것
        res.cookie("x_auth", user.token)  //x-auth라는 이름으로 token이 쿠키에 저장된다.
        .status(200)
        .json({ loginSuccess: true, userId: user._id})

        
      })

    })
  })

})

app.get('/api/users/auth', auth, (req, res) => {
  //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True라는 말
  res.status(200).json({
    _id: req.user._id,    //이게 가능한 이유는 auth.js에서 req에 user정보를 넣어줬기 때문이다.
    isAdmin: req.user.role === 0 ? false : true,  //여기는 변경가능 (여기선 role이 0이면 일반유저 1이면 어드민)
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => {
  //로그아웃하려는 user를 db에서 찾아서
  User.findOneAndUpdate({_id: req.user._id}, 
    { token: "" } //token을 지워줌 
    , (err, user) => {
      if(err) return res.json({success: false, err});
      return res.status(200).send({
        success: true
      })
    })


})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
