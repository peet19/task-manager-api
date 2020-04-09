const mongoose = require('mongoose')
const validator  = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const task = require('./task')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw('Email is invalid')
            }
        }
    },
    age:{
        type: Number,
        required: true,
        default: 0,
        validate(value) {
            if(value < 0){
                throw new Error('Age must be a positibe number')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlenght: 6,
        validate(value) {
            if(value.toLowerCase().includes('password')){
                throw new Error("choose other password")
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField: '_id',
    foreignField: 'owner' 
})

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.tokens
    delete userObject.password

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user.id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token

} 

userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({email: email})
    if(!user){
        throw new Error('unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user

}

// Encripta el password si este se actualiza
userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Eliminar las tareas de un usuario eliminado

userSchema.pre('remove', async function(next){
    user = this

    await task.deleteMany({owner: user._id })
    next()
})



    
const User = mongoose.model('User', userSchema)

module.exports = User

/* const me = new User({
    name: 'Pedro',
    email: 'Pedrhito_17@hotmail.com',
    age: 25,
    password: 'password'
}) */

/* me.save().then(() => {
    console.log(me)
}).catch((error) => {
    console.log(error)
}) */