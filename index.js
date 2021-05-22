const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const {user, User} = require("./models/User");

const config = require('./config/key');

//application/x-www-form-urlencoded : 이렇게 된 데이터를 분석해서 가져올 수 있게
app.use(bodyParser.urlencoded({extended: true}));
//application/json : json으로 된 데이터를 분석해서 가져올 수 있게
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))




app.get('/', (req, res) => {
  res.send('Hello World!~')
})

//회원가입
app.post('/register', (req, res) => {

  //회원 가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다

  //들어간 정보들을 request에 넣기 위함 - bodyparser가 있어서 가능한 것
  const user = new User(req.body)

  //정보 저장
  user.save((err, userInfo) => {
    if(err) return res.json({ success: false, err})
    return res.status(200).json({
      success: true
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})