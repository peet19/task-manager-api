const express = require('express')
require('./db/mongoose')

const userRouter = require('./routes/user')
const taskRouter = require('./routes/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

const multer = require('multer')
const upload = multer({
    dest:'images'
})

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
})

app.listen(port, () => {
    console.log("server is up on port " + port);
})