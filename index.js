const express = require('express')
const app = express()
const port = 5000

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://jin:qwe123@boilerplate.s1ylr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))




app.get('/', (req, res) => {
  res.send('Hello World!~ 는 개뿔 어렵구만')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})