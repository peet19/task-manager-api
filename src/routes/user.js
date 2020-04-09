const express = require('express')
const multer = require('multer')
const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendEmail, emailDeleteAccount} = require('../emails/account')
const router = new express.Router()




router.post('/users', async (req, res) => {
    
    const user = new User(req.body)

    sendEmail(user.email, user.name)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e) {
        res.status(400).send(e)
    }

})

router.post('/users/login', async(req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token ==! req.token
        })

        await req.user.save()
        res.status(200).send()

    }catch(e){
        res.status(501).send(e)
    }
})

router.post('/users/logout-all', auth, async(req, res) =>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()

    }catch(e){
        res.status(501).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error('please upload a image'))
        }

        return cb(undefined, true)
    }
})

router.post('/users/me/avatar',auth,  upload.single('avatar'),  async (req,res) => {
    
        req.user.avatar = req.file.buffer

        await req.user.save()

        res.send()
    
    
}, (error, req, res, next) =>  {
    res.status(400).send({error: error.message})
})


router.get('/users/me', auth , async (req, res) =>{
    
    res.send(req.user)
    
})

router.get('/users/:id/avatar', async (req, res) =>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            return new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)

    }catch(e){
        res.status(404).send()
    }
})



router.patch('/users/me',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if( !isValidOperation){
        return res.status(400).send({error: 'Invalid update'})
    }

    try{
        //const user = await User.findById(req.user._id)
        updates.forEach((update) => req.user[update] = req.body[update])
        console.log(req.body)
        await req.user.save()

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators: true})

        
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth,  async (req, res) => {
    try{
        await req.user.remove()
        emailDeleteAccount(req.user.email, req.user.name)
        res.status(200).send(req.user)
    }catch( e ){
         res.status(500).send()
    }
})

router.delete('/users/me/avatar',auth, async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

module.exports = router