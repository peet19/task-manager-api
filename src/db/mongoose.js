const mongoose = require('mongoose')


mongoose.connect(process.env.URL_MONGODB,{
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology: true,
    useFindAndModify: false
})



/* const homeWork = new Task({
    description: 'This is a homework',
    completed: true
})

homeWork.save().then(() => {
    console.log(homeWork)
}).catch((error) => {
    console.log(error)
}) */

