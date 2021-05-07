const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Task = require('./Task.model');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age:{
        type: Number,
        validate(value) {
            if(value < 10) {
                throw new Error('Age must be greater than 10 years')
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(email) {
            if(!validator.isEmail(email)) {
                throw new Error('Email must be a valid email');
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        // validate(password) {
        //     if(!validator.isStrongPassword(password)) {
        //         throw new Error('Password must be Strong')
        //     }
        // }
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function () {
    const user = this;

    const token = jwt.sign({_id: user._id.toString()}, 'thisismynewcourse');
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password
    delete userObject.tokens

    return userObject;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if(!user) {
        throw new Error('Email or password not matched');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        throw new Error('Email or password not matched');
    }

    return user;
}

// Hash the plain password before save
userSchema.pre('save', async function (next) {
    const user = this;

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

// Delete user Tasks before remove user
userSchema.pre('remove', async function (next) {
    const user = this;

    await Task.deleteMany({owner: user._id});

    next();
})

const User = mongoose.model('User',userSchema);

module.exports = User;